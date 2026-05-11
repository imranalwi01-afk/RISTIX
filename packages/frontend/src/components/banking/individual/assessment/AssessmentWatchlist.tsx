// @ts-nocheck
import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
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
  Snackbar,
  Paper,
  Fade,
  Grow
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
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
  renderPriorityChip,
  renderImpairedFlag
} from '@/app/banking/individual/assessment/utils';

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
  const theme = useTheme();
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

  const buildAssessmentUrl = (account: IndividualImpairmentWatchlistItem) => {
    const params = new URLSearchParams()
    params.set('mode', mode || 'conventional')
    params.set('accountId', String(account.account_id))
    if (account.account_number) params.set('accountNumber', account.account_number)
    params.set('tab', 'assessment-details')
    return `/banking/individual/assessment?${params.toString()}`
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
              <TableCell colSpan={14}><Skeleton animation="wave" /></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
             {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={14}><Skeleton animation="wave" height={50} /></TableCell>
                </TableRow>
             ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <>
    <Fade in={!loading || watchlist.length > 0} timeout={800}>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          maxHeight: 'calc(100vh - 420px)',
          minHeight: '300px',
          overflow: 'auto',
          borderRadius: '16px',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          width: '100%',
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            borderRadius: '10px',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
            },
          },
        }}
      >
        <Table 
          stickyHeader 
          size="small" 
          sx={{ 
            width: '100%', 
            minWidth: 1600, // Matching V2 width to ensure no overlapping
            '& .MuiTableCell-root': {
              borderColor: alpha(theme.palette.divider, 0.05),
            }
          }} 
          aria-label="Individual Assessment Watchlist"
        >
          <TableHead>
            <TableRow>
              {[
                { label: 'Download Date', width: 120 },
                { label: 'CIF Number', width: 140 },
                { label: 'Customer Name', width: 220 },
                { label: 'Account Number', width: 160 },
                { label: 'Ccy', width: 80 },
                { label: 'Outstanding', width: 160, align: 'right' },
                { label: 'DPD', width: 80 },
                { label: 'Coll', width: 100 },
                { label: 'Rating', width: 100 },
                { label: 'Stage', width: 100 },
                { label: 'Status & Priority', width: 140 },
                { label: 'Actions', width: 160, align: 'center' },
              ].map((column) => (
                <TableCell
                  key={column.label}
                  align={column.align as any || 'left'}
                  sx={{
                    backgroundColor: '#f8f9fa', // Solid background for sticky header
                    borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    fontWeight: 800,
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    color: theme.palette.text.secondary,
                    width: column.width,
                    minWidth: column.width,
                    py: 1.5,
                    px: 1.5,
                    whiteSpace: 'nowrap',
                    zIndex: 11, // Increased zIndex for header
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (!watchlist || watchlist.length === 0) ? (
               [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={14}><Skeleton animation="wave" height={40} /></TableCell>
                </TableRow>
               ))
            ) : (
              <>
                {Array.isArray(watchlist) && watchlist.map((account, index) => {
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
                      transition: 'all 0.2s ease',
                      borderLeft: isSelected ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                      backgroundColor: isSelected 
                        ? alpha(theme.palette.primary.main, 0.08) 
                        : (index % 2 === 0 ? 'transparent' : alpha(theme.palette.action.hover, 0.02)),
                      '&:hover': {
                        backgroundColor: isSelected 
                          ? alpha(theme.palette.primary.main, 0.12) 
                          : `${alpha(theme.palette.primary.main, 0.04)} !important`,
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        '& .action-buttons': {
                          opacity: 1,
                          transform: 'translateX(0)',
                        }
                      },
                      cursor: 'pointer'
                    }}
                    onClick={handleOpen}
                  >
                    <TableCell sx={{ py: 1.5, px: 1.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'text.primary' }}>
                        {account.prc_date ? dayjs(account.prc_date).format('DD MMM YYYY') : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 1.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600, color: theme.palette.primary.main }}>
                        {account.cif_number}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 1.5, whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.2, fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis' }}>{account.cif_name}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.2, color: 'text.primary' }}>
                        {account.account_number}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block', mt: 0.25 }}>
                        ID: {account.account_id}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 1.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
                        {account.currency || 'IDR'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5, px: 1.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'text.primary' }}>
                        {formatCurrency(account.outstanding_balance)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 1.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 700, color: (account.dpd || 0) > 0 ? theme.palette.error.main : 'text.primary' }}>
                        {account.dpd || 0}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 1.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                        {account.collectability || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 1.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
                        {account.rating_code || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 1.5 }}>
                      {renderStageChip(account.stage)}
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 1.5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, alignItems: 'flex-start' }}>
                        {renderAssessmentStatus(account.assessment_status)}
                        {renderPriorityChip(account.priority_level)}
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1, px: 0.5 }}>
                      <Box className="action-buttons" sx={{ 
                        display: 'flex', 
                        gap: 0.5, 
                        justifyContent: 'center',
                        opacity: 0.6,
                        transition: 'all 0.3s ease',
                        transform: 'translateX(5px)',
                      }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpen();
                            }}
                            disabled={!account.account_id}
                            sx={{ 
                              color: theme.palette.primary.main,
                              backgroundColor: alpha(theme.palette.primary.main, 0.05),
                              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.15) }
                            }}
                          >
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Assessment">
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              onEditAssessment(account);
                            }}
                            disabled={!account.account_id}
                            sx={{ 
                              color: theme.palette.info.main,
                              backgroundColor: alpha(theme.palette.info.main, 0.05),
                              '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.15) }
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={
                          account.assessment_status === 'SUBMITTED'
                            ? "Batalkan Pengajuan & Reset"
                            : (account.is_override ? "Reset Assessment" : "Belum Ada Assessment")
                        }>
                          <IconButton
                            size="small"
                            sx={{
                              color: (account.assessment_status === 'SUBMITTED' || account.assessment_status === 'PENDING') ? theme.palette.warning.main : theme.palette.error.main,
                              backgroundColor: (account.assessment_status === 'SUBMITTED' || account.assessment_status === 'PENDING') ? alpha(theme.palette.warning.main, 0.05) : alpha(theme.palette.error.main, 0.05),
                              '&:hover': { backgroundColor: (account.assessment_status === 'SUBMITTED' || account.assessment_status === 'PENDING') ? alpha(theme.palette.warning.main, 0.15) : alpha(theme.palette.error.main, 0.15) },
                              opacity: (account.is_override || account.assessment_status === 'SUBMITTED' || account.assessment_status === 'PENDING') ? 1 : 0.3
                            }}
                            onClick={(event) => requestReset(event, account)}
                            disabled={!account.is_override && account.assessment_status !== 'SUBMITTED' && account.assessment_status !== 'PENDING'}
                          >
                            <RestartAltIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="More">
                          <IconButton
                            size="small"
                            onClick={(event) => openMenu(event, account)}
                            sx={{ 
                              color: theme.palette.text.secondary,
                              backgroundColor: alpha(theme.palette.text.secondary, 0.05),
                              '&:hover': { backgroundColor: alpha(theme.palette.text.secondary, 0.15) }
                            }}
                          >
                            <MoreVertIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                  )
                })}
                {!loading && (!watchlist || watchlist.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={14} align="center" sx={{ py: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                          No accounts found matching current filters.
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          Try adjusting your search or filters to see more results.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Fade>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100, 200, 500]}
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
            Customer: <strong>{resetAccount?.cif_name}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            CIF: <strong>{resetAccount?.cif_number}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelReset} color="inherit" disabled={resetSubmitting}>Cancel</Button>
          <Button
            onClick={confirmReset}
            variant="contained"
            color="error"
            disabled={(!resetAccount?.is_override && resetAccount?.assessment_status !== 'SUBMITTED' && resetAccount?.assessment_status !== 'PENDING') || resetSubmitting}
          >
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
