import type { HazardType } from './mockData';
import { getBoundaryOverride, getIncidentOverride, registerCacheReset } from './dataOverrides';
import { countries, getCountry, type CountryCode, type CountryProfile, type CountryRegion } from './westAfrica';

/* ------------------------------------------------------------ deterministic RNG */

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};
const unit = (s: string) => (hash(s) % 10000) / 10000;
const between = (s: string, min: number, max: number) => min + Math.floor(unit(s) * (max - min + 1));
const pick = <T>(s: string, arr: readonly T[]): T => arr[hash(s) % arr.length];
const clamp = (n: number, min = 4, max = 98) => Math.max(min, Math.min(max, Math.round(n)));

/* ------------------------------------------------------- administrative labels */

export interface BoundaryLabels {
  /** First-level admin boundary (states / regions / districts) */
  level1: string;
  level1Singular: string;
  /** Second-level admin boundary (LGAs / districts / chiefdoms / communes) */
  level2: string;
  level2Singular: string;
  /** Smallest reporting unit used for community warning dissemination */
  level3: string;
}

export const boundaryLabels: Record<CountryCode, BoundaryLabels> = {
  NG: { level1: 'States', level1Singular: 'State', level2: 'LGAs', level2Singular: 'LGA', level3: 'Wards' },
  GH: { level1: 'Regions', level1Singular: 'Region', level2: 'Districts', level2Singular: 'District', level3: 'Electoral Areas' },
  SL: { level1: 'Districts', level1Singular: 'District', level2: 'Chiefdoms', level2Singular: 'Chiefdom', level3: 'Sections' },
  CI: { level1: 'Districts', level1Singular: 'District', level2: 'Communes', level2Singular: 'Commune', level3: 'Quartiers' },
};

/* ------------------------------------------------ level-2 naming per country */

const suffixes: Record<CountryCode, readonly string[]> = {
  NG: ['North', 'South', 'East', 'West', 'Central', 'Municipal', 'North-East', 'South-West'],
  GH: ['Municipal', 'North', 'South', 'East', 'West', 'Central'],
  SL: ['Central', 'East', 'West', 'North', 'South', 'Rural'],
  CI: ['Nord', 'Sud', 'Est', 'Ouest', 'Centre', 'Commune'],
};

/** Real level-2 names for the highest profile level-1 units. */
const namedUnits: Record<string, readonly string[]> = {
  'NG:Kogi': ['Lokoja', 'Ibaji', 'Idah', 'Bassa', 'Koton Karfe'],
  'NG:Lagos': ['Ikeja', 'Eti-Osa', 'Ajeromi-Ifelodun', 'Kosofe', 'Alimosho', 'Lagos Island'],
  'NG:Benue': ['Makurdi', 'Guma', 'Logo', 'Agatu', 'Gwer West'],
  'NG:Borno': ['Maiduguri', 'Konduga', 'Bama', 'Dikwa', 'Monguno'],
  'NG:Kano': ['Nassarawa', 'Fagge', 'Dala', 'Gwale', 'Tarauni'],
  'NG:Anambra': ['Ogbaru', 'Anambra East', 'Ayamelum', 'Onitsha North', 'Awka South'],
  'NG:Rivers': ['Port Harcourt', 'Ahoada East', 'Ogba/Egbema', 'Okrika', 'Degema'],
  'NG:Adamawa': ['Yola North', 'Numan', 'Lamurde', 'Demsa', 'Fufore'],
  'GH:Greater Accra': ['Accra Metropolitan', 'Ga East', 'Ga South', 'Ledzokuku', 'Tema Metropolitan'],
  'GH:Upper East': ['Bawku West', 'Bolgatanga', 'Kassena-Nankana', 'Talensi', 'Builsa North'],
  'GH:Northern': ['Tamale Metropolitan', 'Savelugu', 'Kumbungu', 'Tolon', 'Karaga'],
  'GH:Ashanti': ['Kumasi Metropolitan', 'Obuasi', 'Ejisu', 'Asokore Mampong', 'Bekwai'],
  'GH:Volta': ['Ketu South', 'Keta', 'Ho Municipal', 'North Tongu', 'South Tongu'],
  'SL:Western Area Urban': ['Central I', 'East II', 'East III', 'Kroo Bay', "Susan's Bay"],
  'SL:Western Area Rural': ['Waterloo Rural', 'Mountain Rural', 'Koya', 'York Rural'],
  'SL:Bo': ['Kakua', 'Valunia', 'Tikonko', 'Badjia', 'Jaiama Bongor'],
  'SL:Kenema': ['Nongowa', 'Lower Bambara', 'Small Bo', 'Dama', 'Gorama Mende'],
  'SL:Port Loko': ['Kaffu Bullom', 'Maforki', 'Lokomasama', 'Marampa', 'Buya Romende'],
  'CI:Abidjan': ['Abobo', 'Adjamé', 'Cocody', 'Yopougon', 'Koumassi', 'Port-Bouët'],
  'CI:Savanes': ['Korhogo', 'Ferkessédougou', 'Boundiali', 'Tengréla', 'Sinématiali'],
  'CI:Comoé': ['Abengourou', 'Aboisso', 'Adiaké', 'Agnibilékrou'],
  'CI:Lacs': ['Yamoussoukro', 'Dimbokro', 'Toumodi', 'Bocanda'],
};

