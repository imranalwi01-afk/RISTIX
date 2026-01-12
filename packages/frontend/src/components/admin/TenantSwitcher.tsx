import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Menu,
    MenuItem,
    Typography,
    Chip,
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
    const isPlatformAdmin = user?.role?.includes('PLATFORM_') ||
        user?.email === 'admin@iaf-system.local' ||
        // Fallback to checking the token stored role if available (via direct prop or other means, but user object is best)
        false;

    const currentTenantName = user?.tenantSlug || 'system';

    useEffect(() => {
        if (isPlatformAdmin && open && tenants.length === 0) {
            fetchTenants();
        }
    }, [isPlatformAdmin, open]);

    const fetchTenants = async () => {
        setLoading(true);
        try {
            const config = frontendEnvironmentLoader.getConfiguration();
            const baseUrl = config.api.base || `${config.api.backend}/api/v1`;

            // Use admin mode to see system tenant too if needed, though mostly we want to switch to others
            const response = await fetch(`${baseUrl}/auth/login-data?mode=admin`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Pass the auth token if we needed it for a protected route, 
                    // but login-data is public. However, for admin mode validation the backend *might* 
                    // eventually require auth. Currently it's public.
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

        // Storing the preferred impersonation tenant in localStorage
        localStorage.setItem('impersonated_tenant_slug', tenantSlug);

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
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : (
                    tenants.map((tenant) => (
                        <MenuItem
                            key={tenant.id}
                            onClick={() => handleSwitch(tenant.slug)}
                            selected={tenant.slug === currentTenantName}
                        >
                            <ListItemIcon>
                                {tenant.slug === 'system' ? <AdminPanelSettings fontSize="small" /> : <Business fontSize="small" />}
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
                )}
            </Menu>
        </Box>
    );
};
