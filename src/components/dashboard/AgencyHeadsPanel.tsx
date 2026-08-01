import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, ShieldCheck, UserCog } from 'lucide-react';
import { allAgencyHeads } from '@/data/commandCenter';
import { countries, type CountryCode } from '@/data/westAfrica';

/**
 * Heads of every partner agency, seated as focal persons at the
 * West Africa Central Command Center (WAMHEWS).
 */
const AgencyHeadsPanel = () => {
  const [filter, setFilter] = useState<CountryCode | 'ALL'>('ALL');
  const heads = allAgencyHeads().filter((h) => filter === 'ALL' || h.countryCode === filter);
  const onDuty = heads.filter((h) => h.onDuty).length;

  return (
    <section className="data-grid">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <UserCog className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm text-foreground">Central Command Focal Persons</h3>
        <span className="text-[10px] font-mono text-muted-foreground">
          {onDuty}/{heads.length} on duty
        </span>
        <div className="ml-auto inline-flex rounded border border-border bg-secondary/40 p-0.5 text-[10px] flex-wrap">
          {(['ALL', ...countries.map((c) => c.code)] as (CountryCode | 'ALL')[]).map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-2 py-1 rounded transition-colors ${
                filter === c ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {c === 'ALL' ? 'All' : `${countries.find((x) => x.code === c)?.flag} ${c}`}
            </button>
          ))}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mb-3">
        The head of each partner agency holds the national focal-person seat at the West Africa Central Command
        Center — accountable for sitreps, escalation and cross-border coordination.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {heads.map((h, i) => (
          <motion.div
            key={`${h.countryCode}-${h.agencyCode}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.02, 0.3) }}
            className={`rounded-md border p-3 ${
              h.isLeadAgency ? 'border-primary/50 bg-primary/10' : 'border-border bg-secondary/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-foreground">
                {h.flag} {h.agencyName}
              </span>
              <span
                className={`text-[9px] font-mono uppercase ${h.onDuty ? 'text-alert-green' : 'text-muted-foreground'}`}
              >
                {h.onDuty ? '● On duty' : '○ Off duty'}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">{h.agencyFullName}</p>
            <p className="text-[11px] font-semibold text-foreground">{h.head}</p>
            <p className="text-[10px] text-muted-foreground">
              {h.title}
              {h.isLeadAgency && (
                <span className="ml-1 text-primary inline-flex items-center gap-0.5">
                  <ShieldCheck className="h-3 w-3" /> Lead agency
                </span>
              )}
            </p>
            <div className="mt-2 space-y-0.5 text-[10px] text-muted-foreground">
              <p className="flex items-center gap-1 font-mono">
                <Phone className="h-3 w-3" /> {h.phone}
              </p>
              <p className="flex items-center gap-1 truncate">
                <Mail className="h-3 w-3 shrink-0" /> {h.email}
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-[10px]">
              <span className="font-mono text-muted-foreground">Desk {h.deskSeat}</span>
              <span className="font-mono text-foreground">
                {h.activeAlerts} alerts · sitrep {h.lastSitrep}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AgencyHeadsPanel;
