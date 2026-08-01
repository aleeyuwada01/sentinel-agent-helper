import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Download, FileText, Layers, Radio, Users, X } from 'lucide-react';
import {
  boundaryLabels,
  getIncidentsFor,
  getSubRegions,
  type SubRegion,
} from '@/data/adminBoundaries';
import type { CountryProfile } from '@/data/westAfrica';
import type { HazardType } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { useDataVersion } from '@/hooks/useDataVersion';
import { filterIncidents, filterSubRegions } from '@/data/accessControl';
import { downloadIncidentCsv, downloadIncidentPdf, downloadIncidentsCsv } from '@/lib/incidentReport';

type View = 'risk' | 'vulnerability';
type Level = 1 | 2;

interface Tile {
  key: string;
  label: string;
  parent?: string;
  gx: number;
  gy: number;
  value: number;
  meta: string;
  sub?: SubRegion;
  riskLevel: 'high' | 'moderate' | 'low';
}

const riskFills = {
  high: 'hsl(0 72% 55%)',
  moderate: 'hsl(25 95% 58%)',
  low: 'hsl(142 71% 45%)',
};

const bucket = (pct: number): Tile['riskLevel'] => (pct >= 66 ? 'high' : pct >= 40 ? 'moderate' : 'low');

const CELL = 78;
const GAP = 6;
const PAD = 14;

interface Props {
  country: CountryProfile;
  hazard: HazardType;
  title: string;
  icon: React.ReactNode;
}

/**
 * Cartogram that shades the correct administrative boundary layer for the
 * selected country (states/LGAs, regions/districts, districts/chiefdoms,
 * districts/communes) and exposes focal-person + incident detail on click.
 */
