'use client';

import React, { memo } from 'react';
import {
  Badge,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  Typography,
} from '@mui/material';
import {
  Gavel as ApprovalIcon,
  CheckCircle as ApproveIcon,
  FilterList as FilterIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  Notifications as NotificationIcon,
  PendingActions as PendingIcon,
  Forward as DelegateIcon,
} from '@mui/icons-material';
import { ApprovalStatistics } from '../types';
import { getApprovalRequestTypeLabel } from '@/features/approval/domain/approval.models';

interface ApprovalStatisticsPanelProps {
  statistics: ApprovalStatistics | null;
}

export const ApprovalStatisticsPanel = memo(function ApprovalStatisticsPanel({
  statistics,
}: ApprovalStatisticsPanelProps) {
  if (!statistics) return null;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom variant="h6">
                  Total Requests
                </Typography>
                <Typography variant="h4" component="div">
                  {statistics.totalRequests}
                </Typography>
              </Box>
              <ApprovalIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom variant="h6">
                  Pending
                </Typography>
                <Typography variant="h4" component="div" color="warning.main">
                  {statistics.pendingRequests}
                </Typography>
              </Box>
              <Badge badgeContent={statistics.overdueRequests} color="error">
                <PendingIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Badge>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom variant="h6">
                  Approved
                </Typography>
                <Typography variant="h4" component="div" color="success.main">
                  {statistics.approvedRequests}
                </Typography>
              </Box>
              <ApproveIcon sx={{ fontSize: 40, color: 'success.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom variant="h6">
                  Avg. Time
                </Typography>
                <Typography variant="h4" component="div" color="info.main">
                  {statistics.averageApprovalTime}d
                </Typography>
              </Box>
              <HistoryIcon sx={{ fontSize: 40, color: 'info.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom variant="h6">
                  Info Requested
                </Typography>
                <Typography variant="h4" component="div" color="info.main">
                  {statistics.infoRequestedRequests}
                </Typography>
              </Box>
              <InfoIcon sx={{ fontSize: 40, color: 'info.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom variant="h6">
                  Delegated
                </Typography>
                <Typography variant="h4" component="div" color="secondary.main">
                  {statistics.delegatedRequests}
                </Typography>
              </Box>
              <DelegateIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom variant="h6">
                  Critical Pending
                </Typography>
                <Typography variant="h4" component="div" color="error.main">
                  {statistics.criticalPendingRequests}
                </Typography>
              </Box>
              <NotificationIcon sx={{ fontSize: 40, color: 'error.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom variant="h6">
                  Entity Types
                </Typography>
                <Typography variant="h4" component="div" color="primary.main">
                  {statistics.uniqueRequestTypes}
                </Typography>
              </Box>
              <FilterIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title="Approval Summary" subheader="Current month overview" />
          <CardContent>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="success.main">
                  {statistics.totalRequests > 0
                    ? ((statistics.approvedRequests / statistics.totalRequests) * 100).toFixed(1)
                    : '0.0'}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Approval Rate
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="error.main">
                  {statistics.totalRequests > 0
                    ? ((statistics.rejectedRequests / statistics.totalRequests) * 100).toFixed(1)
                    : '0.0'}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Rejection Rate
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="warning.main">
                  {statistics.overdueRequests}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Overdue Requests
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader title="Pending By Level" subheader="Current pending workload by approval stage" />
          <CardContent>
            {statistics.pendingByLevel.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No pending requests currently assigned to a specific approval level.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {statistics.pendingByLevel.map((entry) => (
                  <Chip
                    key={entry.level}
                    color="warning"
                    variant="outlined"
                    label={`Level ${entry.level}: ${entry.count}`}
                  />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader title="Top Request Types" subheader="Most active approval entities in this tenant" />
          <CardContent>
            {statistics.byRequestType.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No request type activity available yet.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {statistics.byRequestType.slice(0, 8).map((entry) => (
                  <Chip
                    key={entry.requestType}
                    variant="outlined"
                    label={`${getApprovalRequestTypeLabel(entry.requestType)}: ${entry.count}`}
                  />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
});
