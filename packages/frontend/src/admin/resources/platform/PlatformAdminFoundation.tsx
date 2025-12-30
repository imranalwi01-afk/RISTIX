// packages/frontend/src/admin/resources/platform/PlatformAdminFoundation.tsx
import React, { useState, useEffect } from 'react';
import {
  Admin,
  Resource,
  ListGuesser,
  EditGuesser,
  ShowGuesser,
  useDataProvider,
  useAuthProvider,
  useNotify,
  Loading,
  Error,
  Dashboard
} from 'react-admin';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress
} from '@mui/material';
import { getAuthToken } from '@/utils/auth-token';
import {
  Dashboard as DashboardIcon,
  People,
  Business,
  Assignment,
  Settings,
  Security,
  Analytics,
  Add,
  Edit,
  Delete,
  Visibility,
  PersonAdd,
  AssignmentInd
} from '@mui/icons-material';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  stakeholder_type: 'platform_admin' | 'bank_admin' | 'bank_user' | 'consultant' | 'regulator';
  tenant_id?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  consultant_specialization?: string;
  banking_institution?: string;
}

interface BankingInstitution {
  id: string;
  institution_name: string;
  institution_code: string;
  banking_type: 'conventional' | 'syariah' | 'dual';
  license_type: string;
  country: string;
  is_active: boolean;
  tenant_database: string;
  created_at: string;
}

interface ConsultantProject {
  id: string;
  project_name: string;
  banking_institution_id: string;
  consultant_user_id: string;
  project_type: 'implementation' | 'validation' | 'audit' | 'training';
  status: 'planning' | 'active' | 'review' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  description: string;
  budget_allocated?: number;
}

interface SystemMetrics {
  total_users: number;
  active_banking_institutions: number;
  active_consultant_projects: number;
  system_uptime: string;
  total_tenants: number;
  platform_version: string;
}

// =============================================================================
// PLATFORM DATA PROVIDER
// =============================================================================

