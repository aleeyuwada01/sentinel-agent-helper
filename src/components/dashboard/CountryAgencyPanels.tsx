import { motion } from 'framer-motion';
import { Database } from 'lucide-react';
import { agencyPanelsFor, type AgencyPanel } from '@/data/commandCenter';
import type { CountryProfile } from '@/data/westAfrica';
import { useAuth } from '@/hooks/useAuth';
import { useDataVersion } from '@/hooks/useDataVersion';
import { filterPanels } from '@/data/accessControl';

const statusClass: Record<string, string> = {
  Normal: 'text-alert-green',
  Watch: 'text-alert-orange',
  Alert: 'text-alert-red',
};

export const AgencyPanelCard = ({ panel, delay = 0 }: { panel: AgencyPanel; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="data-grid"
  >
    <div className="flex items-center gap-2 mb-2 flex-wrap">
      <Database className="h-4 w-4 text-primary" />
      <h3 className="font-semibold text-sm text-foreground">{panel.title}</h3>
      <span className="ml-auto text-[10px] font-mono text-muted-foreground">● LIVE</span>
    </div>
    <p className="text-[10px] text-muted-foreground mb-3">{panel.note}</p>

    <div className="grid grid-cols-3 gap-2 mb-3">
      {panel.kpis.map((k) => (
        <div key={k.label} className="rounded-md border border-border bg-secondary/40 p-2">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{k.label}</p>
          <p className="text-sm font-mono font-bold text-foreground">{k.value}</p>
        </div>
      ))}
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="text-left text-muted-foreground border-b border-border">
            {panel.columns.map((c) => (
              <th key={c} className="py-2 pr-3 font-medium whitespace-nowrap">
                {c}
              </th>
            ))}
            <th className="py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {panel.rows.map((r) => (
            <tr key={r.cells.join('|')} className="border-b border-border/50">
              {r.cells.map((c, i) => (
                <td
                  key={`${c}-${i}`}
                  className={`py-2 pr-3 whitespace-nowrap ${i === 0 ? 'text-foreground font-medium' : 'text-muted-foreground font-mono'}`}
                >
                  {c}
                </td>
              ))}
              <td className={`py-2 font-mono font-semibold ${statusClass[r.status]}`}>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
);

/** All agency data panels for a country, consistently populated. */
const CountryAgencyPanels = ({ country }: { country: CountryProfile }) => {
  const { scope } = useAuth();
  useDataVersion();
  const panels = filterPanels(scope, agencyPanelsFor(country.code));
  return (
    <section className="space-y-4">
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
        Agency Data Panels — {country.shortName}
      </h2>
      {panels.length === 0 && (
        <p className="text-[11px] text-muted-foreground">
          No agency panel is assigned to your access scope for {country.shortName}.
        </p>
      )}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {panels.map((p, i) => (
          <AgencyPanelCard key={p.agencyCode} panel={p} delay={Math.min(i * 0.04, 0.3)} />
        ))}
      </div>
    </section>
  );
};

export default CountryAgencyPanels;
