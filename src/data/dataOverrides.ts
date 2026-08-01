/**
 * Client-side dataset override layer.
 *
 * Real datasets imported from CSV or an API endpoint are stored per country and
 * per dataset kind in localStorage. The generated mock data is used only where
 * no import exists, so a country can be switched over to real data incrementally.
 *
 * This module must not import runtime values from `adminBoundaries` /
 * `commandCenter` (they import from here) — types only.
 */

import { parseCsv, num, type CsvRow } from '@/lib/csv';
import type { CountryCode } from './westAfrica';
import type { HazardType } from './mockData';
import type { FocalPersonContact, Incident, SubRegion } from './adminBoundaries';
import type { AgencyPanel } from './commandCenter';

export type DatasetKind = 'boundaries' | 'incidents' | 'agencies';

export interface DatasetMeta {
  kind: DatasetKind;
  countryCode: CountryCode;
  rowCount: number;
  source: string;
  importedAt: string;
}

interface StoreShape {
  boundaries: Partial<Record<CountryCode, SubRegion[]>>;
  incidents: Partial<Record<CountryCode, Incident[]>>;
  agencies: Partial<Record<CountryCode, AgencyPanel[]>>;
  meta: DatasetMeta[];
}

const STORAGE_KEY = 'wamhews.datasets.v1';

const empty = (): StoreShape => ({ boundaries: {}, incidents: {}, agencies: {}, meta: [] });

let store: StoreShape = empty();
let hydrated = false;
let version = 0;

const listeners = new Set<() => void>();
const cacheResets = new Set<() => void>();

/** Data modules register a callback so their memo caches drop when imports change. */
export const registerCacheReset = (fn: () => void) => {
  cacheResets.add(fn);
};

const notify = () => {
  version++;
  cacheResets.forEach((fn) => fn());
  listeners.forEach((fn) => fn());
};

export const subscribeDatasets = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const datasetVersion = () => version;

/** Load persisted imports. Safe to call repeatedly; no-op on the server. */
export const hydrateDatasets = () => {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoreShape;
      store = { ...empty(), ...parsed };
      if (store.meta.length) notify();
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
};

const persist = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota — keep in-memory only */
  }
};

/* ------------------------------------------------------------------ accessors */

export const getBoundaryOverride = (code: CountryCode) => store.boundaries[code];
export const getIncidentOverride = (code: CountryCode) => store.incidents[code];
export const getAgencyOverride = (code: CountryCode) => store.agencies[code];
export const datasetMeta = (): DatasetMeta[] => store.meta;
export const metaFor = (kind: DatasetKind, code: CountryCode) =>
  store.meta.find((m) => m.kind === kind && m.countryCode === code);

const setMeta = (meta: DatasetMeta) => {
  store.meta = [...store.meta.filter((m) => !(m.kind === meta.kind && m.countryCode === meta.countryCode)), meta];
};

export const clearDataset = (kind: DatasetKind, code: CountryCode) => {
  delete (store[kind] as Record<string, unknown>)[code];
  store.meta = store.meta.filter((m) => !(m.kind === kind && m.countryCode === code));
  persist();
  notify();
};

export const clearAllDatasets = () => {
  store = empty();
  persist();
  notify();
};

/* -------------------------------------------------------------------- mapping */

export interface ImportResult {
  kind: DatasetKind;
  countryCode: CountryCode;
  imported: number;
  skipped: number;
  errors: string[];
}

const hazards: HazardType[] = ['flood', 'drought', 'epidemic', 'heatwave', 'fire'];

const asHazard = (v: string, fallback: HazardType = 'flood'): HazardType =>
  (hazards.includes(v.toLowerCase() as HazardType) ? (v.toLowerCase() as HazardType) : fallback);

const focalFrom = (r: CsvRow, fallbackAgency: string): FocalPersonContact => ({
  name: r.focal_name || r.focal_person || 'Unassigned',
  role: r.focal_role || 'Community Focal Person',
  phone: r.focal_phone || '—',
  agency: r.focal_agency || fallbackAgency,
  trainedOn: r.focal_trained_on || '—',
  lastReport: r.focal_last_report || '—',
});

const splitList = (v: string | undefined) =>
  (v ?? '')
    .split(/[|;]/)
    .map((s) => s.trim())
    .filter(Boolean);

