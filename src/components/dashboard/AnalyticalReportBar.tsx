import { FileText, Sheet } from 'lucide-react';
import type { CountryProfile } from '@/data/westAfrica';
import { downloadAnalyticalCsv, downloadAnalyticalPdf } from '@/lib/analyticalReport';

/** Downloadable analytical report actions for one country. */
const AnalyticalReportBar = ({ country }: { country: CountryProfile }) => (
  <section className="data-grid flex items-center gap-3 flex-wrap">
    <div className="min-w-0">
      <h3 className="text-sm font-semibold text-foreground">{country.shortName} — Analytical Report</h3>
      <p className="text-[10px] text-muted-foreground">
        Full national analysis: risk ranking, incident record, dissemination reach and household / building
        footprint exposure.
      </p>
    </div>
    <div className="ml-auto flex gap-2">
      <button
        onClick={() => downloadAnalyticalPdf(country)}
        className="inline-flex items-center gap-1 rounded bg-primary/25 border border-primary/40 px-3 py-1.5 text-[11px] text-foreground hover:bg-primary/35 transition-colors"
      >
        <FileText className="h-3.5 w-3.5" /> Download PDF
      </button>
      <button
        onClick={() => downloadAnalyticalCsv(country)}
        className="inline-flex items-center gap-1 rounded border border-border px-3 py-1.5 text-[11px] text-foreground hover:bg-secondary transition-colors"
      >
        <Sheet className="h-3.5 w-3.5" /> Download CSV
      </button>
    </div>
  </section>
);

export default AnalyticalReportBar;
