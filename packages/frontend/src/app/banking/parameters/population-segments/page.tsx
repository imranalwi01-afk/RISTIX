'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
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
  FormControlLabel,
  Switch,
  Snackbar,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { api, handleAPIError } from '../../../../services/api';
import PageHeader from '@/components/banking/shared/PageHeader';
import EmptyState from '@/components/banking/shared/EmptyState';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import { PopulationSegment } from '@/services/api/population-segments.api';

// Form interface
interface SegmentForm {
  segmentName: string;
  description: string;
  activeFlag: boolean;
}

export default function PopulationSegmentsPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PopulationSegment[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<PopulationSegment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<SegmentForm>({
    segmentName: '',
    description: '',
    activeFlag: true
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<PopulationSegment[]>([]);

  // Columns Configuration
  const columns: GridColDef[] = [
    {
      field: 'segment_name',
      headerName: 'Segment Name',
      width: 250,
      flex: 1
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 350,
      flex: 1.5
    },
    {
      field: 'active_flag',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row as PopulationSegment)}
          key="edit"
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.row as PopulationSegment)}
          key="delete"
        />
      ]
    }
  ];

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Loading population segments...');
      const result = await api.banking.populationSegments.getAll();
      setData(result || []);
      setFilteredData(result || []);
    } catch (error: any) {
      console.error('❌ Failed to load population segments:', error);
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      setFilteredData(data.filter(item => 
        item.segment_name.toLowerCase().includes(lowerSearch) ||
        (item.description && item.description.toLowerCase().includes(lowerSearch))
      ));
    } else {
      setFilteredData(data);
    }
  }, [searchTerm, data]);

  const handleCreate = () => {
    setSelectedSegment(null);
    setFormData({
      segmentName: '',
      description: '',
      activeFlag: true
    });
    setDialogOpen(true);
  };

  const handleEdit = (segment: PopulationSegment) => {
    setSelectedSegment(segment);
    setFormData({
      segmentName: segment.segment_name,
      description: segment.description || '',
      activeFlag: segment.active_flag
    });
    setDialogOpen(true);
  };

  const handleDelete = async (segment: PopulationSegment) => {
    if (!segment.id) return;
    if (!confirm(`Are you sure you want to delete segment "${segment.segment_name}"?`)) return;

    try {
      setLoading(true);
      await api.banking.populationSegments.delete(segment.id);
      setSuccess('Segment deleted successfully');
      loadData();
    } catch (error: any) {
      console.error('❌ Failed to delete segment:', error);
      setError('Failed to delete segment');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.segmentName.trim()) {
      setError('Segment Name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        segmentName: formData.segmentName,
        description: formData.description,
        activeFlag: formData.activeFlag
      };

      if (selectedSegment && selectedSegment.id) {
        await api.banking.populationSegments.update(selectedSegment.id, payload);
        setSuccess('Segment updated successfully');
      } else {
        await api.banking.populationSegments.create(payload);
        setSuccess('Segment created successfully');
      }

      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error('❌ Failed to save segment:', error);
      const errorInfo = handleAPIError(error);
      setError(`Failed to save segment: ${errorInfo.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ position: 'relative' }}>
      <FullstackIndicator />
      <PageHeader
        title="Population Segments"
        subtitle="Manage population segment definitions"
        onRefresh={loadData}
        loading={loading}
        extraActions={(
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            disabled={loading}
          >
            Add Segment
          </Button>
        )}
      />

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <TextField
            placeholder="Search by name or description..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredData}
              columns={columns}
              getRowId={(row) => row.id || Math.random().toString()}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } }
              }}
              pageSizeOptions={[5, 10, 25]}
              disableRowSelectionOnClick
              loading={loading}
              slotProps={{
                loadingOverlay: {
                  variant: 'linear-progress',
                  noRowsVariant: 'skeleton',
                },
                noRowsOverlay: {
                  children: (
                    <EmptyState
                      title="No Segments Found"
                      description={error ? 'Failed to load data.' : 'No population segments defined.'}
                      onRetry={loadData}
                      icon={<ErrorIcon />}
                    />
                  )
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedSegment ? 'Edit Segment' : 'Create New Segment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Segment Name *"
              value={formData.segmentName}
              onChange={(e) => setFormData(prev => ({ ...prev, segmentName: e.target.value }))}
              fullWidth
              required
              autoFocus
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
            />
            <FormControlLabel
              control={<Switch checked={formData.activeFlag} onChange={(e) => setFormData(prev => ({ ...prev, activeFlag: e.target.checked }))} />}
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {selectedSegment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Container>
  );
}
