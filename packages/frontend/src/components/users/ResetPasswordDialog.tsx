'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControlLabel,
    Switch,
    Alert,
    Box,
    Typography
} from '@mui/material';
import { PasswordInput } from './PasswordInput';
import { usersAPI } from '@/services/api';
import { getErrorMessage } from '@/utils/error-message';

interface ResetPasswordDialogProps {
    open: boolean;
    onClose: () => void;
    userId: string | null;
    userName: string | null;
    tenantId?: string; // Optional, required for multi-tenant
    onSuccess?: () => void;
}

export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
    open,
    onClose,
    userId,
    userName,
    tenantId,
    onSuccess
}) => {
    const [password, setPassword] = useState('');
    const [forceChange, setForceChange] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setPassword('');
            setForceChange(true);
            setError(null);
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!userId) return;
        
        if (password.trim().length < 8) {
            setError('Reset password must be at least 8 characters.');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            await usersAPI.resetPassword(
                userId,
                {
                    newPassword: password,
                    forcePasswordChange: forceChange,
                },
                tenantId
            );
            
            // Notify success and close
            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Failed to reset user password:', err);
            const msg = getErrorMessage(err, 'Operation failed');
            setError(`Failed to reset password: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => !loading && onClose()} maxWidth="sm" fullWidth>
            <DialogTitle>
                Reset Password {userName ? `for ${userName}` : ''}
            </DialogTitle>
            <DialogContent dividers>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        You are about to reset the password for this user. You can manually type a new password or auto-generate a secure one.
                    </Typography>
                </Box>

                <PasswordInput
                    fullWidth
                    label="New Password"
                    value={password}
                    onChange={setPassword}
                    required
                    helperText="Minimum 8 characters"
                    margin="normal"
                />

                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={forceChange}
                                onChange={(e) => setForceChange(e.target.checked)}
                                color="warning"
                            />
                        }
                        label="Force password change on next login"
                    />
                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1, ml: 4 }}>
                        When enabled, the user will be prompted to change this temporary password immediately after they log in. This is recommended for security.
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button 
                    variant="contained" 
                    color="warning" 
                    onClick={handleSubmit} 
                    disabled={loading || password.length < 8}
                >
                    {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
