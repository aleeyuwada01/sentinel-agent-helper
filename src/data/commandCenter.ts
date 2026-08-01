import type { HazardType } from './mockData';
import { getAgencyOverride, registerCacheReset } from './dataOverrides';
import { countries, getCountry, type CountryCode, type CountryProfile } from './westAfrica';
import { boundaryLabels, getSubRegions } from './adminBoundaries';

/* ------------------------------------------------------------ deterministic RNG */

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};
const unit = (s: string) => (hash(s) % 10000) / 10000;
const between = (s: string, min: number, max: number) => min + Math.floor(unit(s) * (max - min + 1));
const pick = <T>(s: string, arr: readonly T[]): T => arr[hash(s) % arr.length];

/* -------------------------------------------------------------- agency heads */

const heads: Record<CountryCode, readonly string[]> = {
  NG: [
    'Engr. Umar Ibrahim Mohammed',
    'Prof. Charles Anosike',
    'Mrs. Zubaida Umar',
    'Dr. Jide Idris',
    'Mallam Issa Abdullahi',
    'Dr. Olufemi Oke-Osanyintolu',
    'Barr. Ngozi Onwuachu',
    'Engr. Abdulganiyu Jaji',
  ],
  GH: [
    'Ing. Richard Amo Yartey',
    'Dr. Eric Asuman',
    'Major (Rtd) Kwesi Bonsu',
    'Dr. Franklin Asiedu-Bekoe',
    'Mrs. Kathleen Addy',
    'Mr. Seji Saji Amedonu',
    'Mr. Bright Amonoo',
    'DOI Julius A. Kuunuor',
  ],
  SL: [
    'Ing. Abdulai Kamara',
    'Mr. Gabriel Kpaka',
    'Mr. Lt. Gen. Brima Sesay',
    'Prof. Foday Sahr',
    'Mrs. Isatu Bangura',
    'Mr. Alusine Koroma',
    'Mr. Sorie Turay',
    'CFO Mohamed Conteh',
  ],
  CI: [
    'M. Kouassi N’Guessan',
    'M. Daouda Konaté',
    'Colonel-Major Yao Kouassi',
    'Prof. Mireille Dosso',
    'M. Brou Aka Pascal',
    'Mme. Adjoua Traoré',
    'M. Souleymane Bamba',
    'Colonel Konan Diarra',
  ],
};

const headTitles = [
  'Director-General',
  'Director-General',
  'Director-General',
  'Director-General',
  'Chairman',
  'National Coordinator',
  'National Coordinator',
  'Controller-General',
];

export interface AgencyHead {
  countryCode: CountryCode;
  countryName: string;
  flag: string;
  agencyCode: string;
  agencyName: string;
  agencyFullName: string;
  mandate: string;
  head: string;
  title: string;
  email: string;
  phone: string;
  /** Duty seat at the West Africa Central Command Center */
  deskSeat: string;
  isLeadAgency: boolean;
  onDuty: boolean;
  lastSitrep: string;
  activeAlerts: number;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z]/g, '');

export const agencyHeadsFor = (country: CountryProfile): AgencyHead[] =>
  country.agencies.map((a, i) => {
    const seed = `${country.code}-${a.code}`;
    const head = heads[country.code][i] ?? `${a.name} Head of Agency`;
    return {
      countryCode: country.code,
      countryName: country.shortName,
      flag: country.flag,
      agencyCode: a.code,
      agencyName: a.name,
      agencyFullName: a.fullName,
      mandate: a.role,
      head,
      title: headTitles[i] ?? 'Head of Agency',
      email: `${slug(head.split(' ').slice(-1)[0])}@${slug(a.code)}.${country.code.toLowerCase()}.wamhews.org`,
      phone: `+${between(`${seed}-cc`, 220, 234)} ${between(`${seed}-p1`, 700, 909)} ${between(`${seed}-p2`, 100000, 999999)}`,
      deskSeat: `${country.code}-${String(i + 1).padStart(2, '0')}`,
      isLeadAgency: a.name === country.leadAgency || a.code === country.leadAgency,
      onDuty: unit(`${seed}-duty`) > 0.25,
      lastSitrep: `${between(`${seed}-sit`, 1, 22)}h ago`,
      activeAlerts: a.activeAlerts,
    };
  });

export const allAgencyHeads = (): AgencyHead[] => countries.flatMap(agencyHeadsFor);

/* ------------------------------------------------- per-agency panel mock data */

