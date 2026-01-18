// packages/frontend/src/app/banking/segmentation/page.tsx
// ============================================================================
// 🔧 SEGMENTATION CONFIGURATION - PHASE 3 MODULE 3.1
// ============================================================================
// ✅ PATTERN: Master-Detail with Dynamic Forms + Business Settings Integration
// ✅ DATABASE: frs9_param_segmenth (header) + frs9_param_segmentd (detail)
// ✅ FEATURES: Cascading dropdowns, operator-based value inputs, complex validation
// ============================================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  MenuItem,
  Chip,
  Snackbar,
  Divider,
  Badge
} from '@mui/material';
import {
  AccountTree as PageIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  ViewList as ViewDetailIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import { api, handleAPIError } from '../../../services/api';
import SegmentationDetailModal from './components/SegmentationDetailModal';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SegmentationHeader {
  pkid: number;
  group_segment: string;
  segment: string;
  sub_segment?: string;
  segment_type: string;
  seq?: number;
  active_flag: boolean;
  detail_count?: number;
  createdby?: string;
  createddate?: string;
  updatedby?: string;
  updateddate?: string;
}

interface SegmentationHeaderForm {
  group_segment: string;
  segment: string;
  sub_segment: string;
  segment_type: string;
  seq: number | '';
  active_flag: boolean;
}

interface SegmentType {
  type_code: string;
  type_name: string;
  description?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SegmentationConfigurationPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SegmentationHeader[]>([]);
  const loadingRef = useRef(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedHeader, setSelectedHeader] = useState<SegmentationHeader | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [segmentTypes, setSegmentTypes] = useState<SegmentType[]>([]);

  const [formData, setFormData] = useState<SegmentationHeaderForm>({
    group_segment: '',
    segment: '',
    sub_segment: '',
    segment_type: '',
    seq: '',
    active_flag: true
  });

  // ============================================================================
  // DATA LOADING FUNCTIONS
  // ============================================================================

  const loadData = async () => {
    if (loadingRef.current) {
      console.log('⚠️ Load already in progress, skipping duplicate call');
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading segmentation headers from database...');

      // Load segmentation headers
      const result = await api.banking.segmentation.getHeaders();

      if (result.success && result.data) {
        console.log('✅ Successfully loaded segmentation data:', result.data.length, 'headers');
        setData(prevData => {
          if (JSON.stringify(prevData) === JSON.stringify(result.data)) {
            console.log('📝 Data unchanged, skipping update');
            return prevData;
          }
          return result.data;
        });
        setSuccess('Segmentation headers loaded successfully');
      } else {
        throw new Error(result.message || 'Failed to load segmentation headers');
      }

    } catch (error: any) {
      console.error('❌ Failed to load segmentation headers:', error);

      const errorInfo = handleAPIError(error);
      let errorMessage = 'Failed to load segmentation headers from database.';

      if (errorInfo.type === 'network_error') {
        errorMessage = 'Cannot connect to backend server. Please check your connection and ensure the backend is running.';
      } else if (errorInfo.type === 'server_error') {
        errorMessage = `Server error (${errorInfo.status}): ${errorInfo.message}`;
      }

      setError(errorMessage);
      setData([]);

    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const loadSegmentTypes = async () => {
    try {
      console.log('🔄 Loading segment types...');
      const result = await api.banking.segmentation.getSegmentTypes();

      if (result.success && result.data) {
        console.log('✅ Loaded segment types:', result.data.length);
        setSegmentTypes(result.data);
      }
    } catch (error: any) {
      console.error('❌ Failed to load segment types:', error);
      // Use fallback segment types matching legacy FRS9PRO database
      setSegmentTypes([
        { type_code: 'PD', type_name: 'PD (Probability of Default)', description: 'IFRS 9 Probability of Default risk component' },
        { type_code: 'LGD', type_name: 'LGD (Loss Given Default)', description: 'IFRS 9 Loss Given Default risk component' },
        { type_code: 'EAD', type_name: 'EAD (Exposure at Default)', description: 'IFRS 9 Exposure at Default risk component' },
        { type_code: 'PF', type_name: 'PF (Portfolio Factor)', description: 'Portfolio or Portfolio Factor segmentation' }
      ]);
    }
  };

  // ============================================================================
  // DATAGRID COLUMNS CONFIGURATION
  // ============================================================================

  const columns: GridColDef[] = [
    {
      field: 'group_segment',
      headerName: 'Group Segment',
      width: 200,
      renderCell: (params) => (
        <Chip label={params?.value || '-'} color="primary" variant="outlined" size="small" />
      )
    },
    {
      field: 'segment',
      headerName: 'Segment',
      width: 180,
      flex: 1
    },
    {
      field: 'sub_segment',
      headerName: 'Sub Segment',
      width: 150,
      renderCell: (params) => params?.value || '-'
    },
    {
      field: 'segment_type',
      headerName: 'Segment Type',
      width: 160,
      renderCell: (params) => {
        const type = segmentTypes.find(t => t.type_code === params?.value);
        return (
          <Chip
            label={type?.type_name || params?.value || '-'}
            size="small"
            color="secondary"
            variant="outlined"
          />
        );
      }
    },
    {
      field: 'seq',
      headerName: 'Sequence',
      width: 100,
      type: 'number',
      renderCell: (params) => params?.value || '-'
    },
    {
      field: 'detail_count',
      headerName: 'Rules',
      width: 80,
      renderCell: (params) => (
        <Badge badgeContent={params?.value || 0} color="info">
          <SettingsIcon fontSize="small" />
        </Badge>
      )
    },
    {
      field: 'active_flag',
      headerName: 'Active',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params?.value ? 'Active' : 'Inactive'}
          color={params?.value ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params: GridRowParams) => {
        if (!params.row) return [];
        return [
          <GridActionsCellItem
            icon={<ViewDetailIcon />}
            label="View Details"
            onClick={() => handleViewDetails(params.row)}
            key="details"
          />,
          <GridActionsCellItem
            icon={<EditIcon color="primary" />}
            label="Edit"
            onClick={() => handleEdit(params.row)}
            key="edit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon color="error" />}
            label="Delete"
            onClick={() => handleDelete(params.row)}
            key="delete"
          />
        ];
      }
    }
  ];

  // ============================================================================
  // COMPONENT LIFECYCLE
  // ============================================================================

  useEffect(() => {
    loadData();
    loadSegmentTypes();
  }, []);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleCreate = () => {
    setSelectedHeader(null);
    setFormData({
      group_segment: '',
      segment: '',
      sub_segment: '',
      segment_type: '',
      seq: '',
      active_flag: true
    });
    setDialogOpen(true);
  };

  const handleEdit = (header: SegmentationHeader) => {
    console.log('✏️ Editing segmentation header:', header.group_segment, header);
    setSelectedHeader(header);
    setFormData({
      group_segment: header.group_segment || '',
      segment: header.segment || '',
      sub_segment: header.sub_segment || '',
      segment_type: header.segment_type || '',
      seq: header.seq || '',
      active_flag: Boolean(header.active_flag)
    });
    setDialogOpen(true);
  };

  const handleViewDetails = (header: SegmentationHeader) => {
    console.log('👁️ Viewing details for segmentation header:', header.group_segment, header);
    setSelectedHeader(header);
    setDetailModalOpen(true);
  };

  const handleDelete = async (header: SegmentationHeader) => {
    if (!confirm(`Are you sure you want to delete segmentation "${header.group_segment} - ${header.segment}"? This will also delete all associated detail rules.`)) {
      return;
    }

    try {
      setLoading(true);
      console.log('🗑️ Deleting segmentation header:', header.pkid);

      await api.banking.segmentation.deleteHeader(header.pkid);

      console.log('✅ Segmentation header deleted successfully');
      setSuccess('Segmentation deleted successfully');
      await loadData(); // Reload data

    } catch (error: any) {
      console.error('❌ Failed to delete segmentation header:', error);
      const errorInfo = handleAPIError(error);
      setError(`Failed to delete segmentation: ${errorInfo.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    const errors: string[] = [];

    if (!formData.group_segment.trim()) {
      errors.push('Group Segment is required');
    }
    if (!formData.segment.trim()) {
      errors.push('Segment is required');
    }
    if (!formData.segment_type.trim()) {
      errors.push('Segment Type is required');
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        group_segment: formData.group_segment.trim(),
        segment: formData.segment.trim(),
        sub_segment: formData.sub_segment.trim(),
        segment_type: formData.segment_type,
        seq: formData.seq === '' ? undefined : Number(formData.seq),
        active_flag: formData.active_flag
      };

      if (selectedHeader) {
        // Update existing header
        console.log('✏️ Updating segmentation header:', payload);
        await api.banking.segmentation.updateHeader(selectedHeader.pkid, payload);
        setSuccess('Segmentation updated successfully');
      } else {
        // Create new header
        console.log('➕ Creating segmentation header:', payload);
        await api.banking.segmentation.createHeader(payload);
        setSuccess('Segmentation created successfully');
      }

      setDialogOpen(false);
      await loadData(); // Reload data

    } catch (error: any) {
      console.error('❌ Failed to save segmentation header:', error);
      const errorInfo = handleAPIError(error);
      setError(`Failed to save segmentation: ${errorInfo.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER LOADING STATE
  // ============================================================================

  if (loading && data.length === 0) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <CircularProgress size={48} />
            <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold' }}>
              Loading Segmentation Configuration...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Fetching data from FRS9PRO database
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Container maxWidth="xl">
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PageIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Segmentation Configuration
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            Master-detail configuration for portfolio segmentation rules and criteria
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={loadData} color="primary" disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            disabled={loading}
          >
            Add Segmentation
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Card>
        <CardContent>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={data}
              columns={columns}
              getRowId={(row) => row?.pkid || `row_${JSON.stringify(row).slice(0, 50)}`}
              pageSizeOptions={[5, 10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } }
              }}
              disableRowSelectionOnClick
              loading={loading}
              slotProps={{
                loadingOverlay: {
                  variant: 'linear-progress' as const,
                  noRowsVariant: 'skeleton' as const,
                },
                noRowsOverlay: {
                  children: (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        gap: 2
                      }}
                    >
                      <ErrorIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                      <Typography variant="h6" color="text.secondary">
                        No Segmentation Configuration Found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        {error ? 'Failed to load data from database.' : 'No segmentation rules configured yet.'}
                        <br />
                        {error ? 'Check your connection and try refreshing.' : 'Click "Add Segmentation" to create the first one.'}
                      </Typography>
                    </Box>
                  )
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Create/Edit Header Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedHeader ? 'Edit Segmentation Header' : 'Create Segmentation Header'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 2 }}>
            {/* Group Segment - REQUIRED */}
            <TextField
              label="Group Segment *"
              value={formData.group_segment}
              onChange={(e) => setFormData(prev => ({ ...prev, group_segment: e.target.value }))}
              fullWidth
              required
              slotProps={{ htmlInput: { maxLength: 150 } }}
              placeholder="Group Segment"
              error={!formData.group_segment.trim()}
              helperText={!formData.group_segment.trim() ? 'Group Segment is required' : 'Group classification name (max 150 characters)'}
            />

            {/* Segment - REQUIRED */}
            <TextField
              label="Segment *"
              value={formData.segment}
              onChange={(e) => setFormData(prev => ({ ...prev, segment: e.target.value }))}
              fullWidth
              required
              slotProps={{ htmlInput: { maxLength: 150 } }}
              placeholder="Segment"
              error={!formData.segment.trim()}
              helperText={!formData.segment.trim() ? 'Segment is required' : 'Main segment name (max 150 characters)'}
            />

            {/* Sub Segment - OPTIONAL */}
            <TextField
              label="Sub Segment"
              value={formData.sub_segment}
              onChange={(e) => setFormData(prev => ({ ...prev, sub_segment: e.target.value }))}
              fullWidth
              slotProps={{ htmlInput: { maxLength: 150 } }}
              placeholder="Sub Segment (optional)"
              helperText="Optional sub-segment for detailed classification (max 150 characters)"
            />

            {/* Segment Type - REQUIRED */}
            <TextField
              label="Segment Type *"
              select
              value={formData.segment_type}
              onChange={(e) => setFormData(prev => ({ ...prev, segment_type: e.target.value }))}
              fullWidth
              required
              error={!formData.segment_type.trim()}
              helperText={!formData.segment_type.trim() ? 'Segment Type is required' : 'Type of segmentation classification'}
            >
              <MenuItem value="">Select Segment Type</MenuItem>
              {segmentTypes.map((type) => (
                <MenuItem key={type.type_code} value={type.type_code}>
                  {type.type_name}
                </MenuItem>
              ))}
            </TextField>

            {/* Sequence - OPTIONAL */}
            <TextField
              label="Sequence"
              type="number"
              value={formData.seq}
              onChange={(e) => setFormData(prev => ({ ...prev, seq: e.target.value ? Number(e.target.value) : '' }))}
              fullWidth
              placeholder="Display sequence"
              helperText="Optional display order sequence"
              slotProps={{ htmlInput: { min: 1 } }}
            />

            {/* Active Flag */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active_flag}
                    onChange={(e) => setFormData(prev => ({ ...prev, active_flag: e.target.checked }))}
                  />
                }
                label="Active"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading || !formData.group_segment.trim() || !formData.segment.trim() || !formData.segment_type.trim()}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Saving...' : (selectedHeader ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Segmentation Detail Modal */}
      {selectedHeader && (
        <SegmentationDetailModal
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          header={selectedHeader!}
          onRefresh={loadData}
        />
      )}

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}