'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  EnterpriseDensity,
  EnterpriseColumnFilterValue,
  EnterpriseExportScope,
  EnterprisePaginationMode,
  EnterprisePaginationModel,
  EnterpriseSavedTableView,
  EnterpriseSort,
  EnterpriseTableQueryParams,
  EnterpriseTableQueryState,
} from '@/types/enterprise-table';

type UseEnterpriseTableQueryOptions = {
  pageKey: string;
  paginationMode?: EnterprisePaginationMode;
  initialPageSize?: number;
  initialSort?: EnterpriseSort[];
  initialFilters?: Record<string, EnterpriseColumnFilterValue>;
  initialColumnVisibilityModel?: Record<string, boolean>;
  initialDensity?: EnterpriseDensity;
  debounceMs?: number;
  urlSyncDebounceMs?: number;
  syncUrl?: boolean;
};

function buildDefaultState(options: UseEnterpriseTableQueryOptions): EnterpriseTableQueryState {
  return {
    paginationMode: options.paginationMode ?? 'offset',
    paginationModel: { page: 0, pageSize: options.initialPageSize ?? 25 },
    columnFilters: options.initialFilters ?? {},
    sort: options.initialSort ?? [],
    columnVisibilityModel: options.initialColumnVisibilityModel ?? {},
    density: options.initialDensity ?? 'standard',
    cursor: null,
    previousCursor: null,
    nextCursor: null,
  };
}

function isEmptyFilterValue(value: EnterpriseColumnFilterValue) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') {
    return Object.values(value).every((item) => item === undefined || item === null || String(item).trim().length === 0);
  }
  return false;
}

function removeEmptyFilters(filters: Record<string, EnterpriseColumnFilterValue>) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => !isEmptyFilterValue(value)),
  );
}

function parseJsonParam<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function readInitialState(options: UseEnterpriseTableQueryOptions): EnterpriseTableQueryState {
  if (typeof window === 'undefined') {
    return buildDefaultState(options);
  }

  const params = new URLSearchParams(window.location.search);
  const page = Math.max(Number(params.get('page') ?? 1) - 1, 0);
  const pageSize = Math.max(Number(params.get('limit') ?? options.initialPageSize ?? 25), 1);
  const cursor = params.get('cursor');
  const filters = params.get('filters');
  const sort = params.get('sort');

  return {
    paginationMode: (params.get('paginationMode') as EnterprisePaginationMode) ?? options.paginationMode ?? 'offset',
    paginationModel: { page, pageSize },
    cursor,
    columnFilters: parseJsonParam(filters, options.initialFilters ?? {}),
    sort: parseJsonParam(sort, options.initialSort ?? []),
    columnVisibilityModel: options.initialColumnVisibilityModel ?? {},
    density: options.initialDensity ?? 'standard',
  };
}

