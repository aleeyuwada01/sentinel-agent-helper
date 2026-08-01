import {
  agencies as nigeriaAgencies,
  hazardStatuses as nigeriaHazards,
  type Agency,
  type AlertLevel,
  type HazardStatus,
  type HazardType,
} from './mockData';

export type CountryCode = 'NG' | 'GH' | 'SL' | 'CI';

export interface CountryRegion {
  /** Region / state / province / district name */
  name: string;
  /** Cartogram grid position (col, row) — used by the SVG regional map */
  gx: number;
  gy: number;
  /** 0-100 hazard probability per hazard type */
  risk: Record<HazardType, number>;
  vulnerablePopulation: number;
  peakMonth: string;
  basin: string;
}

export interface MonitoringStation {
  name: string;
  region: string;
  network: string;
  parameter: string;
  value: string;
  threshold: string;
  status: 'Normal' | 'Watch' | 'Alert';
}

export interface CountryProfile {
  code: CountryCode;
  name: string;
  shortName: string;
  flag: string;
  capital: string;
  systemName: string;
  systemAcronym: string;
  leadAgency: string;
  languages: string[];
  population: number;
  regionLabel: string;
  /** Owner of the platform — Nigeria hosts the original deployment */
  isOwner?: boolean;
  agencies: Agency[];
  hazardStatuses: HazardStatus[];
  regions: CountryRegion[];
  stations: MonitoringStation[];
  focalPersons: { active: number; total: number };
  /** Approximate polygon on the West Africa command map */
  mapPath: string;
  mapLabel: { x: number; y: number };
}

const r = (
  flood: number,
  drought: number,
  epidemic: number,
  heatwave: number,
  fire: number,
): Record<HazardType, number> => ({ flood, drought, epidemic, heatwave, fire });

/* ------------------------------------------------------------------ NIGERIA */

