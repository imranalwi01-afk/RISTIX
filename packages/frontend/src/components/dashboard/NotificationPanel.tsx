'use client'

import React from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Divider,
    Alert,
    Badge,
    alpha,
} from '@mui/material'
import {
    CheckCircle,
    Cancel,
    AccessTime,
    Bolt,
    ErrorOutline,
    NotificationsActive,
} from '@mui/icons-material'
import { useNotifications } from '@/providers/NotificationProvider'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationPanel() {
    const { notifications, isConnected } = useNotifications()

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'APPROVAL_APPROVED':
                return <CheckCircle sx={{ color: 'success.main' }} />
            case 'APPROVAL_REJECTED':
                return <Cancel sx={{ color: 'error.main' }} />
            case 'APPROVAL_PENDING':
                return <AccessTime sx={{ color: 'warning.main' }} />
            case 'ECL_STARTED':
                return <Bolt sx={{ color: 'info.main' }} />
            case 'ECL_COMPLETED':
                return <CheckCircle sx={{ color: 'success.main' }} />
            case 'ECL_FAILED':
                return <ErrorOutline sx={{ color: 'error.main' }} />
            default:
                return <NotificationsActive />
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
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <NotificationsActive color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                            Live Notifications
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: isConnected ? 'success.main' : 'error.main',
                            }}
                        />
                        <Typography variant="caption" color="text.secondary">
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </Typography>
                    </Box>
                </Box>

                {!isConnected && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Real-time notifications are currently disconnected. Trying to reconnect...
                    </Alert>
                )}

                {notifications.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <NotificationsActive sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                            No notifications yet
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            You'll see real-time updates here when workflows are processed
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {notifications.map((notification, index) => (
                            <React.Fragment key={notification.id}>
                                <ListItem
                                    alignItems="flex-start"
                                    sx={{
                                        borderLeft: 3,
                                        borderColor: `${getSeverityColor(notification.severity)}.main`,
                                        mb: 1,
                                        borderRadius: 1,
                                        backgroundColor: alpha(
                                            getSeverityColor(notification.severity) === 'info' ? '#1976d2' : `${getSeverityColor(notification.severity)}.main`,
                                            0.05
                                        ),
                                    }}
                                >
                                    <ListItemIcon sx={{ mt: 1 }}>
                                        {getNotificationIcon(notification.type)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    {notification.title}
                                                </Typography>
                                                <Chip
                                                    label={notification.type.replace(/_/g, ' ')}
                                                    size="small"
                                                    color={getSeverityColor(notification.severity) as any}
                                                    sx={{ height: 20, fontSize: '0.7rem' }}
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
                                </ListItem>
                                {index < notifications.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card>
    )
}
