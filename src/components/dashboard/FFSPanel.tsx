import { motion } from 'framer-motion';
import { Flame, Truck, Users, ShieldAlert, Building2, Trees, Factory, Landmark, Map as MapIcon } from 'lucide-react';
import { fireRiskZones, fireStations, fireIncidents, FireZoneType, FireRiskLevel } from '@/data/mockData';
import HazardDistributionMap from './HazardDistributionMap';

const riskClass: Record<FireRiskLevel, string> = {
  low: 'bg-alert-green/20 text-alert-green',
  moderate: 'bg-alert-yellow/20 text-alert-yellow',
  high: 'bg-alert-orange/20 text-alert-orange',
  critical: 'bg-alert-red/20 text-alert-red',
};

const readinessClass: Record<string, string> = {
  Ready: 'bg-alert-green/20 text-alert-green',
  Partial: 'bg-alert-yellow/20 text-alert-yellow',
  Limited: 'bg-alert-red/20 text-alert-red',
};

const zoneMeta: Record<FireZoneType, { label: string; icon: typeof Building2 }> = {
  urban_market: { label: 'Urban Markets', icon: Building2 },
  forest_reserve: { label: 'Forest Reserves', icon: Trees },
  industrial_site: { label: 'Industrial Sites', icon: Factory },
  critical_infrastructure: { label: 'Critical Infrastructure', icon: Landmark },
};

const probColor = (p: number) =>
  p >= 80 ? 'text-alert-red' : p >= 60 ? 'text-alert-orange' : p >= 40 ? 'text-alert-yellow' : 'text-alert-green';