const nigeriaRegions: CountryRegion[] = [
  { name: 'Sokoto', gx: 0, gy: 0, risk: r(22, 78, 41, 92, 48), vulnerablePopulation: 980_000, peakMonth: 'Apr', basin: 'Sokoto-Rima Basin' },
  { name: 'Katsina', gx: 1, gy: 0, risk: r(28, 74, 38, 88, 44), vulnerablePopulation: 1_120_000, peakMonth: 'Apr', basin: 'Sokoto-Rima Basin' },
  { name: 'Kano', gx: 2, gy: 0, risk: r(34, 66, 71, 84, 72), vulnerablePopulation: 1_640_000, peakMonth: 'May', basin: 'Hadejia-Jamaare' },
  { name: 'Yobe', gx: 3, gy: 0, risk: r(30, 82, 58, 80, 55), vulnerablePopulation: 760_000, peakMonth: 'Apr', basin: 'Komadugu-Yobe' },
  { name: 'Borno', gx: 4, gy: 0, risk: r(38, 86, 88, 78, 78), vulnerablePopulation: 1_480_000, peakMonth: 'Apr', basin: 'Lake Chad Basin' },
  { name: 'Kebbi', gx: 0, gy: 1, risk: r(64, 58, 34, 76, 38), vulnerablePopulation: 720_000, peakMonth: 'Sep', basin: 'Niger North' },
  { name: 'Kaduna', gx: 1, gy: 1, risk: r(52, 44, 32, 62, 91), vulnerablePopulation: 1_240_000, peakMonth: 'Sep', basin: 'Upper Niger' },
  { name: 'Bauchi', gx: 2, gy: 1, risk: r(46, 52, 46, 66, 42), vulnerablePopulation: 880_000, peakMonth: 'Sep', basin: 'Gongola' },
  { name: 'Adamawa', gx: 3, gy: 1, risk: r(74, 48, 76, 60, 40), vulnerablePopulation: 1_060_000, peakMonth: 'Sep', basin: 'Upper Benue' },
  { name: 'Plateau', gx: 4, gy: 1, risk: r(40, 40, 30, 48, 58), vulnerablePopulation: 640_000, peakMonth: 'Aug', basin: 'Jos Plateau' },
  { name: 'Niger', gx: 0, gy: 2, risk: r(78, 42, 28, 58, 44), vulnerablePopulation: 1_020_000, peakMonth: 'Sep', basin: 'Middle Niger' },
  { name: 'FCT', gx: 1, gy: 2, risk: r(44, 34, 26, 52, 33), vulnerablePopulation: 520_000, peakMonth: 'Sep', basin: 'Gurara' },
  { name: 'Kogi', gx: 2, gy: 2, risk: r(92, 30, 44, 50, 36), vulnerablePopulation: 1_380_000, peakMonth: 'Oct', basin: 'Niger-Benue Confluence' },
  { name: 'Benue', gx: 3, gy: 2, risk: r(88, 32, 42, 52, 34), vulnerablePopulation: 1_260_000, peakMonth: 'Oct', basin: 'Lower Benue' },
  { name: 'Taraba', gx: 4, gy: 2, risk: r(70, 38, 36, 54, 38), vulnerablePopulation: 700_000, peakMonth: 'Sep', basin: 'Upper Benue' },
  { name: 'Oyo', gx: 0, gy: 3, risk: r(42, 28, 30, 46, 40), vulnerablePopulation: 820_000, peakMonth: 'Jul', basin: 'Ogun-Oshun' },
  { name: 'Edo', gx: 1, gy: 3, risk: r(58, 24, 82, 42, 32), vulnerablePopulation: 640_000, peakMonth: 'Sep', basin: 'Benin-Owena' },
  { name: 'Anambra', gx: 2, gy: 3, risk: r(80, 22, 38, 44, 64), vulnerablePopulation: 940_000, peakMonth: 'Oct', basin: 'Anambra-Imo' },
  { name: 'Cross River', gx: 3, gy: 3, risk: r(62, 20, 34, 40, 28), vulnerablePopulation: 560_000, peakMonth: 'Sep', basin: 'Cross River Basin' },
  { name: 'Lagos', gx: 0, gy: 4, risk: r(84, 18, 32, 44, 87), vulnerablePopulation: 2_240_000, peakMonth: 'Jul', basin: 'Coastal / Lagoon' },
  { name: 'Delta', gx: 1, gy: 4, risk: r(76, 18, 36, 40, 42), vulnerablePopulation: 880_000, peakMonth: 'Oct', basin: 'Niger Delta' },
  { name: 'Bayelsa', gx: 2, gy: 4, risk: r(90, 16, 40, 38, 30), vulnerablePopulation: 620_000, peakMonth: 'Oct', basin: 'Niger Delta' },
  { name: 'Rivers', gx: 3, gy: 4, risk: r(82, 16, 38, 40, 56), vulnerablePopulation: 1_180_000, peakMonth: 'Oct', basin: 'Niger Delta' },
  { name: 'Akwa Ibom', gx: 4, gy: 4, risk: r(72, 16, 34, 38, 30), vulnerablePopulation: 700_000, peakMonth: 'Oct', basin: 'Cross River Basin' },
];

/* -------------------------------------------------------------------- GHANA */

const ghanaRegions: CountryRegion[] = [
  { name: 'Upper West', gx: 0, gy: 0, risk: r(48, 82, 44, 86, 52), vulnerablePopulation: 320_000, peakMonth: 'Sep', basin: 'Black Volta' },
  { name: 'Upper East', gx: 2, gy: 0, risk: r(88, 78, 52, 84, 46), vulnerablePopulation: 480_000, peakMonth: 'Sep', basin: 'White Volta (Bagre spill)' },
  { name: 'North East', gx: 1, gy: 1, risk: r(74, 72, 46, 80, 44), vulnerablePopulation: 260_000, peakMonth: 'Sep', basin: 'White Volta' },
  { name: 'Northern', gx: 2, gy: 1, risk: r(80, 68, 58, 78, 62), vulnerablePopulation: 620_000, peakMonth: 'Sep', basin: 'White Volta' },
  { name: 'Savannah', gx: 0, gy: 1, risk: r(56, 74, 36, 76, 68), vulnerablePopulation: 210_000, peakMonth: 'Sep', basin: 'Black Volta' },
  { name: 'Bono', gx: 0, gy: 2, risk: r(44, 52, 30, 58, 48), vulnerablePopulation: 240_000, peakMonth: 'Aug', basin: 'Tano Basin' },
  { name: 'Bono East', gx: 1, gy: 2, risk: r(52, 56, 34, 62, 52), vulnerablePopulation: 260_000, peakMonth: 'Aug', basin: 'Volta Lake' },
  { name: 'Oti', gx: 3, gy: 2, risk: r(70, 48, 40, 60, 38), vulnerablePopulation: 200_000, peakMonth: 'Sep', basin: 'Oti River' },
  { name: 'Ashanti', gx: 1, gy: 3, risk: r(58, 34, 44, 50, 74), vulnerablePopulation: 980_000, peakMonth: 'Jun', basin: 'Pra Basin' },
  { name: 'Eastern', gx: 2, gy: 3, risk: r(62, 30, 38, 48, 46), vulnerablePopulation: 520_000, peakMonth: 'Jun', basin: 'Volta / Densu' },
  { name: 'Volta', gx: 3, gy: 3, risk: r(76, 32, 42, 50, 36), vulnerablePopulation: 460_000, peakMonth: 'Oct', basin: 'Lower Volta' },
  { name: 'Western North', gx: 0, gy: 3, risk: r(54, 26, 36, 44, 40), vulnerablePopulation: 220_000, peakMonth: 'Jun', basin: 'Bia Basin' },
  { name: 'Western', gx: 0, gy: 4, risk: r(66, 22, 40, 44, 42), vulnerablePopulation: 420_000, peakMonth: 'Jun', basin: 'Ankobra / Pra' },
  { name: 'Central', gx: 1, gy: 4, risk: r(60, 26, 38, 46, 44), vulnerablePopulation: 480_000, peakMonth: 'Jun', basin: 'Pra Basin' },
  { name: 'Greater Accra', gx: 2, gy: 4, risk: r(92, 24, 46, 52, 84), vulnerablePopulation: 1_640_000, peakMonth: 'Jun', basin: 'Odaw / Korle Lagoon' },
];

