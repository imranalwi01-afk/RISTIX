// packages/frontend/src/hooks/useSavedFilters.ts
'use client';

/**
 * Persists report and table filter presets in browser storage.
 * This hook is documented because it is reused across multiple user-facing pages.
 */
import { useState, useEffect, useCallback } from 'react';

export interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UseSavedFiltersOptions {
  storageKey: string;
  maxSavedFilters?: number;
}

export const useSavedFilters = (options: UseSavedFiltersOptions) => {
  const { storageKey, maxSavedFilters = 10 } = options;
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [loading, setLoading] = useState(true);

  // Load saved filters from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as SavedFilter[];
        setSavedFilters(parsed);
      }
    } catch (error) {
      console.error('Failed to load saved filters:', error);
    } finally {
      setLoading(false);
    }
  }, [storageKey]);

  // Save filters to localStorage whenever they change
  const persistFilters = useCallback((filters: SavedFilter[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(filters));
    } catch (error) {
      console.error('Failed to save filters:', error);
    }
  }, [storageKey]);

  // Save a new filter
  const saveFilter = useCallback((name: string, filterData: Record<string, any>) => {
    const newFilter: SavedFilter = {
      id: `filter_${Date.now()}`,
      name,
      filters: filterData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSavedFilters(prev => {
      // Limit number of saved filters
      const updated = [newFilter, ...prev].slice(0, maxSavedFilters);
      persistFilters(updated);
      return updated;
    });

    return newFilter;
  }, [maxSavedFilters, persistFilters]);

  // Update an existing filter
  const updateFilter = useCallback((id: string, name: string, filterData: Record<string, any>) => {
    setSavedFilters(prev => {
      const updated = prev.map(filter => 
        filter.id === id
          ? { ...filter, name, filters: filterData, updatedAt: new Date().toISOString() }
          : filter
      );
      persistFilters(updated);
      return updated;
    });
  }, [persistFilters]);

  // Delete a filter
  const deleteFilter = useCallback((id: string) => {
    setSavedFilters(prev => {
      const updated = prev.filter(filter => filter.id !== id);
      persistFilters(updated);
      return updated;
    });
  }, [persistFilters]);

  // Load a filter by ID
  const loadFilter = useCallback((id: string): SavedFilter | undefined => {
    return savedFilters.find(filter => filter.id === id);
  }, [savedFilters]);

  // Clear all saved filters
  const clearAllFilters = useCallback(() => {
    setSavedFilters([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    savedFilters,
    loading,
    saveFilter,
    updateFilter,
    deleteFilter,
    loadFilter,
    clearAllFilters
  };
};
