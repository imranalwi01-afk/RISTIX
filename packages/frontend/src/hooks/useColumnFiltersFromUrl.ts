'use client';

import { useState, useEffect } from 'react';

/**
 * Reads columnFilters from URL search param 'cf' (JSON-encoded).
 * Uses window.location directly (no useSearchParams dependency) so it works
 * without Suspense boundary.
 */
export function useColumnFiltersFromUrl(): Record<string, any> {
  const [filters, setFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    const readFromUrl = () => {
      try {
        const raw = new URL(window.location.href).searchParams.get('cf');
        if (raw) {
          const parsed = JSON.parse(raw);
          setFilters(parsed);
        } else {
          setFilters({});
        }
      } catch {
        setFilters({});
      }
    };

    readFromUrl();

    // Re-read when URL changes (popstate = browser back/forward)
    const handler = () => readFromUrl();
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  return filters;
}