/* ------------------------------------------------------------- SIERRA LEONE */

const sierraLeoneRegions: CountryRegion[] = [
  { name: 'Kambia', gx: 0, gy: 0, risk: r(68, 34, 58, 48, 32), vulnerablePopulation: 120_000, peakMonth: 'Aug', basin: 'Great Scarcies' },
  { name: 'Bombali', gx: 1, gy: 0, risk: r(58, 44, 62, 58, 46), vulnerablePopulation: 180_000, peakMonth: 'Aug', basin: 'Rokel River' },
  { name: 'Koinadugu', gx: 2, gy: 0, risk: r(46, 52, 48, 62, 54), vulnerablePopulation: 110_000, peakMonth: 'Aug', basin: 'Upper Rokel' },
  { name: 'Falaba', gx: 3, gy: 0, risk: r(42, 56, 44, 60, 50), vulnerablePopulation: 90_000, peakMonth: 'Aug', basin: 'Seli Basin' },
  { name: 'Port Loko', gx: 0, gy: 1, risk: r(72, 32, 60, 50, 38), vulnerablePopulation: 210_000, peakMonth: 'Aug', basin: 'Little Scarcies' },
  { name: 'Tonkolili', gx: 1, gy: 1, risk: r(56, 40, 54, 54, 58), vulnerablePopulation: 150_000, peakMonth: 'Aug', basin: 'Rokel River' },
  { name: 'Kono', gx: 3, gy: 1, risk: r(50, 42, 52, 56, 62), vulnerablePopulation: 160_000, peakMonth: 'Sep', basin: 'Sewa River' },
  { name: 'Western Area Urban', gx: 0, gy: 2, risk: r(94, 20, 66, 52, 82), vulnerablePopulation: 640_000, peakMonth: 'Aug', basin: 'Freetown Peninsula' },
  { name: 'Western Area Rural', gx: 0, gy: 3, risk: r(86, 22, 56, 50, 64), vulnerablePopulation: 280_000, peakMonth: 'Aug', basin: 'Freetown Peninsula' },
  { name: 'Moyamba', gx: 1, gy: 2, risk: r(64, 28, 50, 48, 40), vulnerablePopulation: 130_000, peakMonth: 'Aug', basin: 'Jong River' },
  { name: 'Bo', gx: 2, gy: 2, risk: r(60, 30, 58, 50, 56), vulnerablePopulation: 240_000, peakMonth: 'Sep', basin: 'Sewa River' },
  { name: 'Kenema', gx: 3, gy: 2, risk: r(58, 30, 78, 50, 48), vulnerablePopulation: 220_000, peakMonth: 'Sep', basin: 'Moa River' },
  { name: 'Bonthe', gx: 1, gy: 3, risk: r(80, 24, 48, 46, 30), vulnerablePopulation: 90_000, peakMonth: 'Sep', basin: 'Sherbro Estuary' },
  { name: 'Pujehun', gx: 2, gy: 3, risk: r(70, 26, 54, 48, 34), vulnerablePopulation: 100_000, peakMonth: 'Sep', basin: 'Moa River' },
];

