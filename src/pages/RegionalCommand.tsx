import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Globe2, AlertTriangle, Users, Radio, Home, Siren, UserRound, MessageSquare, FileText, Sheet } from 'lucide-react';
import TopBar from '@/components/dashboard/TopBar';
import WestAfricaMap from '@/components/dashboard/WestAfricaMap';
import CrossCountryKPI from '@/components/dashboard/CrossCountryKPI';
import AgencyHeadsPanel from '@/components/dashboard/AgencyHeadsPanel';
import IncidentTimeline from '@/components/dashboard/IncidentTimeline';
import CollapsiblePanel from '@/components/dashboard/CollapsiblePanel';
import CoordinationChat from '@/components/dashboard/CoordinationChat';
import { downloadRegionalCsv, downloadRegionalPdf } from '@/lib/analyticalReport';
import { useCountry } from '@/hooks/useCountry';
import {
  countries,
  countryActiveAlerts,
  countryAlertLevel,
  countryPersonnel,
  getCountry,
} from '@/data/westAfrica';
import { allCountryKPIs, boundaryLabels } from '@/data/adminBoundaries';
import { useAuth } from '@/hooks/useAuth';
import { allowedCountries, canViewRegional, scopeSummary } from '@/data/accessControl';

const levelClass: Record<string, string> = {
  green: 'text-alert-green',
  yellow: 'text-alert-yellow',
  orange: 'text-alert-orange',
  red: 'text-alert-red',
};

const RegionalCommand = () => {
  const { countryCode, setCountryCode } = useCountry();
  const focusCountry = getCountry(countryCode);

  const { scope } = useAuth();
  const permitted = allowedCountries(scope);
  const visibleCountries = countries.filter((c) => permitted.includes(c.code));
  const kpis = allCountryKPIs().filter((k) => permitted.includes(k.code));
  const totalAlerts = visibleCountries.reduce((s, c) => s + countryActiveAlerts(c), 0);
  const totalPersonnel = visibleCountries.reduce((s, c) => s + countryPersonnel(c), 0);
  const totalFocal = visibleCountries.reduce((s, c) => s + c.focalPersons.active, 0);
  const totalHouseholds = kpis.reduce((s, k) => s + k.householdsReached, 0);

  if (!canViewRegional(scope)) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <main className="p-6 max-w-3xl mx-auto">
          <div className="data-grid space-y-2">
            <h1 className="text-sm font-bold text-foreground">Regional command access restricted</h1>
            <p className="text-[11px] text-muted-foreground">
              Cross-country comparison is reserved for the West Africa Central Command. Your access scope is{' '}
              <span className="font-mono text-foreground">{scopeSummary(scope)}</span>.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="p-6 space-y-6 max-w-[1600px] mx-auto">
        <section>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-primary" /> WAMHEWS — West Africa Central Command Center
          </h1>
          <p className="text-[11px] text-muted-foreground mt-1">
            Consolidated command view across {visibleCountries.length} national deployments — Nigeria (platform owner),
            Ghana, Côte d'Ivoire and Sierra Leone. Heads of all partner agencies sit here as national focal
            persons.
          </p>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active alerts (region)', value: totalAlerts.toLocaleString(), icon: AlertTriangle },
            { label: 'Personnel deployed', value: totalPersonnel.toLocaleString(), icon: Users },
            { label: 'Community focal persons', value: totalFocal.toLocaleString(), icon: Radio },
            { label: 'Households reached', value: totalHouseholds.toLocaleString(), icon: Home },
          ].map((s) => (
            <div key={s.label} className="data-grid">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className="h-3.5 w-3.5 text-primary" />
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
              </div>
              <p className="text-xl font-mono font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </section>

        <CrossCountryKPI onSelect={setCountryCode} />

        <section className="data-grid">
          <h2 className="font-semibold text-sm text-foreground mb-2">Regional Hazard Map</h2>
          <p className="text-[10px] text-muted-foreground mb-2">
            Official West Africa boundary geometry. Member states are shaded by highest active alert
            level; hover to inspect a country and its level-1 boundaries, click to switch the national
            dashboard.
          </p>
          <div className="h-[520px] rounded-lg overflow-hidden border border-border">
            <WestAfricaMap selected={countryCode} onSelect={setCountryCode} />
          </div>
        </section>

        <CollapsiblePanel
          title="Agency Heads — Central Command Focal Persons"
          subtitle="Click to reveal the head of each partner agency and their duty desk"
          icon={<UserRound className="h-4 w-4 text-primary" />}
          badge={`${totalFocal.toLocaleString()} focal persons`}
        >
          <AgencyHeadsPanel />
        </CollapsiblePanel>

        <CollapsiblePanel
          title={`${focusCountry.shortName} — Incident Timeline`}
          subtitle="Click to reveal what caused each alert and which households were reached"
          icon={<Siren className="h-4 w-4 text-alert-orange" />}
        >
          <IncidentTimeline country={focusCountry} />
        </CollapsiblePanel>

        <CollapsiblePanel
          title={`${focusCountry.shortName} — Coordination Chat`}
          subtitle="Click to open the command, field, dissemination and data channels"
          icon={<MessageSquare className="h-4 w-4 text-primary" />}
        >
          <CoordinationChat country={focusCountry} />
        </CollapsiblePanel>

        <section className="data-grid flex items-center gap-3 flex-wrap">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">Regional Analytical Report</h3>
            <p className="text-[10px] text-muted-foreground">
              Cross-country comparison: highest-risk hazard, incident counts, dissemination reach and household /
              building footprint exposure for every deployment.
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={downloadRegionalPdf}
              className="inline-flex items-center gap-1 rounded bg-primary/25 border border-primary/40 px-3 py-1.5 text-[11px] text-foreground hover:bg-primary/35 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" /> Download PDF
            </button>
            <button
              onClick={downloadRegionalCsv}
              className="inline-flex items-center gap-1 rounded border border-border px-3 py-1.5 text-[11px] text-foreground hover:bg-secondary transition-colors"
            >
              <Sheet className="h-3.5 w-3.5" /> Download CSV
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {visibleCountries.map((c, i) => {
            const labels = boundaryLabels[c.code];
            const kpi = kpis.find((k) => k.code === c.code)!;
            return (
              <motion.div
                key={c.code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="data-grid"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-foreground">
                    {c.flag} {c.shortName}
                  </span>
                  <span className={`text-[10px] font-mono uppercase ${levelClass[countryAlertLevel(c)]}`}>
                    {countryAlertLevel(c)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mb-2">
                  {c.systemAcronym} · Lead: {c.leadAgency} {c.isOwner && '· ★ Owner'}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                  <div>
                    <p className="text-muted-foreground text-[10px]">Alerts</p>
                    <p className="font-mono text-foreground">{countryActiveAlerts(c)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px]">{labels.level1}</p>
                    <p className="font-mono text-foreground">{kpi.level1Count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px]">{labels.level2}</p>
                    <p className="font-mono text-foreground">{kpi.level2Count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px]">Focal persons</p>
                    <p className="font-mono text-foreground">{c.focalPersons.active.toLocaleString()}</p>
                  </div>
                </div>
                <Link
                  to="/"
                  onClick={() => setCountryCode(c.code)}
                  className="block text-center text-[11px] px-2 py-1.5 rounded bg-primary/20 border border-primary/30 text-foreground hover:bg-primary/30 transition-colors"
                >
                  Open national dashboard
                </Link>
              </motion.div>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default RegionalCommand;
