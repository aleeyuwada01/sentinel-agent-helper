import { useEffect, useState } from 'react';
import { datasetVersion, hydrateDatasets, subscribeDatasets } from '@/data/dataOverrides';

/**
 * Re-renders the caller whenever imported datasets change (and hydrates the
 * persisted imports on first client mount, keeping SSR output stable).
 */
export const useDataVersion = () => {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    hydrateDatasets();
    setVersion(datasetVersion());
    const unsubscribe = subscribeDatasets(() => setVersion(datasetVersion()));
    return () => {
      unsubscribe();
    };
  }, []);

  return version;
};
