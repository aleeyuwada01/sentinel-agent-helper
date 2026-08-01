import { motion } from 'framer-motion';
import { Megaphone, Radio, Map as MapIcon } from 'lucide-react';
import { noaCampaigns } from '@/data/mockData';
import HazardDistributionMap from './HazardDistributionMap';

const statusClass = {
  Live: 'bg-alert-green/20 text-alert-green',
  Scheduled: 'bg-alert-yellow/20 text-alert-yellow',
  Completed: 'bg-secondary text-muted-foreground',
} as const;

// Coverage intensity per state (sum of campaign reach in that state)
const stateAgg: Record<string, { state: string; reach: number; campaigns: string[] }> = {};
noaCampaigns.forEach((c) => {
  c.states.forEach((st) => {
    const cur = stateAgg[st] ?? { state: st, reach: 0, campaigns: [] };
    cur.reach += c.reach / c.states.length;
    cur.campaigns.push(c.campaign);
    stateAgg[st] = cur;
  });
});
const aggArr = Object.values(stateAgg);
const maxReach = Math.max(...aggArr.map((s) => s.reach), 1);
const noaStateRisk = aggArr.map((s) => {
  const probabilityPercent = Math.round((s.reach / maxReach) * 100);
  const riskLevel: 'high' | 'moderate' | 'low' =
    probabilityPercent >= 70 ? 'high' : probabilityPercent >= 40 ? 'moderate' : 'low';
  return {
    state: s.state,
    riskLevel,
    probabilityPercent,
    predictedPeakMonth: 'Active',
    riverBasin: `${s.campaigns.length} campaigns`,
    vulnerablePopulation: Math.round(s.reach),
  };
});

const NOAPanel = () => {
  const totalReach = noaCampaigns.reduce((s, c) => s + c.reach, 0);
  const liveCampaigns = noaCampaigns.filter((c) => c.status === 'Live').length;

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="data-grid"
      >
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="h-4 w-4 text-agency-noa" />
          <h3 className="font-semibold text-sm text-foreground">NOA — Public Sensitization Campaigns</h3>
          <span className="ml-auto text-[10px] font-mono text-muted-foreground status-pulse">● LIVE</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded border border-border bg-secondary/40 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Live Campaigns</div>
            <p className="mt-1 font-mono text-lg text-alert-green">{liveCampaigns}</p>
          </div>
          <div className="rounded border border-border bg-secondary/40 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Reach</div>
            <p className="mt-1 font-mono text-lg text-foreground">{(totalReach / 1_000_000).toFixed(1)}M</p>
          </div>
          <div className="rounded border border-border bg-secondary/40 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Languages</div>
            <p className="mt-1 font-mono text-lg text-foreground">EN · HA · IG · YO</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">ID</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Campaign</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Hazard</th>
                <th className="text-left py-2 text-muted-foreground font-medium">States</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Channels</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Languages</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Reach</th>
                <th className="text-center py-2 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {noaCampaigns.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="py-2 font-mono font-medium text-foreground">{c.id}</td>
                  <td className="py-2 text-foreground">{c.campaign}</td>
                  <td className="py-2 text-muted-foreground capitalize">{c.hazard}</td>
                  <td className="py-2 text-muted-foreground max-w-[160px] truncate">{c.states.join(', ')}</td>
                  <td className="py-2 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Radio className="h-3 w-3 text-agency-noa" />
                      {c.channels.join(' · ')}
                    </div>
                  </td>
                  <td className="py-2 font-mono text-muted-foreground">{c.languages.join('/')}</td>
                  <td className="py-2 text-right font-mono text-foreground">{(c.reach / 1000).toFixed(0)}k</td>
                  <td className="py-2 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${statusClass[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <HazardDistributionMap
        title="Sensitization Coverage by State"
        subtitle="NOA Campaign Reach"
        icon={<MapIcon className="h-4 w-4 text-agency-noa" />}
        stateData={noaStateRisk}
        delay={0.35}
      />
    </div>
  );
};

export default NOAPanel;
