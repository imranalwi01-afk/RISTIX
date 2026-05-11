// packages/frontend/src/app/banking/workflow/approval/page.tsx
// ============================================================================
// CHECKER APPROVAL INBOX — Individual Impairment Four-Eyes Workflow
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Container, Paper, Grid, Card, CardContent,
  Button, CircularProgress, Alert, Chip, Divider, Stack, Badge,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, Tab, Tabs, Avatar, Skeleton, Fade,
  alpha, useTheme,
} from '@mui/material';
import {
  Approval as ApprovalIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon,
  AccountBalance as BankIcon,
  MonetizationOn as MoneyIcon,
  Person as PersonIcon,
  Schedule as PendingIcon,
  FilterList as FilterIcon,
  OpenInNew as OpenIcon,
  Assignment as AssignIcon,
  HourglassEmpty as WaitIcon,
  InfoOutlined as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { approvalAPI } from '@/services/api/approval.api';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { formatDistanceToNow, format } from 'date-fns';

// ============ TYPES ============
interface ApprovalItem {
  id: string;
  entityType: string;
  entityId?: string;
  title: string;
  description?: string;
  status: string;
  impactLevel?: string;
  requestedBy: string;
  createdAt: string;
  updatedAt: string;
  currentLevel?: number;
  requestData?: {
    accountId?: number;
    accountNumber?: string;
    cifNumber?: string;
    cifName?: string;
    eclIaAmt?: number;
    pvDcfAmt?: number;
    outstanding?: number;
    outstandingBalance?: number;
    eadAmt?: number;
    justification?: string;
    isConsolidated?: boolean;
  };
  actions?: Array<{
    id: string;
    action: string;
    actorId: string;
    comment?: string;
    createdAt: string;
  }>;
}

// ============ HELPERS ============
const IMPACT_COLORS: Record<string, string> = {
  critical: '#d32f2f',
  high: '#f57c00',
  medium: '#1976d2',
  low: '#388e3c',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#f57c00',
  approved: '#2e7d32',
  rejected: '#c62828',
  cancelled: '#616161',
};

const formatCurrency = (amount?: number) => {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

const isIndividualImpairment = (item: ApprovalItem) =>
  item.entityType === 'INDIVIDUAL_ASSESSMENT_CONSOLIDATED' ||
  item.entityType?.includes('INDIVIDUAL_IMPAIRMENT');

// ============ APPROVAL CARD ============
function ApprovalCard({ item, selected, onClick }: { item: ApprovalItem; selected: boolean; onClick: () => void }) {
  const theme = useTheme();
  const ia = isIndividualImpairment(item);
  const rd = item.requestData || {};
  const impactColor = IMPACT_COLORS[item.impactLevel || 'medium'];

  return (
    <Card
      onClick={onClick}
      sx={{
        mb: 1.5,
        cursor: 'pointer',
        borderRadius: 3,
        border: '2px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        boxShadow: selected ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}` : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: 'primary.light', transform: 'translateY(-1px)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>{item.title}</Typography>
            {ia && rd.cifName && (
              <Typography variant="caption" color="text.secondary">{rd.cifName} · {rd.accountNumber}</Typography>
            )}
          </Box>
          <Stack direction="row" spacing={0.5} ml={1}>
            <Chip label={item.impactLevel || 'medium'} size="small" sx={{ bgcolor: alpha(impactColor, 0.12), color: impactColor, fontWeight: 700, fontSize: '0.6rem', height: 20 }} />
            <Chip label={item.status} size="small" sx={{ bgcolor: alpha(STATUS_COLORS[item.status] || '#666', 0.12), color: STATUS_COLORS[item.status] || '#666', fontWeight: 700, fontSize: '0.6rem', height: 20 }} />
          </Stack>
        </Stack>

        {ia && (
          <Stack direction="row" spacing={2} mb={1}>
            <Box>
              <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', fontSize: '0.6rem' }}>ECL Amount</Typography>
              <Typography variant="caption" fontWeight={700} color="error.main" display="block">{formatCurrency(rd.eclIaAmt)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', fontSize: '0.6rem' }}>Outstanding</Typography>
              <Typography variant="caption" fontWeight={700} display="block">{formatCurrency(rd.outstanding || rd.outstandingBalance)}</Typography>
            </Box>
          </Stack>
        )}

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.disabled">
            by {item.requestedBy} · {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </Typography>
          {ia && <Chip label="Individual Impairment" size="small" icon={<BankIcon sx={{ fontSize: '0.7rem !important' }} />} sx={{ fontSize: '0.6rem', height: 18, bgcolor: alpha('#1976d2', 0.08), color: 'primary.dark' }} />}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============ DETAIL PANEL ============
function DetailPanel({ item, currentUserId, onApprove, onReject, loading }: {
  item: ApprovalItem;
  currentUserId?: string;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
}) {
  const theme = useTheme();
  const rd = item.requestData || {};
  const ia = isIndividualImpairment(item);
  const isPending = item.status === 'pending';
  // SoD: checker cannot be same as maker
  const isSelf = currentUserId && item.requestedBy === currentUserId;
  const canAct = isPending && !isSelf;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, background: `linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)`, color: 'white', borderRadius: '16px 16px 0 0' }}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
          <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 40, height: 40 }}>
            {ia ? <BankIcon /> : <AssignIcon />}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>{item.title}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>ID: {item.id.substring(0, 16)}…</Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Chip label={item.status.toUpperCase()} size="small" sx={{ bgcolor: alpha('#fff', 0.2), color: 'white', fontWeight: 700 }} />
          <Chip label={(item.impactLevel || 'medium').toUpperCase()} size="small" sx={{ bgcolor: alpha(IMPACT_COLORS[item.impactLevel || 'medium'], 0.6), color: 'white', fontWeight: 700 }} />
          {ia && <Chip label="FOUR-EYES" size="small" icon={<PersonIcon sx={{ color: 'white !important', fontSize: '0.7rem !important' }} />} sx={{ bgcolor: alpha('#fff', 0.15), color: 'white', fontWeight: 700 }} />}
        </Stack>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
        {/* SoD Warning */}
        {isSelf && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="body2" fontWeight={600}>Segregation of Duties — Tidak dapat menyetujui permintaan sendiri.</Typography>
            <Typography variant="caption">Permintaan ini harus disetujui oleh Checker yang berbeda.</Typography>
          </Alert>
        )}

        {/* Summary Cards */}
        {ia && (
          <Grid container spacing={2} mb={2}>
            {[
              { label: 'ECL Amount', value: formatCurrency(rd.eclIaAmt), color: '#d32f2f' },
              { label: 'PV DCF', value: formatCurrency(rd.pvDcfAmt), color: '#1976d2' },
              { label: 'EAD / Outstanding', value: formatCurrency(rd.eadAmt || rd.outstanding || rd.outstandingBalance), color: '#388e3c' },
            ].map(card => (
              <Grid size={{ xs: 4 }} key={card.label}>
                <Paper sx={{ p: 1.5, borderRadius: 2, textAlign: 'center', border: `1px solid ${alpha(card.color, 0.2)}`, bgcolor: alpha(card.color, 0.04) }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.6rem', fontWeight: 700 }}>{card.label}</Typography>
                  <Typography variant="body2" fontWeight={800} color={card.color}>{card.value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Request Details */}
        <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Detail Permintaan</Typography>
          {[
            { label: 'Diajukan Oleh', value: item.requestedBy },
            { label: 'Tanggal Pengajuan', value: format(new Date(item.createdAt), 'dd MMM yyyy, HH:mm') },
            ...(ia ? [
              { label: 'Nomor Rekening', value: rd.accountNumber || '—' },
              { label: 'CIF / Nasabah', value: `${rd.cifNumber || '—'} · ${rd.cifName || '—'}` },
            ] : []),
            { label: 'Justifikasi', value: rd.justification || item.description || '—' },
          ].map(row => (
            <Stack key={row.label} direction="row" justifyContent="space-between" py={0.5} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>{row.label}</Typography>
              <Typography variant="caption" fontWeight={500} sx={{ textAlign: 'right', maxWidth: '60%' }}>{row.value}</Typography>
            </Stack>
          ))}
        </Paper>

        {/* Audit Trail */}
        {item.actions && item.actions.length > 0 && (
          <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Riwayat Aksi</Typography>
            {item.actions.map(action => (
              <Stack key={action.id} direction="row" spacing={1.5} mb={1} alignItems="flex-start">
                <Avatar sx={{ width: 28, height: 28, fontSize: '0.65rem', bgcolor: action.action === 'approve' ? 'success.main' : action.action === 'reject' ? 'error.main' : 'info.main' }}>
                  {action.action === 'approve' ? '✓' : action.action === 'reject' ? '✗' : '?'}
                </Avatar>
                <Box>
                  <Typography variant="caption" fontWeight={700}>{action.actorId} <span style={{ fontWeight: 400, color: '#666' }}>· {action.action}</span></Typography>
                  {action.comment && <Typography variant="caption" color="text.secondary" display="block">"{action.comment}"</Typography>}
                  <Typography variant="caption" color="text.disabled">{formatDistanceToNow(new Date(action.createdAt), { addSuffix: true })}</Typography>
                </Box>
              </Stack>
            ))}
          </Paper>
        )}
      </Box>

      {/* Action Footer */}
      {isPending && (
        <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: alpha('#f5f5f5', 0.5) }}>
          {canAct ? (
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="success"
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ApproveIcon />}
                onClick={onApprove}
                disabled={loading}
                fullWidth
                sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
              >
                Setujui (Approve)
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<RejectIcon />}
                onClick={onReject}
                disabled={loading}
                fullWidth
                sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
              >
                Tolak (Reject)
              </Button>
            </Stack>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              {isSelf ? 'Anda tidak dapat menyetujui permintaan sendiri.' : 'Permintaan ini menunggu persetujuan Checker.'}
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}

// ============ MAIN PAGE ============
export default function ApprovalInboxPage() {
  const theme = useTheme();
  const router = useRouter();
  const user = useSelector((state: RootState) => (state.auth as any)?.user);

  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [allItems, setAllItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ApprovalItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Action dialogs
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [comment, setComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pendingRes, historyRes] = await Promise.allSettled([
        approvalAPI.getPendingApprovals(),
        approvalAPI.getApprovalHistory({ entityType: 'INDIVIDUAL_ASSESSMENT_CONSOLIDATED', limit: 50 }),
      ]);

      const pending: ApprovalItem[] = pendingRes.status === 'fulfilled' && Array.isArray(pendingRes.value?.data)
        ? pendingRes.value.data
        : pendingRes.status === 'fulfilled' && Array.isArray(pendingRes.value)
        ? pendingRes.value
        : [];

      const history: ApprovalItem[] = historyRes.status === 'fulfilled' && Array.isArray(historyRes.value?.data)
        ? historyRes.value.data
        : historyRes.status === 'fulfilled' && Array.isArray(historyRes.value)
        ? historyRes.value
        : [];

      setItems(pending);
      // Merge: pending + history (dedup by id)
      const merged = [...pending];
      history.forEach(h => { if (!merged.find(p => p.id === h.id)) merged.push(h); });
      setAllItems(merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      // Auto-select first pending item if none selected
      if (!selected && pending.length > 0) setSelected(pending[0]);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat daftar persetujuan');
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => { fetchPending(); }, []);

  const displayList = tab === 'pending' ? items : allItems;
  const pendingCount = items.length;

  const handleApprove = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await approvalAPI.approveRequest(selected.id, { comment: comment || 'Approved by Checker' });
      setApproveDialog(false);
      setComment('');
      setSelected(null);
      await fetchPending();
    } catch (err: any) {
      setError(err.message || 'Gagal menyetujui permintaan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await approvalAPI.rejectRequest(selected.id, { comment: rejectReason });
      setRejectDialog(false);
      setRejectReason('');
      setSelected(null);
      await fetchPending();
    } catch (err: any) {
      setError(err.message || 'Gagal menolak permintaan');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Page Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
            <ApprovalIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1 }}>Approval Inbox</Typography>
            <Typography variant="body2" color="text.secondary">Checker — Four-Eyes Workflow Review</Typography>
          </Box>
          {pendingCount > 0 && (
            <Chip
              label={`${pendingCount} Pending`}
              color="error"
              icon={<WaitIcon sx={{ fontSize: '0.9rem !important' }} />}
              sx={{ fontWeight: 700, animation: 'pulse 2s infinite' }}
            />
          )}
        </Stack>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchPending} disabled={loading}>
            <RefreshIcon sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Tooltip>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ height: 'calc(100vh - 200px)' }}>
        {/* LEFT: Approval Queue */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%' }}>
          <Paper sx={{ height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Tabs */}
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Tab value="pending" label={
                <Badge badgeContent={pendingCount} color="error" max={99}>
                  <Typography variant="body2" fontWeight={600} mr={1}>Perlu Direview</Typography>
                </Badge>
              } />
              <Tab value="all" label={<Typography variant="body2" fontWeight={600}>Semua</Typography>} />
            </Tabs>

            {/* List */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={100} sx={{ mb: 1.5, borderRadius: 3 }} />
                ))
              ) : displayList.length === 0 ? (
                <Fade in>
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <ApproveIcon sx={{ fontSize: 56, color: 'success.light', mb: 2 }} />
                    <Typography variant="h6" fontWeight={700} color="text.secondary">
                      {tab === 'pending' ? 'Tidak ada permintaan pending' : 'Belum ada riwayat'}
                    </Typography>
                    <Typography variant="body2" color="text.disabled" mt={0.5}>
                      {tab === 'pending' ? 'Semua assessment telah diproses' : 'Riwayat persetujuan akan muncul di sini'}
                    </Typography>
                  </Box>
                </Fade>
              ) : (
                displayList.map(item => (
                  <ApprovalCard
                    key={item.id}
                    item={item}
                    selected={selected?.id === item.id}
                    onClick={() => setSelected(item)}
                  />
                ))
              )}
            </Box>
          </Paper>
        </Grid>

        {/* RIGHT: Detail Panel */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ height: '100%' }}>
          <Paper sx={{ height: '100%', borderRadius: 3, overflow: 'hidden' }}>
            {selected ? (
              <DetailPanel
                item={selected}
                currentUserId={user?.id || user?.email}
                onApprove={() => setApproveDialog(true)}
                onReject={() => setRejectDialog(true)}
                loading={actionLoading}
              />
            ) : (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, color: 'text.disabled' }}>
                <AssignIcon sx={{ fontSize: 72, opacity: 0.3 }} />
                <Typography variant="h6" fontWeight={600}>Pilih item dari daftar</Typography>
                <Typography variant="body2">Klik item di sebelah kiri untuk melihat detail dan melakukan aksi</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Approve Dialog */}
      <Dialog open={approveDialog} onClose={() => setApproveDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #2e7d32, #1b5e20)', color: 'white', fontWeight: 700 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ApproveIcon />
            <span>Konfirmasi Persetujuan</span>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            Anda akan menyetujui: <strong>{selected?.title}</strong>
          </Alert>
          <TextField
            label="Komentar Checker (opsional)"
            multiline
            rows={3}
            fullWidth
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Catatan persetujuan..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setApproveDialog(false)} variant="outlined" disabled={actionLoading} sx={{ borderRadius: 2 }}>Batal</Button>
          <Button onClick={handleApprove} variant="contained" color="success" disabled={actionLoading} startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <ApproveIcon />} sx={{ borderRadius: 2, fontWeight: 700 }}>
            Ya, Setujui
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #c62828, #b71c1c)', color: 'white', fontWeight: 700 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <RejectIcon />
            <span>Tolak Permintaan</span>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            Anda akan menolak: <strong>{selected?.title}</strong>
          </Alert>
          <TextField
            label="Alasan Penolakan *"
            multiline
            rows={3}
            fullWidth
            required
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Jelaskan alasan penolakan..."
            error={rejectReason.trim().length === 0}
            helperText={rejectReason.trim().length === 0 ? 'Alasan penolakan wajib diisi' : ''}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setRejectDialog(false)} variant="outlined" disabled={actionLoading} sx={{ borderRadius: 2 }}>Batal</Button>
          <Button onClick={handleReject} variant="contained" color="error" disabled={actionLoading || !rejectReason.trim()} startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <RejectIcon />} sx={{ borderRadius: 2, fontWeight: 700 }}>
            Ya, Tolak
          </Button>
        </DialogActions>
      </Dialog>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.7 } }
        @keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
      `}</style>
    </Container>
  );
}
