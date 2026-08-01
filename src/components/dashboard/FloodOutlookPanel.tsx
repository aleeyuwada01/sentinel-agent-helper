import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, TrendingUp, BarChart3 } from 'lucide-react';
import NigeriaSVGMap from './NigeriaSVGMap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

export interface FloodOutlookState {
  state: string;
  riskLevel: 'high' | 'moderate' | 'low';
  predictedPeakMonth: string;
  riverBasin: string;
  lat: number;
  lng: number;
  probabilityPercent: number;
  historicalFrequency: number;
  vulnerablePopulation: number;
}

export const annualFloodOutlook: FloodOutlookState[] = [
  { state: 'Kogi', riskLevel: 'high', predictedPeakMonth: 'September', riverBasin: 'Niger-Benue Confluence', lat: 7.80, lng: 6.74, probabilityPercent: 92, historicalFrequency: 8, vulnerablePopulation: 340000 },
  { state: 'Anambra', riskLevel: 'high', predictedPeakMonth: 'October', riverBasin: 'Lower Niger', lat: 6.21, lng: 6.93, probabilityPercent: 88, historicalFrequency: 7, vulnerablePopulation: 280000 },
  { state: 'Benue', riskLevel: 'high', predictedPeakMonth: 'September', riverBasin: 'Benue Basin', lat: 7.73, lng: 8.54, probabilityPercent: 90, historicalFrequency: 9, vulnerablePopulation: 420000 },
  { state: 'Adamawa', riskLevel: 'high', predictedPeakMonth: 'August', riverBasin: 'Upper Benue', lat: 9.33, lng: 12.50, probabilityPercent: 85, historicalFrequency: 6, vulnerablePopulation: 260000 },
  { state: 'Bayelsa', riskLevel: 'high', predictedPeakMonth: 'October', riverBasin: 'Niger Delta', lat: 4.77, lng: 6.07, probabilityPercent: 87, historicalFrequency: 8, vulnerablePopulation: 310000 },
  { state: 'Delta', riskLevel: 'moderate', predictedPeakMonth: 'September', riverBasin: 'Niger Delta', lat: 5.53, lng: 5.76, probabilityPercent: 72, historicalFrequency: 5, vulnerablePopulation: 190000 },
  { state: 'Kwara', riskLevel: 'moderate', predictedPeakMonth: 'September', riverBasin: 'Lower Niger', lat: 8.50, lng: 4.55, probabilityPercent: 68, historicalFrequency: 4, vulnerablePopulation: 150000 },
  { state: 'Niger', riskLevel: 'moderate', predictedPeakMonth: 'August', riverBasin: 'Niger Basin', lat: 9.93, lng: 5.60, probabilityPercent: 65, historicalFrequency: 5, vulnerablePopulation: 180000 },
  { state: 'Taraba', riskLevel: 'moderate', predictedPeakMonth: 'September', riverBasin: 'Benue Basin', lat: 7.99, lng: 10.77, probabilityPercent: 70, historicalFrequency: 4, vulnerablePopulation: 130000 },
  { state: 'Edo', riskLevel: 'low', predictedPeakMonth: 'September', riverBasin: 'Benin-Owena', lat: 6.34, lng: 5.63, probabilityPercent: 40, historicalFrequency: 2, vulnerablePopulation: 80000 },
  { state: 'Rivers', riskLevel: 'low', predictedPeakMonth: 'October', riverBasin: 'Niger Delta', lat: 4.85, lng: 6.92, probabilityPercent: 45, historicalFrequency: 3, vulnerablePopulation: 95000 },
  { state: 'Kebbi', riskLevel: 'moderate', predictedPeakMonth: 'August', riverBasin: 'Upper Niger', lat: 12.45, lng: 4.20, probabilityPercent: 63, historicalFrequency: 4, vulnerablePopulation: 140000 },
];