/* ------------------------------------------------------------ COTE D'IVOIRE */

const coteDIvoireRegions: CountryRegion[] = [
  { name: 'Savanes', gx: 1, gy: 0, risk: r(48, 78, 62, 84, 66), vulnerablePopulation: 380_000, peakMonth: 'Sep', basin: 'Bandama Nord' },
  { name: 'Denguélé', gx: 0, gy: 0, risk: r(42, 74, 44, 80, 58), vulnerablePopulation: 180_000, peakMonth: 'Sep', basin: 'Sassandra Nord' },
  { name: 'Zanzan', gx: 3, gy: 0, risk: r(52, 70, 50, 78, 60), vulnerablePopulation: 260_000, peakMonth: 'Sep', basin: 'Comoé' },
  { name: 'Woroba', gx: 1, gy: 1, risk: r(46, 62, 46, 70, 54), vulnerablePopulation: 220_000, peakMonth: 'Sep', basin: 'Bandama' },
  { name: 'Vallée du Bandama', gx: 2, gy: 1, risk: r(64, 56, 52, 66, 56), vulnerablePopulation: 420_000, peakMonth: 'Sep', basin: 'Bandama / Kossou' },
  { name: 'Montagnes', gx: 0, gy: 1, risk: r(58, 48, 56, 60, 62), vulnerablePopulation: 340_000, peakMonth: 'Sep', basin: 'Cavally' },
  { name: 'Sassandra-Marahoué', gx: 1, gy: 2, risk: r(60, 44, 48, 58, 58), vulnerablePopulation: 360_000, peakMonth: 'Jun', basin: 'Marahoué' },
  { name: 'Lacs', gx: 2, gy: 2, risk: r(66, 42, 46, 56, 50), vulnerablePopulation: 300_000, peakMonth: 'Jun', basin: 'Lac de Kossou' },
  { name: 'Yamoussoukro', gx: 3, gy: 2, risk: r(56, 40, 42, 56, 48), vulnerablePopulation: 180_000, peakMonth: 'Jun', basin: 'Bandama Centre' },
  { name: 'Gôh-Djiboua', gx: 1, gy: 3, risk: r(62, 34, 46, 52, 52), vulnerablePopulation: 280_000, peakMonth: 'Jun', basin: 'Nzi / Bandama' },
  { name: 'Comoé', gx: 3, gy: 3, risk: r(74, 30, 50, 52, 44), vulnerablePopulation: 320_000, peakMonth: 'Jun', basin: 'Comoé Sud' },
  { name: 'Bas-Sassandra', gx: 0, gy: 3, risk: r(70, 28, 48, 50, 46), vulnerablePopulation: 340_000, peakMonth: 'Jun', basin: 'Sassandra Sud' },
  { name: 'Abidjan', gx: 2, gy: 4, risk: r(93, 24, 58, 56, 88), vulnerablePopulation: 1_820_000, peakMonth: 'Jun', basin: 'Lagune Ébrié' },
];

/* ------------------------------------------------------- HAZARD STATUS SETS */

const hz = (
  type: HazardType,
  label: string,
  alertLevel: AlertLevel,
  affectedStates: number,
  affectedLGAs: number,
  activeFocalPersons: number,
  description: string,
): HazardStatus => ({
  type,
  label,
  alertLevel,
  affectedStates,
  affectedLGAs,
  activeFocalPersons,
  lastUpdated: '2024-03-24T14:30:00',
  description,
});

const ghanaHazards: HazardStatus[] = [
  hz('flood', 'Flood', 'red', 7, 42, 620, 'White Volta rising after Bagre Dam spillage. Upper East & Northern on red alert.'),
  hz('drought', 'Drought', 'orange', 5, 28, 310, 'Prolonged dry spell across the Savannah and Upper West belt.'),
  hz('epidemic', 'Epidemic', 'yellow', 3, 14, 180, 'Cholera surveillance in Greater Accra coastal communities.'),
  hz('heatwave', 'Heatwave', 'orange', 5, 26, 240, 'Sustained 40°C+ conditions in the northern savannah zone.'),
  hz('fire', 'Fire', 'orange', 6, 22, 260, 'Harmattan bushfires plus Accra/Kumasi market electrical-load risk.'),
];

