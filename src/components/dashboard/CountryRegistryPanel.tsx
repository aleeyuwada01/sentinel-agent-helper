import { useEffect, useState } from 'react';
import { Building2, Globe2, Plus, Trash2, Download } from 'lucide-react';
import {
  addConcern,
  concernCategories,
  concernSeverities,
  emptyCountry,
  loadRegistry,
  removeConcern,
  removeCountry,
  saveCountry,
  subscribeRegistry,
  uid,
  type CountryConcern,
  type RegisteredCountry,
} from '@/data/countryRegistry';
import { countries } from '@/data/westAfrica';
import { boundaryLabels } from '@/data/adminBoundaries';
import { downloadBlob, toCsv } from '@/lib/csv';

const severityClass: Record<CountryConcern['severity'], string> = {
  low: 'text-alert-green border-alert-green/40',
  moderate: 'text-alert-yellow border-alert-yellow/40',
  high: 'text-alert-orange border-alert-orange/40',
  critical: 'text-alert-red border-alert-red/40',
};

const field =
  'w-full rounded border border-border bg-background px-2 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary';

/** Register a new country deployment and log every concern the system must cover. */
const CountryRegistryPanel = () => {
  const [items, setItems] = useState<RegisteredCountry[]>([]);
  const [draft, setDraft] = useState<RegisteredCountry>(emptyCountry());
  const [concernDraft, setConcernDraft] = useState<Record<string, CountryConcern>>({});

  useEffect(() => {
    setItems(loadRegistry());
    const unsub = subscribeRegistry(() => setItems(loadRegistry()));
    return () => {
      unsub();
    };
  }, []);

  const newConcern = (countryId: string): CountryConcern =>
    concernDraft[countryId] ?? {
      id: uid(),
      title: '',
      category: 'hazard',
      severity: 'moderate',
      obtainable: '',
      responsibleAgency: '',
    };

  const submitCountry = () => {
    if (!draft.name.trim()) return;
    saveCountry({ ...draft, createdAt: new Date().toISOString() });
    setDraft(emptyCountry());
  };

  const exportRegistry = () =>
    downloadBlob(
      'wamhews-country-registry.csv',
      'text/csv;charset=utf-8',
      toCsv(
        ['country', 'iso3', 'lead_agency', 'level1', 'level2', 'focal_person', 'focal_phone', 'concern', 'category', 'severity', 'obtainable', 'responsible_agency'],
        items.flatMap((c) =>
          c.concerns.length
            ? c.concerns.map((k) => [c.name, c.iso3, c.leadAgency, c.level1Label, c.level2Label, c.focalPerson, c.focalPhone, k.title, k.category, k.severity, k.obtainable, k.responsibleAgency])
            : [[c.name, c.iso3, c.leadAgency, c.level1Label, c.level2Label, c.focalPerson, c.focalPhone, '', '', '', '', '']],
        ),
      ),
    );

  return (
    <div className="space-y-6">
      <section className="data-grid">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Globe2 className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Country Registry — add a deployment</h3>
          <button
            onClick={exportRegistry}
            className="ml-auto inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[10px] text-foreground hover:bg-secondary transition-colors"
          >
            <Download className="h-3 w-3" /> Export registry
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mb-3">
          Onboard a new national deployment into WAMHEWS, then log each concern and what the system makes
          obtainable for it. Currently live: {countries.map((c) => `${c.flag} ${c.shortName}`).join(' · ')}.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {(
            [
              ['name', 'Country name'],
              ['iso3', 'ISO code (e.g. SEN)'],
              ['flag', 'Flag emoji'],
              ['leadAgency', 'Lead agency'],
              ['level1Label', 'Level-1 boundary label'],
              ['level2Label', 'Level-2 boundary label'],
              ['focalPerson', 'National focal person'],
              ['focalPhone', 'Focal person phone'],
              ['languages', 'Warning languages'],
            ] as [keyof RegisteredCountry, string][]
          ).map(([key, label]) => (
            <input
              key={key}
              className={field}
              placeholder={label}
              value={String(draft[key] ?? '')}
              onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
            />
          ))}
          <textarea
            className={`${field} md:col-span-3`}
            rows={2}
            placeholder="Notes — mandate, data sharing agreement, coordination arrangements"
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          />
        </div>
        <button
          onClick={submitCountry}
          className="mt-3 inline-flex items-center gap-1 rounded bg-primary/25 border border-primary/40 px-3 py-1.5 text-[11px] text-foreground hover:bg-primary/35 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add country
        </button>
      </section>

      <section className="data-grid">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Existing deployments &amp; standing concerns</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
          {countries.map((c) => (
            <div key={c.code} className="rounded border border-border bg-secondary/40 p-2 text-[10px]">
              <p className="text-xs font-semibold text-foreground">
                {c.flag} {c.name}
              </p>
              <p className="text-muted-foreground">
                {c.systemAcronym} · Lead {c.leadAgency}
              </p>
              <p className="text-muted-foreground">
                {boundaryLabels[c.code].level1} / {boundaryLabels[c.code].level2}
              </p>
              <p className="text-muted-foreground">
                {c.agencies.length} agencies · {c.focalPersons.active.toLocaleString()} focal persons
              </p>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <p className="text-[11px] text-muted-foreground">No additional countries registered yet.</p>
        )}

        <div className="space-y-3">
          {items.map((c) => {
            const cd = newConcern(c.id);
            return (
              <div key={c.id} className="rounded-md border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-foreground">
                    {c.flag} {c.name} {c.iso3 && <span className="font-mono text-muted-foreground">({c.iso3})</span>}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Lead {c.leadAgency || '—'} · {c.level1Label} / {c.level2Label} · Focal {c.focalPerson || '—'}{' '}
                    {c.focalPhone}
                  </span>
                  <button
                    onClick={() => removeCountry(c.id)}
                    className="ml-auto inline-flex items-center gap-1 text-[10px] text-alert-red hover:underline"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
                {c.notes && <p className="text-[10px] text-muted-foreground mt-1">{c.notes}</p>}

                <div className="mt-2 space-y-1.5">
                  {c.concerns.map((k) => (
                    <div key={k.id} className="flex items-start gap-2 rounded border border-border bg-background/50 p-2">
                      <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border ${severityClass[k.severity]}`}>
                        {k.severity}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] text-foreground font-semibold">
                          {k.title} <span className="text-[10px] font-normal text-muted-foreground">· {k.category}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Obtainable: {k.obtainable || '—'}
                          {k.responsibleAgency && ` · ${k.responsibleAgency}`}
                        </p>
                      </div>
                      <button
                        onClick={() => removeConcern(c.id, k.id)}
                        className="ml-auto text-[10px] text-muted-foreground hover:text-alert-red"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-2 grid grid-cols-1 md:grid-cols-5 gap-2">
                  <input
                    className={field}
                    placeholder="Concern"
                    value={cd.title}
                    onChange={(e) => setConcernDraft({ ...concernDraft, [c.id]: { ...cd, title: e.target.value } })}
                  />
                  <select
                    className={field}
                    value={cd.category}
                    onChange={(e) =>
                      setConcernDraft({ ...concernDraft, [c.id]: { ...cd, category: e.target.value as CountryConcern['category'] } })
                    }
                  >
                    {concernCategories.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                  <select
                    className={field}
                    value={cd.severity}
                    onChange={(e) =>
                      setConcernDraft({ ...concernDraft, [c.id]: { ...cd, severity: e.target.value as CountryConcern['severity'] } })
                    }
                  >
                    {concernSeverities.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                  <input
                    className={field}
                    placeholder="What is obtainable in the system"
                    value={cd.obtainable}
                    onChange={(e) => setConcernDraft({ ...concernDraft, [c.id]: { ...cd, obtainable: e.target.value } })}
                  />
                  <div className="flex gap-2">
                    <input
                      className={field}
                      placeholder="Responsible agency"
                      value={cd.responsibleAgency}
                      onChange={(e) =>
                        setConcernDraft({ ...concernDraft, [c.id]: { ...cd, responsibleAgency: e.target.value } })
                      }
                    />
                    <button
                      onClick={() => {
                        if (!cd.title.trim()) return;
                        addConcern(c.id, { ...cd, id: uid() });
                        setConcernDraft({ ...concernDraft, [c.id]: { ...newConcern(c.id), id: uid(), title: '', obtainable: '' } });
                      }}
                      className="shrink-0 rounded bg-primary/25 border border-primary/40 px-2 text-[11px] text-foreground hover:bg-primary/35 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default CountryRegistryPanel;
