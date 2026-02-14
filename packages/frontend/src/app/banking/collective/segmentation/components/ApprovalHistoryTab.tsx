
import React from 'react';
import {
  Box,
  Typography,
  Paper,
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
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Schedule as PendingIcon,
  Edit as DraftIcon,
  Send as SubmittedIcon
} from '@mui/icons-material';

interface ApprovalHistoryItem {
  id: string;
  status: 'Draft' | 'Submitted' | 'Pending' | 'Approved' | 'Rejected';
  timestamp: string;
  user: string;
  comment?: string;
  role?: string;
}

interface ApprovalHistoryTabProps {
  history: ApprovalHistoryItem[];
}

export default function ApprovalHistoryTab({ history }: ApprovalHistoryTabProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <ApprovedIcon />;
      case 'Rejected': return <RejectedIcon />;
      case 'Submitted': return <SubmittedIcon />;
      case 'Pending': return <PendingIcon />;
      default: return <DraftIcon />;
    }
  };

  const getStatusColor = (status: string): "success" | "error" | "primary" | "secondary" | "info" | "warning" | "grey" | "inherit" => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Submitted': return 'primary';
      case 'Pending': return 'warning';
      default: return 'grey';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom color="primary">Approval Audit Trail</Typography>
      
      {history.length > 0 ? (
        <Timeline position="alternate">
          {history.map((item, index) => (
            <TimelineItem key={item.id}>
              <TimelineOppositeContent color="text.secondary">
                <Typography variant="caption" display="block">
                  {new Date(item.timestamp).toLocaleString()}
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                  {item.user}
                </Typography>
                {item.role && (
                   <Typography variant="caption" display="block" sx={{ fontStyle: 'italic' }}>
                     {item.role}
                   </Typography>
                )}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color={getStatusColor(item.status)}>
                  {getStatusIcon(item.status)}
                </TimelineDot>
                {index < history.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" component="span" fontWeight="bold" color={`${getStatusColor(item.status)}.main`}>
                    {item.status}
                  </Typography>
                  {item.comment && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {item.comment}
                    </Typography>
                  )}
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          No approval history available for this record.
        </Alert>
      )}
    </Box>
  );
}