const sierraLeoneHazards: HazardStatus[] = [
  hz('flood', 'Flood', 'red', 5, 19, 280, 'Freetown peninsula flash flooding and landslide risk during peak rains.'),
  hz('drought', 'Drought', 'green', 2, 6, 60, 'No significant rainfall deficit recorded this cycle.'),
  hz('epidemic', 'Epidemic', 'orange', 4, 15, 190, 'Lassa fever and cholera surveillance active in Kenema and Western Area.'),
  hz('heatwave', 'Heatwave', 'yellow', 3, 9, 70, 'Elevated heat index in northern districts; humidity amplifying discomfort.'),
  hz('fire', 'Fire', 'orange', 3, 11, 120, 'Dense informal settlement fire risk in Freetown; limited hydrant coverage.'),
];

const coteDIvoireHazards: HazardStatus[] = [
  hz('flood', 'Inondation', 'red', 6, 31, 410, 'Lagune Ébrié surcharge and Abidjan urban drainage saturation.'),
  hz('drought', 'Sécheresse', 'orange', 4, 22, 210, 'Rainfall deficit across the northern Savanes and Denguélé districts.'),
  hz('epidemic', 'Épidémie', 'yellow', 4, 17, 150, 'Meningitis belt surveillance in the north; cholera watch in Abidjan.'),
  hz('heatwave', 'Canicule', 'orange', 4, 18, 160, 'Heat index above 42°C in Korhogo and Ferkessédougou.'),
  hz('fire', 'Incendie', 'orange', 5, 20, 190, 'Adjamé/Abobo market fire risk and northern bush-fire season.'),
];

/* -------------------------------------------------------------- AGENCY SETS */

const ghanaAgencies: Agency[] = [
  { code: 'HSD', name: 'HSD', fullName: 'Hydrological Services Department', role: 'Lead Agency — Hydrological data & flood forecasting', activeAlerts: 11, personnelDeployed: 180 },
  { code: 'GMET', name: 'GMet', fullName: 'Ghana Meteorological Agency', role: 'Weather forecasting & climate data', activeAlerts: 7, personnelDeployed: 140 },
  { code: 'NADMO', name: 'NADMO', fullName: 'National Disaster Management Organisation', role: 'Emergency response coordination', activeAlerts: 19, personnelDeployed: 480 },
  { code: 'GHS', name: 'GHS', fullName: 'Ghana Health Service — Public Health Division', role: 'Epidemic surveillance & response', activeAlerts: 4, personnelDeployed: 160 },
  { code: 'NCCE', name: 'NCCE', fullName: 'National Commission for Civic Education', role: 'Public awareness & sensitization', activeAlerts: 3, personnelDeployed: 320 },
  { code: 'RDMO', name: 'RDMO', fullName: 'Regional Disaster Management Offices', role: 'Regional emergency coordination', activeAlerts: 14, personnelDeployed: 610 },
  { code: 'DDMO', name: 'DDMO', fullName: 'District Disaster Management Offices', role: 'District response & community liaison', activeAlerts: 22, personnelDeployed: 840 },
  { code: 'GNFS', name: 'GNFS', fullName: 'Ghana National Fire Service', role: 'Fire prevention, suppression & rescue operations', activeAlerts: 9, personnelDeployed: 420 },
];

const sierraLeoneAgencies: Agency[] = [
  { code: 'MWR', name: 'MWR-HYD', fullName: 'Ministry of Water Resources — Hydrology Directorate', role: 'Lead Agency — Hydrological data & flood forecasting', activeAlerts: 8, personnelDeployed: 90 },
  { code: 'SLMET', name: 'SLMet', fullName: 'Sierra Leone Meteorological Agency', role: 'Weather forecasting & climate data', activeAlerts: 6, personnelDeployed: 70 },
  { code: 'NDMA', name: 'NDMA', fullName: 'National Disaster Management Agency', role: 'Emergency response coordination', activeAlerts: 15, personnelDeployed: 260 },
  // HIDDEN — uncomment to re-enable:
  // { code: 'NPHA', name: 'NPHA', fullName: 'National Public Health Agency', role: 'Epidemic surveillance & response', activeAlerts: 7, personnelDeployed: 140 },
  { code: 'MIC', name: 'MIC', fullName: 'Ministry of Information & Civic Education', role: 'Public awareness & sensitization', activeAlerts: 2, personnelDeployed: 160 },
  // { code: 'PDMC', name: 'PDMC', fullName: 'Provincial Disaster Management Committees', role: 'Provincial emergency coordination', activeAlerts: 10, personnelDeployed: 220 },
  // { code: 'DDMC', name: 'DDMC', fullName: 'District Disaster Management Committees', role: 'District response & community liaison', activeAlerts: 17, personnelDeployed: 380 },
  // { code: 'SLNFF', name: 'SLNFF', fullName: 'Sierra Leone National Fire Force', role: 'Fire prevention, suppression & rescue operations', activeAlerts: 6, personnelDeployed: 190 },
];

