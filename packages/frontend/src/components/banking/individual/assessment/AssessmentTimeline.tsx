import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Skeleton,
  Alert,
  Divider
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

interface AssessmentTimelineProps {
  account: IndividualImpairmentWatchlistItem | null;
  compact?: boolean;
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

export const AssessmentTimeline: React.FC<AssessmentTimelineProps> = ({ account, compact = false }) => {
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
        // Sort by timestamp descending (newest first)
        const sortedHistory = (response.data || []).sort((a: HistoryEvent, b: HistoryEvent) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setHistory(sortedHistory);
      } else {
        setHistory([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch history:', err);
      // Fallback data for demo purposes if API fails
      if (process.env.NODE_ENV === 'development') {
         setHistory([
             {
                 id: '1',
                 entityId: String(account.account_id),
                 entityType: 'ASSESSMENT',
                 action: 'CREATE',
                 actor: 'System',
                 timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
                 details: 'Assessment created automatically from watchlist',
                 status: 'PENDING'
             }
         ]);
      } else {
         setError('Failed to load history data.');
      }
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
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (!account) return null;

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  if (history.length === 0) {
    return compact ? null : (
      <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
        No history records found.
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: compact ? 0 : 0 }}>
      {!compact && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <HistoryIcon sx={{ mr: 1 }} />
            Approval Timeline
          </Typography>
          <Divider />
        </Box>
      )}
      
      <Timeline 
        position="right" 
        sx={{ 
          p: 0, 
          m: 0,
          '& .MuiTimelineItem-root:before': {
            flex: 0,
            padding: 0
          }
        }}
      >
        {history.map((event, index) => (
          <TimelineItem key={event.id || index}>
            <TimelineSeparator>
              <TimelineDot color={getEventColor(event.action)} size="small">
                {getEventIcon(event.action)}
              </TimelineDot>
              {index < history.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle2" component="span" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                    {event.action.replace('_', ' ')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {formatDate(event.timestamp)}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem', mb: 1 }}>
                  {event.details}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    icon={<PersonIcon sx={{ fontSize: '12px !important' }} />} 
                    label={event.actor || 'System'} 
                    size="small" 
                    variant="outlined" 
                    sx={{ fontSize: '0.65rem', height: 18 }}
                  />
                </Box>
              </Box>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
};