export interface AgencyPanel {
  agencyCode: string;
  agencyName: string;
  title: string;
  archetype: string;
  hazard: HazardType;
  kpis: { label: string; value: string }[];
  columns: string[];
  rows: { cells: string[]; status: 'Normal' | 'Watch' | 'Alert' }[];
  note: string;
}

interface Archetype {
  key: string;
  hazard: HazardType;
  title: string;
  kpiLabels: [string, string, string];
  columns: string[];
  note: string;
  row: (ctx: { seed: string; place: string; parent: string; l2: string }) => string[];
  statusBias: number;
}

const archetypes: Archetype[] = [
  {
    key: 'hydrology',
    hazard: 'flood',
    title: 'Hydrological Monitoring Feed',
    kpiLabels: ['Gauges reporting', 'Basins above alert', 'Forecast lead time'],
    columns: ['Gauge station', 'Basin', 'River level', 'Alert level', 'Trend'],
    note: 'River gauge telemetry compared against basin-specific alert thresholds.',
    statusBias: 0.45,
    row: ({ seed, place, parent }) => [
      `${place} Gauge`,
      parent,
      `${(between(seed, 40, 118) / 10).toFixed(1)} m`,
      `${(between(`${seed}t`, 70, 120) / 10).toFixed(1)} m`,
      pick(`${seed}-tr`, ['Rising', 'Falling', 'Steady']),
    ],
  },
  {
    key: 'meteorology',
    hazard: 'heatwave',
    title: 'Meteorological Observation Feed',
    kpiLabels: ['Synoptic stations', 'Heat advisories', 'Forecast skill'],
    columns: ['Synoptic station', 'Area', 'Temp', 'Heat index', 'Rain (24h)'],
    note: 'Synoptic observations feeding heatwave, dry-spell and rainfall advisories.',
    statusBias: 0.5,
    row: ({ seed, place, parent }) => [
      place,
      parent,
      `${(between(seed, 280, 445) / 10).toFixed(1)} °C`,
      `${between(`${seed}h`, 32, 50)} °C`,
      `${between(`${seed}r`, 0, 140)} mm`,
    ],
  },
  {
    key: 'response',
    hazard: 'flood',
    title: 'Emergency Response Operations',
    kpiLabels: ['Open operations', 'Relief camps', 'Households assisted'],
    columns: ['Operation', 'Area', 'Teams', 'Households assisted', 'Phase'],
    note: 'Live response operations, camp management and relief distribution status.',
    statusBias: 0.55,
    row: ({ seed, place, parent }) => [
      `OP-${between(seed, 100, 999)} ${place}`,
      parent,
      `${between(`${seed}t`, 2, 18)}`,
      `${between(`${seed}h`, 240, 9800).toLocaleString()}`,
      pick(`${seed}-ph`, ['Alerting', 'Evacuation', 'Relief', 'Recovery']),
    ],
  },
  {
    key: 'health',
    hazard: 'epidemic',
    title: 'Epidemic Surveillance Feed',
    kpiLabels: ['Sentinel sites', 'Signals above threshold', 'Median verification'],
    columns: ['Sentinel site', 'Area', 'Disease', 'Cases (wk)', 'Threshold'],
    note: 'Sentinel site case counts against weekly epidemic thresholds.',
    statusBias: 0.45,
    row: ({ seed, place, parent }) => [
      `${place} Sentinel`,
      parent,
      pick(`${seed}-d`, ['Cholera', 'Lassa fever', 'Measles', 'Meningitis', 'Diphtheria', 'Yellow fever']),
      `${between(seed, 8, 240)}`,
      `${between(`${seed}t`, 25, 120)}`,
    ],
  },
  {
    key: 'civic',
    hazard: 'drought',
    title: 'Public Awareness & Sensitization',
    kpiLabels: ['Campaigns running', 'Languages', 'Estimated reach'],
    columns: ['Campaign', 'Area', 'Channel', 'Language', 'Reach'],
    note: 'Community sensitization campaigns and warning comprehension drives.',
    statusBias: 0.75,
    row: ({ seed, place, parent }) => [
      `${pick(`${seed}-c`, ['Flood-ready', 'Heat-safe', 'Clean water', 'Fire-safe', 'Early action'])} — ${place}`,
      parent,
      pick(`${seed}-ch`, ['Community radio', 'Town criers', 'SMS cascade', 'Market outreach', 'School drives']),
      pick(`${seed}-l`, ['Local', 'National', 'Bilingual']),
      `${between(seed, 4, 320).toLocaleString()}k`,
    ],
  },
  {
    key: 'regional',
    hazard: 'flood',
    title: 'Sub-national Coordination Desk',
    kpiLabels: ['Desks reporting', 'Escalations open', 'Avg. ack time'],
    columns: ['Coordination desk', 'Area', 'Alerts relayed', 'Escalations', 'Ack time'],
    note: 'First-level administrative coordination desks relaying national warnings.',
    statusBias: 0.6,
    row: ({ seed, place, parent }) => [
      `${parent} Desk`,
      place,
      `${between(seed, 3, 48)}`,
      `${between(`${seed}e`, 0, 9)}`,
      `${between(`${seed}a`, 4, 90)} min`,
    ],
  },
  {
    key: 'district',
    hazard: 'flood',
    title: 'Local Response & Community Liaison',
    kpiLabels: ['Units reporting', 'Focal persons active', 'Households reached'],
    columns: ['Local unit', 'Parent area', 'Focal person', 'Households reached', 'Last report'],
    note: 'Second-level administrative units and the focal persons reporting from them.',
    statusBias: 0.65,
    row: ({ seed, place, parent }) => [
      place,
      parent,
      `FP-${between(seed, 1000, 9999)}`,
      `${between(`${seed}h`, 120, 6400).toLocaleString()}`,
      `${between(`${seed}l`, 1, 36)}h ago`,
    ],
  },
  {
    key: 'fire',
    hazard: 'fire',
    title: 'Fire Risk & Suppression Grid',
    kpiLabels: ['Zones monitored', 'Critical zones', 'Appliances available'],
    columns: ['Zone', 'Area', 'Risk index', 'Threshold', 'Appliances'],
    note: 'Zone-based fire risk index derived from load, humidity and vegetation dryness.',
    statusBias: 0.4,
    row: ({ seed, place, parent }) => [
      `${place} ${pick(`${seed}-z`, ['Market', 'Settlement', 'Depot', 'Reserve', 'Industrial Zone'])}`,
      parent,
      `${between(seed, 28, 96)} idx`,
      '70 idx',
      `${between(`${seed}a`, 1, 14)}`,
    ],
  },
];

