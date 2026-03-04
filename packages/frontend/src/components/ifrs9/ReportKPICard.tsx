// packages/frontend/src/components/ifrs9/ReportKPICard.tsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Skeleton,
  alpha
} from '@mui/material';
import { formatTerbilang } from '../../utils/banking';

export interface ReportKPICardProps {
  /** Card title label (shown uppercase) */
  title: string;
  /** Numeric value or pre-formatted string  */
  value: number | string;
  /**
   * How to format a numeric `value`:
   * - `'currency'` → IDR compact (e.g. Rp 1,2 T)
   * - `'percent'`  → fixed 2 decimals + %
   * - `'count'`    → locale integer (e.g. 1.234)
   * - `'raw'`      → use value as-is (pass pre-formatted string)
   */
  format?: 'currency' | 'percent' | 'count' | 'raw';
  /** MUI icon element */
  icon: React.ReactNode;
  /** CSS gradient string for icon background and value text */
  gradient: string;
  /** Solid fallback / shadow color */
  mainColor: string;
  /** Optional subtle background gradient for the card itself */
  bgGradient?: string;
  /** Label shown on the bottom chip. Defaults to "LIVE DATA". */
  chipLabel?: string;
  /** Show skeleton instead of value (for loading states) */
  loading?: boolean;
}

const formatValue = (
  value: number | string,
  format: ReportKPICardProps['format'] = 'raw'
): string => {
  if (typeof value === 'string') return value;
  
  // Convert to number and handle decimal precision
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(numValue)) return '0';
  
  switch (format) {
    case 'currency':
      // Use compact notation for large numbers
      if (numValue >= 1000000000000) {
        return `${(numValue / 1000000000000).toFixed(1)} Triliun`;
      } else if (numValue >= 1000000000) {
        return `${(numValue / 1000000000).toFixed(1)} Milyar`;
      } else if (numValue >= 1000000) {
        return `${(numValue / 1000000).toFixed(1)} Juta`;
      } else if (numValue >= 1000) {
        return `${(numValue / 1000).toFixed(1)} Ribu`;
      } else {
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(numValue);
      }
    case 'percent':
      return `${numValue.toFixed(2)}%`;
    case 'count':
      return Math.round(numValue).toLocaleString('id-ID');
    default:
      return numValue.toString();
  }
};

/**
 * A single premium KPI card with gradient icon, animated hover,
 * and gradient text. Drop-in for any report summary section.
 */
const ReportKPICard: React.FC<ReportKPICardProps> = ({
  title,
  value,
  format = 'raw',
  icon,
  gradient,
  mainColor,
  bgGradient,
  chipLabel = 'LIVE DATA',
  loading = false
}) => (
  <Card
    sx={{
      height: '100%',
      borderRadius: 4,
      position: 'relative',
      overflow: 'hidden',
      background: bgGradient ?? 'white',
      boxShadow: `0 4px 20px ${alpha(mainColor, 0.05)}`,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      border: `1px solid ${alpha(mainColor, 0.08)}`,
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: `0 15px 35px ${alpha(mainColor, 0.12)}`,
        '& .kpi-icon': {
          transform: 'rotate(5deg) scale(1.05)'
        }
      }
    }}
  >
    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header row: label + icon */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            color: 'text.secondary',
            opacity: 0.8
          }}
        >
          {title}
        </Typography>
        <Box
          className="kpi-icon"
          sx={{
            p: 1.5,
            borderRadius: 2,
            background: gradient,
            color: 'white',
            display: 'flex',
            transition: 'transform 0.3s ease',
            boxShadow: `0 4px 12px ${alpha(mainColor, 0.4)}`
          }}
        >
          {icon}
        </Box>
      </Box>

      {/* Value + chip */}
      <Box sx={{ mt: 'auto' }}>
        {loading ? (
          <Skeleton variant="text" width={120} height={48} />
        ) : (
          <Box sx={{ mb: 1.5 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: mainColor,
                lineHeight: 1.1,
                mb: 0.5,
                wordBreak: 'break-word',
                fontSize: { xs: '1.75rem', sm: '2rem', md: '1.75rem', lg: '2.25rem', xl: '2.5rem' }
              }}
            >
              {(() => {
                const formatted = formatValue(value, format);
                if (format === 'currency' && typeof formatted === 'string') {
                  // Check if it's a compact notation (ends with Triliun, Milyar, Juta, Ribu) or regular currency
                  if (formatted.match(/^[0-9.]+\s(Triliun|Milyar|Juta|Ribu)$/)) {
                    return (
                      <>
                        <Box component="span" sx={{ fontSize: '0.45em', fontWeight: 700, mr: 0.5, verticalAlign: 'baseline', opacity: 0.85 }}>
                          Rp
                        </Box>
                        {formatted}
                      </>
                    );
                  } else if (formatted.startsWith('Rp')) {
                    const numPart = formatted.replace(/^Rp\s*/i, '');
                    return (
                      <>
                        <Box component="span" sx={{ fontSize: '0.45em', fontWeight: 700, mr: 0.5, verticalAlign: 'baseline', opacity: 0.85 }}>
                          Rp
                        </Box>
                        {numPart}
                      </>
                    );
                  }
                }
                return formatted;
              })()}
            </Typography>
            {typeof value === 'number' && (
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  color: 'text.secondary', 
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  opacity: 0.6,
                  lineHeight: 1.1,
                  mt: 0.5,
                  letterSpacing: 0.2
                }}
              >
                {format === 'currency' 
                  ? formatTerbilang(value, true) 
                  : formatTerbilang(value, false)}
              </Typography>
            )}
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.7 }}>
          <Chip
            size="small"
            label={chipLabel}
            variant="outlined"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 700,
              borderColor: alpha(mainColor, 0.3),
              color: mainColor
            }}
          />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default ReportKPICard;
