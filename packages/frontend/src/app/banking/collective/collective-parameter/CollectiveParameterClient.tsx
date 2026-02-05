// packages/frontend/src/app/banking/collective/collective-parameter/page.tsx
// ============================================================================
// 🎯 COLLECTIVE PARAMETER - PHASE 3 MODULE 3.4 FRONTEND
// ============================================================================
// ✅ PATTERN: React Admin Master Dashboard with Module Integration
// ✅ FEATURES: Segmentation + Rule Base + Bucket orchestration
// ✅ FUNCTIONALITY: Complete collective impairment parameter management
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Tabs,
  Tab,
  Alert,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Paper
} from '@mui/material';

import {
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  Category as CategoryIcon,
  Rule as RuleIcon,
  ViewModule as BucketIcon,
  Sync as SyncIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  PlayArrow as ExecuteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

// Custom hooks for API integration
import { useApiClient } from '@/hooks/useApiClient';
import { useBankingContext } from '@/contexts/BankingContext';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ModuleStatus {
  module: string;
  status: 'configured' | 'partial' | 'missing' | 'error';
  count: number;
  lastUpdated?: string;
  description: string;
}

interface CollectiveParameter {
  id: number;
  parameter_name: string;
  description: string;
  status: 'active' | 'inactive';
  segmentation_count: number;
  rule_count: number;
  bucket_count: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface ExecutionSummary {
  total_accounts: number;
  segmented_accounts: number;
  rules_applied: number;
  buckets_assigned: number;
  execution_time: number;
  last_execution: string;
  status: 'success' | 'partial' | 'failed';
}

// ============================================================================
// TAB PANEL COMPONENT
// ============================================================================

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`collective-tabpanel-${index}`}
      aria-labelledby={`collective-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children as any}</Box>}
    </div>
  );
}

// ============================================================================
// MODULE STATUS COMPONENT
// ============================================================================

const ModuleStatusCard: React.FC<{ moduleStatus: ModuleStatus; onConfigure: () => void }> = ({
  moduleStatus,
  onConfigure
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'configured': return 'success';
      case 'partial': return 'warning';
      case 'missing': return 'error';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'configured': return <CheckIcon color="success" />;
      case 'partial': return <WarningIcon color="warning" />;
      case 'missing': return <ErrorIcon color="error" />;
      case 'error': return <ErrorIcon color="error" />;
      default: return <InfoIcon color="info" />;
    }
  };

  return (
    <Card sx={{ height: '100%', position: 'relative' }}>
      <CardHeader
        avatar={getStatusIcon(moduleStatus.status)}
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6">{moduleStatus.module}</Typography>
            <Chip
              label={moduleStatus.status.toUpperCase()}
              color={getStatusColor(moduleStatus.status) as any}
              size="small"
            />
          </Box>
        }
        action={
          <Tooltip title={`Configure ${moduleStatus.module}`}>
            <IconButton onClick={onConfigure} color="primary">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {moduleStatus.description}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Typography variant="h4" color="primary">
            {moduleStatus.count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configurations
          </Typography>
        </Box>

        {moduleStatus.lastUpdated && (
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Last updated: {new Date(moduleStatus.lastUpdated).toLocaleDateString()}
          </Typography>
        )}

        <Button
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mt: 2 }}
          onClick={onConfigure}
          startIcon={<EditIcon />}
        >
          Configure
        </Button>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CollectiveParameterPage() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moduleStatuses, setModuleStatuses] = useState<ModuleStatus[]>([]);
  const [collectiveParameters, setCollectiveParameters] = useState<CollectiveParameter[]>([]);
  const [executionSummary, setExecutionSummary] = useState<ExecutionSummary | null>(null);
  const [selectedParameter, setSelectedParameter] = useState<number | null>(null);
  const [executeDialog, setExecuteDialog] = useState(false);
  const [executing, setExecuting] = useState(false);

  const apiClient = useApiClient();
  const { selectedTenant: currentTenant } = useBankingContext();

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadModuleStatuses = async () => {
    try {
      setLoading(true);

      // Load status for each module
      const [segmentationStatus, ruleBaseStatus, bucketStatus] = await Promise.all([
        apiClient.apiCall('/api/v1/banking/segmentation'),
        apiClient.apiCall('/api/v1/banking/rule-base-setting'),
        apiClient.apiCall('/api/v1/banking/bucket-parameter')
      ]);

      const statuses: ModuleStatus[] = [
        {
          module: 'Segmentation Configuration',
          status: segmentationStatus.data?.length > 0 ? 'configured' : 'missing',
          count: segmentationStatus.data?.length || 0,
          lastUpdated: segmentationStatus.data?.[0]?.updated_at,
          description: 'Customer and portfolio segmentation rules for ECL calculation grouping'
        },
        {
          module: 'Rule Base Setting',
          status: ruleBaseStatus.data?.length > 0 ? 'configured' : 'missing',
          count: ruleBaseStatus.data?.length || 0,
          lastUpdated: ruleBaseStatus.data?.[0]?.updated_at,
          description: 'Business logic rules for automated staging and parameter assignment'
        },
        {
          module: 'Bucket Parameter',
          status: bucketStatus.data?.length > 0 ? 'configured' : 'missing',
          count: bucketStatus.data?.length || 0,
          lastUpdated: bucketStatus.data?.[0]?.updated_at,
          description: 'Aging buckets and parameter ranges for PD/LGD/EAD calculations'
        }
      ];

      setModuleStatuses(statuses);
    } catch (err) {
      setError('Failed to load module statuses');
      console.error('Error loading module statuses:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCollectiveParameters = async () => {
    try {
      const response = await apiClient.apiCall('/api/v1/banking/collective-parameter');
      setCollectiveParameters(response.data || []);
    } catch (err) {
      console.error('Error loading collective parameters:', err);
    }
  };

  const loadExecutionSummary = async () => {
    try {
      const response = await apiClient.apiCall('/api/v1/banking/collective-parameter/execution-summary');
      setExecutionSummary(response.data);
    } catch (err) {
      console.error('Error loading execution summary:', err);
    }
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleModuleConfigure = (moduleName: string) => {
    // Navigate to specific module configuration page
    switch (moduleName) {
      case 'Segmentation Configuration':
        window.location.href = '/banking/collective/segmentation';
        break;
      case 'Rule Base Setting':
        window.location.href = '/banking/collective/rule-base-setting';
        break;
      case 'Bucket Parameter':
        window.location.href = '/banking/collective/bucket-parameter';
        break;
    }
  };

  const handleExecuteCollective = async () => {
    if (!selectedParameter) return;

    try {
      setExecuting(true);
      await apiClient.apiCall(`/api/v1/banking/collective-parameter/${selectedParameter}/execute`, { method: 'POST' });

      // Reload data after execution
      await Promise.all([
        loadExecutionSummary(),
        loadCollectiveParameters()
      ]);

      setExecuteDialog(false);
    } catch (err) {
      setError('Failed to execute collective parameter calculation');
      console.error('Error executing collective parameter:', err);
    } finally {
      setExecuting(false);
    }
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    loadModuleStatuses();
    loadCollectiveParameters();
    loadExecutionSummary();
  }, []);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderOverviewTab = () => (
    <Box>
      {/* Module Status Cards */}
      <Typography variant="h5" gutterBottom display="flex" alignItems="center" gap={1}>
        <DashboardIcon color="primary" />
        Module Configuration Status
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {moduleStatuses.map((status, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <ModuleStatusCard
              moduleStatus={status}
              onConfigure={() => handleModuleConfigure(status.module)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Overall Progress */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Configuration Progress" />
        <CardContent>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Overall collective parameter configuration completion
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(moduleStatuses.filter(s => s.status === 'configured').length / moduleStatuses.length) * 100}
              sx={{ mt: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {moduleStatuses.filter(s => s.status === 'configured').length} of {moduleStatuses.length} modules configured
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Execution Summary */}
      {executionSummary && (
        <Card>
          <CardHeader
            title="Last Execution Summary"
            action={
              <Button
                variant="contained"
                startIcon={<ExecuteIcon />}
                onClick={() => setExecuteDialog(true)}
                disabled={moduleStatuses.every(s => s.status !== 'configured')}
              >
                Execute Calculation
              </Button>
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="h4" color="primary">
                  {executionSummary.total_accounts.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Accounts
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="h4" color="success.main">
                  {executionSummary.segmented_accounts.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Segmented
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="h4" color="info.main">
                  {executionSummary.rules_applied.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rules Applied
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="h4" color="warning.main">
                  {executionSummary.buckets_assigned.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Buckets Assigned
                </Typography>
              </Grid>
            </Grid>

            <Box mt={3}>
              <Typography variant="body2" color="text.secondary">
                Last execution: {new Date(executionSummary.last_execution).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Execution time: {executionSummary.execution_time}ms
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );

  const renderParametersTab = () => (
    <Box>
      <Typography variant="h5" gutterBottom display="flex" alignItems="center" gap={1}>
        <SettingsIcon color="primary" />
        Collective Parameters
      </Typography>

      {collectiveParameters.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No collective parameters configured. Configure the individual modules first.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {collectiveParameters.map((param) => (
            <Grid size={{ xs: 12, md: 6 }} key={param.id}>
              <Card>
                <CardHeader
                  title={param.parameter_name}
                  subheader={param.description}
                  action={
                    <Chip
                      label={param.status.toUpperCase()}
                      color={param.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  }
                />
                <CardContent>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CategoryIcon /></ListItemIcon>
                      <ListItemText
                        primary="Segmentation Rules"
                        secondary={`${param.segmentation_count} configured`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><RuleIcon /></ListItemIcon>
                      <ListItemText
                        primary="Business Rules"
                        secondary={`${param.rule_count} configured`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><BucketIcon /></ListItemIcon>
                      <ListItemText
                        primary="Bucket Parameters"
                        secondary={`${param.bucket_count} configured`}
                      />
                    </ListItem>
                  </List>

                  <Box mt={2} display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => setSelectedParameter(param.id)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ExecuteIcon />}
                      onClick={() => {
                        setSelectedParameter(param.id);
                        setExecuteDialog(true);
                      }}
                    >
                      Execute
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderIntegrationTab = () => (
    <Box>
      <Typography variant="h5" gutterBottom display="flex" alignItems="center" gap={1}>
        <SyncIcon color="primary" />
        Module Integration
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Data Flow" />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={2}>
                <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography variant="subtitle2">1. Segmentation Configuration</Typography>
                  <Typography variant="body2">Groups portfolio accounts into segments</Typography>
                </Paper>
                <Box display="flex" justifyContent="center">
                  <Typography variant="h4" color="text.secondary">↓</Typography>
                </Box>
                <Paper sx={{ p: 2, bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                  <Typography variant="subtitle2">2. Rule Base Setting</Typography>
                  <Typography variant="body2">Applies business rules to segments</Typography>
                </Paper>
                <Box display="flex" justifyContent="center">
                  <Typography variant="h4" color="text.secondary">↓</Typography>
                </Box>
                <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <Typography variant="subtitle2">3. Bucket Parameter</Typography>
                  <Typography variant="body2">Assigns aging buckets and rates</Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Dependencies" />
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Module execution order and dependencies:
              </Typography>

              <Box mt={2}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Segmentation → Rule Base</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">
                      Rule base settings depend on segmentation configuration to determine which rules apply to which segments.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Rule Base → Bucket Parameter</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">
                      Bucket parameters use rule base results to assign appropriate aging buckets and rates.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>All Modules → IFRS 9 Calculation</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">
                      The final IFRS 9 ECL calculation uses outputs from all three modules to compute expected credit losses.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom display="flex" alignItems="center" gap={2}>
          <TimelineIcon color="primary" fontSize="large" />
          Collective Parameter Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Orchestrate segmentation, rule base, and bucket parameter configurations for collective impairment calculations
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="collective parameter tabs">
          <Tab label="Overview" icon={<DashboardIcon />} />
          <Tab label="Parameters" icon={<SettingsIcon />} />
          <Tab label="Integration" icon={<SyncIcon />} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        {renderOverviewTab()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderParametersTab()}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {renderIntegrationTab()}
      </TabPanel>

      {/* Execute Dialog */}
      <Dialog open={executeDialog} onClose={() => setExecuteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Execute Collective Parameter Calculation</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            This will execute the collective parameter calculation for all configured modules.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The process will apply segmentation rules, business rules, and bucket parameters to the portfolio data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExecuteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleExecuteCollective}
            variant="contained"
            disabled={executing}
            startIcon={executing ? undefined : <ExecuteIcon />}
          >
            {executing ? 'Executing...' : 'Execute'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}