import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import type { CountryProfile } from '@/data/westAfrica';
import type { HazardType } from '@/data/mockData';
import { getCountryGeometry } from '@/data/westAfricaGeo';
import { useAuth } from '@/hooks/useAuth';

const riskFills = {
  high: 'hsl(0 72% 55%)',
  moderate: 'hsl(25 95% 58%)',
  low: 'hsl(142 71% 45%)',
} as const;

type RiskLevel = keyof typeof riskFills;
const bucket = (pct: number): RiskLevel => (pct >= 66 ? 'high' : pct >= 40 ? 'moderate' : 'low');

interface Props {
  country: CountryProfile;
  hazard: HazardType;
}

/**
 * Static national map drawn from the real country boundary (EPSG:3857 shapefile),
 * with every level-1 unit plotted at its geographic position and shaded by hazard risk.
 */
const CountryBoundaryMap = ({ country, hazard }: Props) => {
  const geo = getCountryGeometry(country.code);
  const { scope } = useAuth();
  const [hovered, setHovered] = useState<string | null>(null);

  const points = useMemo(() => {
    if (!geo?.regionPoints) return [];
    return country.regions
      .filter((r) => !scope.level1 || r.name === scope.level1)
      .map((r) => {
        const pt = geo.regionPoints![r.name];
        if (!pt) return null;
        return { region: r, x: pt[0], y: pt[1], value: r.risk[hazard] ?? 0 };
      })
      .filter(Boolean) as { region: CountryProfile['regions'][number]; x: number; y: number; value: number }[];
  }, [geo, country.regions, hazard, scope.level1]);

  if (!geo) return null;

  const [bx, by, bw, bh] = geo.bbox;
  const pad = Math.max(bw, bh) * 0.04;
  const r = Math.max(bw, bh) * 0.022;
  const fontSize = Math.max(bw, bh) * 0.024;
  const active = points.find((p) => p.region.name === hovered);

  return (
    <div className="data-grid">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <MapPin className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm text-foreground">
          {country.name} — National Boundary Map
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground">
          {points.length} {country.regionLabel.toLowerCase()} · official boundary geometry
        </span>
        <div className="ml-auto flex items-center gap-3 text-[10px]">
          {(['high', 'moderate', 'low'] as RiskLevel[]).map((l) => (
            <span key={l} className="flex items-center gap-1 text-muted-foreground capitalize">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: riskFills[l] }} />
              {l}
            </span>
          ))}
        </div>
      </div>

      <div className="relative h-[420px] rounded-lg overflow-hidden border border-border bg-[hsl(210_55%_14%)]">
        <svg
          viewBox={`${bx - pad} ${by - pad} ${bw + pad * 2} ${bh + pad * 2}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHovered(null)}
        >
          <motion.path
            d={geo.path}
            fill="hsl(215 25% 24%)"
            stroke="hsl(200 90% 60%)"
            strokeWidth={Math.max(bw, bh) * 0.004}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {points.map((p) => {
            const isActive = hovered === p.region.name;
            return (
              <g
                key={p.region.name}
                onMouseEnter={() => setHovered(p.region.name)}
                className="cursor-pointer"
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? r * 1.35 : r}
                  fill={riskFills[bucket(p.value)]}
                  fillOpacity={isActive ? 1 : 0.85}
                  stroke={isActive ? 'hsl(0 0% 100%)' : 'hsl(215 20% 15%)'}
                  strokeWidth={r * 0.18}
                />
                <text
                  x={p.x}
                  y={p.y - r * 1.6}
                  textAnchor="middle"
                  fill="hsl(0 0% 96%)"
                  fontSize={fontSize}
                  fontWeight="600"
                  className="pointer-events-none select-none"
                >
                  {p.region.name}
                </text>
              </g>
            );
          })}
        </svg>

        {active && (
          <div className="absolute left-2 bottom-2 pointer-events-none rounded-lg border border-border bg-card/95 p-2.5 shadow-xl min-w-[180px]">
            <p className="text-xs font-bold text-foreground">{active.region.name}</p>
            <p className="text-[10px] text-muted-foreground">{active.region.basin}</p>
            <p className="text-[10px] font-mono text-foreground mt-1 capitalize">
              {hazard} probability: {active.value}%
            </p>
            <p className="text-[10px] font-mono text-muted-foreground">
              {active.region.vulnerablePopulation.toLocaleString()} exposed · peak{' '}
              {active.region.peakMonth}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryBoundaryMap;
