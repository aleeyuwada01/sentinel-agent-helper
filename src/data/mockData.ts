export type HazardType = 'flood' | 'drought' | 'epidemic' | 'heatwave' | 'fire';
export type AlertLevel = 'green' | 'yellow' | 'orange' | 'red';

export interface HazardStatus {
  type: HazardType;
  label: string;
  alertLevel: AlertLevel;
  affectedStates: number;
  affectedLGAs: number;
  activeFocalPersons: number;
  lastUpdated: string;
  description: string;
}

export interface NIHSAReading {
  station: string;
  riverLevel: number;
  maxLevel: number;
  groundWater: number;
  waterQuality: string;
  turbidity: number;
  trend: 'rising' | 'falling' | 'stable';
  state: string;
}

export interface NIMETReading {
  station: string;
  temperature: number;
  heatIndex: number;
  flashRainProb: number;
  humidity: number;
  state: string;
}

export interface FocalPerson {
  id: string;
  name: string;
  ward: string;
  lga: string;
  state: string;
  lat: number;
  lng: number;
  phoneNumber: string;
  status: 'active' | 'inactive';
  lastReport: string;
}

export interface Agency {
  code: string;
  name: string;
  fullName: string;
  role: string;
  activeAlerts: number;
  personnelDeployed: number;
}

export type UserRole = 'super_admin' | 'agency_admin' | 'state_coordinator' | 'lga_officer' | 'focal_person' | 'viewer';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agency?: string;
  state?: string;
  lga?: string;
  status: 'active' | 'suspended';
  lastLogin: string;
}

export const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  agency_admin: 'Agency Admin',
  state_coordinator: 'State Coordinator',
  lga_officer: 'LGA Officer',
  focal_person: 'Focal Person',
  viewer: 'Viewer',
};

export const rolePermissions: Record<UserRole, string[]> = {
  super_admin: ['All system access', 'Manage users & roles', 'Configure agencies', 'Dispatch alerts', 'View all data'],
  agency_admin: ['Agency dashboard', 'Data ingestion', 'Dispatch alerts', 'Manage agency personnel'],
  state_coordinator: ['State-level data', 'Coordinate LGA officers', 'Submit reports', 'View alerts'],
  lga_officer: ['LGA-level data', 'Manage focal persons', 'Submit reports', 'View alerts'],
  focal_person: ['Submit situation reports', 'Receive alerts', 'Community feedback'],
  viewer: ['View dashboards', 'View analytics', 'View alerts'],
};

export const systemUsers: SystemUser[] = [
  { id: 'USR001', name: 'Dr. Clement Nze', email: 'c.nze@nihsa.gov.ng', role: 'super_admin', agency: 'NIHSA', status: 'active', lastLogin: '2024-03-24T14:30:00' },
  { id: 'USR002', name: 'Amina Garba', email: 'a.garba@nimet.gov.ng', role: 'agency_admin', agency: 'NIMET', status: 'active', lastLogin: '2024-03-24T12:15:00' },
  { id: 'USR003', name: 'Oluwaseun Adeyemi', email: 'o.adeyemi@nema.gov.ng', role: 'agency_admin', agency: 'NEMA', status: 'active', lastLogin: '2024-03-24T10:00:00' },
  { id: 'USR004', name: 'Bala Mohammed', email: 'b.mohammed@sema.kd.gov.ng', role: 'state_coordinator', agency: 'SEMA', state: 'Kaduna', status: 'active', lastLogin: '2024-03-24T09:30:00' },
  { id: 'USR005', name: 'Chioma Obi', email: 'c.obi@lema.an.gov.ng', role: 'lga_officer', agency: 'LEMA', state: 'Anambra', lga: 'Onitsha North', status: 'active', lastLogin: '2024-03-23T16:00:00' },
  { id: 'USR006', name: 'Fatima Yusuf', email: 'f.yusuf@mhews.ng', role: 'focal_person', state: 'FCT', lga: 'Gwagwalada', status: 'active', lastLogin: '2024-03-24T13:00:00' },
  { id: 'USR007', name: 'Ibrahim Danladi', email: 'i.danladi@ncdc.gov.ng', role: 'agency_admin', agency: 'NCDC', status: 'suspended', lastLogin: '2024-03-20T08:00:00' },
  { id: 'USR008', name: 'Ngozi Eze', email: 'n.eze@noa.gov.ng', role: 'agency_admin', agency: 'NOA', status: 'active', lastLogin: '2024-03-24T11:45:00' },
];

