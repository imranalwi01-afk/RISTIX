// packages/frontend/src/components/react-admin/ApplicationParameterDetail.tsx
// ============================================================================
// 🔧 APPL-005: APPLICATION PARAMETER DETAIL MODAL - MASTER-DETAIL PATTERN
// ============================================================================
// ✅ IMPLEMENTS: Detail modal component for Application Parameter management
// ✅ PATTERN: Master-Detail Pattern with detailed parameter configuration
// ✅ FEATURES: Create, Edit, View, Delete parameter details with validation
// ✅ INTEGRATION: Works with ApplicationParameterList component
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  Alert,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Fab
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useDataProvider, useNotify, useRefresh } from 'react-admin';

// =====================================================
// INTERFACES & TYPES
// =====================================================

interface ApplicationParameterHeader {
  pkid: number;
  param_code: string;
  param_name: string;
  param_usage: string;
  param_type: string;
  createdby: string;
  createddate: string;
  updatedby?: string;
  updateddate?: string;
  details?: ApplicationParameterDetail[];
}

interface ApplicationParameterDetail {
  pkid?: number;
  param_code: string;
  param_seq: number;
  value1: string;
  value2?: string;
  value3?: string;
  paramdesc?: string;
  createdby?: string;
  createddate?: string;
  updatedby?: string;
  updateddate?: string;
}

interface ApplicationParameterDetailModalProps {
  open: boolean;
  onClose: () => void;
  header: ApplicationParameterHeader;
  mode: 'view' | 'edit' | 'create';
  selectedDetail?: ApplicationParameterDetail | null;
  onSave?: (detail: ApplicationParameterDetail) => void;
  onDelete?: (detailId: number) => void;
}

// =====================================================
// DETAIL FORM COMPONENT
// =====================================================

