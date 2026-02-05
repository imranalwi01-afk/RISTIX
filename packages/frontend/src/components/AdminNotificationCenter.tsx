'use client'

import React, { useState, useEffect } from 'react'
import { useNotifications, type NotificationPayload } from '@/hooks/useNotificationSocket'
import {
    Alert,
    AlertTitle,
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    Box,
    Paper,
    IconButton,
    Divider,
    Typography,
    Chip,
} from '@mui/material'
import {
    Error as ErrorIcon,
    CheckCircle,
    AccessTime,
    Cancel,
    Bolt,
    NotificationsActive,
    Close,
    OpenInNew,
} from '@mui/icons-material'

export function AdminNotificationCenter() {
    const { notifications, unreadCount, clearNotifications, acknowledgeNotification } = useNotifications()
    const [isOpen, setIsOpen] = useState(false)

    const getIcon = (type: NotificationPayload['type']) => {
        switch (type) {
            case 'APPROVAL_PENDING':
                return <AccessTime sx={{ width: 16, height: 16 }} />
            case 'APPROVAL_APPROVED':
                return <CheckCircle sx={{ width: 16, height: 16, color: 'success.main' }} />
            case 'APPROVAL_REJECTED':
                return <Cancel sx={{ width: 16, height: 16, color: 'error.main' }} />
            case 'ECL_STARTED':
                return <Bolt sx={{ width: 16, height: 16, color: 'info.main' }} />
            case 'ECL_COMPLETED':
                return <CheckCircle sx={{ width: 16, height: 16, color: 'success.main' }} />
            case 'ECL_FAILED':
                return <ErrorIcon sx={{ width: 16, height: 16, color: 'error.main' }} />
            case 'COMPLIANCE_ALERT':
                return <ErrorIcon sx={{ width: 16, height: 16, color: 'warning.main' }} />
            default:
                return <NotificationsActive sx={{ width: 16, height: 16 }} />
        }
    }

    const getSeverityColor = (severity: NotificationPayload['severity']) => {
        switch (severity) {
            case 'success':
                return 'success.light'
            case 'warning':
                return 'warning.light'
            case 'error':
                return 'error.light'
            case 'info':
            default:
                return 'info.light'
        }
    }

    const getAlertSeverity = (severity: NotificationPayload['severity']): 'success' | 'warning' | 'error' | 'info' => {
        switch (severity) {
            case 'success':
                return 'success'
            case 'warning':
                return 'warning'
            case 'error':
                return 'error'
            case 'info':
            default:
                return 'info'
        }
    }

    return (
        <Box sx={{ position: 'relative' }}>
            {/* Notification Bell Button */}
            <IconButton
                onClick={() => setIsOpen(!isOpen)}
                sx={{ position: 'relative' }}
            >
                <NotificationsActive sx={{ width: 20, height: 20 }} />
                {unreadCount > 0 && (
                    <Badge
                        badgeContent={unreadCount > 99 ? '99+' : unreadCount}
                        color="error"
                        sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                        }}
                    />
                )}
            </IconButton>

            {/* Notification Dropdown */}
            {isOpen && (
                <Paper
                    sx={{
                        position: 'absolute',
                        right: 0,
                        top: 48,
                        width: 384,
                        boxShadow: 3,
                        zIndex: 1300,
                        maxHeight: '96px * 4',
                        overflow: 'hidden',
                    }}
                >
                    <CardHeader
                        title="Notifications"
                        action={
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {notifications.length > 0 && (
                                    <Button
                                        size="small"
                                        onClick={clearNotifications}
                                        sx={{ fontSize: '0.75rem' }}
                                    >
                                        Clear All
                                    </Button>
                                )}
                                <IconButton
                                    size="small"
                                    onClick={() => setIsOpen(false)}
                                    sx={{ width: 24, height: 24 }}
                                >
                                    <Close sx={{ width: 16, height: 16 }} />
                                </IconButton>
                            </Box>
                        }
                        sx={{
                            pb: 1,
                        }}
                    />

                    <CardContent
                        sx={{
                            p: 0,
                            maxHeight: 384,
                            overflow: 'auto',
                        }}
                    >
                        {notifications.length === 0 ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    p: 2,
                                    color: 'text.secondary',
                                    fontSize: '0.875rem',
                                }}
                            >
                                No notifications
                            </Box>
                        ) : (
                            <Box>
                                {notifications.map((notification, index) => (
                                    <React.Fragment key={notification.id}>
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                '&:hover': {
                                                    backgroundColor: '#f5f5f5',
                                                },
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s',
                                                backgroundColor: getSeverityColor(notification.severity),
                                            }}
                                            onClick={() => acknowledgeNotification(notification.id)}
                                        >
                                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                                <Box sx={{ flex: '0 0 auto', pt: 0.25 }}>
                                                    {getIcon(notification.type)}
                                                </Box>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            justifyContent: 'space-between',
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    color: 'text.primary',
                                                                }}
                                                            >
                                                                {notification.title}
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: 'text.secondary',
                                                                    mt: 0.25,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                }}
                                                            >
                                                                {notification.message}
                                                            </Typography>
                                                        </Box>
                                                        <Chip
                                                            label={notification.severity}
                                                            size="small"
                                                            color={getAlertSeverity(notification.severity)}
                                                            variant="outlined"
                                                            sx={{
                                                                flex: '0 0 auto',
                                                                fontSize: '0.7rem',
                                                            }}
                                                        />
                                                    </Box>

                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            mt: 1,
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            sx={{ color: 'text.secondary' }}
                                                        >
                                                            {new Date(notification.timestamp).toLocaleTimeString()}
                                                        </Typography>
                                                        {notification.actionUrl && (
                                                            <Button
                                                                size="small"
                                                                href={notification.actionUrl}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setIsOpen(false)
                                                                }}
                                                                sx={{
                                                                    fontSize: '0.75rem',
                                                                    textTransform: 'none',
                                                                    display: 'flex',
                                                                    gap: 0.5,
                                                                }}
                                                                endIcon={<OpenInNew sx={{ width: 12, height: 12 }} />}
                                                            >
                                                                View
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                        {index < notifications.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </Box>
                        )}
                    </CardContent>
                </Paper>
            )}
        </Box>
    )
}