export const hazardStatuses: HazardStatus[] = [
  {
    type: 'flood',
    label: 'Flood',
    alertLevel: 'orange',
    affectedStates: 12,
    affectedLGAs: 87,
    activeFocalPersons: 1240,
    lastUpdated: '2024-03-24T14:30:00',
    description: 'River Niger and Benue basins showing elevated levels. 12 states on watch.',
  },
  {
    type: 'drought',
    label: 'Drought',
    alertLevel: 'yellow',
    affectedStates: 6,
    affectedLGAs: 34,
    activeFocalPersons: 680,
    lastUpdated: '2024-03-24T12:00:00',
    description: 'North-East region experiencing below-average rainfall patterns.',
  },
  {
    type: 'epidemic',
    label: 'Epidemic',
    alertLevel: 'green',
    affectedStates: 3,
    affectedLGAs: 12,
    activeFocalPersons: 240,
    lastUpdated: '2024-03-24T10:15:00',
    description: 'Cholera surveillance active in flood-prone LGAs. Situation under control.',
  },
  {
    type: 'heatwave',
    label: 'Heatwave',
    alertLevel: 'red',
    affectedStates: 8,
    affectedLGAs: 56,
    activeFocalPersons: 890,
    lastUpdated: '2024-03-24T15:00:00',
    description: 'Severe heatwave conditions in North-West. Temperatures exceeding 45°C.',
  },
  {
    type: 'fire',
    label: 'Fire',
    alertLevel: 'orange',
    affectedStates: 9,
    affectedLGAs: 41,
    activeFocalPersons: 520,
    lastUpdated: '2024-03-24T15:20:00',
    description: 'Bush & structural fire incidents elevated due to harmattan dryness. FFS on standby.',
  },
];

export type FireZoneType = 'urban_market' | 'forest_reserve' | 'industrial_site' | 'critical_infrastructure';
export type FireRiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface FireRiskZone {
  id: string;
  zoneName: string;
  zoneType: FireZoneType;
  state: string;
  lga: string;
  /** Probability of ignition / escalation in next 72h (0-100) */
  probabilityPercent: number;
  riskLevel: FireRiskLevel;
  /** Primary monitored parameters with current readings */
  parameters: { label: string; value: string; threshold: string; breached: boolean }[];
  recommendedAction: string;
  lastAssessed: string;
}

export interface FireStation {
  station: string;
  state: string;
  personnel: number;
  trucks: number;
  waterCapacityKL: number;
  readiness: 'Ready' | 'Partial' | 'Limited';
  activeIncidents: number;
  lastDrill: string;
}

/** Reported incidents (community / FFS submissions). Severity removed — use FireRiskZone for risk. */
export interface FireIncident {
  id: string;
  location: string;
  state: string;
  lga: string;
  zoneType: FireZoneType;
  status: 'Active' | 'Contained' | 'Extinguished';
  reportedAt: string;
  reporterName: string;
  notes: string;
}

