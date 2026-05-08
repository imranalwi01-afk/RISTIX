import { PersistedIaHeader } from './types';

export const formatDisplayDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatAmount = (value?: number | string | null) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric)
    ? numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00';
};

export const readHeaderNumber = (header: PersistedIaHeader, field: keyof PersistedIaHeader) => {
  const value = header[field];
  return value === null || value === undefined ? 0 : value;
};
