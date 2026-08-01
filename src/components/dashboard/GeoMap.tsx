import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { focalPersons, fireRiskZones } from '@/data/mockData';
import { Layers, Users, AlertTriangle, Wifi, Clock, Eye } from 'lucide-react';
import NigeriaChoroplethMap from './NigeriaChoroplethMap';

type HazardType = 'flood' | 'drought' | 'epidemic' | 'heatwave' | 'fire';
type LayerView = 'hazards' | 'focal-persons';

interface StateFPData {
  hazards: HazardType[];
  totalLGAs: number;
  totalWards: number;
  focalCount: number;
  activeFP: number;
  onlineFP: number;
  lastSeen: string;
  connectivity: 'excellent' | 'good' | 'poor' | 'offline';
}

// Expanded data: all 36 states + FCT with LGA/ward focal person coverage
const stateHazards: Record<string, StateFPData> = {
  'Sokoto': { hazards: ['heatwave', 'drought'], totalLGAs: 23, totalWards: 244, focalCount: 200, activeFP: 168, onlineFP: 142, lastSeen: '2m ago', connectivity: 'good' },
  'Zamfara': { hazards: ['drought', 'heatwave'], totalLGAs: 14, totalWards: 147, focalCount: 145, activeFP: 118, onlineFP: 89, lastSeen: '8m ago', connectivity: 'poor' },
  'Katsina': { hazards: ['heatwave', 'drought'], totalLGAs: 34, totalWards: 361, focalCount: 270, activeFP: 235, onlineFP: 198, lastSeen: '3m ago', connectivity: 'good' },
  'Kano': { hazards: ['heatwave'], totalLGAs: 44, totalWards: 484, focalCount: 350, activeFP: 330, onlineFP: 310, lastSeen: '1m ago', connectivity: 'excellent' },
  'Jigawa': { hazards: ['flood', 'drought'], totalLGAs: 27, totalWards: 287, focalCount: 210, activeFP: 185, onlineFP: 160, lastSeen: '5m ago', connectivity: 'good' },
  'Yobe': { hazards: ['drought', 'heatwave'], totalLGAs: 17, totalWards: 178, focalCount: 180, activeFP: 145, onlineFP: 102, lastSeen: '12m ago', connectivity: 'poor' },
  'Borno': { hazards: ['drought', 'heatwave', 'epidemic'], totalLGAs: 27, totalWards: 312, focalCount: 310, activeFP: 270, onlineFP: 185, lastSeen: '15m ago', connectivity: 'poor' },
  'Kebbi': { hazards: ['drought', 'heatwave'], totalLGAs: 21, totalWards: 225, focalCount: 160, activeFP: 120, onlineFP: 95, lastSeen: '10m ago', connectivity: 'poor' },
  'Niger': { hazards: ['flood', 'drought'], totalLGAs: 25, totalWards: 274, focalCount: 290, activeFP: 260, onlineFP: 228, lastSeen: '4m ago', connectivity: 'good' },
  'Kaduna': { hazards: ['flood', 'heatwave'], totalLGAs: 23, totalWards: 255, focalCount: 340, activeFP: 312, onlineFP: 285, lastSeen: '1m ago', connectivity: 'excellent' },
  'Plateau': { hazards: ['flood'], totalLGAs: 17, totalWards: 185, focalCount: 180, activeFP: 165, onlineFP: 148, lastSeen: '3m ago', connectivity: 'good' },
  'Nasarawa': { hazards: ['flood'], totalLGAs: 13, totalWards: 147, focalCount: 140, activeFP: 128, onlineFP: 115, lastSeen: '6m ago', connectivity: 'good' },
  'Bauchi': { hazards: ['heatwave'], totalLGAs: 20, totalWards: 210, focalCount: 220, activeFP: 200, onlineFP: 175, lastSeen: '4m ago', connectivity: 'good' },
  'Gombe': { hazards: ['heatwave'], totalLGAs: 11, totalWards: 114, focalCount: 110, activeFP: 98, onlineFP: 82, lastSeen: '7m ago', connectivity: 'good' },
  'Adamawa': { hazards: ['flood', 'drought'], totalLGAs: 21, totalWards: 226, focalCount: 280, activeFP: 245, onlineFP: 210, lastSeen: '5m ago', connectivity: 'good' },
  'Taraba': { hazards: ['flood', 'drought'], totalLGAs: 16, totalWards: 168, focalCount: 240, activeFP: 210, onlineFP: 178, lastSeen: '9m ago', connectivity: 'poor' },
  'FCT': { hazards: ['flood'], totalLGAs: 6, totalWards: 62, focalCount: 180, activeFP: 175, onlineFP: 170, lastSeen: '30s ago', connectivity: 'excellent' },
  'Kwara': { hazards: ['flood'], totalLGAs: 16, totalWards: 193, focalCount: 180, activeFP: 170, onlineFP: 155, lastSeen: '3m ago', connectivity: 'good' },
  'Kogi': { hazards: ['flood'], totalLGAs: 21, totalWards: 239, focalCount: 210, activeFP: 195, onlineFP: 172, lastSeen: '6m ago', connectivity: 'good' },
  'Oyo': { hazards: ['flood'], totalLGAs: 33, totalWards: 351, focalCount: 250, activeFP: 240, onlineFP: 225, lastSeen: '2m ago', connectivity: 'excellent' },
  'Osun': { hazards: [], totalLGAs: 30, totalWards: 332, focalCount: 190, activeFP: 180, onlineFP: 168, lastSeen: '4m ago', connectivity: 'good' },
  'Ekiti': { hazards: [], totalLGAs: 16, totalWards: 177, focalCount: 130, activeFP: 122, onlineFP: 110, lastSeen: '5m ago', connectivity: 'good' },
  'Ondo': { hazards: ['flood'], totalLGAs: 18, totalWards: 203, focalCount: 160, activeFP: 148, onlineFP: 132, lastSeen: '7m ago', connectivity: 'good' },
  'Ogun': { hazards: [], totalLGAs: 20, totalWards: 236, focalCount: 170, activeFP: 160, onlineFP: 145, lastSeen: '4m ago', connectivity: 'good' },
  'Lagos': { hazards: ['flood', 'epidemic'], totalLGAs: 20, totalWards: 245, focalCount: 400, activeFP: 388, onlineFP: 372, lastSeen: '30s ago', connectivity: 'excellent' },
  'Edo': { hazards: ['flood'], totalLGAs: 18, totalWards: 192, focalCount: 160, activeFP: 148, onlineFP: 130, lastSeen: '6m ago', connectivity: 'good' },
  'Delta': { hazards: ['flood'], totalLGAs: 25, totalWards: 270, focalCount: 200, activeFP: 185, onlineFP: 162, lastSeen: '5m ago', connectivity: 'good' },
  'Anambra': { hazards: ['flood', 'epidemic'], totalLGAs: 21, totalWards: 326, focalCount: 220, activeFP: 198, onlineFP: 180, lastSeen: '3m ago', connectivity: 'good' },
  'Enugu': { hazards: [], totalLGAs: 17, totalWards: 260, focalCount: 175, activeFP: 162, onlineFP: 148, lastSeen: '5m ago', connectivity: 'good' },
  'Ebonyi': { hazards: ['flood'], totalLGAs: 13, totalWards: 171, focalCount: 140, activeFP: 128, onlineFP: 112, lastSeen: '8m ago', connectivity: 'good' },
  'Cross River': { hazards: ['flood'], totalLGAs: 18, totalWards: 196, focalCount: 230, activeFP: 215, onlineFP: 190, lastSeen: '4m ago', connectivity: 'good' },
  'Imo': { hazards: ['epidemic'], totalLGAs: 27, totalWards: 305, focalCount: 190, activeFP: 185, onlineFP: 170, lastSeen: '3m ago', connectivity: 'good' },
  'Abia': { hazards: [], totalLGAs: 17, totalWards: 184, focalCount: 150, activeFP: 140, onlineFP: 125, lastSeen: '6m ago', connectivity: 'good' },
  'Akwa Ibom': { hazards: ['flood'], totalLGAs: 31, totalWards: 329, focalCount: 220, activeFP: 205, onlineFP: 188, lastSeen: '4m ago', connectivity: 'good' },
  'Rivers': { hazards: ['flood', 'epidemic'], totalLGAs: 23, totalWards: 319, focalCount: 250, activeFP: 235, onlineFP: 218, lastSeen: '2m ago', connectivity: 'excellent' },
  'Bayelsa': { hazards: ['flood'], totalLGAs: 8, totalWards: 105, focalCount: 100, activeFP: 92, onlineFP: 78, lastSeen: '10m ago', connectivity: 'poor' },
  'Benue': { hazards: ['flood'], totalLGAs: 23, totalWards: 276, focalCount: 260, activeFP: 248, onlineFP: 225, lastSeen: '2m ago', connectivity: 'excellent' },
};

