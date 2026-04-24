'use client';

import type { QueryClient } from '@tanstack/react-query';
import { businessQueryKeys } from './query-keys';

export async function invalidateBusinessFeature(queryClient: QueryClient, feature: string) {
  await queryClient.invalidateQueries({ queryKey: businessQueryKeys.feature(feature) });
}

export async function invalidateBusinessList(queryClient: QueryClient, feature: string) {
  await queryClient.invalidateQueries({ queryKey: businessQueryKeys.list(feature) });
}

export async function invalidateBusinessDetail(queryClient: QueryClient, feature: string, id: string | number) {
  await queryClient.invalidateQueries({ queryKey: businessQueryKeys.detail(feature, id) });
}
