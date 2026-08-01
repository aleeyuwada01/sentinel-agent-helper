import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Database, Users, Network, Plus, Search, Phone, MapPin, Upload, FileSpreadsheet, Flame, Droplets, Sun, Activity, Thermometer, ClipboardList } from 'lucide-react';
import TopBar from '@/components/dashboard/TopBar';
import DatasetImportPanel from '@/components/dashboard/DatasetImportPanel';
import { focalPersons, FocalPerson, fireIncidents, FireIncident, FireZoneType, HazardType } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type TabId = 'focal_persons' | 'gitmatrix' | 'fire_incident' | 'hazard_reports';

// Hazard-specific parameter schema — drives the dynamic form below.
type ParamField = { name: string; label: string; unit?: string; type?: 'number' | 'text' | 'select'; options?: string[]; placeholder?: string };
const hazardParamSchema: Record<Exclude<HazardType, 'fire'>, { label: string; icon: typeof Droplets; color: string; fields: ParamField[] }> = {
  flood: {
    label: 'Flood', icon: Droplets, color: 'text-hazard-flood',
    fields: [
      { name: 'station', label: 'Hydro Station', placeholder: 'e.g. Lokoja' },
      { name: 'riverLevel', label: 'River Level', unit: 'm', type: 'number' },
      { name: 'maxLevel', label: 'Flood Threshold', unit: 'm', type: 'number' },
      { name: 'groundWater', label: 'Groundwater Depth', unit: 'm', type: 'number' },
      { name: 'turbidity', label: 'Turbidity', unit: 'NTU', type: 'number' },
      { name: 'trend', label: 'Trend', type: 'select', options: ['rising', 'falling', 'stable'] },
    ],
  },
  drought: {
    label: 'Drought', icon: Sun, color: 'text-hazard-drought',
    fields: [
      { name: 'station', label: 'Observation Site', placeholder: 'e.g. Maiduguri' },
      { name: 'rainfall30d', label: 'Rainfall (30d)', unit: 'mm', type: 'number' },
      { name: 'rainfallDeviation', label: 'Anomaly vs Normal', unit: '%', type: 'number' },
      { name: 'soilMoisture', label: 'Soil Moisture', unit: '%', type: 'number' },
      { name: 'ndvi', label: 'NDVI Index', type: 'number', placeholder: '0.0 – 1.0' },
      { name: 'reservoirLevel', label: 'Reservoir Level', unit: '%', type: 'number' },
    ],
  },
  epidemic: {
    label: 'Epidemic', icon: Activity, color: 'text-hazard-epidemic',
    fields: [
      { name: 'disease', label: 'Disease', type: 'select', options: ['Cholera', 'Lassa Fever', 'Measles', 'Meningitis', 'Yellow Fever', 'Other'] },
      { name: 'suspectedCases', label: 'Suspected Cases', type: 'number' },
      { name: 'confirmedCases', label: 'Confirmed Cases', type: 'number' },
      { name: 'fatalities', label: 'Fatalities', type: 'number' },
      { name: 'attackRate', label: 'Attack Rate', unit: '/100k', type: 'number' },
      { name: 'cfr', label: 'Case Fatality Rate', unit: '%', type: 'number' },
    ],
  },
  heatwave: {
    label: 'Heatwave', icon: Thermometer, color: 'text-hazard-heatwave',
    fields: [
      { name: 'station', label: 'Met Station', placeholder: 'e.g. Sokoto' },
      { name: 'temperature', label: 'Air Temperature', unit: '°C', type: 'number' },
      { name: 'heatIndex', label: 'Heat Index', unit: '°C', type: 'number' },
      { name: 'humidity', label: 'Relative Humidity', unit: '%', type: 'number' },
      { name: 'windSpeed', label: 'Wind Speed', unit: 'km/h', type: 'number' },
      { name: 'duration', label: 'Duration of Excess', unit: 'hours', type: 'number' },
    ],
  },
};

interface HazardReport { id: string; hazard: Exclude<HazardType, 'fire'>; state: string; lga: string; reporter: string; submittedAt: string; params: Record<string, string>; }

