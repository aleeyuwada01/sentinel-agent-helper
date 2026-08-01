import { motion } from 'framer-motion';
import { BarChart3, Home, Layers, Siren } from 'lucide-react';
import { allCountryKPIs } from '@/data/adminBoundaries';
import type { CountryCode } from '@/data/westAfrica';
import { useAuth } from '@/hooks/useAuth';
import { useDataVersion } from '@/hooks/useDataVersion';
import { allowedCountries } from '@/data/accessControl';

const hazardClass: Record<string, string> = {
  flood: 'text-hazard-flood',
  drought: 'text-hazard-drought',
  epidemic: 'text-hazard-epidemic',
  heatwave: 'text-hazard-heatwave',
  fire: 'text-hazard-fire',
};

/** Cross-country KPI comparison for the West Africa Central Command Center. */
const CrossCountryKPI = ({ onSelect }: { onSelect?: (code: CountryCode) => void }) => {
  const { scope } = useAuth();
  useDataVersion();
  const allowed = allowedCountries(scope);
  const kpis = allCountryKPIs().filter((k) => allowed.includes(k.code));
  const maxReach = Math.max(...kpis.map((k) => k.reachRate), 1);

  return (
    <section className="data-grid">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm text-foreground">Cross-Country KPI Comparison</h3>
        <span className="text-[10px] font-mono text-muted-foreground">{kpis.length} national deployments</span>
      </div>
      <p className="text-[10px] text-muted-foreground mb-3">
        Benchmarks the four national systems on hazard exposure, warning dissemination and incident load.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="py-2 pr-3 font-medium">Country</th>
              <th className="py-2 pr-3 font-medium">Boundary layers</th>
              <th className="py-2 pr-3 font-medium">Highest risk hazard</th>
              <th className="py-2 pr-3 font-medium">Incidents 7d / 30d</th>
              <th className="py-2 pr-3 font-medium">Active</th>
              <th className="py-2 pr-3 font-medium">Households reached</th>
              <th className="py-2 font-medium">Reach rate</th>
            </tr>
          </thead>
          <tbody>
            {kpis.map((k) => (
              <tr
                key={k.code}
                onClick={() => onSelect?.(k.code)}
                className="border-b border-border/50 hover:bg-secondary/40 cursor-pointer"
              >
                <td className="py-2 pr-3 text-foreground font-medium whitespace-nowrap">
                  {k.flag} {k.name}
                </td>
                <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">
                  <span className="font-mono text-foreground">{k.level1Count}</span> {k.level1Label} ·{' '}
                  <span className="font-mono text-foreground">{k.level2Count}</span> {k.level2Label}
                </td>
                <td className={`py-2 pr-3 font-mono capitalize ${hazardClass[k.highestRiskHazard]}`}>
                  {k.highestRiskHazard} · {k.highestRiskValue}%
                </td>
                <td className="py-2 pr-3 font-mono text-foreground">
                  {k.incidents7d} / {k.incidents30d}
                </td>
                <td className="py-2 pr-3 font-mono text-alert-red">{k.activeIncidents}</td>
                <td className="py-2 pr-3 font-mono text-foreground">
                  {k.householdsReached.toLocaleString()}{' '}
                  <span className="text-muted-foreground">/ {k.householdsTargeted.toLocaleString()}</span>
                </td>
                <td className="py-2 font-mono text-alert-green">{k.reachRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.code}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-md border border-border bg-secondary/40 p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-foreground">
                {k.flag} {k.name}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                <Siren className="h-3 w-3 text-alert-orange" /> {k.activeIncidents}
              </span>
            </div>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
              <Layers className="h-3 w-3" /> Top affected {k.level2Label.toLowerCase()}
            </p>
            <ul className="space-y-1">
              {k.topAffected.map((t) => (
                <li key={t.name} className="flex items-center justify-between text-[10px]">
                  <span className="text-foreground truncate mr-2">
                    {t.name} <span className="text-muted-foreground">· {t.parent}</span>
                  </span>
                  <span className="font-mono text-alert-red shrink-0">{t.risk}%</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 pt-2 border-t border-border/60">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Home className="h-3 w-3" /> Reach rate
              </p>
              <div className="h-1.5 rounded bg-background mt-1 overflow-hidden">
                <div
                  className="h-full bg-alert-green"
                  style={{ width: `${(k.reachRate / maxReach) * 100}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-foreground mt-1">
                {k.reachRate}% · {k.householdsReached.toLocaleString()} households
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CrossCountryKPI;
