// packages/frontend/src/utils/exportUtils.ts
// ============================================================================
// Export Utilities for Product Parameters
// Supports: XLSX, CSV (native), PDF (simplified)
// NO EXTERNAL DEPENDENCIES - Uses native browser APIs
// ============================================================================

export interface ExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
  exportedBy?: string;
  filters?: Record<string, any>;
  modelVersion?: string;
  confidential?: boolean;
}

/**
 * Generate audit-ready export header (T1 Template)
 */
export function generateExportHeader(options: ExportOptions = {}): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  const timeStr = now.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  const filtersStr = options.filters 
    ? Object.entries(options.filters)
        .filter(([_, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `${k}=${v}`)
        .join('; ')
    : 'None';

  return `
------------------------------------------------
Report Name : ${options.title || 'Product Parameters'}
Exported At : ${dateStr}, ${timeStr} WIB
Exported By : ${options.exportedBy || 'System User'}
Filters     : ${filtersStr}
Model Ver.  : ${options.modelVersion || 'v1.0.0'}
Notes       : ${options.confidential ? 'Confidential – Internal Use Only' : 'For Review'}
------------------------------------------------
`.trim();
}

/**
 * Export to XLSX (using CSV with .xlsx extension - Excel can open it)
 * This is a simplified approach without external dependencies
 */
export function exportToXLSX<T extends Record<string, any>>(
  data: T[],
  columns: { field: string; headerName: string }[],
  options: ExportOptions = {}
) {
  try {
    const header = generateExportHeader(options);
    
    // Prepare column headers
    const colHeaders = columns.map(col => col.headerName).join('\t');
    
    // Prepare data rows
    const dataRows = data.map(row => 
      columns.map(col => {
        const value = row[col.field];
        let formattedValue = '';
        
        if (typeof value === 'boolean') formattedValue = value ? 'Yes' : 'No';
        else if (value instanceof Date) formattedValue = value.toLocaleDateString('id-ID');
        else formattedValue = value ?? '-';
        
        // Escape tabs and newlines
        const strValue = String(formattedValue);
        return strValue.replace(/\t/g, ' ').replace(/\n/g, ' ');
      }).join('\t')
    ).join('\n');
    
    // Combine all (Tab-separated for Excel compatibility)
    const content = `${header.replace(/\n/g, '\n')}\n\n${colHeaders}\n${dataRows}`;
    
    // Create blob and download
    const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${options.filename || 'export'}_${new Date().getTime()}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    
    return { success: true, filename: link.download };
  } catch (error) {
    console.error('Export to XLSX failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Export failed' };
  }
}

/**
 * Export to CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: { field: string; headerName: string }[],
  options: ExportOptions = {}
) {
  try {
    const header = generateExportHeader(options);
    
    // Prepare column headers
    const colHeaders = columns.map(col => col.headerName).join(',');
    
    // Prepare data rows
    const dataRows = data.map(row => 
      columns.map(col => {
        const value = row[col.field];
        let formattedValue = '';
        
        if (typeof value === 'boolean') formattedValue = value ? 'Yes' : 'No';
        else if (value instanceof Date) formattedValue = value.toLocaleDateString('id-ID');
        else formattedValue = value ?? '-';
        
        // Escape commas and quotes
        const strValue = String(formattedValue);
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      }).join(',')
    ).join('\n');
    
    // Combine all
    const csv = `# ${header.replace(/\n/g, '\n# ')}\n\n${colHeaders}\n${dataRows}`;
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${options.filename || 'export'}_${new Date().getTime()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    return { success: true, filename: link.download };
  } catch (error) {
    console.error('Export to CSV failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Export failed' };
  }
}

/**
 * Export to PDF (simplified - creates HTML that can be printed to PDF)
 */
export function exportToPDF<T extends Record<string, any>>(
  data: T[],
  columns: { field: string; headerName: string }[],
  options: ExportOptions = {}
) {
  try {
    const header = generateExportHeader(options);
    
    // Create HTML page
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${options.title || 'Export'}</title>
  <style>
    @page { 
      size: landscape;
      margin: 1cm;
    }
    body {
      font-family: 'Courier New', monospace;
      font-size: 10px;
      margin: 0;
      padding: 20px;
    }
    .header {
      white-space: pre;
      font-size: 8px;
      margin-bottom: 20px;
      border: 1px solid #ccc;
      padding: 10px;
      background: #f9f9f9;
    }
    h1 {
      font-size: 14px;
      margin: 0 0 10px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 6px;
      text-align: left;
    }
    th {
      background-color: #2980b9;
      color: white;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">${header}</div>
  <h1>${options.title || 'Product Parameters'}</h1>
  <table>
    <thead>
      <tr>
        ${columns.map(col => `<th>${col.headerName}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.map(row => `
        <tr>
          ${columns.map(col => {
            const value = row[col.field];
            let formattedValue = '';
            if (typeof value === 'boolean') formattedValue = value ? 'Yes' : 'No';
            else if (value instanceof Date) formattedValue = value.toLocaleDateString('id-ID');
            else formattedValue = value ?? '-';
            return `<td>${String(formattedValue)}</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
  <script>
    // Auto print dialog
    window.onload = () => {
      setTimeout(() => {
        window.print();
        setTimeout(() => window.close(), 500);
      }, 500);
    };
  </script>
</body>
</html>
    `.trim();
    
    // Open in new window for print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      return { success: true, filename: `${options.filename || 'export'}.pdf` };
    } else {
      throw new Error('Failed to open print window. Please allow popups for this site.');
    }
    
  } catch (error) {
    console.error('Export to PDF failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Export failed' };
  }
}

/**
 * Get current user info from localStorage (for non-React contexts).
 * Returns the display name or username of the currently authenticated user.
 */
export function getCurrentUser(): string {
  try {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        return user.fullName || user.displayName || user.username || user.email || 'System User';
      }
    }
  } catch {
    // Ignore parse errors
  }
  return 'System User';
}
