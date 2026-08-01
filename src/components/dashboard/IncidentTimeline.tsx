import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Home, Radio, Siren } from 'lucide-react';
import { boundaryLabels, getIncidents, type Incident } from '@/data/adminBoundaries';
import type { CountryProfile } from '@/data/westAfrica';
import { useAuth } from '@/hooks/useAuth';
import { useDataVersion } from '@/hooks/useDataVersion';
import { filterIncidents } from '@/data/accessControl';
import { downloadIncidentsCsv } from '@/lib/incidentReport';

const levelClass: Record<Incident['alertLevel'], string> = {
  yellow: 'text-alert-yellow border-alert-yellow/40 bg-alert-yellow/10',
  orange: 'text-alert-orange border-alert-orange/40 bg-alert-orange/10',
  red: 'text-alert-red border-alert-red/40 bg-alert-red/10',
};

const statusClass: Record<Incident['status'], string> = {
  active: 'text-alert-red',
  monitoring: 'text-alert-orange',
  closed: 'text-alert-green',
};

const filters = ['all', 'active', 'monitoring', 'closed'] as const;

/** Per-country incident timeline — what caused each alert and who was reached. */
const IncidentTimeline = ({ country }: { country: CountryProfile }) => {
  const labels = boundaryLabels[country.code];
  const [filter, setFilter] = useState<(typeof filters)[number]>('all');
  const { scope } = useAuth();
  useDataVersion();
  const incidents = filterIncidents(scope, getIncidents(country.code)).filter(
    (i) => filter === 'all' || i.status === filter,
  );

  const reached = incidents.reduce((s, i) => s + i.householdsReached, 0);
  const targeted = incidents.reduce((s, i) => s + i.householdsTargeted, 0);

  return (
    <section className="data-grid">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <Siren className="h-4 w-4 text-alert-orange" />
        <h3 className="font-semibold text-sm text-foreground">{country.shortName} — Incident Timeline</h3>
        <span className="text-[10px] font-mono text-muted-foreground">
          {reached.toLocaleString()} / {targeted.toLocaleString()} households reached
        </span>
        <button
          onClick={() => downloadIncidentsCsv(incidents, `${country.code}-incident-timeline.csv`)}
          className="ml-auto inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[10px] text-foreground hover:bg-secondary transition-colors"
        >
          Export CSV
        </button>
        <div className="inline-flex rounded border border-border bg-secondary/40 p-0.5 text-[10px]">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded capitalize transition-colors ${
                filter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mb-3">
        Chronological record of triggered alerts by {labels.level2Singular.toLowerCase()}, the parameter that
        breached threshold, and the dissemination outcome reported by focal persons.
      </p>

      <ol className="relative border-l border-border ml-2 space-y-3">
        {incidents.map((inc, i) => (
          <motion.li
            key={inc.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.3) }}
            className="ml-4"
          >
            <span
              className={`absolute -left-[5px] mt-2 h-2.5 w-2.5 rounded-full ${
                inc.status === 'active' ? 'bg-alert-red status-pulse' : inc.status === 'monitoring' ? 'bg-alert-orange' : 'bg-alert-green'
              }`}
            />
            <div className="rounded-md border border-border bg-secondary/40 p-3">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <p className="text-xs font-semibold text-foreground">{inc.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {inc.level2} · {inc.level1} {labels.level1Singular} · {inc.agency}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border ${levelClass[inc.alertLevel]}`}>
                    {inc.alertLevel}
                  </span>
                  <span className={`text-[10px] font-mono capitalize ${statusClass[inc.status]}`}>{inc.status}</span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground mt-2">{inc.cause}.</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-[10px]">
                <div>
                  <p className="text-muted-foreground">{inc.parameter}</p>
                  <p className="font-mono text-foreground">
                    {inc.reading} <span className="text-muted-foreground">/ thr {inc.threshold}</span>
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Home className="h-3 w-3" /> Households reached
                  </p>
                  <p className="font-mono text-alert-green">
                    {inc.householdsReached.toLocaleString()} / {inc.householdsTargeted.toLocaleString()} (
                    {Math.round((inc.householdsReached / inc.householdsTargeted) * 100)}%)
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">People affected · displaced</p>
                  <p className="font-mono text-foreground">
                    {inc.peopleAffected.toLocaleString()} · {inc.displaced.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Reported
                  </p>
                  <p className="font-mono text-foreground">
                    {new Date(inc.occurredAt).toUTCString().slice(5, 22)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 flex-wrap text-[10px] text-muted-foreground">
                <Radio className="h-3 w-3 text-primary" />
                <span className="font-mono text-foreground">{inc.focalPerson.name}</span>
                <span>{inc.focalPerson.phone}</span>
                <span>· {inc.channels.join(' · ')}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{inc.responseNote}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
};

export default IncidentTimeline;
