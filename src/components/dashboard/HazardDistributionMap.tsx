import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertTriangle } from 'lucide-react';
import NigeriaChoroplethMap from './NigeriaChoroplethMap';

interface StateRisk {
  state: string;
  riskLevel: 'high' | 'moderate' | 'low';
  probabilityPercent: number;
  predictedPeakMonth: string;
  riverBasin: string;
  vulnerablePopulation: number;
}

interface HazardDistributionMapProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconColorClass?: string;
  stateData: StateRisk[];
  legend?: { label: string; color: string }[];
  delay?: number;
  /** Hide the vulnerability map (defaults to false — vulnerability shown by default) */
  hideVulnerability?: boolean;
}

const riskFills: Record<'high' | 'moderate' | 'low', string> = {
  high: 'hsl(0 72% 55%)',
  moderate: 'hsl(25 95% 58%)',
  low: 'hsl(142 71% 45%)',
};

const defaultLegend = [
  { label: 'High', color: 'bg-alert-red' },
  { label: 'Moderate', color: 'bg-alert-orange' },
  { label: 'Low', color: 'bg-alert-green' },
];

/** Derive a vulnerability dataset by re-bucketing states using vulnerablePopulation thresholds. */
const buildVulnerabilityData = (data: StateRisk[]): StateRisk[] => {
  const pops = data.map((d) => d.vulnerablePopulation);
  const max = Math.max(...pops, 1);
  return data.map((d) => {
    const pct = Math.round((d.vulnerablePopulation / max) * 100);
    const riskLevel: 'high' | 'moderate' | 'low' =
      pct >= 66 ? 'high' : pct >= 33 ? 'moderate' : 'low';
    return {
      ...d,
      riskLevel,
      probabilityPercent: pct,
      riverBasin: `Pop. exposed: ${d.vulnerablePopulation.toLocaleString()}`,
    };
  });
};

const HazardDistributionMap = ({
  title,
  subtitle,
  icon,
  stateData,
  legend = defaultLegend,
  delay = 0.25,
  hideVulnerability = false,
}: HazardDistributionMapProps) => {
  const [view, setView] = useState<'risk' | 'vulnerability'>('risk');
  const vulnerabilityData = buildVulnerabilityData(stateData);
  const activeData = view === 'risk' ? stateData : vulnerabilityData;
  const dataMap = new Map(activeData.map((d) => [d.state, d]));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="data-grid"
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {icon}
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        {subtitle && (
          <span className="text-[10px] font-mono text-muted-foreground">{subtitle}</span>
        )}

        {!hideVulnerability && (
          <div className="ml-auto inline-flex rounded border border-border bg-secondary/40 p-0.5 text-[10px]">
            <button
              onClick={() => setView('risk')}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                view === 'risk'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
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
        )}
      </div>

      <p className="text-[10px] text-muted-foreground mb-2">
        {view === 'risk'
          ? 'Hazard probability shaded by state — derived from monitored parameters & thresholds.'
          : 'Population exposure shaded by state — relative vulnerability of communities in affected areas.'}
      </p>

      <NigeriaChoroplethMap
        className="h-[420px]"
        fillFor={(name) => {
          const d = dataMap.get(name);
          return d ? riskFills[d.riskLevel] : 'hsl(215 20% 25%)';
        }}
        opacityFor={(name) => (dataMap.has(name) ? 0.68 : 0.18)}
        lgaColorFor={(name) => (dataMap.has(name) ? 'hsl(210 20% 92%)' : 'hsl(215 15% 45%)')}
        tooltipFor={(name) => {
          const d = dataMap.get(name);
          return {
            title: `${name} State`,
            lines: d
              ? [
                  `${view === 'risk' ? 'Risk' : 'Vulnerability'} ${d.probabilityPercent}% · ${d.riskLevel}`,
                  d.riverBasin,
                  `Peak: ${d.predictedPeakMonth}`,
                  `Vulnerable population ${d.vulnerablePopulation.toLocaleString()}`,
                ]
              : ['No monitored parameter for this state'],
          };
        }}
        lgaTooltipFor={(name, lga) => {
          const d = dataMap.get(name);
          return {
            title: `${lga.name} LGA`,
            lines: d
              ? [
                  `${name} State · ${d.riskLevel} (${d.probabilityPercent}%)`,
                  d.riverBasin,
                  `Peak: ${d.predictedPeakMonth}`,
                ]
              : [`${name} State · no active reading`],
          };
        }}
      />


      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {legend.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <div className={`h-2.5 w-2.5 rounded-full ${l.color}`} />
            {view === 'risk' ? `${l.label} Risk` : `${l.label} Vulnerability`}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default HazardDistributionMap;
