'use client'

import React, { useMemo, useState } from 'react'
import {
    Alert,
    Badge,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tab,
    Tabs,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material'
import {
    AccessTime,
    Bolt,
    Cancel,
    CheckCircle,
    DeleteSweep,
    ErrorOutline,
    Notifications as NotificationsIcon,
    Refresh,
} from '@mui/icons-material'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/providers/NotificationProvider'
import type { NotificationPayload } from '@/hooks/useNotificationSocket'
import { formatNotificationCategory, getNotificationCategory, NOTIFICATION_CATEGORIES, resolveNotificationActionRoute } from '@/utils/notification-utils'

interface NotificationBellProps {
    colorMode?: 'light' | 'dark'
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ colorMode = 'light' }) => {
    const router = useRouter()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
    const [activeCategory, setActiveCategory] = useState<'all' | 'approval' | 'workflow' | 'analytics' | 'system'>('all')
    const [isRefreshing, setIsRefreshing] = useState(false)
    const {
        notifications,
        unreadCount,
        isConnected,
        isLoading,
        loadError,
        acknowledgeNotification,
        clearNotifications,
        refreshNotifications,
    } = useNotifications()

    const open = Boolean(anchorEl)

    const categoryCounts = useMemo(() => {
        const base = {
            approval: 0,
            workflow: 0,
            analytics: 0,
            system: 0,
        }

        notifications.forEach((item) => {
            const category = item.category || getNotificationCategory(item.type)
            base[category] += 1
        })

        return base
    }, [notifications])

    const visibleNotifications = useMemo(() => {
        const data = notifications
            .filter((item) => (activeTab === 'unread' ? !item.readAt : true))
            .filter((item) => (activeCategory === 'all'
                ? true
                : (item.category || getNotificationCategory(item.type)) === activeCategory))

        return data.slice(0, 20)
    }, [activeCategory, activeTab, notifications])

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await refreshNotifications()
        } finally {
            setIsRefreshing(false)
        }
    }

    const handleNotificationClick = (notification: NotificationPayload) => {
        if (!notification.readAt) {
            acknowledgeNotification(notification.id)
        }

        const route = resolveNotificationActionRoute(notification.actionUrl)
        if (!route) return

        if (/^https?:\/\//i.test(route)) {
            window.open(route, '_blank', 'noopener,noreferrer')
            handleClose()
            return
        }

        router.push(route)
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

    return (
        <>
            <Tooltip title={isConnected ? 'Notifications' : 'Notifications (offline)'}>
                <IconButton
                    size="small"
                    onClick={handleClick}
                    sx={{
                        ml: 1,
                        color: colorMode === 'dark' ? 'inherit' : '#1565C0',
                        backgroundColor: alpha(colorMode === 'dark' ? '#fff' : '#1565C0', 0.05),
                        '&:hover': {
                            backgroundColor: alpha(colorMode === 'dark' ? '#fff' : '#1565C0', 0.1),
                        },
                    }}
                >
                    <Badge
                        badgeContent={unreadCount > 99 ? '99+' : unreadCount}
                        color="error"
                        sx={{
                            '& .MuiBadge-badge': {
                                fontSize: '0.65rem',
                                height: 16,
                                minWidth: 16,
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
                        width: 420,
                        maxHeight: 560,
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
                <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                        Notifications
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            label={isConnected ? 'Live' : 'Offline'}
                            size="small"
                            color={isConnected ? 'success' : 'default'}
                            variant={isConnected ? 'filled' : 'outlined'}
                        />
                        <Tooltip title="Refresh">
                            <span>
                                <IconButton size="small" onClick={handleRefresh} disabled={isRefreshing}>
                                    {isRefreshing ? <CircularProgress size={14} /> : <Refresh fontSize="small" />}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Mark all as read">
                            <span>
                                <IconButton size="small" onClick={clearNotifications} disabled={unreadCount === 0}>
                                    <DeleteSweep fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>
                </Box>

                <Tabs
                    value={activeTab}
                    onChange={(_event, value) => setActiveTab(value)}
                    sx={{ px: 1 }}
                >
                    <Tab value="all" label={`All (${notifications.length})`} />
                    <Tab value="unread" label={`Unread (${unreadCount})`} />
                </Tabs>

                <Box sx={{ px: 1.5, pb: 1, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    <Chip
                        size="small"
                        label={`All (${notifications.length})`}
                        color={activeCategory === 'all' ? 'primary' : 'default'}
                        variant={activeCategory === 'all' ? 'filled' : 'outlined'}
                        onClick={() => setActiveCategory('all')}
                    />
                    {NOTIFICATION_CATEGORIES.map((category) => (
                        <Chip
                            key={category}
                            size="small"
                            label={`${formatNotificationCategory(category)} (${categoryCounts[category]})`}
                            color={activeCategory === category ? 'primary' : 'default'}
                            variant={activeCategory === category ? 'filled' : 'outlined'}
                            onClick={() => setActiveCategory(category)}
                        />
                    ))}
                </Box>

                <Divider />

                {isLoading && (
                    <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
                        <CircularProgress size={22} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Loading notifications...
                        </Typography>
                    </Box>
                )}

                {!isLoading && loadError && (
                    <Box sx={{ p: 2 }}>
                        <Alert
                            severity="warning"
                            action={(
                                <Button color="inherit" size="small" onClick={handleRefresh}>
                                    Retry
                                </Button>
                            )}
                        >
                            {loadError}
                        </Alert>
                    </Box>
                )}

                {!isLoading && !loadError && visibleNotifications.length === 0 && (
                    <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
                        <NotificationsIcon sx={{ fontSize: 42, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </Typography>
                    </Box>
                )}

                {!isLoading && !loadError && visibleNotifications.length > 0 && (
                    <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
                        {visibleNotifications.map((notification) => {
                            const isUnread = !notification.readAt
                            const clickable = Boolean(resolveNotificationActionRoute(notification.actionUrl))
                            const category = notification.category || getNotificationCategory(notification.type)

                            return (
                                <MenuItem
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    sx={{
                                        px: 2,
                                        py: 1.5,
                                        alignItems: 'flex-start',
                                        backgroundColor: isUnread ? alpha('#1976d2', 0.05) : 'transparent',
                                        '&:hover': {
                                            backgroundColor: alpha('#1976d2', 0.1),
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>
                                        {getNotificationIcon(notification.type)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={(
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <Typography variant="body2" fontWeight={isUnread ? 700 : 500} sx={{ flex: 1 }}>
                                                    {notification.title}
                                                </Typography>
                                                {isUnread && (
                                                    <Box
                                                        sx={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            bgcolor: 'primary.main',
                                                        }}
                                                    />
                                                )}
                                                {clickable && (
                                                    <Typography variant="caption" color="primary.main">
                                                        Open
                                                    </Typography>
                                                )}
                                                <Chip
                                                    size="small"
                                                    label={formatNotificationCategory(category)}
                                                    variant="outlined"
                                                    sx={{ height: 18, fontSize: '0.65rem' }}
                                                />
                                            </Box>
                                        )}
                                        secondary={(
                                            <>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                    {notification.message}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled">
                                                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                                </Typography>
                                            </>
                                        )}
                                    />
                                </MenuItem>
                            )
                        })}
                    </Box>
                )}

                <Divider />

                <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        size="small"
                        onClick={() => {
                            router.push('/banking/notifications')
                            handleClose()
                        }}
                    >
                        View All
                    </Button>
                    <Button size="small" onClick={handleRefresh} disabled={isRefreshing}>
                        Refresh
                    </Button>
                </Box>
            </Menu>
        </>
    )
}
