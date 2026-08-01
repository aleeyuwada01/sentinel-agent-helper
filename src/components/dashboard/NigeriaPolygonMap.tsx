import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Home, MapPin, Minus, Move, Plus, RotateCcw, Users } from 'lucide-react';
import { nigeriaStates, nigeriaViewBox, type NigeriaLga } from '@/data/nigeriaGeo';
import { getCountry } from '@/data/westAfrica';
import { boundaryLabels, getIncidentsFor, getSubRegionsOf, type SubRegion } from '@/data/adminBoundaries';
import { exposureFor, regionExposure } from '@/data/exposure';
import type { HazardType } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { canAccessCountry, filterSubRegions } from '@/data/accessControl';
import { downloadIncidentCsv, downloadIncidentPdf } from '@/lib/incidentReport';

const hazards: HazardType[] = ['flood', 'drought', 'epidemic', 'heatwave', 'fire'];

const fillFor = (risk: number) =>
  risk >= 70 ? 'hsl(0 72% 55%)' : risk >= 45 ? 'hsl(25 95% 58%)' : risk >= 25 ? 'hsl(45 95% 55%)' : 'hsl(145 65% 45%)';

const fmt = (n: number) => n.toLocaleString();

interface HoverInfo {
  x: number;
  y: number;
  title: string;
  lines: string[];
}

/**
 * Nigeria national map — ADM1 state polygons shaded by hazard risk with ADM2
 * LGA point features. Fully interactive: pan, zoom, hover inspect, click for
 * focal-person / incident / exposure detail.
 */
