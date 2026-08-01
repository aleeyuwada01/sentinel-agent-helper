import TopBar from '@/components/dashboard/TopBar';
import CountryRegistryPanel from '@/components/dashboard/CountryRegistryPanel';

const Countries = () => (
  <div className="min-h-screen bg-background">
    <TopBar />
    <main className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <section>
        <h1 className="text-lg font-bold text-foreground">Country &amp; Concern Registry</h1>
        <p className="text-[11px] text-muted-foreground mt-1">
          Register a country into WAMHEWS and record every concern it brings — hazards, exposure, capacity,
          coordination and data gaps — alongside what the system makes obtainable for each one.
        </p>
      </section>
      <CountryRegistryPanel />
    </main>
  </div>
);

export default Countries;
