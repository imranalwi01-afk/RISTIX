export const STAGE_COLORS: Record<number, string> = {
  1: '#4caf50', // Green
  2: '#ff9800', // Amber/Orange
  3: '#f44336'  // Red
};

export const STAGE_LABELS: Record<number, string> = {
  1: 'Stage 1',
  2: 'Stage 2',
  3: 'Stage 3'
};

export const PRIORITY_COLORS: Record<string, string> = {
  'LOW': '#4caf50',
  'MEDIUM': '#ff9800',
  'HIGH': '#ff5722',
  'CRITICAL': '#f44336'
};

export const ASSESSMENT_STATUS_COLORS: Record<string, string> = {
  'PENDING': '#757575',
  'IN_PROGRESS': '#2196f3',
  'COMPLETED': '#4caf50',
  'REVIEWED': '#ff9800',
  'NEW': '#2196f3',      // Blue-1
  'APPROVED': '#9e9e9e'  // Grey-3
};

export const FILTER_DEFAULTS = {
  search: '',
  stage: '',
  impairedFlag: '',
  assessmentStatus: '',
  priorityLevel: '',
  ratingCode: ''
};
