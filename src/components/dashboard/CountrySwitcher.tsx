import { useEffect } from 'react';
import { Globe2 } from 'lucide-react';
import { useCountry } from '@/hooks/useCountry';
import type { CountryCode } from '@/data/westAfrica';
import { useAuth } from '@/hooks/useAuth';
import { allowedCountries } from '@/data/accessControl';

const CountrySwitcher = () => {
  const { country, allCountries, setCountryCode } = useCountry();
  const { scope } = useAuth();
  const allowed = allowedCountries(scope);
  const options = allCountries.filter((c) => allowed.includes(c.code));

  useEffect(() => {
    if (options.length && !allowed.includes(country.code)) setCountryCode(options[0].code);
  }, [allowed, country.code, options, setCountryCode]);

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/20 border border-primary/30">
      <Globe2 className="h-3.5 w-3.5 text-primary" />
      <select
        value={country.code}
        onChange={(e) => setCountryCode(e.target.value as CountryCode)}
        className="bg-transparent text-xs font-mono text-foreground outline-none cursor-pointer"
        aria-label="Select country deployment"
      >
        {options.map((c) => (
          <option key={c.code} value={c.code} className="bg-card text-foreground">
            {c.flag} {c.shortName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CountrySwitcher;
