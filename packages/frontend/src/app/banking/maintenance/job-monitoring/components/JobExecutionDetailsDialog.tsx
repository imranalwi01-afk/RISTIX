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
  LinearProgress,
  Paper,
  Stack,
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
                  <Chip label={job.status} size="small" color={getStatusColor(job.status) as any} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Priority
                  </Typography>
                  <Chip label={job.priority} size="small" color={getPriorityColor(job.priority) as any} variant="outlined" />
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
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <LinearProgress variant="determinate" value={job.progress} sx={{ flexGrow: 1 }} />
                    <Typography variant="body2">{job.progress}%</Typography>
                  </Box>
                </Box>
              </Stack>
            </Grid>

            {canViewRuntime && job.runtime?.available && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  Runtime Diagnostics
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Backend PID
                      </Typography>
                      <Typography variant="body2">{job.runtime.pid ?? '-'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        DB State
                      </Typography>
                      <Typography variant="body2">{job.runtime.state || '-'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Runtime
                      </Typography>
                      <Typography variant="body2">
                        {typeof job.runtime.runtimeSeconds === 'number'
                          ? `${Math.floor(job.runtime.runtimeSeconds / 60)}m ${job.runtime.runtimeSeconds % 60}s`
                          : '-'}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Wait Event Type
                      </Typography>
                      <Typography variant="body2">{job.runtime.waitEventType || '-'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Wait Event
                      </Typography>
                      <Typography variant="body2">{job.runtime.waitEvent || '-'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Blocking PIDs
                      </Typography>
                      <Typography variant="body2">
                        {job.runtime.blockedByPids?.length ? job.runtime.blockedByPids.join(', ') : '-'}
                      </Typography>
                    </Grid>
                  </Grid>
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
