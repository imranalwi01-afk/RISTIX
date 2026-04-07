'use client';

import React, { memo, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import api from '@/services/api';
import EmptyState from '@/components/banking/shared/EmptyState';
import type { BusinessParameter } from './BusinessParameterDialog';
import type { BusinessParameterDetail } from './BusinessDetailFormDialog';

interface BusinessDetailPanelProps {
  row: BusinessParameter;
  refreshTrigger: number;
  canManage?: boolean;
  onEditDetail: (detail: BusinessParameterDetail) => void;
  onDeleteDetail: (detail: BusinessParameterDetail, reload: () => void) => void;
  onAddDetail: (paramCode: string, nextSeq: number) => void;
}

const BusinessDetailPanel = memo(function BusinessDetailPanel({
  row,
  refreshTrigger,
  canManage = false,
  onEditDetail,
  onDeleteDetail,
  onAddDetail,
}: BusinessDetailPanelProps) {
  const [details, setDetails] = useState<BusinessParameterDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const response = await api.banking.businessSetup.getHeaderDetails(row.param_code);
      if (response.success && response.data) {
        setDetails(
          response.data.map((item: any) => ({
            pkid: item.pkid?.toString() || item.id?.toString() || '',
            param_code: item.paramCode || item.param_code || row.param_code,
            param_seq: item.paramSeq || item.param_seq || 0,
            value1: item.value1 || '',
            value2: item.value2 || '',
            value3: item.value3 || '',
            paramdesc: item.paramdesc || item.description || item.param_desc || '',
          })),
        );
      } else {
        setDetails([]);
      }
    } catch (error) {
      console.error('Failed to load details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [row.param_code, refreshTrigger]);

  const nextSeq = details.length > 0 ? Math.max(...details.map((d) => d.param_seq)) + 1 : 1;

  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'rgba(0, 0, 0, 0.02)', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.dark', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DescriptionIcon fontSize="small" />
          Details for {row.param_code}
        </Typography>
        {canManage && (
          <Button
            size="small"
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => onAddDetail(row.param_code, nextSeq)}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Add Detail
          </Button>
        )}
      </Box>

      {details.length === 0 ? (
        <EmptyState
          title="No Details Found"
          description={`No parameters sequences defined for ${row.param_code}.`}
        />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Seq</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Value 1</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Value 2</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Value 3</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {details.map((detail) => (
                <TableRow key={detail.pkid || `${detail.param_code}-${detail.param_seq}`} hover>
                  <TableCell>
                    <Chip label={detail.param_seq} size="small" variant="outlined" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>{detail.value1}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>{detail.value2 || '-'}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>{detail.value3 || '-'}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{detail.paramdesc}</TableCell>
                  <TableCell align="right">
                    {canManage && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton size="small" color="primary" onClick={() => onEditDetail(detail)} sx={{ p: 0.5 }} data-testid="btn-edit-detail">
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => onDeleteDetail(detail, loadDetails)} sx={{ p: 0.5 }} data-testid="btn-delete-detail">
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
});

export default BusinessDetailPanel;
