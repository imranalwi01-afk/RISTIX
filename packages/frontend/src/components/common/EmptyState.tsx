// packages/frontend/src/components/common/EmptyState.tsx
// ============================================================================
// Reusable Empty State Component
// ============================================================================
// Used across the application to show consistent empty states
// when data is not available (but not an error condition)
// ============================================================================

import React from 'react';
import { Box, Typography, Button, Paper, alpha, useTheme } from '@mui/material';
import { Inbox, CloudOff, FilterList, SearchOff } from '@mui/icons-material';

export interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    variant?: 'default' | 'search' | 'filter' | 'offline';
}

const DEFAULT_ICONS = {
    default: <Inbox sx={{ fontSize: 80 }} />,
    search: <SearchOff sx={{ fontSize: 80 }} />,
    filter: <FilterList sx={{ fontSize: 80 }} />,
    offline: <CloudOff sx={{ fontSize: 80 }} />
};

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
    variant = 'default'
}) => {
    const theme = useTheme();
    const displayIcon = icon || DEFAULT_ICONS[variant];

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 300,
                py: 6,
                px: 3,
                textAlign: 'center'
            }}
        >
            <Box
                sx={{
                    color: alpha(theme.palette.text.secondary, 0.3),
                    mb: 3
                }}
            >
                {displayIcon}
            </Box>
            
            <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 1, fontWeight: 600 }}
            >
                {title}
            </Typography>
            
            {description && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3, maxWidth: 400 }}
                >
                    {description}
                </Typography>
            )}
            
            {action && (
                <Box sx={{ mt: 2 }}>
                    {action}
                </Box>
            )}
        </Box>
    );
};

export default EmptyState;
