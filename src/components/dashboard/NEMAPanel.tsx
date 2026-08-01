import { motion } from 'framer-motion';
import { Siren, Truck, Users, Map as MapIcon } from 'lucide-react';
import { nemaOperations } from '@/data/mockData';
import HazardDistributionMap from './HazardDistributionMap';

const statusClass = {
  Mobilizing: 'bg-alert-yellow/20 text-alert-yellow',
  'On Site': 'bg-alert-red/20 text-alert-red',
  'Stand Down': 'bg-alert-green/20 text-alert-green',
  Closed: 'bg-secondary text-muted-foreground',
} as const;

// Aggregate response intensity per state (weighted by displaced + affected)
const stateAgg = Object.values(
  nemaOperations.reduce<Record<string, { state: string; score: number; hazards: string[] }>>((acc, o) => {
    const score = o.displacedPersons * 2 + o.affectedPersons;
    const cur = acc[o.state] ?? { state: o.state, score: 0, hazards: [] };
    cur.score += score;
    cur.hazards.push(o.hazard);
    acc[o.state] = cur;
    return acc;
  }, {})
);
const maxScore = Math.max(...stateAgg.map((s) => s.score), 1);
const nemaStateRisk = stateAgg.map((s) => {
  const probabilityPercent = Math.round((s.score / maxScore) * 100);
  const riskLevel: 'high' | 'moderate' | 'low' =
    probabilityPercent >= 70 ? 'high' : probabilityPercent >= 40 ? 'moderate' : 'low';
  return {
    state: s.state,
    riskLevel,
    probabilityPercent,
    predictedPeakMonth: 'Active',
    riverBasin: Array.from(new Set(s.hazards)).join(' · '),
    vulnerablePopulation: s.score,
  };
});

const NEMAPanel = () => {
  const totalAffected = nemaOperations.reduce((s, o) => s + o.affectedPersons, 0);
  const totalDisplaced = nemaOperations.reduce((s, o) => s + o.displacedPersons, 0);
  const totalTrucks = nemaOperations.reduce((s, o) => s + o.reliefTrucks, 0);
  const activeOps = nemaOperations.filter((o) => o.status === 'On Site' || o.status === 'Mobilizing').length;

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="data-grid"
      >
        <div className="flex items-center gap-2 mb-4">
          <Siren className="h-4 w-4 text-agency-nema" />
          <h3 className="font-semibold text-sm text-foreground">NEMA — Emergency Response Operations</h3>
          <span className="ml-auto text-[10px] font-mono text-muted-foreground status-pulse">● LIVE</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div className="rounded border border-border bg-secondary/40 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Siren className="h-3 w-3 text-alert-red" /> Active Ops
            </div>
            <p className="mt-1 font-mono text-lg text-alert-red">{activeOps}</p>
          </div>
          <div className="rounded border border-border bg-secondary/40 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3 w-3 text-agency-nema" /> Affected
            </div>
            <p className="mt-1 font-mono text-lg text-foreground">{totalAffected.toLocaleString()}</p>
          </div>
          <div className="rounded border border-border bg-secondary/40 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3 w-3 text-alert-orange" /> Displaced
            </div>
            <p className="mt-1 font-mono text-lg text-alert-orange">{totalDisplaced.toLocaleString()}</p>
          </div>
          <div className="rounded border border-border bg-secondary/40 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Truck className="h-3 w-3 text-agency-nema" /> Relief Trucks
            </div>
            <p className="mt-1 font-mono text-lg text-foreground">{totalTrucks}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">Op ID</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Incident</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Hazard</th>
                <th className="text-left py-2 text-muted-foreground font-medium">State / LGA</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Affected</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Displaced</th>
                <th className="text-right py-2 text-muted-foreground font-medium">IDP Camps</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Trucks</th>
                <th className="text-center py-2 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {nemaOperations.map((o) => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="py-2 font-mono font-medium text-foreground">{o.id}</td>
                  <td className="py-2 text-foreground">{o.incident}</td>
                  <td className="py-2 text-muted-foreground capitalize">{o.hazard}</td>
                  <td className="py-2 text-muted-foreground">{o.state} · {o.lga}</td>
                  <td className="py-2 text-right font-mono text-foreground">{o.affectedPersons.toLocaleString()}</td>
                  <td className="py-2 text-right font-mono text-alert-orange">{o.displacedPersons.toLocaleString()}</td>
                  <td className="py-2 text-right font-mono text-muted-foreground">{o.iDPCamps}</td>
                  <td className="py-2 text-right font-mono text-foreground">{o.reliefTrucks}</td>
                  <td className="py-2 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${statusClass[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <HazardDistributionMap
        title="Active Response Intensity by State"
        subtitle="NEMA Operations Aggregate"
        icon={<MapIcon className="h-4 w-4 text-agency-nema" />}
        stateData={nemaStateRisk}
        delay={0.35}
      />
    </div>
  );
};

export default NEMAPanel;