export const fireRiskZones: FireRiskZone[] = [
  {
    id: 'FRZ001', zoneName: 'Balogun / Idumota Market Cluster', zoneType: 'urban_market', state: 'Lagos', lga: 'Lagos Island',
    probabilityPercent: 87, riskLevel: 'critical',
    parameters: [
      { label: 'Electrical load', value: '92%', threshold: '>80%', breached: true },
      { label: 'Smoke optical density (OD)', value: '0.14', threshold: '>0.10', breached: true },
    ],
    recommendedAction: 'Map hotspots for inspections & hydrant placement. Dispatch FFS audit team.',
    lastAssessed: '2024-03-24T15:10:00',
  },
  {
    id: 'FRZ002', zoneName: 'Onitsha Main Market', zoneType: 'urban_market', state: 'Anambra', lga: 'Onitsha North',
    probabilityPercent: 64, riskLevel: 'high',
    parameters: [
      { label: 'Electrical load', value: '83%', threshold: '>80%', breached: true },
      { label: 'Smoke optical density (OD)', value: '0.08', threshold: '>0.10', breached: false },
    ],
    recommendedAction: 'Hydrant inspection scheduled. Notify market union.',
    lastAssessed: '2024-03-24T14:45:00',
  },
  {
    id: 'FRZ003', zoneName: 'Sambisa Forest Fringe', zoneType: 'forest_reserve', state: 'Borno', lga: 'Konduga',
    probabilityPercent: 78, riskLevel: 'high',
    parameters: [
      { label: 'NDVI', value: '0.22', threshold: '<0.30', breached: true },
      { label: 'Relative humidity', value: '24%', threshold: '<30%', breached: true },
      { label: 'Wind speed', value: '28 km/h', threshold: '>20 km/h', breached: true },
    ],
    recommendedAction: 'Predict wildfire spread; pre-position firebreaks along Bama corridor.',
    lastAssessed: '2024-03-24T14:30:00',
  },
  {
    id: 'FRZ004', zoneName: 'Jos Plateau Grasslands', zoneType: 'forest_reserve', state: 'Plateau', lga: 'Jos South',
    probabilityPercent: 41, riskLevel: 'moderate',
    parameters: [
      { label: 'NDVI', value: '0.34', threshold: '<0.30', breached: false },
      { label: 'Relative humidity', value: '28%', threshold: '<30%', breached: true },
      { label: 'Wind speed', value: '14 km/h', threshold: '>20 km/h', breached: false },
    ],
    recommendedAction: 'Monitor; community fire wardens on standby.',
    lastAssessed: '2024-03-24T13:50:00',
  },
  {
    id: 'FRZ005', zoneName: 'Kano Industrial Layout', zoneType: 'industrial_site', state: 'Kano', lga: 'Nassarawa',
    probabilityPercent: 72, riskLevel: 'high',
    parameters: [
      { label: 'VOC concentration', value: '14 ppm', threshold: '>10 ppm', breached: true },
      { label: 'Temperature rise (ΔT/min)', value: '7 °C', threshold: '>10 °C/min', breached: false },
    ],
    recommendedAction: 'Monitor chemical storage; enforce safety drills at affected plants.',
    lastAssessed: '2024-03-24T15:00:00',
  },
  {
    id: 'FRZ006', zoneName: 'Kaduna Refinery Perimeter', zoneType: 'industrial_site', state: 'Kaduna', lga: 'Chikun',
    probabilityPercent: 91, riskLevel: 'critical',
    parameters: [
      { label: 'VOC concentration', value: '18 ppm', threshold: '>10 ppm', breached: true },
      { label: 'Temperature rise (ΔT/min)', value: '12 °C', threshold: '>10 °C/min', breached: true },
    ],
    recommendedAction: 'Immediate plant shutdown protocol; evacuate downwind communities.',
    lastAssessed: '2024-03-24T15:15:00',
  },
  {
    id: 'FRZ007', zoneName: 'Apapa Port Tank Farms', zoneType: 'critical_infrastructure', state: 'Lagos', lga: 'Apapa',
    probabilityPercent: 68, riskLevel: 'high',
    parameters: [
      { label: 'Historical incidents', value: '4.1 fires/km²/yr', threshold: '>3 fires/km²/yr', breached: true },
      { label: 'Proximity to ignition sources', value: '120 m', threshold: '<200 m', breached: true },
    ],
    recommendedAction: 'Prioritize protection; verify evacuation routes and foam reserves.',
    lastAssessed: '2024-03-24T14:55:00',
  },
  {
    id: 'FRZ008', zoneName: 'Abuja National Hospital Complex', zoneType: 'critical_infrastructure', state: 'FCT', lga: 'AMAC',
    probabilityPercent: 33, riskLevel: 'moderate',
    parameters: [
      { label: 'Historical incidents', value: '2.2 fires/km²/yr', threshold: '>3 fires/km²/yr', breached: false },
      { label: 'Proximity to ignition sources', value: '320 m', threshold: '<200 m', breached: false },
    ],
    recommendedAction: 'Routine quarterly drill; verify suppression systems.',
    lastAssessed: '2024-03-24T13:00:00',
  },
];

