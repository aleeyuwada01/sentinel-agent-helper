import { motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { agencies } from '@/data/mockData';

const agencyColors: Record<string, string> = {
  NIHSA: 'bg-agency-nihsa',
  NIMET: 'bg-agency-nimet',
  NEMA: 'bg-agency-nema',
  // HIDDEN — uncomment to re-enable:
  // NCDC: 'bg-agency-ncdc',
  NOA: 'bg-agency-noa',
  // SEMA: 'bg-agency-sema',
  // LEMA: 'bg-agency-lema',
  // FFS: 'bg-agency-ffs',
};

const AgencyBar = () => {
  return (
    <div className="border-b border-border bg-card/50 px-6 py-2">
      <div className="flex items-center gap-3 overflow-x-auto">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
          Partner Agencies
        </span>
        <div className="h-4 w-px bg-border" />
        {agencies.map((a, i) => (
          <Link key={a.code} to="/agency/$code" params={{ code: a.code.toLowerCase() }}>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span className={`h-2 w-2 rounded-full ${agencyColors[a.code]}`} />
              <span className="text-[11px] font-medium text-foreground">{a.name}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{a.activeAlerts}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AgencyBar;
