// useReportExport.ts – Custom hook encapsulating report export logic (XLSX/CSV/PDF)
import { useCallback } from 'react';
import api from '../../../services/api';
import { formatLocalDate } from './constants';
import type { ReportFilters } from './types';
import type { ExportOptions } from './Ifrs9ReportExportDialog';

export interface UseReportExportParams {
  reportType: string;
  filters: ReportFilters;
  exportOptions: ExportOptions;
  data: Record<string, unknown>[];
  filteredData: Record<string, unknown>[];
  supportsPagination: boolean;
  title: string;
  user: { fullName?: string; email?: string } | null;
  deferredSearchTerm: string;
  queryParams: Record<string, any>;
  setError: (error: string | null) => void;
  setExportLoading: (loading: boolean) => void;
  setExportDialogOpen: (open: boolean) => void;
}

export function useReportExport({
  reportType,
  filters,
  exportOptions,
  data,
  filteredData,
  supportsPagination,
  title,
  user,
  deferredSearchTerm,
  queryParams,
  setError,
  setExportLoading,
  setExportDialogOpen,
}: UseReportExportParams) {
  const handleExportExecute = useCallback(async () => {
    setExportLoading(true);
    setExportDialogOpen(false);

    try {
      type XLSXNamespace = typeof import('xlsx');
      const xlsxModule = (await import('xlsx')) as XLSXNamespace & { default?: XLSXNamespace };
      const XLSX: XLSXNamespace = xlsxModule.default ?? xlsxModule;
      const format = exportOptions.format as 'xlsx' | 'csv' | 'pdf';
      const scopeVal = exportOptions.scope as 'visible' | 'by_date' | 'date_range' | 'all_pages';

      const fetchReportPage = async (params: any) => {
        switch (reportType) {
          case 'nominative-report': return api.banking.ifrs9Reports.nominativeReport.get(params);
          case 'lifetime-pd-yearly': return api.banking.ifrs9Reports.lifetimePD.getYearly(params);
          case 'lifetime-pd-monthly': return api.banking.ifrs9Reports.lifetimePD.getMonthly(params);
          case 'lifetime-pd-account-details': return api.banking.ifrs9Reports.lifetimePD.getAccountDetails(params);
          case 'lifetime-lgd': return api.banking.ifrs9Reports.lifetimeLGD.get(params);
          case 'ead-model': return api.banking.ifrs9Reports.eadModel.get(params);
          case 'ecl-result': return api.banking.ifrs9Reports.eclResult.get(params);
          case 'ecl-movement': return api.banking.ifrs9Reports.eclMovement.get(params);
          case 'gca-movement': return api.banking.ifrs9Reports.gcaMovement.get(params);
          default: throw new Error(`Unsupported report type for export: ${reportType}`);
        }
      };

      const buildCurrentTableQueryParams = (processingDate: Date, page: number, limit: number) => {
        if (!supportsPagination) return {};
        return {
          ...queryParams,
          page,
          offset: (page - 1) * limit,
          limit,
          cursor: undefined,
          paginationMode: 'offset',
          search: deferredSearchTerm.trim() || undefined,
          prc_date: formatLocalDate(processingDate),
        };
      };

      const buildBaseParams = (processingDate: Date) => {
        const params: Record<string, any> = {
          prc_date: formatLocalDate(processingDate),
        };
        if (filters.segment_id) params.segment_id = filters.segment_id;
        if (filters.stage && (Array.isArray(filters.stage) ? filters.stage.length > 0 : true)) params.stage = filters.stage;
        if (filters.branch_code) params.branch_code = filters.branch_code;
        if (filters.group_segment) params.group_segment = filters.group_segment;
        if (filters.pd_config_id) params.pd_config_id = filters.pd_config_id;
        if (filters.pd_method) params.pd_method = filters.pd_method;
        if (filters.scalar_id) params.scalar_id = filters.scalar_id;
        if (typeof filters.fl_flag === 'boolean') params.fl_flag = filters.fl_flag;
        if (filters.lgd_config_id) params.lgd_config_id = filters.lgd_config_id;
        if (filters.lgd_method) params.lgd_method = filters.lgd_method;
        if (filters.model_id) params.model_id = filters.model_id;
        if (filters.ead_config_id) params.ead_config_id = filters.ead_config_id;
        return params;
      };

      const fetchAllRowsForDate = async (processingDate: Date) => {
        if (!supportsPagination) {
          const result = await fetchReportPage({
            ...buildBaseParams(processingDate),
            search: deferredSearchTerm.trim() || undefined,
          });
          const rows = Array.isArray(result?.data) ? result.data : [];
          return rows as Record<string, unknown>[];
        }

        const limit = 1000;
        const first = await fetchReportPage({
          ...buildBaseParams(processingDate),
          ...buildCurrentTableQueryParams(processingDate, 1, limit),
        });
        const firstRows = Array.isArray(first?.data) ? first.data : [];
        const totalPages = Math.max(1, Number(first?.pagination?.totalPages ?? 1));

        if (totalPages === 1) return firstRows as Record<string, unknown>[];

        const pages = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, idx) => {
            const page = idx + 2;
            return fetchReportPage({
              ...buildBaseParams(processingDate),
              ...buildCurrentTableQueryParams(processingDate, page, limit),
            });
          })
        );

        const restRows = pages.flatMap((p: any) => (Array.isArray(p?.data) ? p.data : []));
        return [...firstRows, ...restRows] as Record<string, unknown>[];
      };

      const buildHeaderT1 = (processingDate: Date | null) => [
        ['Report Name', title],
        ['Processing Date', processingDate ? formatLocalDate(processingDate) : 'N/A'],
        ['Segments', filters.segment_id ? String(filters.segment_id) : 'All'],
        ['LGD Config / Method', `${filters.lgd_config_id || 'N/A'} / ${filters.lgd_method || 'N/A'}`],
        ['Model Version / ID', `v1.2 / ${filters.model_id || 'DEFAULT'}`],
        ['Forward Looking', filters.fl_flag ? `ON (Scenario=${filters.scenario_id}; Scalar=${filters.scalar_id})` : 'OFF'],
        ['Last Calculation', new Date().toISOString()],
        ['Environment', 'Production'],
        ['Generated By', user?.fullName || user?.email || 'System'],
        ['Generated At', new Date().toLocaleString()],
        ['Notes', 'Confidential – Internal Use Only'],
        [],
      ];

      const addSheet = (workbook: import('xlsx').WorkBook, sheetTitle: string, processingDate: Date | null, rows: Record<string, unknown>[]) => {
        const headerT1 = buildHeaderT1(processingDate);
        const worksheet = XLSX.utils.aoa_to_sheet(headerT1);
        if (rows.length > 0) {
          XLSX.utils.sheet_add_json(worksheet, rows, { origin: 'A13' });
          const maxWidth = 30;
          const colWidths = Object.keys(rows[0] || {}).map((key) => ({
            wch: Math.min(maxWidth, Math.max(key.length, ...rows.map((row) => String((row as any)[key] ?? '').length))),
          }));
          worksheet['!cols'] = colWidths;
        }
        const safeName = sheetTitle.substring(0, 31).replace(/[/\\*?[\\]]/g, '');
        XLSX.utils.book_append_sheet(workbook, worksheet, safeName);
      };

      const createCombinedWorksheet = (rows: Record<string, unknown>[], processingDate: Date | null) => {
        const headerT1 = buildHeaderT1(processingDate);
        const worksheet = XLSX.utils.aoa_to_sheet(headerT1);
        if (rows.length > 0) {
          XLSX.utils.sheet_add_json(worksheet, rows, { origin: 'A13' });
        }
        return worksheet;
      };

      const workbook = XLSX.utils.book_new();
      let csvWorksheet: import('xlsx').WorkSheet | null = null;
      let pdfPayload: { title: string; rows: Record<string, unknown>[]; processingDate: Date | null } | null = null;

      if (scopeVal === 'date_range') {
        const from = exportOptions.fromDate;
        const to = exportOptions.toDate;
        if (!from || !to) throw new Error('Please select both From and To dates.');
        if (from > to) throw new Error('From date must be earlier than To date.');

        const start = new Date(from.getFullYear(), from.getMonth(), 1);
        const end = new Date(to.getFullYear(), to.getMonth(), 1);
        const dates: Date[] = [];

        for (let d = new Date(start); d <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
          const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
          dates.push(monthEnd);
        }

        if (format === 'xlsx') {
          for (const processingDate of dates) {
            const rows = await fetchAllRowsForDate(processingDate);
            addSheet(workbook, formatLocalDate(processingDate), processingDate, rows);
          }
        } else {
          const combined: Record<string, unknown>[] = [];
          for (const processingDate of dates) {
            const rows = await fetchAllRowsForDate(processingDate);
            for (const row of rows) {
              combined.push({ processing_date: formatLocalDate(processingDate), ...row });
            }
          }
          csvWorksheet = createCombinedWorksheet(combined, null);
          pdfPayload = { title, rows: combined, processingDate: null };
        }
      } else if (scopeVal === 'visible') {
        const visibleRows = supportsPagination ? data : filteredData;
        if (visibleRows.length === 0) throw new Error('No data to export.');
        if (format === 'xlsx') {
          addSheet(workbook, title, filters.prc_date, visibleRows);
        } else {
          csvWorksheet = createCombinedWorksheet(visibleRows, filters.prc_date);
          pdfPayload = { title, rows: visibleRows, processingDate: filters.prc_date };
        }
      } else {
        if (!filters.prc_date) throw new Error('Please select a processing date.');
        const rows = await fetchAllRowsForDate(filters.prc_date);
        if (rows.length === 0) throw new Error('No data to export for the selected date.');
        if (format === 'xlsx') {
          addSheet(workbook, title, filters.prc_date, rows);
        } else {
          csvWorksheet = createCombinedWorksheet(rows, filters.prc_date);
          pdfPayload = { title, rows, processingDate: filters.prc_date };
        }
      }

      const dateStr = filters.prc_date ? formatLocalDate(filters.prc_date) : formatLocalDate(new Date());
      const filename = `${reportType}-${dateStr}-export`;

      if (format === 'xlsx') {
        const arrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([arrayBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const sheet =
          csvWorksheet ||
          (workbook.SheetNames.length > 0 ? workbook.Sheets[workbook.SheetNames[0]] : null);
        if (!sheet) throw new Error('No export data available.');

        const csv = XLSX.utils.sheet_to_csv(sheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        if (!pdfPayload) throw new Error('No export data available.');

        const jspdfModule: any = await import('jspdf');
        const jsPDF = jspdfModule?.jsPDF ?? jspdfModule?.default;
        if (!jsPDF) throw new Error('PDF export library not available.');

        const autoTableModule: any = await import('jspdf-autotable');
        const autoTable = autoTableModule?.default ?? autoTableModule;

        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'pt',
          format: 'a4',
        });

        const headerLines = buildHeaderT1(pdfPayload.processingDate)
          .filter((row) => Array.isArray(row) && row.length >= 2 && row[0])
          .map((row) => `${String(row[0])}: ${String(row[1] ?? '')}`);

        doc.setFontSize(16);
        doc.text('Export Report', 40, 40);
        doc.setFontSize(10);
        let y = 60;
        for (const line of headerLines) {
          doc.text(line, 40, y);
          y += 14;
          if (y > 140) break;
        }

        const rows = pdfPayload.rows;
        if (rows.length === 0) {
          doc.text('No data available.', 40, y + 20);
        } else {
          const allKeys = Array.from(
            rows.reduce((set, row) => {
              Object.keys(row).forEach((k) => set.add(k));
              return set;
            }, new Set<string>())
          );

          const head = [allKeys.map((k) => k.replace(/_/g, ' ').toUpperCase())];
          const body = rows.map((row) => allKeys.map((k) => String((row as any)[k] ?? '')));

          autoTable(doc, {
            head,
            body,
            startY: Math.max(120, y + 10),
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { fillColor: [25, 118, 210] },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            margin: { left: 40, right: 40 },
          });
        }

        doc.save(`${filename}.pdf`);
      }
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExportLoading(false);
    }
  }, [exportOptions, reportType, filters, data, filteredData, supportsPagination, title, user, deferredSearchTerm, queryParams, setError, setExportLoading, setExportDialogOpen]);

  return handleExportExecute;
}
