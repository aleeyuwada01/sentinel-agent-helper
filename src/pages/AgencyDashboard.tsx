import { useParams, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, AlertTriangle, Activity, Building2 } from 'lucide-react';
import TopBar from '@/components/dashboard/TopBar';
import NIHSAPanel from '@/components/dashboard/NIHSAPanel';
import NIMETPanel from '@/components/dashboard/NIMETPanel';
import FloodOutlookPanel from '@/components/dashboard/FloodOutlookPanel';
import { agencies, nihsaReadings, nimetReadings, focalPersons } from '@/data/mockData';
import { alertHistory } from '@/data/alertData';
import { Badge } from '@/components/ui/badge';

const agencyColorMap: Record<string, string> = {
  NIHSA: 'text-agency-nihsa',
  NIMET: 'text-agency-nimet',
  NEMA: 'text-agency-nema',
  NCDC: 'text-agency-ncdc',
  NOA: 'text-agency-noa',
  SEMA: 'text-agency-sema',
  LEMA: 'text-agency-lema',
};

const agencyBgMap: Record<string, string> = {
  NIHSA: 'bg-agency-nihsa/10 border-agency-nihsa/30',
  NIMET: 'bg-agency-nimet/10 border-agency-nimet/30',
  NEMA: 'bg-agency-nema/10 border-agency-nema/30',
  NCDC: 'bg-agency-ncdc/10 border-agency-ncdc/30',
  NOA: 'bg-agency-noa/10 border-agency-noa/30',
  SEMA: 'bg-agency-sema/10 border-agency-sema/30',
  LEMA: 'bg-agency-lema/10 border-agency-lema/30',
};

const AgencyDashboard = () => {
  const { code } = useParams({ from: '/agency/$code' });
  const agency = agencies.find(a => a.code === code?.toUpperCase());

  if (!agency) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">Agency Not Found</h2>
          <Link to="/" className="text-primary hover:underline text-sm">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const agencyAlerts = alertHistory.filter(a => a.agency === agency.code);
  const agencyFPs = focalPersons.filter(fp => fp.status === 'active');
  const colorClass = agencyColorMap[agency.code] || 'text-primary';
  const bgClass = agencyBgMap[agency.code] || 'bg-primary/10 border-primary/30';

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="p-6 space-y-6 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-md hover:bg-secondary transition-colors">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Link>
          <div>
            <h1 className={`text-xl font-bold ${colorClass}`}>{agency.fullName}</h1>
            <p className="text-xs text-muted-foreground">{agency.role}</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Alerts', value: agency.activeAlerts, icon: AlertTriangle, color: 'text-alert-red' },
            { label: 'Personnel Deployed', value: agency.personnelDeployed, icon: Users, color: colorClass },
            { label: 'Focal Persons Active', value: agencyFPs.length, icon: Activity, color: 'text-alert-green' },
            { label: 'States Covered', value: new Set(agencyFPs.map(f => f.state)).size, icon: Building2, color: 'text-primary' },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`data-grid border ${bgClass}`}
            >
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold font-mono text-foreground">{kpi.value.toLocaleString()}</p>
            </motion.div>
          ))}
        </div>

        {/* Agency-specific data feed */}
        {agency.code === 'NIHSA' && (
          <>
            <NIHSAPanel />
            <FloodOutlookPanel />
          </>
        )}
        {agency.code === 'NIMET' && <NIMETPanel />}

        {/* Agency Alerts */}
        <div className="data-grid">
          <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${colorClass}`} />
            Agency Alerts
          </h3>
          {agencyAlerts.length === 0 ? (
            <p className="text-xs text-muted-foreground">No alerts assigned to this agency.</p>
          ) : (
            <div className="space-y-2">
              {agencyAlerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-md bg-secondary/50 border border-border/50">
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'} className="text-[10px] mt-0.5">
                    {alert.severity}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{alert.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{alert.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                      {alert.state} • {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {alert.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Data Ingestion Module placeholder */}
        <div className="data-grid">
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <Activity className={`h-4 w-4 ${colorClass}`} />
            Data Ingestion Module
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Submit new readings and observations for centralized processing.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Station / Location</label>
                <input className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground" placeholder="Enter station name" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Reading Type</label>
                <select className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground">
                  <option>River Level</option>
                  <option>Temperature</option>
                  <option>Ground Water</option>
                  <option>Turbidity</option>
                  <option>Water Quality</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Value</label>
                <input type="number" className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground" placeholder="Enter reading value" />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">State</label>
                <input className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground" placeholder="Enter state" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Notes</label>
                <textarea className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground min-h-[80px]" placeholder="Additional observations..." />
              </div>
              <button className={`w-full py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors`}>
                Submit Reading
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgencyDashboard;
