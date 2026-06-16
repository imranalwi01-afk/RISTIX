'use client';

import React, { memo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  RunCircle as RunIcon,
} from '@mui/icons-material';
import { ImpactLevelBadge } from '@/components/ImpactLevelBadge';
import { JobDefinition } from '../types';

interface JobDefinitionsPanelProps {
  jobs: JobDefinition[];
  loading: boolean;
  canControlJobs: boolean;
  canRunJobs: boolean;
  canEditJobs: boolean;
  canDeleteJobs: boolean;
  onToggle: (jobId: string, enabled: boolean) => void;
  onRunNow: (jobId: string) => void;
  onEdit: (job: JobDefinition) => void;
  onDelete: (job: JobDefinition) => void;
  getStatusColor: (status: string) => string;
  formatNextRun: (value?: string) => string;
}

export const JobDefinitionsPanel = memo(function JobDefinitionsPanel({
  jobs,
  loading,
  canControlJobs,
  canRunJobs,
  canEditJobs,
  canDeleteJobs,
  onToggle,
  onRunNow,
  onEdit,
  onDelete,
  getStatusColor,
  formatNextRun,
}: JobDefinitionsPanelProps) {
  return (
    <Grid container spacing={3}>
      {jobs.map((job) => (
        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={job.id}>
          <Card>
            <CardHeader
              title={job.name}
              subheader={job.description}
              action={
                <Switch
                  checked={job.isEnabled}
                  onChange={(e) => onToggle(job.id, e.target.checked)}
                  disabled={!canControlJobs || loading}
                  size="small"
                />
              }
            />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Schedule
                  </Typography>
                  <Typography variant="body2">{job.scheduleExpression}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Next Run
                  </Typography>
                  <Typography variant="body2">{formatNextRun(job.nextRunTime)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Last Status
                  </Typography>
                  <Chip
                    label={job.lastRunStatus || 'Never run'}
                    size="small"
                    color={job.lastRunStatus ? (getStatusColor(job.lastRunStatus) as any) : 'default'}
                    variant="outlined"
                  />
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Priority: {job.priority}
                  </Typography>
                  <ImpactLevelBadge level={(job as any).impactLevel || 'medium'} size="small" />
                  <Typography variant="caption" color="text.secondary">
                    Type: {job.type}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RunIcon />}
                  onClick={() => onRunNow(job.id)}
                  disabled={!canRunJobs || !job.isEnabled || loading}
                  fullWidth
                >
                  Run Now
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => onEdit(job)}
                    disabled={!canEditJobs || loading}
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => onDelete(job)}
                    disabled={!canDeleteJobs || loading}
                    fullWidth
                  >
                    Delete
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
});
