export const STAKEHOLDER_TYPES = {
    PLATFORM_ADMIN: 'platform_admin',
    BANK_ADMIN: 'bank_admin',
    BANK_USER: 'bank_user',
    CONSULTANT: 'consultant',
    REGULATOR: 'regulator',
} as const;

export const BANKING_TYPES = {
    CONVENTIONAL: 'conventional',
    DUAL: 'dual',
} as const;

export const IFRS9_STAGES = {
    STAGE_1: 'stage_1',
    STAGE_2: 'stage_2',
    STAGE_3: 'stage_3',
} as const;

export const PROJECT_TYPES = {
    IMPLEMENTATION: 'implementation',
    VALIDATION: 'validation',
    AUDIT: 'audit',
    TRAINING: 'training',
} as const;

export const PROJECT_STATUSES = {
    PLANNING: 'planning',
    ACTIVE: 'active',
    REVIEW: 'review',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
} as const;
