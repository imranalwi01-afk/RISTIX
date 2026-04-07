// packages/frontend/src/app/banking/ifrs9/impairment/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  FilterList as FilterListIcon,
  GetApp as ExportIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';
import { useAuth } from '@/providers/AuthProvider';
import { individualImpairmentAPI, type IndividualImpairmentWatchlistItem } from '@/services/api.individual-impairment';
import {
  ImpairmentCalculationDialog,
  ImpairmentDetailsDialog,
  ImpairmentOverviewPanel,
  type ImpairmentAnalytics,
  type SortConfig,
  type SortField,
} from './components';

// ============================================================================
// TYPESCRIPT INTERFACES FOR IFRS9 IMPAIRMENT DATA
// ============================================================================

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`impairment-tabpanel-${index}`}
      aria-labelledby={`impairment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children as any}</Box>}
    </div>
  );
}

export default function ImpairmentPage() {
  const { user } = useAuth();

  // Data loading states
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<IndividualImpairmentWatchlistItem[]>([]);
  const [analytics, setAnalytics] = useState<ImpairmentAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  // UI states
  const [selectedTab, setSelectedTab] = useState(0);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IndividualImpairmentWatchlistItem | null>(null);
  const [calculationDialogOpen, setCalculationDialogOpen] = useState(false);

  // Pagination and filtering
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<number | 'all'>('all');
  const [impairedFilter, setImpairedFilter] = useState<'all' | 'I' | 'N'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Column-wise filters (matching legacy DataTables functionality)
  const [columnFilters, setColumnFilters] = useState({
    account_number: '',
    cif_name: '',
    rating_code: '',
    currency: ''
  });
  const [columnFiltersEnabled, setColumnFiltersEnabled] = useState(false);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'account_number',
    order: 'asc'
  });

  // Export menu state
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [exportLoading, setExportLoading] = useState(false);

  // ============================================================================
  // DATA LOADING WITH REAL API INTEGRATION
  // ============================================================================

  const loadData = useCallback(async (page = 1, reset = false) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading IFRS9 Impairment watchlist from FRS9PRO database...');

      const params = {
        page: reset ? 1 : page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        filter: {
          ...(stageFilter !== 'all' && { stage: stageFilter }),
          ...(impairedFilter !== 'all' && { impaired_flag: impairedFilter }),
          ...(statusFilter !== 'all' && { assessment_status: statusFilter }),
          ...(columnFilters.account_number && { account_number: columnFilters.account_number }),
          ...(columnFilters.cif_name && { cif_name: columnFilters.cif_name }),
          ...(columnFilters.rating_code && { rating_code: columnFilters.rating_code }),
          ...(columnFilters.currency && { currency: columnFilters.currency })
        },
        sort: {
          field: sortConfig.field,
          order: sortConfig.order
        }
      };

      const result = await individualImpairmentAPI.watchlist.getAll(params);
      console.log('✅ FRS9PRO data loaded:', {
        count: result.data?.length || 0,
        total: result.pagination?.total || 0
      });

      if (result.success !== false && result.data) {
        setData(result.data);
        setPagination(prev => ({
          ...prev,
          page: result.pagination?.page || page,
          total: result.pagination?.total || 0,
          totalPages: result.pagination?.totalPages || 1
        }));

        // Calculate analytics from the data
        const totalAccounts = result.data.length;
        const totalExposure = result.data.reduce((sum: number, item: any) => sum + (item.outstanding_balance || 0), 0);
        const impairedAccounts = result.data.filter((item: any) => item.impaired_flag === 'I').length;
        const impairedExposure = result.data
          .filter((item: any) => item.impaired_flag === 'I')
          .reduce((sum: number, item: any) => sum + (item.outstanding_balance || 0), 0);

        const stageDistribution = result.data.reduce((acc: Record<number, number>, item: any) => {
          acc[item.stage || 1] = (acc[item.stage || 1] || 0) + 1;
          return acc;
        }, {});

        const totalECL = result.data.reduce((sum: number, item: any) => sum + (item.ecl_amount || 0), 0);
        const averageECLRatio = totalExposure > 0 ? (totalECL / totalExposure) * 100 : 0;

        setAnalytics({
          totalAccounts,
          totalExposure,
          impairedAccounts,
          impairedExposure,
          stageDistribution,
          averageECLRatio,
          totalProvision: totalECL
        });
      } else {
        throw new Error(result.message || 'Failed to load impairment data');
      }
    } catch (error) {
      console.error('❌ Error loading impairment data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load impairment data');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, searchTerm, stageFilter, impairedFilter, statusFilter, columnFilters, sortConfig]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  useEffect(() => {
    loadData();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    if (pagination.page > 1) {
      loadData(1, true);
    } else {
      loadData(1, true);
    }
  }, [searchTerm, stageFilter, impairedFilter, statusFilter, sortConfig, columnFilters]);

  const handleViewDetails = useCallback((record: IndividualImpairmentWatchlistItem) => {
    setSelectedRecord(record);
    setDetailsDialogOpen(true);
  }, []);

  const handleRunCalculation = useCallback(() => {
    setCalculationDialogOpen(true);
  }, []);

  const handleRefresh = useCallback(() => {
    loadData(pagination.page, true);
  }, [loadData, pagination.page]);

  const handleSort = useCallback((field: SortField) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleExport = async (format: 'xlsx' | 'csv') => {
    setExportLoading(true);
    setExportMenuAnchor(null);

    try {
      console.log(`📤 Exporting IFRS9 Impairment watchlist as ${format}`);

      const filters = {
        search: searchTerm,
        stage: stageFilter !== 'all' ? stageFilter : undefined,
        impaired_flag: impairedFilter !== 'all' ? impairedFilter : undefined,
        assessment_status: statusFilter !== 'all' ? statusFilter : undefined,
        ...columnFilters
      };

      const result = await individualImpairmentAPI.watchlist.export(format, filters);

      if (result.success !== false && result.download_url) {
        // Download the file
        const link = document.createElement('a');
        link.href = result.download_url;
        link.download = `ifrs9-impairment-watchlist.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log(`✅ Successfully exported ${format} file`);
      } else {
        throw new Error(result.message || 'Export failed');
      }
    } catch (error) {
      console.error(`❌ Error exporting ${format}:`, error);
      setError(error instanceof Error ? error.message : `Failed to export ${format}`);
    } finally {
      setExportLoading(false);
    }
  };

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStageFilter('all');
    setImpairedFilter('all');
    setStatusFilter('all');
    setColumnFilters({
      account_number: '',
      cif_name: '',
      rating_code: '',
      currency: ''
    });
    setColumnFiltersEnabled(false);
  }, []);

  const toggleColumnFilters = useCallback(() => {
    setColumnFiltersEnabled(!columnFiltersEnabled);
    if (columnFiltersEnabled) {
      // Clear column filters when disabling
      setColumnFilters({
        account_number: '',
        cif_name: '',
        rating_code: '',
        currency: ''
      });
    }
  }, [columnFiltersEnabled]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const formatCurrency = (amount: number, currency: string = 'IDR') => {
    if (!amount || amount === 0) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getImpairedColor = (impairedFlag: string) => {
    switch (impairedFlag) {
      case 'I': return 'error';
      case 'N': return 'success';
      default: return 'default';
    }
  };

  const getStageColor = (stage: number) => {
    switch (stage) {
      case 1: return 'success';
      case 2: return 'warning';
      case 3: return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'error';
      case 'CRITICAL': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'warning';
      case 'PENDING': return 'info';
      case 'REVIEWED': return 'primary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading IFRS9 Impairment data from FRS9PRO database...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          IFRS 9 Impairment Assessment
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={toggleColumnFilters}
            sx={{ mr: 2 }}
            color={columnFiltersEnabled ? 'primary' : 'inherit'}
          >
            Column Filters
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            sx={{ mr: 2 }}
            disabled={exportLoading}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<CalculateIcon />}
            onClick={handleRunCalculation}
          >
            Run Calculation
          </Button>
        </Box>
      </Box>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuList>
          <MenuItemComponent onClick={() => handleExport('xlsx')} disabled={exportLoading}>
            <ListItemIcon>
              <DownloadIcon />
            </ListItemIcon>
            <ListItemText>Export as Excel (.xlsx)</ListItemText>
          </MenuItemComponent>
          <MenuItemComponent onClick={() => handleExport('csv')} disabled={exportLoading}>
            <ListItemIcon>
              <DownloadIcon />
            </ListItemIcon>
            <ListItemText>Export as CSV (.csv)</ListItemText>
          </MenuItemComponent>
        </MenuList>
      </Menu>

      {/* Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        This page shows IFRS 9 impairment assessment results from FRS9PRO database including ECL calculations and provisioning.
        Last refresh: {new Date().toLocaleString()}
      </Alert>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
          <Tab label="Impairment Overview" icon={<AssessmentIcon />} />
          <Tab label="Stage Analysis" icon={<TrendingUpIcon />} />
          <Tab label="ECL Calculations" icon={<CalculateIcon />} />
          <Tab label="Provisioning" icon={<WarningIcon />} />
        </Tabs>
      </Box>

      {/* Tab 1: Impairment Overview */}
      <TabPanel value={selectedTab} index={0}>
        <ImpairmentOverviewPanel
          analytics={analytics}
          data={data}
          pagination={pagination}
          searchTerm={searchTerm}
          stageFilter={stageFilter}
          impairedFilter={impairedFilter}
          statusFilter={statusFilter}
          columnFilters={columnFilters}
          columnFiltersEnabled={columnFiltersEnabled}
          sortConfig={sortConfig}
          onSearchTermChange={setSearchTerm}
          onStageFilterChange={setStageFilter}
          onImpairedFilterChange={setImpairedFilter}
          onStatusFilterChange={setStatusFilter}
          onColumnFilterChange={(key, value) => setColumnFilters((prev) => ({ ...prev, [key]: value }))}
          onClearFilters={clearFilters}
          onSort={handleSort}
          onViewDetails={handleViewDetails}
          onPreviousPage={() => loadData(pagination.page - 1)}
          onNextPage={() => loadData(pagination.page + 1)}
          formatCurrency={formatCurrency}
          getStageColor={getStageColor}
          getImpairedColor={getImpairedColor}
          getStatusColor={getStatusColor}
        />
      </TabPanel>

      {/* Tab 2: Stage Analysis */}
      <TabPanel value={selectedTab} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Stage Movement Analysis
            </Typography>
            <Alert severity="info">
              Stage movement analysis and transition tracking will be available here.
            </Alert>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 3: ECL Calculations */}
      <TabPanel value={selectedTab} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Expected Credit Loss Calculations
            </Typography>
            <Alert severity="info">
              Detailed ECL calculation methodology and results will be displayed here.
            </Alert>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 4: Provisioning */}
      <TabPanel value={selectedTab} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Provisioning Analysis
            </Typography>
            <Alert severity="info">
              Provision calculation and analysis will be available here.
            </Alert>
          </CardContent>
        </Card>
      </TabPanel>

      <ImpairmentDetailsDialog
        open={detailsDialogOpen}
        selectedRecord={selectedRecord}
        onClose={() => setDetailsDialogOpen(false)}
        formatCurrency={formatCurrency}
      />

      <ImpairmentCalculationDialog
        open={calculationDialogOpen}
        onClose={() => setCalculationDialogOpen(false)}
      />
    </Box>
  );
}
