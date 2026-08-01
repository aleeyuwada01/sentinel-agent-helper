import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Building2, Droplets, Flame, MessageSquare, Radio, Siren, UserRound, Users } from 'lucide-react';
import HazardCard from './HazardCard';
import AdminBoundaryMap from './AdminBoundaryMap';
import CountryBoundaryMap from './CountryBoundaryMap';
import IncidentTimeline from './IncidentTimeline';
import CountryAgencyPanels from './CountryAgencyPanels';
import CollapsiblePanel from './CollapsiblePanel';
import CoordinationChat from './CoordinationChat';
import ExposurePanel from './ExposurePanel';
import AnalyticalReportBar from './AnalyticalReportBar';
import CountryFocalPersons from './CountryFocalPersons';
import { type CountryProfile } from '@/data/westAfrica';
import { boundaryLabels, countryKPI } from '@/data/adminBoundaries';
import type { HazardType } from '@/data/mockData';

const hazardTabs: { type: HazardType; label: string }[] = [
  { type: 'flood', label: 'Flood' },
  { type: 'drought', label: 'Drought' },
  { type: 'epidemic', label: 'Epidemic' },
  { type: 'heatwave', label: 'Heatwave' },
  { type: 'fire', label: 'Fire' },
];

const statusColor: Record<string, string> = {
  Normal: 'text-alert-green',
  Watch: 'text-alert-orange',
  Alert: 'text-alert-red',
};

/** Generic country dashboard used for every non-owner deployment (Ghana, Sierra Leone, Côte d'Ivoire). */
const CountryDashboard = ({ country }: { country: CountryProfile }) => {
  const [hazard, setHazard] = useState<HazardType>('flood');
  const labels = boundaryLabels[country.code];
  const kpi = countryKPI(country);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          {country.name} — Hazard Status Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {country.hazardStatuses.map((h) => (
            <HazardCard key={h.type} hazard={h} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-1 mb-3 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground mr-2">
            Hazard layer
          </span>
          {hazardTabs.map((t) => (
            <button
              key={t.type}
              onClick={() => setHazard(t.type)}
              className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
                hazard === t.type
                  ? 'bg-primary/25 border-primary/50 text-foreground'
                  : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <CountryBoundaryMap country={country} hazard={hazard} />
        <div className="h-4" />
        <AdminBoundaryMap
          country={country}
          hazard={hazard}
          title={`${country.name} — ${hazardTabs.find((t) => t.type === hazard)?.label} Distribution`}
          icon={
            hazard === 'fire' ? (
              <Flame className="h-4 w-4 text-alert-orange" />
            ) : (
              <Droplets className="h-4 w-4 text-primary" />
            )
          }
        />
      </section>

      <section className="data-grid">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Building2 className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Partner Agencies — {country.name}</h3>
          <span className="text-[10px] font-mono text-muted-foreground">
            Lead: {country.leadAgency}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {country.agencies.map((a, i) => (
            <motion.div
              key={a.code}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="border-l-4 border-l-primary/70 bg-secondary/50 rounded-md p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-foreground">{a.name}</span>
                <span className="text-[10px] text-muted-foreground">{a.code}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">{a.fullName}</p>
              <p className="text-[10px] text-muted-foreground mb-2 line-clamp-1">{a.role}</p>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-alert-orange" />
                  <span className="font-mono text-foreground">{a.activeAlerts}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-primary" />
                  <span className="font-mono text-foreground">{a.personnelDeployed}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <CountryAgencyPanels country={country} />

      <ExposurePanel country={country} hazard={hazard} />

      <section className="data-grid">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Monitoring Station Feed</h3>
          <span className="text-[10px] font-mono text-muted-foreground">
            {country.stations.length} live parameters
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-3 font-medium">Station</th>
                <th className="py-2 pr-3 font-medium">{labels.level1Singular}</th>
                <th className="py-2 pr-3 font-medium">Network</th>
                <th className="py-2 pr-3 font-medium">Parameter</th>
                <th className="py-2 pr-3 font-medium">Reading</th>
                <th className="py-2 pr-3 font-medium">Threshold</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {country.stations.map((s) => (
                <tr key={`${s.name}-${s.parameter}`} className="border-b border-border/50">
                  <td className="py-2 pr-3 text-foreground font-medium">{s.name}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{s.region}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{s.network}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{s.parameter}</td>
                  <td className="py-2 pr-3 font-mono text-foreground">{s.value}</td>
                  <td className="py-2 pr-3 font-mono text-muted-foreground">{s.threshold}</td>
                  <td className={`py-2 font-mono font-semibold ${statusColor[s.status]}`}>{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="data-grid">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Community Dissemination Network</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Focal persons active', value: country.focalPersons.active.toLocaleString() },
            { label: 'Focal persons enrolled', value: country.focalPersons.total.toLocaleString() },
            { label: 'Broadcast languages', value: country.languages.join(' · ') },
            { label: 'Population covered', value: `${(country.population / 1_000_000).toFixed(1)}M` },
          ].map((s) => (
            <div key={s.label} className="bg-secondary/50 rounded-md p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{s.label}</p>
              <p className="text-sm font-mono font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      <CollapsiblePanel
        title={`${country.shortName} — Command Focal Persons`}
        subtitle="Click to reveal the focal-person roster and contact details"
        icon={<UserRound className="h-4 w-4 text-primary" />}
        badge={`${country.focalPersons.active.toLocaleString()} active`}
      >
        <CountryFocalPersons country={country} />
      </CollapsiblePanel>

      <CollapsiblePanel
        title={`${country.shortName} — Incident Timeline`}
        subtitle="Click to reveal triggered alerts, causes and dissemination outcomes"
        icon={<Siren className="h-4 w-4 text-alert-orange" />}
        badge={`${kpi.activeIncidents} active · ${kpi.incidents30d} in 30d`}
      >
        <IncidentTimeline country={country} />
      </CollapsiblePanel>

      <CollapsiblePanel
        title={`${country.shortName} — Coordination Chat`}
        subtitle="Click to open the command, field, dissemination and data channels"
        icon={<MessageSquare className="h-4 w-4 text-primary" />}
      >
        <CoordinationChat country={country} />
      </CollapsiblePanel>

      <AnalyticalReportBar country={country} />
    </div>
  );
};

export default CountryDashboard;
