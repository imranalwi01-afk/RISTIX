// ifrs9-iaf/packages/frontend/src/components/roles/RoleAssignmentAnalytics.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Tab,
  Tabs,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton,
  Divider,
  useTheme,
  alpha,
  Avatar,
  AvatarGroup,
  Badge,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
  Treemap,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Download,
  Refresh,
  Timeline,
  Security,
  People,
  AdminPanelSettings,
  Warning,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Assessment,
  SupervisorAccount,
  Group,
  Assignment,
  Speed,
  Visibility,
  FilterList,
  Schedule,
  PriorityHigh,
  Shield,
  Lock,
  Unlock,
  Settings,
  TimelineOutlined,
  Leaderboard,
  PieChartOutlined,
  BarChartOutlined,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

// Types
interface RoleAnalytics {
  id: string;
  name: string;
  userCount: number;
  permissionCount: number;
  lastAssigned: string;
  assignmentRate: number;
  riskLevel: 'low' | 'medium' | 'high';
  bankingType: 'conventional' | 'syariah' | 'platform';
  hierarchyLevel: number;
  activeUsers: number;
  inactiveUsers: number;
}

interface UserAnalytics {
  id: string;
  name: string;
  email: string;
  roleCount: number;
  lastLogin: string;
  riskScore: number;
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  criticalRoles: number;
}

interface AssignmentTrend {
  date: string;
  assignments: number;
  removals: number;
  modifications: number;
  totalUsers: number;
}

interface SecurityMetrics {
  criticalRolesWithoutUsers: number;
  usersWithExcessiveRoles: number;
  orphanedPermissions: number;
  inactiveUsersWithRoles: number;
  highRiskAssignments: number;
  complianceScore: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

// Colors for charts
const COLORS = {
  primary: ['#1976d2', '#42a5f5', '#90caf9', '#bbdefb', '#e3f2fd'],
  success: ['#2e7d32', '#4caf50', '#66bb6a', '#81c784', '#a5d6a7'],
  warning: ['#f57c00', '#ff9800', '#ffa726', '#ffb74d', '#ffcc80'],
  error: ['#d32f2f', '#f44336', '#ef5350', '#e57373', '#ef9a9a'],
  info: ['#0288d1', '#03a9f4', '#29b6f6', '#4fc3f7', '#81d4fa'],
  syariah: ['#006b3f', '#2e7d32', '#388e3c', '#43a047', '#4caf50'],
};

const RoleAssignmentAnalytics: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();

  // State management
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Data states
  const [roleAnalytics, setRoleAnalytics] = useState<RoleAnalytics[]>([]);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics[]>([]);
  const [assignmentTrends, setAssignmentTrends] = useState<AssignmentTrend[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);