export function useEnterpriseTableQuery(options: UseEnterpriseTableQueryOptions) {
  const debounceMs = options.debounceMs ?? 300;
  const urlSyncDebounceMs = options.urlSyncDebounceMs ?? 250;
  const defaultState = useMemo(() => buildDefaultState(options), [
    options.initialColumnVisibilityModel,
    options.initialDensity,
    options.initialFilters,
    options.initialPageSize,
    options.initialSort,
    options.paginationMode,
  ]);
  const [state, setState] = useState<EnterpriseTableQueryState>(() => readInitialState(options));
  const [debouncedFilters, setDebouncedFilters] = useState(state.columnFilters);
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedFilters(removeEmptyFilters(state.columnFilters));
    }, debounceMs);
    return () => window.clearTimeout(timer);
  }, [debounceMs, state.columnFilters]);

  const queryState = useMemo<EnterpriseTableQueryState>(() => ({
    ...state,
    columnFilters: debouncedFilters,
  }), [debouncedFilters, state]);

  const queryParams = useMemo<EnterpriseTableQueryParams>(() => {
    const filters = removeEmptyFilters(queryState.columnFilters);
    const mode = queryState.paginationMode;
    const base: EnterpriseTableQueryParams = {
      limit: queryState.paginationModel.pageSize,
      paginationMode: mode,
    };

    if (mode === 'cursor') {
      if (queryState.cursor) base.cursor = queryState.cursor;
    } else if (mode === 'offset') {
      base.page = queryState.paginationModel.page + 1;
      base.offset = queryState.paginationModel.page * queryState.paginationModel.pageSize;
    } else {
      base.page = queryState.paginationModel.page + 1;
    }

    if (Object.keys(filters).length > 0) {
      base.filters = JSON.stringify(filters);
    }

    if (queryState.sort.length > 0) {
      base.sort = JSON.stringify(queryState.sort);
    }

    return base;
  }, [queryState]);

  useEffect(() => {
    if (!options.syncUrl || typeof window === 'undefined') return;

    const syncUrl = () => {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value));
        }
      });

      const nextSearch = params.toString();
      const nextUrl = nextSearch ? `${window.location.pathname}?${nextSearch}` : window.location.pathname;
      const currentUrl = `${window.location.pathname}${window.location.search}`;
      if (nextUrl !== currentUrl) {
        window.history.replaceState(window.history.state, '', nextUrl);
      }
    };

    let idleId: number | null = null;
    const timeout = window.setTimeout(() => {
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(syncUrl, { timeout: 1000 });
        return;
      }

      syncUrl();
    }, urlSyncDebounceMs);

    return () => {
      window.clearTimeout(timeout);
      if (idleId !== null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [options.syncUrl, queryParams, urlSyncDebounceMs]);

  const setPaginationModel = (paginationModel: EnterprisePaginationModel) => {
    setState((current) => ({
      ...current,
      paginationModel,
      cursor: current.paginationMode === 'cursor' ? null : current.cursor,
      previousCursor: current.paginationMode === 'cursor' ? null : current.previousCursor,
      nextCursor: current.paginationMode === 'cursor' ? null : current.nextCursor,
    }));
    if (state.paginationMode === 'cursor') setCursorStack([]);
  };

  const setColumnFilters = (columnFilters: Record<string, EnterpriseColumnFilterValue>) => {
    setState((current) => ({
      ...current,
      columnFilters,
      paginationModel: { ...current.paginationModel, page: 0 },
      cursor: null,
      previousCursor: null,
      nextCursor: null,
    }));
    setCursorStack([]);
  };

  const setSort = (sort: EnterpriseSort[]) => {
    setState((current) => ({
      ...current,
      sort,
      paginationModel: { ...current.paginationModel, page: 0 },
      cursor: null,
      previousCursor: null,
      nextCursor: null,
    }));
    setCursorStack([]);
  };

  const setColumnVisibilityModel = (columnVisibilityModel: Record<string, boolean>) => {
    setState((current) => ({ ...current, columnVisibilityModel }));
  };

  const setDensity = (density: EnterpriseDensity) => {
    setState((current) => ({ ...current, density }));
  };

  const applyPaginationMeta = (meta: { nextCursor?: string | null; previousCursor?: string | null }) => {
    setState((current) => ({
      ...current,
      nextCursor: meta.nextCursor ?? null,
      previousCursor: meta.previousCursor ?? null,
    }));
  };

  const goToNextCursor = () => {
    if (!state.nextCursor) return;
    setCursorStack((current) => [...current, state.cursor ?? '']);
    setState((current) => ({
      ...current,
      cursor: current.nextCursor,
      paginationModel: { ...current.paginationModel, page: current.paginationModel.page + 1 },
    }));
  };

  const goToPreviousCursor = () => {
    setCursorStack((current) => {
      const next = [...current];
      const previous = next.pop() ?? null;
      setState((stateValue) => ({
        ...stateValue,
        cursor: previous || null,
        paginationModel: {
          ...stateValue.paginationModel,
          page: Math.max(stateValue.paginationModel.page - 1, 0),
        },
      }));
      return next;
    });
  };

  const clearFilters = () => setColumnFilters({});

  const resetView = () => {
    setState(defaultState);
    setDebouncedFilters(defaultState.columnFilters);
    setCursorStack([]);
  };

  const applySavedView = (view: EnterpriseSavedTableView) => {
    setState((current) => ({
      ...current,
      columnFilters: view.state.filters ?? view.state.columnFilters ?? {},
      sort: view.state.sort ?? [],
      columnVisibilityModel: view.state.columns ?? view.state.columnVisibilityModel ?? {},
      density: view.state.density ?? current.density,
      paginationModel: {
        page: 0,
        pageSize: view.state.pageSize ?? view.state.paginationModel?.pageSize ?? current.paginationModel.pageSize,
      },
      cursor: null,
      previousCursor: null,
      nextCursor: null,
    }));
    setCursorStack([]);
  };

  const toSavedViewState = () => ({
    columns: state.columnVisibilityModel,
    filters: removeEmptyFilters(state.columnFilters),
    sort: state.sort,
    density: state.density,
    pageSize: state.paginationModel.pageSize,
  });

  const toExportParams = (exportScope: EnterpriseExportScope) => ({
    ...queryParams,
    exportScope,
  });

  const activeFilterChips = Object.entries(removeEmptyFilters(state.columnFilters)).map(([field, value]) => ({
    field,
    value,
    label: `${field}: ${value}`,
  }));

  return {
    queryState,
    queryParams,
    cursorStack,
    activeFilterChips,
    setPaginationModel,
    setColumnFilters,
    setSort,
    setColumnVisibilityModel,
    setDensity,
    applyPaginationMeta,
    goToNextCursor,
    goToPreviousCursor,
    clearFilters,
    resetView,
    applySavedView,
    toSavedViewState,
    toExportParams,
  };
}
