'use client';

import {
  userActivityService,
  type ActivityFilters,
  type ActivityQueryResult,
  type ActivityStatistics,
  type UserActivityLog,
} from '@/services/user-activity.service';

export type UserActivityQueryInput = ActivityFilters;
export type { ActivityStatistics };

export async function fetchUserActivities(filters: UserActivityQueryInput): Promise<ActivityQueryResult> {
  return userActivityService.queryActivities(filters);
}

export async function fetchUserActivityStatistics(filters: Partial<ActivityFilters>): Promise<ActivityStatistics> {
  return userActivityService.getActivityStatistics(filters);
}

export type UserActivityLogDto = UserActivityLog;
