'use client';

import React, { memo } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import type { ModelManagementTableProps } from './types';

const getStatusColor = (status: boolean) => (status ? '#4caf50' : '#f44336');
const getStatusLabel = (status: boolean) => (status ? 'Active' : 'Inactive');

const ModelManagementTable = memo(function ModelManagementTable({
  loading,
  rowsPerPage,
  paginatedData,
  modelType,
  totalCount,
  page,
  onChangePage,
  onChangeRowsPerPage,
  onViewModel,
  onEditModel,
  onDeleteModel,
}: ModelManagementTableProps) {
  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Model Name</TableCell>
              <TableCell>Segment</TableCell>
              <TableCell>Method</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell>Effective Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell align="center"><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell align="right"><Skeleton variant="text" /></TableCell>
                </TableRow>
              ))
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No {modelType} models found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((model, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {model.model_name || model.name || `Model ${index + 1}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={model.segment_id ? `Segment ${model.segment_id}` : 'All Segments'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {model.selected_method || model.lgd_method || model.ead_method || 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getStatusLabel(Boolean(model.active_flag || model.isActive))}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(Boolean(model.active_flag || model.isActive)),
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {model.effective_date || new Date().toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => onViewModel(model)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Model">
                        <IconButton size="small" onClick={() => onEditModel(model)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Model">
                        <IconButton size="small" color="error" onClick={() => onDeleteModel(model)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
      />
    </Paper>
  );
});

export default ModelManagementTable;
