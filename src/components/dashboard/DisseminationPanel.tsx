import { motion } from 'framer-motion';
import { disseminationStats } from '@/data/mockData';
import { Building2, Network } from 'lucide-react';

const ProgressBar = ({ reached, total, color }: { reached: number; total: number; color: string }) => {
  const pct = (reached / total) * 100;
  return (
    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, delay: 0.5 }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
};

const DisseminationPanel = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="data-grid"
    >
      <h3 className="font-semibold text-sm text-foreground mb-4">Dissemination Network</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Conventional */}
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-agency-noa" />
            <div>
              <p className="text-xs font-semibold text-foreground">{disseminationStats.conventional.label}</p>
              <p className="text-[10px] text-muted-foreground">{disseminationStats.conventional.description}</p>
            </div>
          </div>
          <div className="space-y-3">
            {disseminationStats.conventional.channels.map((ch) => (
              <div key={ch.name}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted-foreground">{ch.name}</span>
                  <span className="font-mono text-foreground">{ch.reached}/{ch.total} <span className="text-muted-foreground">{ch.unit}</span></span>
                </div>
                <ProgressBar reached={ch.reached} total={ch.total} color="bg-agency-noa" />
              </div>
            ))}
          </div>
        </div>

        {/* Unconventional */}
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Network className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-semibold text-foreground">{disseminationStats.unconventional.label}</p>
              <p className="text-[10px] text-muted-foreground">{disseminationStats.unconventional.description}</p>
            </div>
          </div>
          <div className="space-y-3">
            {disseminationStats.unconventional.channels.map((ch) => (
              <div key={ch.name}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted-foreground">{ch.name}</span>
                  <span className="font-mono text-foreground">{ch.reached}/{ch.total} <span className="text-muted-foreground">{ch.unit}</span></span>
                </div>
                <ProgressBar reached={ch.reached} total={ch.total} color="bg-primary" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DisseminationPanel;
