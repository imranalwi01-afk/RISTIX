'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  History as HistoryIcon,
  AddCircle as CreateIcon,
  Edit as UpdateIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Send as SubmitIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import {
  individualImpairmentAPI,
  type IndividualImpairmentWatchlistItem
} from '@/services/api.individual-impairment';

interface AssessmentHistoryTabProps {
  account: IndividualImpairmentWatchlistItem | null;
}

interface HistoryEvent {
  id: string;
  entityId: string;
  entityType: string;
  action: 'CREATE' | 'UPDATE' | 'REVIEW' | 'SUBMIT' | 'APPROVE' | 'REJECT';
  actor: string;
  timestamp: string;
  details: string;
  status: string;
}

export function AssessmentHistoryTab({ account }: AssessmentHistoryTabProps) {
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (account?.account_id) {
      fetchHistory();
    }
  }, [account]);

  const fetchHistory = async () => {
    if (!account?.account_id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await individualImpairmentAPI.assessment.getHistory(account.account_id);
      if (response.success) {
        setHistory(response.data);
      } else {
        setHistory([]); // Fallback or empty
      }
    } catch (err: any) {
      console.error('Failed to fetch history:', err);
      setError('Failed to load history data.');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <CreateIcon fontSize="small" />;
      case 'UPDATE': return <UpdateIcon fontSize="small" />;
      case 'SUBMIT': return <SubmitIcon fontSize="small" />;
      case 'APPROVE': case 'REVIEW': return <ApproveIcon fontSize="small" />;
      case 'REJECT': return <RejectIcon fontSize="small" />;
      default: return <HistoryIcon fontSize="small" />;
    }
  };

  const getEventColor = (action: string): "primary" | "secondary" | "success" | "error" | "info" | "warning" | "grey" => {
    switch (action) {
      case 'CREATE': return 'primary';
      case 'UPDATE': return 'info';
      case 'SUBMIT': return 'warning';
      case 'APPROVE': case 'REVIEW': return 'success';
      case 'REJECT': return 'error';
      default: return 'grey';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (!account) {
    return <Alert severity="info">Please select an account to view its history.</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <HistoryIcon sx={{ mr: 1 }} />
        Assessment History & Audit Trail
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        {loading ? (
          <Box>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ display: 'flex', mb: 2 }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                <Box sx={{ width: '100%' }}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
              </Box>
            ))}
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : history.length === 0 ? (
          <Alert severity="info" variant="outlined">
            No history records found for this account. Actions taken on the assessment will appear here.
          </Alert>
        ) : (
          <Timeline position="right">
            {history.map((event, index) => (
              <TimelineItem key={event.id || index}>
                <TimelineOppositeContent sx={{ flex: 0.2, minWidth: '150px', pt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(event.timestamp)}
                  </Typography>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={getEventColor(event.action)}>
                    {getEventIcon(event.action)}
                  </TimelineDot>
                  {index < history.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent sx={{ py: '12px', px: 2 }}>
                  <Paper elevation={1} sx={{ p: 2, bgcolor: '#fafafa' }}>
                    <Typography variant="subtitle2" component="span" sx={{ fontWeight: 'bold' }}>
                      {event.action.replace('_', ' ')}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {event.details}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        icon={<PersonIcon sx={{ fontSize: '14px !important' }} />}
                        label={event.actor || 'System'}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                      {event.status && (
                        <Chip
                          label={event.status}
                          size="small"
                          color={event.status === 'APPROVED' ? 'success' : event.status === 'REJECTED' ? 'error' : 'default'}
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      )}
                    </Box>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </Paper>
    </Box>
  );
}
