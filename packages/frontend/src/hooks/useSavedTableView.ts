'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EnterpriseSavedTableView } from '@/types/enterprise-table';
import { deleteTableView, listTableViews, saveTableView } from '@/services/api/table-views.api';

type UseSavedTableViewOptions = {
  userId?: string | null;
  scope: string;
  enabled?: boolean;
  onApplyView?: (view: EnterpriseSavedTableView) => void;
};

const DEFAULT_VIEW_KEY = 'default';

export function useSavedTableView({
  userId,
  scope,
  enabled = true,
  onApplyView,
}: UseSavedTableViewOptions) {
  const [loading, setLoading] = useState(false);
  const [hasSavedView, setHasSavedView] = useState(false);
  const canUseSavedView = enabled && Boolean(userId) && Boolean(scope);
  const onApplyViewRef = useRef(onApplyView);

  useEffect(() => {
    onApplyViewRef.current = onApplyView;
  }, [onApplyView]);

  const loadSavedView = useCallback(async () => {
    if (!canUseSavedView || !userId) return null;

    setLoading(true);
    try {
      const views = await listTableViews(userId, scope);
      const selected = views.find((view) => view.isDefault) ?? views[0] ?? null;
      setHasSavedView(Boolean(selected));
      if (selected && onApplyViewRef.current) {
        onApplyViewRef.current(selected);
      }
      return selected;
    } finally {
      setLoading(false);
    }
  }, [canUseSavedView, scope, userId]);

  useEffect(() => {
    void loadSavedView();
  }, [loadSavedView]);

  const saveDefaultView = useCallback(async (state: EnterpriseSavedTableView['state'], name = 'Default View') => {
    if (!canUseSavedView || !userId) return null;

    setLoading(true);
    try {
      const saved = await saveTableView(userId, {
        scope,
        viewKey: DEFAULT_VIEW_KEY,
        name,
        isDefault: true,
        state,
      });
      setHasSavedView(true);
      return saved;
    } finally {
      setLoading(false);
    }
  }, [canUseSavedView, scope, userId]);

  const clearSavedView = useCallback(async () => {
    if (!canUseSavedView || !userId) return null;

    setLoading(true);
    try {
      const cleared = await deleteTableView(userId, scope, DEFAULT_VIEW_KEY);
      setHasSavedView(false);
      return cleared;
    } finally {
      setLoading(false);
    }
  }, [canUseSavedView, scope, userId]);

  return useMemo(() => ({
    loading,
    hasSavedView,
    loadSavedView,
    saveDefaultView,
    clearSavedView,
  }), [clearSavedView, hasSavedView, loadSavedView, loading, saveDefaultView]);
}