/* ------------------------------------------------------------- focal persons */

const firstNames: Record<CountryCode, readonly string[]> = {
  NG: ['Amina', 'Chukwuemeka', 'Ibrahim', 'Ngozi', 'Yusuf', 'Folake', 'Suleiman', 'Chinelo', 'Musa', 'Blessing'],
  GH: ['Kwabena', 'Akosua', 'Yaw', 'Abena', 'Kofi', 'Adjoa', 'Mahama', 'Efua', 'Nii', 'Ama'],
  SL: ['Mohamed', 'Isatu', 'Alusine', 'Fatmata', 'Sorie', 'Mariama', 'Abu', 'Kadiatu', 'Santigie', 'Hawa'],
  CI: ['Konan', 'Aya', 'Kouassi', 'Fatoumata', 'Yao', 'Adjoua', 'Souleymane', 'Mariam', 'Brou', 'Affoué'],
};
const lastNames: Record<CountryCode, readonly string[]> = {
  NG: ['Abubakar', 'Okonkwo', 'Adeyemi', 'Bello', 'Eze', 'Danjuma', 'Oyelaran', 'Umar', 'Nwachukwu', 'Lawal'],
  GH: ['Mensah', 'Boateng', 'Asante', 'Owusu', 'Adjei', 'Tetteh', 'Amoah', 'Danquah', 'Quartey', 'Agyeman'],
  SL: ['Kamara', 'Sesay', 'Conteh', 'Bangura', 'Koroma', 'Turay', 'Jalloh', 'Mansaray', 'Fofanah', 'Kargbo'],
  CI: ['Koné', 'Kouadio', 'Traoré', 'Bamba', "N'Guessan", 'Coulibaly', 'Yao', 'Diarra', 'Aka', 'Ouattara'],
};

const focalRoles = [
  'Community Focal Person',
  'Ward Warning Officer',
  'Volunteer Team Lead',
  'Local Response Coordinator',
];

export interface FocalPersonContact {
  name: string;
  role: string;
  phone: string;
  agency: string;
  trainedOn: string;
  lastReport: string;
}

const makeFocalPerson = (code: CountryCode, seed: string, agency: string): FocalPersonContact => ({
  name: `${pick(`${seed}-fn`, firstNames[code])} ${pick(`${seed}-ln`, lastNames[code])}`,
  role: pick(`${seed}-role`, focalRoles),
  phone: `+${between(`${seed}-cc`, 220, 234)} ${between(`${seed}-p1`, 700, 909)} ${between(`${seed}-p2`, 1000, 9999)} ${between(`${seed}-p3`, 100, 999)}`,
  agency,
  trainedOn: `${pick(`${seed}-tm`, ['Jan', 'Mar', 'Apr', 'Jun', 'Aug', 'Nov'])} ${between(`${seed}-ty`, 2024, 2026)}`,
  lastReport: `${between(`${seed}-lr`, 1, 46)}h ago`,
});

