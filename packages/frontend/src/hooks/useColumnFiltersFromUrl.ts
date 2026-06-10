'use client';

import { useState, useEffect } from 'react';

/**
 * Reads columnFilters from URL search param (default key: 'cf').
 * Supports custom key for pages with multiple tables.
 * Uses window.location directly so it works without Suspense boundary.
 */
export function useColumnFiltersFromUrl(key: string = 'cf'): Record<string, any> {
  const [filters, setFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    const readFromUrl = () => {
      try {
        const raw = new URL(window.location.href).searchParams.get(key);
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
    const handler = () => readFromUrl();
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [key]);

  return filters;
}
