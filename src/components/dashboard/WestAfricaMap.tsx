import { useState } from 'react';
import { motion } from 'framer-motion';
import { countries, countryActiveAlerts, countryAlertLevel, type CountryCode } from '@/data/westAfrica';
import {
  contextCountries,
  countryGeometries,
  getCountryGeometry,
  iso3ForCountry,
} from '@/data/westAfricaGeo';

const alertFill: Record<string, string> = {
  green: 'hsl(142 71% 45%)',
  yellow: 'hsl(48 96% 53%)',
  orange: 'hsl(25 95% 58%)',
  red: 'hsl(0 72% 55%)',
};

/** Fit the view to the four member states, with headroom for surrounding context. */
const memberBoxes = Object.values(iso3ForCountry)
  .map((iso) => countryGeometries[iso]?.bbox)
  .filter(Boolean) as [number, number, number, number][];
const minX = Math.min(...memberBoxes.map((b) => b[0]));
const minY = Math.min(...memberBoxes.map((b) => b[1]));
const maxX = Math.max(...memberBoxes.map((b) => b[0] + b[2]));
const maxY = Math.max(...memberBoxes.map((b) => b[1] + b[3]));
const padX = (maxX - minX) * 0.05;
const padY = (maxY - minY) * 0.18;
const fittedViewBox: [number, number, number, number] = [
  minX - padX,
  minY - padY,
  maxX - minX + padX * 2,
  maxY - minY + padY * 2,
];

interface Props {
  selected?: CountryCode;
  onSelect?: (code: CountryCode) => void;
}

/** True-geometry map of the West African deployment footprint (EPSG:3857 boundaries). */
const WestAfricaMap = ({ selected, onSelect }: Props) => {
  const [x, y, w, h] = fittedViewBox;
  const [hovered, setHovered] = useState<CountryCode | null>(null);

  const hoveredCountry = countries.find((c) => c.code === hovered);


  return (
    <div className="relative h-full w-full">
      <svg viewBox={`${x} ${y} ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <rect x={x} y={y} width={w} height={h} fill="hsl(210 55% 14%)" />

        {/* Neighbouring states — geographic context only */}
        {contextCountries.map((iso) => (
          <path
            key={iso}
            d={countryGeometries[iso].path}
            fill="hsl(215 22% 22%)"
            stroke="hsl(215 20% 30%)"
            strokeWidth={2}
          />
        ))}

        {/* Member states */}
        {countries.map((c) => {
          const geo = getCountryGeometry(c.code);
          if (!geo) return null;
          const level = countryAlertLevel(c);
          const isSelected = selected === c.code;
          const isHovered = hovered === c.code;
          const [bx, by, bw, bh] = geo.bbox;
          const cx = bx + bw / 2;
          const cy = by + bh / 2;
          const labelSize = Math.min(w * 0.028, Math.min(bw, bh) * 0.24);
          return (
            <g
              key={c.code}
              onClick={() => onSelect?.(c.code)}
              onMouseEnter={() => setHovered(c.code)}
              onMouseLeave={() => setHovered(null)}
              className={onSelect ? 'cursor-pointer' : ''}
            >
              <motion.path
                d={geo.path}
                fill={alertFill[level]}
                fillOpacity={isSelected || isHovered ? 0.92 : 0.6}
                stroke={isSelected ? 'hsl(0 0% 100%)' : 'hsl(215 20% 40%)'}
                strokeWidth={isSelected ? 7 : 3}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
              {/* Level-1 boundary markers */}
              {(isSelected || isHovered) &&
                Object.entries(geo.regionPoints ?? {}).map(([name, [px, py]]) => (
                  <circle
                    key={name}
                    cx={px}
                    cy={py}
                    r={Math.max(6, labelSize * 0.12)}
                    fill="hsl(0 0% 100%)"
                    fillOpacity={0.85}
                    className="pointer-events-none"
                  />
                ))}
              <text
                x={cx}
                y={cy - labelSize * 0.2}
                textAnchor="middle"
                fill="hsl(0 0% 98%)"
                fontSize={labelSize}
                fontWeight="700"
                className="pointer-events-none select-none"
              >
                {c.shortName}
              </text>
              <text
                x={cx}
                y={cy + labelSize}
                textAnchor="middle"
                fill="hsl(0 0% 98%)"
                fontSize={labelSize * 0.8}
                className="pointer-events-none select-none font-mono"
              >
                {countryActiveAlerts(c)} alerts
              </text>
              {c.isOwner && (
                <text
                  x={cx}
                  y={cy + labelSize * 1.9}
                  textAnchor="middle"
                  fill="hsl(0 0% 90%)"
                  fontSize={labelSize * 0.6}
                  className="pointer-events-none select-none"
                >
                  ★ PLATFORM OWNER
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {hoveredCountry && (
        <div className="absolute left-2 bottom-2 pointer-events-none rounded-lg border border-border bg-card/95 p-2 shadow-xl">
          <p className="text-xs font-bold text-foreground">
            {hoveredCountry.flag} {hoveredCountry.name}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {hoveredCountry.regions.length} {hoveredCountry.regionLabel.toLowerCase()} ·{' '}
            {countryActiveAlerts(hoveredCountry)} active alerts
          </p>
          <p className="text-[10px] font-mono text-muted-foreground">
            Lead agency: {hoveredCountry.leadAgency}
          </p>
        </div>
      )}
    </div>
  );
};

export default WestAfricaMap;
