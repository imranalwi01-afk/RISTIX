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
  Tooltip,
  Typography,
  TablePagination
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { ApprovalStatusBadge } from '@/components/approval/ApprovalStatusBadge';

interface SegmentationTableProps {
  data: any[];
  canManage: boolean;
  onView: (item: any) => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
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
  onView,
  onEdit,
  onDelete,
  loading,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  pendingRequests = []
}: SegmentationTableProps) {

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
              <TableCell><strong>Group Segment</strong></TableCell>
              <TableCell><strong>Segment</strong></TableCell>
              <TableCell><strong>Sub Segment</strong></TableCell>
              <TableCell align="center"><strong>Type</strong></TableCell>
              <TableCell align="center"><strong>Seq</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
              <TableCell><strong>Updated</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Skeleton loading state could go here, for now just empty
              <TableRow style={{ height: 53 * 5 }}>
                <TableCell colSpan={8} align="center">Loading...</TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow style={{ height: 53 * 5 }}>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary">No records found matching your criteria</Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const status = row.active_flag ? 'Active' : (row.status || 'Inactive');

                return (
                  <TableRow
                    hover
                    tabIndex={-1}
                    key={row.id}
                    sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fcfcfc' } }} // Zebra Logic
                  >
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
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
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
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => onDelete(row)} color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
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
