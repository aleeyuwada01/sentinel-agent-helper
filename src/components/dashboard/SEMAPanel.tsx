import { motion } from 'framer-motion';
import { ShieldCheck, Users, Map as MapIcon } from 'lucide-react';
import { semaStates } from '@/data/mockData';
import HazardDistributionMap from './HazardDistributionMap';

const riskClass = {
  high: 'bg-alert-red/20 text-alert-red',
  moderate: 'bg-alert-orange/20 text-alert-orange',
  low: 'bg-alert-green/20 text-alert-green',
} as const;

const semaStateRisk = semaStates.map((s) => {
  const occRatio = s.shelterOccupancy / Math.max(s.shelterCapacity, 1);
  const probabilityPercent = Math.min(100, Math.round((s.activeIncidents * 12) + occRatio * 40));
  const riskLevel: 'high' | 'moderate' | 'low' = s.riskLevel;
  return {
    state: s.state,
    riskLevel,
    probabilityPercent,
    predictedPeakMonth: `${s.preparednessScore}/100 prep`,
    riverBasin: s.hazardsTracked.join(' · '),
    vulnerablePopulation: s.shelterOccupancy,
  };
});

const SEMAPanel = () => {
  const totalIncidents = semaStates.reduce((s, x) => s + x.activeIncidents, 0);
  const totalOfficers = semaStates.reduce((s, x) => s + x.fieldOfficers, 0);
  const totalCapacity = semaStates.reduce((s, x) => s + x.shelterCapacity, 0);
  const totalOccupancy = semaStates.reduce((s, x) => s + x.shelterOccupancy, 0);

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="data-grid"
      >
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-4 w-4 text-agency-sema" />
          <h3 className="font-semibold text-sm text-foreground">SEMA — State-Level Coordination</h3>
          <span className="ml-auto text-[10px] font-mono text-muted-foreground status-pulse">● LIVE</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div className="rounded border border-border bg-secondary/40 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Incidents</div>
            <p className="mt-1 font-mono text-lg text-alert-red">{totalIncidents}</p>
          </div>
          <div className="rounded border border-border bg-secondary/40 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3 w-3 text-agency-sema" /> Field Officers
            </div>
            <p className="mt-1 font-mono text-lg text-foreground">{totalOfficers}</p>
          </div>
          <div className="rounded border border-border bg-secondary/40 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Shelter Capacity</div>
            <p className="mt-1 font-mono text-lg text-foreground">{(totalCapacity / 1000).toFixed(1)}k</p>
          </div>
          <div className="rounded border border-border bg-secondary/40 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Occupancy</div>
            <p className="mt-1 font-mono text-lg text-alert-orange">
              {Math.round((totalOccupancy / totalCapacity) * 100)}%
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">State</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Incidents</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Hazards Tracked</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Officers</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Capacity</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Occupancy</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Prep Score</th>
                <th className="text-center py-2 text-muted-foreground font-medium">Risk</th>
              </tr>
            </thead>
            <tbody>
              {semaStates.map((s) => {
                const occPct = Math.round((s.shelterOccupancy / s.shelterCapacity) * 100);
                return (
                  <tr key={s.state} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                    <td className="py-2 font-mono font-medium text-foreground">{s.state}</td>
                    <td className="py-2 text-right font-mono text-alert-red">{s.activeIncidents}</td>
                    <td className="py-2 text-muted-foreground capitalize">{s.hazardsTracked.join(' · ')}</td>
                    <td className="py-2 text-right font-mono text-foreground">{s.fieldOfficers}</td>
                    <td className="py-2 text-right font-mono text-muted-foreground">{s.shelterCapacity.toLocaleString()}</td>
                    <td className="py-2 text-right font-mono">
                      <span className={occPct > 70 ? 'text-alert-red' : occPct > 40 ? 'text-alert-orange' : 'text-foreground'}>
                        {s.shelterOccupancy.toLocaleString()} ({occPct}%)
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono">
                      <span className={s.preparednessScore >= 75 ? 'text-alert-green' : s.preparednessScore >= 60 ? 'text-alert-yellow' : 'text-alert-orange'}>
                        {s.preparednessScore}
                      </span>
                    </td>
                    <td className="py-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${riskClass[s.riskLevel]}`}>
                        {s.riskLevel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <HazardDistributionMap
        title="SEMA Coordination Risk by State"
        subtitle="Incidents × Shelter Occupancy"
        icon={<MapIcon className="h-4 w-4 text-agency-sema" />}
        stateData={semaStateRisk}
        delay={0.35}
      />
    </div>
  );
};

export default SEMAPanel;
