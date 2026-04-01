import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Menu,
    MenuItem,
    Typography,
    CircularProgress,
    Divider,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    SwapHoriz,
    Business,
    Check,
    AdminPanelSettings
} from '@mui/icons-material';
import { frontendEnvironmentLoader } from '../../config/environment-loader-frontend';
import { useAuth } from '../../providers/AuthProvider';
import { getAuthToken } from '../../utils/auth-token';

interface TenantOption {
    id: string;
    slug: string;
    name: string;
    displayName?: string;
    bankingType: string;
    isActive: boolean;
}

export const TenantSwitcher: React.FC = () => {
    const { user } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [tenants, setTenants] = useState<TenantOption[]>([]);
    const [loading, setLoading] = useState(false);
    const open = Boolean(anchorEl);

    // Only show for platform admins
    const userPermissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const isPlatformAdmin =
        user?.stakeholderType === 'platform' ||
        userPermissions.includes('admin.super_admin') ||
        userPermissions.includes('admin.system.manage') ||
        userPermissions.includes('PLATFORM_ADMIN') ||
        !!user?.isPlatformAdmin;

    const currentTenantName =
        (typeof window !== 'undefined' ? localStorage.getItem('impersonated_tenant_slug') : null) ||
        user?.tenantSlug ||
        'system';

    useEffect(() => {
        if (isPlatformAdmin && open && tenants.length === 0) {
            fetchTenants();
        }
    }, [isPlatformAdmin, open]);

    const toApiV1BaseUrl = (rawValue: string): string => {
        let normalized = (rawValue || '').trim().replace(/\/+$/, '');
        while (/\/api\/v1$/i.test(normalized)) {
            normalized = normalized.replace(/\/api\/v1$/i, '');
        }
        return normalized.length > 0 ? `${normalized}/api/v1` : '/api/v1';
    };

    const fetchTenants = async () => {
        setLoading(true);
        try {
            const config = frontendEnvironmentLoader.getConfiguration();
            const baseUrl = toApiV1BaseUrl(config?.api?.base || config?.api?.backend || '');
            const token = getAuthToken();

            // Use admin mode to see system tenant too if needed, though mostly we want to switch to others
            const response = await fetch(`${baseUrl}/auth/login-data?mode=admin`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setTenants(result.data.tenants);
                }
            }
        } catch (error) {
            console.error('Failed to fetch tenants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSwitch = async (tenantSlug: string) => {
        handleClose();
        if (tenantSlug === currentTenantName) return;

        // In a real implementation with valid session management, we would:
        // 1. Call an API to switch the active session's context
        // 2. OR Update the local token if it supports impersonation constraints
        // 3. OR simply reload the page with a new 'X-Tenant-ID' header strategy if the backend supports stateless impersonation

        // For now, let's assume we reload the window and the AuthProvider/Interceptor 
        // will pick up the specific tenant preference if we store it.

        if (tenantSlug === 'system') {
            localStorage.removeItem('impersonated_tenant_slug');
        } else {
            localStorage.setItem('impersonated_tenant_slug', tenantSlug);
        }

        // Force reload to apply new context
        window.location.reload();
    };

    if (!isPlatformAdmin) return null;

    return (
        <Box sx={{ mr: 1 }}>
            <Button
                onClick={handleClick}
                size="small"
                variant="outlined"
                startIcon={<AdminPanelSettings />}
                endIcon={<SwapHoriz />}
                sx={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'inherit',
                    textTransform: 'none',
                    '&:hover': {
                        borderColor: 'rgba(255,255,255,0.5)',
                        backgroundColor: 'rgba(255,255,255,0.05)'
                    }
                }}
            >
                {currentTenantName === 'system' ? 'System Admin' : `Impersonating: ${currentTenantName}`}
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: { width: 320, maxHeight: 400 }
                }}
            >
                <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Switch Tenant Context
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Viewing data as if you were in this tenant.
                    </Typography>
                </Box>

                {loading ? (
                    <MenuItem disabled sx={{ justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={20} />
                    </MenuItem>
                ) : (
                    [
                        <MenuItem
                            key="system-context"
                            onClick={() => handleSwitch('system')}
                            selected={currentTenantName === 'system'}
                        >
                            <ListItemIcon>
                                <AdminPanelSettings fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="System Context" secondary="No tenant impersonation" />
                            {currentTenantName === 'system' && (
                                <Check fontSize="small" color="primary" />
                            )}
                        </MenuItem>,
                        <Divider key="divider" />,
                        ...tenants.map((tenant) => (
                            <MenuItem
                                key={tenant.id}
                                onClick={() => handleSwitch(tenant.slug)}
                                selected={tenant.slug === currentTenantName}
                            >
                                <ListItemIcon>
                                    <Business fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={tenant.displayName || tenant.name}
                                    secondary={tenant.slug}
                                />
                                {tenant.slug === currentTenantName && (
                                    <Check fontSize="small" color="primary" />
                                )}
                            </MenuItem>
                        ))
                    ]
                )}
            </Menu>
        </Box>
    );
};