/** Pin-able incidents reported by communities/FFS. No severity field. */
export const fireIncidents: FireIncident[] = [
  { id: 'FIR001', location: 'Balogun Market', state: 'Lagos', lga: 'Lagos Island', zoneType: 'urban_market', status: 'Active', reportedAt: '2024-03-24T13:42:00', reporterName: 'FFS Lagos HQ', notes: 'Electrical fire in textile section.' },
  { id: 'FIR002', location: 'Sambisa Fringe', state: 'Borno', lga: 'Konduga', zoneType: 'forest_reserve', status: 'Active', reportedAt: '2024-03-24T12:15:00', reporterName: 'Community FP', notes: 'Bush fire spreading north-east.' },
  { id: 'FIR003', location: 'Apo Mechanic Village', state: 'FCT', lga: 'AMAC', zoneType: 'urban_market', status: 'Contained', reportedAt: '2024-03-24T10:08:00', reporterName: 'FFS Wuse', notes: 'Vehicle fire — contained within 1h.' },
  { id: 'FIR004', location: 'Kano Industrial Layout', state: 'Kano', lga: 'Nassarawa', zoneType: 'industrial_site', status: 'Contained', reportedAt: '2024-03-24T09:30:00', reporterName: 'Plant Safety Officer', notes: 'Chemical spill ignited; foam deployed.' },
  { id: 'FIR005', location: 'Kaduna Refinery Perimeter', state: 'Kaduna', lga: 'Chikun', zoneType: 'critical_infrastructure', status: 'Active', reportedAt: '2024-03-24T14:55:00', reporterName: 'NNPC Liaison', notes: 'Tank-farm vapour ignition — units enroute.' },
];

export const fireStations: FireStation[] = [
  { station: 'Lagos HQ — Ijora', state: 'Lagos', personnel: 142, trucks: 18, waterCapacityKL: 240, readiness: 'Ready', activeIncidents: 3, lastDrill: '2024-03-18' },
  { station: 'Abuja Central — Wuse', state: 'FCT', personnel: 96, trucks: 12, waterCapacityKL: 160, readiness: 'Ready', activeIncidents: 1, lastDrill: '2024-03-20' },
  { station: 'Kano Sabon Gari', state: 'Kano', personnel: 78, trucks: 9, waterCapacityKL: 120, readiness: 'Partial', activeIncidents: 1, lastDrill: '2024-03-10' },
  { station: 'Port Harcourt Trans-Amadi', state: 'Rivers', personnel: 84, trucks: 10, waterCapacityKL: 140, readiness: 'Ready', activeIncidents: 0, lastDrill: '2024-03-15' },
  { station: 'Kaduna Tudun Wada', state: 'Kaduna', personnel: 64, trucks: 8, waterCapacityKL: 100, readiness: 'Partial', activeIncidents: 2, lastDrill: '2024-03-05' },
  { station: 'Maiduguri Bama Road', state: 'Borno', personnel: 52, trucks: 6, waterCapacityKL: 80, readiness: 'Limited', activeIncidents: 1, lastDrill: '2024-02-28' },
  { station: 'Onitsha Awka Road', state: 'Anambra', personnel: 58, trucks: 7, waterCapacityKL: 90, readiness: 'Ready', activeIncidents: 0, lastDrill: '2024-03-22' },
  { station: 'Jos Bukuru Depot', state: 'Plateau', personnel: 46, trucks: 5, waterCapacityKL: 70, readiness: 'Partial', activeIncidents: 0, lastDrill: '2024-03-08' },
];

export const nihsaReadings: NIHSAReading[] = [
  { station: 'Lokoja', riverLevel: 8.4, maxLevel: 10.2, groundWater: 3.2, waterQuality: 'Moderate', turbidity: 45, trend: 'rising', state: 'Kogi' },
  { station: 'Makurdi', riverLevel: 9.1, maxLevel: 11.0, groundWater: 2.8, waterQuality: 'Good', turbidity: 32, trend: 'rising', state: 'Benue' },
  { station: 'Jebba', riverLevel: 7.2, maxLevel: 9.5, groundWater: 4.1, waterQuality: 'Good', turbidity: 28, trend: 'stable', state: 'Kwara' },
  { station: 'Onitsha', riverLevel: 6.8, maxLevel: 8.8, groundWater: 3.5, waterQuality: 'Moderate', turbidity: 52, trend: 'falling', state: 'Anambra' },
  { station: 'Yola', riverLevel: 5.6, maxLevel: 7.4, groundWater: 2.1, waterQuality: 'Poor', turbidity: 68, trend: 'rising', state: 'Adamawa' },
  { station: 'Ibi', riverLevel: 7.9, maxLevel: 9.8, groundWater: 3.0, waterQuality: 'Moderate', turbidity: 41, trend: 'stable', state: 'Taraba' },
];

