import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { countries, getCountry, type CountryCode, type CountryProfile } from '@/data/westAfrica';

interface CountryContextValue {
  country: CountryProfile;
  countryCode: CountryCode;
  setCountryCode: (code: CountryCode) => void;
  allCountries: CountryProfile[];
}

const STORAGE_KEY = 'wamhews.country';

const CountryContext = createContext<CountryContextValue | undefined>(undefined);

export const CountryProvider = ({ children }: { children: React.ReactNode }) => {
  const [countryCode, setCountryCodeState] = useState<CountryCode>('NG');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (countries.some((c) => c.code === stored)) {
      setCountryCodeState(stored as CountryCode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, countryCode);
  }, [countryCode]);

  const value = useMemo<CountryContextValue>(
    () => ({
      country: getCountry(countryCode),
      countryCode,
      setCountryCode: setCountryCodeState,
      allCountries: countries,
    }),
    [countryCode],
  );

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
};

export const useCountry = () => {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error('useCountry must be used within CountryProvider');
  return ctx;
};
