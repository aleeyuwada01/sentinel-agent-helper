import { useState, useEffect, createContext, useContext, useMemo, ReactNode } from 'react';
import {
  defaultScope,
  findDemoAccount,
  type AccessScope,
  type Role,
} from '@/data/accessControl';
import type { CountryCode } from '@/data/westAfrica';

export interface User {
  email: string;
  name: string;
  role: Role;
  agency?: string;
  scope: AccessScope;
}

interface AuthContextType {
  user: User | null;
  scope: AccessScope;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, agency: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  ready: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  scope: defaultScope,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  isAuthenticated: false,
  ready: false,
});

const STORAGE_KEY = 'mhews_user';

/** Signed-up accounts get an agency-head scope inferred from the agency they register under. */
const scopeForSignup = (agency: string): AccessScope => ({
  role: 'agency_admin',
  countries: ['NG' as CountryCode],
  commandLevel: 'national',
  agencyCode: agency ? agency.split(/\s|—/)[0].toUpperCase() : undefined,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as User;
        setUser(parsed.scope ? parsed : { ...parsed, role: 'viewer', scope: defaultScope });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setReady(true);
  }, []);

  const persist = (u: User) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    if (!email || password.length < 4) return false;
    const account = findDemoAccount(email);
    const u: User = account
      ? {
          email: account.email,
          name: account.name,
          role: account.role,
          agency: account.agencyCode,
          scope: {
            role: account.role,
            countries: account.countries,
            commandLevel: account.commandLevel,
            agencyCode: account.agencyCode,
            level1: account.level1,
            level2: account.level2,
          },
        }
      : {
          email,
          name: email.split('@')[0],
          role: 'viewer',
          scope: defaultScope,
        };
    persist(u);
    return true;
  };

  const signup = async (email: string, password: string, name: string, agency: string) => {
    await new Promise((r) => setTimeout(r, 800));
    if (!email || password.length < 6 || !name) return false;
    const scope = scopeForSignup(agency);
    persist({ email, name, role: scope.role, agency, scope });
    return true;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      scope: user?.scope ?? defaultScope,
      login,
      signup,
      logout,
      isAuthenticated: !!user,
      ready,
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

/** Convenience accessor for RBAC checks. */
export const useScope = () => useAuth().scope;
