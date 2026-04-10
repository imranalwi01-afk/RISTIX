import React, { memo } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import { Edit as EditIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { ApprovalMatrix } from '../types';

interface ApprovalMatrixListProps {
  matrices: ApprovalMatrix[];
  loading: boolean;
  onRefresh: () => void;
  onEdit: (matrix: ApprovalMatrix) => void;
  formatDate: (value: string) => string;
}

export const ApprovalMatrixList = memo(function ApprovalMatrixList({
  matrices,
  loading,
  onRefresh,
  onEdit,
  formatDate,
}: ApprovalMatrixListProps) {
  return (
    <Box>
      <Paper sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Typography variant="h6">Approval Matrices ({matrices.length})</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={loading}
            data-testid="approval-matrix-refresh-button"
          >
            Refresh Matrices
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={28} />
        </Paper>
      ) : matrices.length === 0 ? (
        <Alert severity="info">No approval matrix found for this tenant.</Alert>
      ) : (
        <Grid container spacing={2}>
          {matrices.map((matrix, idx) => (
            <Grid key={`${matrix.id}-${idx}`} size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">{matrix.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={matrix.isActive ? 'Active' : 'Inactive'}
                      color={matrix.isActive ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                    <Tooltip title="Edit matrix">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(matrix)}
                        data-testid={`approval-matrix-edit-button-${matrix.id}`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {matrix.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {matrix.description}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                  <Chip label={matrix.entityType.replace(/_/g, ' ')} size="small" />
                  {matrix.operationType && <Chip label={`Ops: ${matrix.operationType}`} size="small" variant="outlined" />}
                  {matrix.bankingMode && <Chip label={`Mode: ${matrix.bankingMode}`} size="small" variant="outlined" />}
                  <Chip label={`${matrix.levels.length} level(s)`} size="small" variant="outlined" />
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Levels
                  </Typography>
                  {matrix.levels.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No levels configured.
                    </Typography>
                  ) : (
                    [...matrix.levels]
                      .sort((a, b) => a.level - b.level)
                      .map((level) => (
                        <Typography key={`${matrix.id}-${level.level}`} variant="body2" sx={{ mb: 0.25 }}>
                          L{level.level} {level.name} | Roles: {(level.requiredRoleCodes || []).join(', ') || '-'} | Required: {level.requiredCount || 1}
                        </Typography>
                      ))
                  )}
                </Box>

                {matrix.autoApprovalRules?.bypassPermissions?.length ? (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Bypass Permissions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {matrix.autoApprovalRules.bypassPermissions.join(', ')}
                    </Typography>
                  </Box>
                ) : null}

                <Typography variant="caption" color="text.secondary">
                  Created: {formatDate(matrix.createdAt)}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
});
