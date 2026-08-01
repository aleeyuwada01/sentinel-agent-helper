import { motion } from 'framer-motion';
import { nihsaReadings } from '@/data/mockData';
import { ArrowUp, ArrowDown, Minus, Waves, Droplets } from 'lucide-react';
import HazardDistributionMap from './HazardDistributionMap';

const trendIcons = {
  rising: <ArrowUp className="h-3 w-3 text-alert-red" />,
  falling: <ArrowDown className="h-3 w-3 text-alert-green" />,
  stable: <Minus className="h-3 w-3 text-alert-yellow" />,
};

// Derive flood risk + vulnerability per state from river-level saturation & trend
const nihsaStateRisk = nihsaReadings.map((r) => {
  const saturation = Math.min(1, r.riverLevel / r.maxLevel);
  const trendBoost = r.trend === 'rising' ? 0.1 : r.trend === 'falling' ? -0.1 : 0;
  const score = Math.max(0, Math.min(1, saturation + trendBoost));
  const probabilityPercent = Math.round(score * 100);
  const riskLevel: 'high' | 'moderate' | 'low' =
    probabilityPercent >= 80 ? 'high' : probabilityPercent >= 60 ? 'moderate' : 'low';
  return {
    state: r.state,
    riskLevel,
    probabilityPercent,
    predictedPeakMonth: 'Aug–Oct',
    riverBasin: `${r.station} · ${r.riverLevel.toFixed(1)}m / ${r.maxLevel.toFixed(1)}m`,
    vulnerablePopulation: Math.round(score * 750_000),
  };
});

const NIHSAPanel = () => {
  return (
    <div className="space-y-4">
      
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="data-grid"
    >
      <div className="flex items-center gap-2 mb-4">
        <Waves className="h-4 w-4 text-agency-nihsa" />
        <h3 className="font-semibold text-sm text-foreground">NIHSA Hydrological Feed</h3>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground status-pulse">● LIVE</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-muted-foreground font-medium">Station</th>
              <th className="text-left py-2 text-muted-foreground font-medium">State</th>
              <th className="text-right py-2 text-muted-foreground font-medium">River Lvl (m)</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Max (m)</th>
              <th className="text-right py-2 text-muted-foreground font-medium">GW (m)</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Quality</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Turbidity</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {nihsaReadings.map((r) => {
              const pct = (r.riverLevel / r.maxLevel) * 100;
              return (
                <tr key={r.station} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="py-2 font-mono font-medium text-foreground">{r.station}</td>
                  <td className="py-2 text-muted-foreground">{r.state}</td>
                  <td className="py-2 text-right font-mono">
                    <span className={pct > 85 ? 'text-alert-red' : pct > 70 ? 'text-alert-orange' : 'text-foreground'}>
                      {r.riverLevel.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono text-muted-foreground">{r.maxLevel.toFixed(1)}</td>
                  <td className="py-2 text-right font-mono text-foreground">{r.groundWater.toFixed(1)}</td>
                  <td className="py-2 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      r.waterQuality === 'Good' ? 'bg-alert-green/20 text-alert-green' :
                      r.waterQuality === 'Moderate' ? 'bg-alert-yellow/20 text-alert-yellow' :
                      'bg-alert-red/20 text-alert-red'
                    }`}>
                      {r.waterQuality}
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono text-foreground">{r.turbidity} NTU</td>
                  <td className="py-2 text-center">{trendIcons[r.trend]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>

      <HazardDistributionMap
        title="Flood Risk & Vulnerability Distribution"
        subtitle="NIHSA Hydrological Aggregate"
        icon={<Droplets className="h-4 w-4 text-agency-nihsa" />}
        stateData={nihsaStateRisk}
        delay={0.3}
      />
    </div>
  );
};

export default NIHSAPanel;
