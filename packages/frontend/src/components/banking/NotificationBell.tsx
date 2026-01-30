'use client'

import React, { useState } from 'react'
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Box,
    Typography,
    Divider,
    ListItemIcon,
    ListItemText,
    Chip,
    alpha,
    Tooltip,
} from '@mui/material'
import {
    Notifications as NotificationsIcon,
    CheckCircle,
    Cancel,
    AccessTime,
    Bolt,
    ErrorOutline,
    MarkEmailRead,
    DeleteSweep,
} from '@mui/icons-material'
import { useNotifications } from '@/providers/NotificationProvider'
import { formatDistanceToNow } from 'date-fns'

interface NotificationBellProps {
    colorMode?: 'light' | 'dark'
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ colorMode = 'light' }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const { notifications, unreadCount, isConnected, acknowledgeNotification, clearNotifications } = useNotifications()

    const open = Boolean(anchorEl)

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleNotificationClick = (notificationId: string) => {
        acknowledgeNotification(notificationId)
    }

    const handleClearAll = () => {
        clearNotifications()
        handleClose()
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'APPROVAL_APPROVED':
                return <CheckCircle sx={{ color: 'success.main' }} fontSize="small" />
            case 'APPROVAL_REJECTED':
                return <Cancel sx={{ color: 'error.main' }} fontSize="small" />
            case 'APPROVAL_PENDING':
                return <AccessTime sx={{ color: 'warning.main' }} fontSize="small" />
            case 'ECL_STARTED':
                return <Bolt sx={{ color: 'info.main' }} fontSize="small" />
            case 'ECL_COMPLETED':
                return <CheckCircle sx={{ color: 'success.main' }} fontSize="small" />
            case 'ECL_FAILED':
                return <ErrorOutline sx={{ color: 'error.main' }} fontSize="small" />
            default:
                return <NotificationsIcon fontSize="small" />
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'success':
                return 'success'
            case 'error':
                return 'error'
            case 'warning':
                return 'warning'
            case 'info':
            default:
                return 'info'
        }
    }

    return (
        <>
            <Tooltip title={isConnected ? 'Notifications (Connected)' : 'Notifications (Disconnected)'}>
                <IconButton
                    size="small"
                    onClick={handleClick}
                    sx={{
                        color: colorMode === 'dark' ? 'inherit' : '#1565C0',
                        backgroundColor: alpha(colorMode === 'dark' ? '#fff' : '#1565C0', 0.05),
                        '&:hover': {
                            backgroundColor: alpha(colorMode === 'dark' ? '#fff' : '#1565C0', 0.1),
                        },
                    }}
                >
                    <Badge
                        badgeContent={unreadCount}
                        color="error"
                        sx={{
                            '& .MuiBadge-badge': {
                                fontSize: '0.65rem',
                                height: '16px',
                                minWidth: '16px',
                            },
                        }}
                    >
                        <NotificationsIcon fontSize="small" />
                    </Badge>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        width: 380,
                        maxHeight: 480,
                        mt: 1.5,
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
            >
                {/* Header */}
                <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                        Notifications
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: isConnected ? 'success.main' : 'error.main',
                            }}
                        />
                        {unreadCount > 0 && (
                            <Tooltip title="Clear all">
                                <IconButton size="small" onClick={handleClearAll}>
                                    <DeleteSweep fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </Box>

                <Divider />

                {/* Notification List */}
                {notifications.length === 0 ? (
                    <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
                        <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            No notifications yet
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
                        {notifications.map((notification, index) => (
                            <MenuItem
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification.id)}
                                sx={{
                                    px: 2,
                                    py: 1.5,
                                    alignItems: 'flex-start',
                                    borderLeft: 3,
                                    borderColor: `${getSeverityColor(notification.severity)}.main`,
                                    '&:hover': {
                                        backgroundColor: alpha(
                                            getSeverityColor(notification.severity) === 'info' ? '#1976d2' : `${getSeverityColor(notification.severity)}.main`,
                                            0.08
                                        ),
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                                    {getNotificationIcon(notification.type)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="body2" fontWeight={500}>
                                                {notification.title}
                                            </Typography>
                                            <Chip
                                                label={notification.type.replace(/_/g, ' ')}
                                                size="small"
                                                sx={{
                                                    height: 18,
                                                    fontSize: '0.65rem',
                                                    ml: 1,
                                                }}
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                {notification.message}
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled">
                                                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                            </Typography>
                                        </>
                                    }
                                />
                            </MenuItem>
                        ))}
                    </Box>
                )}
            </Menu>
        </>
    )
}
