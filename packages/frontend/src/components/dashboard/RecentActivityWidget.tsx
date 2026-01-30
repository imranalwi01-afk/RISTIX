"use client";

import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Box,
    Chip
} from '@mui/material';
import {
    Timeline,
    Edit,
    Add,
    Delete,
    Security,
    Login,
    Logout,
    Error as ErrorIcon,
    Info
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { auditAPI } from '@/services/api';
import { useTheme } from '@mui/material/styles';

interface AuditLog {
    id: string;
    eventType: string;
    action: string;
    description?: string;
    createdAt: string;
    userId?: string;
    entityType?: string;
}

const RecentActivityWidget: React.FC = () => {
    const [activities, setActivities] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const theme = useTheme();

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setLoading(true);
                // Fetch top 5 recent logs
                const response = await auditAPI.getLogs({
                    page: 1,
                    limit: 5,
                });
                const data = response.data || [];
                setActivities(data);
            } catch (err) {
                console.error('Failed to fetch recent activities:', err);
                setError('Failed to load activities');
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    const getIcon = (action: string, eventType: string) => {
        const lowerAction = action.toLowerCase();
        const lowerType = eventType.toLowerCase();

        if (lowerAction.includes('login')) return <Login color="success" />;
        if (lowerAction.includes('logout')) return <Logout color="action" />;
        if (lowerAction.includes('create') || lowerAction.includes('add')) return <Add color="primary" />;
        if (lowerAction.includes('update') || lowerAction.includes('edit')) return <Edit color="info" />;
        if (lowerAction.includes('delete') || lowerAction.includes('remove')) return <Delete color="error" />;
        if (lowerType.includes('security')) return <Security color="warning" />;

        return <Info color="action" />;
    };

    if (loading) {
        return (
            <Card sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <CircularProgress />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <Typography color="error">{error}</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center' }}>
                    <Timeline sx={{ mr: 1 }} />
                    Recent System Activity
                </Typography>
                <List>
                    {activities.length === 0 ? (
                        <ListItem>
                            <ListItemText primary="No recent activity found." />
                        </ListItem>
                    ) : (
                        activities.map((activity) => (
                            <ListItem key={activity.id} sx={{ px: 0, py: 1 }} divider>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    {getIcon(activity.action, activity.eventType)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box component="span" sx={{ fontWeight: 500, display: 'block' }}>
                                            {activity.action}
                                        </Box>
                                    }
                                    secondary={
                                        <React.Fragment>
                                            <Typography component="span" variant="body2" color="text.primary">
                                                {activity.userId || 'System'}
                                            </Typography>
                                            {" — "}
                                            {activity.description || activity.entityType}
                                            <br />
                                            <Typography component="span" variant="caption" color="text.secondary">
                                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                            </Typography>
                                        </React.Fragment>
                                    }
                                />
                            </ListItem>
                        ))
                    )}
                </List>
            </CardContent>
        </Card>
    );
};

export default RecentActivityWidget;
