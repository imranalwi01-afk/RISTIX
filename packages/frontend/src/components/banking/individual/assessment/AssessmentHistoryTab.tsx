import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  Skeleton,
  Alert,
  Grid,
  Stack
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  TimelinePosition
} from '@mui/lab';
import {
  History as HistoryIcon,
  AddCircle as CreateIcon,
  Edit as UpdateIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Send as SubmitIcon,
  Person as PersonIcon,
  PendingActions as PendingIcon
} from '@mui/icons-material';
import { 
  individualImpairmentAPI, 
  type IndividualImpairmentWatchlistItem 
} from '@/services/api.individual-impairment';
import { approvalAPI } from '@/services/api/approval.api';

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
type HistoryFilter = 'ALL' | 'SUBMIT' | 'APPROVE' | 'REJECT' | 'UPDATE';

const STATUS_COLOR_MAP: Record<string, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  DRAFT: 'default',
};

export function AssessmentHistoryTab({ account }: AssessmentHistoryTabProps) {
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<HistoryFilter>('ALL');

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
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        setHistory(response.data);
      } else {
        // Fallback: derive timeline from approval requests when IA audit trail is empty.
        const fallback = await buildHistoryFromApprovalRequests();
        setHistory(fallback);
      }
    } catch (err: any) {
      console.error('Failed to fetch history:', err);
      try {
        const fallback = await buildHistoryFromApprovalRequests();
        setHistory(fallback);
        if (fallback.length === 0) setError('Failed to load history data.');
      } catch {
        setError('Failed to load history data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const buildHistoryFromApprovalRequests = async (): Promise<HistoryEvent[]> => {
    if (!account?.account_id) return [];

    const accountIdStr = String(account.account_id);
    const accountNumberStr = String(account.account_number || '');
    const response = await approvalAPI.getApprovalHistory({ page: 1, limit: 200 });
    const rows: any[] = Array.isArray(response?.data) ? response.data : [];

    const related = rows.filter((row) => {
      const entityType = String(row?.entityType || row?.requestType || '').toLowerCase();
      if (!entityType.includes('individual')) return false;

      const entityId = String(row?.entityId || '');
      const payload = row?.requestData || {};
      const data = payload?.data || {};
      const payloadAccountId = String(data?.accountId || data?.account_id || '');
      const payloadAccountNumber = String(data?.accountNumber || data?.account_number || '');

      return entityId === accountIdStr
        || payloadAccountId === accountIdStr
        || (accountNumberStr.length > 0 && payloadAccountNumber === accountNumberStr);
    });

    return related
      .map((row) => {
        const status = String(row?.status || '').toUpperCase();
        const action: HistoryEvent['action'] =
          status === 'APPROVED' ? 'APPROVE'
            : status === 'REJECTED' ? 'REJECT'
              : 'SUBMIT';

        return {
          id: String(row?.id || `REQ-${row?.entityId || Math.random()}`),
          entityId: String(row?.entityId || accountIdStr),
          entityType: String(row?.entityType || 'individual_assessment_consolidated'),
          action,
          actor: String(row?.requestedByName || row?.requestedBy || row?.createdBy || 'System'),
          timestamp: String(row?.updatedAt || row?.completedAt || row?.createdAt || new Date().toISOString()),
          details: String(row?.description || row?.requestTitle || row?.title || 'Approval workflow event'),
          status: status || 'PENDING',
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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

  const sortedHistory = [...history].sort((a, b) => {
    const ta = new Date(a.timestamp).getTime();
    const tb = new Date(b.timestamp).getTime();
    return Number.isFinite(tb - ta) ? tb - ta : 0;
  });
  const ascHistory = [...sortedHistory].reverse();

  const latestEvent = sortedHistory[0];
  const lastSubmit = sortedHistory.find((e) => e.action === 'SUBMIT');
  const lastApprove = sortedHistory.find((e) => e.action === 'APPROVE');
  const lastReject = sortedHistory.find((e) => e.action === 'REJECT');

  const timelinePosition: TimelinePosition = 'right';

  const currentState = (() => {
    if (lastApprove) return 'APPROVED';
    if (lastReject) return 'REJECTED';
    if (lastSubmit) return 'PENDING';
    return 'DRAFT';
  })();

  const submissionCount = sortedHistory.filter((e) => e.action === 'SUBMIT').length;
  const approvalCount = sortedHistory.filter((e) => e.action === 'APPROVE').length;
  const rejectionCount = sortedHistory.filter((e) => e.action === 'REJECT').length;

  const filteredHistory = sortedHistory.filter((event) => {
    if (filter === 'ALL') return true;
    if (filter === 'UPDATE') return event.action === 'CREATE' || event.action === 'UPDATE';
    return event.action === filter;
  });

  const groupedByCycle = (() => {
    let cycle = 1;
    const withCycleAsc = ascHistory.map((event) => {
      const eventWithCycle = { ...event, cycle };
      if (event.action === 'SUBMIT') cycle += 1;
      return eventWithCycle;
    });
    const withCycleDesc = withCycleAsc.reverse();
    const filteredWithCycle = withCycleDesc.filter((event) => {
      if (filter === 'ALL') return true;
      if (filter === 'UPDATE') return event.action === 'CREATE' || event.action === 'UPDATE';
      return event.action === filter;
    });

    const groups = new Map<number, Array<HistoryEvent & { cycle: number }>>();
    filteredWithCycle.forEach((event) => {
      const key = event.cycle;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(event);
    });

    return Array.from(groups.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([cycleNo, events]) => ({ cycleNo, events }));
  })();

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
          <Box>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Current Status</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      icon={currentState === 'PENDING' ? <PendingIcon /> : undefined}
                      label={currentState}
                      color={STATUS_COLOR_MAP[currentState] || 'default'}
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Last Action</Typography>
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
                    {latestEvent?.action || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {latestEvent ? formatDate(latestEvent.timestamp) : '-'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Submission Cycle</Typography>
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
                    {submissionCount > 0 ? `Submission #${submissionCount}` : 'Not submitted'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Outcome Summary</Typography>
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
                    {approvalCount} approved • {rejectionCount} rejected
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Process Snapshot
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} useFlexGap flexWrap="wrap">
                <Chip label={`Draft ${sortedHistory.some((e) => e.action === 'CREATE' || e.action === 'UPDATE') ? '✓' : '•'}`} color={sortedHistory.some((e) => e.action === 'CREATE' || e.action === 'UPDATE') ? 'success' : 'default'} variant="outlined" />
                <Chip label={`Submitted ${lastSubmit ? '✓' : '•'}`} color={lastSubmit ? 'success' : 'default'} variant="outlined" />
                <Chip label={`Approved ${lastApprove ? '✓' : '•'}`} color={lastApprove ? 'success' : 'default'} variant="outlined" />
                <Chip label={`Rejected ${lastReject ? '✓' : '•'}`} color={lastReject ? 'error' : 'default'} variant="outlined" />
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Event Filter
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
                {(['ALL', 'SUBMIT', 'APPROVE', 'REJECT', 'UPDATE'] as HistoryFilter[]).map((item) => (
                  <Chip
                    key={item}
                    label={item === 'UPDATE' ? 'CREATE/UPDATE' : item}
                    color={filter === item ? 'primary' : 'default'}
                    variant={filter === item ? 'filled' : 'outlined'}
                    onClick={() => setFilter(item)}
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Showing {filteredHistory.length} event(s)
              </Typography>
            </Paper>

            {groupedByCycle.length === 0 && (
              <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
                No events match the selected filter.
              </Alert>
            )}

            {groupedByCycle.map((group) => (
              <Box key={`cycle-${group.cycleNo}`} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Submission Cycle #{group.cycleNo}
                </Typography>
                <Timeline position={timelinePosition}>
                  {group.events.map((event, index) => (
                    <TimelineItem key={`${event.id || 'event'}-${index}`}>
                      <TimelineOppositeContent sx={{ flex: 0.2, minWidth: '150px', pt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(event.timestamp)}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color={getEventColor(event.action)}>
                          {getEventIcon(event.action)}
                        </TimelineDot>
                        {index < group.events.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Paper elevation={1} sx={{ p: 2, bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" component="span" sx={{ fontWeight: 'bold' }}>
                            {event.action.replace('_', ' ')}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {event.details}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
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
                                color={STATUS_COLOR_MAP[event.status] || 'default'}
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            )}
                          </Box>
                        </Paper>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
