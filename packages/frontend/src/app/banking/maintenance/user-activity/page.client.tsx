'use client';
// packages/frontend/src/app/banking/maintenance/user-activity/page.tsx

import React, { useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import Tooltip from '@mui/material/Tooltip'
import Avatar from '@mui/material/Avatar'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Badge from '@mui/material/Badge'
import LinearProgress from '@mui/material/LinearProgress'
import Divider from '@mui/material/Divider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { GridColDef, GridRowParams, GridValueGetter, GridRenderCellParams } from '@mui/x-data-grid';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import VisibilityIcon from '@mui/icons-material/Visibility'
import DownloadIcon from '@mui/icons-material/Download'
import RefreshIcon from '@mui/icons-material/Refresh'
import FilterListIcon from '@mui/icons-material/FilterList'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AssignmentIcon from '@mui/icons-material/Assignment'
import SecurityIcon from '@mui/icons-material/Security'
import WarningIcon from '@mui/icons-material/Warning'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import ScheduleIcon from '@mui/icons-material/Schedule'
import PersonIcon from '@mui/icons-material/Person'
import ComputerIcon from '@mui/icons-material/Computer'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import TimelineIcon from '@mui/icons-material/Timeline'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import { useTheme } from '@mui/material/styles';
import { format, parseISO, subDays, startOfDay, endOfDay } from 'date-fns';
import { exportToCSV, exportToPDF, exportToXLSX } from '@/utils/exportUtils';
import { getErrorMessage } from '@/utils/error-message';
import { useAuth } from '@/providers/AuthProvider';
import { useEnterpriseTableQuery } from '@/hooks/useEnterpriseTableQuery';
import { useSavedTableView } from '@/hooks/useSavedTableView';
import { useUserActivitiesQuery } from '@/features/user-activity/hooks/useUserActivityQueries';
import type { EnterpriseColumnFilterValue, EnterpriseSort } from '@/types/enterprise-table';

// Types and Interfaces
interface UserActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  sessionId: string;
  activityType: string;
  actionPerformed: string;
  targetEntity?: string;
  targetId?: string;
  pageUrl?: string;
  moduleAccessed?: string;
  actionResult: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  errorMessage?: string;
  responseTimeMs?: number;
  ipAddress: string;
  userAgent: string;
  location?: string;
  deviceType: string;
  browserName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  bankingType?: 'conventional';
  complianceRelevant: boolean;
  businessProcess?: string;
  timestamp: string;
  duration?: number;
  metadata?: any;
}

interface UserActivityFilters {
  userId?: string;
  activityType?: string;
  actionResult?: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  bankingType?: 'conventional';
  complianceRelevant?: boolean;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  moduleAccessed?: string;
  ipAddress?: string;
  searchTerm?: string;
}

interface ActivityStatistics {
  totalActivities: number;
  successfulActivities: number;
  failedActivities: number;
  partialActivities: number;
  criticalRiskActivities: number;
  highRiskActivities: number;
  uniqueUsers: number;
  uniqueSessions: number;
  avgResponseTime: number;
  complianceRelevantActivities: number;
  topModules: { module: string; count: number }[];
  topUsers: { userId: string; userName: string; count: number }[];
  hourlyDistribution: { hour: number; count: number }[];
  riskDistribution: { risk: string; count: number }[];
}

const USER_ACTIVITY_EXPORT_COLUMNS = [
  { field: 'timestamp', headerName: 'Timestamp' },
  { field: 'userName', headerName: 'User Name' },
  { field: 'userEmail', headerName: 'User Email' },
  { field: 'activityType', headerName: 'Activity Type' },
  { field: 'actionPerformed', headerName: 'Action' },
  { field: 'moduleAccessed', headerName: 'Module' },
  { field: 'actionResult', headerName: 'Result' },
  { field: 'riskLevel', headerName: 'Risk Level' },
  { field: 'bankingType', headerName: 'Banking Type' },
  { field: 'ipAddress', headerName: 'IP Address' },
  { field: 'responseTimeMs', headerName: 'Response Time (ms)' },
  { field: 'complianceRelevant', headerName: 'Compliance Relevant' },
] as const;

