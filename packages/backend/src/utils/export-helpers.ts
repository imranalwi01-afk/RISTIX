// packages/backend/src/utils/export-helpers.ts
// ============================================================================
// EXPORT HELPER UTILITIES
// ============================================================================
// Purpose: Generate Excel, PDF, and CSV files from data
// Formats: XLSX (with ExcelJS), PDF (with PDFKit), CSV (native)
// ============================================================================

import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  type?: 'text' | 'number' | 'currency' | 'date' | 'percentage';
  format?: string;
}

export interface ExportOptions {
  title?: string;
  columns: ExportColumn[];
  data: any[];
  includeFilters?: boolean;
  filters?: Record<string, any>;
  includeTimestamp?: boolean;
  author?: string;
}

export interface SummaryStats {
  label: string;
  value: string | number;
}

// ============================================================================
// EXCEL EXPORT HELPERS
// ============================================================================

export async function generateExcelBuffer(options: ExportOptions): Promise<Buffer> {
  const { title = 'Export', columns, data, includeFilters, filters, includeTimestamp, author } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = author || 'IFRS9 System';
  workbook.created = new Date();

  // Create main data sheet
  const worksheet = workbook.addWorksheet('Data');

  // Add title
  worksheet.mergeCells('A1', `${String.fromCharCode(64 + columns.length)}1`);
  const titleCell = worksheet.getCell('A1');
  titleCell.value = title;
  titleCell.font = { size: 16, bold: true, color: { argb: 'FF1976D2' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 30;

  // Add timestamp if requested
  let currentRow = 2;
  if (includeTimestamp) {
    worksheet.mergeCells(`A${currentRow}`, `${String.fromCharCode(64 + columns.length)}${currentRow}`);
    const timestampCell = worksheet.getCell(`A${currentRow}`);
    timestampCell.value = `Generated: ${new Date().toLocaleString('id-ID')}`;
    timestampCell.font = { size: 10, italic: true };
    timestampCell.alignment = { horizontal: 'right' };
    currentRow++;
  }

  // Add filters if requested
  if (includeFilters && filters) {
    worksheet.mergeCells(`A${currentRow}`, `${String.fromCharCode(64 + columns.length)}${currentRow}`);
    const filterCell = worksheet.getCell(`A${currentRow}`);
    const filterText = Object.entries(filters)
      .filter(([_, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ');
    filterCell.value = `Filters: ${filterText || 'None'}`;
    filterCell.font = { size: 9, italic: true };
    currentRow++;
  }

  // Add empty row
  currentRow++;

  // Add headers
  const headerRow = worksheet.getRow(currentRow);
  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1976D2' }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  headerRow.height = 25;
  currentRow++;

  // Add data rows
  data.forEach((row) => {
    const dataRow = worksheet.getRow(currentRow);
    columns.forEach((col, idx) => {
      const cell = dataRow.getCell(idx + 1);
      const value = row[col.key];

      // Format based on column type
      if (col.type === 'currency') {
        cell.value = typeof value === 'number' ? value : 0;
        cell.numFmt = '#,##0';
      } else if (col.type === 'number') {
        cell.value = typeof value === 'number' ? value : 0;
        cell.numFmt = '#,##0.00';
      } else if (col.type === 'percentage') {
        cell.value = typeof value === 'number' ? value / 100 : 0;
        cell.numFmt = '0.00%';
      } else if (col.type === 'date') {
        cell.value = value ? new Date(value) : '';
        cell.numFmt = 'dd/mm/yyyy';
      } else {
        cell.value = value || '';
      }

      // Add border
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
      };
    });
    currentRow++;
  });

  // Set column widths
  columns.forEach((col, idx) => {
    worksheet.getColumn(idx + 1).width = col.width || 15;
  });

  // Add auto-filter
  worksheet.autoFilter = {
    from: { row: includeTimestamp ? 4 : 3, column: 1 },
    to: { row: includeTimestamp ? 4 : 3, column: columns.length }
  };

  // Freeze header row
  worksheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: includeTimestamp ? 4 : 3 }
  ];

  // Generate buffer
  return await workbook.xlsx.writeBuffer() as Buffer;
}

// ============================================================================
// PDF EXPORT HELPERS
// ============================================================================

export async function generatePDFBuffer(options: ExportOptions, summaryStats?: SummaryStats[]): Promise<Buffer> {
  const { title = 'Export', columns, data, includeTimestamp } = options;

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Add title
      doc.fontSize(18).fillColor('#1976D2').text(title, { align: 'center' });
      doc.moveDown(0.5);

      // Add timestamp
      if (includeTimestamp) {
        doc.fontSize(9).fillColor('#666666').text(
          `Generated: ${new Date().toLocaleString('id-ID')}`,
          { align: 'right' }
        );
        doc.moveDown(0.5);
      }

      // Add summary stats if provided
      if (summaryStats && summaryStats.length > 0) {
        doc.fontSize(10).fillColor('#000000');
        summaryStats.forEach((stat) => {
          doc.text(`${stat.label}: ${stat.value}`, { continued: false });
        });
        doc.moveDown(1);
      }

      // Calculate column widths
      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const colWidth = pageWidth / columns.length;

      // Add table header
      let yPosition = doc.y;
      doc.fontSize(9).fillColor('#FFFFFF');
      
      columns.forEach((col, idx) => {
        const xPosition = doc.page.margins.left + (idx * colWidth);
        doc.rect(xPosition, yPosition, colWidth, 20).fill('#1976D2');
        doc.fillColor('#FFFFFF').text(
          col.header,
          xPosition + 5,
          yPosition + 5,
          { width: colWidth - 10, align: 'left' }
        );
      });

      yPosition += 25;
      doc.fillColor('#000000');

      // Add data rows
      const rowHeight = 18;
      data.forEach((row, rowIdx) => {
        // Check if we need a new page
        if (yPosition > doc.page.height - doc.page.margins.bottom - 30) {
          doc.addPage();
          yPosition = doc.page.margins.top;
        }

        // Alternate row colors
        const bgColor = rowIdx % 2 === 0 ? '#F5F5F5' : '#FFFFFF';
        doc.rect(doc.page.margins.left, yPosition, pageWidth, rowHeight).fill(bgColor);

        doc.fontSize(8).fillColor('#000000');
        columns.forEach((col, idx) => {
          const xPosition = doc.page.margins.left + (idx * colWidth);
          let value = row[col.key] || '';

          // Format based on type
          if (col.type === 'currency' && typeof value === 'number') {
            value = new Intl.NumberFormat('id-ID').format(value);
          } else if (col.type === 'number' && typeof value === 'number') {
            value = value.toFixed(2);
          } else if (col.type === 'date' && value) {
            value = new Date(value).toLocaleDateString('id-ID');
          }

          doc.text(
            String(value),
            xPosition + 5,
            yPosition + 4,
            { width: colWidth - 10, align: 'left', lineBreak: false, ellipsis: true }
          );
        });

        yPosition += rowHeight;
      });

      // Add footer with page numbers
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor('#666666');
        doc.text(
          `Page ${i + 1} of ${range.count}`,
          doc.page.margins.left,
          doc.page.height - doc.page.margins.bottom + 10,
          { align: 'center' }
        );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// ============================================================================
// CSV EXPORT HELPERS
// ============================================================================

export function generateCSVBuffer(options: ExportOptions): Buffer {
  const { columns, data } = options;

  // Helper to escape CSV values
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Create header row
  const headerRow = columns.map(col => escapeCSV(col.header)).join(',');

  // Create data rows
  const dataRows = data.map(row => {
    return columns.map(col => {
      let value = row[col.key];

      // Format based on type
      if (col.type === 'date' && value) {
        value = new Date(value).toLocaleDateString('id-ID');
      }

      return escapeCSV(value);
    }).join(',');
  });

  // Combine all rows
  const csvContent = [headerRow, ...dataRows].join('\n');

  // Add UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  return Buffer.from(BOM + csvContent, 'utf-8');
}

// ============================================================================
// SUMMARY STATISTICS HELPERS
// ============================================================================

export function calculateSummaryStats(data: any[], config: {
  totalLabel?: string;
  countField?: string;
  sumFields?: { key: string; label: string; type?: 'currency' | 'number' }[];
}): SummaryStats[] {
  const stats: SummaryStats[] = [];

  // Total records
  stats.push({
    label: config.totalLabel || 'Total Records',
    value: data.length
  });

  // Sum fields
  if (config.sumFields) {
    config.sumFields.forEach(field => {
      const sum = data.reduce((acc, row) => {
        const value = row[field.key];
        return acc + (typeof value === 'number' ? value : 0);
      }, 0);

      let formattedValue: string;
      if (field.type === 'currency') {
        formattedValue = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0
        }).format(sum);
      } else {
        formattedValue = new Intl.NumberFormat('id-ID').format(sum);
      }

      stats.push({
        label: field.label,
        value: formattedValue
      });
    });
  }

  return stats;
}