/**
 * Toast notification display (for real-time alerts)
 */
export function NotificationToast({ notification }: { notification: NotificationPayload }) {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(false), 5000)
        return () => clearTimeout(timer)
    }, [])

    if (!isVisible) return null

    return (
        <Alert
            severity={getToastAlertSeverity(notification.severity)}
            sx={{ mb: 2 }}
            action={
                <IconButton
                    size="small"
                    onClick={() => setIsVisible(false)}
                >
                    <Close sx={{ width: 16, height: 16 }} />
                </IconButton>
            }
        >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Box sx={{ flex: '0 0 auto' }}>{getToastIcon(notification.type)}</Box>
                <Box sx={{ flex: 1 }}>
                    <AlertTitle>{notification.title}</AlertTitle>
                    <Typography variant="body2">{notification.message}</Typography>
                </Box>
            </Box>
        </Alert>
    )
}

function getToastIcon(type: NotificationPayload['type']) {
    switch (type) {
        case 'APPROVAL_APPROVED':
            return <CheckCircle sx={{ width: 20, height: 20, color: 'success.main' }} />
        case 'APPROVAL_REJECTED':
            return <Cancel sx={{ width: 20, height: 20, color: 'error.main' }} />
        case 'ECL_COMPLETED':
            return <CheckCircle sx={{ width: 20, height: 20, color: 'success.main' }} />
        case 'ECL_FAILED':
            return <ErrorIcon sx={{ width: 20, height: 20, color: 'error.main' }} />
        default:
            return <NotificationsActive sx={{ width: 20, height: 20 }} />
    }
}

function getToastAlertSeverity(severity: NotificationPayload['severity']): 'success' | 'warning' | 'error' | 'info' {
    switch (severity) {
        case 'success':
            return 'success'
        case 'warning':
            return 'warning'
        case 'error':
            return 'error'
        case 'info':
        default:
            return 'info'
    }
}
