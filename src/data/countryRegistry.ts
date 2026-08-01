/**
 * Country registry — onboard a new national deployment and record every
 * concern ("what is obtainable") that WAMHEWS must cover for that country.
 * Persisted client-side so it survives reloads without a backend.
 */

const STORAGE_KEY = 'wamhews.countryRegistry';

export interface CountryConcern {
  id: string;
  /** Hazard / thematic concern, e.g. "Riverine flood" */
  title: string;
  category: 'hazard' | 'exposure' | 'capacity' | 'coordination' | 'data';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  /** What is obtainable in the system for this concern */
  obtainable: string;
  responsibleAgency: string;
}

export interface RegisteredCountry {
  id: string;
  name: string;
  iso3: string;
  flag: string;
  leadAgency: string;
  level1Label: string;
  level2Label: string;
  focalPerson: string;
  focalPhone: string;
  languages: string;
  notes: string;
  createdAt: string;
  concerns: CountryConcern[];
}

export const concernCategories: CountryConcern['category'][] = [
  'hazard',
  'exposure',
  'capacity',
  'coordination',
  'data',
];

export const concernSeverities: CountryConcern['severity'][] = ['low', 'moderate', 'high', 'critical'];

const isBrowser = () => typeof window !== 'undefined';

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export const subscribeRegistry = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const loadRegistry = (): RegisteredCountry[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RegisteredCountry[]) : [];
  } catch {
    return [];
  }
};

const persist = (items: RegisteredCountry[]) => {
  if (isBrowser()) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  notify();
};

export const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const saveCountry = (entry: RegisteredCountry) => {
  const items = loadRegistry();
  const idx = items.findIndex((c) => c.id === entry.id);
  if (idx >= 0) items[idx] = entry;
  else items.unshift(entry);
  persist(items);
};

export const removeCountry = (id: string) => persist(loadRegistry().filter((c) => c.id !== id));

export const addConcern = (countryId: string, concern: CountryConcern) => {
  const items = loadRegistry();
  const c = items.find((x) => x.id === countryId);
  if (!c) return;
  c.concerns = [concern, ...c.concerns];
  persist(items);
};

export const removeConcern = (countryId: string, concernId: string) => {
  const items = loadRegistry();
  const c = items.find((x) => x.id === countryId);
  if (!c) return;
  c.concerns = c.concerns.filter((x) => x.id !== concernId);
  persist(items);
};

export const emptyCountry = (): RegisteredCountry => ({
  id: uid(),
  name: '',
  iso3: '',
  flag: '',
  leadAgency: '',
  level1Label: 'Regions',
  level2Label: 'Districts',
  focalPerson: '',
  focalPhone: '',
  languages: '',
  notes: '',
  createdAt: new Date().toISOString(),
  concerns: [],
});
