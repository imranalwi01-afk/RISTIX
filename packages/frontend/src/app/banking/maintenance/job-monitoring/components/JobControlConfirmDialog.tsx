import React, { memo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
} from '@mui/material';
import { JobExecution } from '../types';

interface JobControlConfirmDialogProps {
  open: boolean;
  job: JobExecution | null;
  action: 'start' | 'pause' | 'stop' | 'restart' | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const JobControlConfirmDialog = memo(function JobControlConfirmDialog({
  open,
  job,
  action,
  onClose,
  onConfirm,
}: JobControlConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm Job {action?.toUpperCase()}</DialogTitle>
      <DialogContent>
        {job && (
          <Box>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to {action} the following job?
            </Typography>
            <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6">{job.jobName}</Typography>
              <Typography variant="body2" color="text.secondary">
                Current Status: {job.status}
              </Typography>
            </Paper>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color={action === 'stop' ? 'error' : 'primary'}>
          {action?.toUpperCase()}
        </Button>
      </DialogActions>
    </Dialog>
  );
});