const platformDataProvider = {
  // Get platform users with cross-tenant access
  async getUsers(): Promise<User[]> {
    const response = await fetch('/api/platform/admin/users', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  // Get banking institutions
  async getBankingInstitutions(): Promise<BankingInstitution[]> {
    const response = await fetch('/api/platform/admin/banking-institutions', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch banking institutions');
    return response.json();
  },

  // Get consultant projects
  async getConsultantProjects(): Promise<ConsultantProject[]> {
    const response = await fetch('/api/platform/admin/consultant-projects', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch consultant projects');
    return response.json();
  },

  // Get system metrics
  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await fetch('/api/platform/admin/metrics', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch system metrics');
    return response.json();
  },

  // Create new user
  async createUser(userData: Partial<User>): Promise<User> {
    const response = await fetch('/api/platform/admin/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  // Create consultant project
  async createConsultantProject(projectData: Partial<ConsultantProject>): Promise<ConsultantProject> {
    const response = await fetch('/api/platform/admin/consultant-projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(projectData)
    });
    if (!response.ok) throw new Error('Failed to create consultant project');
    return response.json();
  }
};

// =============================================================================
// PLATFORM ADMIN DASHBOARD
// =============================================================================

const PlatformAdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [institutions, setInstitutions] = useState<BankingInstitution[]>([]);
  const [projects, setProjects] = useState<ConsultantProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notify = useNotify();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [metricsData, usersData, institutionsData, projectsData] = await Promise.all([
          platformDataProvider.getSystemMetrics(),
          platformDataProvider.getUsers(),
          platformDataProvider.getBankingInstitutions(),
          platformDataProvider.getConsultantProjects()
        ]);

        setMetrics(metricsData);
        setUsers(usersData);
        setInstitutions(institutionsData);
        setProjects(projectsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        notify('Failed to load dashboard data', { type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [notify]);

  if (loading) return <Loading />;
  if (error) return <Error error={error} />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Platform Admin Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Cross-tenant IFRS 9 platform management and consultant coordination
      </Typography>

      {/* System Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{metrics?.total_users || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Business color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{metrics?.active_banking_institutions || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Banking Institutions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assignment color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{metrics?.active_consultant_projects || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Projects
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Analytics color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{metrics?.total_tenants || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tenants
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Security color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{metrics?.system_uptime || 'N/A'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uptime
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Settings color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{metrics?.platform_version || 'v1.0'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Version
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Management Sections */}
      <Grid container spacing={3}>
        {/* User Management */}
        <Grid item xs={12} lg={6}>
          <UserManagementCard users={users} onUserUpdate={setUsers} />
        </Grid>

        {/* Consultant Project Management */}
        <Grid item xs={12} lg={6}>
          <ConsultantProjectCard projects={projects} institutions={institutions} />
        </Grid>

        {/* Banking Institution Overview */}
        <Grid item xs={12}>
          <BankingInstitutionCard institutions={institutions} />
        </Grid>
      </Grid>
    </Box>
  );
};

// =============================================================================
// USER MANAGEMENT CARD
// =============================================================================

interface UserManagementCardProps {
  users: User[];
  onUserUpdate: (users: User[]) => void;
}

const UserManagementCard: React.FC<UserManagementCardProps> = ({ users, onUserUpdate }) => {
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({});
  const notify = useNotify();

  const handleCreateUser = async () => {
    try {
      const createdUser = await platformDataProvider.createUser(newUser);
      onUserUpdate([...users, createdUser]);
      setCreateUserOpen(false);
      setNewUser({});
      notify('User created successfully', { type: 'success' });
    } catch (err) {
      notify('Failed to create user', { type: 'error' });
    }
  };

  const getStakeholderChipColor = (type: string) => {
    const colors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
      platform_admin: 'primary',
      bank_admin: 'secondary',
      bank_user: 'info',
      consultant: 'warning',
      regulator: 'error'
    };
    return colors[type] || 'default';
  };

  return (
    <Card>
      <CardHeader
        title="User Management"
        action={
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setCreateUserOpen(true)}
          >
            Add User
          </Button>
        }
      />
      <CardContent>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.slice(0, 5).map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {user.first_name} {user.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={user.stakeholder_type.replace('_', ' ')}
                      color={getStakeholderChipColor(user.stakeholder_type)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={user.is_active ? 'Active' : 'Inactive'}
                      color={user.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {users.length > 5 && (
          <Button fullWidth sx={{ mt: 2 }}>
            View All Users ({users.length})
          </Button>
        )}
      </CardContent>

      {/* Create User Dialog */}
      <Dialog open={createUserOpen} onClose={() => setCreateUserOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                value={newUser.first_name || ''}
                onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={newUser.last_name || ''}
                onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newUser.email || ''}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Stakeholder Type</InputLabel>
                <Select
                  value={newUser.stakeholder_type || ''}
                  onChange={(e) => setNewUser({ ...newUser, stakeholder_type: e.target.value as any })}
                >
                  <MenuItem value="platform_admin">Platform Admin</MenuItem>
                  <MenuItem value="bank_admin">Bank Admin</MenuItem>
                  <MenuItem value="bank_user">Bank User</MenuItem>
                  <MenuItem value="consultant">Consultant</MenuItem>
                  <MenuItem value="regulator">Regulator</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {newUser.stakeholder_type === 'consultant' && (
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Specialization"
                  value={newUser.consultant_specialization || ''}
                  onChange={(e) => setNewUser({ ...newUser, consultant_specialization: e.target.value })}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateUserOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">
            Create User
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

// =============================================================================
// CONSULTANT PROJECT CARD
// =============================================================================

interface ConsultantProjectCardProps {
  projects: ConsultantProject[];
  institutions: BankingInstitution[];
}

const ConsultantProjectCard: React.FC<ConsultantProjectCardProps> = ({ projects, institutions }) => {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [newProject, setNewProject] = useState<Partial<ConsultantProject>>({});
  const notify = useNotify();

  const handleCreateProject = async () => {
    try {
      await platformDataProvider.createConsultantProject(newProject);
      setCreateProjectOpen(false);
      setNewProject({});
      notify('Consultant project created successfully', { type: 'success' });
    } catch (err) {
      notify('Failed to create project', { type: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
      planning: 'secondary',
      active: 'primary',
      review: 'warning',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  return (
    <Card>
      <CardHeader
        title="Consultant Projects"
        action={
          <Button
            variant="contained"
            startIcon={<AssignmentInd />}
            onClick={() => setCreateProjectOpen(true)}
          >
            New Project
          </Button>
        }
      />
      <CardContent>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Institution</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.slice(0, 5).map((project) => {
                const institution = institutions.find(i => i.id === project.banking_institution_id);
                return (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Typography variant="body2">{project.project_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{institution?.institution_name || 'Unknown'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={project.project_type}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={project.status}
                        color={getStatusColor(project.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {projects.length > 5 && (
          <Button fullWidth sx={{ mt: 2 }}>
            View All Projects ({projects.length})
          </Button>
        )}
      </CardContent>

      {/* Create Project Dialog */}
      <Dialog open={createProjectOpen} onClose={() => setCreateProjectOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Consultant Project</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                value={newProject.project_name || ''}
                onChange={(e) => setNewProject({ ...newProject, project_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Banking Institution</InputLabel>
                <Select
                  value={newProject.banking_institution_id || ''}
                  onChange={(e) => setNewProject({ ...newProject, banking_institution_id: e.target.value })}
                >
                  {institutions.map((institution) => (
                    <MenuItem key={institution.id} value={institution.id}>
                      {institution.institution_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Project Type</InputLabel>
                <Select
                  value={newProject.project_type || ''}
                  onChange={(e) => setNewProject({ ...newProject, project_type: e.target.value as any })}
                >
                  <MenuItem value="implementation">Implementation</MenuItem>
                  <MenuItem value="validation">Validation</MenuItem>
                  <MenuItem value="audit">Audit</MenuItem>
                  <MenuItem value="training">Training</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newProject.description || ''}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateProjectOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateProject} variant="contained">
            Create Project
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

// =============================================================================
// BANKING INSTITUTION CARD
// =============================================================================

interface BankingInstitutionCardProps {
  institutions: BankingInstitution[];
}

const BankingInstitutionCard: React.FC<BankingInstitutionCardProps> = ({ institutions }) => {
  const getBankingTypeColor = (type: string) => {
    const colors: Record<string, 'primary' | 'secondary' | 'success'> = {
      conventional: 'primary',
      syariah: 'success',
      dual: 'secondary'
    };
    return colors[type] || 'default';
  };

  return (
    <Card>
      <CardHeader title="Banking Institutions" />
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Institution</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Banking Type</TableCell>
                <TableCell>License</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>Tenant DB</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {institutions.map((institution) => (
                <TableRow key={institution.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {institution.institution_name}
                    </Typography>
                  </TableCell>
                  <TableCell>{institution.institution_code}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={institution.banking_type}
                      color={getBankingTypeColor(institution.banking_type)}
                    />
                  </TableCell>
                  <TableCell>{institution.license_type}</TableCell>
                  <TableCell>{institution.country}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {institution.tenant_database}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={institution.is_active ? 'Active' : 'Inactive'}
                      color={institution.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton size="small">
                      <Settings />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

// =============================================================================
// MAIN PLATFORM ADMIN FOUNDATION COMPONENT
// =============================================================================

const PlatformAdminFoundation: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Verify platform admin authentication
    const token = getAuthToken();
    const userType = localStorage.getItem('user_stakeholder_type');

    if (!token || userType !== 'platform_admin') {
      setAuthError('Platform admin authentication required');
      return;
    }

    setInitialized(true);
  }, []);

  if (authError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {authError}
        </Alert>
      </Box>
    );
  }

  if (!initialized) {
    return <Loading />;
  }

  return (
    <Box sx={{ height: '100vh', backgroundColor: '#f5f5f5' }}>
      <PlatformAdminDashboard />
    </Box>
  );
};

export default PlatformAdminFoundation;