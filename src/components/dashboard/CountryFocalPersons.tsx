import { useState } from 'react';
import { Download, Phone } from 'lucide-react';
import type { CountryProfile } from '@/data/westAfrica';
import { boundaryLabels, getSubRegions } from '@/data/adminBoundaries';
import { useAuth } from '@/hooks/useAuth';
import { filterSubRegions } from '@/data/accessControl';
import { useDataVersion } from '@/hooks/useDataVersion';
import { downloadBlob, toCsv } from '@/lib/csv';

/** Focal-person roster for a country, scoped to the signed-in user's boundaries. */
const CountryFocalPersons = ({ country }: { country: CountryProfile }) => {
  const labels = boundaryLabels[country.code];
  const { scope } = useAuth();
  useDataVersion();
  const [query, setQuery] = useState('');

  const subs = filterSubRegions(scope, getSubRegions(country.code));
  const q = query.trim().toLowerCase();
  const rows = subs.filter(
    (s) =>
      !q ||
      s.focalPerson.name.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.parent.toLowerCase().includes(q),
  );

  const exportCsv = () =>
    downloadBlob(
      `${country.code}-focal-persons.csv`,
      'text/csv;charset=utf-8',
      toCsv(
        ['name', 'role', 'phone', 'agency', labels.level2Singular, labels.level1Singular, 'households', 'households_reached', 'last_report'],
        rows.map((s) => [
          s.focalPerson.name, s.focalPerson.role, s.focalPerson.phone, s.focalPerson.agency,
          s.name, s.parent, s.households, s.householdsReached, s.focalPerson.lastReport,
        ]),
      ),
    );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search focal person, ${labels.level2Singular.toLowerCase()} or ${labels.level1Singular.toLowerCase()}`}
          className="flex-1 min-w-[220px] rounded border border-border bg-background px-2 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1 rounded border border-border px-2 py-1.5 text-[10px] text-foreground hover:bg-secondary transition-colors"
        >
          <Download className="h-3 w-3" /> Export roster
        </button>
      </div>

      <div className="max-h-[340px] overflow-y-auto rounded-md border border-border">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 bg-secondary">
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="py-2 px-3 font-medium">Focal person</th>
              <th className="py-2 px-3 font-medium">{labels.level2Singular}</th>
              <th className="py-2 px-3 font-medium">Contact</th>
              <th className="py-2 px-3 font-medium">Households reached</th>
              <th className="py-2 px-3 font-medium">Last report</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={`${s.parent}-${s.name}`} className="border-b border-border/50">
                <td className="py-2 px-3">
                  <span className="block text-foreground font-medium">{s.focalPerson.name}</span>
                  <span className="block text-[10px] text-muted-foreground">
                    {s.focalPerson.role} · {s.focalPerson.agency}
                  </span>
                </td>
                <td className="py-2 px-3 text-muted-foreground">
                  {s.name}
                  <span className="block text-[10px]">{s.parent}</span>
                </td>
                <td className="py-2 px-3 font-mono text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {s.focalPerson.phone}
                  </span>
                </td>
                <td className="py-2 px-3 font-mono text-foreground">
                  {s.householdsReached.toLocaleString()} / {s.households.toLocaleString()}
                </td>
                <td className="py-2 px-3 font-mono text-muted-foreground">{s.focalPerson.lastReport}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CountryFocalPersons;
