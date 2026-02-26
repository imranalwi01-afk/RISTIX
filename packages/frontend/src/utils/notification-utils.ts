import type { NotificationCategory } from '@/services/api/notification.api'

export const NOTIFICATION_CATEGORIES: Array<NotificationCategory> = ['approval', 'workflow', 'analytics', 'system']

export const getNotificationCategory = (type?: string): NotificationCategory => {
  const normalized = String(type || '').toUpperCase()
  if (normalized.startsWith('APPROVAL_')) return 'approval'
  if (normalized.startsWith('WORKFLOW_')) return 'workflow'
  if (normalized.startsWith('ECL_') || normalized.startsWith('ANALYTICS_')) return 'analytics'
  return 'system'
}

export const formatNotificationCategory = (category: NotificationCategory): string =>
  category.charAt(0).toUpperCase() + category.slice(1)

export const resolveNotificationActionRoute = (actionUrl?: string): string | null => {
  if (!actionUrl) return null
  const normalized = String(actionUrl).trim()
  if (!normalized) return null

  if (/^https?:\/\//i.test(normalized)) return normalized
  if (normalized.startsWith('/banking/')) return normalized
  if (normalized.startsWith('/approvals/')) return '/banking/workflow/approval'
  if (normalized.startsWith('/workflows/')) return '/banking/workflow/monitoring'
  if (normalized.startsWith('/')) return normalized

  return null
}
