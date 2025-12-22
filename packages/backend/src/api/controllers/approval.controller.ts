// packages/backend/src/api/controllers/approval.controller.ts
import { Request, Response } from 'express';
import { FourEyesApprovalService } from '../../core/services/approval/four-eyes-approval.service';

export class ApprovalController {
  private approvalService: FourEyesApprovalService;
  
  constructor() {
    // Mock config service for now
    const mockConfigService = {
      get: (key: string) => {
        const configs: any = {
          'approval.timeout': 24 * 60 * 60 * 1000, // 24 hours
          'approval.escalation.enabled': true,
          'approval.notifications.enabled': true
        };
        return configs[key];
      }
    };
    
    this.approvalService = new FourEyesApprovalService(mockConfigService);
  }
  
  createApprovalRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const approvalRequest = {
        ...req.body,
        tenantId: (req as any).tenant?.id || 'default-tenant',
        requestedBy: (req as any).user?.id || 'anonymous'
      };
      
      const approvalId = await this.approvalService.createApprovalRequest(approvalRequest);
      
      res.status(201).json({
        success: true,
        message: 'Approval request created successfully',
        data: {
          approvalId,
          status: 'pending'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create approval request',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  getApprovalRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Mock approval request details
      const approvalRequest = {
        id,
        requestType: 'user_creation',
        requestTitle: 'Create New Banking User',
        status: 'pending',
        requestedBy: 'user_123',
        requestedAt: new Date().toISOString(),
        approvalsRequired: 2,
        approvalsReceived: 1
      };
      
      res.json({
        success: true,
        data: approvalRequest
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get approval request',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  getApprovalRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = (req as any).tenant?.id || 'default-tenant';
      
      // Mock approval requests list
      const requests = [
        {
          id: 'approval_001',
          requestType: 'user_creation',
          requestTitle: 'Create New Banking User',
          status: 'pending',
          requestedBy: 'user_123',
          requestedAt: new Date().toISOString()
        }
      ];
      
      res.json({
        success: true,
        data: {
          requests,
          total: requests.length,
          tenantId
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get approval requests',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  cancelApprovalRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      res.json({
        success: true,
        message: 'Approval request cancelled',
        data: { id, status: 'cancelled' }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to cancel approval request',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  approveRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { decisionReason, conditions } = req.body;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Approval request ID is required'
        });
        return;
      }
      
      const approvalAction = {
        approvalRequestId: id,
        approverId: (req as any).user?.id || 'anonymous',
        approverRole: (req as any).user?.roles?.[0] || 'approver',
        approvalLevel: 1,
        action: 'approve' as const,
        decisionReason,
        conditions
      };
      
      const isCompleted = await this.approvalService.processApprovalAction(approvalAction);
      
      res.json({
        success: true,
        message: 'Request approved successfully',
        data: {
          approvalId: id,
          status: isCompleted ? 'completed' : 'pending_next_level'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to approve request',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  rejectRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { decisionReason } = req.body;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Approval request ID is required'
        });
        return;
      }
      
      const approvalAction = {
        approvalRequestId: id,
        approverId: (req as any).user?.id || 'anonymous',
        approverRole: (req as any).user?.roles?.[0] || 'approver',
        approvalLevel: 1,
        action: 'reject' as const,
        decisionReason
      };
      
      await this.approvalService.processApprovalAction(approvalAction);
      
      res.json({
        success: true,
        message: 'Request rejected',
        data: {
          approvalId: id,
          status: 'rejected'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to reject request',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  requestInformation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { requestReason } = req.body;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Approval request ID is required'
        });
        return;
      }
      
      const approvalAction = {
        approvalRequestId: id,
        approverId: (req as any).user?.id || 'anonymous',
        approverRole: (req as any).user?.roles?.[0] || 'approver',
        approvalLevel: 1,
        action: 'request_info' as const,
        decisionReason: requestReason
      };
      
      await this.approvalService.processApprovalAction(approvalAction);
      
      res.json({
        success: true,
        message: 'Additional information requested',
        data: {
          approvalId: id,
          status: 'info_requested'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to request information',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  delegateApproval = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { delegatedTo, delegationReason } = req.body;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Approval request ID is required'
        });
        return;
      }
      
      const approvalAction = {
        approvalRequestId: id,
        approverId: (req as any).user?.id || 'anonymous',
        approverRole: (req as any).user?.roles?.[0] || 'approver',
        approvalLevel: 1,
        action: 'delegate' as const,
        delegatedTo,
        delegationReason
      };
      
      await this.approvalService.processApprovalAction(approvalAction);
      
      res.json({
        success: true,
        message: 'Approval delegated successfully',
        data: {
          approvalId: id,
          delegatedTo,
          status: 'delegated'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delegate approval',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  getApprovalMatrix = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tenantId } = req.params;
      const matrixType = req.query.type as string || 'default';
      const bankingType = req.query.bankingType as string || 'conventional';
      
      if (!tenantId) {
        res.status(400).json({
          success: false,
          message: 'Tenant ID is required'
        });
        return;
      }
      
      const matrix = await this.approvalService.getApprovalMatrix(tenantId, matrixType, bankingType);
      
      res.json({
        success: true,
        data: matrix
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get approval matrix',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  createApprovalMatrix = async (req: Request, res: Response): Promise<void> => {
    try {
      res.json({
        success: true,
        message: 'Approval matrix created',
        data: { id: 'matrix_' + Date.now() }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create approval matrix',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  updateApprovalMatrix = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      res.json({
        success: true,
        message: 'Approval matrix updated',
        data: { id }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update approval matrix',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  deleteApprovalMatrix = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      res.json({
        success: true,
        message: 'Approval matrix deleted',
        data: { id }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete approval matrix',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  getPendingApprovals = async (req: Request, res: Response): Promise<void> => {
    try {
      const { approverId } = req.params;
      const approverRole = (req as any).user?.roles?.[0] || 'approver';
      
      if (!approverId) {
        res.status(400).json({
          success: false,
          message: 'Approver ID is required'
        });
        return;
      }
      
      const pendingApprovals = await this.approvalService.getPendingApprovals(approverId, approverRole);
      
      res.json({
        success: true,
        data: {
          approverId,
          pendingApprovals,
          count: pendingApprovals.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get pending approvals',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  getApprovalHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId, tenantId, startDate, endDate } = req.query;
      
      const history = await this.approvalService.getApprovalHistory(
        requestId as string,
        tenantId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      
      res.json({
        success: true,
        data: {
          history,
          count: history.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get approval history',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  getApprovalStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tenantId } = req.params;
      
      const statistics = {
        tenantId,
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        averageApprovalTime: 0
      };
      
      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get approval statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  getApprovalNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      
      const notifications = [
        {
          id: 'notif_001',
          userId,
          type: 'approval_pending',
          message: 'You have a pending approval request',
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ];
      
      res.json({
        success: true,
        data: {
          userId,
          notifications,
          unreadCount: notifications.filter(n => !n.isRead).length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get approval notifications',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      res.json({
        success: true,
        message: 'Notification marked as read',
        data: { id }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const isHealthy = await this.approvalService.healthCheck();
      
      res.json({
        success: true,
        status: isHealthy ? 'healthy' : 'unhealthy',
        message: 'Approval service health check'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}