
import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Checkbox,
  Tooltip,
  Typography,
  TablePagination,
  Skeleton
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ContentCopy as DuplicateIcon
} from '@mui/icons-material';
import { ApprovalStatusBadge } from '@/components/approval/ApprovalStatusBadge';
import EmptyState from '../../shared/EmptyState';

interface SegmentationTableProps {
  data: any[];
  selectedIds: number[];
  onSelect: (id: number) => void;
  onSelectAll: (checked: boolean) => void;
  onView: (item: any) => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onDuplicate: (item: any) => void;
  loading: boolean;
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  pendingRequests?: any[];
}

export const SegmentationTable: React.FC<SegmentationTableProps> = ({
  data,
  selectedIds,
  onSelect,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  loading,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  pendingRequests = []
}) => {

  const isSelected = (id: number) => selectedIds.includes(id);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
        return 'success';
      case 'pending':
      case 'submitted':
        return 'warning';
      case 'draft':
        return 'default';
      case 'rejected':
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderSkeleton = () => (
    Array.from(new Array(5)).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell padding="checkbox"><Skeleton variant="rectangular" width={20} height={20} /></TableCell>
        <TableCell><Skeleton variant="text" width={100} /></TableCell>
        <TableCell><Skeleton variant="text" width={150} /></TableCell>
        <TableCell><Skeleton variant="text" width={100} /></TableCell>
        <TableCell><Skeleton variant="text" width={100} /></TableCell>
        <TableCell align="center"><Skeleton variant="rounded" width={40} height={24} /></TableCell>
        <TableCell align="center"><Skeleton variant="text" width={30} /></TableCell>
        <TableCell align="center"><Skeleton variant="rounded" width={80} height={24} /></TableCell>
        <TableCell><Skeleton variant="text" width={80} /></TableCell>
      </TableRow>
    ))
  );

  return (
    <Paper 
        sx={{ 
            width: '100%', 
            mb: 2, 
            overflow: 'hidden', 
            borderRadius: 2, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid',
            borderColor: 'divider'
        }} 
        variant="elevation"
    >
      <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
        <Table stickyHeader size="small" aria-label="segmentation table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ bgcolor: '#f8fafc', fontWeight: 'bold' }}>
                <Checkbox
                  color="primary"
                  indeterminate={selectedIds.length > 0 && selectedIds.length < data.length}
                  checked={data.length > 0 && selectedIds.length === data.length}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Actions
              </TableCell>
              <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Group Segment
              </TableCell>
              <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Segment
              </TableCell>
              <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Sub Segment
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Type
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Seq
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Status
              </TableCell>
              <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Updated
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              renderSkeleton()
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 10 }}>
                  <EmptyState 
                    title="No Segmentations Found" 
                    description="Try adjusting your search or filters to find what you're looking for." 
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const isItemSelected = isSelected(row.id);
                const status = row.active_flag ? 'Active' : (row.status || 'Inactive');
                const isPending = pendingRequests.some(r => r.entityId === row.id.toString());

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ 
                        '&:nth-of-type(even)': { backgroundColor: '#fcfcfc' },
                        '&:hover': { backgroundColor: '#f1f5f9 !important' },
                        transition: 'background-color 0.2s ease'
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onChange={() => onSelect(row.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => onView(row)} color="info" sx={{ p: 0.5 }}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => onEdit(row)} color="warning" sx={{ p: 0.5 }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicate">
                          <IconButton size="small" onClick={() => onDuplicate(row)} color="primary" sx={{ p: 0.5 }}>
                            <DuplicateIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => onDelete(row)} color="error" sx={{ p: 0.5 }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {row.group_segment}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{row.segment}</TableCell>
                    <TableCell color="text.secondary">{row.sub_segment || '-'}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={row.segment_type} 
                        size="small" 
                        variant="outlined" 
                        sx={{ 
                            fontWeight: 'bold', 
                            fontSize: '0.65rem',
                            height: 20,
                            borderRadius: 1
                        }} 
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'medium' }}>{row.seq}</TableCell>
                    <TableCell align="center">
                      {isPending ? (
                        <ApprovalStatusBadge status="pending" />
                      ) : (
                        <Chip
                          label={status}
                          size="small"
                          color={getStatusColor(status) as any}
                          variant="filled"
                          sx={{ 
                              fontWeight: 'bold', 
                              fontSize: '0.65rem',
                              height: 20,
                              minWidth: 70,
                              borderRadius: 1
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        {row.updated_date ? new Date(row.updated_date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        }) : '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, p) => onPageChange(p)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        labelDisplayedRows={({ from, to, count }) => (
            <Box component="span" sx={{ fontSize: '0.875rem' }}>
                Showing <strong>{from}–{to}</strong> of <strong>{count}</strong>
            </Box>
        )}
        sx={{ borderTop: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}
      />
    </Paper>
  );
};
