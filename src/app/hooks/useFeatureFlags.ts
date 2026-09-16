import { useState, useEffect, useCallback } from 'react';
import { getEffectiveFeatureFlags } from '../utils/api';

export function useFeatureFlags() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await getEffectiveFeatureFlags();
      setFlags(response?.flags || {});
    } catch (err) {
      console.warn('[useFeatureFlags] Failed to load, defaulting to enabled:', err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Fail open: if a flag hasn't loaded yet or the fetch failed, treat it as enabled
  // rather than hiding a feature due to a network blip.
  const isEnabled = useCallback((key: string) => flags[key] !== false, [flags]);

  return { flags, loaded, isEnabled, refresh };
}
