// packages/frontend/src/app/banking/collective/bucket-parameter/page.tsx
// ============================================================================
// IFRS9 FRONTEND - BUCKET PARAMETER PAGE
// ============================================================================
// Master-detail expandable table UI following Application Setup pattern
// Database: bucket_parameters (Headers) + bucket_parameter_details (Details)
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
  Tooltip,
  CircularProgress,
  Container,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  Layers as BucketIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { bucketParameterAPI, BucketParameterHeader, BucketParameterDetail } from '../../../../services/api.bucketparameter';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';


// ============================================================================
// EXPANDABLE ROW COMPONENT
// ============================================================================

interface BucketHeaderRowProps {
  header: BucketParameterHeader;
  basisOptions: { value1: string, paramdesc: string }[];
  onEdit: (header: BucketParameterHeader) => void;
  onDelete: (header: BucketParameterHeader) => void;
  onAddDetail: (header: BucketParameterHeader) => void;
  onEditDetail: (detail: BucketParameterDetail) => void;
  onDeleteDetail: (detail: BucketParameterDetail) => void;
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
  const [details, setDetails] = useState<BucketParameterDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadDetails = async () => {
    setDetailsLoading(true);
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

  const handleToggle = () => {
    setOpen(!open);
  };

  // Load details when row expands
  React.useEffect(() => {
    if (open && details.length === 0) {
      loadDetails();
    }
  }, [open]);

  const getBasisDescription = (basisCode: string): string => {
    const basis = basisOptions.find(b => b.value1 === basisCode);
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
            {header.bucket_group_desc || header.bucket_desc || '-'}
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
          <Chip
            label={header.include_close ? 'Yes' : 'No'}
            size="small"
            color={header.include_close ? 'success' : 'default'}
            variant="outlined"
          />
        </TableCell>
        <TableCell align="center">
          <Chip
            label={header.include_wo ? 'Yes' : 'No'}
            size="small"
            color={header.include_wo ? 'warning' : 'default'}
            variant="outlined"
          />
        </TableCell>
        <TableCell align="center">
          <Chip
            label={header.active_flag ? 'Active' : 'Inactive'}
            size="small"
            color={header.active_flag ? 'success' : 'default'}
            variant="outlined"
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
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom component="div" color="primary">
                  Bucket Details
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => onAddDetail(header)}
                  variant="contained"
                  color="primary"
                >
                  Add Detail
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
                        <TableRow key={detail.id} hover>
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
                              {formatRange(detail.range_start, detail.range_end)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={detail.active_flag ? 'Active' : 'Inactive'}
                              size="small"
                              color={detail.active_flag ? 'success' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                              <Tooltip title="Edit Detail">
                                <IconButton size="small" onClick={() => onEditDetail(detail)} color="primary">
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Detail">
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
                  No bucket details found. Click "Add Detail" to create one.
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
  const [bucketHeaders, setBucketHeaders] = useState<BucketParameterHeader[]>([]);
  const [basisOptions, setBasisOptions] = useState<{ value1: string, paramdesc: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBasis, setFilterBasis] = useState('');

  // Dialog States
  const [headerDialogOpen, setHeaderDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form States
  const [selectedHeader, setSelectedHeader] = useState<BucketParameterHeader | null>(null);
  const [headerFormData, setHeaderFormData] = useState<Partial<BucketParameterHeader>>({});
  const [detailFormData, setDetailFormData] = useState<Partial<BucketParameterDetail>>({});

  // Error State
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // DATA LOADING FUNCTIONS
  // ============================================================================

  const loadBasisOptions = useCallback(async () => {
    try {
      const response = await bucketParameterAPI.getBasisOptions();
      if (response.success && response.data) {
        setBasisOptions(response.data);
      }
    } catch (error) {
      console.error('Error loading basis options:', error);
    }
  }, []);

  const loadBucketHeaders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search: searchTerm || undefined,
        basis: filterBasis || undefined
      };

      const response = await bucketParameterAPI.getHeaders(params);
      if (response.success && response.data) {
        setBucketHeaders(response.data);
      } else {
        setError('Failed to load buckets from database');
      }
    } catch (error: any) {
      console.error('Error loading bucket headers:', error);
      setError(error.message || 'Failed to connect to database');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterBasis]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSearch = () => {
    loadBucketHeaders();
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setFilterBasis('');
    loadBucketHeaders();
  };

  const handleAddHeader = () => {
    setHeaderFormData({
      bucket_group: '',
      bucket_group_desc: '',
      basis: 'D',
      include_close: false,
      include_wo: false,
      active_flag: true
    });
    setSelectedHeader(null);
    setEditMode(false);
    setHeaderDialogOpen(true);
  };

  const handleEditHeader = (header: BucketParameterHeader) => {
    setHeaderFormData({ ...header });
    setSelectedHeader(header);
    setEditMode(true);
    setHeaderDialogOpen(true);
  };

  const handleDeleteHeader = async (header: BucketParameterHeader) => {
    if (!confirm(`Delete bucket group "${header.bucket_group}"? This will delete all details.`)) {
      return;
    }

    try {
      const response = await bucketParameterAPI.deleteHeader(header.id);
      if (response.success) {
        await loadBucketHeaders();
      } else {
        alert('Failed to delete bucket parameter');
      }
    } catch (error: any) {
      alert(error.message || 'Error deleting bucket parameter');
    }
  };

  const handleAddDetail = (header: BucketParameterHeader) => {
    setDetailFormData({
      bucket_id: header.id,
      bucket_name: '',
      range_start: 0,
      range_end: undefined,
      active_flag: true
    });
    setSelectedHeader(header);
    setEditMode(false);
    setDetailDialogOpen(true);
  };

  const handleEditDetail = (detail: BucketParameterDetail) => {
    setDetailFormData({ ...detail });
    setEditMode(true);
    setDetailDialogOpen(true);
  };

  const handleDeleteDetail = async (detail: BucketParameterDetail) => {
    if (!confirm(`Delete bucket detail "${detail.bucket_name}"?`)) {
      return;
    }

    try {
      const response = await bucketParameterAPI.deleteDetail(detail.id);
      if (response.success && selectedHeader) {
        alert('Deleted successfully');
        loadBucketHeaders();
      } else {
        alert('Failed to delete detail');
      }
    } catch (error: any) {
      alert(error.message || 'Error deleting detail');
    }
  };

  const handleSaveHeader = async () => {
    try {
      const response = editMode
        ? await bucketParameterAPI.updateHeader(selectedHeader!.id, headerFormData)
        : await bucketParameterAPI.createHeader(headerFormData as any);

      if (response.success) {
        setHeaderDialogOpen(false);
        await loadBucketHeaders();
      } else {
        alert('Failed to save bucket parameter');
      }
    } catch (error: any) {
      alert(error.message || 'Error saving bucket parameter');
    }
  };

  const handleSaveDetail = async () => {
    try {
      const response = editMode
        ? await bucketParameterAPI.updateDetail(detailFormData.id!, detailFormData)
        : await bucketParameterAPI.createDetail(selectedHeader!.id, detailFormData as any);

      if (response.success) {
        setDetailDialogOpen(false);
        window.location.reload();
      } else {
        alert('Failed to save bucket detail');
      }
    } catch (error: any) {
      alert(error.message || 'Error saving bucket detail');
    }
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    loadBasisOptions();
    loadBucketHeaders();
  }, [loadBasisOptions, loadBucketHeaders]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Container maxWidth="xl" sx={{ position: 'relative' }}>
      <FullstackIndicator />
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
                  Configure IFRS9 bucket parameters for DPD aging and credit rating
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
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      <Card>
        <CardContent>
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
                    <TableCell align="center"><strong>Include Closed</strong></TableCell>
                    <TableCell align="center"><strong>Include WO</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bucketHeaders.map((header) => (
                    <BucketHeaderRow
                      key={header.id}
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
              No bucket parameters found. Click "Add Bucket Group" to create one.
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
                  label="Description"
                  value={headerFormData.bucket_group_desc || ''}
                  onChange={(e) => setHeaderFormData(prev => ({ ...prev, bucket_group_desc: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={headerFormData.include_close || false}
                      onChange={(e) => setHeaderFormData(prev => ({ ...prev, include_close: e.target.checked }))}
                    />
                  }
                  label="Include Closed"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={headerFormData.include_wo || false}
                      onChange={(e) => setHeaderFormData(prev => ({ ...prev, include_wo: e.target.checked }))}
                    />
                  }
                  label="Include WO"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={headerFormData.active_flag ?? true}
                      onChange={(e) => setHeaderFormData(prev => ({ ...prev, active_flag: e.target.checked }))}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHeaderDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveHeader}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Bucket Detail' : 'Add Bucket Detail'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bucket Name"
                  value={detailFormData.bucket_name || ''}
                  onChange={(e) => setDetailFormData(prev => ({ ...prev, bucket_name: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Range Start"
                  value={detailFormData.range_start || 0}
                  onChange={(e) => setDetailFormData(prev => ({ ...prev, range_start: Number(e.target.value) }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Range End (Leave empty for infinity)"
                  value={detailFormData.range_end || ''}
                  onChange={(e) => setDetailFormData(prev => ({ ...prev, range_end: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={detailFormData.active_flag ?? true}
                      onChange={(e) => setDetailFormData(prev => ({ ...prev, active_flag: e.target.checked }))}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveDetail}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}