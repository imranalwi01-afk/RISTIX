// packages/frontend/src/app/banking/ifrs9/scenarios/page.tsx
// ============================================================================
// IFRS9 SCENARIOS PAGE - REAL IMPLEMENTATION
// ============================================================================

'use client';

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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
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
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

// Real API implementation with demo token for development
const scenariosApi = {
  getScenarios: async (status?: string) => {
    const url = status 
      ? `http://localhost:4232/api/v1/banking/individual/impairment/scenarios?status=${status}`
      : 'http://localhost:4232/api/v1/banking/individual/impairment/scenarios';
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    return await response.json();
  },
  
  createScenario: async (data: any) => {
    const response = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/scenarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  
  updateScenarioStatus: async (id: number, status: string) => {
    const response = await fetch(`http://localhost:4232/api/v1/banking/individual/impairment/scenarios/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      },
      body: JSON.stringify({ status })
    });
    return await response.json();
  }
};

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
      const response = await scenariosApi.getScenarios(statusFilter || undefined);
      
      if (response.success) {
        setScenarios(response.data || []);
      } else {
        setError('Failed to load scenarios data');
      }
    } catch (err: any) {
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
      const response = await scenariosApi.updateScenarioStatus(scenario.pkid, newStatus);
      
      if (response.status >= 200 && response.status < 300) {
        await loadScenariosData();
        alert(`Scenario status updated to ${newStatus}`);
      } else {
        alert('Failed to update scenario status');
      }
    } catch (error: any) {
      alert('Error updating scenario status: ' + error.message);
    }
  };

  const handleSave = async (data: any) => {
    try {
      const response = await scenariosApi.createScenario(data);
      
      if (response.status >= 200 && response.status < 300) {
        await loadScenariosData();
        setCreateDialogOpen(false);
        setEditingScenario(null);
        alert('Scenario saved successfully');
      } else {
        alert('Failed to save scenario');
      }
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
  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Scenario Code</TableCell>
              <TableCell>Scenario Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))
            ) : scenarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No scenarios found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              scenarios.map((scenario, index) => (
                <TableRow key={scenario.pkid} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {scenario.scenarioCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {scenario.scenarioName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(scenario.status)}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(scenario.status),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={scenario.activeFlag ? 'Active' : 'Inactive'}
                      size="small"
                      color={scenario.activeFlag ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(scenario.createdDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {scenario.createdBy}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => onView(scenario)}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Scenario">
                        <IconButton 
                          size="small"
                          onClick={() => onEdit(scenario)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {scenario.status === 'PENDING' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => onStatusUpdate(scenario, 'APPROVED')}
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => onStatusUpdate(scenario, 'DRAFT')}
                            >
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={totalRows}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
