'use client';

import React, { useState, useEffect } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';
import InfoIcon from '@mui/icons-material/Info';
import { api } from '@/services/api';

interface LevelConfig {
  scoreMin: number; scoreMax: number;
  approvalsRequired: number; slaHours: number;
  escalationAfterHours: number; requireDecisionComment: boolean; queuePriority: number;
}

interface RoleLevel {
  roleCode: string; roleName: string;
  hierarchyLevel: number | null; maxImpactLevel: string;
}

interface ImpactConfig {
  levels: Record<string, LevelConfig>;
  roles: RoleLevel[];
}

const LEVEL_LABEL: Record<string, string> = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'low': return 'success';
    case 'medium': return 'info';
    case 'high': return 'warning';
    case 'critical': return 'error';
    default: return 'default';
  }
};

export function StatusTooltip({ status }: { status: string }) {
  const key = status.toLowerCase();
  const descriptions: Record<string, string> = {
    pending: 'Menunggu persetujuan',
    approved: 'Disetujui oleh semua approver',
    rejected: 'Ditolak oleh approver',
    cancelled: 'Dibatalkan oleh pembuat',
    expired: 'Kadaluarsa — melewati SLA',
    in_progress: 'Sedang diproses',
  };
  const text = descriptions[key];
  if (!text) return <>{status}</>;
  return (
    <Box component="span" sx={{ cursor: 'help', borderBottom: '1px dashed', borderColor: 'text.disabled' }} title={text}>
      {status}
    </Box>
  );
}

export function PriorityTooltip({ priority }: { priority: string }) {
  const key = priority.toLowerCase();
  const descriptions: Record<string, string> = {
    low: 'Low — risiko rendah, SLA 24 jam, 1 approval',
    medium: 'Medium — risiko sedang, SLA 8 jam, 1 approval',
    normal: 'Normal — risiko sedang, SLA 8 jam, 1 approval',
    high: 'High — risiko tinggi, SLA 4 jam, 2 approval',
    critical: 'Critical — risiko kritikal, SLA 2 jam, 2 approval',
  };
  const text = descriptions[key];
  if (!text) return <>{priority}</>;
  return (
    <Box component="span" sx={{ cursor: 'help', borderBottom: '1px dashed', borderColor: 'text.disabled' }} title={text}>
      {priority}
    </Box>
  );
}

export default function ApprovalLevelInfo() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ImpactConfig | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.client.get('/impact-config')
      .then((res) => setConfig(res.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  const levels = config?.levels || {};
  const roles = config?.roles || [];

  const sortedRoles = [...roles]
    .filter((r) => r.hierarchyLevel !== null)
    .sort((a, b) => (b.hierarchyLevel ?? 0) - (a.hierarchyLevel ?? 0));

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
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>Impact & Priority Levels</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configured via Business Setting B0031. Determines approvals, SLA, and queue priority.
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Level</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Approvals</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>SLA</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Queue Priority</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {['low', 'medium', 'high', 'critical'].map((key) => {
                      const lvl = levels[key];
                      if (!lvl) return null;
                      return (
                        <TableRow key={key}>
                          <TableCell>
                            <Chip label={LEVEL_LABEL[key]} size="small" color={getImpactColor(key) as any} />
                          </TableCell>
                          <TableCell>{lvl.scoreMin} – {lvl.scoreMax}</TableCell>
                          <TableCell>{lvl.approvalsRequired}</TableCell>
                          <TableCell>{lvl.slaHours} hours</TableCell>
                          <TableCell>{lvl.queuePriority === 0 ? 'Highest' : lvl.queuePriority}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Role Hierarchy Levels</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Higher level roles can self-approve actions and serve as approvers.
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Level</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Max Impact</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedRoles.map((r) => (
                      <TableRow key={r.roleCode}>
                        <TableCell sx={{ fontWeight: 700 }}>{r.hierarchyLevel ?? '-'}</TableCell>
                        <TableCell>{r.roleName}</TableCell>
                        <TableCell>
                          <Chip label={r.maxImpactLevel || 'low'} size="small" color={getImpactColor((r.maxImpactLevel || 'low')) as any} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Elevation Rules</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Certain job types and target databases automatically raise the minimum impact level.
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Condition</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Effect</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(levels).map(([key, lvl]) => (
                      <TableRow key={key}>
                        <TableCell><Chip label={`Score ≥ ${lvl.scoreMin}`} size="small" color={getImpactColor(key) as any} variant="outlined" /></TableCell>
                        <TableCell>{LEVEL_LABEL[key]} impact</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
