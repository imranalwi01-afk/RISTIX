// packages/backend/src/api/routes/approval.routes.ts
import { Router } from 'express';
import { ApprovalController } from '../controllers/approval.controller';

const router = Router();
const approvalController = new ApprovalController();

// Approval request management
router.post('/requests', approvalController.createApprovalRequest);
router.get('/requests/:id', approvalController.getApprovalRequest);
router.get('/requests', approvalController.getApprovalRequests);
router.put('/requests/:id/cancel', approvalController.cancelApprovalRequest);

// Approval actions
router.post('/requests/:id/approve', approvalController.approveRequest);
router.post('/requests/:id/reject', approvalController.rejectRequest);
router.post('/requests/:id/request-info', approvalController.requestInformation);
router.post('/requests/:id/delegate', approvalController.delegateApproval);

// Approval matrix management
router.get('/matrix/:tenantId', approvalController.getApprovalMatrix);
router.post('/matrix', approvalController.createApprovalMatrix);
router.put('/matrix/:id', approvalController.updateApprovalMatrix);
router.delete('/matrix/:id', approvalController.deleteApprovalMatrix);

// Approval queues and dashboards
router.get('/pending/:approverId', approvalController.getPendingApprovals);
router.get('/history', approvalController.getApprovalHistory);
router.get('/statistics/:tenantId', approvalController.getApprovalStatistics);

// Notifications
router.get('/notifications/:userId', approvalController.getApprovalNotifications);
router.put('/notifications/:id/read', approvalController.markNotificationAsRead);

// Health check
router.get('/health', approvalController.healthCheck);

export default router;