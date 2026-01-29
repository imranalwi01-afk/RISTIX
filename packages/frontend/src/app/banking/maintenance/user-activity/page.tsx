// packages/frontend/src/app/banking/maintenance/user-activity/page.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Chip,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Avatar,
  Paper,
  Stack,
  Badge,
  LinearProgress,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DataGrid, GridColDef, GridRowParams, GridValueGetter, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assignment as AssignmentIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  LocationOn as LocationOnIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  CloudDownload as CloudDownloadIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format, parseISO, subDays, startOfDay, endOfDay } from 'date-fns';

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
  bankingType?: 'conventional' | 'syariah';
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
  bankingType?: 'conventional' | 'syariah';
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

export default function UserActivityPage({ params }: { params: Promise<{}> }) {
  void params; // required by typed routes signature, unused in this page
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [activities, setActivities] = useState<UserActivityLog[]>([]);
  const [statistics, setStatistics] = useState<ActivityStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserActivityFilters>({
    dateFrom: subDays(new Date(), 7),
    dateTo: new Date(),
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

  // Mock data - in real implementation, this would come from the API
  const mockActivities: UserActivityLog[] = [
    {
      id: 'act-001',
      userId: 'user-001',
      userName: 'Sarah Chen',
      userEmail: 'sarah.chen@metrobank.com',
      sessionId: 'session-001',
      activityType: 'DATA_ACCESS',
      actionPerformed: 'View Portfolio Accounts',
      targetEntity: 'PortfolioAccount',
      targetId: 'acc-001',
      pageUrl: '/banking/portfolio/accounts',
      moduleAccessed: 'Portfolio Management',
      actionResult: 'SUCCESS',
      responseTimeMs: 245,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Jakarta, Indonesia',
      deviceType: 'Desktop',
      browserName: 'Chrome',
      riskLevel: 'LOW',
      bankingType: 'conventional',
      complianceRelevant: true,
      businessProcess: 'Portfolio Review',
      timestamp: new Date().toISOString(),
      duration: 245,
      metadata: { recordsViewed: 50 }
    },
    {
      id: 'act-002',
      userId: 'user-002',
      userName: 'Ahmad Hassan',
      userEmail: 'ahmad.hassan@syariahbank.com',
      sessionId: 'session-002',
      activityType: 'CONFIGURATION_CHANGE',
      actionPerformed: 'Update IFRS9 Parameters',
      targetEntity: 'IFRS9Parameter',
      targetId: 'param-001',
      pageUrl: '/banking/configuration/ifrs9',
      moduleAccessed: 'IFRS9 Configuration',
      actionResult: 'SUCCESS',
      responseTimeMs: 1200,
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      location: 'Kuala Lumpur, Malaysia',
      deviceType: 'Desktop',
      browserName: 'Safari',
      riskLevel: 'HIGH',
      bankingType: 'syariah',
      complianceRelevant: true,
      businessProcess: 'Parameter Management',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      duration: 1200,
      metadata: { parametersChanged: 3 }
    },
    {
      id: 'act-003',
      userId: 'user-003',
      userName: 'Lisa Rodriguez',
      userEmail: 'lisa.rodriguez@metrobank.com',
      sessionId: 'session-003',
      activityType: 'FILE_UPLOAD',
      actionPerformed: 'Upload ECL Data',
      targetEntity: 'UploadBatch',
      targetId: 'batch-001',
      pageUrl: '/banking/tools/upload',
      moduleAccessed: 'Data Upload',
      actionResult: 'FAILURE',
      errorMessage: 'File format validation failed',
      responseTimeMs: 5600,
      ipAddress: '192.168.1.110',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Manila, Philippines',
      deviceType: 'Desktop',
      browserName: 'Edge',
      riskLevel: 'MEDIUM',
      bankingType: 'conventional',
      complianceRelevant: false,
      businessProcess: 'Data Processing',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      duration: 5600,
      metadata: { fileName: 'ecl-data-2024.xlsx', fileSize: '2.5MB' }
    }
  ];

  const mockStatistics: ActivityStatistics = {
    totalActivities: 1247,
    successfulActivities: 1156,
    failedActivities: 67,
    partialActivities: 24,
    criticalRiskActivities: 8,
    highRiskActivities: 45,
    uniqueUsers: 89,
    uniqueSessions: 324,
    avgResponseTime: 850,
    complianceRelevantActivities: 892,
    topModules: [
      { module: 'Portfolio Management', count: 345 },
      { module: 'IFRS9 Configuration', count: 234 },
      { module: 'Data Upload', count: 178 },
      { module: 'User Management', count: 156 },
      { module: 'Approval Workflow', count: 134 }
    ],
    topUsers: [
      { userId: 'user-001', userName: 'Sarah Chen', count: 89 },
      { userId: 'user-002', userName: 'Ahmad Hassan', count: 76 },
      { userId: 'user-003', userName: 'Lisa Rodriguez', count: 65 },
      { userId: 'user-004', userName: 'David Wilson', count: 54 },
      { userId: 'user-005', userName: 'Maria Santos', count: 43 }
    ],
    hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: Math.floor(Math.random() * 50) + 10
    })),
    riskDistribution: [
      { risk: 'LOW', count: 856 },
      { risk: 'MEDIUM', count: 298 },
      { risk: 'HIGH', count: 85 },
      { risk: 'CRITICAL', count: 8 }
    ]
  };

  // Fetch activities data
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // In real implementation, call API with filters
      // const response = await api.get('/api/v1/audit/logs', { params: filters });
      // setActivities(response.data.data);

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setActivities(mockActivities);
      setStatistics(mockStatistics);
    } catch (error) {
      console.error('Error fetching user activities:', error);
      setError('Failed to fetch user activities. Please try again.');
      // Fallback to mock data
      setActivities(mockActivities);
      setStatistics(mockStatistics);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

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

  const handleClearFilters = () => {
    setFilters({
      dateFrom: subDays(new Date(), 7),
      dateTo: new Date(),
    });
  };

  const handleRefresh = () => {
    fetchActivities();
  };

  const handleViewDetails = (activity: UserActivityLog) => {
    setDetailsDialog({
      open: true,
      activity
    });
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      // In real implementation, call export API
      // const response = await api.get(`/api/v1/audit/export?format=${format}`, { params: filters });
      console.log(`Exporting user activities as ${format}`);
      setExportDialog(false);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

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
      case 'syariah': return 'secondary';
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
                      <MenuItem value="syariah">Syariah</MenuItem>
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
              title={`User Activities (${activities.length})`}
              subheader={`Last updated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`}
            />
            <CardContent>
              <DataGrid
                rows={activities}
                columns={columns}
                loading={loading}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 25 },
                  },
                }}
                checkboxSelection
                disableRowSelectionOnClick
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
