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
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material';
import { bankingAPI } from '@/services/api';
import { ApprovalStatusBadge } from '@/components/approval';
import type { RuleBaseDetail, RuleBaseHeader } from '../types';

interface RuleBaseExpandableRowProps {
  header: RuleBaseHeader;
  canManage: boolean;
  onEditHeader: (header: RuleBaseHeader) => void;
  onDeleteHeader: (header: RuleBaseHeader) => void;
  onCreateDetail: (headerId: number) => void;
  onEditDetail: (detail: RuleBaseDetail) => void;
  onDeleteDetail: (detail: RuleBaseDetail) => void;
  loading: boolean;
  refreshTrigger?: number;
  pendingRequests?: any[];
}

function RuleBaseExpandableRowComponent({
  header,
  canManage,
  onEditHeader,
  onDeleteHeader,
  onCreateDetail,
  onEditDetail,
  onDeleteDetail,
  loading,
  refreshTrigger,
  pendingRequests = [],
}: RuleBaseExpandableRowProps) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<RuleBaseDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadDetails = async () => {
    setLoadingDetails(true);
    try {
      const response = await bankingAPI.ruleBaseSetting.getDetails(header.id);
      if (response.success) {
        setDetails(response.data);
      } else {
        throw new Error(response.error || 'Failed to load rule details');
      }
    } catch (error) {
      console.error('Error loading rule details:', error);
      setDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggle = async () => {
    if (!open && details.length === 0) {
      await loadDetails();
    }
    setOpen(!open);
  };

  useEffect(() => {
    if (refreshTrigger) {
      loadDetails();
    }
  }, [refreshTrigger]);

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={handleToggle} disabled={loading}>
            {open ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }} data-testid="rule-id-cell">
            {header.id}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }} data-testid="rule-name-cell">
            {header.rule_name}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={header.rule_type}
            size="small"
            color={header.rule_type === 'STAGE' ? 'primary' : header.rule_type === 'DEFAULT' ? 'warning' : 'info'}
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {header.updated_table}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {header.updated_column}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {header.value}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Chip label={header.seq} size="small" variant="outlined" />
        </TableCell>
        <TableCell>
          {pendingRequests.some((r) => r.entityId === header.id.toString()) ? (
            <ApprovalStatusBadge status="pending" />
          ) : (
            <Chip
              label={header.active_flag ? 'Active' : 'Inactive'}
              size="small"
              color={header.active_flag ? 'success' : 'default'}
            />
          )}
        </TableCell>
        <TableCell>
          <Chip label={details.length || 0} size="small" color="info" />
        </TableCell>
        <TableCell>
          {canManage && (
            <>
              <Tooltip title="Edit Rule Header">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => onEditHeader(header)}
                  disabled={loading}
                  data-testid="edit-header-btn"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Rule Header">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDeleteHeader(header)}
                  disabled={loading}
                  data-testid="delete-header-btn"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold' }}>
                  Rule Details for: {header.rule_name}
                </Typography>
                {canManage && (
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => onCreateDetail(header.id)}
                    disabled={loading}
                    variant="outlined"
                    data-testid="add-detail-btn"
                  >
                    Add Detail
                  </Button>
                )}
              </Box>

              {loadingDetails ? (
                <Box display="flex" justifyContent="center" py={3}>
                  <CircularProgress size={24} />
                </Box>
              ) : details.length === 0 ? (
                <Alert severity="info">
                  No rule details found for this header.
                </Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Group</strong></TableCell>
                        <TableCell><strong>Seq</strong></TableCell>
                        <TableCell><strong>Table</strong></TableCell>
                        <TableCell><strong>Column</strong></TableCell>
                        <TableCell><strong>Data Type</strong></TableCell>
                        <TableCell><strong>Operator</strong></TableCell>
                        <TableCell><strong>Value 1</strong></TableCell>
                        <TableCell><strong>Value 2</strong></TableCell>
                        <TableCell><strong>Condition</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {details.map((detail, index) => (
                        <TableRow key={detail.id ? `detail-${detail.id}` : `detail-idx-${index}`} hover>
                          <TableCell>
                            <Chip label={detail.query_group} size="small" color="info" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {detail.seq}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {detail.table_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {detail.column_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={detail.data_type} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {detail.operator}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {detail.value1 || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {detail.value2 || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={detail.condition}
                              size="small"
                              color={detail.condition === 'AND' ? 'primary' : 'secondary'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {detail.detail_type || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {canManage && (
                              <>
                                <Tooltip title="Edit Detail">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => onEditDetail(detail)}
                                    disabled={loading}
                                    data-testid="edit-detail-btn"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Detail">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => onDeleteDetail(detail)}
                                    disabled={loading}
                                    data-testid="delete-detail-btn"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export const RuleBaseExpandableRow = memo(RuleBaseExpandableRowComponent);
