import { motion } from 'framer-motion';
import { agencies } from '@/data/mockData';
import { AlertTriangle, Users } from 'lucide-react';

const agencyBorderColors: Record<string, string> = {
  NIHSA: 'border-l-agency-nihsa',
  NIMET: 'border-l-agency-nimet',
  NEMA: 'border-l-agency-nema',
  // HIDDEN — uncomment to re-enable:
  // NCDC: 'border-l-agency-ncdc',
  NOA: 'border-l-agency-noa',
  // SEMA: 'border-l-agency-sema',
  // LEMA: 'border-l-agency-lema',
};

const AgencySummary = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="data-grid"
    >
      <h3 className="font-semibold text-sm text-foreground mb-4">Agency Monitoring</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {agencies.map((a, i) => (
          <motion.div
            key={a.code}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            className={`border-l-4 ${agencyBorderColors[a.code]} bg-secondary/50 rounded-md p-3`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-foreground">{a.name}</span>
              <span className="text-[10px] text-muted-foreground">{a.code}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2 line-clamp-1">{a.role}</p>
            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-alert-orange" />
                <span className="font-mono text-foreground">{a.activeAlerts}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-primary" />
                <span className="font-mono text-foreground">{a.personnelDeployed}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AgencySummary;
