import { motion } from 'framer-motion';
import { nimetReadings } from '@/data/mockData';
import { Thermometer, CloudLightning, Sun } from 'lucide-react';
import HazardDistributionMap from './HazardDistributionMap';

// Derive heatwave/drought risk distribution from NiMet readings
const nimetStateRisk = nimetReadings.map((r) => {
  const heatScore = Math.max(0, (r.heatIndex - 30) / 20); // 30→0, 50→1
  const droughtScore = Math.max(0, (40 - r.humidity) / 40); // 40%→0, 0%→1
  const score = Math.max(heatScore, droughtScore);
  const probabilityPercent = Math.round(score * 100);
  const riskLevel: 'high' | 'moderate' | 'low' =
    probabilityPercent >= 70 ? 'high' : probabilityPercent >= 45 ? 'moderate' : 'low';
  return {
    state: r.state,
    riskLevel,
    probabilityPercent,
    predictedPeakMonth: 'April',
    riverBasin: `${r.temperature.toFixed(1)}°C · RH ${r.humidity}%`,
    vulnerablePopulation: Math.round(score * 500_000),
  };
});

const NIMETPanel = () => {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="data-grid"
      >
      <div className="flex items-center gap-2 mb-4">
        <Thermometer className="h-4 w-4 text-agency-nimet" />
        <h3 className="font-semibold text-sm text-foreground">NiMet Weather Feed</h3>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground status-pulse">● LIVE</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-muted-foreground font-medium">Station</th>
              <th className="text-left py-2 text-muted-foreground font-medium">State</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Temp °C</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Heat Index</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Flash Rain %</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Humidity %</th>
            </tr>
          </thead>
          <tbody>
            {nimetReadings.map((r) => (
              <tr key={r.station} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                <td className="py-2 font-mono font-medium text-foreground">{r.station}</td>
                <td className="py-2 text-muted-foreground">{r.state}</td>
                <td className="py-2 text-right font-mono">
                  <span className={r.temperature > 40 ? 'text-alert-red' : r.temperature > 35 ? 'text-alert-orange' : 'text-foreground'}>
                    {r.temperature.toFixed(1)}°
                  </span>
                </td>
                <td className="py-2 text-right font-mono">
                  <span className={r.heatIndex > 45 ? 'text-alert-red' : r.heatIndex > 40 ? 'text-alert-orange' : 'text-foreground'}>
                    {r.heatIndex}°
                  </span>
                </td>
                <td className="py-2 text-right font-mono">
                  <div className="flex items-center justify-end gap-1.5">
                    {r.flashRainProb > 50 && <CloudLightning className="h-3 w-3 text-alert-yellow" />}
                    <span className={r.flashRainProb > 60 ? 'text-alert-yellow' : 'text-foreground'}>{r.flashRainProb}%</span>
                  </div>
                </td>
                <td className="py-2 text-right font-mono text-foreground">{r.humidity}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </motion.div>

      <HazardDistributionMap
        title="Heatwave & Drought Risk Distribution"
        subtitle="NiMet Forecast"
        icon={<Sun className="h-4 w-4 text-agency-nimet" />}
        stateData={nimetStateRisk}
        delay={0.35}
      />
    </div>
  );
};

export default NIMETPanel;
