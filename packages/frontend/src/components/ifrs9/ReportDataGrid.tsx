// packages/frontend/src/components/ifrs9/ReportDataGrid.tsx
import React from 'react';
import { alpha } from '@mui/material';
import { SafeDataGrid, SafeDataGridProps } from '@/components/shared/SafeDataGrid';

export interface ReportDataGridProps extends SafeDataGridProps {
  /**
   * CSS gradient for the column header background.
   * Defaults to the banking platform blue used across IFRS 9 reports.
   */
  headerGradient?: string;
  /** Height for the grid (default: 600) */
  height?: number | string;
}

const DEFAULT_HEADER_GRADIENT = 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)';
const HEADER_BASE_COLOR = '#1976D2';

/**
 * Drop-in replacement for SafeDataGrid with the premium visual style
 * from the Nominative Report:
 * - Gradient column header (banking platform blue by default, overridable)
 * - Smooth row hover: subtle scale + shadow
 * - Selected row highlight
 * - Clean cell borders
 */
const ReportDataGrid: React.FC<ReportDataGridProps> = ({
  headerGradient = DEFAULT_HEADER_GRADIENT,
  height = 600,
  ...props
}) => (
  <SafeDataGrid
    {...props}
    sx={{
      border: 'none',
      borderRadius: 2,
      height,
      width: '100%',
      // ── Column headers ─────────────────────────────────────
      '& .MuiDataGrid-columnHeaders': {
        background: headerGradient,
        color: 'white',
        borderRadius: '8px 8px 0 0',
        '& .MuiDataGrid-columnHeader': {
          color: 'white',
          fontWeight: 700,
          fontSize: '0.9rem',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.1)'
          },
          '& .MuiDataGrid-iconButtonContainer': {
            '& .MuiIconButton-root': {
              color: 'white'
            }
          },
          '& .MuiDataGrid-columnSeparator': {
            color: 'rgba(255, 255, 255, 0.3)'
          }
        }
      },
      '& .MuiDataGrid-sortIcon': {
        color: 'rgba(255, 255, 255, 0.8)'
      },
      '& .MuiDataGrid-menuIconButton': {color: 'rgba(255, 255, 255, 0.8)'},
      // ── Rows ────────────────────────────────────────────────
      '& .MuiDataGrid-row': {
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: alpha(HEADER_BASE_COLOR, 0.04),
          transform: 'scale(1.001)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)'
        },
        '&.Mui-selected': {
          backgroundColor: alpha(HEADER_BASE_COLOR, 0.08),
          '&:hover': {
            backgroundColor: alpha(HEADER_BASE_COLOR, 0.12)
          }
        }
      },
      // ── Cells ───────────────────────────────────────────────
      '& .MuiDataGrid-cell': {
        borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
        fontSize: '0.875rem'
      },
      // ── Footer ──────────────────────────────────────────────
      '& .MuiDataGrid-footerContainer': {
        borderTop: '2px solid',
        borderColor: 'divider',
        bgcolor: 'background.default'
      },
      // ── Checkbox ────────────────────────────────────────────
      '& .MuiCheckbox-root.Mui-checked': {
        color: HEADER_BASE_COLOR
      }
    }}
  />
);

export default ReportDataGrid;
