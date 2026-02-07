'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link,
  Menu,
  MenuItem
} from '@mui/material';
import {
  GridColDef,
  GridToolbar,
  GridRenderCellParams
} from '@mui/x-data-grid';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import {
  Add as AddIcon,
  Home as HomeIcon,
  List as ListIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon
} from '@mui/icons-material';
import { individualImpairmentAPI } from '../../../../services/api/individual-impairment.api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';

export default function ScenariosPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    scenarioName: '',
    scenarioCode: '',
    description: '',
    configuration: '{}' // JSON string for simplicity for now
  });

  // Action Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await individualImpairmentAPI.getScenarios();
      if (response.success) {
        setData(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load scenarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!formData.scenarioName || !formData.scenarioCode) return;

    try {
      setLoading(true);

      let config = {};
      try {
        config = JSON.parse(formData.configuration);
      } catch (e) {
        // ignore invalid json for now, or handle validation
      }

      await individualImpairmentAPI.createScenario({
        ...formData,
        configuration: config
      });

      setSuccess('Scenario created successfully');
      setOpenDialog(false);
      setFormData({
        scenarioName: '',
        scenarioCode: '',
        description: '',
        configuration: '{}'
      });
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create scenario');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!selectedRow) return;
    try {
      await individualImpairmentAPI.updateScenarioStatus(selectedRow.id, status);
      setSuccess(`Scenario ${status.toLowerCase()} successfully`);
      handleCloseMenu();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, row: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const columns: GridColDef[] = [
    { field: 'scenarioName', headerName: 'Scenario Name', flex: 1 },
    { field: 'scenarioCode', headerName: 'Code', width: 150 },
    { field: 'description', headerName: 'Description', flex: 1.5 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'APPROVED' ? 'success' : params.value === 'REJECTED' ? 'error' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 180,
      valueFormatter: (value: any) => {
        if (!value) return '-';
        return new Date(value).toLocaleString();
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton onClick={(e) => handleOpenMenu(e, params.row)}>
          <MoreVertIcon />
        </IconButton>
      )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <FullstackIndicator />

      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/banking/dashboard" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <ListIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Scenario Details
        </Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Scenario Details
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Scenario
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <SafeDataGrid
          rows={data}
          columns={columns}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleStatusUpdate('APPROVED')}>
          <ApproveIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} /> Approve
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('REJECTED')}>
          <RejectIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} /> Reject
        </MenuItem>
      </Menu>

      {/* Create Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Economic Scenario</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Scenario Name"
              margin="normal"
              value={formData.scenarioName}
              onChange={(e) => setFormData({ ...formData, scenarioName: e.target.value })}
              placeholder="e.g. Baseline Scenario 2026"
            />
            <TextField
              fullWidth
              label="Scenario Code"
              margin="normal"
              value={formData.scenarioCode}
              onChange={(e) => setFormData({ ...formData, scenarioCode: e.target.value })}
              placeholder="e.g. SC_BASE_2026"
            />
            <TextField
              fullWidth
              label="Description"
              margin="normal"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              fullWidth
              label="Configuration (JSON)"
              margin="normal"
              multiline
              rows={4}
              value={formData.configuration}
              onChange={(e) => setFormData({ ...formData, configuration: e.target.value })}
              helperText="Enter simple JSON configuration for parameters (e.g. {'probability': 0.5})"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={loading}>
            Create Scenario
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </Container>
  );
}
