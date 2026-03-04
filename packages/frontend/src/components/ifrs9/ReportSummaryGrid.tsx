// packages/frontend/src/components/ifrs9/ReportSummaryGrid.tsx
import React from 'react';
import { Grid, SxProps, Theme } from '@mui/material';
import ReportKPICard, { ReportKPICardProps } from './ReportKPICard';

/** A single item definition passed to ReportSummaryGrid */
export type KPIItem = Omit<ReportKPICardProps, 'loading'>;

export interface ReportSummaryGridProps {
  /** Array of KPI items to render */
  items: KPIItem[];
  /**
   * How many columns on medium+ screens.
   * xs is always 12 (full width), sm is always 6.
   * Defaults to 3 (i.e. 4 cards per row).
   */
  mdCols?: 2 | 3 | 4 | 6;
  /** Pass `true` while data is loading to show skeletons */
  loading?: boolean;
  /** Extra MuiBox sx for the outer Grid container */
  sx?: SxProps<Theme>;
}

const mdColsMap: Record<number, number> = { 2: 6, 3: 4, 4: 3, 6: 2 };

/**
 * Renders a responsive grid of ReportKPICard components.
 * Pass an array of `items` (one per card) and optionally control column count.
 */
const ReportSummaryGrid: React.FC<ReportSummaryGridProps> = ({
  items,
  mdCols = 3,
  loading = false,
  sx
}) => {
  const mdSize = mdColsMap[mdCols] ?? 4; // Grid size value (out of 12) per card

  return (
    <Grid container spacing={3} sx={{ mb: 5, ...sx }}>
      {items.map((item, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: mdSize, xl: mdSize }} key={index}>
          <ReportKPICard {...item} loading={loading} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ReportSummaryGrid;