/** CSV columns: country,level1,level2,population,households,households_reached,level3_count,risk_* ,focal_* */
const mapBoundaries = (rows: CsvRow[], code: CountryCode, errors: string[]): SubRegion[] => {
  const perParent = new Map<string, number>();
  const out: SubRegion[] = [];

  rows.forEach((r, i) => {
    const parent = r.level1 || r.state || r.region || r.district || r.parent;
    const name = r.level2 || r.lga || r.chiefdom || r.commune || r.name;
    if (!parent || !name) {
      errors.push(`Row ${i + 2}: missing level1/level2`);
      return;
    }
    const idx = perParent.get(parent) ?? 0;
    perParent.set(parent, idx + 1);

    const risk = hazards.reduce(
      (acc, h) => {
        acc[h] = Math.max(0, Math.min(100, num(r[`risk_${h}`], 0)));
        return acc;
      },
      {} as Record<HazardType, number>,
    );
    const population = num(r.population);
    const households = num(r.households, Math.round(population / 6));
    const dominantHazard = hazards.reduce((a, b) => (risk[b] > risk[a] ? b : a), 'flood' as HazardType);

    out.push({
      name,
      parent,
      countryCode: code,
      gx: idx % 2,
      gy: Math.floor(idx / 2),
      risk,
      population,
      households,
      householdsReached: num(r.households_reached, Math.round(households * 0.5)),
      level3Count: num(r.level3_count, 0),
      focalPerson: focalFrom(r, r.agency || 'National agency'),
      dominantHazard,
    });
  });
  return out;
};

/** CSV columns: country,incident_id,hazard,level1,level2,title,cause,parameter,reading,threshold,agency,alert_level,occurred_at,households_*,people_affected,displaced,channels,status,response_note,focal_* */
const mapIncidents = (rows: CsvRow[], code: CountryCode, errors: string[]): Incident[] => {
  const out: Incident[] = [];
  rows.forEach((r, i) => {
    const level2 = r.level2 || r.lga || r.chiefdom || r.commune;
    if (!level2) {
      errors.push(`Row ${i + 2}: missing level2`);
      return;
    }
    const occurred = r.occurred_at || r.date || '';
    const ts = occurred ? new Date(occurred) : new Date();
    if (Number.isNaN(ts.getTime())) {
      errors.push(`Row ${i + 2}: invalid occurred_at "${occurred}"`);
      return;
    }
    const hazard = asHazard(r.hazard || '');
    const alert = ['yellow', 'orange', 'red'].includes((r.alert_level || '').toLowerCase())
      ? (r.alert_level.toLowerCase() as Incident['alertLevel'])
      : 'yellow';
    const status = ['active', 'monitoring', 'closed'].includes((r.status || '').toLowerCase())
      ? (r.status.toLowerCase() as Incident['status'])
      : 'monitoring';
    const targeted = num(r.households_targeted);

    out.push({
      id: r.incident_id || r.id || `${code}-IMP-${1000 + i}`,
      countryCode: code,
      hazard,
      level1: r.level1 || r.parent || '—',
      level2,
      title: r.title || `${hazard} event — ${level2}`,
      cause: r.cause || 'Imported record — cause not supplied',
      parameter: r.parameter || '—',
      reading: r.reading || '—',
      threshold: r.threshold || '—',
      agency: r.agency || '—',
      alertLevel: alert,
      occurredAt: ts.toISOString(),
      householdsTargeted: targeted,
      householdsReached: num(r.households_reached),
      peopleAffected: num(r.people_affected),
      displaced: num(r.displaced),
      channels: splitList(r.channels),
      focalPerson: focalFrom(r, r.agency || '—'),
      responseNote: r.response_note || '—',
      status,
    });
  });
  return out.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
};

/** CSV columns: country,agency_code,agency_name,panel_title,note,kpi_labels,kpi_values,columns,cells,status,hazard */
const mapAgencies = (rows: CsvRow[], errors: string[]): AgencyPanel[] => {
  const byAgency = new Map<string, AgencyPanel>();
  rows.forEach((r, i) => {
    const agencyCode = (r.agency_code || '').toUpperCase();
    if (!agencyCode) {
      errors.push(`Row ${i + 2}: missing agency_code`);
      return;
    }
    let panel = byAgency.get(agencyCode);
    if (!panel) {
      const labels = splitList(r.kpi_labels);
      const values = splitList(r.kpi_values);
      panel = {
        agencyCode,
        agencyName: r.agency_name || agencyCode,
        title: r.panel_title || `${r.agency_name || agencyCode} — Imported Feed`,
        archetype: 'imported',
        hazard: asHazard(r.hazard || ''),
        kpis: labels.map((l, k) => ({ label: l, value: values[k] ?? '—' })),
        columns: splitList(r.columns),
        rows: [],
        note: r.note || 'Imported dataset.',
      } as AgencyPanel;
      byAgency.set(agencyCode, panel);
    }
    const cells = splitList(r.cells);
    if (cells.length) {
      const st = (r.status || 'Normal') as AgencyPanel['rows'][number]['status'];
      panel.rows.push({ cells, status: ['Normal', 'Watch', 'Alert'].includes(st) ? st : 'Normal' });
    }
  });
  return [...byAgency.values()];
};

