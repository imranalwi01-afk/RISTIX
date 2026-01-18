import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Menu,
    MenuItem,
    Typography,
    Avatar,
    Chip,
    Divider,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
    AccountCircle,
    Settings,
    ExitToApp,
    Mosque,
    SwapHoriz,
    AccountBalance
} from '@mui/icons-material';
import { useBankingTheme } from '../../../providers/BankingThemeProvider'; // Adjust path as needed
import { useAuth } from '../../../providers/AuthProvider'; // Adjust path as needed

interface BankingProfileMenuProps {
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
    userName: string;
    userRole: string | string[]; // layout uses string | string[] logic
}

export const BankingProfileMenu: React.FC<BankingProfileMenuProps> = ({
    anchorEl,
    open,
    onClose,
    userName,
    userRole
}) => {
    const theme = useTheme();
    const router = useRouter();
    const { bankingMode, colorMode } = useBankingTheme();
    const { logout } = useAuth();

    const handleLogout = async () => {
        onClose();
        try {
            if (logout) {
                await logout();
            } else {
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/login';
        }
    };

    const getBankingModeIcon = () => {
        switch (bankingMode) {
            case 'syariah': return <Mosque />;
            case 'dual': return <SwapHoriz />;
            default: return <AccountBalance />;
        }
    };

    const getBankingModeColor = () => {
        switch (bankingMode) {
            case 'syariah': return 'success';
            case 'dual': return 'warning';
            default: return 'primary';
        }
    };

    const getBankingModeLabel = () => {
        switch (bankingMode) {
            case 'syariah': return 'Islamic Banking';
            case 'dual': return 'Dual Banking';
            default: return 'Conventional Banking';
        }
    };

    const displayRole = (Array.isArray(userRole) ? userRole[0] : String(userRole || '')).replace(/_/g, ' ');

    return (
        <Menu
            id="user-menu"
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={open}
            onClose={onClose}
            TransitionProps={{ timeout: 200 }}
            PaperProps={{
                sx: {
                    width: 260,
                    mt: 1.5,
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    backgroundImage: colorMode === 'dark'
                        ? 'linear-gradient(rgba(30, 41, 59, 0.95), rgba(30, 41, 59, 0.95))'
                        : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                }
            }}
            MenuListProps={{ disablePadding: true }}
        >
            {/* Modern Menu Header */}
            <Box sx={{
                p: 2.5,
                background: colorMode === 'dark'
                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.dark, 0.3)} 100%)`
                    : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Avatar sx={{
                        width: 48,
                        height: 48,
                        bgcolor: theme.palette.primary.main,
                        color: '#fff',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                    }}>
                        {userName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ ml: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {displayRole}
                        </Typography>
                    </Box>
                </Box>

                <Chip
                    size="small"
                    label={getBankingModeLabel()}
                    color={getBankingModeColor() as any}
                    sx={{
                        height: 24,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        width: '100%',
                        justifyContent: 'flex-start',
                        pl: 1,
                        '& .MuiChip-label': { pl: 1 }
                    }}
                    icon={React.cloneElement(getBankingModeIcon() as React.ReactElement<any>, { style: { fontSize: 14 } })}
                />
            </Box>
            <Box sx={{ p: 1 }}>
                <MenuItem
                    onClick={() => { onClose(); router.push('/banking/settings/profile'); }}
                    sx={{
                        py: 1.5,
                        borderRadius: 2,
                        mb: 0.5,
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), transform: 'translateX(4px)' }
                    }}
                >
                    <AccountCircle sx={{ mr: 2, fontSize: '1.2rem', color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight={500}>Profile Settings</Typography>
                </MenuItem>

                <MenuItem
                    onClick={() => { onClose(); router.push('/banking/settings/preferences'); }}
                    sx={{
                        py: 1.5,
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), transform: 'translateX(4px)' }
                    }}
                >
                    <Settings sx={{ mr: 2, fontSize: '1.2rem', color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight={500}>Preferences</Typography>
                </MenuItem>

                <Divider sx={{ my: 1, borderColor: alpha(theme.palette.divider, 0.1) }} />

                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        color: 'error.main',
                        py: 1.5,
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08), transform: 'translateX(4px)' }
                    }}
                >
                    <ExitToApp sx={{ mr: 2, fontSize: '1.2rem' }} />
                    <Typography variant="body2" fontWeight={600}>Sign Out</Typography>
                </MenuItem>
            </Box>
        </Menu>
    );
};
