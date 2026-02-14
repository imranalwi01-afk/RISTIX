// packages/frontend/src/components/common/ErrorState.tsx
// ============================================================================
// Reusable Error State Component
// ============================================================================
// Used across the application to show consistent error states
// Provides retry functionality and detailed error info in dev mode
// ============================================================================

import React from 'react';
import { Box, Typography, Button, Alert, AlertTitle, alpha, useTheme } from '@mui/material';
import { Error as ErrorIcon, Refresh, BugReport } from '@mui/icons-material';

export interface ErrorStateProps {
    error: Error | string;
    onRetry?: () => void;
    variant?: 'alert' | 'page' | 'inline';
    title?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    error,
    onRetry,
    variant = 'page',
    title = 'Something went wrong'
}) => {
    const theme = useTheme();
    const isDev = process.env.NODE_ENV === 'development';
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error !== 'string' && isDev ? error.stack : undefined;

    if (variant === 'alert') {
        return (
            <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                action={
                    onRetry && (
                        <Button 
                            color="inherit" 
                            size="small" 
                            onClick={onRetry}
                            startIcon={<Refresh />}
                        >
                            Retry
                        </Button>
                    )
                }
            >
                <AlertTitle>{title}</AlertTitle>
                {errorMessage}
            </Alert>
        );
    }

    if (variant === 'inline') {
        return (
            <Box sx={{ py: 2, px: 3, borderRadius: 1, bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                <Typography variant="body2" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ErrorIcon fontSize="small" />
                    {errorMessage}
                </Typography>
                {onRetry && (
                    <Button 
                        size="small" 
                        color="error" 
                        onClick={onRetry}
                        startIcon={<Refresh />}
                        sx={{ mt: 1 }}
                    >
                        Try Again
                    </Button>
                )}
            </Box>
        );
    }

    // variant === 'page'
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
                    color: theme.palette.error.main,
                    mb: 3,
                    opacity: 0.8
                }}
            >
                <ErrorIcon sx={{ fontSize: 80 }} />
            </Box>
            
            <Typography
                variant="h6"
                color="error"
                sx={{ mb: 1, fontWeight: 600 }}
            >
                {title}
            </Typography>
            
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, maxWidth: 500 }}
            >
                {errorMessage}
            </Typography>
            
            {onRetry && (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onRetry}
                    startIcon={<Refresh />}
                >
                    Try Again
                </Button>
            )}

            {/* Dev Mode: Show error stack */}
            {isDev && errorStack && (
                <Box
                    sx={{
                        mt: 4,
                        p: 2,
                        bgcolor: alpha(theme.palette.error.main, 0.05),
                        borderRadius: 1,
                        maxWidth: 600,
                        width: '100%',
                        textAlign: 'left'
                    }}
                >
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}
                    >
                        <BugReport fontSize="small" />
                        Developer Info (not shown in production)
                    </Typography>
                    <pre
                        style={{
                            fontSize: '10px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            margin: 0,
                            color: theme.palette.text.secondary
                        }}
                    >
                        {errorStack}
                    </pre>
                </Box>
            )}
        </Box>
    );
};

export default ErrorState;
