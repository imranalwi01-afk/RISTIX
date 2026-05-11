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
  'PENDING': '#2196f3',  // Blue (In progress)
  'IN_PROGRESS': '#2196f3',
  'COMPLETED': '#4caf50',
  'REVIEWED': '#ff9800',
  'NEW': '#ff9800',       // Amber (Not yet processed)
  'SUBMITTED': '#ff9800', // Amber (Waiting for approval)
  'APPROVED': '#4caf50',  // Green
  'REJECTED': '#f44336'   // Red
};

export const FILTER_DEFAULTS = {
  search: '',
  stage: '',
  impairedFlag: '',
  assessmentStatus: '',
  priorityLevel: '',
  ratingCode: '',
  downloadDate: '' // New field for Date Filter
};