const DataIngestion = () => {
  const [activeTab, setActiveTab] = useState<TabId>('hazard_reports');
  const [selectedHazard, setSelectedHazard] = useState<Exclude<HazardType, 'fire'>>('flood');
  const [hazardReports, setHazardReports] = useState<HazardReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFP, setShowAddFP] = useState(false);
  const [localFireIncidents, setLocalFireIncidents] = useState<FireIncident[]>(fireIncidents);

  const filteredFPs = focalPersons.filter(fp => {
    if (!searchQuery) return true;
    return fp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fp.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fp.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fp.phoneNumber.includes(searchQuery);
  });

  const handleAddFocalPerson = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowAddFP(false);
    toast.success('Focal person added successfully', { description: 'Profile created and linked to GitMatrix network.' });
  };

  const handleBulkUpload = () => {
    toast.success('Bulk upload initiated', { description: 'Processing CSV file. You will be notified when complete.' });
  };

  const handleReportFire = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const newIncident: FireIncident = {
      id: `FIR${String(localFireIncidents.length + 1).padStart(3, '0')}`,
      location: String(fd.get('location') || '').trim().slice(0, 120),
      state: String(fd.get('state') || '').trim().slice(0, 60),
      lga: String(fd.get('lga') || '').trim().slice(0, 60),
      zoneType: (fd.get('zoneType') as FireZoneType) || 'urban_market',
      status: (fd.get('status') as FireIncident['status']) || 'Active',
      reportedAt: new Date().toISOString(),
      reporterName: String(fd.get('reporter') || '').trim().slice(0, 80),
      notes: String(fd.get('notes') || '').trim().slice(0, 500),
    };
    if (!newIncident.location || !newIncident.state || !newIncident.lga || !newIncident.reporterName) {
      toast.error('Please fill all required fields');
      return;
    }
    fireIncidents.unshift(newIncident);
    setLocalFireIncidents([newIncident, ...localFireIncidents]);
    form.reset();
    toast.success('Fire incident reported', { description: `${newIncident.id} forwarded to FFS dispatch.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="p-6 space-y-6 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-md hover:bg-secondary transition-colors">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" /> Data Ingestion
              </h1>
              <p className="text-xs text-muted-foreground">Manage GitMatrix network & community focal persons</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBulkUpload}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-xs font-medium hover:bg-secondary/80 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" /> Bulk CSV Upload
            </button>
            <button
              onClick={() => setShowAddFP(!showAddFP)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Focal Person
            </button>
          </div>
        </div>

        <DatasetImportPanel />

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-secondary rounded-md p-1 w-fit flex-wrap">
          <button
            onClick={() => setActiveTab('hazard_reports')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-medium transition-colors ${activeTab === 'hazard_reports' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <ClipboardList className="h-3.5 w-3.5" /> Hazard Reports
          </button>
          <button
            onClick={() => setActiveTab('fire_incident')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-medium transition-colors ${activeTab === 'fire_incident' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Flame className="h-3.5 w-3.5" /> Report Fire Incident
          </button>
          <button
            onClick={() => setActiveTab('focal_persons')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-medium transition-colors ${activeTab === 'focal_persons' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Users className="h-3.5 w-3.5" /> Focal Persons
          </button>
          <button
            onClick={() => setActiveTab('gitmatrix')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-medium transition-colors ${activeTab === 'gitmatrix' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Network className="h-3.5 w-3.5" /> GitMatrix Network
          </button>
        </div>

        {/* Hazard-specific Reports */}
        {activeTab === 'hazard_reports' && (
          <div className="space-y-4">
            <div className="data-grid">
              <h3 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" /> Hazard Parameter Reporting
              </h3>
              <p className="text-[11px] text-muted-foreground mb-4">
                Submit hazard-specific observations. Each hazard exposes the exact parameters consumed by the centralized dashboard & lead agency (NEMA · NIHSA · NiMet · NCDC · FFS).
              </p>

              {/* Hazard selector */}
              <div className="flex flex-wrap gap-2 mb-5">
                {(Object.keys(hazardParamSchema) as Array<Exclude<HazardType, 'fire'>>).map((h) => {
                  const cfg = hazardParamSchema[h];
                  const Icon = cfg.icon;
                  const active = selectedHazard === h;
                  return (
                    <button
                      key={h}
                      onClick={() => setSelectedHazard(h)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium border transition-colors ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-muted-foreground border-border hover:text-foreground'}`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${active ? '' : cfg.color}`} /> {cfg.label}
                    </button>
                  );
                })}
              </div>

              <form
                key={selectedHazard}
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const fd = new FormData(form);
                  const state = String(fd.get('state') || '').trim();
                  const lga = String(fd.get('lga') || '').trim();
                  const reporter = String(fd.get('reporter') || '').trim();
                  if (!state || !lga || !reporter) { toast.error('State, LGA & Reporter are required'); return; }
                  const params: Record<string, string> = {};
                  hazardParamSchema[selectedHazard].fields.forEach(f => {
                    const v = String(fd.get(f.name) || '').trim();
                    if (v) params[f.label + (f.unit ? ` (${f.unit})` : '')] = v;
                  });
                  const report: HazardReport = {
                    id: `RPT${String(hazardReports.length + 1).padStart(3, '0')}`,
                    hazard: selectedHazard, state, lga, reporter,
                    submittedAt: new Date().toISOString(), params,
                  };
                  setHazardReports([report, ...hazardReports]);
                  form.reset();
                  toast.success(`${hazardParamSchema[selectedHazard].label} report submitted`, { description: `${report.id} forwarded to centralized dashboard.` });
                }}
                className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3"
              >
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">State *</label>
                  <input name="state" required maxLength={60} className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground" placeholder="e.g. Kogi" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">LGA *</label>
                  <input name="lga" required maxLength={60} className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground" placeholder="e.g. Lokoja" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Reporter *</label>
                  <input name="reporter" required maxLength={80} className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground" placeholder="Your name / agency" />
                </div>

                {hazardParamSchema[selectedHazard].fields.map((f) => (
                  <div key={f.name}>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {f.label}{f.unit && <span className="text-muted-foreground/70 normal-case ml-1">({f.unit})</span>}
                    </label>
                    {f.type === 'select' ? (
                      <select name={f.name} className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground">
                        <option value="">Select...</option>
                        {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        name={f.name}
                        type={f.type === 'number' ? 'number' : 'text'}
                        step="any"
                        maxLength={120}
                        placeholder={f.placeholder}
                        className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground"
                      />
                    )}
                  </div>
                ))}

                <div className="md:col-span-3 flex justify-end mt-2">
                  <button type="submit" className="px-5 py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5" /> Submit {hazardParamSchema[selectedHazard].label} Report
                  </button>
                </div>
              </form>
            </div>

            <div className="data-grid overflow-x-auto">
              <h4 className="text-xs font-semibold text-foreground mb-3">Recent Hazard Reports ({hazardReports.length})</h4>
              {hazardReports.length === 0 ? (
                <p className="text-[11px] text-muted-foreground py-4 text-center">No reports submitted yet. Submit one above to see it appear here and propagate to the centralized dashboard.</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">ID</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Hazard</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">State / LGA</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Parameters</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Reporter</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hazardReports.map(r => (
                      <tr key={r.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors align-top">
                        <td className="py-2 font-mono text-foreground">{r.id}</td>
                        <td className="py-2"><span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary capitalize">{r.hazard}</span></td>
                        <td className="py-2 text-muted-foreground">{r.state} · {r.lga}</td>
                        <td className="py-2 text-muted-foreground">
                          <div className="flex flex-wrap gap-1 max-w-md">
                            {Object.entries(r.params).map(([k, v]) => (
                              <span key={k} className="px-1.5 py-0.5 rounded bg-secondary text-[10px] text-foreground">{k}: <span className="font-mono">{v}</span></span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2 text-foreground">{r.reporter}</td>
                        <td className="py-2 font-mono text-muted-foreground">{new Date(r.submittedAt).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Fire Incident Reporting */}
        {activeTab === 'fire_incident' && (
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="data-grid border border-agency-ffs/30">
              <h3 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-2">
                <Flame className="h-4 w-4 text-agency-ffs" /> Report Fire Incident → FFS Panel
              </h3>
              <p className="text-[11px] text-muted-foreground mb-4">
                Submissions append directly to the Federal Fire Service operational feed. No severity is captured — risk is assessed via the zone-based engine.
              </p>
              <form onSubmit={handleReportFire} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Location *</label>
                    <input name="location" required maxLength={120} className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground" placeholder="Eg. Balogun Market" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">State *</label>
                    <input name="state" required maxLength={60} className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground" placeholder="Eg. Lagos" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">LGA *</label>
                    <input name="lga" required maxLength={60} className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground" placeholder="Eg. Lagos Island" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Zone Type</label>
                    <select name="zoneType" defaultValue="urban_market" className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground">
                      <option value="urban_market">Urban Market</option>
                      <option value="forest_reserve">Forest Reserve</option>
                      <option value="industrial_site">Industrial Site</option>
                      <option value="critical_infrastructure">Critical Infrastructure</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Status</label>
                    <select name="status" defaultValue="Active" className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground">
                      <option value="Active">Active</option>
                      <option value="Contained">Contained</option>
                      <option value="Extinguished">Extinguished</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Reporter Name *</label>
                    <input name="reporter" required maxLength={80} className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground" placeholder="Your name / unit" />
                  </div>
                </div>
                <div className="space-y-3 flex flex-col">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Notes</label>
                    <textarea name="notes" maxLength={500} rows={6} className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground resize-none" placeholder="Brief description of the incident..." />
                  </div>
                  <button type="submit" className="py-2 rounded-md text-xs font-medium bg-agency-ffs text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">
                    <Flame className="h-3.5 w-3.5" /> Submit to FFS
                  </button>
                </div>
              </form>
            </motion.div>

            <div className="data-grid overflow-x-auto">
              <h4 className="text-xs font-semibold text-foreground mb-3">Recent Submissions ({localFireIncidents.length})</h4>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">ID</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Location</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">State / LGA</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Zone</th>
                    <th className="text-center py-2 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Reporter</th>
                  </tr>
                </thead>
                <tbody>
                  {localFireIncidents.map((i) => (
                    <tr key={i.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-2 font-mono text-foreground">{i.id}</td>
                      <td className="py-2 text-foreground">{i.location}</td>
                      <td className="py-2 text-muted-foreground">{i.state} · {i.lga}</td>
                      <td className="py-2 text-muted-foreground">{i.zoneType.replace('_', ' ')}</td>
                      <td className="py-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          i.status === 'Active' ? 'bg-alert-red/20 text-alert-red'
                          : i.status === 'Contained' ? 'bg-alert-orange/20 text-alert-orange'
                          : 'bg-alert-green/20 text-alert-green'
                        }`}>{i.status}</span>
                      </td>
                      <td className="py-2 text-muted-foreground">{i.reporterName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GitMatrix Overview */}
        {activeTab === 'gitmatrix' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'State Coordinators', value: '37', sub: '36 States + FCT', color: 'text-primary' },
                { label: 'LGA Focal Officers', value: '774', sub: 'All LGAs covered', color: 'text-alert-orange' },
                { label: 'Ward Focal Persons', value: '7,840', sub: 'Community level', color: 'text-alert-green' },
              ].map((tier, i) => (
                <motion.div key={tier.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="data-grid text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{tier.label}</p>
                  <p className={`text-2xl font-bold font-mono ${tier.color}`}>{tier.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{tier.sub}</p>
                </motion.div>
              ))}
            </div>

            <div className="data-grid">
              <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
                <Network className="h-4 w-4 text-primary" /> GitMatrix Data Ingestion Access
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                GitMatrix stakeholders can submit data through SMS (*445#), WhatsApp bot, USSD, or this portal. All submissions feed into the centralized dashboard.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-md border border-border">
                  <p className="text-xs font-medium text-foreground mb-2">Ingestion Channels</p>
                  <div className="space-y-2 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-2"><Phone className="h-3 w-3 text-primary" /> SMS: *445# USSD short code</div>
                    <div className="flex items-center gap-2"><FileSpreadsheet className="h-3 w-3 text-primary" /> USSD: Structured data forms</div>
                    <div className="flex items-center gap-2"><Upload className="h-3 w-3 text-primary" /> WhatsApp: Media & text reports</div>
                    <div className="flex items-center gap-2"><Database className="h-3 w-3 text-primary" /> Web Portal: Full dashboard access</div>
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-md border border-border">
                  <p className="text-xs font-medium text-foreground mb-2">Data Types Accepted</p>
                  <div className="space-y-2 text-[11px] text-muted-foreground">
                    <div>• Situation reports (flood, drought, epidemic, heatwave)</div>
                    <div>• River level observations</div>
                    <div>• Community health assessments</div>
                    <div>• Photo/media evidence</div>
                    <div>• Alert acknowledgment confirmations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Focal Persons */}
        {activeTab === 'focal_persons' && (
          <div className="space-y-4">
            {/* Add Form */}
            {showAddFP && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="data-grid border border-primary/30">
                <h3 className="font-semibold text-sm text-foreground mb-4">Add Community Focal Person</h3>
                <form onSubmit={handleAddFocalPerson} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Full Name</label>
                      <input required className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground" placeholder="Enter full name" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Phone Number</label>
                      <input required className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground" placeholder="+234..." />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">State</label>
                      <input required className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground" placeholder="State" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">LGA</label>
                      <input required className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground" placeholder="Local Government Area" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Ward</label>
                      <input required className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground" placeholder="Ward name" />
                    </div>
                    <div className="flex gap-2 mt-5">
                      <button type="submit" className="flex-1 py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                        Add Person
                      </button>
                      <button type="button" onClick={() => setShowAddFP(false)} className="px-4 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground"
                placeholder="Search by name, ward, state, or phone..."
              />
            </div>

            {/* FP List */}
            <div className="data-grid overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">ID</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Name</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Phone</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Ward</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">LGA</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">State</th>
                    <th className="text-center py-2 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Last Report</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFPs.map(fp => (
                    <tr key={fp.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-2 font-mono text-muted-foreground">{fp.id}</td>
                      <td className="py-2 font-medium text-foreground">{fp.name}</td>
                      <td className="py-2 font-mono text-foreground">{fp.phoneNumber}</td>
                      <td className="py-2 text-foreground">{fp.ward}</td>
                      <td className="py-2 text-foreground">{fp.lga}</td>
                      <td className="py-2 text-foreground">{fp.state}</td>
                      <td className="py-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${fp.status === 'active' ? 'bg-alert-green/20 text-alert-green' : 'bg-muted text-muted-foreground'}`}>
                          {fp.status}
                        </span>
                      </td>
                      <td className="py-2 font-mono text-muted-foreground">{fp.lastReport}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DataIngestion;
