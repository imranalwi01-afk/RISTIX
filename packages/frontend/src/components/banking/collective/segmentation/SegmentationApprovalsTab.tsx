
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Stack,
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Schedule as PendingIcon,
  Edit as DraftIcon,
  Send as SubmittedIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Comment as CommentIcon
} from '@mui/icons-material';

interface ApprovalHistoryItem {
  id: string | number;
  status: 'Draft' | 'Submitted' | 'Pending' | 'Approved' | 'Rejected';
  timestamp: string;
  user: string;
  comment?: string;
  role?: string;
}

interface SegmentationApprovalsTabProps {
  history: ApprovalHistoryItem[];
  currentStatus: string;
}

export const SegmentationApprovalsTab: React.FC<SegmentationApprovalsTabProps> = ({
  history,
  currentStatus
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <ApprovedIcon color="success" />;
      case 'Rejected': return <RejectedIcon color="error" />;
      case 'Submitted': return <SubmittedIcon color="primary" />;
      case 'Pending': return <PendingIcon color="warning" />;
      default: return <DraftIcon color="action" />;
    }
  };

  const getStatusColor = (status: string): "success" | "error" | "primary" | "warning" | "default" => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Submitted': return 'primary';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Grid container spacing={4}>
        {/* Current Status Banner */}
        <Grid item xs={12}>
           <Paper 
                variant="outlined" 
                sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    bgcolor: '#f8fafc', 
                    borderLeft: '6px solid', 
                    borderLeftColor: `${getStatusColor(currentStatus)}.main`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    {getStatusIcon(currentStatus)}
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">Current Segment Status</Typography>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: `${getStatusColor(currentStatus)}.dark` }}>
                            {currentStatus.toUpperCase()}
                        </Typography>
                    </Box>
                </Stack>
                <Chip 
                    label={currentStatus === 'Approved' ? 'Production Ready' : 'Under Review'} 
                    color={currentStatus === 'Approved' ? 'success' : 'warning'}
                    variant="soft"
                    sx={{ fontWeight: 'bold' }}
                />
           </Paper>
        </Grid>

        {/* Audit Trail Section */}
        <Grid item xs={12} md={8}>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">Audit Trail & History</Typography>
            </Box>
            
            {history.length > 0 ? (
                <Stepper orientation="vertical" sx={{ ml: 2 }}>
                    {history.map((item, index) => (
                        <Step key={item.id} active={true}>
                            <StepLabel
                                icon={getStatusIcon(item.status)}
                                sx={{ 
                                    '& .MuiStepLabel-label': { fontWeight: 'bold' } 
                                }}
                            >
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="subtitle2">{item.status}</Typography>
                                    <Typography variant="caption" color="text.secondary">•</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(item.timestamp).toLocaleString()}
                                    </Typography>
                                </Stack>
                            </StepLabel>
                            <StepContent>
                                <Paper variant="outlined" sx={{ p: 2, mt: 1, borderRadius: 2, bgcolor: '#fff' }}>
                                    <Stack direction="row" spacing={2} alignItems="flex-start">
                                        <PersonIcon sx={{ color: 'text.secondary', fontSize: 18, mt: 0.5 }} />
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">
                                                {item.user} {item.role && `(${item.role})`}
                                            </Typography>
                                            {item.comment && (
                                                <Stack direction="row" spacing={1} sx={{ mt: 1, color: 'text.secondary' }}>
                                                    <CommentIcon sx={{ fontSize: 16 }} />
                                                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                                        "{item.comment}"
                                                    </Typography>
                                                </Stack>
                                            )}
                                        </Box>
                                    </Stack>
                                </Paper>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
            ) : (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No historical activity recorded for this segmentation.
                </Alert>
            )}
        </Grid>

        {/* Status Glossary / Metadata */}
        <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: '#f1f5f9' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Segment Lifecycle</Typography>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={2} sx={{ mt: 2 }}>
                    <Box>
                        <Typography variant="caption" fontWeight="bold" color="primary.main">DRAFT</Typography>
                        <Typography variant="body2" color="text.secondary">Initial creation. Visible only to creator.</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" fontWeight="bold" color="warning.main">PENDING</Typography>
                        <Typography variant="body2" color="text.secondary">Submitted for review. Locked for editing.</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" fontWeight="bold" color="success.main">APPROVED</Typography>
                        <Typography variant="body2" color="text.secondary">Active in calculation engine. Audit locked.</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" fontWeight="bold" color="error.main">REJECTED</Typography>
                        <Typography variant="body2" color="text.secondary">Returned to draft with comments.</Typography>
                    </Box>
                </Stack>
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Internal Grid helper since it's used
import { Grid } from '@mui/material';