// Historical flood data (year-over-year)
const historicalFloodData = [
  { year: '2018', events: 12, affected: 1900000, deaths: 199, displaced: 540000 },
  { year: '2019', events: 8, affected: 620000, deaths: 45, displaced: 180000 },
  { year: '2020', events: 14, affected: 2800000, deaths: 68, displaced: 790000 },
  { year: '2021', events: 10, affected: 1200000, deaths: 155, displaced: 420000 },
  { year: '2022', events: 27, affected: 4200000, deaths: 612, displaced: 1400000 },
  { year: '2023', events: 18, affected: 2100000, deaths: 187, displaced: 680000 },
  { year: '2024', events: 15, affected: 1700000, deaths: 142, displaced: 510000 },
];

const stateYoYData = [
  { state: 'Kogi', '2020': 85, '2021': 78, '2022': 95, '2023': 88, '2024': 92 },
  { state: 'Benue', '2020': 80, '2021': 72, '2022': 93, '2023': 85, '2024': 90 },
  { state: 'Anambra', '2020': 70, '2021': 65, '2022': 91, '2023': 82, '2024': 88 },
  { state: 'Adamawa', '2020': 60, '2021': 68, '2022': 88, '2023': 78, '2024': 85 },
  { state: 'Bayelsa', '2020': 75, '2021': 70, '2022': 90, '2023': 80, '2024': 87 },
];

const monthlyTrendData = [
  { month: 'Jun', '2022': 12, '2023': 8, '2024': 6 },
  { month: 'Jul', '2022': 28, '2023': 18, '2024': 14 },
  { month: 'Aug', '2022': 45, '2023': 32, '2024': 28 },
  { month: 'Sep', '2022': 62, '2023': 48, '2024': 42 },
  { month: 'Oct', '2022': 38, '2023': 28, '2024': 22 },
  { month: 'Nov', '2022': 15, '2023': 10, '2024': 8 },
];

const riskColors = {
  high: { fill: 'hsl(0, 72%, 55%)', stroke: 'hsl(0, 72%, 45%)', class: 'text-alert-red bg-alert-red/20 border-alert-red/30' },
  moderate: { fill: 'hsl(25, 95%, 58%)', stroke: 'hsl(25, 95%, 48%)', class: 'text-alert-orange bg-alert-orange/20 border-alert-orange/30' },
  low: { fill: 'hsl(142, 71%, 45%)', stroke: 'hsl(142, 71%, 35%)', class: 'text-alert-green bg-alert-green/20 border-alert-green/30' },
};

