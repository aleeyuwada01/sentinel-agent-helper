import { useRef, useState } from 'react';
import { Minus, Move, Plus, RotateCcw } from 'lucide-react';
import { nigeriaStates, nigeriaViewBox, type NigeriaLga } from '@/data/nigeriaGeo';

export interface MapTooltip {
  title: string;
  lines: string[];
}

interface NigeriaChoroplethMapProps {
  /** Fill colour for a state polygon (canonical name, FCT for the capital territory). */
  fillFor: (state: string) => string;
  /** Polygon opacity 0-1; defaults to 0.65. */
  opacityFor?: (state: string) => number;
  /** Hover detail for a state polygon. */
  tooltipFor: (state: string) => MapTooltip | null;
  /** Hover detail for an LGA point feature. */
  lgaTooltipFor?: (state: string, lga: NigeriaLga, index: number) => MapTooltip | null;
  /** Colour of LGA point features per state; return null to hide that state's points. */
  lgaColorFor?: (state: string) => string | null;
  /** Optional state-level marker dot (e.g. connectivity status). */
  markerFor?: (state: string) => string | null;
  selected?: string | null;
  onSelect?: (state: string) => void;
  showLgas?: boolean;
  showLabels?: boolean;
  className?: string;
}

/** geoBoundaries ADM1 name -> canonical name used across the app. */
const alias: Record<string, string> = { 'Abuja Federal Capital Territory': 'FCT' };
export const canonicalState = (geoName: string) => alias[geoName] ?? geoName;

/**
 * Nigeria ADM1 state polygons with ADM2 LGA point features — pan, zoom and
 * hover-inspect. Shared by every hazard risk distribution map so all layers use
 * the same real geometry.
 */
const NigeriaChoroplethMap = ({
  fillFor,
  opacityFor,
  tooltipFor,
  lgaTooltipFor,
  lgaColorFor,
  markerFor,
  selected = null,
  onSelect,
  showLgas = true,
  showLabels = true,
  className = 'h-[380px]',
}: NigeriaChoroplethMapProps) => {
  const [hover, setHover] = useState<(MapTooltip & { x: number; y: number }) | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const [vx, vy, vw, vh] = nigeriaViewBox;
  const viewBox = `${vx + (vw - vw / zoom) / 2 + pan.x} ${vy + (vh - vh / zoom) / 2 + pan.y} ${vw / zoom} ${vh / zoom}`;
  const scale = vw / zoom / 900;

  return (
    <div className={`relative rounded-lg overflow-hidden border border-border bg-secondary/20 ${className}`}>
      <svg
        viewBox={viewBox}
        className="h-full w-full cursor-grab active:cursor-grabbing touch-none"
        onWheel={(e) => setZoom((z) => Math.min(8, Math.max(1, z * (e.deltaY < 0 ? 1.15 : 0.87))))}
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
          const name = canonicalState(st.name);
          const isSel = selected === name;
          return (
            <path
              key={st.name}
              d={st.path}
              fill={fillFor(name)}
              fillOpacity={isSel ? 0.95 : (opacityFor?.(name) ?? 0.65)}
              stroke={isSel ? 'hsl(0 0% 100%)' : 'hsl(215 20% 30%)'}
              strokeWidth={isSel ? scale * 2.2 : scale}
              className="cursor-pointer transition-opacity duration-150"
              onClick={() => onSelect?.(name)}
              onMouseMove={(e) => {
                const t = tooltipFor(name);
                if (t) setHover({ ...t, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
              }}
            />
          );
        })}

        {showLgas &&
          nigeriaStates.flatMap((st) => {
            const name = canonicalState(st.name);
            const color = lgaColorFor ? lgaColorFor(name) : 'hsl(210 20% 92%)';
            if (!color) return [];
            return st.lgas.map((l, i) => (
              <circle
                key={`${st.name}-${l.name}`}
                cx={l.x}
                cy={l.y}
                r={scale * (selected === name ? 3.4 : 2.3)}
                fill={color}
                fillOpacity={selected && selected !== name ? 0.2 : 0.8}
                stroke="hsl(220 30% 10%)"
                strokeWidth={scale * 0.6}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(name);
                }}
                onMouseMove={(e) => {
                  e.stopPropagation();
                  const t = lgaTooltipFor?.(name, l, i) ?? {
                    title: `${l.name} LGA`,
                    lines: [`${name} State`],
                  };
                  setHover({ ...t, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
                }}
              />
            ));
          })}

        {markerFor &&
          nigeriaStates.map((st) => {
            const name = canonicalState(st.name);
            const c = markerFor(name);
            if (!c) return null;
            return (
              <circle
                key={`m-${st.name}`}
                cx={st.cx}
                cy={st.cy - scale * 10}
                r={scale * 3.6}
                fill={c}
                stroke="hsl(0 0% 100%)"
                strokeWidth={scale * 0.8}
                className="pointer-events-none"
              />
            );
          })}

        {showLabels &&
          nigeriaStates.map((st) => (
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
              {canonicalState(st.name)}
            </text>
          ))}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border border-border bg-background/95 px-2.5 py-2 shadow-lg"
          style={{ left: Math.min(hover.x + 12, 420), top: hover.y + 12 }}
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
          {
            icon: RotateCcw,
            fn: () => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            },
            label: 'Reset view',
          },
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
  );
};

export default NigeriaChoroplethMap;
