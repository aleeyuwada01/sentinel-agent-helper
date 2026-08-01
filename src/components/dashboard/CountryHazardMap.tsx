import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Users } from 'lucide-react';

export interface RegionRow {
  state: string;
  riskLevel: 'high' | 'moderate' | 'low';
  probabilityPercent: number;
  predictedPeakMonth: string;
  riverBasin: string;
  vulnerablePopulation: number;
  gx: number;
  gy: number;
}

const riskFills = {
  high: 'hsl(0 72% 55%)',
  moderate: 'hsl(25 95% 58%)',
  low: 'hsl(142 71% 45%)',
};

const CELL = 78;
const GAP = 6;
const PAD = 14;

/** Cartogram-style SVG map: one tile per administrative region, laid out geographically. */
export const RegionCartogram = ({ rows }: { rows: RegionRow[] }) => {
  const [hovered, setHovered] = useState<RegionRow | null>(null);

  const cols = Math.max(...rows.map((r) => r.gx)) + 1;
  const rowsCount = Math.max(...rows.map((r) => r.gy)) + 1;
  const width = PAD * 2 + cols * CELL + (cols - 1) * GAP;
  const height = PAD * 2 + rowsCount * CELL + (rowsCount - 1) * GAP;

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHovered(null)}
      >
        <rect x="0" y="0" width={width} height={height} fill="hsl(215 30% 12%)" rx="8" />
        {rows.map((r) => {
          const x = PAD + r.gx * (CELL + GAP);
          const y = PAD + r.gy * (CELL + GAP);
          const isHovered = hovered?.state === r.state;
          return (
            <g key={r.state} onMouseEnter={() => setHovered(r)} className="cursor-pointer">
              <motion.rect
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                rx="8"
                fill={riskFills[r.riskLevel]}
                fillOpacity={isHovered ? 0.95 : 0.68}
                stroke={isHovered ? 'hsl(0 0% 100%)' : 'hsl(215 20% 20%)'}
                strokeWidth={isHovered ? 2 : 1}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
              <text
                x={x + CELL / 2}
                y={y + CELL / 2 - 6}
                textAnchor="middle"
                fill="hsl(0 0% 98%)"
                fontSize="10"
                fontWeight="600"
                className="pointer-events-none select-none"
              >
                {r.state.length > 13 ? `${r.state.slice(0, 12)}…` : r.state}
              </text>
              <text
                x={x + CELL / 2}
                y={y + CELL / 2 + 12}
                textAnchor="middle"
                fill="hsl(0 0% 98%)"
                fontSize="13"
                fontWeight="700"
                className="pointer-events-none select-none font-mono"
              >
                {r.probabilityPercent}%
              </text>
            </g>
          );
        })}
      </svg>

      {hovered && (
        <div className="absolute left-2 bottom-2 z-10 pointer-events-none bg-card border border-border rounded-lg shadow-xl p-3 min-w-[190px]">
          <p className="text-xs font-bold text-foreground">{hovered.state}</p>
          <p className="text-[10px] text-muted-foreground">{hovered.riverBasin}</p>
          <div className="mt-1.5 space-y-0.5">
            <p className="text-[10px] font-mono">
              Risk:{' '}
              <span
                className={
                  hovered.riskLevel === 'high'
                    ? 'text-alert-red'
                    : hovered.riskLevel === 'moderate'
                      ? 'text-alert-orange'
                      : 'text-alert-green'
                }
              >
                {hovered.riskLevel.toUpperCase()}
              </span>
            </p>
            <p className="text-[10px] font-mono text-foreground">Probability: {hovered.probabilityPercent}%</p>
            <p className="text-[10px] font-mono text-foreground">Peak: {hovered.predictedPeakMonth}</p>
            <p className="text-[10px] font-mono text-foreground">
              Vulnerable: {hovered.vulnerablePopulation.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

interface CountryHazardMapProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  rows: RegionRow[];
  delay?: number;
}

const buildVulnerability = (rows: RegionRow[]): RegionRow[] => {
  const max = Math.max(...rows.map((r) => r.vulnerablePopulation), 1);
  return rows.map((r) => {
    const pct = Math.round((r.vulnerablePopulation / max) * 100);
    return {
      ...r,
      probabilityPercent: pct,
      riskLevel: (pct >= 66 ? 'high' : pct >= 33 ? 'moderate' : 'low') as RegionRow['riskLevel'],
      riverBasin: `Pop. exposed: ${r.vulnerablePopulation.toLocaleString()}`,
    };
  });
};

/** Country-agnostic risk / vulnerability distribution map. */
const CountryHazardMap = ({ title, subtitle, icon, rows, delay = 0.2 }: CountryHazardMapProps) => {
  const [view, setView] = useState<'risk' | 'vulnerability'>('risk');
  const active = view === 'risk' ? rows : buildVulnerability(rows);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }} className="data-grid">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {icon}
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        {subtitle && <span className="text-[10px] font-mono text-muted-foreground">{subtitle}</span>}
        <div className="ml-auto inline-flex rounded border border-border bg-secondary/40 p-0.5 text-[10px]">
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

      <p className="text-[10px] text-muted-foreground mb-2">
        {view === 'risk'
          ? 'Hazard probability by administrative region — derived from monitored parameters & thresholds.'
          : 'Population exposure by administrative region — relative vulnerability of affected communities.'}
      </p>

      <div className="h-[420px] rounded-lg overflow-hidden border border-border">
        <RegionCartogram rows={active} />
      </div>

      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {[
          { label: 'High', color: 'bg-alert-red' },
          { label: 'Moderate', color: 'bg-alert-orange' },
          { label: 'Low', color: 'bg-alert-green' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <div className={`h-2.5 w-2.5 rounded-full ${l.color}`} />
            {view === 'risk' ? `${l.label} Risk` : `${l.label} Vulnerability`}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CountryHazardMap;