/* -------------------------------------------------------------- sub-regions */

export interface SubRegion {
  name: string;
  parent: string;
  countryCode: CountryCode;
  /** grid position within the parent tile (2 x n mini grid) */
  gx: number;
  gy: number;
  risk: Record<HazardType, number>;
  population: number;
  households: number;
  householdsReached: number;
  level3Count: number;
  focalPerson: FocalPersonContact;
  dominantHazard: HazardType;
}

const hazardList: HazardType[] = ['flood', 'drought', 'epidemic', 'heatwave', 'fire'];

const buildSubRegions = (country: CountryProfile, region: CountryRegion): SubRegion[] => {
  const key = `${country.code}:${region.name}`;
  const named = namedUnits[key];
  const count = named ? named.length : between(`${key}-n`, 3, 5);
  const leadAgency = country.agencies[6]?.name ?? country.leadAgency;

  return Array.from({ length: count }, (_, i) => {
    const name = named ? named[i] : `${region.name} ${pick(`${key}-${i}-sfx`, suffixes[country.code])}`;
    const seed = `${key}-${name}`;
    const risk = hazardList.reduce((acc, h) => {
      const delta = (unit(`${seed}-${h}`) - 0.45) * 34;
      acc[h] = clamp(region.risk[h] + delta);
      return acc;
    }, {} as Record<HazardType, number>);
    const share = 0.7 + unit(`${seed}-share`) * 0.6;
    const population = Math.round(((region.vulnerablePopulation / count) * share) / 100) * 100;
    const households = Math.round(population / between(`${seed}-hh`, 5, 8));
    const reachRate = 0.42 + unit(`${seed}-reach`) * 0.5;
    const dominantHazard = hazardList.reduce((a, b) => (risk[b] > risk[a] ? b : a), 'flood' as HazardType);

    return {
      name,
      parent: region.name,
      countryCode: country.code,
      gx: i % 2,
      gy: Math.floor(i / 2),
      risk,
      population,
      households,
      householdsReached: Math.round(households * reachRate),
      level3Count: between(`${seed}-l3`, 6, 24),
      focalPerson: makeFocalPerson(country.code, seed, leadAgency),
      dominantHazard,
    };
  });
};

const subRegionCache = new Map<CountryCode, SubRegion[]>();

/** All level-2 administrative units for a country. */
export const getSubRegions = (code: CountryCode): SubRegion[] => {
  const imported = getBoundaryOverride(code);
  if (imported?.length) return imported;
  const cached = subRegionCache.get(code);
  if (cached) return cached;
  const country = getCountry(code);
  const all = country.regions.flatMap((rg) => buildSubRegions(country, rg));
  subRegionCache.set(code, all);
  return all;
};

export const getSubRegionsOf = (code: CountryCode, parent: string) =>
  getSubRegions(code).filter((s) => s.parent === parent);

/* ----------------------------------------------------------------- incidents */

export type IncidentStatus = 'active' | 'monitoring' | 'closed';

export interface Incident {
  id: string;
  countryCode: CountryCode;
  hazard: HazardType;
  level1: string;
  level2: string;
  title: string;
  /** What triggered the alert — parameter, reading and threshold */
  cause: string;
  parameter: string;
  reading: string;
  threshold: string;
  agency: string;
  alertLevel: 'yellow' | 'orange' | 'red';
  occurredAt: string;
  householdsTargeted: number;
  householdsReached: number;
  peopleAffected: number;
  displaced: number;
  channels: string[];
  focalPerson: FocalPersonContact;
  responseNote: string;
  status: IncidentStatus;
}

