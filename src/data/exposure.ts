/**
 * Household and building-footprint exposure model.
 *
 * Deterministic (seeded) estimates derived from the boundary population /
 * household figures already held for each level-2 unit, so the numbers stay
 * stable between renders and match imported datasets when present.
 */

import type { CountryCode } from './westAfrica';
import { getSubRegions, type SubRegion } from './adminBoundaries';
import type { HazardType } from './mockData';

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
};
const unit = (s: string) => (hash(s) % 10000) / 10000;

export interface Exposure {
  /** Total households in the unit */
  households: number;
  /** Mapped building footprints (residential + non-residential) */
  buildings: number;
  residential: number;
  nonResidential: number;
  /** Critical facilities: clinics, schools, markets, water points */
  criticalFacilities: number;
  /** Built-up footprint area in hectares */
  footprintHa: number;
  /** Households inside the modelled hazard extent */
  householdsAffected: number;
  /** Building footprints inside the modelled hazard extent */
  buildingsAffected: number;
  /** Share of footprints inside the hazard extent, 0-100 */
  exposedPercent: number;
}

/** Exposure for one level-2 unit, for a given hazard layer. */
export const exposureFor = (sub: SubRegion, hazard: HazardType = sub.dominantHazard): Exposure => {
  const seed = `${sub.countryCode}:${sub.parent}:${sub.name}`;
  const perHousehold = 1.05 + unit(`${seed}-bpH`) * 0.55;
  const buildings = Math.round(sub.households * perHousehold);
  const nonResidentialShare = 0.08 + unit(`${seed}-nr`) * 0.12;
  const nonResidential = Math.round(buildings * nonResidentialShare);
  const residential = buildings - nonResidential;
  const criticalFacilities = Math.max(3, Math.round(buildings / (900 + unit(`${seed}-cf`) * 900)));
  const avgFootprintM2 = 70 + unit(`${seed}-ft`) * 90;
  const footprintHa = Math.round((buildings * avgFootprintM2) / 10_000);

  const risk = sub.risk[hazard] ?? 0;
  const extent = Math.min(0.92, (risk / 100) * (0.55 + unit(`${seed}-${hazard}-ext`) * 0.5));
  const householdsAffected = Math.round(sub.households * extent);
  const buildingsAffected = Math.round(buildings * extent);

  return {
    households: sub.households,
    buildings,
    residential,
    nonResidential,
    criticalFacilities,
    footprintHa,
    householdsAffected,
    buildingsAffected,
    exposedPercent: Math.round(extent * 100),
  };
};

const empty: Exposure = {
  households: 0,
  buildings: 0,
  residential: 0,
  nonResidential: 0,
  criticalFacilities: 0,
  footprintHa: 0,
  householdsAffected: 0,
  buildingsAffected: 0,
  exposedPercent: 0,
};

const add = (a: Exposure, b: Exposure): Exposure => ({
  households: a.households + b.households,
  buildings: a.buildings + b.buildings,
  residential: a.residential + b.residential,
  nonResidential: a.nonResidential + b.nonResidential,
  criticalFacilities: a.criticalFacilities + b.criticalFacilities,
  footprintHa: a.footprintHa + b.footprintHa,
  householdsAffected: a.householdsAffected + b.householdsAffected,
  buildingsAffected: a.buildingsAffected + b.buildingsAffected,
  exposedPercent: 0,
});

const finish = (e: Exposure): Exposure => ({
  ...e,
  exposedPercent: e.buildings ? Math.round((e.buildingsAffected / e.buildings) * 100) : 0,
});

/** Aggregate exposure across a list of level-2 units. */
export const aggregateExposure = (subs: SubRegion[], hazard?: HazardType): Exposure =>
  finish(subs.reduce((acc, s) => add(acc, exposureFor(s, hazard ?? s.dominantHazard)), empty));

/** Exposure rolled up for one level-1 unit (state / region / district). */
export const regionExposure = (code: CountryCode, region: string, hazard?: HazardType): Exposure =>
  aggregateExposure(
    getSubRegions(code).filter((s) => s.parent === region),
    hazard,
  );

/** Exposure rolled up for a whole country. */
export const countryExposure = (code: CountryCode, hazard?: HazardType): Exposure =>
  aggregateExposure(getSubRegions(code), hazard);
