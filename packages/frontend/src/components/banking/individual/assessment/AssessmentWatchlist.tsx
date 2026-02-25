import React from 'react';
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
  Skeleton
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  RestartAlt as RestartAltIcon
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
  onResetAssessment?: (account: IndividualImpairmentWatchlistItem) => void;
}

export const AssessmentWatchlist: React.FC<AssessmentWatchlistProps> = ({
  watchlist,
  loading,
  pagination,
  onPageChange,
  onRowsPerPageChange,
  onAccountSelect,
  onEditAssessment,
  onResetAssessment
}) => {
  if (loading && watchlist.length === 0) {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell colSpan={9}><Skeleton animation="wave" /></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
             {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={9}><Skeleton animation="wave" height={50} /></TableCell>
                </TableRow>
             ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <>
      <TableContainer 
        sx={{ 
          maxHeight: 'calc(100vh - 420px)',
          minHeight: '300px',
          overflow: 'auto',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          width: '100%'
        }}
      >
        <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: '100%', maxWidth: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                fontWeight: 700,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.2px',
                color: 'text.primary',
                width: '100px',
                minWidth: '100px',
                p: 1
              }}>Account</TableCell>
              <TableCell sx={{
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                fontWeight: 700,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.2px',
                color: 'text.primary',
                width: '110px',
                minWidth: '110px',
                p: 1
              }}>Customer</TableCell>
              <TableCell sx={{
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                fontWeight: 700,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.2px',
                color: 'text.primary',
                width: '95px',
                minWidth: '95px',
                p: 1
              }}>Balance</TableCell>
              <TableCell sx={{
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                fontWeight: 700,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.2px',
                color: 'text.primary',
                width: '70px',
                minWidth: '70px',
                p: 1
              }}>Stage</TableCell>
              <TableCell sx={{
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                fontWeight: 700,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.2px',
                color: 'text.primary',
                width: '85px',
                minWidth: '85px',
                p: 1
              }}>Status</TableCell>
              <TableCell sx={{ 
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                fontWeight: 700,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.2px',
                color: 'text.primary',
                width: '75px',
                minWidth: '75px',
                p: 1
              }}>Priority</TableCell>
              <TableCell sx={{
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                fontWeight: 700,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.2px',
                color: 'text.primary',
                width: '70px',
                minWidth: '70px',
                p: 1
              }}>Impaired</TableCell>
              <TableCell sx={{
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                fontWeight: 700,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.2px',
                color: 'text.primary',
                width: '95px',
                minWidth: '95px',
                p: 1
              }}>Provision</TableCell>
              <TableCell sx={{
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                fontWeight: 700,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.2px',
                color: 'text.primary',
                width: '95px',
                minWidth: '95px',
                p: 1
              }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {watchlist.map((account, index) => (
              <TableRow 
                key={account.pkid} 
                hover
                sx={{
                  cursor: 'pointer',
                  backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(0, 0, 0, 0.02)',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.08) !important',
                    transition: 'background-color 0.2s ease'
                  }
                }}
              >
                <TableCell sx={{ py: 0.75, px: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem', lineHeight: 1.2 }}>
                    {account.account_number}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    {account.account_id}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 0.75, px: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>{account.cif_name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    {account.cif_number}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 0.75, px: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                    {formatCurrency(account.outstanding_balance)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 0.75, px: 1 }}>
                  {renderStageChip(account.stage)}
                </TableCell>
                <TableCell sx={{ py: 0.75, px: 1 }}>
                  {renderAssessmentStatus(account.assessment_status)}
                </TableCell>
                <TableCell sx={{ py: 0.75, px: 1 }}>
                  {renderPriorityChip(account.priority_level)}
                </TableCell>
                <TableCell sx={{ py: 0.75, px: 1 }}>
                  {renderImpairedFlag(account.impaired_flag)}
                </TableCell>
                <TableCell sx={{ py: 0.75, px: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                    {formatCurrency(account.provision_amount)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 0.75, px: 0.5 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => onAccountSelect(account)}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Assessment">
                      <IconButton
                        size="small"
                        onClick={() => onEditAssessment(account)}
                        disabled={!account.account_id}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset Assessment">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onResetAssessment?.(account)}
                        disabled={!account.is_override} // Only reset existing assessments
                      >
                        <RestartAltIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="More Actions">
                      <IconButton size="small">
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {watchlist.length === 0 && (
               <TableRow>
                 <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
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
        rowsPerPageOptions={[10, 25, 50, 100, 200, 500]}
        component="div"
        count={pagination.total}
        rowsPerPage={pagination.limit}
        page={pagination.page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </>
  );
};