const FFSPanel = () => {
  const totalUnits = fireStations.reduce((s, f) => s + f.trucks, 0);
  const totalPersonnel = fireStations.reduce((s, f) => s + f.personnel, 0);
  const criticalZones = fireRiskZones.filter((z) => z.riskLevel === 'critical').length;
  const highZones = fireRiskZones.filter((z) => z.riskLevel === 'high').length;

  // Group by zone type
  const groups = (Object.keys(zoneMeta) as FireZoneType[]).map((zt) => ({
    type: zt,
    meta: zoneMeta[zt],
    zones: fireRiskZones.filter((z) => z.zoneType === zt),
  }));

  // Aggregate fire risk per state (max zone probability)
  const fireStateRisk = Object.values(
    fireRiskZones.reduce<Record<string, { state: string; prob: number; zones: string[] }>>((acc, z) => {
      const cur = acc[z.state] ?? { state: z.state, prob: 0, zones: [] };
      cur.prob = Math.max(cur.prob, z.probabilityPercent);
      cur.zones.push(zoneMeta[z.zoneType].label);
      acc[z.state] = cur;
      return acc;
    }, {})
  ).map((s) => ({
    state: s.state,
    riskLevel: (s.prob >= 75 ? 'high' : s.prob >= 50 ? 'moderate' : 'low') as 'high' | 'moderate' | 'low',
    probabilityPercent: s.prob,
    predictedPeakMonth: 'Harmattan',
    riverBasin: Array.from(new Set(s.zones)).join(' · '),
    vulnerablePopulation: Math.round((s.prob / 100) * 400_000),
  }));

  return (
    <div className="space-y-4">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25 }}
      className="data-grid"
    >
      <div className="flex items-center gap-2 mb-4">
        <Flame className="h-4 w-4 text-agency-ffs" />
        <h3 className="font-semibold text-sm text-foreground">
          Federal Fire Service — Zone-Based Fire Risk Engine
        </h3>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground status-pulse">● LIVE</span>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div className="rounded border border-border bg-secondary/40 p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <ShieldAlert className="h-3 w-3 text-alert-red" /> Critical Zones
          </div>
          <p className="mt-1 font-mono text-lg text-alert-red">{criticalZones}</p>
        </div>
        <div className="rounded border border-border bg-secondary/40 p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Flame className="h-3 w-3 text-alert-orange" /> High-Risk Zones
          </div>
          <p className="mt-1 font-mono text-lg text-alert-orange">{highZones}</p>
        </div>
        <div className="rounded border border-border bg-secondary/40 p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Truck className="h-3 w-3 text-agency-ffs" /> Trucks Available
          </div>
          <p className="mt-1 font-mono text-lg text-foreground">{totalUnits}</p>
        </div>
        <div className="rounded border border-border bg-secondary/40 p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Users className="h-3 w-3 text-agency-ffs" /> Personnel
          </div>
          <p className="mt-1 font-mono text-lg text-foreground">{totalPersonnel}</p>
        </div>
      </div>

      {/* Zone-based risk groups */}
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Fire Risk by Zone (probability · parameters · threshold)
      </p>
      <div className="space-y-4 mb-5">
        {groups.map(({ type, meta, zones }) => {
          const Icon = meta.icon;
          return (
            <div key={type} className="rounded border border-border bg-secondary/20">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                <Icon className="h-3.5 w-3.5 text-agency-ffs" />
                <span className="text-xs font-semibold text-foreground">{meta.label}</span>
                <span className="text-[10px] text-muted-foreground ml-1">({zones.length} zones)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/70">
                      <th className="text-left px-3 py-1.5 text-muted-foreground font-medium">Zone</th>
                      <th className="text-left px-3 py-1.5 text-muted-foreground font-medium">State / LGA</th>
                      <th className="text-left px-3 py-1.5 text-muted-foreground font-medium">Parameters vs Threshold</th>
                      <th className="text-right px-3 py-1.5 text-muted-foreground font-medium">Probability</th>
                      <th className="text-center px-3 py-1.5 text-muted-foreground font-medium">Risk</th>
                      <th className="text-left px-3 py-1.5 text-muted-foreground font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zones.map((z) => (
                      <tr key={z.id} className="border-b border-border/40 hover:bg-secondary/40 transition-colors">
                        <td className="px-3 py-2 font-medium text-foreground">{z.zoneName}</td>
                        <td className="px-3 py-2 text-muted-foreground">{z.state} · {z.lga}</td>
                        <td className="px-3 py-2">
                          <div className="space-y-0.5">
                            {z.parameters.map((p) => (
                              <div key={p.label} className="flex items-center gap-1.5 text-[10px]">
                                <span className={`h-1.5 w-1.5 rounded-full ${p.breached ? 'bg-alert-red' : 'bg-alert-green'}`} />
                                <span className="text-foreground">{p.label}:</span>
                                <span className={`font-mono ${p.breached ? 'text-alert-red' : 'text-foreground'}`}>{p.value}</span>
                                <span className="text-muted-foreground">({p.threshold})</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className={`font-mono font-bold ${probColor(z.probabilityPercent)}`}>
                            {z.probabilityPercent}%
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${riskClass[z.riskLevel]}`}>
                            {z.riskLevel}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[220px]">{z.recommendedAction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reported incidents (no severity) */}
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Reported Incidents (community / FFS submissions)
      </p>
      <div className="overflow-x-auto mb-5">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-muted-foreground font-medium">ID</th>
              <th className="text-left py-2 text-muted-foreground font-medium">Location</th>
              <th className="text-left py-2 text-muted-foreground font-medium">State / LGA</th>
              <th className="text-left py-2 text-muted-foreground font-medium">Zone</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Status</th>
              <th className="text-left py-2 text-muted-foreground font-medium">Reporter</th>
              <th className="text-left py-2 text-muted-foreground font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {fireIncidents.map((i) => (
              <tr key={i.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                <td className="py-2 font-mono font-medium text-foreground">{i.id}</td>
                <td className="py-2 text-foreground">{i.location}</td>
                <td className="py-2 text-muted-foreground">{i.state} · {i.lga}</td>
                <td className="py-2 text-muted-foreground">{zoneMeta[i.zoneType].label}</td>
                <td className="py-2 text-center">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    i.status === 'Active' ? 'bg-alert-red/20 text-alert-red'
                    : i.status === 'Contained' ? 'bg-alert-orange/20 text-alert-orange'
                    : 'bg-alert-green/20 text-alert-green'
                  }`}>
                    {i.status}
                  </span>
                </td>
                <td className="py-2 text-muted-foreground">{i.reporterName}</td>
                <td className="py-2 text-muted-foreground max-w-[260px] truncate">{i.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stations */}
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Station Readiness</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-muted-foreground font-medium">Station</th>
              <th className="text-left py-2 text-muted-foreground font-medium">State</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Personnel</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Trucks</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Water (kL)</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Readiness</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Active</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Last Drill</th>
            </tr>
          </thead>
          <tbody>
            {fireStations.map((s) => (
              <tr key={s.station} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                <td className="py-2 font-mono font-medium text-foreground">{s.station}</td>
                <td className="py-2 text-muted-foreground">{s.state}</td>
                <td className="py-2 text-right font-mono text-foreground">{s.personnel}</td>
                <td className="py-2 text-right font-mono text-foreground">{s.trucks}</td>
                <td className="py-2 text-right font-mono text-foreground">{s.waterCapacityKL}</td>
                <td className="py-2 text-center">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${readinessClass[s.readiness]}`}>
                    {s.readiness}
                  </span>
                </td>
                <td className="py-2 text-right font-mono">
                  <span className={s.activeIncidents > 0 ? 'text-alert-orange' : 'text-muted-foreground'}>
                    {s.activeIncidents}
                  </span>
                </td>
                <td className="py-2 text-right font-mono text-muted-foreground">{s.lastDrill}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>

      <HazardDistributionMap
        title="Fire Risk Distribution by State"
        subtitle="FFS Zone Aggregate"
        icon={<MapIcon className="h-4 w-4 text-agency-ffs" />}
        stateData={fireStateRisk}
        delay={0.35}
      />
    </div>
  );
};

export default FFSPanel;
