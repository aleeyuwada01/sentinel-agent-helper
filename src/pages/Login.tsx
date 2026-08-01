import { useState } from 'react';
import { demoAccounts, roleLabels } from '@/data/accessControl';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Shield, LogIn, Eye, EyeOff, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [agency, setAgency] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      const ok = await signup(email, password, fullName, agency);
      if (ok) {
        toast.success('Account created', { description: 'Welcome to WAMHEWS' });
        navigate({ to: '/' });
      } else {
        toast.error('Signup failed', { description: 'Please check your details' });
      }
    } else {
      const ok = await login(email, password);
      if (ok) {
        toast.success('Login successful', { description: 'Welcome to WAMHEWS' });
        navigate({ to: '/' });
      } else {
        toast.error('Login failed', { description: 'Invalid credentials' });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            WA<span className="text-primary">MHEWS</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            West Africa Multi-Hazard Early Warning System
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-1 p-1 bg-secondary rounded-lg mb-4">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
              mode === 'login' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
              mode === 'signup' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <div className="data-grid border-primary/20">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 bg-secondary border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Agency</label>
                  <select
                    value={agency}
                    onChange={e => setAgency(e.target.value)}
                    required
                    className="w-full mt-1 px-3 py-2.5 bg-secondary border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select Agency</option>
                    <option value="NIHSA">NIHSA</option>
                    <option value="NIMET">NiMet</option>
                    <option value="NEMA">NEMA</option>
                    <option value="NCDC">NCDC</option>
                    <option value="NOA">NOA</option>
                    <option value="SEMA">SEMA</option>
                    <option value="LEMA">LEMA</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 bg-secondary border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="you@agency.gov.ng"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 bg-secondary border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {mode === 'signup' && (
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 bg-secondary border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
              ) : mode === 'login' ? (
                <><LogIn className="h-4 w-4" /> Sign In</>
              ) : (
                <><UserPlus className="h-4 w-4" /> Create Account</>
              )}
            </button>
          </form>

          {mode === 'login' && (
            <div className="mt-4 p-3 bg-muted/50 rounded-md border border-border">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Role-based demo accounts (any password, 4+ characters)
              </p>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {demoAccounts.map((a) => (
                  <button
                    key={a.email}
                    type="button"
                    onClick={() => setEmail(a.email)}
                    className="w-full text-left rounded border border-border bg-card/60 px-2 py-1.5 hover:border-primary/50 transition-colors"
                  >
                    <p className="text-[11px] font-mono text-foreground">{a.email}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {roleLabels[a.role]} — {a.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-6 uppercase tracking-widest">
          NEMA Lead Agency • Secured Access
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
