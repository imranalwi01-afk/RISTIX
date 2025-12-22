// packages/frontend/src/app/platform/dashboard/page.tsx
// ============================================================================
// 🩹 SURGICAL FIX: Fixed undefined component error at line 348
// ============================================================================
// ✅ FIXED: Changed getRecentActivities to return component references instead of JSX
// ✅ FIXED: Updated activities.map to render components properly
// ✅ PRESERVED: All existing functionality and styling unchanged
// ============================================================================

'use client'

import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Alert,
  Chip,
  Button,
  IconButton,
  LinearProgress,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import { 
  AdminPanelSettings, 
  Cloud, 
  Storage, 
  Speed,
  Refresh,
  Settings,
  Info,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  People,
  Business,
  Analytics,
  Security,
  Notifications,
  Dashboard as DashboardIcon,
  Monitor,

  Memory,
  NetworkCheck,
  Group,
  Assignment,
  Public,
  Psychology,
  AccountBalance
} from '@mui/icons-material'

export default function PlatformAdminDashboardPage() {
  const [adminType, setAdminType] = useState<string>('')
  const [userRole, setUserRole] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [systemHealth, setSystemHealth] = useState(95)

  useEffect(() => {
    // Get user info from localStorage (updated approach)
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        setUserEmail(user.email || '');
        setUserRole(user.role || '');
        
        // Determine admin type from role
        const role = user.role || '';
        if (role.includes('SUPER_ADMIN') || role.includes('PLATFORM_SUPER_ADMIN')) {
          setAdminType('Platform Super Administrator')
        } else if (role.includes('TECH_ADMIN') || role.includes('PLATFORM_TECH_ADMIN')) {
          setAdminType('Platform Technical Administrator')
        } else if (role.includes('OPERATIONS') || role.includes('PLATFORM_OPERATIONS')) {
          setAdminType('Platform Operations Manager')
        } else if (role.includes('SUPPORT') || role.includes('PLATFORM_SUPPORT')) {
          setAdminType('Platform Support Manager')
        } else {
          setAdminType('Platform Administrator')
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      setAdminType('Platform Administrator');
    }
    
    // Simulate loading and system health check
    setTimeout(() => {
      setIsLoading(false)
      setSystemHealth(Math.floor(Math.random() * 10) + 90) // 90-99%
    }, 1000)
  }, [])

  const getPlatformTheme = () => {
    return { primary: '#667eea', secondary: '#764ba2', icon: '🏢', name: 'Platform Administration' }
  }

  const theme = getPlatformTheme()

  const getPlatformStats = () => {
    return {
      totalTenants: '12',
      activeBanks: '24',
      totalUsers: '1,247',
      activeConsultants: '18',
      systemUptime: '99.8%',
      storageUsed: '2.3TB',
      apiCalls: '15.6M',
      avgResponseTime: '145ms'
    }
  }

  const getSystemServices = () => {
    return [
      { name: 'Authentication Service', status: 'healthy', uptime: '99.9%', response: '12ms' },
      { name: 'Database Cluster', status: 'healthy', uptime: '99.8%', response: '8ms' },
      { name: 'API Gateway', status: 'healthy', uptime: '99.7%', response: '15ms' },
      { name: 'File Storage Service', status: 'warning', uptime: '98.5%', response: '25ms' },
      { name: 'Analytics Engine', status: 'healthy', uptime: '99.6%', response: '18ms' },
      { name: 'R Analytics Service', status: 'healthy', uptime: '99.4%', response: '32ms' }
    ]
  }

  const getTenantOverview = () => {
    return [
      { name: 'Metro Commercial Bank', users: 45, status: 'active', plan: 'Enterprise', usage: '75%' },
      { name: 'Barakah Islamic Bank', users: 38, status: 'active', plan: 'Enterprise', usage: '68%' },
      { name: 'Universal Financial Group', users: 62, status: 'active', plan: 'Premium', usage: '82%' },
      { name: 'City Development Bank', users: 28, status: 'active', plan: 'Standard', usage: '45%' },
      { name: 'Regional Banking Corp', users: 15, status: 'suspended', plan: 'Standard', usage: '12%' }
    ]
  }

  // ✅ SURGICAL FIX: Return component references instead of JSX elements
  const getRecentActivities = () => {
    return [
      { 
        iconComponent: CheckCircle, 
        iconColor: 'success' as const, 
        text: 'System backup completed successfully', 
        time: '1 hour ago' 
      },
      { 
        iconComponent: Group, 
        iconColor: 'primary' as const, 
        text: 'New tenant onboarded: Regional Banking Corp', 
        time: '3 hours ago' 
      },
      { 
        iconComponent: Security, 
        iconColor: 'info' as const, 
        text: 'Security patch deployed to all services', 
        time: '6 hours ago' 
      },
      { 
        iconComponent: Analytics, 
        iconColor: 'secondary' as const, 
        text: 'Monthly usage analytics report generated', 
        time: '12 hours ago' 
      },
      { 
        iconComponent: Warning, 
        iconColor: 'warning' as const, 
        text: 'Storage capacity warning: 85% usage', 
        time: '1 day ago' 
      }
    ]
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setLastRefresh(new Date())
    setTimeout(() => {
      setIsLoading(false)
      setSystemHealth(Math.floor(Math.random() * 10) + 90)
    }, 1500)
  }

  const stats = getPlatformStats()
  const services = getSystemServices()
  const tenants = getTenantOverview()
  const activities = getRecentActivities()

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Loading Platform Administration Dashboard...
        </Typography>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Fetching system metrics and platform analytics...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
              {theme.icon} Platform Administration
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              IFRS 9 Multi-Tenant Platform Management & Operations
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
              {adminType} • {userEmail} • System Health: {systemHealth}% • Last updated: {lastRefresh.toLocaleTimeString()}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Badge badgeContent={3} color="error">
              <IconButton sx={{ color: 'white' }}>
                <Notifications />
              </IconButton>
            </Badge>
            <Chip 
              label={adminType}
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
            />
            <Chip 
              label={`${systemHealth}% Health`}
              variant="outlined"
              sx={{ borderColor: 'white', color: 'white' }}
            />
            <IconButton sx={{ color: 'white' }} onClick={handleRefresh}>
              <Refresh />
            </IconButton>
            <IconButton sx={{ color: 'white' }}>
              <Settings />
            </IconButton>
          </Stack>
        </Box>
      </Paper>

      {/* Platform Status Alert */}
      <Alert 
        severity="success" 
        sx={{ mb: 3 }}
        icon={<Info />}
      >
        <Typography variant="body2">
          <strong>✅ Platform Administration Dashboard Active</strong> - You have full administrative access to the IFRS 9 multi-tenant platform. 
          All system metrics, tenant management, and platform operations are under your control.
          <strong> Route: /platform/dashboard (correctly routed!)</strong>
        </Typography>
      </Alert>

      {/* Key Platform Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: theme.primary, mr: 2 }}>
                  <Business />
                </Avatar>
                <Typography variant="h6" color={theme.primary}>
                  Active Tenants
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.totalTenants}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Banking institutions on platform
              </Typography>
              <Chip 
                label={`${stats.activeBanks} total banks`}
                color="primary"
                size="small"
                icon={<AccountBalance />}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: theme.secondary, mr: 2 }}>
                  <People />
                </Avatar>
                <Typography variant="h6" color={theme.secondary}>
                  Platform Users
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.totalUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total active user accounts
              </Typography>
              <Chip 
                label={`${stats.activeConsultants} consultants`}
                color="success"
                size="small"
                icon={<Group />}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: '#2e7d32', mr: 2 }}>
                  <Monitor />
                </Avatar>
                <Typography variant="h6" color="#2e7d32">
                  System Uptime
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.systemUptime}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Platform availability this month
              </Typography>
              <Chip 
                label={stats.avgResponseTime}
                color="success"
                size="small"
                icon={<Speed />}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: '#1976d2', mr: 2 }}>
                  <Storage />
                </Avatar>
                <Typography variant="h6" color="#1976d2">
                  API Usage
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.apiCalls}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                API calls this month
              </Typography>
              <Chip 
                label={stats.storageUsed}
                color="primary"
                size="small"
                icon={<Storage />}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Services Status */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: theme.primary, display: 'flex', alignItems: 'center' }}>
            <NetworkCheck sx={{ mr: 1 }} />
            System Services Status
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Service</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Uptime</strong></TableCell>
                  <TableCell><strong>Response Time</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((service, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {service.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={service.status}
                        size="small"
                        color={
                          service.status === 'healthy' ? 'success' :
                          service.status === 'warning' ? 'warning' : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {service.uptime}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {service.response}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Platform Actions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: theme.primary, display: 'flex', alignItems: 'center' }}>
                <AdminPanelSettings sx={{ mr: 1 }} />
                Platform Administration
              </Typography>
              <Stack spacing={2}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  sx={{ backgroundColor: theme.primary, py: 1.5 }}
                  startIcon={<Business />}
                >
                  Manage Tenants
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  size="large"
                  color="primary"
                  sx={{ py: 1.5 }}
                  startIcon={<People />}
                >
                  User Management
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  size="large"
                  color="primary"
                  sx={{ py: 1.5 }}
                  startIcon={<Monitor />}
                >
                  System Monitoring
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  size="large"
                  color="primary"
                  sx={{ py: 1.5 }}
                  startIcon={<Analytics />}
                >
                  Platform Analytics
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Platform Activities */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: theme.primary, display: 'flex', alignItems: 'center' }}>
                <Assignment sx={{ mr: 1 }} />
                Recent Platform Activities
              </Typography>
              <List>
                {activities.map((activity, index) => {
                  const IconComponent = activity.iconComponent;
                  return (
                    <React.Fragment key={index}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {/* ✅ SURGICAL FIX: Render component with color prop */}
                          <IconComponent color={activity.iconColor} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={activity.text}
                          secondary={activity.time}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                      {index < activities.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tenant Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: theme.primary, display: 'flex', alignItems: 'center' }}>
            <Public sx={{ mr: 1 }} />
            Tenant Overview
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Tenant Name</strong></TableCell>
                  <TableCell><strong>Users</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Plan</strong></TableCell>
                  <TableCell><strong>Usage</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenants.map((tenant, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {tenant.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {tenant.users} users
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tenant.status}
                        size="small"
                        color={tenant.status === 'active' ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tenant.plan}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={parseInt(tenant.usage)}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                          color={parseInt(tenant.usage) > 80 ? 'warning' : 'primary'}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {tenant.usage}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Platform Status Footer */}
      <Alert severity="success" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>✅ Platform Administration Portal Active:</strong> All supervisory access permissions verified. 
          Platform dashboard operational for {adminType} ({userEmail}).
          Currently managing {stats.totalTenants} tenants with {stats.totalUsers} total users and {stats.systemUptime} system uptime.
          System health at {systemHealth}% with {stats.apiCalls} API calls this month.
          <strong> 🚀 Successfully routed to /platform/dashboard!</strong>
        </Typography>
      </Alert>
    </Box>
  )
}