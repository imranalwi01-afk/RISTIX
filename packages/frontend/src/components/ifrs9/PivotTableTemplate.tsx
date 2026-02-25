// packages/frontend/src/components/ifrs9/PivotTableTemplate.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useBankingTheme } from '../../providers/BankingThemeProvider';

export interface PivotTableTemplateProps {
  /** Array of data records to display */
  data: Record<string, any>[];
  
  /** List of all columns to display in order */
  columns: string[];
  
  /** Regular expression used to distinguish dynamic/pivoted columns from base columns. Defaults to matching tenor/month/paym numbered columns */
  dynamicColumnPattern?: RegExp;
  
  /** Maximum number of rows to display before truncating (default is 100) */
  maxRows?: number;
  
  /** Function to format the header text for dynamic columns */
  formatDynamicHeader?: (col: string) => string;
  
  /** Function to format the header text for base columns */
  formatBaseHeader?: (col: string) => string;
  
  /** Function to format cell values for dynamic columns */
  formatDynamicCell?: (value: any) => React.ReactNode;
  
  /** Function to format cell values for base columns */
  formatBaseCell?: (value: any) => React.ReactNode;
  
  /** Maximum height of the table container (default is 600px) */
  maxHeight?: number | string;
}

const defaultDynamicColumnPattern = /^(tenor|month|paym|seq|seq_)_\d+$/i;
const defaultFormatDynamicHeader = (col: string) => col.replace(/^(tenor|month|paym|seq|seq_)_?/i, '').toUpperCase();
const defaultFormatBaseHeader = (col: string) => col.replace(/_/g, ' ').toUpperCase();
const defaultFormatDynamicCell = (value: any) => 
  value !== null && value !== undefined 
    ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(value)
    : '-';
const defaultFormatBaseCell = (value: any) => value?.toString() || '-';

/**
 * A reusable table component for rendering "pivoted" data, where base columns 
 * are stacked on the left, and dynamically generated columns (e.g. months, tenors)
 * spread to the right. Retains the premium banking dashboard styles.
 */
const PivotTableTemplate: React.FC<PivotTableTemplateProps> = ({
  data,
  columns,
  dynamicColumnPattern = defaultDynamicColumnPattern,
  maxRows = 100,
  formatDynamicHeader = defaultFormatDynamicHeader,
  formatBaseHeader = defaultFormatBaseHeader,
  formatDynamicCell = defaultFormatDynamicCell,
  formatBaseCell = defaultFormatBaseCell,
  maxHeight = 600
}) => {
  if (!data || data.length === 0) return null;

  const baseColumns = columns.filter(col => !col.match(dynamicColumnPattern));
  const dynamicColumns = columns.filter(col => col.match(dynamicColumnPattern));

  const finalBase = dynamicColumns.length > 0 ? baseColumns : columns;
  const finalDynamic = dynamicColumns.length > 0 ? dynamicColumns : [];

  const { bankingMode } = useBankingTheme();
  const headerBg = bankingMode === 'syariah' ? '#004d40' : bankingMode === 'dual' ? '#263238' : '#0D47A1';

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ maxHeight, overflow: 'auto', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: headerBg, color: 'white' }}>
            <tr>
              {finalBase.map(col => (
                <th key={col} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>
                  {formatBaseHeader(col)}
                </th>
              ))}
              {finalDynamic.map(col => (
                <th key={col} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, minWidth: 80 }}>
                  {formatDynamicHeader(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, maxRows).map((row, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: index % 2 === 0 ? 'white' : '#f9faff' }}>
                {finalBase.map(col => (
                  <td key={col} style={{ padding: '12px 16px' }}>
                    {formatBaseCell(row[col])}
                  </td>
                ))}
                {finalDynamic.map(col => (
                  <td key={col} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                    {formatDynamicCell(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      {data.length > maxRows && (
        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary', textAlign: 'center' }}>
          Showing first {maxRows} rows. Export to see full data.
        </Typography>
      )}
    </Box>
  );
};

export default PivotTableTemplate;