export const nimetReadings: NIMETReading[] = [
  { station: 'Sokoto', temperature: 44.2, heatIndex: 48, flashRainProb: 15, humidity: 22, state: 'Sokoto' },
  { station: 'Maiduguri', temperature: 42.8, heatIndex: 46, flashRainProb: 10, humidity: 18, state: 'Borno' },
  { station: 'Kano', temperature: 41.5, heatIndex: 44, flashRainProb: 20, humidity: 25, state: 'Kano' },
  { station: 'Abuja', temperature: 36.2, heatIndex: 38, flashRainProb: 45, humidity: 55, state: 'FCT' },
  { station: 'Lagos', temperature: 33.1, heatIndex: 37, flashRainProb: 60, humidity: 72, state: 'Lagos' },
  { station: 'Calabar', temperature: 31.8, heatIndex: 35, flashRainProb: 70, humidity: 80, state: 'Cross River' },
];

export const focalPersons: FocalPerson[] = [
  { id: 'FP001', name: 'Abubakar Ibrahim', ward: 'Kaura Ward', lga: 'Kaura', state: 'Kaduna', lat: 9.65, lng: 8.32, phoneNumber: '+2348012345001', status: 'active', lastReport: '2h ago' },
  { id: 'FP002', name: 'Fatima Yusuf', ward: 'Gwagwalada Central', lga: 'Gwagwalada', state: 'FCT', lat: 8.94, lng: 7.08, phoneNumber: '+2348012345002', status: 'active', lastReport: '30m ago' },
  { id: 'FP003', name: 'Chinedu Okafor', ward: 'Onitsha North', lga: 'Onitsha North', state: 'Anambra', lat: 6.14, lng: 6.78, phoneNumber: '+2348012345003', status: 'active', lastReport: '1h ago' },
  { id: 'FP004', name: 'Musa Bello', ward: 'Jimeta Ward', lga: 'Yola North', state: 'Adamawa', lat: 9.28, lng: 12.46, phoneNumber: '+2348012345004', status: 'active', lastReport: '45m ago' },
  { id: 'FP005', name: 'Amina Sani', ward: 'Birnin Kebbi', lga: 'Birnin Kebbi', state: 'Kebbi', lat: 12.45, lng: 4.20, phoneNumber: '+2348012345005', status: 'inactive', lastReport: '6h ago' },
  { id: 'FP006', name: 'Emeka Nwosu', ward: 'Owerri Municipal', lga: 'Owerri Municipal', state: 'Imo', lat: 5.48, lng: 7.03, phoneNumber: '+2348012345006', status: 'active', lastReport: '15m ago' },
  { id: 'FP007', name: 'Hadiza Mohammed', ward: 'Maiduguri Metro', lga: 'Maiduguri', state: 'Borno', lat: 11.84, lng: 13.16, phoneNumber: '+2348012345007', status: 'active', lastReport: '2h ago' },
  { id: 'FP008', name: 'Tunde Adeyemi', ward: 'Ibadan North', lga: 'Ibadan North', state: 'Oyo', lat: 7.40, lng: 3.92, phoneNumber: '+2348012345008', status: 'active', lastReport: '1h ago' },
];