const statusFor = (seed: string, bias: number): 'Normal' | 'Watch' | 'Alert' => {
  const u = unit(seed);
  if (u > bias + 0.3) return 'Alert';
  if (u > bias) return 'Watch';
  return 'Normal';
};

const panelCache = new Map<CountryCode, AgencyPanel[]>();

/** Consistent per-agency panel data for any country. */
export const agencyPanelsFor = (code: CountryCode): AgencyPanel[] => {
  const imported = getAgencyOverride(code);
  if (imported?.length) return imported;
  const cached = panelCache.get(code);
  if (cached) return cached;
  const country = getCountry(code);
  const labels = boundaryLabels[code];
  const subs = getSubRegions(code);

  const panels = country.agencies.map((a, i) => {
    const arche = archetypes[i % archetypes.length];
    const seedBase = `${code}-${a.code}-${arche.key}`;
    const picked = [...subs]
      .sort((x, y) => y.risk[arche.hazard] - x.risk[arche.hazard])
      .slice(0, 6);

    return {
      agencyCode: a.code,
      agencyName: a.name,
      title: `${a.name} — ${arche.title}`,
      archetype: arche.key,
      hazard: arche.hazard,
      kpis: [
        { label: arche.kpiLabels[0], value: `${between(`${seedBase}-k1`, 18, 240)}` },
        { label: arche.kpiLabels[1], value: `${between(`${seedBase}-k2`, 1, 22)}` },
        {
          label: arche.kpiLabels[2],
          value:
            arche.key === 'civic'
              ? `${between(`${seedBase}-k3`, 40, 900).toLocaleString()}k`
              : arche.key === 'meteorology'
                ? `${between(`${seedBase}-k3`, 68, 94)} %`
                : `${between(`${seedBase}-k3`, 6, 72)} h`,
        },
      ],
      columns: arche.columns,
      rows: picked.map((s) => {
        const seed = `${seedBase}-${s.name}`;
        return {
          cells: arche.row({ seed, place: s.name, parent: s.parent, l2: labels.level2Singular }),
          status: statusFor(`${seed}-st`, arche.statusBias),
        };
      }),
      note: arche.note,
    };
  });

  panelCache.set(code, panels);
  return panels;
};

export const agencyPanelFor = (code: CountryCode, agencyCode: string) =>
  agencyPanelsFor(code).find((p) => p.agencyCode.toUpperCase() === agencyCode.toUpperCase());

registerCacheReset(() => {
  panelCache.clear();
});