const normalizeActivityFilterValue = (value: EnterpriseColumnFilterValue) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (Array.isArray(value)) return value.join(' ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const getActivityFieldValue = (row: UserActivityLog, field: string): EnterpriseColumnFilterValue => {
  const record = row as unknown as Record<string, unknown>;
  return record[field] as EnterpriseColumnFilterValue;
};

const compareActivityValues = (left: unknown, right: unknown) => {
  if (left === right) return 0;
  if (left === null || left === undefined) return 1;
  if (right === null || right === undefined) return -1;

  const leftNumber = typeof left === 'number' ? left : Number(left);
  const rightNumber = typeof right === 'number' ? right : Number(right);
  if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
    return leftNumber - rightNumber;
  }

  const leftDate = left instanceof Date ? left.getTime() : Date.parse(String(left));
  const rightDate = right instanceof Date ? right.getTime() : Date.parse(String(right));
  if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
    return leftDate - rightDate;
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
};

const applyActivityTableQuery = (
  rows: UserActivityLog[],
  columnFilters: Record<string, EnterpriseColumnFilterValue>,
  sort: EnterpriseSort[],
) => {
  const activeFilters = Object.entries(columnFilters).filter(([, value]) => normalizeActivityFilterValue(value).trim().length > 0);
  const filteredRows = activeFilters.length === 0
    ? rows
    : rows.filter((row) =>
        activeFilters.every(([field, value]) =>
          normalizeActivityFilterValue(getActivityFieldValue(row, field)).toLowerCase().includes(normalizeActivityFilterValue(value).toLowerCase())
        )
      );

  const activeSort = sort[0];
  if (!activeSort) return filteredRows;

  return [...filteredRows].sort((leftRow, rightRow) => {
    const leftValue = getActivityFieldValue(leftRow, activeSort.field);
    const rightValue = getActivityFieldValue(rightRow, activeSort.field);
    const result = compareActivityValues(leftValue, rightValue);
    return activeSort.direction === 'asc' ? result : -result;
  });
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`user-activity-tabpanel-${index}`}
    aria-labelledby={`user-activity-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children as any}</Box>}
  </div>
);

export default function PageContent({ params }: { params: Promise<{}> }) {
  void params; // required by typed routes signature, unused in this page
  const theme = useTheme();
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserActivityFilters>({
    dateFrom: subDays(new Date(), 7),
    dateTo: new Date(),
  });
  const {
    queryState,
    setPaginationModel,
    setColumnVisibilityModel,
    setDensity,
    setColumnFilters,
    setSort,
    applySavedView,
    toSavedViewState,
    resetView,
  } = useEnterpriseTableQuery({
    pageKey: 'maintenance:user-activity',
    paginationMode: 'offset',
    initialPageSize: 25,
    syncUrl: true,
  });
  const savedView = useSavedTableView({
    userId: user?.id,
    scope: 'maintenance:user-activity',
    enabled: Boolean(user?.id),
    onApplyView: (view) => {
      applySavedView(view);
      const savedFilters = (view.state.filters ?? {}) as Record<string, unknown>;
      setFilters({
        userId: typeof savedFilters.userId === 'string' ? savedFilters.userId : undefined,
        activityType: typeof savedFilters.activityType === 'string' ? savedFilters.activityType : undefined,
        actionResult: savedFilters.actionResult === 'SUCCESS' || savedFilters.actionResult === 'FAILURE' || savedFilters.actionResult === 'PARTIAL'
          ? savedFilters.actionResult
          : undefined,
        riskLevel: savedFilters.riskLevel === 'LOW' || savedFilters.riskLevel === 'MEDIUM' || savedFilters.riskLevel === 'HIGH' || savedFilters.riskLevel === 'CRITICAL'
          ? savedFilters.riskLevel
          : undefined,
        bankingType: savedFilters.bankingType === 'conventional' || false
          ? savedFilters.bankingType
          : undefined,
        complianceRelevant: typeof savedFilters.complianceRelevant === 'boolean' ? savedFilters.complianceRelevant : undefined,
        dateFrom: typeof savedFilters.dateFrom === 'string' ? new Date(savedFilters.dateFrom) : subDays(new Date(), 7),
        dateTo: typeof savedFilters.dateTo === 'string' ? new Date(savedFilters.dateTo) : new Date(),
        moduleAccessed: typeof savedFilters.moduleAccessed === 'string' ? savedFilters.moduleAccessed : undefined,
        ipAddress: typeof savedFilters.ipAddress === 'string' ? savedFilters.ipAddress : undefined,
        searchTerm: typeof view.state.search === 'string' ? view.state.search : '',
      });
    },
  });

  // Dialog states
  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean;
    activity: UserActivityLog | null;
  }>({
    open: false,
    activity: null,
  });

  const [exportDialog, setExportDialog] = useState(false);
  const activitiesQuery = useUserActivitiesQuery({
    userId: filters.userId,
    activityType: filters.activityType,
    actionResult: filters.actionResult,
    riskLevel: filters.riskLevel,
    bankingType: filters.bankingType,
    complianceRelevant: filters.complianceRelevant,
    moduleAccessed: filters.moduleAccessed,
    ipAddress: filters.ipAddress,
    dateFrom: filters.dateFrom ?? undefined,
    dateTo: filters.dateTo ?? undefined,
    searchTerm: filters.searchTerm,
    limit: queryState.paginationModel.pageSize,
    offset: queryState.paginationModel.page * queryState.paginationModel.pageSize,
  });
  const activities = useMemo(
    () => (activitiesQuery.data?.rows ?? []) as UserActivityLog[],
    [activitiesQuery.data?.rows],
  );
  const totalActivities = useMemo(
    () => activitiesQuery.data?.pagination?.total ?? 0,
    [activitiesQuery.data?.pagination?.total],
  );
  const statistics = useMemo(
    () => (activitiesQuery.data?.statistics ?? null) as ActivityStatistics | null,
    [activitiesQuery.data?.statistics],
  );
  const loading = activitiesQuery.isLoading || activitiesQuery.isFetching;

  React.useEffect(() => {
    if (activitiesQuery.error) {
      setError(getErrorMessage(activitiesQuery.error, 'Failed to fetch user activities. Please try again.'));
      return;
    }
    setError(null);
  }, [activitiesQuery.error]);

  const tableRows = useMemo(
    () => applyActivityTableQuery(activities, queryState.columnFilters, queryState.sort),
    [activities, queryState.columnFilters, queryState.sort],
  );

  // Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleFilterChange = (field: keyof UserActivityFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = useCallback(async () => {
    setFilters({
      dateFrom: subDays(new Date(), 7),
      dateTo: new Date(),
    });
    resetView();
    setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
    if (savedView.hasSavedView) {
      await savedView.clearSavedView();
    }
  }, [queryState.paginationModel.pageSize, resetView, savedView, setPaginationModel]);

  const handleRefresh = () => {
    void activitiesQuery.refetch();
  };

  const handleViewDetails = (activity: UserActivityLog) => {
    setDetailsDialog({
      open: true,
      activity
    });
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const exportColumns = USER_ACTIVITY_EXPORT_COLUMNS.filter(
        (column) => queryState.columnVisibilityModel[column.field] !== false,
      );
      const exportFilters: Record<string, string> = {};
      if (filters.searchTerm) exportFilters.Search = filters.searchTerm;
      if (filters.activityType) exportFilters['Activity Type'] = filters.activityType;
      if (filters.actionResult) exportFilters.Result = filters.actionResult;
      if (filters.riskLevel) exportFilters['Risk Level'] = filters.riskLevel;
      if (filters.bankingType) exportFilters['Banking Type'] = filters.bankingType;
      if (filters.ipAddress) exportFilters['IP Address'] = filters.ipAddress;
      if (filters.dateFrom) exportFilters['From Date'] = filters.dateFrom.toISOString();
      if (filters.dateTo) exportFilters['To Date'] = filters.dateTo.toISOString();
      Object.entries(queryState.columnFilters).forEach(([field, value]) => {
        const normalizedValue = normalizeActivityFilterValue(value);
        if (normalizedValue.trim()) exportFilters[`Column: ${field}`] = normalizedValue;
      });

      const exportOptions = {
        title: 'User Activity Logs',
        filename: 'user_activity_logs',
        filters: exportFilters,
        confidential: true,
      };

      const result = format === 'csv'
        ? exportToCSV(tableRows, exportColumns, exportOptions)
        : format === 'excel'
          ? exportToXLSX(tableRows, exportColumns, exportOptions)
          : exportToPDF(tableRows, exportColumns, exportOptions);

      if (!result?.success) {
        throw new Error(result?.error || `Failed to export ${format}`);
      }

      setExportDialog(false);
      setError(null);
    } catch (error) {
      console.error('Export error:', error);
      setError(getErrorMessage(error, 'Failed to export user activities'));
    }
  };

  const handleSaveView = useCallback(async () => {
    if (!user?.id) return;
    const savedFilterState: Record<string, EnterpriseColumnFilterValue> = {};
    if (filters.userId) savedFilterState.userId = filters.userId;
    if (filters.activityType) savedFilterState.activityType = filters.activityType;
    if (filters.actionResult) savedFilterState.actionResult = filters.actionResult;
    if (filters.riskLevel) savedFilterState.riskLevel = filters.riskLevel;
    if (filters.bankingType) savedFilterState.bankingType = filters.bankingType;
    if (typeof filters.complianceRelevant === 'boolean') savedFilterState.complianceRelevant = filters.complianceRelevant;
    if (filters.dateFrom) savedFilterState.dateFrom = filters.dateFrom.toISOString();
    if (filters.dateTo) savedFilterState.dateTo = filters.dateTo.toISOString();
    if (filters.moduleAccessed) savedFilterState.moduleAccessed = filters.moduleAccessed;
    if (filters.ipAddress) savedFilterState.ipAddress = filters.ipAddress;

    await savedView.saveDefaultView({
      ...toSavedViewState(),
      search: filters.searchTerm || '',
      filters: {
        ...toSavedViewState().filters,
        ...savedFilterState,
      },
    });
  }, [filters, savedView, toSavedViewState, user?.id]);

  // Helper functions
  const getActionResultColor = (result: string) => {
    switch (result) {
      case 'SUCCESS': return 'success';
      case 'FAILURE': return 'error';
      case 'PARTIAL': return 'warning';
      default: return 'default';
    }
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'error';
      case 'CRITICAL': return 'error';
      default: return 'default';
    }
  };

  const getBankingTypeColor = (type?: string) => {
    switch (type) {
      case 'conventional': return 'primary';
      default: return 'default';
    }
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'timestamp',
      headerName: 'Time',
      width: 160,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {format(parseISO(params.row.timestamp), 'MMM dd, HH:mm')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(parseISO(params.row.timestamp), 'yyyy')}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'userName',
      headerName: 'User',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
            {params.row.userName.split(' ').map((n: string) => n[0]).join('')}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {params.row.userName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.userEmail}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'activityType',
      headerName: 'Activity Type',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.activityType.replace('_', ' ')}
          size="small"
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      field: 'actionPerformed',
      headerName: 'Action',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {params.row.actionPerformed}
          </Typography>
          {params.row.targetEntity && (
            <Typography variant="caption" color="text.secondary">
              Target: {params.row.targetEntity}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'moduleAccessed',
      headerName: 'Module',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.moduleAccessed}
          size="small"
          variant="filled"
          color="default"
        />
      ),
    },
    {
      field: 'actionResult',
      headerName: 'Result',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.actionResult}
          size="small"
          color={getActionResultColor(params.row.actionResult) as any}
          icon={params.row.actionResult === 'SUCCESS' ? <CheckCircleIcon /> :
            params.row.actionResult === 'FAILURE' ? <ErrorIcon /> : <WarningIcon />}
        />
      ),
    },
    {
      field: 'riskLevel',
      headerName: 'Risk',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.riskLevel}
          size="small"
          color={getRiskLevelColor(params.row.riskLevel) as any}
          variant="filled"
        />
      ),
    },
    {
      field: 'bankingType',
      headerName: 'Banking',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        params.row.bankingType ? (
          <Chip
            label={params.row.bankingType}
            size="small"
            color={getBankingTypeColor(params.row.bankingType) as any}
            variant="outlined"
          />
        ) : (
          <Typography variant="caption" color="text.secondary">-</Typography>
        )
      ),
    },
    {
      field: 'responseTimeMs',
      headerName: 'Response Time',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2">
            {params.row.responseTimeMs ? `${params.row.responseTimeMs}ms` : '-'}
          </Typography>
          {params.row.responseTimeMs && (
            <LinearProgress
              variant="determinate"
              value={Math.min((params.row.responseTimeMs / 2000) * 100, 100)}
              sx={{ mt: 0.5, height: 2 }}
              color={params.row.responseTimeMs > 1000 ? 'error' : params.row.responseTimeMs > 500 ? 'warning' : 'success'}
            />
          )}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => handleViewDetails(params.row)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: { value: number; direction: 'up' | 'down' };
    subtitle?: string;
  }> = ({ title, value, icon, color, trend, subtitle }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color, opacity: 0.7 }}>
            {icon as any}
          </Box>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {trend.direction === 'up' ? (
              <TrendingUpIcon color="success" fontSize="small" />
            ) : (
              <TrendingDownIcon color="error" fontSize="small" />
            )}
            <Typography
              variant="caption"
              sx={{
                color: trend.direction === 'up' ? 'success.main' : 'error.main',
                ml: 0.5
              }}
            >
              {trend.value}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            User Activity Monitoring
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor and track user activities, access patterns, and compliance events across the platform
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab
              label="Activity Logs"
              icon={<AssignmentIcon />}
              iconPosition="start"
            />
            <Tab
              label="Statistics"
              icon={<AnalyticsIcon />}
              iconPosition="start"
            />
            <Tab
              label="Real-time Monitor"
              icon={<TimelineIcon />}
              iconPosition="start"
            />
            <Tab
              label="Compliance Report"
              icon={<SecurityIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Activity Logs Tab */}
        <TabPanel value={currentTab} index={0}>
          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Filters"
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={handleClearFilters}
                    size="small"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    disabled={loading}
                    size="small"
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => setExportDialog(true)}
                    size="small"
                  >
                    Export
                  </Button>
                </Box>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <DatePicker
                    label="From Date"
                    value={filters.dateFrom}
                    onChange={(date) => handleFilterChange('dateFrom', date)}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <DatePicker
                    label="To Date"
                    value={filters.dateTo}
                    onChange={(date) => handleFilterChange('dateTo', date)}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Activity Type</InputLabel>
                    <Select
                      value={filters.activityType || ''}
                      onChange={(e) => handleFilterChange('activityType', e.target.value)}
                      label="Activity Type"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="DATA_ACCESS">Data Access</MenuItem>
                      <MenuItem value="CONFIGURATION_CHANGE">Configuration</MenuItem>
                      <MenuItem value="FILE_UPLOAD">File Upload</MenuItem>
                      <MenuItem value="APPROVAL_ACTION">Approval</MenuItem>
                      <MenuItem value="USER_MANAGEMENT">User Management</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Result</InputLabel>
                    <Select
                      value={filters.actionResult || ''}
                      onChange={(e) => handleFilterChange('actionResult', e.target.value)}
                      label="Result"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="SUCCESS">Success</MenuItem>
                      <MenuItem value="FAILURE">Failure</MenuItem>
                      <MenuItem value="PARTIAL">Partial</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Risk Level</InputLabel>
                    <Select
                      value={filters.riskLevel || ''}
                      onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
                      label="Risk Level"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="LOW">Low</MenuItem>
                      <MenuItem value="MEDIUM">Medium</MenuItem>
                      <MenuItem value="HIGH">High</MenuItem>
                      <MenuItem value="CRITICAL">Critical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search"
                    placeholder="Search by user, action, or module..."
                    value={filters.searchTerm || ''}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Banking Type</InputLabel>
                    <Select
                      value={filters.bankingType || ''}
                      onChange={(e) => handleFilterChange('bankingType', e.target.value)}
                      label="Banking Type"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="conventional">Conventional</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="IP Address"
                    placeholder="192.168.1.100"
                    value={filters.ipAddress || ''}
                    onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Activity Logs DataGrid */}
          <Card>
            <CardHeader
              title={`User Activities (${totalActivities})`}
              subheader={`Last updated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`}
            />
            <CardContent>
              <SafeDataGrid
                rows={tableRows}
                columns={columns}
                loading={loading}
                paginationMode="server"
                rowCount={totalActivities}
                paginationModel={queryState.paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 25, 50, 100]}
                checkboxSelection
                disableRowSelectionOnClick
                columnFilters={queryState.columnFilters}
                onColumnFiltersChange={setColumnFilters}
                sortModel={queryState.sort.map((item) => ({ field: item.field, sort: item.direction }))}
                onSortModelChange={(model) => {
                  setSort(
                    model
                      .filter((item) => item.sort === 'asc' || item.sort === 'desc')
                      .map((item) => ({ field: item.field, direction: item.sort as 'asc' | 'desc' }))
                  );
                }}
                columnVisibilityModel={queryState.columnVisibilityModel}
                onColumnVisibilityModelChange={setColumnVisibilityModel}
                density={queryState.density === 'dense' ? 'compact' : queryState.density}
                onDensityChange={setDensity}
                showEnterpriseControls
                onSaveView={handleSaveView}
                onResetView={handleClearFilters}
                sx={{ height: 600 }}
                onRowDoubleClick={(params: GridRowParams) => handleViewDetails(params.row)}
              />
            </CardContent>
          </Card>
        </TabPanel>

        {/* Statistics Tab */}
        <TabPanel value={currentTab} index={1}>
          {statistics && (
            <Grid container spacing={3}>
              {/* Key Metrics */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  Key Metrics
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <StatCard
                  title="Total Activities"
                  value={statistics.totalActivities.toLocaleString()}
                  icon={<AssignmentIcon fontSize="large" />}
                  color={theme.palette.primary.main}
                  trend={{ value: 12, direction: 'up' }}
                  subtitle="Last 7 days"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <StatCard
                  title="Success Rate"
                  value={`${((statistics.successfulActivities / statistics.totalActivities) * 100).toFixed(1)}%`}
                  icon={<CheckCircleIcon fontSize="large" />}
                  color={theme.palette.success.main}
                  trend={{ value: 2, direction: 'up' }}
                  subtitle={`${statistics.successfulActivities} successful`}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <StatCard
                  title="High Risk Activities"
                  value={statistics.criticalRiskActivities + statistics.highRiskActivities}
                  icon={<WarningIcon fontSize="large" />}
                  color={theme.palette.error.main}
                  trend={{ value: 5, direction: 'down' }}
                  subtitle="Critical + High risk"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <StatCard
                  title="Avg Response Time"
                  value={`${statistics.avgResponseTime}ms`}
                  icon={<ScheduleIcon fontSize="large" />}
                  color={theme.palette.info.main}
                  trend={{ value: 8, direction: 'down' }}
                  subtitle="Performance metric"
                />
              </Grid>

              {/* Additional Stats */}
              <Grid size={{ xs: 12, md: 3 }}>
                <StatCard
                  title="Unique Users"
                  value={statistics.uniqueUsers}
                  icon={<PersonIcon fontSize="large" />}
                  color={theme.palette.secondary.main}
                  subtitle="Active users"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <StatCard
                  title="Unique Sessions"
                  value={statistics.uniqueSessions}
                  icon={<ComputerIcon fontSize="large" />}
                  color={theme.palette.primary.main}
                  subtitle="Active sessions"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <StatCard
                  title="Compliance Events"
                  value={statistics.complianceRelevantActivities}
                  icon={<SecurityIcon fontSize="large" />}
                  color={theme.palette.warning.main}
                  subtitle="Requires audit"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <StatCard
                  title="Failed Activities"
                  value={statistics.failedActivities}
                  icon={<ErrorIcon fontSize="large" />}
                  color={theme.palette.error.main}
                  subtitle="Needs attention"
                />
              </Grid>

              {/* Top Modules */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardHeader title="Top Modules" />
                  <CardContent>
                    <Stack spacing={2}>
                      {statistics.topModules.map((module, index) => (
                        <Box key={module.module} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" sx={{ minWidth: 20 }}>
                            #{index + 1}
                          </Typography>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {module.module}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={(module.count / statistics.topModules[0].count) * 100}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {module.count}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Top Users */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardHeader title="Most Active Users" />
                  <CardContent>
                    <Stack spacing={2}>
                      {statistics.topUsers.map((user, index) => (
                        <Box key={user.userId} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" sx={{ minWidth: 20 }}>
                            #{index + 1}
                          </Typography>
                          <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                            {user.userName.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {user.userName}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={(user.count / statistics.topUsers[0].count) * 100}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {user.count}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* Real-time Monitor Tab */}
        <TabPanel value={currentTab} index={2}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <TimelineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Real-time Activity Monitor
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Live activity monitoring dashboard coming soon...
            </Typography>
          </Box>
        </TabPanel>

        {/* Compliance Report Tab */}
        <TabPanel value={currentTab} index={3}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SecurityIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Compliance Report Generator
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Automated compliance reporting tools coming soon...
            </Typography>
          </Box>
        </TabPanel>

        {/* Activity Details Dialog */}
        <Dialog
          open={detailsDialog.open}
          onClose={() => setDetailsDialog({ open: false, activity: null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Activity Details
          </DialogTitle>
          <DialogContent>
            {detailsDialog.activity && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    User Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2"><strong>Name:</strong> {detailsDialog.activity.userName}</Typography>
                    <Typography variant="body2"><strong>Email:</strong> {detailsDialog.activity.userEmail}</Typography>
                    <Typography variant="body2"><strong>User ID:</strong> {detailsDialog.activity.userId}</Typography>
                    <Typography variant="body2"><strong>Session ID:</strong> {detailsDialog.activity.sessionId}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Activity Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2"><strong>Type:</strong> {detailsDialog.activity.activityType}</Typography>
                    <Typography variant="body2"><strong>Action:</strong> {detailsDialog.activity.actionPerformed}</Typography>
                    <Typography variant="body2"><strong>Module:</strong> {detailsDialog.activity.moduleAccessed}</Typography>
                    <Typography variant="body2"><strong>Result:</strong> {detailsDialog.activity.actionResult}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Technical Details
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2"><strong>IP Address:</strong> {detailsDialog.activity.ipAddress}</Typography>
                    <Typography variant="body2"><strong>Location:</strong> {detailsDialog.activity.location}</Typography>
                    <Typography variant="body2"><strong>Device:</strong> {detailsDialog.activity.deviceType}</Typography>
                    <Typography variant="body2"><strong>Browser:</strong> {detailsDialog.activity.browserName}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Risk & Compliance
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2"><strong>Risk Level:</strong> {detailsDialog.activity.riskLevel}</Typography>
                    <Typography variant="body2"><strong>Banking Type:</strong> {detailsDialog.activity.bankingType || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Compliance Relevant:</strong> {detailsDialog.activity.complianceRelevant ? 'Yes' : 'No'}</Typography>
                    <Typography variant="body2"><strong>Response Time:</strong> {detailsDialog.activity.responseTimeMs}ms</Typography>
                  </Box>
                </Grid>
                {detailsDialog.activity.errorMessage && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Error Details
                    </Typography>
                    <Alert severity="error">
                      {detailsDialog.activity.errorMessage}
                    </Alert>
                  </Grid>
                )}
                {detailsDialog.activity.metadata && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Additional Metadata
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                        {JSON.stringify(detailsDialog.activity.metadata, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialog({ open: false, activity: null })}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Export Dialog */}
        <Dialog
          open={exportDialog}
          onClose={() => setExportDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Export User Activities</DialogTitle>
          <DialogContent>
            <Typography variant="body2" gutterBottom>
              Choose export format for current filtered activities:
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CloudDownloadIcon />}
                onClick={() => handleExport('csv')}
                fullWidth
              >
                Export as CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<CloudDownloadIcon />}
                onClick={() => handleExport('excel')}
                fullWidth
              >
                Export as Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<CloudDownloadIcon />}
                onClick={() => handleExport('pdf')}
                fullWidth
              >
                Export as PDF Report
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialog(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};