const FloodOutlookPanel = () => {
  const [chartTab, setChartTab] = useState<'events' | 'impact' | 'state' | 'monthly'>('events');
  const highRisk = annualFloodOutlook.filter(s => s.riskLevel === 'high');
  const modRisk = annualFloodOutlook.filter(s => s.riskLevel === 'moderate');
  const lowRisk = annualFloodOutlook.filter(s => s.riskLevel === 'low');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'High Risk States', count: highRisk.length, color: 'text-alert-red', bg: 'bg-alert-red/10 border-alert-red/20' },
          { label: 'Moderate Risk', count: modRisk.length, color: 'text-alert-orange', bg: 'bg-alert-orange/10 border-alert-orange/20' },
          { label: 'Low Risk', count: lowRisk.length, color: 'text-alert-green', bg: 'bg-alert-green/10 border-alert-green/20' },
        ].map(c => (
          <div key={c.label} className={`p-3 rounded-lg border ${c.bg}`}>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.label}</p>
            <p className={`text-2xl font-bold font-mono ${c.color}`}>{c.count}</p>
          </div>
        ))}
      </div>

      {/* Flood Outlook Map */}
      <div className="data-grid">
        <div className="flex items-center gap-2 mb-3">
          <Droplets className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">2024 Annual Flood Outlook Map</h3>
          <span className="ml-auto text-[10px] font-mono text-muted-foreground">NIHSA Forecast</span>
        </div>
        <div className="h-[380px] rounded-lg overflow-hidden border border-border">
          <NigeriaSVGMap stateData={annualFloodOutlook} />
        </div>
        <div className="flex items-center gap-4 mt-3">
          {[
            { label: 'High Risk', color: 'bg-alert-red' },
            { label: 'Moderate', color: 'bg-alert-orange' },
            { label: 'Low Risk', color: 'bg-alert-green' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <div className={`h-2.5 w-2.5 rounded-full ${l.color}`} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Historical Flood Data Charts */}
      <div className="data-grid">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Historical Flood Data — Year-over-Year Trends</h3>
        </div>

        {/* Chart Tabs */}
        <div className="flex gap-1 mb-4 p-1 bg-secondary rounded-lg">
          {([
            { key: 'events', label: 'Flood Events' },
            { key: 'impact', label: 'Impact & Casualties' },
            { key: 'state', label: 'State Risk Trends' },
            { key: 'monthly', label: 'Monthly Patterns' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setChartTab(tab.key)}
              className={`flex-1 py-1.5 px-2 text-[10px] font-medium rounded-md transition-colors ${
                chartTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="h-[280px]">
          {chartTab === 'events' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalFloodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 25%)" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(215 30% 15%)', border: '1px solid hsl(215 20% 25%)', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: 'hsl(215 15% 75%)' }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="events" name="Flood Events" fill="hsl(210 100% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartTab === 'impact' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalFloodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 25%)" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(215 30% 15%)', border: '1px solid hsl(215 20% 25%)', borderRadius: 8, fontSize: 11 }}
                  formatter={(value: number, name: string) => [value.toLocaleString(), name]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="affected" name="People Affected" fill="hsl(210 100% 50%)" fillOpacity={0.2} stroke="hsl(210 100% 50%)" />
                <Area type="monotone" dataKey="displaced" name="Displaced" fill="hsl(25 95% 58%)" fillOpacity={0.2} stroke="hsl(25 95% 58%)" />
                <Area type="monotone" dataKey="deaths" name="Deaths" fill="hsl(0 72% 55%)" fillOpacity={0.3} stroke="hsl(0 72% 55%)" />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {chartTab === 'state' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stateYoYData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 25%)" />
                <XAxis dataKey="state" tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} label={{ value: 'Risk %', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: 'hsl(215 15% 55%)' } }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(215 30% 15%)', border: '1px solid hsl(215 20% 25%)', borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="2020" stroke="hsl(215 15% 55%)" strokeWidth={1.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="2021" stroke="hsl(25 95% 58%)" strokeWidth={1.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="2022" stroke="hsl(0 72% 55%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="2023" stroke="hsl(280 70% 55%)" strokeWidth={1.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="2024" stroke="hsl(210 100% 50%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}

          {chartTab === 'monthly' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 25%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(215 30% 15%)', border: '1px solid hsl(215 20% 25%)', borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="2022" name="2022" fill="hsl(0 72% 55%)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="2023" name="2023" fill="hsl(25 95% 58%)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="2024" name="2024" fill="hsl(210 100% 50%)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* State Detail Table */}
      <div className="data-grid">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">State-by-State Flood Outlook</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">State</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Risk</th>
                <th className="text-left py-2 text-muted-foreground font-medium">River Basin</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Peak Month</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Probability</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Hist. Freq</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Vulnerable Pop.</th>
              </tr>
            </thead>
            <tbody>
              {annualFloodOutlook.map(s => (
                <tr key={s.state} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="py-2 font-mono font-medium text-foreground">{s.state}</td>
                  <td className="py-2">
                    <span className={`px-1.5 py-0.5 rounded border text-[10px] font-medium ${riskColors[s.riskLevel].class}`}>
                      {s.riskLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 text-muted-foreground">{s.riverBasin}</td>
                  <td className="py-2 text-right font-mono text-foreground">{s.predictedPeakMonth}</td>
                  <td className="py-2 text-right font-mono">
                    <span className={s.probabilityPercent > 80 ? 'text-alert-red' : s.probabilityPercent > 60 ? 'text-alert-orange' : 'text-foreground'}>
                      {s.probabilityPercent}%
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono text-foreground">{s.historicalFrequency}/10 yrs</td>
                  <td className="py-2 text-right font-mono text-foreground">{s.vulnerablePopulation.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default FloodOutlookPanel;
