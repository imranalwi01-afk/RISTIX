'use client';

import React, { memo, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  KeyboardArrowDown,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { bucketParameterAPI, BucketParameterDetail, BucketParameterHeader } from '@/services/api.bucketparameter';
import { ApprovalStatusBadge } from '@/components/approval';

interface BucketHeaderRowProps {
  header: BucketParameterHeader;
  basisOptions: { value1: string; paramdesc: string }[];
  canManage: boolean;
  onEdit: (header: BucketParameterHeader) => void;
  onDelete: (header: BucketParameterHeader) => void;
  onAddDetail: (header: BucketParameterHeader) => void;
  onEditDetail: (detail: BucketParameterDetail) => void;
  onDeleteDetail: (detail: BucketParameterDetail) => void;
  pendingRequests?: any[];
}

function BucketHeaderRowComponent({
  header,
  basisOptions,
  canManage,
  onEdit,
  onDelete,
  onAddDetail,
  onEditDetail,
  onDeleteDetail,
  pendingRequests = [],
}: BucketHeaderRowProps) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<BucketParameterDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadDetails = async () => {
    if (!header.id) {
      setDetailsLoading(false);
      return;
    }
    try {
      const response = await bucketParameterAPI.getDetails(header.id);
      if (response.success) {
        setDetails(response.data || []);
      } else {
        setDetails([]);
      }
    } catch (error) {
      console.error('Error loading details:', error);
      setDetails([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (open && details.length === 0) {
      loadDetails();
    }
  }, [open]);

  const getBasisDescription = (basisCode: string): string => {
    const basis = basisOptions.find((b) => b.value1 === basisCode);
    return basis?.paramdesc || basisCode;
  };

  const formatRange = (start: number, end?: number | null): string => {
    if (end === null || end === undefined) return `${start.toLocaleString()} - ∞`;
    if (end === 9999) return `${start.toLocaleString()} - ∞`;
    return `${start.toLocaleString()} - ${end.toLocaleString()}`;
  };

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)} data-testid="expand-row-btn">
            {open ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight="medium">
            {header.bucket_group}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {header.bucket_group_desc || header.bucket_desc || '-'}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={getBasisDescription(header.basis || '')}
            size="small"
            color={header.basis === 'D' ? 'primary' : 'info'}
            variant="outlined"
            data-testid="basis-chip"
          />
        </TableCell>
        <TableCell align="center">
          <Chip
            label={header.include_close ? 'Yes' : 'No'}
            size="small"
            color={header.include_close ? 'success' : 'default'}
            variant="outlined"
            data-testid="include-close-chip"
          />
        </TableCell>
        <TableCell align="center">
          <Chip
            label={header.include_wo ? 'Yes' : 'No'}
            size="small"
            color={header.include_wo ? 'warning' : 'default'}
            variant="outlined"
            data-testid="include-wo-chip"
          />
        </TableCell>
        <TableCell align="center">
          {pendingRequests.some((r) => r.entityId === header.id?.toString()) ? (
            <ApprovalStatusBadge status="pending" />
          ) : (
            <Chip
              label={header.active_flag ? 'Active' : 'Inactive'}
              size="small"
              color={header.active_flag ? 'success' : 'default'}
              variant="outlined"
              data-testid="header-status-chip"
            />
          )}
        </TableCell>
        <TableCell>
          {canManage && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Edit Bucket Group">
                <IconButton size="small" onClick={() => onEdit(header)} color="primary" data-testid="edit-header-btn">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Bucket Group">
                <IconButton size="small" onClick={() => onDelete(header)} color="error" data-testid="delete-header-btn">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom component="div" color="primary">
                  Bucket Details
                </Typography>
                {canManage && (
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => onAddDetail(header)}
                    variant="contained"
                    color="primary"
                    data-testid="add-detail-btn"
                  >
                    Add Detail
                  </Button>
                )}
              </Box>

              {detailsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : details.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Range Start</strong></TableCell>
                        <TableCell><strong>Range End</strong></TableCell>
                        <TableCell><strong>Display</strong></TableCell>
                        <TableCell align="center"><strong>Status</strong></TableCell>
                        <TableCell align="center"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {details.map((detail) => (
                        <TableRow key={detail.id || `detail-${detail.seq}`} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {detail.bucket_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {detail.range_start}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {detail.range_end ?? '∞'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="primary" fontWeight="medium">
                              {formatRange(detail.range_start || 0, detail.range_end)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={detail.active_flag ? 'Active' : 'Inactive'}
                              size="small"
                              color={detail.active_flag ? 'success' : 'default'}
                              variant="outlined"
                              data-testid="detail-status-chip"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {canManage && (
                              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                <Tooltip title="Edit Detail">
                                  <IconButton size="small" onClick={() => onEditDetail(detail)} color="primary" data-testid="edit-detail-btn">
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Detail">
                                  <IconButton size="small" onClick={() => onDeleteDetail(detail)} color="error" data-testid="delete-detail-btn">
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info" sx={{ mt: 1 }}>
                  No bucket details found. Click Add Detail to create one.
                </Alert>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export const BucketHeaderRow = memo(BucketHeaderRowComponent);