const hazardColors: Record<HazardType, string> = {
  flood: 'hsl(210 90% 50%)',
  drought: 'hsl(35 95% 55%)',
  epidemic: 'hsl(0 72% 55%)',
  heatwave: 'hsl(15 85% 55%)',
  fire: 'hsl(0 85% 50%)',
};

const hazardLabels: Record<HazardType, string> = {
  flood: '🌊 Flood',
  drought: '☀️ Drought',
  epidemic: '🦠 Epidemic',
  heatwave: '🔥 Heatwave',
  fire: '🔥 Fire',
};

// State-level fire risk shading derived from fireRiskZones (max probability per state)
const stateFireRisk: Record<string, number> = fireRiskZones.reduce((acc, z) => {
  acc[z.state] = Math.max(acc[z.state] ?? 0, z.probabilityPercent);
  return acc;
}, {} as Record<string, number>);

const fireRiskFill = (p: number) =>
  p >= 80 ? 'hsl(0 85% 45%)' : p >= 60 ? 'hsl(15 85% 55%)' : p >= 40 ? 'hsl(35 95% 55%)' : 'hsl(50 90% 55%)';

const connectivityColors: Record<string, string> = {
  excellent: 'hsl(142 71% 45%)',
  good: 'hsl(142 50% 55%)',
  poor: 'hsl(35 95% 55%)',
  offline: 'hsl(0 72% 55%)',
};

