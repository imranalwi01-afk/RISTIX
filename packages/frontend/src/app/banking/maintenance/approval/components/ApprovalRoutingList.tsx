import React, { memo } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { ApprovalRoutingItem } from '../types';

interface ApprovalRoutingListProps {
  routingItems: ApprovalRoutingItem[];
  loading: boolean;
  entityOptions: string[];
  routingEntityFilter: string;
  routingOperationFilter: 'all' | 'create' | 'update' | 'delete';
  routingDepartmentFilter: string;
  onEntityFilterChange: (value: string) => void;
  onOperationFilterChange: (value: 'all' | 'create' | 'update' | 'delete') => void;
  onDepartmentFilterChange: (value: string) => void;
  onApply: () => void;
}

export const ApprovalRoutingList = memo(function ApprovalRoutingList({
  routingItems,
  loading,
  entityOptions,
  routingEntityFilter,
  routingOperationFilter,
  routingDepartmentFilter,
  onEntityFilterChange,
  onOperationFilterChange,
  onDepartmentFilterChange,
  onApply,
}: ApprovalRoutingListProps) {
  return (
    <Box>
      <Paper sx={{ mb: 2, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Entity Type</InputLabel>
              <Select
                value={routingEntityFilter}
                label="Entity Type"
                onChange={(event) => onEntityFilterChange(String(event.target.value))}
                data-testid="approval-routing-entity-select"
              >
                <MenuItem value="all">All Entities</MenuItem>
                {entityOptions.map((entity, idx) => (
                  <MenuItem key={`${entity}-${idx}`} value={entity}>
                    {entity}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Operation</InputLabel>
              <Select
                value={routingOperationFilter}
                label="Operation"
                onChange={(event) => onOperationFilterChange(event.target.value as 'all' | 'create' | 'update' | 'delete')}
                data-testid="approval-routing-operation-select"
              >
                <MenuItem value="all">All Operations</MenuItem>
                <MenuItem value="create">Create</MenuItem>
                <MenuItem value="update">Update</MenuItem>
                <MenuItem value="delete">Delete</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Department (optional)"
              value={routingDepartmentFilter}
              onChange={(event) => onDepartmentFilterChange(event.target.value)}
              placeholder="e.g. Risk Management"
              slotProps={{ htmlInput: { 'data-testid': 'approval-routing-department-input' } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={onApply}
              disabled={loading}
              data-testid="approval-routing-apply-button"
            >
              Apply
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={28} />
        </Paper>
      ) : routingItems.length === 0 ? (
        <Alert severity="info">No approval routing data found for this filter.</Alert>
      ) : (
        <Grid container spacing={2}>
          {routingItems.map((routing) => (
            <Grid key={`${routing.entityType}-${routing.matrixId || 'fallback'}`} size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">{routing.matrixName}</Typography>
                  <Chip
                    size="small"
                    label={routing.isActive ? 'Active' : 'Inactive'}
                    color={routing.isActive ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Entity: <strong>{routing.entityType}</strong> | Operations: <strong>{routing.operationType}</strong>
                </Typography>

                {routing.levels.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No levels configured.
                  </Typography>
                ) : (
                  routing.levels
                    .sort((a, b) => a.level - b.level)
                    .map((level) => (
                      <Box key={`${routing.entityType}-${level.level}`} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5, mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                          L{level.level} {level.name} | Needed: {level.requiredCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Required Roles: {(level.requiredRoleCodes || []).join(', ') || '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Required Permissions: {(level.requiredPermissionCodes || []).join(', ') || '-'}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, mb: 0.75 }}>
                          Candidate Approvers: <strong>{level.candidateCount}</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {level.candidates.slice(0, 6).map((candidate) => (
                            <Tooltip
                              key={candidate.userId}
                              title={`${candidate.email}${candidate.department ? ` | ${candidate.department}` : ''}`}
                            >
                              <Chip size="small" label={candidate.fullName} />
                            </Tooltip>
                          ))}
                          {level.candidates.length > 6 && (
                            <Chip size="small" variant="outlined" label={`+${level.candidates.length - 6} more`} />
                          )}
                        </Box>
                      </Box>
                    ))
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
});