export const agencies: Agency[] = [
  { code: 'NIHSA', name: 'NIHSA', fullName: 'Nigeria Hydrological Services Agency', role: 'Hydrological data & flood forecasting', activeAlerts: 14, personnelDeployed: 320 },
  { code: 'NIMET', name: 'NiMet', fullName: 'Nigerian Meteorological Agency', role: 'Weather forecasting & climate data', activeAlerts: 8, personnelDeployed: 180 },
  { code: 'NEMA', name: 'NEMA', fullName: 'National Emergency Management Agency', role: 'Lead Agency — Emergency response coordination', activeAlerts: 22, personnelDeployed: 540 },
  { code: 'NCDC', name: 'NCDC', fullName: 'Nigeria Centre for Disease Control', role: 'Epidemic surveillance & response', activeAlerts: 5, personnelDeployed: 210 },
  { code: 'NOA', name: 'NOA', fullName: 'National Orientation Agency', role: 'Public awareness & sensitization', activeAlerts: 3, personnelDeployed: 450 },
  { code: 'SEMA', name: 'SEMA', fullName: 'State Emergency Management Agency', role: 'State-level emergency coordination', activeAlerts: 18, personnelDeployed: 860 },
  { code: 'LEMA', name: 'LEMA', fullName: 'Local Emergency Management Agency', role: 'LGA-level response & community liaison', activeAlerts: 31, personnelDeployed: 1200 },
  { code: 'FFS', name: 'FFS', fullName: 'Federal Fire Service', role: 'Fire prevention, suppression & rescue operations', activeAlerts: 11, personnelDeployed: 620 },
];

export type DiseaseType = 'Cholera' | 'Lassa Fever' | 'Measles' | 'Meningitis' | 'Yellow Fever';

export interface EpidemicReading {
  state: string;
  disease: DiseaseType;
  suspectedCases: number;
  confirmedCases: number;
  fatalities: number;
  caseFatalityRate: number;
  attackRatePer100k: number;
  riskLevel: 'high' | 'moderate' | 'low';
  lastUpdated: string;
}

export const epidemicReadings: EpidemicReading[] = [
  { state: 'Borno', disease: 'Cholera', suspectedCases: 412, confirmedCases: 168, fatalities: 14, caseFatalityRate: 3.4, attackRatePer100k: 9.1, riskLevel: 'high', lastUpdated: '2024-03-24T13:00:00' },
  { state: 'Adamawa', disease: 'Cholera', suspectedCases: 286, confirmedCases: 102, fatalities: 8, caseFatalityRate: 2.8, attackRatePer100k: 6.2, riskLevel: 'high', lastUpdated: '2024-03-24T12:30:00' },
  { state: 'Yobe', disease: 'Cholera', suspectedCases: 145, confirmedCases: 58, fatalities: 4, caseFatalityRate: 2.7, attackRatePer100k: 4.0, riskLevel: 'moderate', lastUpdated: '2024-03-24T11:45:00' },
  { state: 'Edo', disease: 'Lassa Fever', suspectedCases: 89, confirmedCases: 41, fatalities: 9, caseFatalityRate: 21.9, attackRatePer100k: 1.8, riskLevel: 'high', lastUpdated: '2024-03-24T10:20:00' },
  { state: 'Ondo', disease: 'Lassa Fever', suspectedCases: 64, confirmedCases: 28, fatalities: 5, caseFatalityRate: 17.8, attackRatePer100k: 1.2, riskLevel: 'moderate', lastUpdated: '2024-03-24T09:50:00' },
  { state: 'Bauchi', disease: 'Lassa Fever', suspectedCases: 37, confirmedCases: 14, fatalities: 2, caseFatalityRate: 14.2, attackRatePer100k: 0.7, riskLevel: 'moderate', lastUpdated: '2024-03-24T08:15:00' },
  { state: 'Kano', disease: 'Meningitis', suspectedCases: 218, confirmedCases: 92, fatalities: 11, caseFatalityRate: 5.0, attackRatePer100k: 2.4, riskLevel: 'high', lastUpdated: '2024-03-24T11:10:00' },
  { state: 'Sokoto', disease: 'Meningitis', suspectedCases: 132, confirmedCases: 48, fatalities: 6, caseFatalityRate: 4.5, attackRatePer100k: 2.1, riskLevel: 'moderate', lastUpdated: '2024-03-24T10:00:00' },
  { state: 'Lagos', disease: 'Measles', suspectedCases: 98, confirmedCases: 35, fatalities: 1, caseFatalityRate: 1.0, attackRatePer100k: 0.5, riskLevel: 'low', lastUpdated: '2024-03-24T07:30:00' },
  { state: 'Kaduna', disease: 'Measles', suspectedCases: 76, confirmedCases: 22, fatalities: 0, caseFatalityRate: 0, attackRatePer100k: 0.4, riskLevel: 'low', lastUpdated: '2024-03-24T07:00:00' },
];

