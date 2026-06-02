export type SupportedCurrency = 'IDR' | 'USD' | 'EUR' | 'GBP' | 'SGD' | 'MYR' | string;

function toFiniteNumber(value: unknown): number | null {
  const normalized = typeof value === 'string' ? value.replace(/[^\d.-]/g, '') : value;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
}

function resolveLocale(currency: SupportedCurrency): string {
  return String(currency).toUpperCase() === 'IDR' ? 'id-ID' : 'en-US';
}

export function formatMoney(
  value: unknown,
  options?: {
    currency?: SupportedCurrency;
    showCurrencySymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const numeric = toFiniteNumber(value);
  if (numeric === null) return '-';

  const currency = (options?.currency || 'IDR').toUpperCase();
  const showCurrencySymbol = options?.showCurrencySymbol ?? true;
  const minimumFractionDigits = options?.minimumFractionDigits ?? 0;
  const maximumFractionDigits = options?.maximumFractionDigits ?? 0;
  const locale = resolveLocale(currency);

  if (!showCurrencySymbol) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(numeric);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numeric);
}

