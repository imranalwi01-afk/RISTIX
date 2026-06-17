'use client';

import React, { memo } from 'react';
import {
  Alert,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Grid,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { JobExecution } from '../types';

interface JobExecutionDetailsDialogProps {
  open: boolean;
  job: JobExecution | null;
  canViewRuntime: boolean;
  onClose: () => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  formatDateTime: (value: string) => string;
  formatDuration: (duration?: number) => string;
}

const formatRuntimeSeconds = (seconds?: number) => {
  if (typeof seconds !== 'number') return '-';
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

const getRuntimeReasonLabel = (reason?: string) => {
  switch (reason) {
    case 'not_active':
      return 'Execution is not currently active.';
    case 'not_sql_sp_legacy':
      return 'Live database diagnostics are only available for running LEGACY stored procedure jobs.';
    case 'missing_procedure_name':
      return 'Stored procedure name is missing, so the database session cannot be matched.';
    case 'session_not_found':
      return 'No matching active database session was found yet.';
    default:
      return reason || 'Runtime diagnostics are not available for this execution.';
  }
};

export const JobExecutionDetailsDialog = memo(function JobExecutionDetailsDialog({
  open,
  job,
  canViewRuntime,
  onClose,
  getStatusColor,
  getPriorityColor,
  formatDateTime,
  formatDuration,
}: JobExecutionDetailsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Job Execution Details</DialogTitle>
      <DialogContent>
        {job && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>
                Job Information
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body2">{job.jobName}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body2">{job.jobType}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Tooltip title={job.status === 'RUNNING' ? 'Job sedang berjalan' : job.status === 'COMPLETED' ? 'Job selesai dengan sukses' : job.status === 'FAILED' ? 'Job gagal' : job.status === 'PENDING' ? 'Job menunggu antrian' : job.status === 'PAUSED' ? 'Job dijeda' : job.status === 'CANCELLED' ? 'Job dibatalkan' : job.status}>
                    <Chip label={job.status} size="small" color={getStatusColor(job.status) as any} />
                  </Tooltip>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Priority
                  </Typography>
                  <Tooltip title={job.priority === 'LOW' ? 'Low priority — SLA 24 jam' : job.priority === 'NORMAL' ? 'Normal priority — SLA 8 jam' : job.priority === 'HIGH' ? 'High priority — SLA 4 jam' : job.priority === 'CRITICAL' ? 'Critical priority — SLA 2 jam' : job.priority}>
                    <Chip label={job.priority} size="small" color={getPriorityColor(job.priority) as any} variant="outlined" />
                  </Tooltip>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>
                Execution Details
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Start Time
                  </Typography>
                  <Typography variant="body2">{formatDateTime(job.startTime)}</Typography>
                </Box>
                {job.endTime && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      End Time
                    </Typography>
                    <Typography variant="body2">{formatDateTime(job.endTime)}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body2">
                    {job.status === 'RUNNING'
                      ? formatDuration(Date.now() - new Date(job.startTime).getTime())
                      : formatDuration(job.duration)}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {canViewRuntime && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  Debug Console
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: '#111827',
                    color: 'grey.100',
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                  }}
                >
                  <Stack spacing={0.75}>
                    <Typography variant="body2" sx={{ fontFamily: 'inherit', color: 'inherit' }}>
                      status: {job.status}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'inherit', color: 'inherit' }}>
                      execution_id: {job.id}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'inherit', color: 'inherit' }}>
                      job_definition_id: {job.jobId}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'inherit', color: 'inherit' }}>
                      job_type: {job.jobType}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'inherit', color: 'inherit' }}>
                      started_at: {formatDateTime(job.startTime)}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'inherit', color: 'inherit' }}>
                      elapsed: {job.status === 'RUNNING'
                        ? formatDuration(Date.now() - new Date(job.startTime).getTime())
                        : formatDuration(job.duration)}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'inherit', color: job.runtime?.available ? 'success.light' : 'warning.light' }}>
                      runtime_available: {job.runtime?.available ? 'true' : 'false'}
                    </Typography>
                    {!job.runtime?.available && (
                      <Typography variant="body2" sx={{ fontFamily: 'inherit', color: 'warning.light' }}>
                        runtime_reason: {getRuntimeReasonLabel(job.runtime?.reason)}
                      </Typography>
                    )}
                    {job.runtime?.available && (
                      <>
                        <Typography variant="body2" sx={{ fontFamily: 'inherit', color: 'inherit' }}>
                          backend_pid: {job.runtime.pid ?? '-'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'inherit', color: 'inherit' }}>
                          db_state: {job.runtime.state || '-'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'inherit', color: 'inherit' }}>
                          db_runtime: {formatRuntimeSeconds(job.runtime.runtimeSeconds)}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'inherit', color: 'inherit' }}>
                          wait_event_type: {job.runtime.waitEventType || '-'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'inherit', color: 'inherit' }}>
                          wait_event: {job.runtime.waitEvent || '-'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'inherit', color: job.runtime.blockedByPids?.length ? 'error.light' : 'inherit' }}>
                          blocking_pids: {job.runtime.blockedByPids?.length ? job.runtime.blockedByPids.join(', ') : '-'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'inherit', color: 'inherit' }}>
                          db_session_start: {job.runtime.dbSessionStart ? formatDateTime(job.runtime.dbSessionStart) : '-'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'inherit', color: 'inherit' }}>
                          query_start: {job.runtime.queryStart ? formatDateTime(job.runtime.queryStart) : '-'}
                        </Typography>
                      </>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            )}

            {job.resourceUsage && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" gutterBottom>
                  Resource Usage
                </Typography>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      CPU Usage
                    </Typography>
                    <Typography variant="body2">{job.resourceUsage.cpuUsage}%</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Memory Usage
                    </Typography>
                    <Typography variant="body2">{job.resourceUsage.memoryUsage} MB</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Disk Usage
                    </Typography>
                    <Typography variant="body2">{job.resourceUsage.diskUsage}%</Typography>
                  </Box>
                </Stack>
              </Grid>
            )}

            {job.performanceMetrics && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" gutterBottom>
                  Performance Metrics
                </Typography>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Records Processed
                    </Typography>
                    <Typography variant="body2">{job.performanceMetrics.recordsProcessed.toLocaleString()}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Throughput
                    </Typography>
                    <Typography variant="body2">{job.performanceMetrics.throughput.toLocaleString()} records/min</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Avg Response Time
                    </Typography>
                    <Typography variant="body2">{job.performanceMetrics.averageResponseTime}ms</Typography>
                  </Box>
                </Stack>
              </Grid>
            )}

            {job.errorMessage && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  Error Information
                </Typography>
                <Alert severity="error">
                  <Typography variant="body2" sx={{ fontWeight: 'medium', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {job.errorMessage}
                  </Typography>
                  {job.errorDetails && (
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                      }}
                    >
                      {job.errorDetails}
                    </Typography>
                  )}
                </Alert>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
});