const causeByHazard: Record<HazardType, { parameter: string; unit: string; cause: string; note: string }> = {
  flood: {
    parameter: 'River level',
    unit: 'm',
    cause: 'Sustained upstream discharge and dam spillage pushed river levels past the alert threshold',
    note: 'Evacuation to designated high-ground shelters; boats pre-positioned with local response teams.',
  },
  drought: {
    parameter: 'Rainfall anomaly',
    unit: '%',
    cause: 'Cumulative rainfall deficit over consecutive dekads collapsed soil moisture below crop stress limits',
    note: 'Agro-advisories issued; supplementary water trucking to worst-hit communities.',
  },
  epidemic: {
    parameter: 'Confirmed cases',
    unit: 'cases',
    cause: 'Sentinel surveillance recorded a case cluster exceeding the epidemic threshold for the reporting week',
    note: 'Rapid response team deployed; oral rehydration points and case-search underway.',
  },
  heatwave: {
    parameter: 'Heat index',
    unit: '°C',
    cause: 'Consecutive days of extreme apparent temperature above the human-health danger threshold',
    note: 'Cooling centres opened; heat-health advisory pushed through radio and SMS.',
  },
  fire: {
    parameter: 'Fire risk index',
    unit: 'idx',
    cause: 'Harmattan dryness, high electrical load and low humidity combined into a critical ignition window',
    note: 'Fire tenders repositioned; market and settlement fire wardens activated.',
  },
};

const channelPool = ['SMS cascade', 'Community radio', 'Town criers', 'WhatsApp groups', 'Mosque/Church PA', 'TV crawl'];

const readingFor = (hazard: HazardType, seed: string) => {
  switch (hazard) {
    case 'flood':
      return { reading: `${(between(seed, 78, 120) / 10).toFixed(1)} m`, threshold: `${(between(`${seed}t`, 70, 95) / 10).toFixed(1)} m` };
    case 'drought':
      return { reading: `-${between(seed, 28, 52)} %`, threshold: '-25 %' };
    case 'epidemic':
      return { reading: `${between(seed, 55, 240)} cases`, threshold: `${between(`${seed}t`, 40, 100)} cases` };
    case 'heatwave':
      return { reading: `${between(seed, 43, 49)} °C`, threshold: '42 °C' };
    case 'fire':
      return { reading: `${between(seed, 72, 96)} idx`, threshold: '70 idx' };
  }
};

