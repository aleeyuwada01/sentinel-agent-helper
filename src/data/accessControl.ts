/**
 * Role-based access control for WAMHEWS.
 *
 * Every account carries a scope: which countries it may see, which command
 * level it operates at, and (for agency heads / focal persons) which agency or
 * administrative boundary it is responsible for. All dashboards filter their
 * boundaries, panels and incidents through the helpers below.
 */

import { countries, type CountryCode } from './westAfrica';
import type { Incident, SubRegion } from './adminBoundaries';
import type { AgencyPanel } from './commandCenter';

export type Role = 'super_admin' | 'country_admin' | 'agency_admin' | 'focal_person' | 'viewer';

/** regional = West Africa Central Command, national = country HQ, level1/level2 = sub-national. */
export type CommandLevel = 'regional' | 'national' | 'level1' | 'level2';

export interface AccessScope {
  role: Role;
  /** 'all' = every deployment (regional command). */
  countries: CountryCode[] | 'all';
  commandLevel: CommandLevel;
  agencyCode?: string;
  level1?: string;
  level2?: string;
}

export const roleLabels: Record<Role, string> = {
  super_admin: 'Regional Administrator',
  country_admin: 'National Administrator',
  agency_admin: 'Agency Head / Focal Person',
  focal_person: 'Community Focal Person',
  viewer: 'Observer (read-only)',
};

export const commandLevelLabels: Record<CommandLevel, string> = {
  regional: 'West Africa Central Command',
  national: 'National Command',
  level1: 'First-level Administrative Command',
  level2: 'Local Command',
};

export const defaultScope: AccessScope = {
  role: 'viewer',
  countries: 'all',
  commandLevel: 'national',
};

/* --------------------------------------------------------------- directory */

export interface DemoAccount extends AccessScope {
  email: string;
  name: string;
  description: string;
}

export const demoAccounts: DemoAccount[] = [
  {
    email: 'director@wamhews.org',
    name: 'Dr. Amara Diallo',
    description: 'Regional Director — all four deployments, cross-country KPIs, data import.',
    role: 'super_admin',
    countries: 'all',
    commandLevel: 'regional',
  },
  {
    email: 'ng.admin@wamhews.org',
    name: 'Engr. Suleiman Bello',
    description: 'Nigeria national administrator — all states, LGAs and agency panels.',
    role: 'country_admin',
    countries: ['NG'],
    commandLevel: 'national',
  },
  {
    email: 'gh.admin@wamhews.org',
    name: 'Kwabena Mensah',
    description: 'Ghana national administrator — all regions and districts.',
    role: 'country_admin',
    countries: ['GH'],
    commandLevel: 'national',
  },
  {
    email: 'nihsa.head@wamhews.org',
    name: 'Dr. Ngozi Okonkwo',
    description: 'NIHSA agency head — Nigeria hydrological panel and flood incidents only.',
    role: 'agency_admin',
    countries: ['NG'],
    commandLevel: 'national',
    agencyCode: 'NIHSA',
  },
  {
    email: 'kogi.focal@wamhews.org',
    name: 'Blessing Lawal',
    description: 'Kogi State focal person — Kogi boundaries and incidents only.',
    role: 'focal_person',
    countries: ['NG'],
    commandLevel: 'level1',
    level1: 'Kogi',
  },
  {
    email: 'lokoja.focal@wamhews.org',
    name: 'Musa Danjuma',
    description: 'Lokoja LGA focal person — single local command unit.',
    role: 'focal_person',
    countries: ['NG'],
    commandLevel: 'level2',
    level1: 'Kogi',
    level2: 'Lokoja',
  },
  {
    email: 'sl.focal@wamhews.org',
    name: 'Isatu Kamara',
    description: 'Sierra Leone Western Area Urban focal person.',
    role: 'focal_person',
    countries: ['SL'],
    commandLevel: 'level1',
    level1: 'Western Area Urban',
  },
];

export const findDemoAccount = (email: string) =>
  demoAccounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());

/* ---------------------------------------------------------------- helpers */

export const allowedCountries = (scope: AccessScope): CountryCode[] =>
  scope.countries === 'all' ? countries.map((c) => c.code) : scope.countries;

export const canAccessCountry = (scope: AccessScope, code: CountryCode) =>
  allowedCountries(scope).includes(code);

/** Only regional command sees the cross-country comparison view. */
export const canViewRegional = (scope: AccessScope) =>
  scope.role === 'super_admin' || scope.commandLevel === 'regional' || allowedCountries(scope).length > 1;

/** Only administrators may replace datasets. */
export const canImportData = (scope: AccessScope) =>
  scope.role === 'super_admin' || scope.role === 'country_admin';

export const canImportCountry = (scope: AccessScope, code: CountryCode) =>
  canImportData(scope) && canAccessCountry(scope, code);

export const filterSubRegions = (scope: AccessScope, subs: SubRegion[]): SubRegion[] =>
  subs.filter(
    (s) =>
      canAccessCountry(scope, s.countryCode) &&
      (!scope.level1 || s.parent === scope.level1) &&
      (!scope.level2 || s.name === scope.level2),
  );

export const filterIncidents = (scope: AccessScope, incidents: Incident[]): Incident[] =>
  incidents.filter(
    (i) =>
      canAccessCountry(scope, i.countryCode) &&
      (!scope.level1 || i.level1 === scope.level1) &&
      (!scope.level2 || i.level2 === scope.level2) &&
      (!scope.agencyCode || i.agency.toUpperCase().includes(scope.agencyCode.toUpperCase())),
  );

export const filterPanels = (scope: AccessScope, panels: AgencyPanel[]): AgencyPanel[] => {
  const scoped = scope.agencyCode
    ? panels.filter((p) => p.agencyCode.toUpperCase() === scope.agencyCode!.toUpperCase())
    : panels;
  if (!scope.level1 && !scope.level2) return scoped;
  return scoped.map((p) => ({
    ...p,
    rows: p.rows.filter((r) =>
      r.cells.some((c) => (scope.level2 && c.includes(scope.level2)) || (scope.level1 && c.includes(scope.level1))),
    ),
  }));
};

/** Human-readable summary of what the signed-in account may see. */
export const scopeSummary = (scope: AccessScope) => {
  const where =
    scope.countries === 'all'
      ? 'All West Africa deployments'
      : scope.countries.map((c) => countries.find((x) => x.code === c)?.shortName ?? c).join(', ');
  const unit = scope.level2 ?? scope.level1;
  return [where, unit, scope.agencyCode].filter(Boolean).join(' · ');
};
