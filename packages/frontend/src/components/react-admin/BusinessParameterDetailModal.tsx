// packages/frontend/src/components/react-admin/BusinessParameterDetailModal.tsx
// ============================================================================
// 🔧 BUSI-005: BUSINESS PARAMETER DETAIL MODAL - MASTER-DETAIL PATTERN
// ============================================================================
// ✅ IMPLEMENTS: Modal for viewing/editing Business Parameter details
// ✅ PATTERN: Master-Detail Pattern with professional UI
// ✅ FEATURES: View mode, edit mode, create new details, validation
// ✅ API: /api/v1/business/headers/:id/details (Master-Detail Pattern)
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  TextField,
  Divider,
  CircularProgress,
  FormControl,
  FormHelperText
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useDataProvider, useNotify } from 'react-admin';

// ==========================================
// INTERFACE DEFINITIONS
// ==========================================

interface BusinessParameterRecord {
  pkid: number;
  id: number;
  param_code: string;
  param_name: string;
  param_usage: string;
  param_type: string;
  createdby: string;
  createddate: string;
  updatedby?: string;
  updateddate?: string;
  details?: BusinessParameterDetail[];
}

interface BusinessParameterDetail {
  pkid: number;
  id: number;
  param_code: string;
  param_seq: number;
  value1: string;
  value2: string;
  value3: string;
  paramdesc: string;
  createdby: string;
  createddate: string;
  updatedby?: string;
  updateddate?: string;
}

interface DetailFormData {
  param_seq: number;
  value1: string;
  value2: string;
  value3: string;
  paramdesc: string;
}

interface BusinessParameterDetailModalProps {
  open: boolean;
  onClose: () => void;
  header: BusinessParameterRecord;
  mode: 'view' | 'edit';
  selectedDetail?: BusinessParameterDetail | null;
  onSave: (detail: BusinessParameterDetail) => void;
}

// ==========================================
// DETAIL FORM COMPONENT
// ==========================================