// === NEMA: emergency response operations ===
export type ResponseStatus = 'Mobilizing' | 'On Site' | 'Stand Down' | 'Closed';
export interface NEMAOperation {
  id: string;
  incident: string;
  hazard: HazardType;
  state: string;
  lga: string;
  affectedPersons: number;
  displacedPersons: number;
  iDPCamps: number;
  reliefTrucks: number;
  status: ResponseStatus;
  startedAt: string;
}
export const nemaOperations: NEMAOperation[] = [
  { id: 'OPS-2401', incident: 'River Niger Flood Surge', hazard: 'flood', state: 'Kogi', lga: 'Lokoja', affectedPersons: 24500, displacedPersons: 8200, iDPCamps: 6, reliefTrucks: 14, status: 'On Site', startedAt: '2024-03-22T08:00:00' },
  { id: 'OPS-2402', incident: 'Benue Riverbank Inundation', hazard: 'flood', state: 'Benue', lga: 'Makurdi', affectedPersons: 18700, displacedPersons: 5400, iDPCamps: 4, reliefTrucks: 11, status: 'On Site', startedAt: '2024-03-23T10:30:00' },
  { id: 'OPS-2403', incident: 'Heatwave Mass Casualty', hazard: 'heatwave', state: 'Sokoto', lga: 'Sokoto South', affectedPersons: 9200, displacedPersons: 0, iDPCamps: 0, reliefTrucks: 4, status: 'Mobilizing', startedAt: '2024-03-24T06:15:00' },
  { id: 'OPS-2404', incident: 'Kaduna Refinery Fire', hazard: 'fire', state: 'Kaduna', lga: 'Chikun', affectedPersons: 3800, displacedPersons: 1200, iDPCamps: 2, reliefTrucks: 7, status: 'On Site', startedAt: '2024-03-24T14:55:00' },
  { id: 'OPS-2405', incident: 'Cholera Outbreak Response', hazard: 'epidemic', state: 'Borno', lga: 'Maiduguri', affectedPersons: 6400, displacedPersons: 0, iDPCamps: 0, reliefTrucks: 5, status: 'On Site', startedAt: '2024-03-21T09:00:00' },
  { id: 'OPS-2406', incident: 'North-East Drought Relief', hazard: 'drought', state: 'Yobe', lga: 'Damaturu', affectedPersons: 12300, displacedPersons: 0, iDPCamps: 0, reliefTrucks: 9, status: 'Mobilizing', startedAt: '2024-03-24T05:00:00' },
];

// === NOA: public sensitization campaigns ===
export interface NOACampaign {
  id: string;
  campaign: string;
  hazard: HazardType;
  states: string[];
  channels: string[];
  languages: string[];
  reach: number;
  status: 'Live' | 'Scheduled' | 'Completed';
  startedAt: string;
}
export const noaCampaigns: NOACampaign[] = [
  { id: 'CMP-401', campaign: 'Flood Preparedness 2024', hazard: 'flood', states: ['Kogi', 'Benue', 'Adamawa', 'Anambra'], channels: ['Radio', 'SMS', 'Town Criers'], languages: ['EN', 'HA', 'IG'], reach: 2_400_000, status: 'Live', startedAt: '2024-03-15' },
  { id: 'CMP-402', campaign: 'Cholera Hygiene Drive', hazard: 'epidemic', states: ['Borno', 'Yobe', 'Adamawa'], channels: ['Radio', 'WhatsApp'], languages: ['EN', 'HA'], reach: 1_180_000, status: 'Live', startedAt: '2024-03-20' },
  { id: 'CMP-403', campaign: 'Heatwave Safety Advisory', hazard: 'heatwave', states: ['Sokoto', 'Kebbi', 'Katsina', 'Zamfara'], channels: ['Radio', 'TV', 'SMS'], languages: ['EN', 'HA'], reach: 1_650_000, status: 'Live', startedAt: '2024-03-22' },
  { id: 'CMP-404', campaign: 'Bushfire Awareness — Harmattan', hazard: 'fire', states: ['Plateau', 'Bauchi', 'Borno', 'Niger'], channels: ['Radio', 'SMS', 'Town Criers'], languages: ['EN', 'HA'], reach: 980_000, status: 'Live', startedAt: '2024-03-10' },
  { id: 'CMP-405', campaign: 'Lassa Fever Rodent Control', hazard: 'epidemic', states: ['Edo', 'Ondo', 'Bauchi'], channels: ['Radio', 'WhatsApp', 'TV'], languages: ['EN', 'YO'], reach: 720_000, status: 'Scheduled', startedAt: '2024-03-26' },
];

