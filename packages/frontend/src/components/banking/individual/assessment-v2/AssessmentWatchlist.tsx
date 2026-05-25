import React, { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  IconButton,
  Tooltip,
  Skeleton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  RestartAlt as RestartAltIcon,
  OpenInNew as OpenInNewIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';
import { IndividualImpairmentWatchlistItem } from '@/services/api.individual-impairment';
import {
  formatCurrency,
  renderStageChip,
  renderAssessmentStatus,
  renderPriorityChip
} from './utils';
import { buildIndividualAssessmentUrl } from '@/features/individual-impairment/routing';

interface AssessmentWatchlistProps {
  watchlist: IndividualImpairmentWatchlistItem[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAccountSelect: (account: IndividualImpairmentWatchlistItem) => void;
  onEditAssessment: (account: IndividualImpairmentWatchlistItem) => void;
  onResetAssessment?: (account: IndividualImpairmentWatchlistItem) => Promise<{ success: boolean; message?: string }> | { success: boolean; message?: string } | void;
  onViewDetails?: (account: IndividualImpairmentWatchlistItem) => void;
  selectedAccountId?: number | string | null;
  mode?: string;
}

export const AssessmentWatchlist: React.FC<AssessmentWatchlistProps> = ({
  watchlist,
  loading,
  pagination,
  onPageChange,
  onRowsPerPageChange,
  onAccountSelect,
  onEditAssessment,
  onResetAssessment,
  onViewDetails,
  selectedAccountId,
  mode
}) => {
  const pathname = usePathname();
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null)
  const [menuAccount, setMenuAccount] = useState<IndividualImpairmentWatchlistItem | null>(null)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetAccount, setResetAccount] = useState<IndividualImpairmentWatchlistItem | null>(null)
  const [resetSubmitting, setResetSubmitting] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  const assessmentUrlBase = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return window.location.origin
  }, [])

  const headerCellSx = {
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid',
    borderColor: 'primary.main',
    fontWeight: 700,
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.2px',
    color: 'text.primary',
    p: 1,
    whiteSpace: 'nowrap',
  }

  const bodyCellSx = {
    py: 0.75,
    px: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }

  const formatDate = (value?: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  const buildAssessmentUrl = (account: IndividualImpairmentWatchlistItem) => {
    const params = new URLSearchParams()
    params.set('mode', mode || 'conventional')
    params.set('accountId', String(account.account_id))
    if (account.account_number) params.set('accountNumber', account.account_number)
    params.set('tab', 'assessment-details')
    return buildIndividualAssessmentUrl(params, pathname)
  }

  const openMenu = (event: React.MouseEvent<HTMLElement>, account: IndividualImpairmentWatchlistItem) => {
    event.stopPropagation()
    setMenuAnchorEl(event.currentTarget)
    setMenuAccount(account)
  }

  const closeMenu = () => {
    setMenuAnchorEl(null)
    setMenuAccount(null)
  }

  const handleCopy = async (text: string, message?: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setSnackbar({ open: true, message: message || 'Copied to clipboard', severity: 'success' })
    } catch (error) {
      try {
        const el = document.createElement('textarea')
        el.value = text
        el.setAttribute('readonly', 'true')
        el.style.position = 'absolute'
        el.style.left = '-9999px'
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
        setSnackbar({ open: true, message: message || 'Copied to clipboard', severity: 'success' })
      } catch (secondaryError) {
        setSnackbar({ open: true, message: 'Failed to copy', severity: 'error' })
      }
    }
  }

  const downloadJson = (fileName: string, data: unknown) => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setSnackbar({ open: true, message: 'JSON downloaded', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to download JSON', severity: 'error' })
    }
  }

  const requestReset = (event: React.MouseEvent<HTMLElement>, account: IndividualImpairmentWatchlistItem) => {
    event.stopPropagation()
    setResetAccount(account)
    setResetDialogOpen(true)
  }

  const cancelReset = () => {
    if (resetSubmitting) return
    setResetDialogOpen(false)
    setResetAccount(null)
  }

  const confirmReset = async () => {
    if (!resetAccount) return
    try {
      setResetSubmitting(true)
      const result = await onResetAssessment?.(resetAccount as IndividualImpairmentWatchlistItem)
      const success = (result as any)?.success === false ? false : true
      const message = (result as any)?.message
      setSnackbar({ open: true, message: message || (success ? 'Reset successful' : 'Reset failed'), severity: success ? 'success' : 'error' })
      if (success) cancelReset()
    } catch (error) {
      setSnackbar({ open: true, message: 'Reset failed', severity: 'error' })
    } finally {
      setResetSubmitting(false)
    }
  }

  if (loading && watchlist.length === 0) {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell colSpan={12}><Skeleton animation="wave" /></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
             {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={12}><Skeleton animation="wave" height={50} /></TableCell>
                </TableRow>
             ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          Individual Assessment Watchlist
        </Typography>
        {mode && (
          <Chip
            label={`${mode.toUpperCase()} Mode`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>
      <TableContainer
        sx={{
          maxHeight: { xs: '56vh', md: 'min(62vh, 680px)' },
          minHeight: '300px',
          overflow: 'auto',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #edf2f7',
          width: '100%',
          bgcolor: 'white'
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            tableLayout: 'fixed',
            minWidth: 1660,
            width: '100%',
          }}
          aria-label="Individual Assessment Watchlist"
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headerCellSx, width: 110, backgroundColor: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: '0.65rem' }}>Download Date</TableCell>
              <TableCell sx={{ ...headerCellSx, width: 140, backgroundColor: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: '0.65rem' }}>Customer Number</TableCell>
              <TableCell sx={{ ...headerCellSx, width: 'auto', backgroundColor: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: '0.65rem' }}>Customer Name</TableCell>
              <TableCell sx={{ ...headerCellSx, width: 160, backgroundColor: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: '0.65rem' }}>Account Number</TableCell>
              <TableCell sx={{ ...headerCellSx, width: 80, backgroundColor: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: '0.65rem' }}>Currency</TableCell>
              <TableCell align="right" sx={{ ...headerCellSx, width: 180, backgroundColor: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: '0.65rem' }}>Outstanding</TableCell>
              <TableCell sx={{ ...headerCellSx, width: 70, backgroundColor: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: '0.65rem' }}>DPD</TableCell>
              <TableCell sx={{ ...headerCellSx, width: 120, backgroundColor: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: '0.65rem' }}>Status</TableCell>
              <TableCell sx={{ ...headerCellSx, width: 140, backgroundColor: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: '0.65rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {watchlist.map((account, index) => {
              const isSelected =
                selectedAccountId !== undefined
                && selectedAccountId !== null
                && String(account.account_id) === String(selectedAccountId)

              const handleOpen = () => {
                if (onViewDetails) return onViewDetails(account)
                return onAccountSelect(account)
              }

              return (
              <TableRow
                key={account.pkid || account.account_id || index}
                hover
                sx={{
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: '#f1f5f9 !important',
                    transition: 'background-color 0.2s ease'
                  },
                  borderBottom: '1px solid #f1f5f9',
                  ...(isSelected
                    ? {
                        backgroundColor: '#eef2ff !important',
                        outline: '1px solid #6366f1',
                        outlineOffset: '-1px',
                      }
                    : null),
                  cursor: 'pointer'
                }}
                onClick={handleOpen}
              >
                <TableCell sx={bodyCellSx}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {formatDate(account.prc_date)}
                  </Typography>
                </TableCell>
                <TableCell sx={bodyCellSx}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {account.cif_number}
                  </Typography>
                </TableCell>
                <TableCell sx={bodyCellSx}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500 }} title={account.cif_name}>
                    {(() => {
                      const name = account.cif_name || '';
                      if (name.length <= 2) return name;
                      return name[0] + '*'.repeat(Math.min(name.length - 2, 10)) + name[name.length - 1];
                    })()}
                  </Typography>
                </TableCell>
                <TableCell sx={bodyCellSx}>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.2 }}>
                    {account.account_number}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    {account.account_id}
                  </Typography>
                </TableCell>
                <TableCell sx={bodyCellSx}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {account.currency || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={bodyCellSx}>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    {formatCurrency(account.outstanding_balance).replace('IDR', 'Rp')}
                  </Typography>
                </TableCell>
                <TableCell sx={bodyCellSx}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>
                    {account?.dpd ?? '-'}
                  </Typography>
                </TableCell>
                <TableCell sx={bodyCellSx}>
                  {renderAssessmentStatus(account.assessment_status)}
                </TableCell>
                <TableCell sx={{ py: 0.75, px: 0.5 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleOpen();
                        }}
                        sx={{ color: '#64748b', '&:hover': { color: 'primary.main', bgcolor: '#eff6ff' } }}
                      >
                        <VisibilityIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Assessment">
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditAssessment(account);
                        }}
                        sx={{ color: '#64748b', '&:hover': { color: 'primary.main', bgcolor: '#eff6ff' } }}
                      >
                        <EditIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="More">
                      <IconButton
                        size="small"
                        onClick={(event) => openMenu(event, account)}
                        sx={{ color: '#64748b' }}
                      >
                        <MoreVertIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
              )
            })}
            {watchlist.length === 0 && (
               <TableRow>
                 <TableCell colSpan={12} align="center" sx={{ py: 3 }}>
                   <Typography variant="body1" color="text.secondary">
                     No accounts found matching current filters.
                   </Typography>
                 </TableCell>
               </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 75, 100]}
        component="div"
        count={pagination.total}
        rowsPerPage={pagination.limit}
        page={pagination.page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            if (!menuAccount) return
            window.open(buildAssessmentUrl(menuAccount), '_blank', 'noopener,noreferrer')
            closeMenu()
          }}
          disabled={!menuAccount?.account_id}
        >
          <ListItemIcon><OpenInNewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Open in New Tab</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={async () => {
            if (!menuAccount) return
            await handleCopy(`${assessmentUrlBase}${buildAssessmentUrl(menuAccount)}`, 'Workspace link copied')
            closeMenu()
          }}
          disabled={!menuAccount?.account_id}
        >
          <ListItemIcon><LinkIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Copy Workspace Link</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={async () => {
            if (!menuAccount) return
            await handleCopy(String(menuAccount.cif_number || ''), 'CIF number copied')
            closeMenu()
          }}
          disabled={!menuAccount?.cif_number}
        >
          <ListItemIcon><CopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Copy CIF Number</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={async () => {
            if (!menuAccount) return
            await handleCopy(String(menuAccount.cif_name || ''), 'CIF name copied')
            closeMenu()
          }}
          disabled={!menuAccount?.cif_name}
        >
          <ListItemIcon><CopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Copy CIF Name</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={async () => {
            if (!menuAccount) return
            await handleCopy(String(menuAccount.account_number || ''), 'Account number copied')
            closeMenu()
          }}
          disabled={!menuAccount?.account_number}
        >
          <ListItemIcon><CopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Copy Account Number</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={async () => {
            if (!menuAccount) return
            await handleCopy(String(menuAccount.account_id || ''), 'Account ID copied')
            closeMenu()
          }}
          disabled={!menuAccount?.account_id}
        >
          <ListItemIcon><CopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Copy Account ID</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={async () => {
            if (!menuAccount) return
            await handleCopy(JSON.stringify(menuAccount, null, 2), 'Full JSON copied')
            closeMenu()
          }}
        >
          <ListItemIcon><CopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Copy Full JSON</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (!menuAccount) return
            const fileSafeAccount = String(menuAccount.account_number || menuAccount.account_id || 'account').replace(/[^\w.-]+/g, '_')
            downloadJson(`assessment_${fileSafeAccount}.json`, menuAccount)
            closeMenu()
          }}
        >
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Download JSON</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={resetDialogOpen} onClose={cancelReset} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Assessment</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Tindakan ini akan menghapus override/assessment manual untuk akun ini.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Account: <strong>{resetAccount?.account_number}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            CIF: <strong>{resetAccount?.cif_name}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelReset} color="inherit" disabled={resetSubmitting}>Cancel</Button>
          <Button onClick={confirmReset} variant="contained" color="error" disabled={!resetAccount?.is_override || resetSubmitting}>
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
