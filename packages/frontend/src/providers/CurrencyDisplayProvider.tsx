'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { appSettingsApi } from '@/services/api/app-settings.api';
import { formatMoney, type SupportedCurrency } from '@/utils/format-money';

const SHOW_CURRENCY_SYMBOL_CODE = 'CURRDSPLY';
const LOCAL_CURRENCY_SYMBOL_KEY = 'ifrs9:showCurrencySymbol';

type CurrencyDisplayContextType = {
  showCurrencySymbol: boolean;
  loading: boolean;
  formatMoney: (value: unknown, currency?: SupportedCurrency) => string;
};

const CurrencyDisplayContext = createContext<CurrencyDisplayContextType>({
  showCurrencySymbol: true,
  loading: true,
  formatMoney: (value: unknown, currency: SupportedCurrency = 'IDR') => formatMoney(value, { currency, showCurrencySymbol: true }),
});

let currencyPatchInstalled = false;

function installGlobalCurrencyFormatterPatch() {
  if (currencyPatchInstalled || typeof window === 'undefined') return;

  const intlObject = Intl as any;
  const originalNumberFormat = intlObject.NumberFormat;
  if (!originalNumberFormat) return;

  const patchedNumberFormat = function patchedNumberFormat(locales?: string | string[], options?: Intl.NumberFormatOptions) {
    const showSymbol = (window as any).__SHOW_CURRENCY_SYMBOL__ !== false;
    const isCurrency = options?.style === 'currency';
    if (!showSymbol && isCurrency) {
      const { style, currency, currencyDisplay, currencySign, ...rest } = options || {};
      return new originalNumberFormat(locales, rest);
    }
    return new originalNumberFormat(locales, options);
  };

  patchedNumberFormat.prototype = originalNumberFormat.prototype;
  patchedNumberFormat.supportedLocalesOf = originalNumberFormat.supportedLocalesOf.bind(originalNumberFormat);

  intlObject.NumberFormat = patchedNumberFormat;
  currencyPatchInstalled = true;
}

function parseBooleanSetting(raw: unknown, fallback = true): boolean {
  if (typeof raw === 'boolean') return raw;
  if (typeof raw !== 'string') return fallback;
  const value = raw.trim().toLowerCase();
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'y', 'on', 'aktif', 'active'].includes(value);
}

function parseBooleanToken(raw: unknown): boolean | null {
  if (typeof raw === 'boolean') return raw;
  if (typeof raw !== 'string') return null;
  const value = raw.trim().toLowerCase();
  if (!value) return null;
  if (['1', 'true', 'yes', 'y', 'on', 'aktif', 'active'].includes(value)) return true;
  if (['0', 'false', 'no', 'n', 'off', 'nonaktif', 'inactive'].includes(value)) return false;
  return null;
}

function resolveLatestCurrencyDetail(details: any[]) {
  if (!Array.isArray(details) || details.length === 0) return null;
  const sorted = [...details].sort((a: any, b: any) => {
    const seqA = Number(a?.paramSeq ?? a?.param_seq ?? 0);
    const seqB = Number(b?.paramSeq ?? b?.param_seq ?? 0);
    if (seqA !== seqB) return seqB - seqA;
    const idA = Number(a?.pkid ?? a?.id ?? 0);
    const idB = Number(b?.pkid ?? b?.id ?? 0);
    return idB - idA;
  });

  const booleanRow = sorted.find((d: any) =>
    parseBooleanToken(d?.value1) !== null
    || parseBooleanToken(d?.value2) !== null
    || parseBooleanToken(d?.value3) !== null
  );
  if (booleanRow) return booleanRow;

  return sorted[0];
}

export function CurrencyDisplayProvider({ children }: { children: React.ReactNode }) {
  const [showCurrencySymbol, setShowCurrencySymbol] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    installGlobalCurrencyFormatterPatch();
    (window as any).__SHOW_CURRENCY_SYMBOL__ = true;
    let mounted = true;

    async function loadSetting() {
      try {
        // Always fetch the latest server value for global display toggle to avoid stale UI state.
        const setting = await appSettingsApi.getByCode(SHOW_CURRENCY_SYMBOL_CODE);
        const detail = resolveLatestCurrencyDetail(Array.isArray(setting?.details) ? setting.details : []);
        const rawValue = detail?.value1 ?? detail?.value2 ?? detail?.value3 ?? detail?.paramdesc ?? '';
        if (mounted) {
          const resolved = parseBooleanSetting(rawValue, true);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(LOCAL_CURRENCY_SYMBOL_KEY, resolved ? 'true' : 'false');
          }
          (window as any).__SHOW_CURRENCY_SYMBOL__ = resolved;
          setShowCurrencySymbol(resolved);
        }
      } catch (_error) {
        if (mounted) {
          const localValue = typeof window !== 'undefined' ? window.localStorage.getItem(LOCAL_CURRENCY_SYMBOL_KEY) : null;
          const resolvedLocal = parseBooleanSetting(localValue, true);
          (window as any).__SHOW_CURRENCY_SYMBOL__ = resolvedLocal;
          setShowCurrencySymbol(resolvedLocal);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSetting();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ showCurrencySymbol?: boolean }>;
      const nextValue = customEvent?.detail?.showCurrencySymbol;
      if (typeof nextValue === 'boolean') {
        (window as any).__SHOW_CURRENCY_SYMBOL__ = nextValue;
        setShowCurrencySymbol(nextValue);
      }
    };

    window.addEventListener('currency-symbol-setting-changed', handler as EventListener);
    return () => {
      window.removeEventListener('currency-symbol-setting-changed', handler as EventListener);
    };
  }, []);

  const contextValue = useMemo<CurrencyDisplayContextType>(() => ({
    showCurrencySymbol,
    loading,
    formatMoney: (value: unknown, currency: SupportedCurrency = 'IDR') =>
      formatMoney(value, { currency, showCurrencySymbol }),
  }), [loading, showCurrencySymbol]);

  return (
    <CurrencyDisplayContext.Provider value={contextValue}>
      {children}
    </CurrencyDisplayContext.Provider>
  );
}

export function useCurrencyDisplay() {
  return useContext(CurrencyDisplayContext);
}
