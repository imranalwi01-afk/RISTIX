'use client';

import React from 'react';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import { STAGE_COLORS, STAGE_LABELS, PRIORITY_COLORS, ASSESSMENT_STATUS_COLORS } from './constants';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getStageColor = (stage: number) => STAGE_COLORS[stage] || '#757575';
export const getStageLabel = (stage: number) => STAGE_LABELS[stage] || `Stage ${stage}`;

export const renderStageChip = (stage: number) => {
  const color = getStageColor(stage);
  return (
    <Chip
      label={getStageLabel(stage)}
      size="small"
      sx={{
        backgroundColor: alpha(color, 0.15),
        color: color,
        fontWeight: 700,
        fontSize: '0.65rem',
        border: `1px solid ${alpha(color, 0.3)}`,
        borderRadius: '6px',
        '& .MuiChip-label': { px: 1 }
      }}
    />
  );
};

export const renderPriorityChip = (priority: string) => {
  const color = PRIORITY_COLORS[priority] || '#757575';
  return (
    <Chip
      label={priority}
      size="small"
      sx={{
        backgroundColor: alpha(color, 0.15),
        color: color,
        fontWeight: 700,
        fontSize: '0.65rem',
        border: `1px solid ${alpha(color, 0.3)}`,
        borderRadius: '6px',
        '& .MuiChip-label': { px: 1 }
      }}
    />
  );
};

export const renderImpairedFlag = (flag: string) => {
  const isImpaired = flag === 'I';
  return (
    <Chip
      label={isImpaired ? 'Impaired' : 'Non-Impaired'}
      size="small"
      sx={{
        backgroundColor: alpha(isImpaired ? '#d32f2f' : '#2e7d32', 0.1),
        color: isImpaired ? '#d32f2f' : '#2e7d32',
        fontWeight: 700,
        fontSize: '0.65rem',
        border: `1px solid ${alpha(isImpaired ? '#d32f2f' : '#2e7d32', 0.2)}`,
        borderRadius: '6px',
      }}
    />
  );
};

export const renderAssessmentStatus = (status: string | undefined | null) => {
  const safeStatus = status || 'NEW';
  const color = ASSESSMENT_STATUS_COLORS[safeStatus] || '#757575';

  return (
    <Chip
      label={safeStatus.replace('_', ' ')}
      size="small"
      sx={{
        backgroundColor: alpha(color, 0.15),
        color: color,
        fontWeight: 700,
        fontSize: '0.65rem',
        border: `1px solid ${alpha(color, 0.3)}`,
        borderRadius: '6px',
        '& .MuiChip-label': { px: 1 }
      }}
    />
  );
};
