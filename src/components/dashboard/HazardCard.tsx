import { motion } from 'framer-motion';
import { Droplets, Sun, Bug, CloudRain, Flame, TrendingUp, MapPin, Users } from 'lucide-react';
import type { HazardStatus, AlertLevel } from '@/data/mockData';

const hazardIcons = {
  flood: Droplets,
  drought: Sun,
  epidemic: Bug,
  heatwave: CloudRain,
  fire: Flame,
};

const alertLabels: Record<AlertLevel, string> = {
  green: 'NORMAL',
  yellow: 'ADVISORY',
  orange: 'WARNING',
  red: 'CRITICAL',
};

const HazardCard = ({ hazard }: { hazard: HazardStatus }) => {
  const Icon = hazardIcons[hazard.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`hazard-card-${hazard.type} bg-card rounded-lg p-4 relative overflow-hidden`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 text-hazard-${hazard.type}`} />
          <h3 className="font-semibold text-foreground">{hazard.label}</h3>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-alert-${hazard.alertLevel}/20 text-alert-${hazard.alertLevel}`}
        >
          {alertLabels[hazard.alertLevel]}
        </span>
      </div>

      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        {hazard.description}
      </p>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <div>
            <p className="text-sm font-bold font-mono text-foreground">{hazard.affectedStates}</p>
            <p className="text-[10px] text-muted-foreground">States</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3 w-3 text-muted-foreground" />
          <div>
            <p className="text-sm font-bold font-mono text-foreground">{hazard.affectedLGAs}</p>
            <p className="text-[10px] text-muted-foreground">LGAs</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-3 w-3 text-muted-foreground" />
          <div>
            <p className="text-sm font-bold font-mono text-foreground">{hazard.activeFocalPersons.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">FPs Active</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HazardCard;
