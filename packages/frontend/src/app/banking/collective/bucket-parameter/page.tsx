// packages/frontend/src/app/banking/collective/bucket-parameter/page.tsx
// ============================================================================
// IFRS9 FRONTEND - BUCKET PARAMETER PAGE - APPLICATION SETUP UI/UX PATTERN
// ============================================================================
// Master-detail expandable table UI following Application Setup pattern
// Database: frs9_param_bucketh (Headers) + frs9_param_bucketd (Details)
// Live DB: DS2 FRS9PRO (192.168.0.106:5433) - ACTUAL DATA, NO MOCK DATA
// Business Parameters: frs9_param_commond (B0017 for BASIS options)
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  Breadcrumbs,
  Link,
  Divider,
  Checkbox,
  FormControlLabel,
  Tooltip,
  CircularProgress,
  Container
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Home as HomeIcon,
  Layers as BucketIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { api } from '../../../../services/api';

// ============================================================================
// INTERFACES - BASED ON ACTUAL DATABASE STRUCTURE
// ============================================================================

interface BucketHeader {
  pkid: number;
  bucket_group: string;
  bucket_desc: string;
  basis: string;
  bucket_default: number;
  closed_flag: boolean;
  wo_flag: boolean;
  createdby?: string;
  createddate?: string;
  createdhost?: string;
  updatedby?: string;
  updateddate?: string;
  updatedhost?: string;
  details_count?: number;
}

interface BucketDetail {
  pkid: number;
  pkid_header: number;
  bucket_id: number;
  bucket_name: string;
  range_start: number;
  range_end: number | null;
  createdby?: string;
  createddate?: string;
  createdhost?: string;
  updatedby?: string;
  updateddate?: string;
  updatedhost?: string;
}

interface BasisOption {
  param_seq: number;
  value1: string;
  value2?: string;
  value3?: string;
  paramdesc: string;
}

// ============================================================================
// EXPANDABLE ROW COMPONENT
// ============================================================================

interface BucketHeaderRowProps {
  header: BucketHeader;
  basisOptions: BasisOption[];
  onEdit: (header: BucketHeader) => void;
  onDelete: (header: BucketHeader) => void;
  onAddDetail: (header: BucketHeader) => void;
  onEditDetail: (detail: BucketDetail) => void;
  onDeleteDetail: (detail: BucketDetail) => void;
}