interface DetailFormProps {
  detail?: BusinessParameterDetail;
  nextSeq: number;
  onSave: (formData: DetailFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const DetailForm: React.FC<DetailFormProps> = ({
  detail,
  nextSeq,
  onSave,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState<DetailFormData>({
    param_seq: detail?.param_seq || nextSeq,
    value1: detail?.value1 || '',
    value2: detail?.value2 || '',
    value3: detail?.value3 || '',
    paramdesc: detail?.paramdesc || ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DetailFormData, string>>>({});

  const handleInputChange = useCallback((field: keyof DetailFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'param_seq' ? parseInt(event.target.value) || 0 : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof DetailFormData, string>> = {};

    if (!formData.param_seq || formData.param_seq < 1) {
      newErrors.param_seq = 'Sequence must be a positive number';
    }

    if (!formData.value1.trim()) {
      newErrors.value1 = 'Value 1 is required';
    } else if (formData.value1.length > 100) {
      newErrors.value1 = 'Value 1 must be 100 characters or less';
    }

    if (formData.value2.length > 100) {
      newErrors.value2 = 'Value 2 must be 100 characters or less';
    }

    if (formData.value3.length > 50) {
      newErrors.value3 = 'Value 3 must be 50 characters or less';
    }

    if (formData.paramdesc.length > 1000) {
      newErrors.paramdesc = 'Description must be 1000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      onSave(formData);
    }
  }, [formData, validateForm, onSave]);

  return (
    <Card variant="outlined">
      <CardHeader
        avatar={<SettingsIcon color="primary" />}
        title={detail ? 'Edit Business Parameter Detail' : 'Add New Business Parameter Detail'}
        subheader="Configure business rule values and descriptions"
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Sequence Number"
              type="number"
              value={formData.param_seq}
              onChange={handleInputChange('param_seq')}
              error={!!errors.param_seq}
              helperText={errors.param_seq || 'Unique sequence number for this detail'}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Value 1"
              value={formData.value1}
              onChange={handleInputChange('value1')}
              error={!!errors.value1}
              helperText={errors.value1 || 'Primary configuration value (required)'}
              fullWidth
              required
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Value 2"
              value={formData.value2}
              onChange={handleInputChange('value2')}
              error={!!errors.value2}
              helperText={errors.value2 || 'Secondary configuration value (optional)'}
              fullWidth
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Value 3"
              value={formData.value3}
              onChange={handleInputChange('value3')}
              error={!!errors.value3}
              helperText={errors.value3 || 'Tertiary configuration value (optional)'}
              fullWidth
              inputProps={{ maxLength: 50 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description"
              value={formData.paramdesc}
              onChange={handleInputChange('paramdesc')}
              error={!!errors.paramdesc}
              helperText={errors.paramdesc || 'Detailed description of this business rule'}
              fullWidth
              multiline
              rows={3}
              inputProps={{ maxLength: 1000 }}
            />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button
            onClick={onCancel}
            color="inherit"
            startIcon={<CancelIcon />}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (detail ? 'Update Detail' : 'Add Detail')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// ==========================================
// MAIN MODAL COMPONENT
// ==========================================

export const BusinessParameterDetailModal: React.FC<BusinessParameterDetailModalProps> = ({
  open,
  onClose,
  header,
  mode,
  selectedDetail,
  onSave
}) => {
  const [details, setDetails] = useState<BusinessParameterDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDetail, setEditingDetail] = useState<BusinessParameterDetail | null>(null);
  const dataProvider = useDataProvider();
  const notify = useNotify();

  // Load details when modal opens
  useEffect(() => {
    if (open && header) {
      loadDetails();
    }
  }, [open, header]);

  const loadDetails = useCallback(async () => {
    if (!header) return;

    setLoading(true);
    try {
      console.log('📋 [BUSI-005] Loading business parameter details for:', header.param_code);

      const response = await dataProvider.getOne('business/headers', {
        id: header.pkid,
        meta: { endpoint: `business/headers/${header.pkid}/details` }
      });

      setDetails(response.data || []);
      console.log(`✅ [BUSI-005] Loaded ${response.data?.length || 0} business parameter details`);

    } catch (error) {
      console.error('❌ [BUSI-005] Failed to load business parameter details:', error);
      notify('Failed to load business parameter details', { type: 'error' });
      setDetails([]);
    } finally {
      setLoading(false);
    }
  }, [header, dataProvider, notify]);

  // Handle save detail
  const handleSaveDetail = useCallback(async (formData: DetailFormData) => {
    if (!header) return;

    setSaving(true);
    try {
      let response;

      if (editingDetail) {
        // Update existing detail
        console.log('📝 [BUSI-005] Updating business parameter detail:', editingDetail.pkid);
        response = await dataProvider.update('business/details', {
          id: editingDetail.pkid,
          data: formData,
          previousData: editingDetail
        });
      } else {
        // Create new detail
        console.log('➕ [BUSI-005] Creating new business parameter detail for:', header.param_code);
        response = await dataProvider.create('business/headers', {
          data: formData,
          meta: { endpoint: `business/headers/${header.pkid}/details` }
        });
      }

      console.log('✅ [BUSI-005] Business parameter detail saved successfully');
      notify(editingDetail ? 'Detail updated successfully' : 'Detail created successfully', { type: 'success' });

      // Reload details
      await loadDetails();

      // Close forms
      setShowAddForm(false);
      setEditingDetail(null);

      // Call parent callback
      onSave(response.data);

    } catch (error) {
      console.error('❌ [BUSI-005] Failed to save business parameter detail:', error);
      notify('Failed to save business parameter detail', { type: 'error' });
    } finally {
      setSaving(false);
    }
  }, [header, editingDetail, dataProvider, notify, loadDetails, onSave]);

  // Handle delete detail
  const handleDeleteDetail = useCallback(async (detail: BusinessParameterDetail) => {
    if (!window.confirm('Are you sure you want to delete this business parameter detail?')) {
      return;
    }

    try {
      console.log('🗑️ [BUSI-005] Deleting business parameter detail:', detail.pkid);

      await dataProvider.delete('business/details', {
        id: detail.pkid
      });

      console.log('✅ [BUSI-005] Business parameter detail deleted successfully');
      notify('Detail deleted successfully', { type: 'success' });

      // Reload details
      await loadDetails();

    } catch (error) {
      console.error('❌ [BUSI-005] Failed to delete business parameter detail:', error);
      notify('Failed to delete business parameter detail', { type: 'error' });
    }
  }, [dataProvider, notify, loadDetails]);

  // Get next sequence number
  const getNextSequence = useCallback((): number => {
    if (details.length === 0) return 1;
    const maxSeq = Math.max(...details.map(d => d.param_seq));
    return maxSeq + 1;
  }, [details]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <BusinessIcon color="primary" sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h6">
                Business Parameter Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {header.param_code} - {header.param_name}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Header Information */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Parameter Code</Typography>
                <Typography variant="body1" fontWeight="bold">{header.param_code}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Parameter Type</Typography>
                <Chip label="BUSINESS" color="success" size="small" icon={<SettingsIcon />} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Parameter Name</Typography>
                <Typography variant="body1">{header.param_name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Usage Description</Typography>
                <Typography variant="body1" color="text.secondary">{header.param_usage}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Divider sx={{ my: 2 }} />

        {/* Details Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            📋 Business Parameter Details ({details.length})
          </Typography>
          {!showAddForm && !editingDetail && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setShowAddForm(true)}
            >
              Add Detail
            </Button>
          )}
        </Box>

        {/* Add Form */}
        {showAddForm && (
          <Box mb={3}>
            <DetailForm
              nextSeq={getNextSequence()}
              onSave={handleSaveDetail}
              onCancel={() => setShowAddForm(false)}
              isLoading={saving}
            />
          </Box>
        )}

        {/* Edit Form */}
        {editingDetail && (
          <Box mb={3}>
            <DetailForm
              detail={editingDetail}
              nextSeq={getNextSequence()}
              onSave={handleSaveDetail}
              onCancel={() => setEditingDetail(null)}
              isLoading={saving}
            />
          </Box>
        )}

        {/* Details Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : details.length > 0 ? (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Seq</strong></TableCell>
                  <TableCell><strong>Value 1</strong></TableCell>
                  <TableCell><strong>Value 2</strong></TableCell>
                  <TableCell><strong>Value 3</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Created By</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {details.map((detail) => (
                  <TableRow key={detail.pkid} hover>
                    <TableCell>
                      <Chip
                        label={detail.param_seq}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {detail.value1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {detail.value2 || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {detail.value3 || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {detail.paramdesc || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {detail.createdby}
                        <br />
                        {new Date(detail.createddate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Edit Detail">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => setEditingDetail(detail)}
                            disabled={showAddForm || !!editingDetail}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Detail">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteDetail(detail)}
                            disabled={showAddForm || !!editingDetail}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info" icon={<InfoIcon />}>
            <Typography variant="body2">
              No details found for this business parameter. Click "Add Detail" to create the first business rule configuration.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

console.log('✅ [BUSI-005] BusinessParameterDetailModal component loaded - Master-Detail Pattern with React Admin');