const coteDIvoireAgencies: Agency[] = [
  { code: 'DGRE', name: 'DGRE', fullName: 'Direction Générale des Ressources en Eau', role: 'Lead Agency — Hydrological data & flood forecasting', activeAlerts: 10, personnelDeployed: 150 },
  { code: 'SODEXAM', name: 'SODEXAM', fullName: 'Société d\'Exploitation et de Développement Aéroportuaire, Aéronautique et Météorologique', role: 'Weather forecasting & climate data', activeAlerts: 8, personnelDeployed: 130 },
  { code: 'ONPC', name: 'ONPC', fullName: 'Office National de la Protection Civile', role: 'Emergency response coordination', activeAlerts: 18, personnelDeployed: 430 },
  // HIDDEN — uncomment to re-enable:
  // { code: 'INHP', name: 'INHP', fullName: 'Institut National d\'Hygiène Publique', role: 'Epidemic surveillance & response', activeAlerts: 5, personnelDeployed: 175 },
  { code: 'CICG', name: 'CICG', fullName: 'Centre d\'Information et de Communication Gouvernementale', role: 'Public awareness & sensitization', activeAlerts: 3, personnelDeployed: 260 },
  // { code: 'CRD', name: 'CR-DIST', fullName: 'Conseils Régionaux / Districts Autonomes', role: 'Regional emergency coordination', activeAlerts: 13, personnelDeployed: 520 },
  // { code: 'CDL', name: 'CDL', fullName: 'Comités Départementaux Locaux', role: 'Departmental response & community liaison', activeAlerts: 20, personnelDeployed: 700 },
  // { code: 'GSPM', name: 'GSPM', fullName: 'Groupement des Sapeurs-Pompiers Militaires', role: 'Fire prevention, suppression & rescue operations', activeAlerts: 10, personnelDeployed: 480 },
];

/* ------------------------------------------------------------ STATION FEEDS */

const nigeriaStations: MonitoringStation[] = [
  { name: 'Lokoja', region: 'Kogi', network: 'NIHSA Hydrometric', parameter: 'River level', value: '8.4 m', threshold: '10.2 m', status: 'Watch' },
  { name: 'Makurdi', region: 'Benue', network: 'NIHSA Hydrometric', parameter: 'River level', value: '9.1 m', threshold: '11.0 m', status: 'Alert' },
  { name: 'Sokoto', region: 'Sokoto', network: 'NiMet Synoptic', parameter: 'Heat index', value: '48 °C', threshold: '45 °C', status: 'Alert' },
  { name: 'Maiduguri', region: 'Borno', network: 'NCDC Sentinel', parameter: 'Cholera cases', value: '168', threshold: '100', status: 'Alert' },
  { name: 'Kaduna Refinery', region: 'Kaduna', network: 'FFS Sensor Grid', parameter: 'VOC', value: '18 ppm', threshold: '10 ppm', status: 'Alert' },
];

const ghanaStations: MonitoringStation[] = [
  { name: 'Nawuni (White Volta)', region: 'Northern', network: 'HSD Hydrometric', parameter: 'River level', value: '7.9 m', threshold: '8.5 m', status: 'Watch' },
  { name: 'Pwalugu', region: 'Upper East', network: 'HSD Hydrometric', parameter: 'River level', value: '9.4 m', threshold: '9.0 m', status: 'Alert' },
  { name: 'Bagre Transboundary Gauge', region: 'Upper East', network: 'HSD / VBA Link', parameter: 'Spillage discharge', value: '1,240 m³/s', threshold: '1,000 m³/s', status: 'Alert' },
  { name: 'Navrongo', region: 'Upper East', network: 'GMet Synoptic', parameter: 'Heat index', value: '44 °C', threshold: '42 °C', status: 'Alert' },
  { name: 'Tamale', region: 'Northern', network: 'GMet Synoptic', parameter: 'Rainfall anomaly', value: '-38 %', threshold: '-25 %', status: 'Alert' },
  { name: 'Odaw Basin (Accra)', region: 'Greater Accra', network: 'HSD Urban Drainage', parameter: 'Drain level', value: '2.8 m', threshold: '2.5 m', status: 'Alert' },
  { name: 'Korle Bu Sentinel', region: 'Greater Accra', network: 'GHS Sentinel', parameter: 'Cholera cases', value: '46', threshold: '50', status: 'Watch' },
  { name: 'Kejetia Market Grid', region: 'Ashanti', network: 'GNFS Sensor Grid', parameter: 'Electrical load', value: '89 %', threshold: '80 %', status: 'Alert' },
];