const DetailForm: React.FC<{
  detail: Partial<ApplicationParameterDetail>;
  onChange: (detail: Partial<ApplicationParameterDetail>) => void;
  errors: Record<string, string>;
  mode: 'create' | 'edit' | 'view';
  paramCode: string;
}> = ({ detail, onChange, errors, mode, paramCode }) => {
  
  const isReadOnly = mode === 'view';
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          label="Parameter Code"
          value={paramCode}
          disabled
          fullWidth
          variant="outlined"
          helperText="Inherited from parameter header"
          sx={{ 
            '& .MuiInputBase-input': { 
              fontFamily: 'monospace',
              fontWeight: 'bold',
              backgroundColor: 'grey.50'
            }
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          label="Sequence Number"
          type="number"
          value={detail.param_seq || ''}
          onChange={(e) => onChange({ ...detail, param_seq: parseInt(e.target.value) || 1 })}
          disabled={isReadOnly}
          required
          fullWidth
          variant="outlined"
          error={!!errors.param_seq}
          helperText={errors.param_seq || 'Order of this detail within the parameter'}
          inputProps={{ min: 1, max: 999 }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          label="Value 1"
          value={detail.value1 || ''}
          onChange={(e) => onChange({ ...detail, value1: e.target.value })}
          disabled={isReadOnly}
          required
          fullWidth
          variant="outlined"
          error={!!errors.value1}
          helperText={errors.value1 || 'Primary configuration value (required)'}
          inputProps={{ maxLength: 100 }}
          sx={{ 
            '& .MuiInputBase-input': { 
              fontFamily: 'monospace',
              fontWeight: 'bold'
            }
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          label="Value 2"
          value={detail.value2 || ''}
          onChange={(e) => onChange({ ...detail, value2: e.target.value })}
          disabled={isReadOnly}
          fullWidth
          variant="outlined"
          error={!!errors.value2}
          helperText={errors.value2 || 'Secondary configuration value (optional)'}
          inputProps={{ maxLength: 100 }}
          sx={{ 
            '& .MuiInputBase-input': { 
              fontFamily: 'monospace'
            }
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          label="Value 3"
          value={detail.value3 || ''}
          onChange={(e) => onChange({ ...detail, value3: e.target.value })}
          disabled={isReadOnly}
          fullWidth
          variant="outlined"
          error={!!errors.value3}
          helperText={errors.value3 || 'Tertiary configuration value (optional)'}
          inputProps={{ maxLength: 50 }}
          sx={{ 
            '& .MuiInputBase-input': { 
              fontFamily: 'monospace'
            }
          }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          label="Description"
          value={detail.paramdesc || ''}
          onChange={(e) => onChange({ ...detail, paramdesc: e.target.value })}
          disabled={isReadOnly}
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          error={!!errors.paramdesc}
          helperText={errors.paramdesc || 'Detailed description of this parameter detail and its purpose'}
          inputProps={{ maxLength: 1000 }}
        />
      </Grid>
      
      {detail.createdby && (
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ backgroundColor: 'grey.50' }}>
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Audit Information
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={`Created: ${detail.createdby}`} 
                  size="small" 
                  icon={<InfoIcon />}
                  variant="outlined"
                />
                {detail.createddate && (
                  <Chip 
                    label={`Date: ${new Date(detail.createddate).toLocaleString()}`} 
                    size="small" 
                    variant="outlined"
                  />
                )}
                {detail.updatedby && (
                  <Chip 
                    label={`Updated: ${detail.updatedby}`} 
                    size="small" 
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

// =====================================================
// DETAILS LIST COMPONENT
// =====================================================

const DetailsList: React.FC<{
  details: ApplicationParameterDetail[];
  onEdit: (detail: ApplicationParameterDetail) => void;
  onDelete: (detailId: number) => void;
  onView: (detail: ApplicationParameterDetail) => void;
}> = ({ details, onEdit, onDelete, onView }) => {
  
  if (details.length === 0) {
    return (
      <Box 
        sx={{ 
          textAlign: 'center', 
          py: 4,
          border: '2px dashed',
          borderColor: 'grey.300',
          borderRadius: 2,
          backgroundColor: 'grey.50'
        }}
      >
        <SettingsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Details Configured
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This parameter has no detail configurations yet.
          <br />
          Click "Add Detail" to create the first configuration.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.light' }}>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Seq</TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Value 1</TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Value 2</TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Value 3</TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Description</TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {details
            .sort((a, b) => a.param_seq - b.param_seq)
            .map((detail) => (
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
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'monospace', 
                      fontWeight: 'bold',
                      maxWidth: 120,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={detail.value1}
                  >
                    {detail.value1 || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'monospace',
                      maxWidth: 120,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={detail.value2}
                  >
                    {detail.value2 || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'monospace',
                      maxWidth: 100,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={detail.value3}
                  >
                    {detail.value3 || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={detail.paramdesc}
                  >
                    {detail.paramdesc ? 
                      (detail.paramdesc.length > 50 ? 
                        `${detail.paramdesc.substring(0, 50)}...` : 
                        detail.paramdesc
                      ) : '-'
                    }
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="View Detail">
                      <IconButton 
                        size="small" 
                        color="info"
                        onClick={() => onView(detail)}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Detail">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => onEdit(detail)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Detail">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete detail sequence ${detail.param_seq}?`)) {
                            onDelete(detail.pkid!);
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// =====================================================
// MAIN MODAL COMPONENT
// =====================================================

export const ApplicationParameterDetailModal: React.FC<ApplicationParameterDetailModalProps> = ({
  open,
  onClose,
  header,
  mode: initialMode,
  selectedDetail,
  onSave,
  onDelete
}) => {
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>(initialMode);
  const [details, setDetails] = useState<ApplicationParameterDetail[]>([]);
  const [currentDetail, setCurrentDetail] = useState<Partial<ApplicationParameterDetail>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showDetailForm, setShowDetailForm] = useState(false);
  const [detailFormMode, setDetailFormMode] = useState<'create' | 'edit' | 'view'>('view');
  
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();

  // =====================================================
  // EFFECTS
  // =====================================================

  useEffect(() => {
    if (open && header.pkid) {
      loadDetails();
    }
  }, [open, header.pkid]);

  useEffect(() => {
    if (selectedDetail) {
      setCurrentDetail(selectedDetail);
      setDetailFormMode('edit');
      setShowDetailForm(true);
    } else {
      setCurrentDetail({});
      setShowDetailForm(false);
    }
  }, [selectedDetail]);

  // =====================================================
  // DATA OPERATIONS
  // =====================================================

  const loadDetails = async () => {
    setLoading(true);
    try {
      console.log(`🔍 [APPL-005] Loading details for header ${header.param_code}`);
      
      const response = await dataProvider.getList('application/headers', {
        target: `application/headers/${header.pkid}/details`,
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'param_seq', order: 'ASC' },
        filter: {}
      });
      
      if (response.data) {
        setDetails(response.data);
        console.log(`✅ [APPL-005] Loaded ${response.data.length} details`);
      }
      
    } catch (error) {
      console.error('❌ [APPL-005] Failed to load details:', error);
      notify('Failed to load parameter details', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const validateDetail = (detail: Partial<ApplicationParameterDetail>): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    if (!detail.param_seq || detail.param_seq < 1) {
      newErrors.param_seq = 'Sequence number is required and must be positive';
    }
    
    if (!detail.value1 || detail.value1.trim().length === 0) {
      newErrors.value1 = 'Value 1 is required';
    } else if (detail.value1.length > 100) {
      newErrors.value1 = 'Value 1 must be 100 characters or less';
    }
    
    if (detail.value2 && detail.value2.length > 100) {
      newErrors.value2 = 'Value 2 must be 100 characters or less';
    }
    
    if (detail.value3 && detail.value3.length > 50) {
      newErrors.value3 = 'Value 3 must be 50 characters or less';
    }
    
    if (detail.paramdesc && detail.paramdesc.length > 1000) {
      newErrors.paramdesc = 'Description must be 1000 characters or less';
    }
    
    // Check for duplicate sequence number
    const existingSeq = details.find(d => 
      d.param_seq === detail.param_seq && 
      d.pkid !== detail.pkid
    );
    if (existingSeq) {
      newErrors.param_seq = 'Sequence number already exists';
    }
    
    return newErrors;
  };

  const saveDetail = async () => {
    const validationErrors = validateDetail(currentDetail);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      notify('Please fix validation errors', { type: 'error' });
      return;
    }

    setLoading(true);
    try {
      if (detailFormMode === 'create') {
        console.log('➕ [APPL-005] Creating new detail');
        
        const response = await dataProvider.create(`application/headers/${header.pkid}/details`, {
          data: {
            param_seq: currentDetail.param_seq!,
            value1: currentDetail.value1!,
            value2: currentDetail.value2 || '',
            value3: currentDetail.value3 || '',
            paramdesc: currentDetail.paramdesc || ''
          }
        });
        
        console.log('✅ [APPL-005] Detail created successfully');
        notify('Detail created successfully', { type: 'success' });
        
      } else if (detailFormMode === 'edit') {
        console.log('📝 [APPL-005] Updating detail');
        
        await dataProvider.update('application/details', {
          id: currentDetail.pkid!,
          data: {
            param_seq: currentDetail.param_seq!,
            value1: currentDetail.value1!,
            value2: currentDetail.value2 || '',
            value3: currentDetail.value3 || '',
            paramdesc: currentDetail.paramdesc || ''
          },
          previousData: currentDetail
        });
        
        console.log('✅ [APPL-005] Detail updated successfully');
        notify('Detail updated successfully', { type: 'success' });
      }
      
      // Refresh details list
      await loadDetails();
      
      // Close detail form
      setShowDetailForm(false);
      setCurrentDetail({});
      setErrors({});
      
      if (onSave) {
        onSave(currentDetail as ApplicationParameterDetail);
      }
      
    } catch (error) {
      console.error('❌ [APPL-005] Failed to save detail:', error);
      notify('Failed to save detail', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const deleteDetail = async (detailId: number) => {
    setLoading(true);
    try {
      console.log(`🗑️ [APPL-005] Deleting detail ${detailId}`);
      
      await dataProvider.delete('application/details', {
        id: detailId,
        previousData: details.find(d => d.pkid === detailId)
      });
      
      console.log('✅ [APPL-005] Detail deleted successfully');
      notify('Detail deleted successfully', { type: 'success' });
      
      // Refresh details list
      await loadDetails();
      
      if (onDelete) {
        onDelete(detailId);
      }
      
    } catch (error) {
      console.error('❌ [APPL-005] Failed to delete detail:', error);
      notify('Failed to delete detail', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  const handleCreateDetail = () => {
    const nextSeq = details.length > 0 ? Math.max(...details.map(d => d.param_seq)) + 1 : 1;
    setCurrentDetail({
      param_code: header.param_code,
      param_seq: nextSeq,
      value1: '',
      value2: '',
      value3: '',
      paramdesc: ''
    });
    setDetailFormMode('create');
    setShowDetailForm(true);
    setErrors({});
  };

  const handleEditDetail = (detail: ApplicationParameterDetail) => {
    setCurrentDetail(detail);
    setDetailFormMode('edit');
    setShowDetailForm(true);
    setErrors({});
  };

  const handleViewDetail = (detail: ApplicationParameterDetail) => {
    setCurrentDetail(detail);
    setDetailFormMode('view');
    setShowDetailForm(true);
    setErrors({});
  };

  const handleCancelDetailForm = () => {
    setShowDetailForm(false);
    setCurrentDetail({});
    setErrors({});
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh', maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: 'primary.light',
        color: 'primary.contrastText'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingsIcon />
          <Box>
            <Typography variant="h6">
              Application Parameter Details
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
              {header.param_code} - {header.param_name}
            </Typography>
          </Box>
        </Box>
        <IconButton edge="end" color="inherit" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Header Information */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardHeader 
            title="Parameter Information"
            avatar={<InfoIcon color="primary" />}
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" color="text.secondary">Parameter Code</Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {header.param_code}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" color="text.secondary">Parameter Name</Typography>
                <Typography variant="body1">{header.param_name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Usage Description</Typography>
                <Typography variant="body1">{header.param_usage}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Details Section */}
        <Card variant="outlined">
          <CardHeader 
            title={
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6">Parameter Details</Typography>
                  <Chip 
                    label={`${details.length} details`} 
                    size="small" 
                    color="primary" 
                  />
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateDetail}
                  disabled={loading}
                  size="small"
                >
                  Add Detail
                </Button>
              </Box>
            }
          />
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <DetailsList
                details={details}
                onEdit={handleEditDetail}
                onDelete={deleteDetail}
                onView={handleViewDetail}
              />
            )}
          </CardContent>
        </Card>

        {/* Detail Form */}
        {showDetailForm && (
          <Card variant="outlined" sx={{ mt: 3 }}>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {detailFormMode === 'create' && <AddIcon color="primary" />}
                  {detailFormMode === 'edit' && <EditIcon color="primary" />}
                  {detailFormMode === 'view' && <ViewIcon color="primary" />}
                  <Typography variant="h6">
                    {detailFormMode === 'create' && 'Create New Detail'}
                    {detailFormMode === 'edit' && 'Edit Detail'}
                    {detailFormMode === 'view' && 'View Detail'}
                  </Typography>
                </Box>
              }
            />
            <CardContent>
              <DetailForm
                detail={currentDetail}
                onChange={setCurrentDetail}
                errors={errors}
                mode={detailFormMode}
                paramCode={header.param_code}
              />
              
              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelDetailForm}
                  disabled={loading}
                >
                  Cancel
                </Button>
                {detailFormMode !== 'view' && (
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                    onClick={saveDetail}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Detail'}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: 'grey.50' }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

console.log('✅ [APPL-005] ApplicationParameterDetailModal component loaded - Master-Detail modal with full CRUD operations');

export default ApplicationParameterDetailModal;