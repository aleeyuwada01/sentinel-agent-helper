import { motion } from 'framer-motion';
import { Activity, Map as MapIcon, Stethoscope } from 'lucide-react';
import { epidemicReadings } from '@/data/mockData';
import HazardDistributionMap from './HazardDistributionMap';

const riskClass = {
  high: 'bg-alert-red/20 text-alert-red',
  moderate: 'bg-alert-orange/20 text-alert-orange',
  low: 'bg-alert-green/20 text-alert-green',
} as const;

// Aggregate epidemic risk per state (worst across diseases)
const stateAgg = Object.values(
  epidemicReadings.reduce<Record<string, { state: string; score: number; diseases: string[] }>>((acc, r) => {
    const score = r.confirmedCases + r.fatalities * 5;
    const cur = acc[r.state] ?? { state: r.state, score: 0, diseases: [] };
    cur.score = Math.max(cur.score, score);
    cur.diseases.push(r.disease);
    acc[r.state] = cur;
    return acc;
  }, {})
);
const maxScore = Math.max(...stateAgg.map((s) => s.score), 1);
const ncdcStateRisk = stateAgg.map((s) => {
  const probabilityPercent = Math.round((s.score / maxScore) * 100);
  const riskLevel: 'high' | 'moderate' | 'low' =
    probabilityPercent >= 70 ? 'high' : probabilityPercent >= 40 ? 'moderate' : 'low';
  return {
    state: s.state,
    riskLevel,
    probabilityPercent,
    predictedPeakMonth: 'Apr–Jun',
    riverBasin: Array.from(new Set(s.diseases)).join(' · '),
    vulnerablePopulation: Math.round((probabilityPercent / 100) * 350_000),
  };
});

const NCDCPanel = () => {
  const totalConfirmed = epidemicReadings.reduce((s, r) => s + r.confirmedCases, 0);
  const totalFatalities = epidemicReadings.reduce((s, r) => s + r.fatalities, 0);
  const cfr = ((totalFatalities / Math.max(totalConfirmed, 1)) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="data-grid"
      >
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope className="h-4 w-4 text-agency-ncdc" />
          <h3 className="font-semibold text-sm text-foreground">NCDC — Epidemic Surveillance</h3>
          <span className="ml-auto text-[10px] font-mono text-muted-foreground status-pulse">● LIVE</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded border border-border bg-secondary/40 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Confirmed Cases</div>
            <p className="mt-1 font-mono text-lg text-alert-orange">{totalConfirmed.toLocaleString()}</p>
          </div>
          <div className="rounded border border-border bg-secondary/40 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Fatalities</div>
            <p className="mt-1 font-mono text-lg text-alert-red">{totalFatalities}</p>
          </div>
          <div className="rounded border border-border bg-secondary/40 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg CFR</div>
            <p className="mt-1 font-mono text-lg text-foreground">{cfr}%</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">State</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Disease</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Suspected</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Confirmed</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Deaths</th>
                <th className="text-right py-2 text-muted-foreground font-medium">CFR %</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Attack/100k</th>
                <th className="text-center py-2 text-muted-foreground font-medium">Risk</th>
              </tr>
            </thead>
            <tbody>
              {epidemicReadings.map((r, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="py-2 font-mono font-medium text-foreground">{r.state}</td>
                  <td className="py-2 text-foreground">{r.disease}</td>
                  <td className="py-2 text-right font-mono text-muted-foreground">{r.suspectedCases}</td>
                  <td className="py-2 text-right font-mono text-foreground">{r.confirmedCases}</td>
                  <td className="py-2 text-right font-mono text-alert-red">{r.fatalities}</td>
                  <td className="py-2 text-right font-mono">
                    <span className={r.caseFatalityRate > 10 ? 'text-alert-red' : r.caseFatalityRate > 3 ? 'text-alert-orange' : 'text-foreground'}>
                      {r.caseFatalityRate}%
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono text-muted-foreground">{r.attackRatePer100k}</td>
                  <td className="py-2 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${riskClass[r.riskLevel]}`}>
                      {r.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <HazardDistributionMap
        title="Epidemic Risk Distribution by State"
        subtitle="NCDC Surveillance Aggregate"
        icon={<Activity className="h-4 w-4 text-agency-ncdc" />}
        stateData={ncdcStateRisk}
        delay={0.35}
      />
    </div>
  );
};

export default NCDCPanel;
