'use client';

import { bankingAPI } from '@/services/api';
import type { EnterpriseColumnFilterValue, EnterpriseSort } from '@/types/enterprise-table';

export interface ApprovalRequestQueryInput {
  page?: number;
  limit: number;
  searchTerm: string;
  statusFilter: string;
  priorityFilter: string;
  bankingTypeFilter: string;
  requestTypeFilter: string;
  levelFilter: string;
  riskLevelFilter: string;
  columnFilters?: Record<string, EnterpriseColumnFilterValue>;
  sort?: EnterpriseSort[];
}

function normalizeApprovalFilterValue(value: EnterpriseColumnFilterValue): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (Array.isArray(value)) return value.join(' ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function mapApprovalGridFiltersToBackend(
  filters: Record<string, EnterpriseColumnFilterValue>,
): Record<string, EnterpriseColumnFilterValue> {
  const mapped: Record<string, EnterpriseColumnFilterValue> = {};

  Object.entries(filters).forEach(([field, value]) => {
    if (normalizeApprovalFilterValue(value).trim().length === 0) return;

    if (field.startsWith('requestedAt.')) {
      mapped[field.replace('requestedAt.', 'createdAt.')] = value;
      return;
    }
    if (field === 'priority') {
      mapped.impactLevel = value;
      return;
    }
    if (field === 'requestType') {
      mapped.entityType = value;
      return;
    }
    if (field === 'level') {
      mapped.currentLevel = value;
      return;
    }

    mapped[field] = value;
  });

  return mapped;
}

export function buildApprovalRequestParams(input: ApprovalRequestQueryInput) {
  const filters: Record<string, EnterpriseColumnFilterValue> = {
    ...mapApprovalGridFiltersToBackend(input.columnFilters ?? {}),
  };

  if (input.statusFilter !== 'all') filters.status = input.statusFilter;
  if (input.priorityFilter !== 'all') filters.impactLevel = input.priorityFilter;
  if (input.bankingTypeFilter !== 'all') filters.bankingType = input.bankingTypeFilter;
  if (input.requestTypeFilter !== 'all') filters.entityType = input.requestTypeFilter;
  if (input.levelFilter !== 'all') filters.currentLevel = input.levelFilter;
  if (input.riskLevelFilter !== 'all') filters.riskLevel = input.riskLevelFilter;

  return {
    page: input.page,
    limit: input.limit,
    search: input.searchTerm || undefined,
    filters: Object.keys(filters).length > 0 ? JSON.stringify(filters) : undefined,
    sort: input.sort && input.sort.length > 0 ? JSON.stringify(input.sort) : undefined,
  };
}

export async function fetchApprovalRequestHistory(params: ApprovalRequestQueryInput) {
  return bankingAPI.approval.getApprovalHistory(buildApprovalRequestParams(params));
}

export async function fetchApprovalMatrices() {
  return bankingAPI.approval.getMatrices();
}

export async function fetchApprovalRouting(params?: {
  entityType?: string;
  operation?: 'create' | 'update' | 'delete';
  department?: string;
}) {
  return bankingAPI.approval.getRoutingOverview(params);
}