const sierraLeoneStations: MonitoringStation[] = [
  { name: 'Bumbuna (Rokel)', region: 'Tonkolili', network: 'MWR Hydrometric', parameter: 'River level', value: '6.2 m', threshold: '7.0 m', status: 'Watch' },
  { name: 'Mabole Gauge', region: 'Bombali', network: 'MWR Hydrometric', parameter: 'River level', value: '5.4 m', threshold: '6.2 m', status: 'Normal' },
  { name: 'Regent Slope Sensor', region: 'Western Area Rural', network: 'NDMA Landslide Grid', parameter: 'Soil saturation', value: '92 %', threshold: '85 %', status: 'Alert' },
  { name: 'Lungi Synoptic', region: 'Port Loko', network: 'SLMet Synoptic', parameter: '24h rainfall', value: '128 mm', threshold: '100 mm', status: 'Alert' },
  { name: 'Freetown Culvert Network', region: 'Western Area Urban', network: 'MWR Urban Drainage', parameter: 'Drain level', value: '1.9 m', threshold: '1.6 m', status: 'Alert' },
  { name: 'Kenema Sentinel', region: 'Kenema', network: 'NPHA Sentinel', parameter: 'Lassa cases', value: '31', threshold: '25', status: 'Alert' },
  { name: 'Susan\'s Bay Settlement', region: 'Western Area Urban', network: 'SLNFF Sensor Grid', parameter: 'Smoke OD', value: '0.13', threshold: '0.10', status: 'Alert' },
];

const coteDIvoireStations: MonitoringStation[] = [
  { name: 'Bafing (Barrage Kossou)', region: 'Lacs', network: 'DGRE Hydrométrique', parameter: 'Reservoir level', value: '198 m', threshold: '203 m', status: 'Watch' },
  { name: 'Tiassalé (Bandama)', region: 'Gôh-Djiboua', network: 'DGRE Hydrométrique', parameter: 'River level', value: '7.1 m', threshold: '8.0 m', status: 'Watch' },
  { name: 'Aniassué (Comoé)', region: 'Comoé', network: 'DGRE Hydrométrique', parameter: 'River level', value: '8.6 m', threshold: '8.2 m', status: 'Alert' },
  { name: 'Korhogo Synoptique', region: 'Savanes', network: 'SODEXAM Synoptic', parameter: 'Heat index', value: '43 °C', threshold: '42 °C', status: 'Alert' },
  { name: 'Ferkessédougou', region: 'Savanes', network: 'SODEXAM Synoptic', parameter: 'Rainfall anomaly', value: '-34 %', threshold: '-25 %', status: 'Alert' },
  { name: 'Lagune Ébrié — Abidjan', region: 'Abidjan', network: 'DGRE Urbain', parameter: 'Lagoon level', value: '1.4 m', threshold: '1.2 m', status: 'Alert' },
  { name: 'Adjamé Marché', region: 'Abidjan', network: 'GSPM Sensor Grid', parameter: 'Electrical load', value: '91 %', threshold: '80 %', status: 'Alert' },
  { name: 'Korhogo Sentinelle', region: 'Savanes', network: 'INHP Sentinel', parameter: 'Meningitis cases', value: '58', threshold: '50', status: 'Alert' },
];

/* ----------------------------------------------------------------- REGISTRY */

