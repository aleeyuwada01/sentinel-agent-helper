import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Bell, Plus, AlertTriangle, CheckCircle2, Clock, Search, MessageSquare, Phone, Smartphone, Send, Globe } from 'lucide-react';
import TopBar from '@/components/dashboard/TopBar';
import { alertHistory, Alert, AlertSeverity, DispatchChannel, AlertLanguage, languageLabels, channelLabels, alertTemplates } from '@/data/alertData';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const severityColors: Record<AlertSeverity, string> = {
  critical: 'bg-alert-red/20 text-alert-red border-alert-red/30',
  high: 'bg-alert-orange/20 text-alert-orange border-alert-orange/30',
  medium: 'bg-alert-yellow/20 text-alert-yellow border-alert-yellow/30',
  low: 'bg-alert-green/20 text-alert-green border-alert-green/30',
};

const statusIcons = {
  active: <AlertTriangle className="h-3.5 w-3.5 text-alert-red" />,
  acknowledged: <Clock className="h-3.5 w-3.5 text-alert-yellow" />,
  resolved: <CheckCircle2 className="h-3.5 w-3.5 text-alert-green" />,
};

const channelIcons: Record<DispatchChannel, React.ReactNode> = {
  sms: <Phone className="h-3.5 w-3.5" />,
  ussd: <Smartphone className="h-3.5 w-3.5" />,
  whatsapp: <MessageSquare className="h-3.5 w-3.5" />,
};

const Alerts = () => {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<DispatchChannel[]>(['sms']);
  const [selectedLanguages, setSelectedLanguages] = useState<AlertLanguage[]>(['en']);
  const [selectedHazard, setSelectedHazard] = useState<string>('flood');
  const [alertState, setAlertState] = useState('');

  const filtered = alertHistory.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase()) && !a.state.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: alertHistory.length,
    active: alertHistory.filter(a => a.status === 'active').length,
    acknowledged: alertHistory.filter(a => a.status === 'acknowledged').length,
    resolved: alertHistory.filter(a => a.status === 'resolved').length,
  };

  const toggleChannel = (ch: DispatchChannel) => {
    setSelectedChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]);
  };

  const toggleLanguage = (lang: AlertLanguage) => {
    setSelectedLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };

  const previewMessage = selectedLanguages.length > 0 && selectedHazard
    ? alertTemplates[selectedLanguages[0]]?.[selectedHazard]?.replace('{state}', alertState || '[State]') || ''
    : '';

  const handleCreateAlert = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const channelStr = selectedChannels.map(c => channelLabels[c]).join(', ');
    const langStr = selectedLanguages.map(l => languageLabels[l]).join(', ');
    setShowCreateForm(false);
    toast.success('Alert dispatched successfully', {
      description: `Sent via ${channelStr} in ${langStr} to community focal persons.`,
    });
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
                <Bell className="h-5 w-5 text-primary" /> Alert Management
              </h1>
              <p className="text-xs text-muted-foreground">Dispatch alerts via SMS, USSD, WhatsApp in multiple languages</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Create & Dispatch
          </button>
        </div>

        {/* Alert Creation Form with Dispatch */}
        {showCreateForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="data-grid border border-primary/30">
            <h3 className="font-semibold text-sm text-foreground mb-4">New Alert — Multi-Channel Dispatch</h3>
            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Alert Title</label>
                    <input required className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground" placeholder="Brief alert title" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Hazard Type</label>
                    <select required value={selectedHazard} onChange={e => setSelectedHazard(e.target.value)} className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground">
                      <option value="flood">Flood</option>
                      <option value="drought">Drought</option>
                      <option value="epidemic">Epidemic</option>
                      <option value="heatwave">Heatwave</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Severity</label>
                    <select required className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground">
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Affected State</label>
                    <input required value={alertState} onChange={e => setAlertState(e.target.value)} className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground" placeholder="State name" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Dispatch Channels</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(['sms', 'ussd', 'whatsapp'] as DispatchChannel[]).map(ch => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => toggleChannel(ch)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium border transition-colors ${
                            selectedChannels.includes(ch)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                          }`}
                        >
                          {channelIcons[ch]} {channelLabels[ch]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      <Globe className="inline h-3 w-3 mr-1" />Languages
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(['en', 'ha', 'ig', 'yo'] as AlertLanguage[]).map(lang => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => toggleLanguage(lang)}
                          className={`px-3 py-1.5 rounded-md text-[11px] font-medium border transition-colors ${
                            selectedLanguages.includes(lang)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                          }`}
                        >
                          {languageLabels[lang]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Description</label>
                    <textarea required className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground min-h-[80px]" placeholder="Detailed alert description..." />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Message Preview</label>
                    <div className="mt-1 p-3 bg-muted border border-border rounded-md min-h-[120px]">
                      {selectedLanguages.map(lang => (
                        <div key={lang} className="mb-3 last:mb-0">
                          <span className="text-[10px] font-bold text-primary uppercase">{languageLabels[lang]}</span>
                          <p className="text-[11px] text-foreground mt-0.5 leading-relaxed">
                            {alertTemplates[lang]?.[selectedHazard]?.replace('{state}', alertState || '[State]') || 'Select hazard type'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 border border-border rounded-md">
                    <p className="text-[10px] text-muted-foreground mb-1">Estimated Recipients</p>
                    <p className="text-lg font-bold font-mono text-foreground">
                      {selectedChannels.length * selectedLanguages.length * 1240}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      via {selectedChannels.length} channel(s) × {selectedLanguages.length} language(s)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium bg-alert-red text-primary-foreground hover:bg-alert-red/80 transition-colors">
                      <Send className="h-3.5 w-3.5" /> Dispatch Alert
                    </button>
                    <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        )}

        {/* Filter Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-1 bg-secondary rounded-md p-1">
            {(['all', 'active', 'acknowledged', 'resolved'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded text-[11px] font-medium transition-colors ${filter === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground"
              placeholder="Search alerts..."
            />
          </div>
        </div>

        {/* Alert List */}
        <div className="space-y-3">
          {filtered.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="data-grid"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex items-center gap-2 shrink-0">
                  {statusIcons[alert.status]}
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-medium ${severityColors[alert.severity]}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-muted-foreground">{alert.id}</span>
                    <Badge variant="outline" className="text-[10px]">{alert.hazardType}</Badge>
                  </div>
                  <p className="text-xs font-medium text-foreground">{alert.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{alert.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground font-mono flex-wrap">
                    <span>{alert.agency}</span>
                    <span>•</span>
                    <span>{alert.state}, {alert.lga}</span>
                    <span>•</span>
                    <span>{new Date(alert.createdAt).toLocaleString()}</span>
                    {alert.acknowledgedBy && (
                      <>
                        <span>•</span>
                        <span className="text-alert-green">Ack: {alert.acknowledgedBy}</span>
                      </>
                    )}
                  </div>
                  {/* Dispatch summary */}
                  {alert.dispatches.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {alert.dispatches.map((d, di) => (
                        <div key={di} className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted border border-border text-[10px]">
                          {channelIcons[d.channel]}
                          <span className="font-medium text-foreground">{channelLabels[d.channel]}</span>
                          <span className="text-muted-foreground">({languageLabels[d.language]})</span>
                          <span className="text-alert-green font-mono">{d.deliveredCount}/{d.recipientCount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No alerts match your filters.</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Alerts;