// === SEMA: state-level coordination ===
export interface SEMAState {
  state: string;
  activeIncidents: number;
  hazardsTracked: HazardType[];
  fieldOfficers: number;
  shelterCapacity: number;
  shelterOccupancy: number;
  preparednessScore: number; // 0-100
  riskLevel: 'high' | 'moderate' | 'low';
  lastUpdated: string;
}
export const semaStates: SEMAState[] = [
  { state: 'Kogi', activeIncidents: 7, hazardsTracked: ['flood', 'epidemic'], fieldOfficers: 84, shelterCapacity: 12000, shelterOccupancy: 8200, preparednessScore: 72, riskLevel: 'high', lastUpdated: '2024-03-24T14:00:00' },
  { state: 'Benue', activeIncidents: 5, hazardsTracked: ['flood'], fieldOfficers: 76, shelterCapacity: 9000, shelterOccupancy: 5400, preparednessScore: 68, riskLevel: 'high', lastUpdated: '2024-03-24T13:30:00' },
  { state: 'Borno', activeIncidents: 6, hazardsTracked: ['epidemic', 'fire', 'drought'], fieldOfficers: 102, shelterCapacity: 14500, shelterOccupancy: 6400, preparednessScore: 64, riskLevel: 'high', lastUpdated: '2024-03-24T13:00:00' },
  { state: 'Adamawa', activeIncidents: 4, hazardsTracked: ['flood', 'epidemic'], fieldOfficers: 68, shelterCapacity: 7500, shelterOccupancy: 3100, preparednessScore: 70, riskLevel: 'moderate', lastUpdated: '2024-03-24T12:30:00' },
  { state: 'Sokoto', activeIncidents: 3, hazardsTracked: ['heatwave', 'epidemic'], fieldOfficers: 52, shelterCapacity: 5200, shelterOccupancy: 1800, preparednessScore: 66, riskLevel: 'moderate', lastUpdated: '2024-03-24T12:00:00' },
  { state: 'Kaduna', activeIncidents: 4, hazardsTracked: ['fire', 'flood'], fieldOfficers: 88, shelterCapacity: 8800, shelterOccupancy: 2400, preparednessScore: 78, riskLevel: 'moderate', lastUpdated: '2024-03-24T11:30:00' },
  { state: 'Lagos', activeIncidents: 5, hazardsTracked: ['fire', 'flood'], fieldOfficers: 156, shelterCapacity: 18000, shelterOccupancy: 4200, preparednessScore: 86, riskLevel: 'moderate', lastUpdated: '2024-03-24T11:00:00' },
  { state: 'Anambra', activeIncidents: 3, hazardsTracked: ['flood'], fieldOfficers: 64, shelterCapacity: 6500, shelterOccupancy: 1600, preparednessScore: 74, riskLevel: 'low', lastUpdated: '2024-03-24T10:30:00' },
];

export const disseminationStats = {
  conventional: {
    label: 'Conventional Layer',
    description: 'Government institutional channels',
    channels: [
      { name: 'NEMA Coordination', reached: 36, total: 36, unit: 'States + FCT' },
      { name: 'SEMA Operations', reached: 34, total: 36, unit: 'State Agencies' },
      { name: 'NOA Sensitization', reached: 680, total: 774, unit: 'LGAs' },
    ],
  },
  unconventional: {
    label: 'Unconventional Layer (GitMatrix)',
    description: 'Last-mile community focal person network',
    channels: [
      { name: 'State Coordinators', reached: 36, total: 37, unit: '36 States + FCT' },
      { name: 'LGA Focal Officers', reached: 712, total: 774, unit: 'LGAs' },
      { name: 'Ward/Community Focal Persons', reached: 7124, total: 7840, unit: 'Wards' },
    ],
  },
};