const GeoMap = () => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedHazard, setSelectedHazard] = useState<HazardType | 'all'>('all');
  const [activeLayer, setActiveLayer] = useState<LayerView>('hazards');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showFPDots, setShowFPDots] = useState(true);

  // Simulate real-time clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const hoveredData = hoveredState ? stateHazards[hoveredState] : null;
  const hoveredFP = hoveredState ? focalPersons.find(fp => fp.state === hoveredState) : null;

  const getStateFill = (name: string) => {
    const data = stateHazards[name];

    if (activeLayer === 'focal-persons') {
      if (!data) return 'hsl(215 20% 25%)';
      return connectivityColors[data.connectivity];
    }

    // Fire layer: shade by max zone probability in the state
    if (selectedHazard === 'fire') {
      const p = stateFireRisk[name];
      if (p === undefined) return 'hsl(215 20% 25%)';
      return fireRiskFill(p);
    }

    if (!data) return 'hsl(215 20% 25%)';
    const hazards = selectedHazard === 'all' ? data.hazards : data.hazards.filter(h => h === selectedHazard);
    if (hazards.length === 0) return 'hsl(215 20% 25%)';
    return hazardColors[hazards[0]];
  };

  const totalFP = Object.values(stateHazards).reduce((s, d) => s + d.activeFP, 0);
  const totalOnline = Object.values(stateHazards).reduce((s, d) => s + d.onlineFP, 0);
  const totalLGAs = Object.values(stateHazards).reduce((s, d) => s + d.totalLGAs, 0);
  const totalWards = Object.values(stateHazards).reduce((s, d) => s + d.totalWards, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="data-grid relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">
            Multi-Hazard Geospatial Map — Community Focal Persons
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <Wifi className="h-3 w-3 text-primary" />
            <span className="font-mono text-foreground font-bold">{totalOnline.toLocaleString()}</span>
            <span className="text-muted-foreground">Online</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-primary" />
            <span className="font-mono text-foreground font-bold">{totalFP.toLocaleString()}</span>
            <span className="text-muted-foreground">Active FPs</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono text-muted-foreground">{currentTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Layer toggle + stats bar */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Layer:</span>
          {(['hazards', 'focal-persons'] as LayerView[]).map(layer => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors border ${
                activeLayer === layer
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {layer === 'hazards' ? '⚠️ Hazards' : '👤 Focal Persons'}
            </button>
          ))}
          <button
            onClick={() => setShowFPDots(!showFPDots)}
            className={`px-2 py-1 rounded-full text-[10px] font-medium border transition-colors ${
              showFPDots ? 'bg-primary/20 text-primary border-primary/40' : 'bg-secondary text-muted-foreground border-border'
            }`}
          >
            <Eye className="h-3 w-3 inline mr-1" />FP Dots
          </button>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
          <span>📍 {totalLGAs} LGAs</span>
          <span>🏘️ {totalWards.toLocaleString()} Wards</span>
          <span>37 States</span>
        </div>
      </div>

      {/* Hazard Filter (shown when hazards layer active) */}
      {activeLayer === 'hazards' && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Filter:</span>
          {(['all', 'flood', 'drought', 'epidemic', 'heatwave', 'fire'] as const).map(h => (
            <button
              key={h}
              onClick={() => setSelectedHazard(h)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors border ${
                selectedHazard === h
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {h === 'all' ? '🗺️ All Hazards' : hazardLabels[h]}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* SVG Map */}
        <div className="xl:col-span-2 relative">
          <NigeriaChoroplethMap
            className="h-[420px]"
            fillFor={getStateFill}
            opacityFor={(name) => {
              const data = stateHazards[name];
              const hasFire = stateFireRisk[name] !== undefined;
              const hasData =
                activeLayer === 'focal-persons'
                  ? !!data
                  : selectedHazard === 'fire'
                    ? hasFire
                    : selectedHazard === 'all'
                      ? (data?.hazards.length ?? 0) > 0 || hasFire
                      : !!data?.hazards.includes(selectedHazard as HazardType);
              return hasData ? 0.68 : 0.18;
            }}
            markerFor={(name) =>
              showFPDots && stateHazards[name] ? connectivityColors[stateHazards[name].connectivity] : null
            }
            lgaColorFor={(name) =>
              stateHazards[name] ? connectivityColors[stateHazards[name].connectivity] : 'hsl(215 15% 55%)'
            }
            selected={hoveredState}
            onSelect={(name) => setHoveredState((s) => (s === name ? null : name))}
            tooltipFor={(name) => {
              const d = stateHazards[name];
              const fp = focalPersons.find((f) => f.state === name);
              const fire = stateFireRisk[name];
              return {
                title: `${name} State`,
                lines: [
                  d ? `Hazards: ${d.hazards.length ? d.hazards.join(', ') : 'none active'}` : 'No hazard record',
                  fire !== undefined ? `Fire risk ${fire}%` : '',
                  d ? `${d.onlineFP}/${d.activeFP} focal persons online · ${d.focalCount} total` : '',
                  d ? `${d.totalLGAs} LGAs · ${d.totalWards} wards · ${d.connectivity}` : '',
                  d ? `Last seen ${d.lastSeen}` : '',
                  fp ? `Lead FP ${fp.name} · ${fp.phoneNumber}` : '',
                ].filter(Boolean),
              };
            }}
            lgaTooltipFor={(name, lga, i) => {
              const d = stateHazards[name];
              if (!d) return { title: `${lga.name} LGA`, lines: [`${name} State`] };
              const wards = Math.max(4, Math.round(d.totalWards / Math.max(1, d.totalLGAs)));
              const fps = Math.max(1, Math.round(d.focalCount / Math.max(1, d.totalLGAs)));
              const online = Math.max(0, Math.round((d.onlineFP / Math.max(1, d.focalCount)) * fps));
              const fp = focalPersons.find((f) => f.state === name);
              return {
                title: `${lga.name} LGA`,
                lines: [
                  `${name} State · ${d.connectivity}`,
                  `${wards} wards · ${fps} focal persons (${online} online)`,
                  d.hazards.length ? `Hazards: ${d.hazards.join(', ')}` : 'No active hazard',
                  fp ? `Focal person ${fp.name} · ${fp.phoneNumber}` : `Ward focal desk #${i + 1}`,
                ],
              };
            }}
          />
        </div>


        {/* Side Panel */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            {activeLayer === 'focal-persons' ? (
              <><Wifi className="h-3.5 w-3.5 text-primary" /> FP Status by State</>
            ) : (
              <><AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Active Hazard Zones</>
            )}
          </h4>
          <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
            {Object.entries(stateHazards)
              .filter(([, d]) => activeLayer === 'focal-persons' || selectedHazard === 'all' || d.hazards.includes(selectedHazard as HazardType))
              .sort((a, b) => activeLayer === 'focal-persons'
                ? b[1].onlineFP - a[1].onlineFP
                : b[1].activeFP - a[1].activeFP
              )
              .slice(0, 20)
              .map(([state, data]) => (
                <div
                  key={state}
                  className={`p-2 rounded-md border transition-colors cursor-pointer ${
                    hoveredState === state
                      ? 'bg-primary/10 border-primary/40'
                      : 'bg-secondary/50 border-border/50 hover:border-primary/30'
                  }`}
                  onMouseEnter={() => setHoveredState(state)}
                  onMouseLeave={() => setHoveredState(null)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-foreground">{state}</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: connectivityColors[data.connectivity] }}
                      />
                      <span className="text-[10px] font-mono text-primary font-bold">
                        {activeLayer === 'focal-persons' ? `${data.onlineFP} online` : `${data.activeFP} FPs`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex gap-1">
                      {data.hazards.length > 0 ? data.hazards.map(h => (
                        <span
                          key={h}
                          className="text-[8px] px-1 py-0.5 rounded font-medium"
                          style={{ background: hazardColors[h] + '25', color: hazardColors[h] }}
                        >
                          {h}
                        </span>
                      )) : (
                        <span className="text-[8px] text-muted-foreground">No active hazards</span>
                      )}
                    </div>
                    <span className="text-[9px] text-muted-foreground font-mono">{data.lastSeen}</span>
                  </div>
                  <div className="mt-1">
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(data.onlineFP / data.focalCount) * 100}%`,
                          background: connectivityColors[data.connectivity],
                        }}
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      {data.totalLGAs} LGAs • {data.totalWards} Wards • {Math.round((data.onlineFP / data.focalCount) * 100)}% online
                    </p>
                  </div>
                </div>
              ))}
          </div>

          {/* Legend */}
          <div className="p-2.5 rounded-md bg-secondary/30 border border-border/50">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2">
              {activeLayer === 'focal-persons' ? 'Connectivity Legend' : 'Hazard Legend'}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {activeLayer === 'focal-persons' ? (
                <>
                  {Object.entries(connectivityColors).map(([key, color]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                      <span className="text-[10px] text-muted-foreground capitalize">{key}</span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {Object.entries(hazardLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: hazardColors[key as HazardType] }} />
                      <span className="text-[10px] text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GeoMap;
