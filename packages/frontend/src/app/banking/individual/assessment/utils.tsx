import React from 'react';
import { Chip } from '@mui/material';
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
  return (
    <Chip
      label={getStageLabel(stage)}
      size="small"
      sx={{
        backgroundColor: getStageColor(stage),
        color: 'white',
        fontWeight: 'bold'
      }}
    />
  );
};

export const renderPriorityChip = (priority: string) => {
  return (
    <Chip
      label={priority}
      size="small"
      sx={{
        backgroundColor: PRIORITY_COLORS[priority] || '#757575',
        color: 'white',
        fontWeight: 'bold'
      }}
    />
  );
};

export const renderImpairedFlag = (flag: string) => {
  return (
    <Chip
      label={flag === 'I' ? 'Impaired' : 'Non-Impaired'}
      size="small"
      color={flag === 'I' ? 'error' : 'success'}
      variant="outlined"
    />
  );
};

export const renderAssessmentStatus = (status: string | undefined | null) => {
  const safeStatus = status || 'PENDING';
  const bgColor = ASSESSMENT_STATUS_COLORS[safeStatus] || '#757575';

  return (
    <Chip
      label={safeStatus.replace('_', ' ')}
      size="small"
      sx={{
        backgroundColor: bgColor,
        color: 'white',
        fontWeight: 'bold'
      }}
    />
  );
};
