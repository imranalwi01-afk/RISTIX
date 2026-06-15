'use client';


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
  TablePagination
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ContentCopy as DuplicateIcon,
  FileDownload as ExportIcon
} from '@mui/icons-material';
import { ApprovalStatusBadge } from '@/components/approval/ApprovalStatusBadge';

interface SegmentationTableProps {
  data: any[];
  canManage: boolean;
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

export default function SegmentationTable({
  data,
  canManage,
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
}: SegmentationTableProps) {

  const isSelected = (id: number) => selectedIds.indexOf(id) !== -1;

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll(event.target.checked);
  };

  const getStatusColor = (status: string) => {
    if (status === 'Active' || status === 'Approved') return 'success';
    if (status === 'Pending' || status === 'Submitted' || status === 'pending') return 'warning';
    if (status === 'Draft') return 'default';
    if (status === 'Rejected' || status === 'rejected') return 'error';
    return 'default';
  };

  return (
    <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }} variant="outlined">
      <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
        <Table stickyHeader size="small" aria-label="segmentation table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selectedIds.length > 0 && selectedIds.length < data.length}
                  checked={data.length > 0 && selectedIds.length === data.length}
                  onChange={handleSelectAllClick}
                  disabled={!canManage}
                />
              </TableCell>
              <TableCell><strong>Actions</strong></TableCell>
              <TableCell><strong>Group Segment</strong></TableCell>
              <TableCell><strong>Segment</strong></TableCell>
              <TableCell><strong>Sub Segment</strong></TableCell>
              <TableCell align="center"><strong>Type</strong></TableCell>
              <TableCell align="center"><strong>Seq</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
              <TableCell><strong>Updated</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Skeleton loading state could go here, for now just empty
              <TableRow style={{ height: 53 * 5 }}>
                <TableCell colSpan={9} align="center">Loading...</TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow style={{ height: 53 * 5 }}>
                <TableCell colSpan={9} align="center">
                  <Typography color="text.secondary">No records found matching your criteria</Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const isItemSelected = isSelected(row.id);
                const status = row.active_flag ? 'Active' : (row.status || 'Inactive');

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fcfcfc' } }} // Zebra Logic
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onChange={() => onSelect(row.id)}
                        disabled={!canManage}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => onView(row)} color="info">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {canManage && (
                          <>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => onEdit(row)} color="warning">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Duplicate">
                              <IconButton size="small" onClick={() => onDuplicate(row)} >
                                <DuplicateIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => onDelete(row)} color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {row.group_segment}
                    </TableCell>
                    <TableCell>{row.segment}</TableCell>
                    <TableCell>{row.sub_segment || '-'}</TableCell>
                    <TableCell align="center">
                      <Chip label={row.segment_type} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">{row.seq}</TableCell>
                    <TableCell align="center">
                      {pendingRequests.some(r => r.entityId === row.id.toString()) ? (
                        <ApprovalStatusBadge status="pending" />
                      ) : (
                        <Chip
                          label={status}
                          size="small"
                          color={getStatusColor(status)}
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {row.updated_date ? new Date(row.updated_date).toLocaleDateString() : '-'}
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
        onPageChange={(e, p) => onPageChange(p)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        labelDisplayedRows={({ from, to, count }) => `Showing ${from}–${to} of ${count} • Page ${page + 1}`}
      />
    </Paper>
  );
}
