import { useState } from 'react';
import { motion } from 'framer-motion';

interface StateData {
  state: string;
  riskLevel: 'high' | 'moderate' | 'low';
  probabilityPercent: number;
  predictedPeakMonth: string;
  riverBasin: string;
  vulnerablePopulation: number;
}

interface NigeriaSVGMapProps {
  stateData: StateData[];
}

// Simplified SVG paths for Nigeria's 36 states + FCT, positioned roughly geographically
const nigeriaStates: Record<string, { path: string; cx: number; cy: number }> = {
  'Sokoto': { path: 'M120,30 L150,25 L165,40 L155,60 L130,55 L115,45 Z', cx: 140, cy: 42 },
  'Zamfara': { path: 'M155,60 L175,50 L195,60 L190,80 L165,85 L150,70 Z', cx: 172, cy: 68 },
  'Katsina': { path: 'M195,30 L225,25 L240,40 L235,65 L210,60 L195,45 Z', cx: 218, cy: 45 },
  'Kano': { path: 'M235,65 L260,55 L275,70 L270,95 L245,90 L235,80 Z', cx: 255, cy: 78 },
  'Jigawa': { path: 'M275,50 L305,45 L320,60 L310,85 L285,80 L275,70 Z', cx: 298, cy: 65 },
  'Yobe': { path: 'M320,60 L355,55 L380,70 L370,95 L340,90 L320,80 Z', cx: 350, cy: 75 },
  'Borno': { path: 'M370,50 L410,45 L430,80 L420,130 L385,120 L370,95 Z', cx: 400, cy: 85 },
  'Kebbi': { path: 'M100,55 L130,55 L140,80 L130,110 L105,105 L95,80 Z', cx: 118, cy: 82 },
  'Niger': { path: 'M130,110 L170,95 L200,110 L210,145 L180,160 L140,150 L125,130 Z', cx: 168, cy: 130 },
  'Kaduna': { path: 'M210,80 L245,90 L250,120 L235,145 L210,140 L200,110 Z', cx: 226, cy: 112 },
  'Bauchi': { path: 'M270,95 L310,90 L320,115 L305,140 L275,135 L265,115 Z', cx: 292, cy: 115 },
  'Gombe': { path: 'M310,90 L340,95 L345,120 L325,135 L305,130 L305,110 Z', cx: 325, cy: 112 },
  'Adamawa': { path: 'M345,120 L385,115 L400,150 L380,185 L350,175 L340,145 Z', cx: 368, cy: 150 },
  'FCT': { path: 'M218,155 L235,150 L240,165 L230,175 L215,170 Z', cx: 228, cy: 163 },
  'Plateau': { path: 'M250,125 L280,130 L285,160 L265,175 L245,165 L240,145 Z', cx: 262, cy: 150 },
  'Nasarawa': { path: 'M240,165 L270,170 L280,190 L260,200 L238,195 L235,180 Z', cx: 258, cy: 183 },
  'Taraba': { path: 'M305,150 L340,145 L355,180 L340,215 L310,210 L300,180 Z', cx: 328, cy: 180 },
  'Kwara': { path: 'M130,155 L175,160 L185,185 L170,205 L140,200 L125,180 Z', cx: 155, cy: 180 },
  'Kogi': { path: 'M185,175 L218,170 L230,195 L220,220 L195,215 L180,195 Z', cx: 206, cy: 195 },
  'Benue': { path: 'M255,195 L300,190 L315,215 L300,240 L265,235 L250,215 Z', cx: 282, cy: 215 },
  'Oyo': { path: 'M100,185 L135,180 L140,205 L125,225 L100,220 L90,200 Z', cx: 118, cy: 203 },
  'Osun': { path: 'M130,210 L155,205 L160,225 L145,240 L125,235 Z', cx: 143, cy: 222 },
  'Ekiti': { path: 'M155,210 L175,208 L178,228 L165,238 L152,232 Z', cx: 165, cy: 222 },
  'Ondo': { path: 'M135,240 L165,238 L170,260 L150,275 L130,265 Z', cx: 150, cy: 255 },
  'Ogun': { path: 'M85,225 L115,220 L120,245 L105,265 L80,258 Z', cx: 100, cy: 242 },
  'Lagos': { path: 'M65,260 L85,255 L90,275 L75,285 L60,278 Z', cx: 75, cy: 270 },
  'Edo': { path: 'M160,235 L185,225 L195,250 L185,275 L162,268 Z', cx: 178, cy: 252 },
  'Delta': { path: 'M145,275 L170,268 L180,290 L165,305 L145,298 Z', cx: 162, cy: 288 },
  'Anambra': { path: 'M195,240 L218,235 L222,260 L210,275 L192,268 Z', cx: 207, cy: 255 },
  'Enugu': { path: 'M220,230 L248,225 L252,255 L238,270 L218,262 Z', cx: 236, cy: 248 },
  'Ebonyi': { path: 'M248,250 L270,245 L275,268 L260,280 L245,272 Z', cx: 260, cy: 262 },
  'Cross River': { path: 'M270,255 L300,248 L310,280 L295,305 L268,295 Z', cx: 290, cy: 278 },
  'Imo': { path: 'M195,270 L218,265 L222,290 L210,305 L192,298 Z', cx: 207, cy: 285 },
  'Abia': { path: 'M222,268 L248,262 L252,288 L240,302 L220,295 Z', cx: 237, cy: 282 },
  'Akwa Ibom': { path: 'M248,290 L275,285 L282,310 L265,325 L245,315 Z', cx: 263, cy: 305 },
  'Rivers': { path: 'M195,300 L220,295 L228,318 L215,332 L192,325 Z', cx: 210, cy: 315 },
  'Bayelsa': { path: 'M165,305 L192,300 L198,322 L185,335 L162,328 Z', cx: 180, cy: 318 },
};

