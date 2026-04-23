'use client';

import { bankingAPI } from '@/services/api';

export async function fetchJobExecutions() {
  return bankingAPI.jobs.getExecutions({ limit: 100 });
}

export async function fetchJobDefinitions() {
  return bankingAPI.jobs.getDefinitions();
}

export async function fetchJobMetrics() {
  return bankingAPI.jobs.getMetrics();
}

export async function fetchJobExecutionRuntime(executionId: string) {
  return bankingAPI.jobs.getExecutionRuntime(executionId);
}
