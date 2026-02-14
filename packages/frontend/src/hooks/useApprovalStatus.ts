// packages/frontend/src/hooks/useApprovalStatus.ts
import { useState, useEffect } from 'react';
import { bankingAPI } from '@/services/api';

export interface ApprovalRequest {
    id: string;
    entityType: string;
    entityId?: string;
    status: 'pending' | 'approved' | 'rejected';
    requestData: any;
    createdAt: string;
    updatedAt: string;
}

export function useApprovalStatus(entityType: string, entityId?: string) {
    const [hasPending, setHasPending] = useState(false);
    const [pendingRequest, setPendingRequest] = useState<ApprovalRequest | null>(null);
    const [loading, setLoading] = useState(false);

    const checkApprovalStatus = async () => {
        if (!entityId) {
            setHasPending(false);
            setPendingRequest(null);
            return;
        }

        try {
            setLoading(true);
            // Get all pending approvals and filter by entity
            const response = await bankingAPI.approval.getPendingApprovals();
            const requests = Array.isArray(response) ? response : response.data || [];

            // Find pending request for this specific entity
            const request = requests.find(
                (r: any) =>
                    r.entityType === entityType &&
                    r.entityId === entityId &&
                    r.status === 'pending'
            );

            setHasPending(!!request);
            setPendingRequest(request || null);
        } catch (error) {
            console.error('Error checking approval status:', error);
            setHasPending(false);
            setPendingRequest(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkApprovalStatus();
    }, [entityType, entityId]);

    return {
        hasPending,
        pendingRequest,
        loading,
        refresh: checkApprovalStatus,
    };
}