const buildIncidents = (code: CountryCode): Incident[] => {
  const country = getCountry(code);
  const subs = getSubRegions(code);
  const ranked = [...subs]
    .map((s) => ({ s, score: s.risk[s.dominantHazard] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 14);

  const now = Date.UTC(2026, 6, 29, 21, 0, 0);

  return ranked.map(({ s }, i) => {
    const hazard = s.dominantHazard;
    const seed = `${code}-inc-${s.name}-${i}`;
    const meta = causeByHazard[hazard];
    const { reading, threshold } = readingFor(hazard, seed);
    const agencyObj = pick(`${seed}-ag`, [
      country.agencies[hazard === 'flood' ? 0 : hazard === 'heatwave' || hazard === 'drought' ? 1 : hazard === 'epidemic' ? 3 : 7],
      country.agencies[2],
    ]);
    const agency = agencyObj?.name || country.leadAgency;
    const targeted = s.households;
    const reached = s.householdsReached;
    const level = s.risk[hazard] >= 78 ? 'red' : s.risk[hazard] >= 58 ? 'orange' : 'yellow';
    const occurredAt = new Date(now - (i * 34 + between(`${seed}-h`, 2, 30)) * 3600_000).toISOString();

    return {
      id: `${code}-INC-${String(1000 + i)}`,
      countryCode: code,
      hazard,
      level1: s.parent,
      level2: s.name,
      title: `${hazard[0].toUpperCase()}${hazard.slice(1)} ${level === 'red' ? 'emergency' : level === 'orange' ? 'warning' : 'advisory'} — ${s.name}`,
      cause: meta.cause,
      parameter: meta.parameter,
      reading,
      threshold,
      agency,
      alertLevel: level as Incident['alertLevel'],
      occurredAt,
      householdsTargeted: targeted,
      householdsReached: reached,
      peopleAffected: Math.round(s.population * (0.12 + unit(`${seed}-aff`) * 0.3)),
      displaced: Math.round(s.population * (0.01 + unit(`${seed}-dsp`) * 0.05)),
      channels: [pick(`${seed}-c1`, channelPool), pick(`${seed}-c2`, channelPool.slice(2))].filter(
        (v, idx, arr) => arr.indexOf(v) === idx,
      ),
      focalPerson: s.focalPerson,
      responseNote: meta.note,
      status: (i < 4 ? 'active' : i < 9 ? 'monitoring' : 'closed') as IncidentStatus,
    };
  });
};

const incidentCache = new Map<CountryCode, Incident[]>();

export const getIncidents = (code: CountryCode): Incident[] => {
  const imported = getIncidentOverride(code);
  if (imported?.length) return imported;
  const cached = incidentCache.get(code);
  if (cached) return cached;
  const list = buildIncidents(code).sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
  incidentCache.set(code, list);
  return list;
};

export const getIncidentsFor = (code: CountryCode, level2: string) =>
  getIncidents(code).filter((i) => i.level2 === level2);

/* ----------------------------------------------------------- KPI aggregation */

export interface CountryKPI {
  code: CountryCode;
  name: string;
  flag: string;
  level1Label: string;
  level2Label: string;
  level1Count: number;
  level2Count: number;
  highestRiskHazard: HazardType;
  highestRiskValue: number;
  topAffected: { name: string; parent: string; risk: number; householdsReached: number; households: number }[];
  incidents7d: number;
  incidents30d: number;
  activeIncidents: number;
  householdsReached: number;
  householdsTargeted: number;
  reachRate: number;
  peopleAffected: number;
}

export const countryKPI = (country: CountryProfile): CountryKPI => {
  const labels = boundaryLabels[country.code];
  const subs = getSubRegions(country.code);
  const incidents = getIncidents(country.code);
  const now = Date.UTC(2026, 6, 29, 21, 0, 0);
  const within = (days: number) =>
    incidents.filter((i) => now - new Date(i.occurredAt).getTime() <= days * 86_400_000).length;

  const hazardAvg = hazardList.map((h) => ({
    hazard: h,
    value: Math.round(country.regions.reduce((s, r) => s + r.risk[h], 0) / country.regions.length),
  }));
  const worst = hazardAvg.reduce((a, b) => (b.value > a.value ? b : a));

  const topAffected = [...subs]
    .sort((a, b) => b.risk[b.dominantHazard] - a.risk[a.dominantHazard])
    .slice(0, 5)
    .map((s) => ({
      name: s.name,
      parent: s.parent,
      risk: s.risk[s.dominantHazard],
      householdsReached: s.householdsReached,
      households: s.households,
    }));

  const householdsTargeted = incidents.reduce((s, i) => s + i.householdsTargeted, 0);
  const householdsReached = incidents.reduce((s, i) => s + i.householdsReached, 0);

  return {
    code: country.code,
    name: country.shortName,
    flag: country.flag,
    level1Label: labels.level1,
    level2Label: labels.level2,
    level1Count: country.regions.length,
    level2Count: subs.length,
    highestRiskHazard: worst.hazard,
    highestRiskValue: worst.value,
    topAffected,
    incidents7d: within(7),
    incidents30d: within(30),
    activeIncidents: incidents.filter((i) => i.status === 'active').length,
    householdsReached,
    householdsTargeted,
    reachRate: householdsTargeted ? Math.round((householdsReached / householdsTargeted) * 100) : 0,
    peopleAffected: incidents.reduce((s, i) => s + i.peopleAffected, 0),
  };
};

export const allCountryKPIs = (): CountryKPI[] => countries.map(countryKPI);

/* Imported datasets invalidate the generated caches. */
registerCacheReset(() => {
  subRegionCache.clear();
  incidentCache.clear();
});
