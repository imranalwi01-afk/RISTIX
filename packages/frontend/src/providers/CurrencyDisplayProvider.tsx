'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCachedAppSettingsByCode } from '@/lib/cached-settings';
import { formatMoney, type SupportedCurrency } from '@/utils/format-money';

const SHOW_CURRENCY_SYMBOL_CODE = 'SHOW_CURRENCY_SYMBOL';

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
    let mounted = true;

    async function loadSetting() {
      try {
        const setting = await getCachedAppSettingsByCode(SHOW_CURRENCY_SYMBOL_CODE);
        const detail = Array.isArray(setting?.details) && setting.details.length > 0 ? setting.details[0] : null;
        const rawValue = detail?.value1 ?? detail?.value2 ?? detail?.paramdesc ?? '';
        if (mounted) {
          setShowCurrencySymbol(parseBooleanSetting(rawValue, true));
        }
      } catch (_error) {
        if (mounted) {
          setShowCurrencySymbol(true);
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

