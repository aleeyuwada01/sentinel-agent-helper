import TopBar from '@/components/dashboard/TopBar';
import AgencyBar from '@/components/dashboard/AgencyBar';
import HazardCard from '@/components/dashboard/HazardCard';
import NIHSAPanel from '@/components/dashboard/NIHSAPanel';
import NIMETPanel from '@/components/dashboard/NIMETPanel';
// HIDDEN — uncomment to re-enable:
// import FFSPanel from '@/components/dashboard/FFSPanel';
// import NCDCPanel from '@/components/dashboard/NCDCPanel';
import NEMAPanel from '@/components/dashboard/NEMAPanel';
import NOAPanel from '@/components/dashboard/NOAPanel';
// import SEMAPanel from '@/components/dashboard/SEMAPanel';
import DisseminationPanel from '@/components/dashboard/DisseminationPanel';
import GeoMap from '@/components/dashboard/GeoMap';
import AgencySummary from '@/components/dashboard/AgencySummary';
import CountryDashboard from '@/components/dashboard/CountryDashboard';
import AdminBoundaryMap from '@/components/dashboard/AdminBoundaryMap';
import NigeriaPolygonMap from '@/components/dashboard/NigeriaPolygonMap';
import IncidentTimeline from '@/components/dashboard/IncidentTimeline';
import CountryAgencyPanels from '@/components/dashboard/CountryAgencyPanels';
import CollapsiblePanel from '@/components/dashboard/CollapsiblePanel';
import CoordinationChat from '@/components/dashboard/CoordinationChat';
import CountryFocalPersons from '@/components/dashboard/CountryFocalPersons';
import ExposurePanel from '@/components/dashboard/ExposurePanel';
import AnalyticalReportBar from '@/components/dashboard/AnalyticalReportBar';
import { Droplets, MessageSquare, Siren, UserRound } from 'lucide-react';
import { useCountry } from '@/hooks/useCountry';
import { hazardStatuses } from '@/data/mockData';
import { countryKPI } from '@/data/adminBoundaries';

const Index = () => {
  const { country } = useCountry();

  if (!country.isOwner) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <main className="p-6 space-y-6 max-w-[1600px] mx-auto">
          <CountryDashboard country={country} />
          <footer className="text-center py-4 border-t border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              WAMHEWS · {country.systemAcronym} {country.name} — {country.systemName} • {country.leadAgency} Lead Agency
            </p>
          </footer>
        </main>
      </div>
    );
  }

  const kpi = countryKPI(country);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <AgencyBar />

      <main className="p-6 space-y-6 max-w-[1600px] mx-auto">

        {/* Hazard Status Cards */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Hazard Status Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {hazardStatuses.map((h) => (
              <HazardCard key={h.type} hazard={h} />
            ))}
          </div>
        </section>

        {/* Interactive Nigeria map — state polygons, LGA point features */}
        <NigeriaPolygonMap />

        {/* Administrative boundary cartogram (States / LGAs) */}
        <AdminBoundaryMap
          country={country}
          hazard="flood"
          title={`${country.name} — Administrative Boundary Risk Layers`}
          icon={<Droplets className="h-4 w-4 text-primary" />}
        />

        {/* Operational dashboard — agency feeds come immediately after the map */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <NIHSAPanel />
          <NIMETPanel />
        </section>

        {/* HIDDEN — uncomment to re-enable: */}
        {/* <FFSPanel /> */}
        {/* <NCDCPanel /> */}
        <NEMAPanel />

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* <SEMAPanel /> */}
          <NOAPanel />
        </section>

        {/* Household & building footprint exposure */}
        <ExposurePanel country={country} hazard="flood" />

        {/* Per-agency data panels */}
        <CountryAgencyPanels country={country} />

        {/* Geospatial Map */}
        <GeoMap />

        {/* Dissemination Network */}
        <DisseminationPanel />

        {/* Agency Summary */}
        <AgencySummary />

        {/* Icon-gated detail panels */}
        <CollapsiblePanel
          title="Nigeria — Command Focal Persons"
          subtitle="Click to reveal the focal-person roster and contact details"
          icon={<UserRound className="h-4 w-4 text-primary" />}
          badge={`${country.focalPersons.active.toLocaleString()} active`}
        >
          <CountryFocalPersons country={country} />
        </CollapsiblePanel>

        <CollapsiblePanel
          title="Nigeria — Incident Timeline"
          subtitle="Click to reveal triggered alerts, causes and dissemination outcomes"
          icon={<Siren className="h-4 w-4 text-alert-orange" />}
          badge={`${kpi.activeIncidents} active · ${kpi.incidents30d} in 30d`}
        >
          <IncidentTimeline country={country} />
        </CollapsiblePanel>

        <CollapsiblePanel
          title="Nigeria — Coordination Chat"
          subtitle="Click to open the command, field, dissemination and data channels"
          icon={<MessageSquare className="h-4 w-4 text-primary" />}
        >
          <CoordinationChat country={country} />
        </CollapsiblePanel>

        <AnalyticalReportBar country={country} />

        {/* Footer */}
        <footer className="text-center py-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            WAMHEWS · NMHEWS Nigeria — National Multi-Hazard Early Warning System • NEMA Lead Agency
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
