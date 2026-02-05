// packages/frontend/src/components/banking/setup/BucketParameterModal.tsx
// ============================================================================
// BUCKET PARAMETER MODAL - PHASE 3 MODULE 3.3 DETAIL COMPONENT
// ============================================================================
// Complex master-detail modal with range management and validation
// Features: Bucket header form, detail ranges grid, overlap detection
// Legacy compliance: ASP.NET MVC bucket parameter CreateDetail functionality
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormHelperText,
  Tooltip,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccountTree as BucketIcon,
  List as ListIcon,
  Warning as WarningIcon,
  CheckCircle as ValidIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { bucketParameterAPI, BucketParameterHeader, BucketParameterDetail } from '@/services/api.bucketparameter';



interface BucketParameterModalProps {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  header: BucketParameterHeader | null;
  onClose: () => void;
  onSave: () => void;
}

interface DropdownOption {
  value: string;
  label: string;
  description?: string;
}

// ============================================================================
// BUCKET PARAMETER MODAL COMPONENT
// ============================================================================

export default function BucketParameterModal({
  open,
  mode,
  header,
  onClose,
  onSave
}: BucketParameterModalProps) {
  const { enqueueSnackbar } = useSnackbar();

  // Form state
  const [headerForm, setHeaderForm] = useState<BucketParameterHeader>({
    bucket_name: '',
    bucket_description: '',
    bucket_type: 'AGING',
    min_range: undefined,
    max_range: undefined,
    range_unit: 'DAYS',
    active_flag: true,
    seq: 1,
    bucket_group: '',
    basis: 'D',
    include_close: false,
    include_wo: false
  });

  const [details, setDetails] = useState<BucketParameterDetail[]>([]);
  const [editingDetail, setEditingDetail] = useState<BucketParameterDetail | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Dropdown data
  const [bucketTypes, setBucketTypes] = useState<DropdownOption[]>([]);
  const [rangeUnits, setRangeUnits] = useState<DropdownOption[]>([]);

  // Detail form state
  const [detailForm, setDetailForm] = useState<BucketParameterDetail>({
    range_from: 0,
    range_to: 0,
    bucket_label: '',
    bucket_code: '',
    pd_rate: undefined,
    lgd_rate: undefined,
    weight: 0,
    active_flag: true,
    seq: 1,
    bucket_name: '',
    range_start: 0
  });

  // Validation state
  const [validationResult, setValidationResult] = useState<any>(null);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    if (open) {
      loadDropdownData();

      if (header) {
        setHeaderForm({
          ...header,
          id: header.id // Ensure ID is explicitly set, though spreading `header` should already include it.
        });
        if (header.id !== undefined && header.id !== null) {
          loadDetails(header.id);
        }
      } else {
        // Reset form for create mode
        setHeaderForm({
          id: undefined,
          bucket_name: '',
          bucket_description: '',
          bucket_type: 'AGING',
          min_range: undefined,
          max_range: undefined,
          range_unit: 'DAYS',
          active_flag: true,
          seq: 1
        });
        setDetails([]);
      }
    }
  }, [open, header]);

  const loadDropdownData = async () => {
    try {
      setLoading(true);

      const [typesRes, unitsRes] = await Promise.all([
        bucketParameterAPI.getBucketTypes(),
        bucketParameterAPI.getRangeUnits()
      ]);

      if (typesRes.success) setBucketTypes(typesRes.data || []);
      if (unitsRes.success) setRangeUnits(unitsRes.data || []);

    } catch (err) {
      console.error('Error loading dropdown data:', err);
      enqueueSnackbar('Failed to load form data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async (headerId: string | number) => {
    try {
      setDetailsLoading(true);
      const response = await bucketParameterAPI.getDetails(headerId);

      if (response.success) {
        setDetails(response.data || []);
      } else {
        throw new Error(response.error || 'Failed to load bucket details');
      }
    } catch (err) {
      console.error('Error loading bucket details:', err);
      enqueueSnackbar('Failed to load bucket details', { variant: 'error' });
    } finally {
      setDetailsLoading(false);
    }
  };

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  const handleHeaderFormChange = (field: keyof BucketParameterHeader, value: any) => {
    setHeaderForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDetailFormChange = (field: keyof BucketParameterDetail, value: any) => {
    setDetailForm(prev => ({ ...prev, [field]: value }));

    // Auto-generate bucket code and label
    if (field === 'range_from' || field === 'range_to') {
      const newDetailForm = { ...detailForm, [field]: value };
      if (newDetailForm.range_from !== undefined && newDetailForm.range_to !== undefined) {
        const autoCode = bucketParameterAPI.generateBucketCode(headerForm.bucket_type || 'AGING', details.length + 1);
        const autoLabel = bucketParameterAPI.generateBucketLabel(
          headerForm.bucket_type || 'AGING',
          newDetailForm.range_from,
          newDetailForm.range_to,
          headerForm.range_unit || 'DAYS'
        );

        setDetailForm(prev => ({
          ...prev,
          bucket_code: autoCode,
          bucket_label: autoLabel
        }));
      }
    }
  };

  const handleSaveHeader = async () => {
    try {
      setSaving(true);

      if (mode === 'create') {
        const response = await bucketParameterAPI.createHeader(headerForm);

        if (response.success) {
          enqueueSnackbar('Bucket parameter created successfully', { variant: 'success' });
          onSave();
        } else {
          throw new Error(response.error || 'Failed to create bucket parameter');
        }
      } else if (mode === 'edit' && header?.id) {
        const response = await bucketParameterAPI.updateHeader(header.id, headerForm);

        if (response.success) {
          enqueueSnackbar('Bucket parameter updated successfully', { variant: 'success' });
          onSave();
        } else {
          throw new Error(response.error || 'Failed to update bucket parameter');
        }
      }
    } catch (err) {
      console.error('Error saving bucket parameter:', err);
      enqueueSnackbar('Failed to save bucket parameter', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDetail = async () => {
    const headerId = header?.id;
    if (!headerId) {
      enqueueSnackbar('Please save the bucket parameter first', { variant: 'warning' });
      return;
    }

    try {
      if (editingDetail?.id) {
        // Update existing detail
        const response = await bucketParameterAPI.updateDetail(editingDetail.id, detailForm);
        if (response.success) {
          enqueueSnackbar('Bucket range updated successfully', { variant: 'success' });
          loadDetails(headerId);
          setDetailModalOpen(false);
          setEditingDetail(null);
        } else {
          throw new Error(response.error || 'Failed to update bucket range');
        }
      } else {
        // Create new detail
        const response = await bucketParameterAPI.createDetail(headerId, detailForm);
        if (response.success) {
          enqueueSnackbar('Bucket range created successfully', { variant: 'success' });
          loadDetails(headerId);
          setDetailModalOpen(false);
        } else {
          throw new Error(response.error || 'Failed to create bucket range');
        }
      }
    } catch (err) {
      console.error('Error saving bucket range:', err);
      enqueueSnackbar('Failed to save bucket range', { variant: 'error' });
    }
  };

  const handleDeleteDetail = async (detailId: string | number) => {
    if (!confirm('Are you sure you want to delete this bucket range?')) {
      return;
    }

    try {
      const response = await bucketParameterAPI.deleteDetail(detailId);
      if (response.success) {
        enqueueSnackbar('Bucket range deleted successfully', { variant: 'success' });
        const headerId = header?.id;
        if (headerId) {
          loadDetails(headerId);
        }
      } else {
        throw new Error(response.error || 'Failed to delete bucket range');
      }
    } catch (err) {
      console.error('Error deleting bucket range:', err);
      enqueueSnackbar('Failed to delete bucket range', { variant: 'error' });
    }
  };

  const handleAddDetail = () => {
    setEditingDetail(null);
    setDetailForm({
      range_from: 0,
      range_to: 0,
      bucket_label: '',
      bucket_code: '',
      pd_rate: undefined,
      lgd_rate: undefined,
      weight: 0,
      active_flag: true,
      seq: details.length + 1
    });
    setDetailModalOpen(true);
  };

  const handleEditDetail = (detail: BucketParameterDetail) => {
    setEditingDetail(detail);
    setDetailForm(detail);
    setDetailModalOpen(true);
  };

  const handleValidateRanges = async () => {
    if (!header?.id) return;

    try {
      const response = await bucketParameterAPI.validateRanges(header.id);
      if (response.success) {
        setValidationResult(response.data);
      }
    } catch (err) {
      console.error('Error validating ranges:', err);
      enqueueSnackbar('Failed to validate ranges', { variant: 'error' });
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatRange = (detail: BucketParameterDetail) => {
    const unit = headerForm.range_unit ? ` ${headerForm.range_unit.toLowerCase()}` : '';
    return `${detail.range_from}-${detail.range_to}${unit}`;
  };

  const formatRate = (rate?: number) => {
    if (rate === undefined || rate === null) return '-';
    return `${(rate * 100).toFixed(2)}%`;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      {/* Main Modal */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BucketIcon />
            <Typography variant="h6">
              {mode === 'create' ? 'Create Bucket Parameter' :
                mode === 'edit' ? 'Edit Bucket Parameter' :
                  'View Bucket Parameter'}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3}>
              {/* Header Form */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Bucket Configuration</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Bucket Name"
                        value={headerForm.bucket_name}
                        onChange={(e) => handleHeaderFormChange('bucket_name', e.target.value)}
                        fullWidth
                        required
                        disabled={mode === 'view'}
                        placeholder="Enter unique bucket name"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth required>
                        <InputLabel>Bucket Type</InputLabel>
                        <Select
                          value={headerForm.bucket_type}
                          label="Bucket Type"
                          onChange={(e) => handleHeaderFormChange('bucket_type', e.target.value)}
                          disabled={mode === 'view'}
                        >
                          {bucketTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Description"
                        value={headerForm.bucket_description || ''}
                        onChange={(e) => handleHeaderFormChange('bucket_description', e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        disabled={mode === 'view'}
                        placeholder="Describe the purpose and usage of this bucket parameter"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        label="Min Range"
                        type="number"
                        value={headerForm.min_range || ''}
                        onChange={(e) => handleHeaderFormChange('min_range', e.target.value ? parseFloat(e.target.value) : undefined)}
                        fullWidth
                        disabled={mode === 'view'}
                        placeholder="Minimum range value"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        label="Max Range"
                        type="number"
                        value={headerForm.max_range || ''}
                        onChange={(e) => handleHeaderFormChange('max_range', e.target.value ? parseFloat(e.target.value) : undefined)}
                        fullWidth
                        disabled={mode === 'view'}
                        placeholder="Maximum range value"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControl fullWidth>
                        <InputLabel>Range Unit</InputLabel>
                        <Select
                          value={headerForm.range_unit || ''}
                          label="Range Unit"
                          onChange={(e) => handleHeaderFormChange('range_unit', e.target.value)}
                          disabled={mode === 'view'}
                        >
                          {rangeUnits.map((unit) => (
                            <MenuItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Sequence"
                        type="number"
                        value={headerForm.seq || 1}
                        onChange={(e) => handleHeaderFormChange('seq', parseInt(e.target.value))}
                        fullWidth
                        disabled={mode === 'view'}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={headerForm.active_flag}
                            onChange={(e) => handleHeaderFormChange('active_flag', e.target.checked)}
                            disabled={mode === 'view'}
                          />
                        }
                        label="Active"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Bucket Details */}
              {header?.id && (
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ListIcon />
                      <Typography variant="h6">Bucket Ranges ({details.length})</Typography>
                      {validationResult && (
                        <Chip
                          icon={validationResult.valid ? <ValidIcon /> : <WarningIcon />}
                          label={validationResult.valid ? 'Valid' : 'Issues Found'}
                          color={validationResult.valid ? 'success' : 'warning'}
                          size="small"
                        />
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {mode !== 'view' && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Button
                            variant="outlined"
                            startIcon={<ValidIcon />}
                            onClick={handleValidateRanges}
                            size="small"
                          >
                            Validate Ranges
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddDetail}
                            size="small"
                          >
                            Add Range
                          </Button>
                        </Box>
                      )}

                      {/* Validation Results */}
                      {validationResult && (
                        <Alert severity={validationResult.valid ? 'success' : 'warning'}>
                          <Typography variant="subtitle2">Range Validation Results:</Typography>
                          {validationResult.errors?.map((error: string, index: number) => (
                            <Typography key={index} variant="body2">• {error}</Typography>
                          ))}
                          {validationResult.warnings?.map((warning: string, index: number) => (
                            <Typography key={index} variant="body2">• {warning}</Typography>
                          ))}
                          {validationResult.valid && <Typography variant="body2">All ranges are valid with no overlaps or issues.</Typography>}
                        </Alert>
                      )}

                      {detailsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : details.length === 0 ? (
                        <Alert severity="info">
                          No bucket ranges configured. Click "Add Range" to create bucket ranges.
                        </Alert>
                      ) : (
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Seq</TableCell>
                                <TableCell>Range</TableCell>
                                <TableCell>Label</TableCell>
                                <TableCell>Code</TableCell>
                                <TableCell>PD Rate</TableCell>
                                <TableCell>LGD Rate</TableCell>
                                <TableCell>Weight</TableCell>
                                <TableCell>Status</TableCell>
                                {mode !== 'view' && <TableCell align="center">Actions</TableCell>}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {details.map((detail, index) => (
                                <TableRow key={detail.id || index}>
                                  <TableCell>{detail.seq}</TableCell>
                                  <TableCell>{formatRange(detail)}</TableCell>
                                  <TableCell>{detail.bucket_label}</TableCell>
                                  <TableCell>
                                    <Chip label={detail.bucket_code} size="small" />
                                  </TableCell>
                                  <TableCell>{formatRate(detail.pd_rate)}</TableCell>
                                  <TableCell>{formatRate(detail.lgd_rate)}</TableCell>
                                  <TableCell>{(detail.weight * 100).toFixed(1)}%</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={detail.active_flag ? 'Active' : 'Inactive'}
                                      color={detail.active_flag ? 'success' : 'default'}
                                      size="small"
                                    />
                                  </TableCell>
                                  {mode !== 'view' && (
                                    <TableCell align="center">
                                      <Stack direction="row" spacing={1} justifyContent="center">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleEditDetail(detail)}
                                          color="primary"
                                        >
                                          <EditIcon />
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          onClick={() => detail.id && handleDeleteDetail(detail.id)}
                                          color="error"
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </Stack>
                                    </TableCell>
                                  )}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} startIcon={<CancelIcon />}>
            {mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {mode !== 'view' && (
            <Button
              onClick={handleSaveHeader}
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Bucket Parameter'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Detail Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingDetail ? 'Edit Bucket Range' : 'Add Bucket Range'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Range From"
                type="number"
                value={detailForm.range_from}
                onChange={(e) => handleDetailFormChange('range_from', parseFloat(e.target.value))}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Range To"
                type="number"
                value={detailForm.range_to}
                onChange={(e) => handleDetailFormChange('range_to', parseFloat(e.target.value))}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Bucket Label"
                value={detailForm.bucket_label}
                onChange={(e) => handleDetailFormChange('bucket_label', e.target.value)}
                fullWidth
                required
                placeholder="Display label for this range"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Bucket Code"
                value={detailForm.bucket_code}
                onChange={(e) => handleDetailFormChange('bucket_code', e.target.value)}
                fullWidth
                required
                placeholder="Unique code for this range"
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField
                label="PD Rate"
                type="number"
                value={detailForm.pd_rate || ''}
                onChange={(e) => handleDetailFormChange('pd_rate', e.target.value ? parseFloat(e.target.value) : undefined)}
                fullWidth
                inputProps={{ min: 0, max: 1, step: 0.0001 }}
                helperText="Probability of Default (0-1)"
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField
                label="LGD Rate"
                type="number"
                value={detailForm.lgd_rate || ''}
                onChange={(e) => handleDetailFormChange('lgd_rate', e.target.value ? parseFloat(e.target.value) : undefined)}
                fullWidth
                inputProps={{ min: 0, max: 1, step: 0.0001 }}
                helperText="Loss Given Default (0-1)"
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField
                label="Weight"
                type="number"
                value={detailForm.weight}
                onChange={(e) => handleDetailFormChange('weight', parseFloat(e.target.value))}
                fullWidth
                required
                inputProps={{ min: 0, max: 1, step: 0.01 }}
                helperText="Weight factor (0-1)"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Sequence"
                type="number"
                value={detailForm.seq}
                onChange={(e) => handleDetailFormChange('seq', parseInt(e.target.value))}
                fullWidth
                required
                inputProps={{ min: 1 }}
                helperText="Display order"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={detailForm.active_flag}
                    onChange={(e) => handleDetailFormChange('active_flag', e.target.checked)}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveDetail} variant="contained">
            Save Range
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}