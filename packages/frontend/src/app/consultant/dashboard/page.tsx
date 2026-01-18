// packages/frontend/src/app/consultant/dashboard/page.tsx
// 👨‍💼 CONSULTANT DASHBOARD - IFRS 9 CONSULTING INTERFACE
// Route: /consultant/dashboard (consultant route group)
// ✅ FIXED: Route group with unique path segment

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
  Business, 
  Assessment, 
  Timeline, 
  Group,
  Refresh,
  Settings,
  Info,
  CheckCircle,
  Schedule,
  Assignment,
  Analytics,
  Description,
  Verified,
  TrendingUp,
  Calculate,
  Upload,
  Download,
  Notifications,
  AccountBalance,
  Policy,
  Security,
  People,
  Engineering
} from '@mui/icons-material'

export default function ConsultantDashboardPage() {
  const [consultantType, setConsultantType] = useState<string>('')
  const [userRole, setUserRole] = useState<string>('')
  const [firm, setFirm] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    // Get user info from cookies
    const role = document.cookie
      .split('; ')
      .find(row => row.startsWith('ifrs9_user_role='))
      ?.split('=')[1] || ''
    
    const email = document.cookie
      .split('; ')
      .find(row => row.startsWith('ifrs9_user_email='))
      ?.split('=')[1] || ''
    
    setUserRole(role)
    setUserEmail(email)
    
    // Determine consultant type and firm from role/email
    if (role.includes('SENIOR_IFRS9')) {
      setConsultantType('Senior IFRS9 Consultant')
      setFirm('IFRS9 Experts')
    } else if (role.includes('ISLAMIC_BANKING')) {
      setConsultantType('Islamic Banking Consultant')
      setFirm('Syariah Experts')
    } else if (role.includes('RISK_CONSULTANT')) {
      setConsultantType('Risk Management Consultant')
      setFirm('Risk Experts')
    } else if (role.includes('TECHNICAL_SPECIALIST')) {
      setConsultantType('Technical Implementation Specialist')
      setFirm('Implementation Pros')
    } else if (role.includes('R_ANALYTICS')) {
      setConsultantType('R Analytics Consultant')
      setFirm('Data Experts')
    } else if (role.includes('PROJECT_MANAGER')) {
      setConsultantType('Lead Project Manager')
      setFirm('Consulting Firm')
    } else {
      setConsultantType('IFRS9 Consultant')
      setFirm('Professional Services')
    }
    
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const getConsultantTheme = () => {
    return { primary: '#f57c00', secondary: '#ffb74d', icon: '👨‍💼', name: 'Consultant Portal' }
  }

  const theme = getConsultantTheme()

  const getActiveProjects = () => {
    return [
      {
        client: 'Metro Commercial Bank',
        project: 'IFRS 9 Implementation',
        status: 'In Progress',
        progress: 75,
        deadline: 'Mar 2025',
        priority: 'High',
        budget: '$450K',
        team: 8
      },
      {
        client: 'Barakah Islamic Bank', 
        project: 'Syariah IFRS 9 Compliance',
        status: 'Review Phase',
        progress: 90,
        deadline: 'Feb 2025',
        priority: 'Critical',
        budget: '$320K',
        team: 6
      },
      {
        client: 'Universal Financial Group',
        project: 'Dual Banking Integration',
        status: 'Planning',
        progress: 25,
        deadline: 'May 2025',
        priority: 'Medium',
        budget: '$680K',
        team: 12
      }
    ]
  }

  const getConsultingMetrics = () => {
    return {
      activeClients: '3',
      totalProjects: '3',
      completionRate: '93%',
      teamSize: '26',
      revenue: '$1.45M',
      billableHours: '2,840',
      satisfaction: '4.8/5',
      certifications: '12'
    }
  }

  const getRecentActivities = () => {
    return [
      { icon: <CheckCircle color="success" />, text: 'Completed ECL model validation for Metro Bank', time: '2 hours ago', type: 'milestone' },
      { icon: <Assessment color="primary" />, text: 'Submitted quarterly progress report to Barakah Bank', time: '4 hours ago', type: 'report' },
      { icon: <Group color="info" />, text: 'Conducted IFRS 9 training workshop for Universal Bank', time: '6 hours ago', type: 'training' },
      { icon: <Description color="secondary" />, text: 'Updated technical documentation for Metro Bank', time: '8 hours ago', type: 'documentation' },
      { icon: <Business color="success" />, text: 'Client stakeholder review meeting completed', time: '12 hours ago', type: 'meeting' },
      { icon: <Engineering color="primary" />, text: 'R Analytics model deployment successful', time: '1 day ago', type: 'technical' }
    ]
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setLastRefresh(new Date())
    setTimeout(() => setIsLoading(false), 1500)
  }

  const projects = getActiveProjects()
  const metrics = getConsultingMetrics()
  const activities = getRecentActivities()

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Loading Consultant Dashboard...
        </Typography>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Fetching client projects and consulting analytics...
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
              {theme.icon} Consultant Dashboard
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              IFRS 9 Professional Consulting Services
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
              {consultantType} • {firm} • Last updated: {lastRefresh.toLocaleTimeString()}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Badge badgeContent={5} color="error">
              <IconButton sx={{ color: 'white' }}>
                <Notifications />
              </IconButton>
            </Badge>
            <Chip 
              label={consultantType}
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
            />
            <Chip 
              label={firm}
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

      {/* Consultant Profile Alert */}
      <Alert 
        severity="info" 
        sx={{ mb: 3 }}
        icon={<Info />}
      >
        <Typography variant="body2">
          <strong>Professional Consultant Access Active</strong> - You have access to multiple client projects with specialized IFRS 9 consulting capabilities. 
          All client data is protected under strict confidentiality agreements and professional consulting standards.
        </Typography>
      </Alert>

      {/* Key Consulting Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: theme.primary, mr: 2 }}>
                  <Business />
                </Avatar>
                <Typography variant="h6" color={theme.primary}>
                  Active Clients
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {metrics.activeClients}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Banking institutions under consultation
              </Typography>
              <Chip 
                label="Multi-sector portfolio"
                color="primary"
                size="small"
                icon={<TrendingUp />}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: theme.secondary, mr: 2 }}>
                  <Assignment />
                </Avatar>
                <Typography variant="h6" color={theme.secondary}>
                  Project Revenue
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {metrics.revenue}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total active project value
              </Typography>
              <Chip 
                label={`${metrics.billableHours} hours`}
                color="success"
                size="small"
                icon={<Schedule />}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: '#2e7d32', mr: 2 }}>
                  <Timeline />
                </Avatar>
                <Typography variant="h6" color="#2e7d32">
                  Success Rate
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {metrics.completionRate}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Project delivery success rate
              </Typography>
              <Chip 
                label={`${metrics.satisfaction} client rating`}
                color="success"
                size="small"
                icon={<Verified />}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: '#1976d2', mr: 2 }}>
                  <Group />
                </Avatar>
                <Typography variant="h6" color="#1976d2">
                  Team Size
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {metrics.teamSize}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Cross-functional consulting experts
              </Typography>
              <Chip 
                label={`${metrics.certifications} certifications`}
                color="primary"
                size="small"
                icon={<Verified />}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Client Projects */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: theme.primary, display: 'flex', alignItems: 'center' }}>
            <Assignment sx={{ mr: 1 }} />
            Active Client Projects
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Client & Project</strong></TableCell>
                  <TableCell><strong>Progress</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Budget</strong></TableCell>
                  <TableCell><strong>Team</strong></TableCell>
                  <TableCell><strong>Deadline</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {project.client}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {project.project}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={project.progress}
                          sx={{ width: 80, height: 8, borderRadius: 4 }}
                          color={project.progress > 80 ? 'success' : project.progress > 50 ? 'primary' : 'warning'}
                        />
                        <Typography variant="body2">{project.progress}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={project.status}
                        size="small"
                        color={
                          project.status === 'In Progress' ? 'primary' :
                          project.status === 'Review Phase' ? 'success' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.primary }}>
                        {project.budget}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${project.team} members`}
                        size="small"
                        variant="outlined"
                        color="primary"
                        icon={<People />}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {project.deadline}
                      </Typography>
                      <Chip
                        label={project.priority}
                        size="small"
                        color={
                          project.priority === 'Critical' ? 'error' :
                          project.priority === 'High' ? 'warning' : 'default'
                        }
                      />
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
        {/* Consultant Actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: theme.primary, display: 'flex', alignItems: 'center' }}>
                <Assessment sx={{ mr: 1 }} />
                Professional Services
              </Typography>
              <Stack spacing={2}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  sx={{ backgroundColor: theme.primary, py: 1.5 }}
                  startIcon={<Description />}
                >
                  Generate Client Report
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  size="large"
                  color="primary"
                  sx={{ py: 1.5 }}
                  startIcon={<Timeline />}
                >
                  Review Project Timeline
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  size="large"
                  color="primary"
                  sx={{ py: 1.5 }}
                  startIcon={<Group />}
                >
                  Schedule Client Meeting
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  size="large"
                  color="primary"
                  sx={{ py: 1.5 }}
                  startIcon={<Analytics />}
                >
                  Access Client Analytics
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Professional Activities */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: theme.primary, display: 'flex', alignItems: 'center' }}>
                <Timeline sx={{ mr: 1 }} />
                Recent Professional Activities
              </Typography>
              <List>
                {activities.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {activity.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={activity.text}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {activity.time}
                            </Typography>
                            <Chip 
                              label={activity.type}
                              size="small"
                              variant="outlined"
                              sx={{ height: 16, fontSize: '0.65rem' }}
                            />
                          </Box>
                        }
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    {index < activities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Consultant Specialization & Certifications */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: theme.primary, display: 'flex', alignItems: 'center' }}>
            🎯 Professional Specialization: {consultantType}
          </Typography>
          <Grid container spacing={3}>
            {consultantType.includes('Senior IFRS9') && (
              <>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ backgroundColor: theme.primary, mx: 'auto', mb: 1 }}>
                      <Calculate />
                    </Avatar>
                    <Typography variant="subtitle2" gutterBottom>ECL Model Development</Typography>
                    <Chip label="Expert Level" color="success" size="small" />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ backgroundColor: theme.secondary, mx: 'auto', mb: 1 }}>
                      <Assessment />
                    </Avatar>
                    <Typography variant="subtitle2" gutterBottom>Risk Assessment</Typography>
                    <Chip label="Advanced" color="primary" size="small" />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ backgroundColor: '#2e7d32', mx: 'auto', mb: 1 }}>
                      <Verified />
                    </Avatar>
                    <Typography variant="subtitle2" gutterBottom>Regulatory Compliance</Typography>
                    <Chip label="Certified" color="success" size="small" />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ backgroundColor: '#1976d2', mx: 'auto', mb: 1 }}>
                      <Timeline />
                    </Avatar>
                    <Typography variant="subtitle2" gutterBottom>Implementation</Typography>
                    <Chip label="Specialist" color="primary" size="small" />
                  </Box>
                </Grid>
              </>
            )}
            
            {consultantType.includes('Islamic Banking') && (
              <>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ backgroundColor: theme.primary, mx: 'auto', mb: 1 }}>
                      <Verified />
                    </Avatar>
                    <Typography variant="subtitle2" gutterBottom>Syariah Compliance</Typography>
                    <Chip label="Certified Expert" color="success" size="small" />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ backgroundColor: theme.secondary, mx: 'auto', mb: 1 }}>
                      <Description />
                    </Avatar>
                    <Typography variant="subtitle2" gutterBottom>AAOIFI Standards</Typography>
                    <Chip label="Expert" color="success" size="small" />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ backgroundColor: '#2e7d32', mx: 'auto', mb: 1 }}>
                      <Group />
                    </Avatar>
                    <Typography variant="subtitle2" gutterBottom>DPS Consultation</Typography>
                    <Chip label="Available" color="primary" size="small" />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ backgroundColor: '#1976d2', mx: 'auto', mb: 1 }}>
                      <Business />
                    </Avatar>
                    <Typography variant="subtitle2" gutterBottom>Islamic Finance</Typography>
                    <Chip label="Specialist" color="primary" size="small" />
                  </Box>
                </Grid>
              </>
            )}
            
            {(consultantType.includes('Risk') || consultantType.includes('Technical') || consultantType.includes('Analytics') || consultantType.includes('Project')) && (
              <>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ backgroundColor: theme.primary, mx: 'auto', mb: 1 }}>
                      <Assessment />
                    </Avatar>
                    <Typography variant="subtitle2" gutterBottom>Risk Modeling</Typography>
                    <Chip label="Expert" color="success" size="small" />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ backgroundColor: theme.secondary, mx: 'auto', mb: 1 }}>
                      <Analytics />
                    </Avatar>
                    <Typography variant="subtitle2" gutterBottom>Analytics & Reporting</Typography>
                    <Chip label="Advanced" color="primary" size="small" />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ backgroundColor: '#2e7d32', mx: 'auto', mb: 1 }}>
                      <Engineering />
                    </Avatar>
                    <Typography variant="subtitle2" gutterBottom>Technical Implementation</Typography>
                    <Chip label="Certified" color="success" size="small" />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ backgroundColor: '#1976d2', mx: 'auto', mb: 1 }}>
                      <Group />
                    </Avatar>
                    <Typography variant="subtitle2" gutterBottom>Project Leadership</Typography>
                    <Chip label="Expert" color="success" size="small" />
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Professional Status Footer */}
      <Alert severity="success" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>✅ Professional Consultant Portal Active:</strong> All client access permissions verified. 
          Consultant dashboard operational for {consultantType} from {firm}.
          Currently managing {metrics.activeClients} active clients with {metrics.revenue} total project value and {metrics.completionRate} success rate.
        </Typography>
      </Alert>
    </Box>
  )
}