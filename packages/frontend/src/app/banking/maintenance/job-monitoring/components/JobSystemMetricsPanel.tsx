import React, { memo } from 'react';
import { Grid } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Computer as ComputerIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Memory as MemoryIcon,
  PlayArrow as PlayArrowIcon,
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { SystemMetrics } from '../types';
import { JobStatCard } from './JobStatCard';

interface JobSystemMetricsPanelProps {
  metrics: SystemMetrics | null;
  themePalette: {
    info: string;
    warning: string;
    success: string;
    error: string;
    primary: string;
  };
  formatDuration: (duration?: number) => string;
  mode: 'summary' | 'performance';
}

export const JobSystemMetricsPanel = memo(function JobSystemMetricsPanel({
  metrics,
  themePalette,
  formatDuration,
  mode,
}: JobSystemMetricsPanelProps) {
  if (!metrics) return null;

  if (mode === 'summary') {
    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <JobStatCard
            title="Active Jobs"
            value={metrics.activeJobs}
            icon={<PlayArrowIcon fontSize="large" />}
            color={themePalette.info}
            subtitle="Currently running"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <JobStatCard
            title="Queued Jobs"
            value={metrics.queuedJobs}
            icon={<HourglassEmptyIcon fontSize="large" />}
            color={themePalette.warning}
            subtitle="Waiting to start"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <JobStatCard
            title="Completed Today"
            value={metrics.completedJobsToday}
            icon={<CheckCircleIcon fontSize="large" />}
            color={themePalette.success}
            trend={{ value: 12, direction: 'up' }}
            subtitle="Successful jobs"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <JobStatCard
            title="Failed Today"
            value={metrics.failedJobsToday}
            icon={<ErrorIcon fontSize="large" />}
            color={themePalette.error}
            trend={{ value: 5, direction: 'down' }}
            subtitle="Failed jobs"
          />
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 4 }}>
        <JobStatCard
          title="CPU Usage"
          value={`${metrics.cpuUsage}%`}
          icon={<ComputerIcon fontSize="large" />}
          color={metrics.cpuUsage > 80 ? themePalette.error : themePalette.success}
          subtitle="System CPU utilization"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <JobStatCard
          title="Memory Usage"
          value={`${metrics.memoryUsage}%`}
          icon={<MemoryIcon fontSize="large" />}
          color={metrics.memoryUsage > 80 ? themePalette.error : themePalette.info}
          subtitle="System memory utilization"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <JobStatCard
          title="Disk Usage"
          value={`${metrics.diskUsage}%`}
          icon={<StorageIcon fontSize="large" />}
          color={metrics.diskUsage > 80 ? themePalette.error : themePalette.primary}
          subtitle="System disk utilization"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <JobStatCard
          title="Avg Execution Time"
          value={formatDuration(metrics.averageExecutionTime)}
          icon={<ScheduleIcon fontSize="large" />}
          color={themePalette.warning}
          subtitle="Average job completion time"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <JobStatCard
          title="Throughput"
          value={`${metrics.throughputPerHour.toLocaleString()}/hr`}
          icon={<SpeedIcon fontSize="large" />}
          color={themePalette.success}
          subtitle="Records processed per hour"
        />
      </Grid>
    </Grid>
  );
});
