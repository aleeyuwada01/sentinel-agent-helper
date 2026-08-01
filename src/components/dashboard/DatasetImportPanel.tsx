import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { CloudDownload, Database, FileUp, Link2, RotateCcw, ShieldAlert } from 'lucide-react';
import {
  clearDataset,
  csvTemplates,
  datasetMeta,
  importCsvText,
  importFromApi,
  type DatasetKind,
} from '@/data/dataOverrides';
import { downloadBlob } from '@/lib/csv';
import { canImportCountry, allowedCountries } from '@/data/accessControl';
import { countries, type CountryCode } from '@/data/westAfrica';
import { useAuth } from '@/hooks/useAuth';
import { useDataVersion } from '@/hooks/useDataVersion';

const kinds: { id: DatasetKind; label: string; hint: string }[] = [
  { id: 'incidents', label: 'Incidents', hint: 'Alert events, causes, households reached' },
  { id: 'boundaries', label: 'Boundaries', hint: 'Level-1 / level-2 units, risk & focal persons' },
  { id: 'agencies', label: 'Agency panels', hint: 'Per-agency KPI + table feeds' },
];

/** CSV / API importer that replaces the generated mock datasets per country. */
const DatasetImportPanel = () => {
  const { scope } = useAuth();
  const dataVersion = useDataVersion();
  const fileRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(() => allowedCountries(scope), [scope]);
  const [kind, setKind] = useState<DatasetKind>('incidents');
  const [code, setCode] = useState<CountryCode>(visible[0] ?? 'NG');
  const [apiUrl, setApiUrl] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);

  const meta = useMemo(() => datasetMeta(), [dataVersion]);
  const allowed = canImportCountry(scope, code);

  const report = (r: { imported: number; skipped: number; errors: string[] }, source: string) => {
    if (!r.imported) {
      toast.error('Nothing imported', { description: r.errors[0] ?? 'No matching rows in the dataset.' });
      return;
    }
    toast.success(`${r.imported} rows imported`, {
      description: `${kind} · ${code} · from ${source}${r.errors.length ? ` — ${r.errors.length} rows rejected` : ''}`,
    });
  };

  const onFile = async (file: File) => {
    setBusy(true);
    try {
      const text = await file.text();
      report(importCsvText(kind, code, text, file.name), file.name);
    } catch (e) {
      toast.error('Import failed', { description: (e as Error).message });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onApi = async () => {
    if (!apiUrl.trim()) return toast.error('Enter an endpoint URL');
    setBusy(true);
    try {
      report(await importFromApi(kind, code, apiUrl.trim(), token.trim() || undefined), 'API');
    } catch (e) {
      toast.error('API import failed', { description: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  if (!canImportCountry(scope, visible[0] ?? 'NG') && !allowed) {
    return (
      <section className="data-grid">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldAlert className="h-4 w-4 text-alert-orange" />
          Dataset import is restricted to national and regional administrators.
        </div>
      </section>
    );
  }

  return (
    <section className="data-grid space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Database className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm text-foreground">Real dataset import (CSV / API)</h3>
        <span className="text-[10px] font-mono text-muted-foreground">
          overrides generated data per country
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="inline-flex rounded border border-border bg-secondary/40 p-0.5 text-[11px]">
          {kinds.map((k) => (
            <button
              key={k.id}
              onClick={() => setKind(k.id)}
              className={`px-3 py-1.5 rounded transition-colors ${
                kind === k.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
        <select
          value={code}
          onChange={(e) => setCode(e.target.value as CountryCode)}
          className="rounded border border-border bg-secondary/40 px-2 py-1.5 text-[11px] text-foreground outline-none"
          aria-label="Target country"
        >
          {countries
            .filter((c) => visible.includes(c.code))
            .map((c) => (
              <option key={c.code} value={c.code} className="bg-card">
                {c.flag} {c.shortName}
              </option>
            ))}
        </select>
        <button
          onClick={() => downloadBlob(`wamhews-${kind}-template.csv`, 'text/csv', csvTemplates[kind])}
          className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-[11px] text-foreground hover:bg-secondary transition-colors"
        >
          <CloudDownload className="h-3.5 w-3.5" /> CSV template
        </button>
      </div>

      <p className="text-[10px] text-muted-foreground">{kinds.find((k) => k.id === kind)?.hint}</p>

      {!allowed ? (
        <p className="text-[11px] text-alert-orange">You may not import data for this deployment.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-secondary/20 p-5 cursor-pointer hover:bg-secondary/40 transition-colors">
            <FileUp className="h-5 w-5 text-primary" />
            <span className="text-[11px] font-medium text-foreground">Upload CSV file</span>
            <span className="text-[10px] text-muted-foreground">Rows are matched to {code} on the country column</span>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              disabled={busy}
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </label>

          <div className="rounded-lg border border-border bg-secondary/20 p-3 space-y-2">
            <p className="text-[11px] font-medium text-foreground flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5 text-primary" /> Pull from API endpoint
            </p>
            <input
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.agency.gov.ng/incidents"
              className="w-full rounded border border-border bg-background px-2 py-1.5 text-[11px] text-foreground outline-none focus:border-primary"
            />
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Bearer token (optional)"
              type="password"
              className="w-full rounded border border-border bg-background px-2 py-1.5 text-[11px] text-foreground outline-none focus:border-primary"
            />
            <button
              onClick={onApi}
              disabled={busy}
              className="w-full rounded bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {busy ? 'Importing…' : 'Fetch & replace'}
            </button>
            <p className="text-[10px] text-muted-foreground">Accepts a JSON array or CSV body with the template columns.</p>
          </div>
        </div>
      )}

      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Active imports</p>
        {meta.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">
            No imports yet — every country is running on generated reference data.
          </p>
        ) : (
          <div className="space-y-1">
            {meta.map((m) => (
              <div
                key={`${m.kind}-${m.countryCode}`}
                className="flex items-center gap-2 rounded border border-border bg-card px-2 py-1.5 text-[11px]"
              >
                <span className="font-mono text-foreground">
                  {countries.find((c) => c.code === m.countryCode)?.flag} {m.countryCode}
                </span>
                <span className="text-foreground capitalize">{m.kind}</span>
                <span className="text-muted-foreground">
                  {m.rowCount} rows · {m.source} · {new Date(m.importedAt).toLocaleString()}
                </span>
                <button
                  onClick={() => {
                    clearDataset(m.kind, m.countryCode);
                    toast.success('Import removed', { description: 'Reverted to reference data.' });
                  }}
                  className="ml-auto inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3" /> Revert
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DatasetImportPanel;
