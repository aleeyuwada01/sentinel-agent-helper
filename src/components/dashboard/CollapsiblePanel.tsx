import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  /** Small stat shown on the collapsed icon row */
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * Icon-first disclosure: the panel body stays hidden until the user clicks the
 * icon/button row. Used for focal-person rosters and incident timelines so the
 * dashboard leads with the map and operational view.
 */
const CollapsiblePanel = ({ title, subtitle, icon, badge, defaultOpen = false, children }: Props) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="data-grid">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 text-left"
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors ${
            open ? 'bg-primary/25 border-primary/50' : 'bg-secondary border-border hover:bg-primary/15'
          }`}
        >
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">{title}</span>
          {subtitle && <span className="block text-[10px] text-muted-foreground">{subtitle}</span>}
        </span>
        {badge && (
          <span className="ml-auto text-[10px] font-mono text-muted-foreground whitespace-nowrap">{badge}</span>
        )}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${badge ? 'ml-2' : 'ml-auto'} ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CollapsiblePanel;
