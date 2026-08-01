import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Waves, Thermometer, BarChart3 } from 'lucide-react';
import TopBar from '@/components/dashboard/TopBar';
import { trendData } from '@/data/alertData';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, AreaChart, Area } from 'recharts';

const riverConfig = {
  lokoja: { label: 'Lokoja', color: 'hsl(210, 100%, 40%)' },
  makurdi: { label: 'Makurdi', color: 'hsl(142, 71%, 35%)' },
  jebba: { label: 'Jebba', color: 'hsl(36, 100%, 50%)' },
  onitsha: { label: 'Onitsha', color: 'hsl(280, 60%, 50%)' },
};

const tempConfig = {
  sokoto: { label: 'Sokoto', color: 'hsl(0, 72%, 51%)' },
  maiduguri: { label: 'Maiduguri', color: 'hsl(25, 95%, 53%)' },
  kano: { label: 'Kano', color: 'hsl(36, 100%, 50%)' },
  abuja: { label: 'Abuja', color: 'hsl(210, 100%, 40%)' },
  lagos: { label: 'Lagos', color: 'hsl(142, 71%, 35%)' },
};

const hazardConfig = {
  flood: { label: 'Flood', color: 'hsl(210, 100%, 40%)' },
  drought: { label: 'Drought', color: 'hsl(36, 100%, 50%)' },
  epidemic: { label: 'Epidemic', color: 'hsl(142, 71%, 35%)' },
  heatwave: { label: 'Heatwave', color: 'hsl(0, 72%, 51%)' },
};

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="p-6 space-y-6 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-md hover:bg-secondary transition-colors">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Analytics & Trends
            </h1>
            <p className="text-xs text-muted-foreground">Historical data trends and hazard event analysis</p>
          </div>
        </div>

        {/* River Level Trends */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="data-grid">
          <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
            <Waves className="h-4 w-4 text-agency-nihsa" /> River Level Trends (2024)
          </h3>
          <ChartContainer config={riverConfig} className="h-[300px] w-full">
            <LineChart data={trendData.riverLevels}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 88%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(215, 15%, 50%)' }} axisLine={{ stroke: 'hsl(210, 20%, 88%)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 15%, 50%)' }} axisLine={{ stroke: 'hsl(210, 20%, 88%)' }} label={{ value: 'Level (m)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'hsl(215, 15%, 50%)' } }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="lokoja" stroke="var(--color-lokoja)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="makurdi" stroke="var(--color-makurdi)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="jebba" stroke="var(--color-jebba)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="onitsha" stroke="var(--color-onitsha)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </motion.div>

        {/* Temperature Trends */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="data-grid">
          <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-agency-nimet" /> Temperature Trends (2024)
          </h3>
          <ChartContainer config={tempConfig} className="h-[300px] w-full">
            <AreaChart data={trendData.temperatures}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 88%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(215, 15%, 50%)' }} axisLine={{ stroke: 'hsl(210, 20%, 88%)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 15%, 50%)' }} axisLine={{ stroke: 'hsl(210, 20%, 88%)' }} label={{ value: '°C', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'hsl(215, 15%, 50%)' } }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="sokoto" stroke="var(--color-sokoto)" fill="var(--color-sokoto)" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="maiduguri" stroke="var(--color-maiduguri)" fill="var(--color-maiduguri)" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="kano" stroke="var(--color-kano)" fill="var(--color-kano)" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="abuja" stroke="var(--color-abuja)" fill="var(--color-abuja)" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="lagos" stroke="var(--color-lagos)" fill="var(--color-lagos)" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </motion.div>

        {/* Hazard Events by Month */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="data-grid">
          <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-alert-orange" /> Hazard Events by Month (2024)
          </h3>
          <ChartContainer config={hazardConfig} className="h-[300px] w-full">
            <BarChart data={trendData.hazardEvents}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(215, 15%, 50%)' }} axisLine={{ stroke: 'hsl(210, 20%, 88%)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 15%, 50%)' }} axisLine={{ stroke: 'hsl(210, 20%, 88%)' }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="flood" fill="var(--color-flood)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="drought" fill="var(--color-drought)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="epidemic" fill="var(--color-epidemic)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="heatwave" fill="var(--color-heatwave)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </motion.div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Events YTD', value: trendData.hazardEvents.reduce((s, e) => s + e.flood + e.drought + e.epidemic + e.heatwave, 0), color: 'text-primary' },
            { label: 'Peak Flood Month', value: 'August (28)', color: 'text-hazard-flood' },
            { label: 'Max Temperature', value: '44.2°C', color: 'text-hazard-heatwave' },
            { label: 'Highest River Level', value: '9.1m', color: 'text-agency-nihsa' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }} className="data-grid text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Analytics;
