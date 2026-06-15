'use client';

// packages/frontend/src/components/approval/ApprovalStatusBadge.tsx
import React from 'react';
import { Chip } from '@mui/material';
import {
    HourglassEmpty as PendingIcon,
    CheckCircle as ApprovedIcon,
    Cancel as RejectedIcon,
    Info as InfoIcon,
} from '@mui/icons-material';

export interface ApprovalStatusBadgeProps {
    status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
    size?: 'small' | 'medium';
    variant?: 'filled' | 'outlined';
}

export const ApprovalStatusBadge: React.FC<ApprovalStatusBadgeProps> = ({
    status,
    size = 'small',
    variant = 'filled',
}) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'pending':
                return {
                    label: 'Pending Approval',
                    color: 'warning' as const,
                    icon: <PendingIcon />,
                };
            case 'approved':
            case 'completed':
                return {
                    label: 'Approved',
                    color: 'success' as const,
                    icon: <ApprovedIcon />,
                };
            case 'rejected':
                return {
                    label: 'Rejected',
                    color: 'error' as const,
                    icon: <RejectedIcon />,
                };
            case 'active':
            default:
                return {
                    label: 'Active',
                    color: 'success' as const,
                    icon: <InfoIcon />,
                };
        }
    };

    const config = getStatusConfig();

    return (
        <Chip
            label={config.label}
            color={config.color}
            size={size}
            variant={variant}
            icon={config.icon}
        />
    );
};
