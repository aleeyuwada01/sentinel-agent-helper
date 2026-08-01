import { useMemo, useState } from 'react';
import { Building2, Download, Home, Layers, Landmark } from 'lucide-react';
import type { CountryProfile } from '@/data/westAfrica';
import { boundaryLabels, getSubRegions } from '@/data/adminBoundaries';
import { aggregateExposure, exposureFor } from '@/data/exposure';
import type { HazardType } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { filterSubRegions } from '@/data/accessControl';
import { useDataVersion } from '@/hooks/useDataVersion';
import { downloadBlob, toCsv } from '@/lib/csv';

const hazards: HazardType[] = ['flood', 'drought', 'epidemic', 'heatwave', 'fire'];
const fmt = (n: number) => n.toLocaleString();

/** Household and building-footprint exposure for the selected hazard layer. */
const ExposurePanel = ({ country, hazard }: { country: CountryProfile; hazard: HazardType }) => {
  const labels = boundaryLabels[country.code];
  const { scope } = useAuth();
  useDataVersion();
  const [layer, setLayer] = useState<HazardType | 'dominant'>(hazard);

  const subs = filterSubRegions(scope, getSubRegions(country.code));
  const active = layer === 'dominant' ? undefined : layer;
  const total = useMemo(() => aggregateExposure(subs, active), [subs, active]);

  const ranked = useMemo(
    () =>
      subs
        .map((s) => ({ s, e: exposureFor(s, active ?? s.dominantHazard) }))
        .sort((a, b) => b.e.buildingsAffected - a.e.buildingsAffected)
        .slice(0, 8),
    [subs, active],
  );

  const exportCsv = () =>
    downloadBlob(
      `${country.code}-exposure-${layer}.csv`,
      'text/csv;charset=utf-8',
      toCsv(
        [labels.level1Singular, labels.level2Singular, 'households', 'households_affected', 'building_footprints', 'buildings_affected', 'residential', 'non_residential', 'critical_facilities', 'footprint_area_ha', 'exposed_pct'],
        subs.map((s) => {
          const e = exposureFor(s, active ?? s.dominantHazard);
          return [s.parent, s.name, e.households, e.householdsAffected, e.buildings, e.buildingsAffected, e.residential, e.nonResidential, e.criticalFacilities, e.footprintHa, e.exposedPercent];
        }),
      ),
    );

  return (
    <section className="data-grid">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <Building2 className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm text-foreground">
          {country.shortName} — Household &amp; Building Footprint Exposure
        </h3>
        <div className="ml-auto inline-flex rounded border border-border bg-secondary/40 p-0.5 text-[10px]">
          {(['dominant', ...hazards] as (HazardType | 'dominant')[]).map((h) => (
            <button
              key={h}
              onClick={() => setLayer(h)}
              className={`px-2 py-1 rounded capitalize transition-colors ${
                layer === h ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[10px] text-foreground hover:bg-secondary transition-colors"
        >
          <Download className="h-3 w-3" /> CSV
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground mb-3">
        Footprint counts modelled from settlement density per {labels.level2Singular.toLowerCase()} and intersected
        with the {layer === 'dominant' ? 'dominant hazard' : layer} extent.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { icon: Home, label: 'Households in hazard extent', value: `${fmt(total.householdsAffected)} / ${fmt(total.households)}` },
          { icon: Building2, label: 'Building footprints affected', value: `${fmt(total.buildingsAffected)} / ${fmt(total.buildings)}` },
          { icon: Layers, label: 'Built-up area exposed', value: `${fmt(total.footprintHa)} ha` },
          { icon: Landmark, label: 'Critical facilities', value: fmt(total.criticalFacilities) },
        ].map((m) => (
          <div key={m.label} className="bg-secondary/50 rounded-md p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <m.icon className="h-3 w-3 text-primary" /> {m.label}
            </p>
            <p className="text-sm font-mono font-bold text-foreground">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="py-2 pr-3 font-medium">{labels.level2Singular}</th>
              <th className="py-2 pr-3 font-medium">{labels.level1Singular}</th>
              <th className="py-2 pr-3 font-medium">Households affected</th>
              <th className="py-2 pr-3 font-medium">Footprints affected</th>
              <th className="py-2 pr-3 font-medium">Residential / other</th>
              <th className="py-2 pr-3 font-medium">Area (ha)</th>
              <th className="py-2 font-medium">Exposed</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map(({ s, e }) => (
              <tr key={`${s.parent}-${s.name}`} className="border-b border-border/50">
                <td className="py-2 pr-3 text-foreground font-medium">{s.name}</td>
                <td className="py-2 pr-3 text-muted-foreground">{s.parent}</td>
                <td className="py-2 pr-3 font-mono text-foreground">
                  {fmt(e.householdsAffected)} <span className="text-muted-foreground">/ {fmt(e.households)}</span>
                </td>
                <td className="py-2 pr-3 font-mono text-foreground">
                  {fmt(e.buildingsAffected)} <span className="text-muted-foreground">/ {fmt(e.buildings)}</span>
                </td>
                <td className="py-2 pr-3 font-mono text-muted-foreground">
                  {fmt(e.residential)} / {fmt(e.nonResidential)}
                </td>
                <td className="py-2 pr-3 font-mono text-muted-foreground">{fmt(e.footprintHa)}</td>
                <td className="py-2 font-mono text-alert-orange">{e.exposedPercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ExposurePanel;