const AdminBoundaryMap = ({ country, hazard, title, icon }: Props) => {
  const labels = boundaryLabels[country.code];
  const [level, setLevel] = useState<Level>(1);
  const [view, setView] = useState<View>('risk');
  const [hovered, setHovered] = useState<Tile | null>(null);
  const [selected, setSelected] = useState<Tile | null>(null);

  const { scope } = useAuth();
  const dataVersion = useDataVersion();
  const subs = useMemo(
    () => filterSubRegions(scope, getSubRegions(country.code)),
    [scope, country.code, dataVersion],
  );
  /** Level-1 units the account may see, including any parents added by an import. */
  const regions = useMemo(() => {
    const base = country.regions.filter((r) => !scope.level1 || r.name === scope.level1);
    const known = new Set(base.map((r) => r.name));
    const extras = [...new Set(subs.map((s) => s.parent))].filter((p) => !known.has(p));
    let slot = base.length;
    return [
      ...base,
      ...extras.map((name) => ({
        name,
        gx: slot % 4,
        gy: Math.floor(slot++ / 4) + Math.max(0, ...base.map((r) => r.gy)) + 1,
        basin: 'Imported dataset',
        vulnerablePopulation: subs.filter((s) => s.parent === name).reduce((t, s) => t + s.population, 0),
        risk: subs.find((s) => s.parent === name)?.risk ?? ({} as Record<HazardType, number>),
      })),
    ] as typeof country.regions;
  }, [country.regions, scope.level1, subs]);

  const tiles = useMemo<Tile[]>(() => {
    if (level === 1) {
      const maxPop = Math.max(...regions.map((r) => r.vulnerablePopulation), 1);
      return regions.map((r) => {
        const value =
          view === 'risk' ? r.risk[hazard] : Math.round((r.vulnerablePopulation / maxPop) * 100);
        return {
          key: r.name,
          label: r.name,
          gx: r.gx,
          gy: r.gy,
          value,
          meta: view === 'risk' ? r.basin : `${r.vulnerablePopulation.toLocaleString()} exposed`,
          riskLevel: bucket(value),
        };
      });
    }

    // Level 2 — expand each parent tile into a 2-wide mini grid.
    const perParent = new Map<string, SubRegion[]>();
    subs.forEach((s) => {
      const list = perParent.get(s.parent) ?? [];
      list.push(s);
      perParent.set(s.parent, list);
    });
    const maxHouseholds = Math.max(...subs.map((s) => s.households), 1);

    return regions.flatMap((r) => {
      const list = perParent.get(r.name) ?? [];
      const rowsInParent = Math.max(...list.map((s) => s.gy), 0) + 1;
      return list.map((s) => {
        const value =
          view === 'risk' ? s.risk[hazard] : Math.round((s.households / maxHouseholds) * 100);
        return {
          key: `${r.name}/${s.name}`,
          label: s.name,
          parent: r.name,
          gx: r.gx * 2 + s.gx,
          gy: r.gy * rowsInParent + s.gy,
          value,
          meta:
            view === 'risk'
              ? `${r.name} · ${labels.level2Singular}`
              : `${s.households.toLocaleString()} households`,
          sub: s,
          riskLevel: bucket(value),
        };
      });
    });
  }, [regions, hazard, level, view, subs, labels.level2Singular]);

  const cols = Math.max(...tiles.map((t) => t.gx)) + 1;
  const rowCount = Math.max(...tiles.map((t) => t.gy)) + 1;
  const cell = level === 2 ? CELL * 0.72 : CELL;
  const width = PAD * 2 + cols * cell + (cols - 1) * GAP;
  const height = PAD * 2 + rowCount * cell + (rowCount - 1) * GAP;

  const selectedIncidents = selected?.sub
    ? filterIncidents(scope, getIncidentsFor(country.code, selected.sub.name))
    : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="data-grid">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {icon}
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        <span className="text-[10px] font-mono text-muted-foreground">
          {level === 1 ? `${regions.length} ${labels.level1}` : `${subs.length} ${labels.level2}`}
        </span>

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded border border-border bg-secondary/40 p-0.5 text-[10px]">
            {([1, 2] as Level[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLevel(l);
                  setSelected(null);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  level === l ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="h-3 w-3" /> {l === 1 ? labels.level1 : labels.level2}
              </button>
            ))}
          </div>
          <div className="inline-flex rounded border border-border bg-secondary/40 p-0.5 text-[10px]">
            <button
              onClick={() => setView('risk')}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                view === 'risk' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <AlertTriangle className="h-3 w-3" /> Risk
            </button>
            <button
              onClick={() => setView('vulnerability')}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                view === 'vulnerability'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="h-3 w-3" /> Vulnerability
            </button>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground mb-2">
        {view === 'risk'
          ? `${hazard[0].toUpperCase()}${hazard.slice(1)} probability shaded by ${level === 1 ? labels.level1Singular.toLowerCase() : labels.level2Singular.toLowerCase()} boundary.`
          : `Household exposure by ${level === 1 ? labels.level1Singular.toLowerCase() : labels.level2Singular.toLowerCase()} boundary.`}
        {level === 2 && ' Click a tile for focal person and incident detail.'}
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
        <div className="relative h-[440px] rounded-lg overflow-hidden border border-border">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            onMouseLeave={() => setHovered(null)}
          >
            <rect x="0" y="0" width={width} height={height} fill="hsl(215 30% 12%)" rx="8" />
            {tiles.map((t) => {
              const x = PAD + t.gx * (cell + GAP);
              const y = PAD + t.gy * (cell + GAP);
              const active = hovered?.key === t.key || selected?.key === t.key;
              return (
                <g
                  key={t.key}
                  onMouseEnter={() => setHovered(t)}
                  onClick={() => setSelected(t.sub ? t : null)}
                  className={t.sub ? 'cursor-pointer' : 'cursor-default'}
                >
                  <rect
                    x={x}
                    y={y}
                    width={cell}
                    height={cell}
                    rx="7"
                    fill={riskFills[t.riskLevel]}
                    fillOpacity={active ? 0.95 : 0.66}
                    stroke={active ? 'hsl(0 0% 100%)' : 'hsl(215 20% 20%)'}
                    strokeWidth={active ? 2 : 1}
                  />
                  <text
                    x={x + cell / 2}
                    y={y + cell / 2 - 5}
                    textAnchor="middle"
                    fill="hsl(0 0% 98%)"
                    fontSize={level === 2 ? 7.5 : 10}
                    fontWeight="600"
                    className="pointer-events-none select-none"
                  >
                    {t.label.length > (level === 2 ? 14 : 13)
                      ? `${t.label.slice(0, level === 2 ? 13 : 12)}…`
                      : t.label}
                  </text>
                  <text
                    x={x + cell / 2}
                    y={y + cell / 2 + 11}
                    textAnchor="middle"
                    fill="hsl(0 0% 98%)"
                    fontSize={level === 2 ? 10 : 13}
                    fontWeight="700"
                    className="pointer-events-none select-none font-mono"
                  >
                    {t.value}%
                  </text>
                </g>
              );
            })}
          </svg>

          {hovered && !selected && (
            <div className="absolute left-2 bottom-2 z-10 pointer-events-none bg-card border border-border rounded-lg shadow-xl p-3 min-w-[190px]">
              <p className="text-xs font-bold text-foreground">{hovered.label}</p>
              <p className="text-[10px] text-muted-foreground">{hovered.meta}</p>
              <p className="text-[10px] font-mono text-foreground mt-1">
                {view === 'risk' ? 'Probability' : 'Exposure'}: {hovered.value}%
              </p>
              {hovered.sub && (
                <p className="text-[10px] font-mono text-muted-foreground">
                  Focal person: {hovered.sub.focalPerson.name}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Detail drawer */}
        <div className="rounded-lg border border-border bg-secondary/30 p-3 min-h-[200px]">
          {!selected?.sub ? (
            <div className="text-[11px] text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground text-xs">Boundary detail</p>
              <p>
                Switch to the {labels.level2} layer and click a boundary to see the focal person on the
                ground, what triggered each alert and how many households were reached.
              </p>
              <div className="pt-2 space-y-1">
                {[
                  { label: 'High', color: 'bg-alert-red' },
                  { label: 'Moderate', color: 'bg-alert-orange' },
                  { label: 'Low', color: 'bg-alert-green' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 text-[10px]">
                    <div className={`h-2.5 w-2.5 rounded-full ${l.color}`} />
                    {view === 'risk' ? `${l.label} risk` : `${l.label} exposure`}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-foreground">{selected.sub.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {selected.sub.parent} {labels.level1Singular} · {selected.sub.level3Count} {labels.level3}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Close boundary detail"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="rounded-md border border-border bg-card p-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1 mb-1">
                  <Radio className="h-3 w-3 text-primary" /> Focal person
                </p>
                <p className="text-[11px] font-semibold text-foreground">{selected.sub.focalPerson.name}</p>
                <p className="text-[10px] text-muted-foreground">{selected.sub.focalPerson.role}</p>
                <p className="text-[10px] font-mono text-foreground">{selected.sub.focalPerson.phone}</p>
                <p className="text-[10px] text-muted-foreground">
                  {selected.sub.focalPerson.agency} · trained {selected.sub.focalPerson.trainedOn} · last report{' '}
                  {selected.sub.focalPerson.lastReport}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <p className="text-muted-foreground">Households</p>
                  <p className="font-mono text-foreground">{selected.sub.households.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reached</p>
                  <p className="font-mono text-alert-green">
                    {selected.sub.householdsReached.toLocaleString()} (
                    {Math.round((selected.sub.householdsReached / selected.sub.households) * 100)}%)
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Population</p>
                  <p className="font-mono text-foreground">{selected.sub.population.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dominant hazard</p>
                  <p className="font-mono text-foreground capitalize">{selected.sub.dominantHazard}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Incidents ({selectedIncidents.length})
                  </p>
                  {selectedIncidents.length > 0 && (
                    <button
                      onClick={() =>
                        downloadIncidentsCsv(
                          selectedIncidents,
                          `${country.code}-${selected.sub!.name.replace(/\s+/g, '-')}-incidents.csv`,
                        )
                      }
                      className="ml-auto inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                    >
                      <Download className="h-3 w-3" /> Export all
                    </button>
                  )}
                </div>
                {selectedIncidents.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground">
                    No recorded incident — boundary under routine monitoring.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {selectedIncidents.map((inc) => (
                      <div key={inc.id} className="rounded-md border border-border bg-card p-2">
                        <p className="text-[10px] font-semibold text-foreground">{inc.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{inc.cause}</p>
                        <p className="text-[10px] font-mono text-foreground mt-1">
                          {inc.parameter}: {inc.reading} (thr {inc.threshold})
                        </p>
                        <p className="text-[10px] font-mono text-alert-green">
                          {inc.householdsReached.toLocaleString()} / {inc.householdsTargeted.toLocaleString()}{' '}
                          households reached
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => downloadIncidentPdf(inc, labels, country.name)}
                            className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-1 text-[10px] text-foreground hover:bg-secondary transition-colors"
                          >
                            <FileText className="h-3 w-3" /> PDF report
                          </button>
                          <button
                            onClick={() => downloadIncidentCsv(inc, labels)}
                            className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-1 text-[10px] text-foreground hover:bg-secondary transition-colors"
                          >
                            <Download className="h-3 w-3" /> CSV
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminBoundaryMap;
