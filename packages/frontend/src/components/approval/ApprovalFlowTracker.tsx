'use client';

import React from 'react';
import {
  Box, Typography, Stepper, Step, StepLabel, StepIconProps, Chip,
  alpha, useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  Schedule as WaitingIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

interface ApprovalFlowStep {
  level: number;
  name: string;
  status: 'waiting' | 'active' | 'approved' | 'rejected' | 'skipped';
  action?: {
    type: 'approve' | 'reject' | 'request_info' | 'delegate';
    by?: string;
    at?: string;
    comment?: string;
  };
  requiredRoles: string[];
}

interface ApprovalFlowTrackerProps {
  currentLevel: number;
  levels: ApprovalFlowStep[];
  compact?: boolean;
}

function LevelStepIcon({ level, status }: { level: number; status: string }) {
  if (status === 'approved') return <CheckIcon sx={{ fontSize: 20, color: 'success.main' }} />;
  if (status === 'rejected') return <CancelIcon sx={{ fontSize: 20, color: 'error.main' }} />;
  if (status === 'active') return <PendingIcon sx={{ fontSize: 20, color: 'warning.main' }} />;
  return <WaitingIcon sx={{ fontSize: 20, color: 'text.disabled' }} />;
}

export default function ApprovalFlowTracker({ currentLevel, levels, compact }: ApprovalFlowTrackerProps) {
  const theme = useTheme();

  if (!levels || levels.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PendingIcon fontSize="small" />
        Approval Flow
        <Chip size="small" label={`Level ${currentLevel} of ${levels.length}`} variant="outlined" sx={{ height: 20, fontSize: 11 }} />
      </Typography>

      <Stepper
        activeStep={levels.findIndex((l) => l.level === currentLevel)}
        orientation={compact ? 'horizontal' : 'vertical'}
        sx={{
          '& .MuiStepConnector-line': compact ? {} : { minHeight: 32 },
          '& .MuiStepLabel-label': { fontSize: '0.8rem' },
        }}
      >
        {levels.sort((a, b) => a.level - b.level).map((step) => {
          const isActive = step.level === currentLevel;
          const isCompleted = step.status === 'approved';
          const isRejected = step.status === 'rejected';

          return (
            <Step key={step.level} active={isActive} completed={isCompleted}>
              <StepLabel
                StepIconComponent={() => <LevelStepIcon level={step.level} status={step.status} />}
                optional={
                  step.action?.at ? (
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(step.action.at), { addSuffix: true })}
                    </Typography>
                  ) : isActive ? (
                    <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
                      Waiting for approval
                    </Typography>
                  ) : null
                }
                sx={{
                  '& .MuiStepLabel-label': {
                    color: isRejected ? 'error.main' : isCompleted ? 'success.main' : isActive ? 'text.primary' : 'text.disabled',
                    fontWeight: isActive || isCompleted ? 600 : 400,
                  },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {step.name}
                  {step.action?.by && (
                    <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                      — {step.action.by}
                    </Typography>
                  )}
                </Typography>

                {step.action?.comment && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic', mt: 0.25 }}>
                    "{step.action.comment}"
                  </Typography>
                )}

                {!compact && step.requiredRoles.length > 0 && (
                  <Box sx={{ mt: 0.5, display: 'flex', gap: 0.3, flexWrap: 'wrap' }}>
                    {step.requiredRoles.map((role) => (
                      <Chip
                        key={role}
                        label={role}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 18, fontSize: 10,
                          color: isActive ? 'primary.main' : 'text.disabled',
                          borderColor: isActive ? 'primary.light' : 'divider',
                        }}
                      />
                    ))}
                  </Box>
                )}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}
