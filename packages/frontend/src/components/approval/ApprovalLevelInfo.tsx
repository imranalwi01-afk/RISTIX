'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import InfoIcon from '@mui/icons-material/Info';

const IMPACT_LEVELS = [
  { level: 'Low', priority: 'LOW', approvals: 1, sla: '24 hours', jobs: 'Low-priority tasks, non-critical changes' },
  { level: 'Medium', priority: 'NORMAL', approvals: 1, sla: '8 hours', jobs: 'Standard parameter updates, data entry' },
  { level: 'High', priority: 'HIGH', approvals: 2, sla: '4 hours', jobs: 'SQL_SP, critical parameters, Legacy DB writes' },
  { level: 'Critical', priority: 'CRITICAL', approvals: 2, sla: '2 hours', jobs: 'Shell commands, high-risk operations' },
];

const ROLE_HIERARCHY = [
  { level: 10, role: 'MAKER / VIEWER', impact: 'low' },
  { level: 20, role: 'AUDITOR', impact: 'low' },
  { level: 30, role: 'REPORT ANALYST', impact: 'low' },
  { level: 40, role: 'DATA ADMIN', impact: 'low' },
  { level: 50, role: 'CHECKER / RISK ANALYST', impact: 'medium' },
  { level: 60, role: 'PORTFOLIO MANAGER', impact: 'medium' },
  { level: 70, role: 'APPROVER / IFRS MANAGER', impact: 'high' },
  { level: 80, role: 'BANK CRO', impact: 'high' },
  { level: 90, role: 'TENANT ADMIN', impact: 'high' },
  { level: 100, role: 'TENANT SUPERADMIN', impact: 'critical' },
];

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'low': return 'success';
    case 'medium': return 'info';
    case 'high': return 'warning';
    case 'critical': return 'error';
    default: return 'default';
  }
};

const STATUS_INFO: Record<string, string> = {
  pending: 'Menunggu persetujuan — belum ada tindakan dari approver',
  approved: 'Disetujui — semua approver telah menyetujui permintaan ini',
  rejected: 'Ditolak — salah satu approver menolak permintaan ini',
  cancelled: 'Dibatalkan — pembuat permintaan membatalkan sebelum diproses',
  expired: 'Kadaluarsa — melewati batas waktu SLA tanpa keputusan',
  in_progress: 'Sedang diproses — approver saat ini sedang mereview',
};

const PRIORITY_INFO: Record<string, string> = {
  low: 'Low — prioritas rendah, SLA 24 jam, cukup 1 approval',
  medium: 'Medium — prioritas normal, SLA 8 jam, cukup 1 approval',
  normal: 'Normal — prioritas normal, SLA 8 jam, cukup 1 approval',
  high: 'High — prioritas tinggi, SLA 4 jam, butuh 2 approval',
  critical: 'Critical — prioritas kritikal, SLA 2 jam, butuh 2 approval',
};

export function StatusTooltip({ status }: { status: string }) {
  const key = status.toLowerCase();
  const text = STATUS_INFO[key];
  if (!text) return <>{status}</>;
  return (
    <Box component="span" sx={{ cursor: 'help', borderBottom: '1px dashed', borderColor: 'text.disabled' }} title={text}>
      {status}
    </Box>
  );
}

export function PriorityTooltip({ priority }: { priority: string }) {
  const key = priority.toLowerCase();
  const text = PRIORITY_INFO[key];
  if (!text) return <>{priority}</>;
  return (
    <Box component="span" sx={{ cursor: 'help', borderBottom: '1px dashed', borderColor: 'text.disabled' }} title={text}>
      {priority}
    </Box>
  );
}

export default function ApprovalLevelInfo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="small"
        startIcon={<InfoIcon />}
        onClick={() => setOpen(true)}
        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
      >
        Level & Priority Guide
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Approval Level & Priority Guide</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>Impact & Priority Levels</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Determines how many approvals are needed and the SLA timeframe.
            Job type and target database can automatically elevate the impact level.
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Impact</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Job Priority</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Approvals</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>SLA</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Typical Use</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {IMPACT_LEVELS.map((row) => (
                  <TableRow key={row.level}>
                    <TableCell>
                      <Chip label={row.level} size="small" color={getImpactColor(row.level.toLowerCase()) as any} />
                    </TableCell>
                    <TableCell>
                      <Chip label={row.priority} size="small" color={getImpactColor(row.level.toLowerCase()) as any} variant="outlined" />
                    </TableCell>
                    <TableCell>{row.approvals}</TableCell>
                    <TableCell>{row.sla}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{row.jobs}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Role Hierarchy Levels</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Higher level roles can self-approve actions and serve as approvers in the workflow.
            Checker (level 50) and Approver (level 70) are the standard approval workflow roles.
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Level</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Max Impact</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ROLE_HIERARCHY.map((row) => (
                  <TableRow key={row.level}>
                    <TableCell sx={{ fontWeight: 700 }}>{row.level}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell>
                      <Chip label={row.impact} size="small" color={getImpactColor(row.impact) as any} />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                      {row.level <= 40 && 'Can initiate requests, cannot approve'}
                      {row.level === 50 && 'First-level approver (Checker)'}
                      {row.level === 60 && 'Can approve medium-impact requests'}
                      {row.level >= 70 && row.level < 90 && 'Second-level approver'}
                      {row.level >= 90 && 'Can override any approval requirement'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Elevation Rules</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Certain job types automatically raise the minimum impact level:
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Condition</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Min Impact</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><Chip label="SQL_SP" size="small" color="warning" variant="outlined" /></TableCell>
                  <TableCell><Chip label="High" size="small" color="warning" /></TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>Stored procedures can modify data directly</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="SQL_SP → Legacy DB" size="small" color="warning" variant="outlined" /></TableCell>
                  <TableCell><Chip label="High" size="small" color="warning" /></TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>Legacy DB contains production IFRS9 data</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Chip label="SHELL_COMMAND" size="small" color="error" variant="outlined" /></TableCell>
                  <TableCell><Chip label="Critical" size="small" color="error" /></TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>Shell commands have system-level access</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
