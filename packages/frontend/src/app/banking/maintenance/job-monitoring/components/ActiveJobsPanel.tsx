import React, { memo } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tabs,
  Tab,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Clear as ClearIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Search as SearchIcon,
  Stop as StopIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import { JobExecution, JobFilters, SupportedJobType } from '../types';

interface ActiveJobsPanelProps {
  loading: boolean;
  filters: JobFilters;
  filteredJobs: JobExecution[];
  totalJobs: number;
  statusTab: number;
  statusCounts: {
    all: number;
    ongoing: number;
    running: number;
    completed: number;
    failed: number;
  };
  canControlJobs: boolean;
  onStatusTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  onFilterChange: (field: keyof JobFilters, value: any) => void;
  onClearFilters: () => void;
  onViewDetails: (job: JobExecution) => void;
  onJobControl: (job: JobExecution, action: 'start' | 'pause' | 'stop' | 'restart') => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  getJobTypeIcon: (type: string) => React.ReactNode;
  formatDuration: (duration?: number) => string;
  supportedJobTypeOptions: Array<{ value: SupportedJobType; label: string }>;
  lastUpdatedLabel: string;
}

export const ActiveJobsPanel = memo(function ActiveJobsPanel({
  loading,
  filters,
  filteredJobs,
  totalJobs,
  statusTab,
  statusCounts,
  canControlJobs,
  onStatusTabChange,
  onFilterChange,
  onClearFilters,
  onViewDetails,
  onJobControl,
  getStatusColor,
  getPriorityColor,
  getJobTypeIcon,
  formatDuration,
  supportedJobTypeOptions,
  lastUpdatedLabel,
}: ActiveJobsPanelProps) {
  const executionColumns: GridColDef[] = [
    {
      field: 'jobName',
      headerName: 'Job Name',
      flex: 2,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getJobTypeIcon(params.row.jobType)}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {params.row.jobName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.jobType.replace('_', ' ')}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.row.status} size="small" color={getStatusColor(params.row.status) as any} variant="filled" />
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.row.priority} size="small" color={getPriorityColor(params.row.priority) as any} variant="outlined" />
      ),
    },
    {
      field: 'startTime',
      headerName: 'Start Time',
      width: 160,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2">{params.row.startTimeLabel}</Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.startTimeYear}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'duration',
      headerName: 'Duration',
      width: 100,
      renderCell: (params: GridRenderCellParams) => <Typography variant="body2">{params.row.durationLabel}</Typography>,
    },
    {
      field: 'userName',
      headerName: 'User',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
            {params.row.userName.split(' ').map((n: string) => n[0]).join('')}
          </Avatar>
          <Typography variant="body2">{params.row.userName}</Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => onViewDetails(params.row)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {canControlJobs && params.row.status === 'RUNNING' && (
            <Tooltip title="Pause Job">
              <IconButton size="small" onClick={() => onJobControl(params.row, 'pause')}>
                <PauseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canControlJobs && params.row.status === 'PAUSED' && (
            <Tooltip title="Resume Job">
              <IconButton size="small" onClick={() => onJobControl(params.row, 'start')}>
                <PlayArrowIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canControlJobs && (params.row.status === 'RUNNING' || params.row.status === 'PAUSED') && (
            <Tooltip title="Stop Job">
              <IconButton size="small" onClick={() => onJobControl(params.row, 'stop')} color="error">
                <StopIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const rows = filteredJobs.map((job) => ({
    ...job,
    startTimeLabel: job.startTime ? new Date(job.startTime).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) : '-',
    startTimeYear: job.startTime ? new Date(job.startTime).toLocaleString('en-US', { year: 'numeric' }) : '',
    durationLabel: job.status === 'RUNNING'
      ? formatDuration(Date.now() - new Date(job.startTime).getTime())
      : formatDuration(job.duration),
  }));

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={statusTab}
          onChange={onStatusTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
            },
          }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  All Jobs
                </Typography>
                <Chip label={statusCounts.all} size="small" color="default" sx={{ mt: 0.5, minWidth: 40 }} />
              </Box>
            }
          />
          <Tab
            icon={<HourglassEmptyIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  Ongoing
                </Typography>
                <Chip label={statusCounts.ongoing} size="small" color="warning" sx={{ mt: 0.5, minWidth: 40 }} />
              </Box>
            }
          />
          <Tab
            icon={<PlayArrowIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  Running
                </Typography>
                <Chip label={statusCounts.running} size="small" color="info" sx={{ mt: 0.5, minWidth: 40 }} />
              </Box>
            }
          />
          <Tab
            icon={<CheckCircleIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  Completed
                </Typography>
                <Chip label={statusCounts.completed} size="small" color="success" sx={{ mt: 0.5, minWidth: 40 }} />
              </Box>
            }
          />
          <Tab
            icon={<ErrorIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  Failed
                </Typography>
                <Chip label={statusCounts.failed} size="small" color="error" sx={{ mt: 0.5, minWidth: 40 }} />
              </Box>
            }
          />
        </Tabs>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Filters"
          action={
            <Button variant="outlined" startIcon={<ClearIcon />} onClick={onClearFilters} size="small">
              Clear Filters
            </Button>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={filters.status || ''} onChange={(e) => onFilterChange('status', e.target.value)} label="Status">
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="RUNNING">Running</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="PAUSED">Paused</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select value={filters.type || ''} onChange={(e) => onFilterChange('type', e.target.value)} label="Type">
                  <MenuItem value="">All</MenuItem>
                  {supportedJobTypeOptions.map((option, idx) => (
                    <MenuItem key={`${option.value}-${idx}`} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select value={filters.priority || ''} onChange={(e) => onFilterChange('priority', e.target.value)} label="Priority">
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="CRITICAL">Critical</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="NORMAL">Normal</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                placeholder="Search by job name, user, or tenant..."
                value={filters.searchTerm || ''}
                onChange={(e) => onFilterChange('searchTerm', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title={`Job Executions (${filteredJobs.length}${filteredJobs.length !== totalJobs ? ` of ${totalJobs}` : ''})`}
          subheader={`Last updated: ${lastUpdatedLabel}`}
        />
        <CardContent>
          <SafeDataGrid
            rows={rows}
            columns={executionColumns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
            checkboxSelection
            sx={{ height: 600 }}
          />
        </CardContent>
      </Card>
    </>
  );
});