const BucketHeaderRow: React.FC<BucketHeaderRowProps> = ({
  header,
  basisOptions,
  onEdit,
  onDelete,
  onAddDetail,
  onEditDetail,
  onDeleteDetail
}) => {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<BucketDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadDetails = async () => {
    console.log('🔄 Loading bucket details for header:', header.pkid, header.bucket_group);
    setDetailsLoading(true);
    try {
      const response = await api.banking.bucketParameter.getDetails(header.pkid);
      console.log('📥 API response:', response);
      if (response.success) {
        console.log('✅ Setting details:', response.data?.length || 0, 'records');
        setDetails(response.data || []);
      } else {
        console.error('❌ API response not successful:', response);
        setDetails([]);
      }
    } catch (error) {
      console.error('❌ Error loading bucket details:', error);
      setDetails([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleToggle = () => {
    console.log('🔘 Toggle clicked:', { 
      currentOpen: open, 
      willBeOpen: !open, 
      headerId: header.pkid,
      headerGroup: header.bucket_group 
    });
    setOpen(!open);
  };

  // Load details when row expands
  React.useEffect(() => {
    if (open && details.length === 0) {
      console.log('🔄 Row expanded, loading details via useEffect...');
      loadDetails();
    }
  }, [open]);

  const getBasisDescription = (basisCode: string): string => {
    const basis = basisOptions.find(b => b.value1 === basisCode);
    return basis?.paramdesc || basisCode;
  };

  const formatRange = (start: number, end: number | null): string => {
    if (end === null) return 'N/A';
    if (end === 9999) return `${start.toLocaleString()} - ∞`;
    return `${start.toLocaleString()} - ${end.toLocaleString()}`;
  };

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={handleToggle}>
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
            {header.bucket_desc}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip 
            label={getBasisDescription(header.basis)}
            size="small"
            color={header.basis === 'D' ? 'primary' : 'info'}
            variant="outlined"
          />
        </TableCell>
        <TableCell align="center">
          <Typography variant="body2" fontWeight="medium">
            {header.bucket_default}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Chip
            label={header.closed_flag ? 'Yes' : 'No'}
            size="small"
            color={header.closed_flag ? 'success' : 'default'}
            variant="outlined"
          />
        </TableCell>
        <TableCell align="center">
          <Chip
            label={header.wo_flag ? 'Yes' : 'No'}
            size="small"
            color={header.wo_flag ? 'warning' : 'default'}
            variant="outlined"
          />
        </TableCell>
        <TableCell align="center">
          <Chip
            label={header.details_count?.toString() || '0'}
            size="small"
            color="primary"
            variant="filled"
          />
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Edit Bucket Group">
              <IconButton size="small" onClick={() => onEdit(header)} color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Bucket Group">
              <IconButton size="small" onClick={() => onDelete(header)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>

      {/* Expandable Details Row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom component="div" color="primary">
                  Bucket Details - {header.bucket_desc}
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => onAddDetail(header)}
                  variant="contained"
                  color="primary"
                >
                  Add Bucket
                </Button>
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
                        <TableCell><strong>Bucket ID</strong></TableCell>
                        <TableCell><strong>Bucket Name</strong></TableCell>
                        <TableCell><strong>Range Start</strong></TableCell>
                        <TableCell><strong>Range End</strong></TableCell>
                        <TableCell><strong>Range Display</strong></TableCell>
                        <TableCell align="center"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {details.map((detail) => (
                        <TableRow key={detail.pkid} hover>
                          <TableCell>
                            <Chip 
                              label={detail.bucket_id} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {detail.bucket_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {detail.range_start.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {detail.range_end === null ? 'N/A' : 
                               detail.range_end === 9999 ? '∞' : 
                               detail.range_end.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="primary" fontWeight="medium">
                              {formatRange(detail.range_start, detail.range_end)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                              <Tooltip title="Edit Bucket">
                                <IconButton size="small" onClick={() => onEditDetail(detail)} color="primary">
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Bucket">
                                <IconButton size="small" onClick={() => onDeleteDetail(detail)} color="error">
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
              ) : (
                <Alert severity="info" sx={{ mt: 1 }}>
                  No bucket details found. Click "Add Bucket" to create the first bucket.
                </Alert>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BucketParameterPage() {
  const router = useRouter();
  
  // Data State
  const [bucketHeaders, setBucketHeaders] = useState<BucketHeader[]>([]);
  const [basisOptions, setBasisOptions] = useState<BasisOption[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBasis, setFilterBasis] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Dialog States
  const [headerDialogOpen, setHeaderDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Form States
  const [selectedHeader, setSelectedHeader] = useState<BucketHeader | null>(null);
  const [headerFormData, setHeaderFormData] = useState<Partial<BucketHeader>>({});
  const [detailFormData, setDetailFormData] = useState<Partial<BucketDetail>>({});
  
  // Error State
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // DATA LOADING FUNCTIONS
  // ============================================================================

  const loadBasisOptions = useCallback(async () => {
    try {
      const response = await api.banking.bucketParameter.getBasisOptions();
      if (response.success && response.data) {
        setBasisOptions(response.data);
      }
    } catch (error) {
      console.error('Error loading basis options:', error);
      // Fallback to basic options if API fails
      setBasisOptions([
        { param_seq: 1, value1: 'D', paramdesc: 'Day Past Due' },
        { param_seq: 2, value1: 'R', paramdesc: 'Rating' }
      ]);
    }
  }, []);

  const loadBucketHeaders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        search: searchTerm || undefined,
        basis: filterBasis || undefined
      };

      const response = await api.banking.bucketParameter.getHeaders(params);
      if (response.success && response.data) {
        setBucketHeaders(response.data);
      } else {
        setError('Failed to load bucket parameters from database');
        setBucketHeaders([]);
      }
    } catch (error: any) {
      console.error('Error loading bucket headers:', error);
      setError(error.response?.data?.error || 'Failed to connect to database');
      setBucketHeaders([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, filterBasis]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSearch = () => {
    setPage(1); // Reset to first page
    loadBucketHeaders();
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setFilterBasis('');
    setPage(1);
    loadBucketHeaders();
  };

  const handleAddHeader = () => {
    setHeaderFormData({
      bucket_group: '',
      bucket_desc: '',
      basis: '',
      bucket_default: 1,
      closed_flag: false,
      wo_flag: false
    });
    setSelectedHeader(null);
    setEditMode(false);
    setHeaderDialogOpen(true);
  };

  const handleEditHeader = (header: BucketHeader) => {
    setHeaderFormData({ ...header });
    setSelectedHeader(header);
    setEditMode(true);
    setHeaderDialogOpen(true);
  };

  const handleDeleteHeader = async (header: BucketHeader) => {
    if (!confirm(`Are you sure you want to delete bucket group "${header.bucket_group}"?\nThis will also delete all associated bucket details.`)) {
      return;
    }

    try {
      const response = await api.banking.bucketParameter.deleteHeader(header.pkid);
      if (response.success) {
        await loadBucketHeaders();
      } else {
        alert('Failed to delete bucket parameter');
      }
    } catch (error: any) {
      console.error('Error deleting bucket header:', error);
      alert(error.response?.data?.error || 'Error deleting bucket parameter');
    }
  };

  const handleAddDetail = (header: BucketHeader) => {
    const maxBucketId = Math.max(0, ...(header.details_count ? [header.details_count] : [0]));
    
    setDetailFormData({
      pkid_header: header.pkid,
      bucket_id: maxBucketId + 1,
      bucket_name: '',
      range_start: 0,
      range_end: 0
    });
    setSelectedHeader(header);
    setEditMode(false);
    setDetailDialogOpen(true);
  };

  const handleEditDetail = (detail: BucketDetail) => {
    setDetailFormData({ ...detail });
    setEditMode(true);
    setDetailDialogOpen(true);
  };

  const handleDeleteDetail = async (detail: BucketDetail) => {
    if (!confirm(`Are you sure you want to delete bucket "${detail.bucket_name}"?`)) {
      return;
    }

    try {
      const response = await api.banking.bucketParameter.deleteDetail(detail.pkid);
      if (response.success) {
        await loadBucketHeaders();
      } else {
        alert('Failed to delete bucket detail');
      }
    } catch (error: any) {
      console.error('Error deleting bucket detail:', error);
      alert(error.response?.data?.error || 'Error deleting bucket detail');
    }
  };

  const handleSaveHeader = async () => {
    try {
      const response = editMode 
        ? await api.banking.bucketParameter.updateHeader(selectedHeader!.pkid, headerFormData)
        : await api.banking.bucketParameter.createHeader(headerFormData as any);

      if (response.success) {
        setHeaderDialogOpen(false);
        await loadBucketHeaders();
      } else {
        alert('Failed to save bucket parameter');
      }
    } catch (error: any) {
      console.error('Error saving bucket header:', error);
      alert(error.response?.data?.error || 'Error saving bucket parameter');
    }
  };

  const handleSaveDetail = async () => {
    try {
      const response = editMode
        ? await api.banking.bucketParameter.updateDetail(detailFormData.pkid!, detailFormData)
        : await api.banking.bucketParameter.createDetail(
            detailFormData.pkid_header!,
            detailFormData as any
          );

      if (response.success) {
        setDetailDialogOpen(false);
        await loadBucketHeaders();
      } else {
        alert('Failed to save bucket detail');
      }
    } catch (error: any) {
      console.error('Error saving bucket detail:', error);
      alert(error.response?.data?.error || 'Error saving bucket detail');
    }
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    loadBasisOptions();
  }, [loadBasisOptions]);

  useEffect(() => {
    loadBucketHeaders();
  }, [loadBucketHeaders]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Container maxWidth="xl">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link 
          underline="hover" 
          color="inherit" 
          href="/banking/dashboard"
          onClick={(e) => {
            e.preventDefault();
            router.push('/banking/dashboard');
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <BucketIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Bucket Parameter
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BucketIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Bucket Parameter
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Configure IFRS9 bucket parameters for DPD aging and credit rating classification
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddHeader}
                size="large"
              >
                Add Bucket Group
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                size="large"
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Search and Filter Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Search bucket groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{ minWidth: 300, flexGrow: 1 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Basis</InputLabel>
              <Select
                value={filterBasis}
                label="Filter by Basis"
                onChange={(e) => setFilterBasis(e.target.value)}
              >
                <MenuItem value="">All Basis</MenuItem>
                {basisOptions.map((option) => (
                  <MenuItem key={option.value1} value={option.value1}>
                    {option.paramdesc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{ px: 3 }}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleRefresh}
            >
              Clear
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <strong>Database Error:</strong> {error}
        </Alert>
      )}

      {/* Main Data Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="primary">
              Bucket Parameter Groups ({bucketHeaders.length})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Live data from DS2 FRS9PRO database
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : bucketHeaders.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ width: 50 }}></TableCell>
                    <TableCell><strong>Bucket Group</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell><strong>Basis</strong></TableCell>
                    <TableCell align="center"><strong>Default</strong></TableCell>
                    <TableCell align="center"><strong>Include Closed</strong></TableCell>
                    <TableCell align="center"><strong>Include WO</strong></TableCell>
                    <TableCell align="center"><strong>Buckets</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bucketHeaders.map((header) => (
                    <BucketHeaderRow
                      key={header.pkid}
                      header={header}
                      basisOptions={basisOptions}
                      onEdit={handleEditHeader}
                      onDelete={handleDeleteHeader}
                      onAddDetail={handleAddDetail}
                      onEditDetail={handleEditDetail}
                      onDeleteDetail={handleDeleteDetail}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              No bucket parameters found. Click "Add Bucket Group" to create the first bucket parameter.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Header Dialog */}
      <Dialog open={headerDialogOpen} onClose={() => setHeaderDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Bucket Parameter Group' : 'Add Bucket Parameter Group'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bucket Group ID"
                  value={headerFormData.bucket_group || ''}
                  onChange={(e) => setHeaderFormData(prev => ({ ...prev, bucket_group: e.target.value }))}
                  helperText="Unique identifier for the bucket group"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Basis</InputLabel>
                  <Select
                    value={headerFormData.basis || ''}
                    label="Basis"
                    onChange={(e) => setHeaderFormData(prev => ({ ...prev, basis: e.target.value }))}
                  >
                    {basisOptions.map((option) => (
                      <MenuItem key={option.value1} value={option.value1}>
                        {option.paramdesc}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bucket Group Description"
                  value={headerFormData.bucket_desc || ''}
                  onChange={(e) => setHeaderFormData(prev => ({ ...prev, bucket_desc: e.target.value }))}
                  multiline
                  rows={2}
                  helperText="Descriptive name for the bucket group"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Default Bucket ID"
                  value={headerFormData.bucket_default || ''}
                  onChange={(e) => setHeaderFormData(prev => ({ ...prev, bucket_default: parseInt(e.target.value) || 1 }))}
                  helperText="Default bucket ID for accounts that don't match any range"
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ pt: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={headerFormData.closed_flag || false}
                        onChange={(e) => setHeaderFormData(prev => ({ ...prev, closed_flag: e.target.checked }))}
                      />
                    }
                    label="Include Closed Accounts"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={headerFormData.wo_flag || false}
                        onChange={(e) => setHeaderFormData(prev => ({ ...prev, wo_flag: e.target.checked }))}
                      />
                    }
                    label="Include Write-off Accounts"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHeaderDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveHeader} variant="contained">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Bucket Detail' : 'Add Bucket Detail'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Bucket ID"
                  value={detailFormData.bucket_id || ''}
                  onChange={(e) => setDetailFormData(prev => ({ ...prev, bucket_id: parseInt(e.target.value) || 1 }))}
                  helperText="Sequential bucket identifier"
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bucket Name"
                  value={detailFormData.bucket_name || ''}
                  onChange={(e) => setDetailFormData(prev => ({ ...prev, bucket_name: e.target.value }))}
                  helperText="Descriptive name for this bucket"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Range Start"
                  value={detailFormData.range_start ?? ''}
                  onChange={(e) => setDetailFormData(prev => ({ ...prev, range_start: parseInt(e.target.value) || 0 }))}
                  inputProps={{ min: 0 }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Range End"
                  value={detailFormData.range_end ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDetailFormData(prev => ({ 
                      ...prev, 
                      range_end: value === '' ? null : parseInt(value) || 0 
                    }));
                  }}
                  inputProps={{ min: 0 }}
                  helperText="Use 9999 for unlimited upper bound, leave empty for N/A"
                />
              </Grid>

              {/* Range validation warning */}
              {detailFormData.range_start !== undefined && 
               detailFormData.range_end !== null && detailFormData.range_end !== undefined &&
               detailFormData.range_start > detailFormData.range_end && (
                <Grid item xs={12}>
                  <Alert severity="warning">
                    Range start cannot be greater than range end
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveDetail} variant="contained">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}