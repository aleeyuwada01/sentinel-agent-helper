import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Camera, FileText, Filter, Plus, MapPin, Users } from 'lucide-react';
import TopBar from '@/components/dashboard/TopBar';
import { feedbackReports, FeedbackReport } from '@/data/alertData';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const severityBadge: Record<string, string> = {
  critical: 'bg-alert-red/20 text-alert-red',
  severe: 'bg-alert-orange/20 text-alert-orange',
  moderate: 'bg-alert-yellow/20 text-alert-yellow',
  low: 'bg-alert-green/20 text-alert-green',
};

const typeIcons: Record<string, React.ReactNode> = {
  situation_report: <FileText className="h-4 w-4 text-alert-orange" />,
  feedback: <MessageSquare className="h-4 w-4 text-primary" />,
  media: <Camera className="h-4 w-4 text-agency-ncdc" />,
};

const Feedback = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const filtered = feedbackReports.filter(r => filterType === 'all' || r.type === filterType);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowSubmitForm(false);
    toast.success('Report submitted successfully', {
      description: 'Your situation report has been forwarded to the coordination center.',
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
                <MessageSquare className="h-5 w-5 text-primary" /> Community Feedback
              </h1>
              <p className="text-xs text-muted-foreground">Reports from community focal persons across 7,840 wards</p>
            </div>
          </div>
          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Submit Report
          </button>
        </div>

        {/* Submission Form */}
        {showSubmitForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="data-grid border border-primary/30">
            <h3 className="font-semibold text-sm text-foreground mb-4">New Community Report</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Report Type</label>
                  <select required className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground">
                    <option value="situation_report">Situation Report</option>
                    <option value="feedback">Feedback / Suggestion</option>
                    <option value="media">Photo / Media Upload</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Hazard Type</label>
                  <select required className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground">
                    <option value="flood">Flood</option>
                    <option value="drought">Drought</option>
                    <option value="epidemic">Epidemic</option>
                    <option value="heatwave">Heatwave</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Severity</label>
                  <select required className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground">
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Households Affected</label>
                  <input type="number" required className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground" placeholder="Estimated number" />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Title</label>
                  <input required className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground" placeholder="Brief report title" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Description</label>
                  <textarea required className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground min-h-[80px]" placeholder="Detailed ground situation..." />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Photo Upload (optional)</label>
                  <input type="file" accept="image/*" className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground file:bg-muted file:border-0 file:text-xs file:text-foreground file:mr-2" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    Submit Report
                  </button>
                  <button type="button" onClick={() => setShowSubmitForm(false)} className="px-4 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-1 bg-secondary rounded-md p-1 w-fit">
          {[
            { key: 'all', label: 'All Reports' },
            { key: 'situation_report', label: 'Situation Reports' },
            { key: 'feedback', label: 'Feedback' },
            { key: 'media', label: 'Media' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setFilterType(t.key)}
              className={`px-3 py-1.5 rounded text-[11px] font-medium transition-colors ${filterType === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Reports List */}
        <div className="space-y-3">
          {filtered.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="data-grid"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex items-center gap-2 shrink-0">
                  {typeIcons[report.type]}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${severityBadge[report.severity]}`}>
                    {report.severity.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-mono text-muted-foreground">{report.id}</span>
                    <Badge variant="outline" className="text-[10px]">{report.hazardType}</Badge>
                    <Badge variant={report.status === 'actioned' ? 'default' : report.status === 'reviewed' ? 'secondary' : 'outline'} className="text-[10px]">
                      {report.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-foreground">{report.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{report.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground font-mono flex-wrap">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{report.focalPersonName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{report.ward}, {report.lga}, {report.state}</span>
                    <span>•</span>
                    <span>{report.householdsAffected} households</span>
                    <span>•</span>
                    <span>{new Date(report.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Feedback;
