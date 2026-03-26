// packages/frontend/src/components/approval/index.ts
export { ApprovalStatusBadge } from './ApprovalStatusBadge';
export type { ApprovalStatusBadgeProps } from './ApprovalStatusBadge';
export { PendingChangesDialog } from './PendingChangesDialog';
export { ApprovalNotification } from './ApprovalNotification';
export { ApprovalActionDialog } from './ApprovalActionDialog';
export { ApprovalMatrixEditorDialog } from './ApprovalMatrixEditorDialog';
export {
  buildApprovalNotification,
  buildApprovalConflictNotification,
  createClosedApprovalNotification,
} from './approvalNotification.utils';
export type { ApprovalNotificationState } from './approvalNotification.utils';