/* ------------------------------------------------------------------- ingestion */

export const importRows = (
  kind: DatasetKind,
  code: CountryCode,
  rows: CsvRow[],
  source: string,
): ImportResult => {
  const errors: string[] = [];
  const scoped = rows.filter((r) => !r.country || r.country.toUpperCase() === code);
  let imported = 0;

  if (kind === 'boundaries') {
    const mapped = mapBoundaries(scoped, code, errors);
    store.boundaries[code] = mapped;
    imported = mapped.length;
  } else if (kind === 'incidents') {
    const mapped = mapIncidents(scoped, code, errors);
    store.incidents[code] = mapped;
    imported = mapped.length;
  } else {
    const mapped = mapAgencies(scoped, errors);
    store.agencies[code] = mapped;
    imported = mapped.length;
  }

  setMeta({ kind, countryCode: code, rowCount: imported, source, importedAt: new Date().toISOString() });
  persist();
  notify();

  return { kind, countryCode: code, imported, skipped: rows.length - imported, errors: errors.slice(0, 8) };
};

export const importCsvText = (kind: DatasetKind, code: CountryCode, text: string, source: string) =>
  importRows(kind, code, parseCsv(text).rows, source);

/** Fetch a remote endpoint that returns either JSON (array / {data:[]}) or CSV. */
export const importFromApi = async (
  kind: DatasetKind,
  code: CountryCode,
  url: string,
  token?: string,
): Promise<ImportResult> => {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`Endpoint responded ${res.status} ${res.statusText}`);
  const text = await res.text();
  const looksJson = text.trim().startsWith('[') || text.trim().startsWith('{');
  if (looksJson) {
    const json = JSON.parse(text);
    const arr: unknown[] = Array.isArray(json) ? json : (json.data ?? json.rows ?? []);
    const rows: CsvRow[] = arr.map((o) => {
      const rec: CsvRow = {};
      Object.entries(o as Record<string, unknown>).forEach(([k, v]) => {
        rec[k.toLowerCase().replace(/\s+/g, '_')] = v === null || v === undefined ? '' : String(v);
      });
      return rec;
    });
    return importRows(kind, code, rows, url);
  }
  return importCsvText(kind, code, text, url);
};

/* ------------------------------------------------------------------- templates */

export const csvTemplates: Record<DatasetKind, string> = {
  boundaries:
    'country,level1,level2,population,households,households_reached,level3_count,risk_flood,risk_drought,risk_epidemic,risk_heatwave,risk_fire,focal_name,focal_role,focal_phone,focal_agency,focal_trained_on,focal_last_report\n' +
    'NG,Kogi,Lokoja,412000,68000,41000,14,88,32,54,61,44,Amina Abubakar,Community Focal Person,+234 803 1122 334,NEMA,Mar 2025,6h ago',
  incidents:
    'country,incident_id,hazard,level1,level2,title,cause,parameter,reading,threshold,agency,alert_level,occurred_at,households_targeted,households_reached,people_affected,displaced,channels,status,response_note,focal_name,focal_phone\n' +
    'NG,NG-INC-2001,flood,Kogi,Lokoja,Flood emergency — Lokoja,Dam spillage upstream,River level,10.4 m,8.5 m,NIHSA,red,2026-07-27T06:00:00Z,68000,41000,120000,8200,SMS cascade|Community radio,active,Evacuation to high-ground shelters,Amina Abubakar,+234 803 1122 334',
  agencies:
    'country,agency_code,agency_name,panel_title,note,hazard,kpi_labels,kpi_values,columns,cells,status\n' +
    'NG,NIHSA,Nigeria Hydrological Services Agency,NIHSA — Hydrological Monitoring,River gauge telemetry,flood,Gauges reporting|Basins above alert|Lead time,142|6|48 h,Gauge station|Basin|River level|Alert level|Trend,Lokoja Gauge|Niger-Benue|10.4 m|8.5 m|Rising,Alert',
};
