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
  Stepper,
  Step,
  StepLabel,
  Tooltip,
  Typography,
  Avatar,
  Stack,
  alpha,
} from '@mui/material';
import {
  Edit as EditIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Build as BuildIcon,
  Settings as SettingsIcon,
  AccountBalance as BankingIcon,
  Security as SecurityIcon,
  ChevronRight as ChevronRightIcon,
  FactCheck as FactCheckIcon,
  ToggleOff as ToggleOffIcon,
  VerifiedUser as VerifiedUserIcon,
  VpnKey as VpnKeyIcon,
  AssignmentInd as AssignmentIndIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { ApprovalMatrix } from '../types';

const ENTITY_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  user: { label: 'User', color: '#1976d2', icon: <PeopleIcon /> },
  configuration: { label: 'Config', color: '#7b1fa2', icon: <SettingsIcon /> },
  parameter: { label: 'Parameter', color: '#00838f', icon: <BuildIcon /> },
  product_parameter: { label: 'Product', color: '#e65100', icon: <BankingIcon /> },
  journal_parameter: { label: 'Journal', color: '#2e7d32', icon: <BankingIcon /> },
  segmentation: { label: 'Segmentation', color: '#4a148c', icon: <SecurityIcon /> },
  rule_base_setting: { label: 'Rule Base', color: '#01579b', icon: <BuildIcon /> },
  bucket_parameter: { label: 'Bucket', color: '#bf360c', icon: <BuildIcon /> },
  pd_configuration: { label: 'PD Config', color: '#1b5e20', icon: <BuildIcon /> },
  lgd_configuration: { label: 'LGD Config', color: '#004d40', icon: <BuildIcon /> },
  ead_configuration: { label: 'EAD Config', color: '#311b92', icon: <BuildIcon /> },
  ecl_configuration: { label: 'ECL Config', color: '#b71c1c', icon: <BuildIcon /> },
  fl_scalar: { label: 'FL Scalar', color: '#4e342e', icon: <BuildIcon /> },
  individual_assessment_consolidated: { label: 'Individual Assessment', color: '#6a1b9a', icon: <FactCheckIcon /> },
  user_status: { label: 'User Status', color: '#f57c00', icon: <ToggleOffIcon /> },
  role: { label: 'Role', color: '#00695c', icon: <VerifiedUserIcon /> },
  role_permission: { label: 'Role Permission', color: '#d84315', icon: <VpnKeyIcon /> },
  role_assignment: { label: 'Role Assignment', color: '#37474f', icon: <AssignmentIndIcon /> },
};

const getEntityConfig = (entityType: string) =>
  ENTITY_CONFIG[entityType] || { label: entityType, color: '#546e7a', icon: <BuildIcon /> };

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
  const theme = useTheme();

  return (
    <Box>
      <Paper sx={{ mb: 2, p: 2.5, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <SecurityIcon color="primary" />
            <Typography variant="h6">Approval Matrices</Typography>
            <Chip label={`${matrices.length} active`} size="small" color="primary" variant="outlined" />
          </Stack>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Loading matrices...</Typography>
        </Paper>
      ) : matrices.length === 0 ? (
        <Alert severity="info" variant="outlined">No approval matrix found for this tenant.</Alert>
      ) : (
        <Grid container spacing={2.5}>
          {matrices.map((matrix, idx) => {
            const entityCfg = getEntityConfig(matrix.entityType);
            return (
              <Grid key={`${matrix.id}-${idx}`} size={{ xs: 12, md: 6, lg: 4 }}>
                <Paper
                  sx={{
                    p: 2.5,
                    height: '100%',
                    borderRadius: 2,
                    border: `1px solid ${alpha(entityCfg.color, 0.2)}`,
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: theme.shadows[4] },
                  }}
                >
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha(entityCfg.color, 0.1), color: entityCfg.color, width: 40, height: 40 }}>
                        {entityCfg.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                          {matrix.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {entityCfg.label} · {matrix.levels.length} level{matrix.levels.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Chip
                        label={matrix.isActive ? 'Active' : 'Inactive'}
                        color={matrix.isActive ? 'success' : 'default'}
                        size="small"
                        variant="filled"
                        sx={{ fontWeight: 500, fontSize: '0.7rem' }}
                      />
                      <Tooltip title="Edit matrix">
                        <IconButton size="small" color="primary" onClick={() => onEdit(matrix)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  {/* Description */}
                  {matrix.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem' }}>
                      {matrix.description}
                    </Typography>
                  )}

                  {/* Tags */}
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                    {matrix.operationType && (
                      <Chip
                        label={matrix.operationType.replace(/_/g, ' ').toUpperCase()}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', fontWeight: 600 }}
                      />
                    )}
                    {matrix.bankingMode && (
                      <Chip
                        label={matrix.bankingMode}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem' }}
                      />
                    )}
                    {matrix.autoApprovalRules?.bypassPermissions?.length ? (
                      <Chip
                        label="Bypassable"
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem' }}
                      />
                    ) : null}
                  </Stack>

                  {/* Approval Levels as Stepper */}
                  {matrix.levels.length > 0 ? (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                        Approval Flow
                      </Typography>
                      <Stepper
                        activeStep={-1}
                        orientation="vertical"
                        sx={{
                          '& .MuiStepConnector-line': { minHeight: 24 },
                          '& .MuiStepLabel-label': { fontSize: '0.8rem' },
                        }}
                      >
                        {[...matrix.levels]
                          .sort((a, b) => a.level - b.level)
                          .map((level) => (
                            <Step key={`${matrix.id}-${level.level}`} active>
                              <StepLabel
                                optional={
                                  <Typography variant="caption" color="text.secondary">
                                    {level.requiredCount || 1} approver{(level.requiredCount || 1) > 1 ? 's' : ''} needed
                                    {(level as any).maxAmount ? ` · ≤${Number((level as any).maxAmount).toLocaleString()}` : ''}
                                  </Typography>
                                }
                              >
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {level.name}
                                </Typography>
                                {level.requiredRoleCodes?.length ? (
                                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                                    {level.requiredRoleCodes.map((code) => (
                                      <Chip
                                        key={code}
                                        label={code}
                                        size="small"
                                        variant="filled"
                                        sx={{ fontSize: '0.6rem', height: 20, bgcolor: alpha(entityCfg.color, 0.08), color: entityCfg.color }}
                                      />
                                    ))}
                                  </Stack>
                                ) : null}
                              </StepLabel>
                            </Step>
                          ))}
                      </Stepper>
                    </Box>
                  ) : null}

                  {/* Bypass Permissions */}
                  {matrix.autoApprovalRules?.bypassPermissions?.length ? (
                    <Box sx={{ mb: 1.5, p: 1.5, bgcolor: alpha(theme.palette.warning.main, 0.06), borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5, color: theme.palette.warning.dark }}>
                        Bypass Permissions
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {matrix.autoApprovalRules.bypassPermissions.map((perm) => (
                          <Chip
                            key={perm}
                            label={perm.replace(/_/g, ' ')}
                            size="small"
                            variant="outlined"
                            color="warning"
                            sx={{ fontSize: '0.6rem', height: 20 }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  ) : null}

                  {/* Footer */}
                  <Typography variant="caption" color="text.disabled">
                    Created {formatDate(matrix.createdAt)}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
});