  // Fetch analytics data
  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, selectedDepartment, selectedRiskLevel, refreshTrigger]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
        department: selectedDepartment,
        riskLevel: selectedRiskLevel,
      };

      // Fetch role analytics
      const roleResponse = await api.get('/analytics/roles', { params });
      setRoleAnalytics(roleResponse.data || []);

      // Fetch user analytics
      const userResponse = await api.get('/analytics/users', { params });
      setUserAnalytics(userResponse.data || []);

      // Fetch assignment trends
      const trendsResponse = await api.get('/analytics/assignments/trends', { params });
      setAssignmentTrends(trendsResponse.data || []);

      // Fetch security metrics
      const securityResponse = await api.get('/analytics/security/metrics', { params });
      setSecurityMetrics(securityResponse.data);

      // Extract departments
      const uniqueDepartments = [...new Set(userResponse.data?.map((u: UserAnalytics) => u.department) || [])];
      setDepartments(uniqueDepartments);

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleExportData = async (type: 'roles' | 'users' | 'trends' | 'security') => {
    try {
      const params = {
        type,
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
        department: selectedDepartment,
        riskLevel: selectedRiskLevel,
      };

      const response = await api.get('/analytics/export', {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `role-analytics-${type}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Failed to export data. Please try again.');
    }
  };

  // Calculate derived metrics
  const totalRoles = roleAnalytics.length;
  const totalUsers = userAnalytics.length;
  const totalAssignments = roleAnalytics.reduce((sum, role) => sum + role.userCount, 0);
  const averageRolesPerUser = totalUsers > 0 ? totalAssignments / totalUsers : 0;
  const highRiskRoles = roleAnalytics.filter(role => role.riskLevel === 'high').length;
  const activeUsers = userAnalytics.filter(user => user.status === 'active').length;

  // Prepare chart data
  const roleDistributionData = roleAnalytics.map(role => ({
    name: role.name,
    value: role.userCount,
    riskLevel: role.riskLevel,
    bankingType: role.bankingType,
  }));

  const bankingTypeData = [
    { name: 'Conventional', value: roleAnalytics.filter(r => r.bankingType === 'conventional').length },
    { name: 'Syariah', value: roleAnalytics.filter(r => r.bankingType === 'syariah').length },
    { name: 'Platform', value: roleAnalytics.filter(r => r.bankingType === 'platform').length },
  ];

  const riskLevelData = [
    { name: 'Low Risk', value: roleAnalytics.filter(r => r.riskLevel === 'low').length, color: COLORS.success[0] },
    { name: 'Medium Risk', value: roleAnalytics.filter(r => r.riskLevel === 'medium').length, color: COLORS.warning[0] },
    { name: 'High Risk', value: roleAnalytics.filter(r => r.riskLevel === 'high').length, color: COLORS.error[0] },
  ];

  const departmentData = departments.map(dept => ({
    department: dept,
    users: userAnalytics.filter(u => u.department === dept).length,
    avgRoles: userAnalytics.filter(u => u.department === dept).reduce((sum, u) => sum + u.roleCount, 0) /
              userAnalytics.filter(u => u.department === dept).length || 0,
  }));

  const userRiskData = userAnalytics.map(user => ({
    name: user.name,
    riskScore: user.riskScore,
    roleCount: user.roleCount,
    criticalRoles: user.criticalRoles,
  }));

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
          Loading analytics data...
        </Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%', p: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Role Assignment Analytics
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => handleExportData('roles')}
            >
              Export Data
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.start}
                  onChange={(date) => date && setDateRange(prev => ({ ...prev, start: date }))}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="End Date"
                  value={dateRange.end}
                  onChange={(date) => date && setDateRange(prev => ({ ...prev, end: date }))}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={selectedDepartment}
                    label="Department"
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    <MenuItem value="all">All Departments</MenuItem>
                    {departments.map(dept => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Risk Level</InputLabel>
                  <Select
                    value={selectedRiskLevel}
                    label="Risk Level"
                    onChange={(e) => setSelectedRiskLevel(e.target.value)}
                  >
                    <MenuItem value="all">All Levels</MenuItem>
                    <MenuItem value="low">Low Risk</MenuItem>
                    <MenuItem value="medium">Medium Risk</MenuItem>
                    <MenuItem value="high">High Risk</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {totalRoles}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Roles
                    </Typography>
                  </Box>
                  <AdminPanelSettings sx={{ fontSize: 40, color: 'primary.main', opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), border: `1px solid ${alpha(theme.palette.success.main, 0.3)}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                      {totalUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
                    </Typography>
                  </Box>
                  <People sx={{ fontSize: 40, color: 'success.main', opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                      {averageRolesPerUser.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Roles/User
                    </Typography>
                  </Box>
                  <Assignment sx={{ fontSize: 40, color: 'warning.main', opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), border: `1px solid ${alpha(theme.palette.error.main, 0.3)}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                      {highRiskRoles}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      High Risk Roles
                    </Typography>
                  </Box>
                  <Warning sx={{ fontSize: 40, color: 'error.main', opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab icon={<Assessment />} label="Overview" />
              <Tab icon={<PieChartOutlined />} label="Role Analytics" />
              <Tab icon={<People />} label="User Analytics" />
              <Tab icon={<TimelineOutlined />} label="Trends" />
              <Tab icon={<Security />} label="Security" />
              <Tab icon={<BarChartOutlined />} label="Performance" />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 3 }}>
            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                {/* Role Distribution */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Role Distribution by Users</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={roleDistributionData.slice(0, 10)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {roleDistributionData.slice(0, 10).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Banking Types */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Roles by Banking Type</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={bankingTypeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill="#1976d2" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Risk Levels */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Risk Level Distribution</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={riskLevelData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {riskLevelData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Department Stats */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Department Statistics</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={departmentData.slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="department" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="users" fill="#2e7d32" name="Users" />
                          <Bar dataKey="avgRoles" fill="#f57c00" name="Avg Roles" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Role Analytics Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                {/* Role Performance Table */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Role Performance Metrics</Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Role Name</TableCell>
                              <TableCell align="right">Users</TableCell>
                              <TableCell align="right">Permissions</TableCell>
                              <TableCell align="right">Assignment Rate</TableCell>
                              <TableCell align="center">Risk Level</TableCell>
                              <TableCell align="center">Banking Type</TableCell>
                              <TableCell align="right">Hierarchy Level</TableCell>
                              <TableCell align="center">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {roleAnalytics.slice(0, 10).map((role) => (
                              <TableRow key={role.id} hover>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {role.name}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Badge badgeContent={role.userCount} color="primary" showZero>
                                    <People />
                                  </Badge>
                                </TableCell>
                                <TableCell align="right">{role.permissionCount}</TableCell>
                                <TableCell align="right">
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={role.assignmentRate}
                                      sx={{ width: 60, mr: 1 }}
                                    />
                                    <Typography variant="body2">
                                      {role.assignmentRate.toFixed(1)}%
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    size="small"
                                    label={role.riskLevel}
                                    color={role.riskLevel === 'high' ? 'error' : role.riskLevel === 'medium' ? 'warning' : 'success'}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    size="small"
                                    label={role.bankingType}
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell align="right">{role.hierarchyLevel}</TableCell>
                                <TableCell align="center">
                                  <Tooltip title="View Details">
                                    <IconButton size="small">
                                      <Visibility />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Role Usage Heatmap */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Role Usage Patterns</Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={assignmentTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Area type="monotone" dataKey="assignments" stackId="1" stroke="#1976d2" fill="#1976d2" />
                          <Area type="monotone" dataKey="removals" stackId="2" stroke="#f44336" fill="#f44336" />
                          <Area type="monotone" dataKey="modifications" stackId="3" stroke="#ff9800" fill="#ff9800" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* User Analytics Tab */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                {/* User Risk Analysis */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>User Risk Analysis</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={userRiskData.slice(0, 8)}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="name" />
                          <PolarRadiusAxis />
                          <Radar name="Risk Score" dataKey="riskScore" stroke="#f44336" fill="#f44336" fillOpacity={0.6} />
                          <Radar name="Role Count" dataKey="roleCount" stroke="#1976d2" fill="#1976d2" fillOpacity={0.6} />
                          <Radar name="Critical Roles" dataKey="criticalRoles" stroke="#ff9800" fill="#ff9800" fillOpacity={0.6} />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* User Activity */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>User Activity Distribution</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={userAnalytics.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="roleCount" fill="#1976d2" name="Roles" />
                          <Bar dataKey="criticalRoles" fill="#f44336" name="Critical" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Top Users Table */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Top Users by Role Count</Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>User</TableCell>
                              <TableCell>Department</TableCell>
                              <TableCell align="center">Status</TableCell>
                              <TableCell align="right">Roles</TableCell>
                              <TableCell align="right">Critical Roles</TableCell>
                              <TableCell align="right">Risk Score</TableCell>
                              <TableCell align="center">Last Login</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {userAnalytics
                              .sort((a, b) => b.roleCount - a.roleCount)
                              .slice(0, 10)
                              .map((user) => (
                                <TableRow key={user.id} hover>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Avatar sx={{ width: 32, height: 32 }}>
                                        {user.name.charAt(0)}
                                      </Avatar>
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                          {user.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {user.email}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </TableCell>
                                  <TableCell>{user.department}</TableCell>
                                  <TableCell align="center">
                                    <Chip
                                      size="small"
                                      label={user.status}
                                      color={user.status === 'active' ? 'success' : 'default'}
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <Badge badgeContent={user.roleCount} color="primary" showZero>
                                      <Assignment />
                                    </Badge>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Badge badgeContent={user.criticalRoles} color="error" showZero>
                                      <PriorityHigh />
                                    </Badge>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                      <LinearProgress
                                        variant="determinate"
                                        value={user.riskScore}
                                        sx={{ width: 60, mr: 1 }}
                                        color={user.riskScore > 70 ? 'error' : user.riskScore > 40 ? 'warning' : 'success'}
                                      />
                                      <Typography variant="body2">
                                        {user.riskScore}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell align="center">
                                    {user.lastLogin ? format(parseISO(user.lastLogin), 'MMM dd') : 'Never'}
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Trends Tab */}
            <TabPanel value={tabValue} index={3}>
              <Grid container spacing={3}>
                {/* Assignment Trends */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Assignment Trends Over Time</Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={assignmentTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line type="monotone" dataKey="assignments" stroke="#1976d2" strokeWidth={2} />
                          <Line type="monotone" dataKey="removals" stroke="#f44336" strokeWidth={2} />
                          <Line type="monotone" dataKey="modifications" stroke="#ff9800" strokeWidth={2} />
                          <Line type="monotone" dataKey="totalUsers" stroke="#4caf50" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Growth Metrics */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Growth Metrics</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
                            <TrendingUp sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                              +12.5%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Role Growth
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1 }}>
                            <TrendingUp sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              +8.3%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              User Growth
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 1 }}>
                            <Speed sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 600, color: 'warning.main' }}>
                              3.2
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Avg Assignment Time
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 1 }}>
                            <Warning sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.main' }}>
                              15
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Security Issues
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Activity Timeline */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity Timeline</Typography>
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        {[
                          { time: '2 hours ago', action: 'Role assigned', user: 'John Doe', type: 'success' },
                          { time: '4 hours ago', action: 'Permission modified', user: 'Jane Smith', type: 'warning' },
                          { time: '6 hours ago', action: 'Role created', user: 'Mike Johnson', type: 'info' },
                          { time: '8 hours ago', action: 'Role removed', user: 'Sarah Wilson', type: 'error' },
                          { time: '12 hours ago', action: 'User assigned', user: 'David Brown', type: 'success' },
                        ].map((activity, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box sx={{ minWidth: 40, textAlign: 'right' }}>
                              <Typography variant="caption" color="text.secondary">
                                {activity.time}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: theme.palette[activity.type as keyof typeof theme.palette].main,
                              }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2">
                                <strong>{activity.user}</strong> - {activity.action}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Security Tab */}
            <TabPanel value={tabValue} index={4}>
              <Grid container spacing={3}>
                {securityMetrics && (
                  <>
                    {/* Security Overview */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 2 }}>Security Overview</Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Box sx={{ p: 2, textAlign: 'center', border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                                <Shield sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                                  {securityMetrics.criticalRolesWithoutUsers}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Critical Roles Without Users
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ p: 2, textAlign: 'center', border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                                <Warning sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'warning.main' }}>
                                  {securityMetrics.usersWithExcessiveRoles}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Users with Excessive Roles
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ p: 2, textAlign: 'center', border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                                <Lock sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
                                  {securityMetrics.orphanedPermissions}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Orphaned Permissions
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ p: 2, textAlign: 'center', border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                                <Security sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                                  {securityMetrics.complianceScore}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Compliance Score
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Security Risks */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 2 }}>Security Risk Distribution</Typography>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'High Risk', value: securityMetrics.highRiskAssignments, color: COLORS.error[0] },
                                  { name: 'Medium Risk', value: securityMetrics.inactiveUsersWithRoles, color: COLORS.warning[0] },
                                  { name: 'Low Risk', value: totalUsers - securityMetrics.highRiskAssignments - securityMetrics.inactiveUsersWithRoles, color: COLORS.success[0] },
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {[
                                  { name: 'High Risk', value: securityMetrics.highRiskAssignments, color: COLORS.error[0] },
                                  { name: 'Medium Risk', value: securityMetrics.inactiveUsersWithRoles, color: COLORS.warning[0] },
                                  { name: 'Low Risk', value: totalUsers - securityMetrics.highRiskAssignments - securityMetrics.inactiveUsersWithRoles, color: COLORS.success[0] },
                                ].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Security Recommendations */}
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 2 }}>Security Recommendations</Typography>
                          <Grid container spacing={2}>
                            {[
                              { title: 'Assign Users to Critical Roles', description: '3 critical roles currently have no assigned users', priority: 'high' },
                              { title: 'Review Role Assignments', description: '5 users have more than 10 roles assigned', priority: 'medium' },
                              { title: 'Clean Up Orphaned Permissions', description: '12 permissions are not assigned to any role', priority: 'medium' },
                              { title: 'Enable Multi-Factor Authentication', description: '23 users have critical roles but no MFA', priority: 'high' },
                            ].map((recommendation, index) => (
                              <Grid item xs={12} md={6} key={index}>
                                <Card sx={{ p: 2, border: `1px solid ${theme.palette[recommendation.priority === 'high' ? 'error' : 'warning'].main}` }}>
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                    <PriorityHigh
                                      sx={{
                                        color: recommendation.priority === 'high' ? 'error.main' : 'warning.main',
                                        mt: 0.5
                                      }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        {recommendation.title}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {recommendation.description}
                                      </Typography>
                                    </Box>
                                    <Chip
                                      size="small"
                                      label={recommendation.priority}
                                      color={recommendation.priority === 'high' ? 'error' : 'warning'}
                                    />
                                  </Box>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                )}
              </Grid>
            </TabPanel>

            {/* Performance Tab */}
            <TabPanel value={tabValue} index={5}>
              <Grid container spacing={3}>
                {/* System Performance */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>System Performance Metrics</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
                            <Speed sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                              98.5%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              System Uptime
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1 }}>
                            <TrendingUp sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              125ms
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Avg Response Time
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 1 }}>
                            <Assessment sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 600, color: 'warning.main' }}>
                              1,247
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Daily Operations
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
                            <Leaderboard sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 600, color: 'info.main' }}>
                              99.2%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Success Rate
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Database Performance */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Database Performance</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={[
                            { time: '00:00', queries: 120, responseTime: 45 },
                            { time: '04:00', queries: 80, responseTime: 35 },
                            { time: '08:00', queries: 200, responseTime: 65 },
                            { time: '12:00', queries: 350, responseTime: 85 },
                            { time: '16:00', queries: 280, responseTime: 75 },
                            { time: '20:00', queries: 150, responseTime: 55 },
                            { time: '23:59', queries: 100, responseTime: 40 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line type="monotone" dataKey="queries" stroke="#1976d2" strokeWidth={2} />
                          <Line type="monotone" dataKey="responseTime" stroke="#f44336" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* API Performance */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>API Endpoint Performance</Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Endpoint</TableCell>
                              <TableCell align="right">Requests</TableCell>
                              <TableCell align="right">Avg Response Time</TableCell>
                              <TableCell align="right">Success Rate</TableCell>
                              <TableCell align="center">Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {[
                              { endpoint: '/api/roles', requests: 1247, avgTime: 125, successRate: 99.2, status: 'healthy' },
                              { endpoint: '/api/users', requests: 892, avgTime: 98, successRate: 98.7, status: 'healthy' },
                              { endpoint: '/api/permissions', requests: 456, avgTime: 145, successRate: 97.8, status: 'warning' },
                              { endpoint: '/api/assignments', requests: 623, avgTime: 167, successRate: 99.1, status: 'healthy' },
                            ].map((endpoint, index) => (
                              <TableRow key={index} hover>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    {endpoint.endpoint}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">{endpoint.requests.toLocaleString()}</TableCell>
                                <TableCell align="right">{endpoint.avgTime}ms</TableCell>
                                <TableCell align="right">{endpoint.successRate}%</TableCell>
                                <TableCell align="center">
                                  <Chip
                                    size="small"
                                    label={endpoint.status}
                                    color={endpoint.status === 'healthy' ? 'success' : 'warning'}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default RoleAssignmentAnalytics;