'use client';

export interface RoleResponsibility {
  label: string;
  summary: string;
  scope: string;
  approvalLane?: string;
  color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const RESPONSIBILITY_BY_CODE: Record<string, RoleResponsibility> = {
  MAKER: {
    label: 'Maker',
    summary: 'Submits business changes for approval.',
    scope: 'Business initiation',
    color: 'secondary',
  },
  CHECKER: {
    label: 'Business Checker',
    summary: 'Performs first-line review for business changes.',
    scope: 'Business approval',
    approvalLane: 'Level 1',
    color: 'warning',
  },
  APPROVER: {
    label: 'Business Approver',
    summary: 'Final approver for business changes.',
    scope: 'Business approval',
    approvalLane: 'Level 2',
    color: 'success',
  },
  IAF_RISK_ANALYST: {
    label: 'Risk Maker',
    summary: 'Prepares collective impairment and analysis changes.',
    scope: 'Business maintenance',
    color: 'secondary',
  },
  IAF_IFRS_MANAGER: {
    label: 'IFRS 9 Checker',
    summary: 'Checker-level reviewer for IFRS 9 business changes.',
    scope: 'Business approval',
    approvalLane: 'Level 1',
    color: 'warning',
  },
  IAF_BANK_CRO: {
    label: 'Chief Business Approver',
    summary: 'Final business approver for material IFRS 9 changes.',
    scope: 'Business approval',
    approvalLane: 'Level 2',
    color: 'success',
  },
  IAF_TENANT_ADMIN: {
    label: 'Admin Checker',
    summary: 'Reviews user, role, and access-management changes.',
    scope: 'Admin approval',
    approvalLane: 'Level 1',
    color: 'primary',
  },
  IAF_TENANT_SUPERADMIN: {
    label: 'Admin Approver',
    summary: 'Final approver for tenant administration changes.',
    scope: 'Admin approval',
    approvalLane: 'Level 2',
    color: 'error',
  },
};

const normalizeRoleCode = (value: unknown): string =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, '_').toUpperCase() : '';

export const getRoleResponsibility = (roleLike: {
  name?: unknown;
  code?: unknown;
  displayName?: unknown;
}): RoleResponsibility => {
  const candidates = [
    normalizeRoleCode(roleLike.code),
    normalizeRoleCode(roleLike.name),
    normalizeRoleCode(roleLike.displayName),
  ].filter((entry) => entry.length > 0);

  for (const code of candidates) {
    const responsibility = RESPONSIBILITY_BY_CODE[code];
    if (responsibility) return responsibility;
  }

  return {
    label: 'Custom Role',
    summary: 'Custom responsibility. Review its permission bundle for exact scope.',
    scope: 'Custom',
    color: 'default',
  };
};
