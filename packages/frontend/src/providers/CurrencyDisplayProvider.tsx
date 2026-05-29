'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCachedAppSettingsByCode } from '@/lib/cached-settings';
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

export function CurrencyDisplayProvider({ children }: { children: React.ReactNode }) {
  const [showCurrencySymbol, setShowCurrencySymbol] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    installGlobalCurrencyFormatterPatch();
    (window as any).__SHOW_CURRENCY_SYMBOL__ = true;
    let mounted = true;

    async function loadSetting() {
      try {
        const localValue = typeof window !== 'undefined' ? window.localStorage.getItem(LOCAL_CURRENCY_SYMBOL_KEY) : null;
        if (localValue !== null && localValue !== undefined) {
          const resolvedLocal = parseBooleanSetting(localValue, true);
          if (mounted) {
            (window as any).__SHOW_CURRENCY_SYMBOL__ = resolvedLocal;
            setShowCurrencySymbol(resolvedLocal);
            setLoading(false);
          }
          return;
        }

        const setting = await getCachedAppSettingsByCode(SHOW_CURRENCY_SYMBOL_CODE);
        const detail = Array.isArray(setting?.details) && setting.details.length > 0 ? setting.details[0] : null;
        const rawValue = detail?.value1 ?? detail?.value2 ?? detail?.paramdesc ?? '';
        if (mounted) {
          const resolved = parseBooleanSetting(rawValue, true);
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
