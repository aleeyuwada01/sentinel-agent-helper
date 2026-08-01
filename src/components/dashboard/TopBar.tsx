import { Bell, Radio, Shield, Signal, TrendingUp, MessageSquare, Database, ShieldCheck, LogOut, User, Globe2, Landmark } from 'lucide-react';
import { roleLabels, scopeSummary } from '@/data/accessControl';
import { motion } from 'framer-motion';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { useCountry } from '@/hooks/useCountry';
import CountrySwitcher from './CountrySwitcher';

const TopBar = () => {
  const { user, scope, logout, isAuthenticated } = useAuth();
  const { country } = useCountry();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  return (
    <header className="border-b border-border bg-primary/10 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                WA<span className="text-primary">MHEWS</span>{' '}
                <span className="text-[11px] font-mono text-muted-foreground">
                  / {country.systemAcronym} {country.shortName}
                </span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                West Africa Multi-Hazard Early Warning System
              </p>
            </div>
          </Link>
          <CountrySwitcher />
          <Link
            to="/regional"
            className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <Globe2 className="h-3.5 w-3.5 text-primary" /> West Africa Command
          </Link>
          <div className="h-8 w-px bg-border mx-2" />
          <div className="hidden xl:flex items-center gap-2 text-xs text-muted-foreground">
            <Signal className="h-3.5 w-3.5 text-alert-green" />
            <span className="font-mono">{country.leadAgency} Lead Agency</span>
          </div>
        </div>


        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/analytics" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-primary-foreground hover:bg-primary/30 transition-colors">
              <TrendingUp className="h-3.5 w-3.5" /> Analytics
            </Link>
            <Link to="/feedback" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-primary-foreground hover:bg-primary/30 transition-colors">
              <MessageSquare className="h-3.5 w-3.5" /> Feedback
            </Link>
            <Link to="/countries" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-primary-foreground hover:bg-primary/30 transition-colors">
              <Landmark className="h-3.5 w-3.5" /> Countries
            </Link>
            <Link to="/data-ingestion" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-primary-foreground hover:bg-primary/30 transition-colors">
              <Database className="h-3.5 w-3.5" /> Data
            </Link>
            <Link to="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-primary-foreground hover:bg-primary/30 transition-colors">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </Link>
          </nav>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/20 border border-primary/30">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="h-2 w-2 rounded-full bg-alert-green"
            />
            <span className="text-xs font-mono text-foreground">SYSTEM ONLINE</span>
          </div>

          <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/20 border border-primary/30">
            <Radio className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-mono text-foreground">
              {country.focalPersons.active.toLocaleString()} / {country.focalPersons.total.toLocaleString()} FPs Active
            </span>
          </div>


          <Link to="/alerts" className="relative p-2 rounded-md hover:bg-primary/20 transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-alert-red text-[10px] font-bold flex items-center justify-center text-primary-foreground">
              4
            </span>
          </Link>

          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
                <User className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] text-foreground font-mono">{user?.name}</span>
                <span className="text-[10px] text-muted-foreground border-l border-border pl-1.5">
                  {roleLabels[scope.role]} · {scopeSummary(scope)}
                </span>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-md hover:bg-destructive/20 transition-colors" title="Logout">
                <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          )}

          <div className="hidden sm:block text-right">
            <p className="text-xs font-mono text-muted-foreground">
              {new Date().toLocaleDateString('en-NG', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
            <p className="text-xs font-mono text-primary">
              {new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })} WAT
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