const NigeriaPolygonMap = () => {
  const country = getCountry('NG');
  const labels = boundaryLabels.NG;
  const { scope } = useAuth();
  const allowed = canAccessCountry(scope, 'NG');

  const [hazard, setHazard] = useState<HazardType>('flood');
  const [showLgas, setShowLgas] = useState(true);
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const [vx, vy, vw, vh] = nigeriaViewBox;
  const viewBox = `${vx + (vw - vw / zoom) / 2 + pan.x} ${vy + (vh - vh / zoom) / 2 + pan.y} ${vw / zoom} ${vh / zoom}`;
  const scale = vw / zoom / 900;

  /** geoBoundaries ADM1 names -> profiled region names */
  const alias: Record<string, string> = { 'Abuja Federal Capital Territory': 'FCT' };
  const regionName = (geoName: string) => alias[geoName] ?? geoName;

  const riskByState = useMemo(() => {
    const m = new Map<string, number>();
    country.regions.forEach((r) => m.set(r.name, r.risk[hazard]));
    const avg = Math.round(country.regions.reduce((a, r) => a + r.risk[hazard], 0) / country.regions.length);
    nigeriaStates.forEach((st) => {
      const key = regionName(st.name);
      if (!m.has(key)) {
        // deterministic estimate for states without a profiled risk record
        let h = 2166136261;
        const seed = `${key}-${hazard}`;
        for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
        m.set(key, Math.max(8, Math.min(96, avg + ((Math.abs(h) % 40) - 20))));
      }
    });
    return m;
  }, [country, hazard]);

  /** Only dim states when the user's scope is actually restricted to a level-1 unit. */
  const permittedStates = useMemo(() => {
    if (!scope.level1) return null;
    const subs = filterSubRegions(scope, country.regions.flatMap((r) => getSubRegionsOf('NG', r.name)));
    return new Set(subs.map((s) => s.parent));
  }, [scope, country]);

  const selectedState = selected ? nigeriaStates.find((s) => s.name === selected) : null;
  const selectedSubs: SubRegion[] = selected ? filterSubRegions(scope, getSubRegionsOf('NG', regionName(selected))) : [];
  const selectedExposure = selected ? regionExposure('NG', regionName(selected), hazard) : null;
  const selectedIncidents = selectedSubs.flatMap((s) => getIncidentsFor('NG', s.name)).slice(0, 4);

  const lgaExposure = (state: string, lga: NigeriaLga, index: number) => {
    const subs = getSubRegionsOf('NG', regionName(state));
    if (!subs.length) return null;
    const sub = subs[index % subs.length];
    const e = exposureFor(sub, hazard);
    const share = 1 / Math.max(1, Math.round((nigeriaStates.find((s) => s.name === state)?.lgas.length ?? 1) / subs.length));
    return {
      sub,
      households: Math.round(e.households * share),
      buildings: Math.round(e.buildings * share),
      buildingsAffected: Math.round(e.buildingsAffected * share),
      householdsAffected: Math.round(e.householdsAffected * share),
      footprintHa: Math.round(e.footprintHa * share),
      exposedPercent: e.exposedPercent,
    };
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(8, Math.max(1, z * (e.deltaY < 0 ? 1.15 : 0.87))));
  };

  const reset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (!allowed) {
    return (
      <section className="data-grid">
        <p className="text-[11px] text-muted-foreground">Nigeria map is outside your access scope.</p>
      </section>
    );
  }

  return (
    <section className="data-grid">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <MapPin className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm text-foreground">
          Nigeria — State Polygons &amp; LGA Point Features
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground">
          {nigeriaStates.length} states · {nigeriaStates.reduce((s, st) => s + st.lgas.length, 0)} LGAs
        </span>

        <div className="ml-auto inline-flex rounded border border-border bg-secondary/40 p-0.5 text-[10px]">
          {hazards.map((h) => (
            <button
              key={h}
              onClick={() => setHazard(h)}
              className={`px-2 py-1 rounded capitalize transition-colors ${
                hazard === h ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowLgas((s) => !s)}
          className={`text-[10px] rounded border px-2 py-1 transition-colors ${
            showLgas ? 'border-primary/50 bg-primary/20 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          LGA points
        </button>
      </div>

      <p className="text-[10px] text-muted-foreground mb-2">
        ADM1 state boundaries drawn as polygons and shaded by {hazard} risk; ADM2 LGAs plotted as point
        features. Scroll or use the buttons to zoom, drag to pan, hover for exposure, click a state for focal
        persons, incidents and building-footprint detail.
      </p>

      <div className="relative h-[520px] rounded-lg overflow-hidden border border-border bg-secondary/20">
        <svg
          viewBox={viewBox}
          className="h-full w-full cursor-grab active:cursor-grabbing touch-none"
          onWheel={onWheel}
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
            (e.target as Element).setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const k = vw / zoom / rect.width;
            setPan({
              x: drag.current.px - (e.clientX - drag.current.x) * k,
              y: drag.current.py - (e.clientY - drag.current.y) * k,
            });
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerLeave={() => {
            drag.current = null;
            setHover(null);
          }}
        >
          {nigeriaStates.map((st) => {
            const risk = riskByState.get(regionName(st.name)) ?? 0;
            const inScope = !permittedStates || permittedStates.has(regionName(st.name));
            const isSel = selected === st.name;
            return (
              <path
                key={st.name}
                d={st.path}
                fill={fillFor(risk)}
                fillOpacity={inScope ? (isSel ? 0.9 : 0.62) : 0.12}
                stroke={isSel ? 'hsl(210 100% 55%)' : 'hsl(215 20% 30%)'}
                strokeWidth={isSel ? scale * 2.2 : scale}
                className="transition-opacity duration-150 cursor-pointer"
                onClick={() => setSelected(isSel ? null : st.name)}
                onMouseMove={(e) => {
                  const exp = regionExposure('NG', regionName(st.name), hazard);
                  setHover({
                    x: e.nativeEvent.offsetX,
                    y: e.nativeEvent.offsetY,
                    title: `${st.name} State`,
                    lines: [
                      `${hazard} risk ${risk}%`,
                      `${st.lgas.length} LGAs`,
                      `Households ${fmt(exp.households)} · affected ${fmt(exp.householdsAffected)}`,
                      `Buildings ${fmt(exp.buildings)} · affected ${fmt(exp.buildingsAffected)} (${exp.exposedPercent}%)`,
                      `Footprint area ${fmt(exp.footprintHa)} ha`,
                    ],
                  });
                }}
              />
            );
          })}

          {showLgas &&
            nigeriaStates.flatMap((st) =>
              st.lgas.map((l, i) => (
                <circle
                  key={`${st.name}-${l.name}`}
                  cx={l.x}
                  cy={l.y}
                  r={scale * (selected === st.name ? 3.4 : 2.4)}
                  fill="hsl(210 20% 92%)"
                  fillOpacity={selected && selected !== st.name ? 0.15 : 0.7}
                  stroke="hsl(220 30% 10%)"
                  strokeWidth={scale * 0.6}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(st.name);
                  }}
                  onMouseMove={(e) => {
                    e.stopPropagation();
                    const ex = lgaExposure(st.name, l, i);
                    setHover({
                      x: e.nativeEvent.offsetX,
                      y: e.nativeEvent.offsetY,
                      title: `${l.name} LGA`,
                      lines: ex
                        ? [
                            `${st.name} State · ${hazard} risk ${riskByState.get(st.name) ?? 0}%`,
                            `Households ${fmt(ex.households)} · affected ${fmt(ex.householdsAffected)}`,
                            `Building footprints ${fmt(ex.buildings)} · affected ${fmt(ex.buildingsAffected)}`,
                            `Footprint area ${fmt(ex.footprintHa)} ha`,
                            `Focal person ${ex.sub.focalPerson.name} · ${ex.sub.focalPerson.phone}`,
                          ]
                        : [`${st.name} State`],
                    });
                  }}
                />
              )),
            )}

          {nigeriaStates.map((st) => (
            <text
              key={`t-${st.name}`}
              x={st.cx}
              y={st.cy}
              textAnchor="middle"
              className="pointer-events-none select-none"
              fontSize={scale * 11}
              fill="hsl(210 20% 92%)"
              fillOpacity={0.85}
            >
              {st.name}
            </text>
          ))}
        </svg>

        {hover && (
          <div
            className="pointer-events-none absolute z-10 rounded-md border border-border bg-background/95 px-2.5 py-2 shadow-lg"
            style={{ left: Math.min(hover.x + 12, 520), top: hover.y + 12 }}
          >
            <p className="text-[11px] font-semibold text-foreground">{hover.title}</p>
            {hover.lines.map((l) => (
              <p key={l} className="text-[10px] text-muted-foreground font-mono">
                {l}
              </p>
            ))}
          </div>
        )}

        <div className="absolute right-2 top-2 flex flex-col gap-1">
          {[
            { icon: Plus, fn: () => setZoom((z) => Math.min(8, z * 1.3)), label: 'Zoom in' },
            { icon: Minus, fn: () => setZoom((z) => Math.max(1, z / 1.3)), label: 'Zoom out' },
            { icon: RotateCcw, fn: reset, label: 'Reset view' },
          ].map(({ icon: Icon, fn, label }) => (
            <button
              key={label}
              aria-label={label}
              onClick={fn}
              className="rounded border border-border bg-background/90 p-1.5 text-foreground hover:bg-secondary transition-colors"
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        <div className="absolute left-2 bottom-2 flex items-center gap-1 rounded border border-border bg-background/80 px-2 py-1 text-[10px] text-muted-foreground">
          <Move className="h-3 w-3" /> drag to pan · scroll to zoom · {Math.round(zoom * 100)}%
        </div>
      </div>

      {selectedState && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-md border border-border bg-secondary/40 p-3"
        >
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h4 className="text-xs font-semibold text-foreground">{selectedState.name} State</h4>
            <span className="text-[10px] font-mono text-muted-foreground">
              {selectedState.lgas.length} {labels.level2} · {hazard} risk {riskByState.get(regionName(selectedState.name))}%
            </span>
            <button
              onClick={() => setSelected(null)}
              className="ml-auto text-[10px] text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>

          {selectedExposure && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] mb-3">
              {[
                { icon: Home, label: 'Households affected', value: `${fmt(selectedExposure.householdsAffected)} / ${fmt(selectedExposure.households)}` },
                { icon: Building2, label: 'Building footprints affected', value: `${fmt(selectedExposure.buildingsAffected)} / ${fmt(selectedExposure.buildings)}` },
                { icon: Building2, label: 'Footprint area · critical facilities', value: `${fmt(selectedExposure.footprintHa)} ha · ${fmt(selectedExposure.criticalFacilities)}` },
                { icon: Users, label: 'Exposed share', value: `${selectedExposure.exposedPercent}%` },
              ].map((m) => (
                <div key={m.label} className="rounded border border-border bg-background/50 p-2">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <m.icon className="h-3 w-3" /> {m.label}
                  </p>
                  <p className="font-mono text-foreground mt-0.5">{m.value}</p>
                </div>
              ))}
            </div>
          )}

          {selectedSubs.length === 0 && (
            <p className="text-[11px] text-muted-foreground mb-2">
              No level-2 focal-person records loaded for this state yet — import a dataset from the Data page to
              populate its LGAs.
            </p>
          )}
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Focal persons</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            {selectedSubs.slice(0, 6).map((s) => (
              <div key={s.name} className="rounded border border-border bg-background/50 p-2 text-[10px]">
                <p className="text-foreground font-semibold">{s.focalPerson.name}</p>
                <p className="text-muted-foreground">
                  {s.focalPerson.role} · {s.name} · {s.focalPerson.agency}
                </p>
                <p className="font-mono text-muted-foreground">
                  {s.focalPerson.phone} · last report {s.focalPerson.lastReport}
                </p>
                <p className="font-mono text-foreground mt-1">
                  {fmt(s.householdsReached)} / {fmt(s.households)} households reached
                </p>
              </div>
            ))}
          </div>

          {selectedIncidents.length > 0 && (
            <>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Recent incidents</p>
              <div className="space-y-2">
                {selectedIncidents.map((inc) => (
                  <div key={inc.id} className="rounded border border-border bg-background/50 p-2 text-[10px]">
                    <p className="text-foreground font-semibold">{inc.title}</p>
                    <p className="text-muted-foreground">
                      {inc.cause} · {inc.parameter} {inc.reading} / thr {inc.threshold}
                    </p>
                    <p className="font-mono text-muted-foreground">
                      {fmt(inc.householdsReached)} / {fmt(inc.householdsTargeted)} households reached ·{' '}
                      {fmt(inc.peopleAffected)} affected
                    </p>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => downloadIncidentPdf(inc, labels, country.name)}
                        className="rounded border border-border px-2 py-0.5 hover:bg-secondary transition-colors"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => downloadIncidentCsv(inc, labels)}
                        className="rounded border border-border px-2 py-0.5 hover:bg-secondary transition-colors"
                      >
                        CSV
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      <div className="flex items-center gap-4 mt-3 flex-wrap text-[10px] text-muted-foreground">
        {[
          ['High (70+)', 'bg-alert-red'],
          ['Elevated (45-69)', 'bg-alert-orange'],
          ['Moderate (25-44)', 'bg-alert-yellow'],
          ['Low (<25)', 'bg-alert-green'],
        ].map(([label, cls]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${cls}`} /> {label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-foreground" /> LGA point feature
        </span>
      </div>
    </section>
  );
};

export default NigeriaPolygonMap;