const riskFills = {
  high: 'hsl(0 72% 55%)',
  moderate: 'hsl(25 95% 58%)',
  low: 'hsl(142 71% 45%)',
};

const NigeriaSVGMap = ({ stateData }: NigeriaSVGMapProps) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const stateDataMap = new Map(stateData.map(s => [s.state, s]));
  const hoveredData = hoveredState ? stateDataMap.get(hoveredState) : null;

  return (
    <div className="relative">
      <svg
        viewBox="40 10 420 340"
        className="w-full h-[350px]"
        onMouseLeave={() => setHoveredState(null)}
      >
        {/* Background */}
        <rect x="40" y="10" width="420" height="340" fill="hsl(215 30% 12%)" rx="8" />

        {Object.entries(nigeriaStates).map(([name, { path, cx, cy }]) => {
          const data = stateDataMap.get(name);
          const isHovered = hoveredState === name;
          const fill = data ? riskFills[data.riskLevel] : 'hsl(215 20% 25%)';

          return (
            <g key={name}>
              <motion.path
                d={path}
                fill={fill}
                fillOpacity={data ? (isHovered ? 0.95 : 0.7) : 0.3}
                stroke={isHovered ? 'hsl(0 0% 100%)' : 'hsl(215 20% 20%)'}
                strokeWidth={isHovered ? 2 : 0.8}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={(e) => {
                  setHoveredState(name);
                  const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
                  if (rect) {
                    setTooltipPos({ x: cx, y: cy });
                  }
                }}
                whileHover={{ scale: 1.03 }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none select-none"
                fill="hsl(0 0% 95%)"
                fontSize="6"
                fontWeight={data ? '700' : '400'}
                opacity={0.9}
              >
                {name.length > 6 ? name.slice(0, 5) + '.' : name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredData && hoveredState && (
        <div
          className="absolute z-10 pointer-events-none bg-card border border-border rounded-lg shadow-xl p-3 min-w-[180px]"
          style={{
            left: `${((tooltipPos.x - 40) / 420) * 100}%`,
            top: `${((tooltipPos.y - 10) / 340) * 100 - 15}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="text-xs font-bold text-foreground">{hoveredState}</p>
          <p className="text-[10px] text-muted-foreground">{hoveredData.riverBasin}</p>
          <div className="mt-1.5 space-y-0.5">
            <p className="text-[10px] font-mono">
              Risk: <span className={hoveredData.riskLevel === 'high' ? 'text-alert-red' : hoveredData.riskLevel === 'moderate' ? 'text-alert-orange' : 'text-alert-green'}>{hoveredData.riskLevel.toUpperCase()}</span>
            </p>
            <p className="text-[10px] font-mono text-foreground">Probability: {hoveredData.probabilityPercent}%</p>
            <p className="text-[10px] font-mono text-foreground">Peak: {hoveredData.predictedPeakMonth}</p>
            <p className="text-[10px] font-mono text-foreground">Vulnerable: {hoveredData.vulnerablePopulation.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NigeriaSVGMap;