export const countries: CountryProfile[] = [
  {
    code: 'NG',
    name: 'Nigeria',
    shortName: 'Nigeria',
    flag: '🇳🇬',
    capital: 'Abuja',
    systemName: 'National Multi-Hazard Early Warning System',
    systemAcronym: 'NMHEWS',
    leadAgency: 'NEMA',
    languages: ['EN', 'HA', 'IG', 'YO'],
    population: 223_800_000,
    regionLabel: 'States',
    isOwner: true,
    agencies: nigeriaAgencies,
    hazardStatuses: nigeriaHazards,
    regions: nigeriaRegions,
    stations: nigeriaStations,
    focalPersons: { active: 7124, total: 7840 },
    mapPath: 'M300,150 L360,140 L400,160 L420,215 L392,268 L330,285 L288,262 L270,205 Z',
    mapLabel: { x: 342, y: 210 },
  },
  {
    code: 'GH',
    name: 'Ghana',
    shortName: 'Ghana',
    flag: '🇬🇭',
    capital: 'Accra',
    systemName: 'Ghana Multi-Hazard Early Warning System',
    systemAcronym: 'GMHEWS',
    leadAgency: 'HSD',
    languages: ['EN', 'TWI', 'EWE', 'DAG'],
    population: 34_100_000,
    regionLabel: 'Regions',
    agencies: ghanaAgencies,
    hazardStatuses: ghanaHazards,
    regions: ghanaRegions,
    stations: ghanaStations,
    focalPersons: { active: 2180, total: 2640 },
    mapPath: 'M196,158 L232,152 L246,190 L240,246 L206,258 L188,220 L186,182 Z',
    mapLabel: { x: 216, y: 205 },
  },
  {
    code: 'CI',
    name: "Côte d'Ivoire",
    shortName: "Côte d'Ivoire",
    flag: '🇨🇮',
    capital: 'Yamoussoukro',
    systemName: "Système National d'Alerte Précoce Multirisque",
    systemAcronym: 'SNAP-MR',
    leadAgency: 'DGRE',
    languages: ['FR', 'BAO', 'DIO'],
    population: 29_400_000,
    regionLabel: 'Districts',
    agencies: coteDIvoireAgencies,
    hazardStatuses: coteDIvoireHazards,
    regions: coteDIvoireRegions,
    stations: coteDIvoireStations,
    focalPersons: { active: 1860, total: 2400 },
    mapPath: 'M132,156 L186,150 L188,220 L200,254 L156,268 L120,240 L118,186 Z',
    mapLabel: { x: 154, y: 205 },
  },
  {
    code: 'SL',
    name: 'Sierra Leone',
    shortName: 'Sierra Leone',
    flag: '🇸🇱',
    capital: 'Freetown',
    systemName: 'Sierra Leone Multi-Hazard Early Warning System',
    systemAcronym: 'SLMHEWS',
    leadAgency: 'MWR-HYD',
    languages: ['EN', 'KRI', 'MEN', 'TEM'],
    population: 8_800_000,
    regionLabel: 'Districts',
    agencies: sierraLeoneAgencies,
    hazardStatuses: sierraLeoneHazards,
    regions: sierraLeoneRegions,
    stations: sierraLeoneStations,
    focalPersons: { active: 940, total: 1280 },
    mapPath: 'M52,178 L86,168 L100,196 L88,224 L58,228 L44,204 Z',
    mapLabel: { x: 72, y: 198 },
  },
];

export const getCountry = (code: CountryCode): CountryProfile =>
  countries.find((c) => c.code === code) ?? countries[0];

export const alertScore: Record<AlertLevel, number> = { green: 1, yellow: 2, orange: 3, red: 4 };

/** Highest alert level currently active in a country. */
export const countryAlertLevel = (c: CountryProfile): AlertLevel =>
  c.hazardStatuses.reduce<AlertLevel>(
    (worst, h) => (alertScore[h.alertLevel] > alertScore[worst] ? h.alertLevel : worst),
    'green',
  );

export const countryActiveAlerts = (c: CountryProfile) =>
  c.agencies.reduce((sum, a) => sum + a.activeAlerts, 0);

export const countryPersonnel = (c: CountryProfile) =>
  c.agencies.reduce((sum, a) => sum + a.personnelDeployed, 0);

/** Region rows shaped for the hazard distribution map. */
export const regionRiskRows = (c: CountryProfile, hazard: HazardType) =>
  c.regions.map((rg) => {
    const pct = rg.risk[hazard];
    return {
      state: rg.name,
      riskLevel: (pct >= 66 ? 'high' : pct >= 40 ? 'moderate' : 'low') as 'high' | 'moderate' | 'low',
      probabilityPercent: pct,
      predictedPeakMonth: rg.peakMonth,
      riverBasin: rg.basin,
      vulnerablePopulation: rg.vulnerablePopulation,
      gx: rg.gx,
      gy: rg.gy,
    };
  });
