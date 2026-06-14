// packages/frontend/src/app/banking/ifrs9/scenarios/page.tsx
// ============================================================================
// IFRS9 SCENARIOS PAGE - REAL IMPLEMENTATION
// ============================================================================

'use client';

import { useColumnFiltersFromUrl } from '@/hooks/useColumnFiltersFromUrl';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Chip,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Science as PageIcon,
  Home as HomeIcon,
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon
} from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';

import { individualImpairmentAPI } from '../../../../services/api/individual-impairment.api';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scenarios-tabpanel-${index}`}
      aria-labelledby={`scenarios-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function IFRS9ScenariosPage() {
  const columnFilters = useColumnFiltersFromUrl();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  // Table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Load scenarios data
  const loadScenariosData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = statusFilter ? { status: statusFilter } : undefined;
      const response = await individualImpairmentAPI.getScenarios(params);
      // individualImpairmentAPI returns data directly via apiClient
      const items = Array.isArray(response) ? response : (response?.data ?? []);
      setScenarios(items);
    } catch (err: any) {
      console.error('Failed to load scenarios data:', err);
      setError(err.message || 'Failed to load scenarios data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScenariosData();
  }, [statusFilter]);

  // CRUD Handler Functions
  const handleCreate = () => {
    setEditingScenario(null);
    setCreateDialogOpen(true);
  };

  const handleEdit = (scenario: any) => {
    setEditingScenario(scenario);
    setCreateDialogOpen(true);
  };

  const handleView = (scenario: any) => {
    setSelectedScenario(scenario);
    setDialogOpen(true);
  };

  const handleStatusUpdate = async (scenario: any, newStatus: string) => {
    try {
      await individualImpairmentAPI.updateScenarioStatus(scenario.pkid, newStatus);
      await loadScenariosData();
      alert(`Scenario status updated to ${newStatus}`);
    } catch (error: any) {
      alert('Error updating scenario status: ' + error.message);
    }
  };

  const handleSave = async (data: any) => {
    try {
      await individualImpairmentAPI.createScenario(data);
      await loadScenariosData();
      setCreateDialogOpen(false);
      setEditingScenario(null);
      alert('Scenario saved successfully');
    } catch (error: any) {
      alert('Error saving scenario: ' + error.message);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setStatusFilter(newValue === 0 ? '' : newValue === 1 ? 'DRAFT' : newValue === 2 ? 'PENDING' : 'APPROVED');
    setPage(0);
  };

  // Pagination
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return scenarios.slice(start, end);
  }, [scenarios, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return '#ff9800';
      case 'PENDING': return '#2196f3';
      case 'APPROVED': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  if (loading && scenarios.length === 0) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            router.push('/dashboard');
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Dashboard
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/banking/ifrs9"
          onClick={(e) => {
            e.preventDefault();
            router.push('/banking/ifrs9');
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          IFRS 9
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <PageIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Scenarios
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PageIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              IFRS 9 Scenarios
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadScenariosData}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled={loading}
              onClick={handleCreate}
            >
              New Scenario
            </Button>
          </Box>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Economic scenario analysis and stress testing management
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs for Status Filter */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="Scenario status tabs"
        >
          <Tab label="All Scenarios" />
          <Tab label="Draft" />
          <Tab label="Pending" />
          <Tab label="Approved" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <ScenariosTable
          scenarios={paginatedData}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onStatusUpdate={handleStatusUpdate}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          totalRows={scenarios.length}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <ScenariosTable
          scenarios={paginatedData}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onStatusUpdate={handleStatusUpdate}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          totalRows={scenarios.length}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <ScenariosTable
          scenarios={paginatedData}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onStatusUpdate={handleStatusUpdate}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          totalRows={scenarios.length}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <ScenariosTable
          scenarios={paginatedData}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onStatusUpdate={handleStatusUpdate}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          totalRows={scenarios.length}
        />
      </TabPanel>

      {/* View Scenario Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Scenario Details</DialogTitle>
        <DialogContent>
          {selectedScenario && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Scenario Code"
                  value={selectedScenario.scenarioCode}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Status"
                  value={getStatusLabel(selectedScenario.status)}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Created Date"
                  value={new Date(selectedScenario.createdDate).toLocaleDateString()}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Created By"
                  value={selectedScenario.createdBy}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  value={selectedScenario.description}
                  multiline
                  rows={4}
                  disabled
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Scenario Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingScenario ? 'Edit Scenario' : 'Create New Scenario'}</DialogTitle>
        <DialogContent>
          <form id="scenario-form" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());
            handleSave(data);
          }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Scenario Code"
                  name="scenarioCode"
                  defaultValue={editingScenario?.scenarioCode || ''}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Scenario Name"
                  name="scenarioName"
                  defaultValue={editingScenario?.scenarioName || ''}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={4}
                  defaultValue={editingScenario?.description || ''}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            type="submit"
            form="scenario-form"
          >
            {editingScenario ? 'Update Scenario' : 'Create Scenario'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

// Scenarios Table Component
function ScenariosTable({
  scenarios,
  loading,
  onView,
  onEdit,
  onStatusUpdate,
  getStatusColor,
  getStatusLabel,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  totalRows
}: {
  scenarios: any[];
  loading: boolean;
  onView: (scenario: any) => void;
  onEdit: (scenario: any) => void;
  onStatusUpdate: (scenario: any, status: string) => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  page: number;
  rowsPerPage: number;
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  totalRows: number;
}) {
  const columns = useMemo<GridColDef[]>(() => [
    {
      field: 'scenarioCode',
      headerName: 'Scenario Code',
      minWidth: 170,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'scenarioName',
      headerName: 'Scenario Name',
      minWidth: 220,
      flex: 1.4,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value)}
          size="small"
          sx={{
            backgroundColor: getStatusColor(params.value),
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      ),
    },
    {
      field: 'activeFlag',
      headerName: 'Active',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          color={params.value ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'createdDate',
      headerName: 'Created Date',
      width: 150,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : '-',
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      minWidth: 150,
      flex: 0.8,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 160,
      filterable: false,
      sortable: false,
      getActions: (params) => [
        <SafeGridActionsCellItem
          key="view"
          label="View Details"
          icon={<ViewIcon fontSize="small" />}
          onClick={() => onView(params.row)}
        />,
        <SafeGridActionsCellItem
          key="edit"
          label="Edit Scenario"
          icon={<EditIcon fontSize="small" />}
          onClick={() => onEdit(params.row)}
        />,
        ...(params.row.status === 'PENDING' ? [
          <SafeGridActionsCellItem
            key="approve"
            label="Approve"
            icon={<ApproveIcon fontSize="small" color="success" />}
            onClick={() => onStatusUpdate(params.row, 'APPROVED')}
          />,
          <SafeGridActionsCellItem
            key="reject"
            label="Reject"
            icon={<RejectIcon fontSize="small" color="error" />}
            onClick={() => onStatusUpdate(params.row, 'DRAFT')}
          />,
        ] : []),
      ],
    },
  ], [getStatusColor, getStatusLabel, onEdit, onStatusUpdate, onView]);

  return (
    <SafeDataGrid
      rows={scenarios}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.pkid || row.scenarioCode}
      rowCount={totalRows}
      paginationMode="offset"
      paginationModel={{ page, pageSize: rowsPerPage }}
      onPaginationModelChange={(model) => {
        if (model.page !== page) handleChangePage(null, model.page);
        if (model.pageSize !== rowsPerPage) {
          handleChangeRowsPerPage({ target: { value: String(model.pageSize) } } as React.ChangeEvent<HTMLInputElement>);
        }
      }}
      pageSizeOptions={[10, 25, 50, 100]}
      disableRowSelectionOnClick
      tableStateKey="ifrs9-scenarios-table"
      fillAvailableHeight
      maxTableHeight="none"
    />
  );
}
