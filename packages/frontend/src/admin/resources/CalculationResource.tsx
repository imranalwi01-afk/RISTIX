// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/admin/resources/CalculationResource.tsx
// Generated: Day 2 Hour 6 - Part 2 of 8
// Phase: D2H6 - React Admin Dual Banking Foundation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React Admin v4, Material-UI v6
// Purpose: IFRS 9 ECL calculation management with dual banking support
// ============================================================================

import React, { useState } from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  BooleanField,
  EditButton,
  ShowButton,
  DeleteButton,
  Create,
  Edit,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextInput,
  NumberInput,
  DateInput,
  BooleanInput,
  SelectInput,
  required,
  CreateButton,
  ExportButton,
  TopToolbar,
  FilterButton,
  useRecordContext,
  useGetIdentity,
  TabbedForm,
  FormTab,
  TabbedShowLayout,
  Tab,
  useNotify,
  useRefresh
} from 'react-admin';
import {
  Box,
  Chip,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Assessment,
  PlayArrow,
  Stop,
  Refresh,
  Download,
  Upload,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
  Schedule
} from '@mui/icons-material';

// Types
interface Calculation {
  id: string;
  calculationName: string;
  calculationType: 'ecl' | 'staging' | 'stress_test';
  bankingType: 'conventional' | 'syariah';
  portfolioId: string;
  portfolioName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startTime: string;
  endTime?: string;
  duration?: number;
  totalAccounts: number;
  processedAccounts: number;
  results?: {
    totalEcl: number;
    stage1Ecl: number;
    stage2Ecl: number;
    stage3Ecl: number;
  };
  parameters: {
    reportingDate: string;
    scenarioType: string;
    modelVersion: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Calculation List Actions
 */
const CalculationListActions = () => {
  const [runDialogOpen, setRunDialogOpen] = useState(false);
  const notify = useNotify();
  const refresh = useRefresh();

  const handleRunCalculation = () => {
    setRunDialogOpen(true);
  };

  const handleConfirmRun = () => {
    // Simulate calculation start
    notify('ECL calculation started successfully', { type: 'success' });
    setRunDialogOpen(false);
    refresh();
  };

  return (
    <>
      <TopToolbar>
        <FilterButton />
        <Button
          startIcon={<PlayArrow />}
          onClick={handleRunCalculation}
          color="primary"
          variant="contained"
        >
          Run ECL Calculation
        </Button>
        <CreateButton />
        <ExportButton />
      </TopToolbar>

      <Dialog open={runDialogOpen} onClose={() => setRunDialogOpen(false)}>
        <DialogTitle>Run ECL Calculation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to start a new ECL calculation? This process may take several minutes.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRunDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmRun} variant="contained" startIcon={<PlayArrow />}>
            Start Calculation
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

/**
 * Calculation Status Chip Component
 */
const CalculationStatusChip: React.FC<any> = () => {
  const record = useRecordContext<Calculation>();

  if (!record) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'running':
        return 'info';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle />;
      case 'running':
        return <CircularProgress size={16} />;
      case 'pending':
        return <Schedule />;
      case 'failed':
        return <Error />;
      case 'cancelled':
        return <Stop />;
      default:
        return undefined;
    }
  };

  return (
    <Chip
      icon={getStatusIcon(record.status)}
      label={record.status.toUpperCase()}
      color={getStatusColor(record.status) as any}
      size="small"
    />
  );
};

/**
 * Calculation Type Chip Component
 */
const CalculationTypeChip: React.FC<any> = () => {
  const record = useRecordContext<Calculation>();

  if (!record) return null;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ecl':
        return 'ECL Calculation';
      case 'staging':
        return 'Staging Assessment';
      case 'stress_test':
        return 'Stress Test';
      default:
        return type;
    }
  };

  return (
    <Chip
      icon={<Assessment />}
      label={getTypeLabel(record.calculationType)}
      color="primary"
      size="small"
      variant="outlined"
    />
  );
};

/**
 * Progress Bar Component
 */
const ProgressBar: React.FC<any> = () => {
  const record = useRecordContext<Calculation>();

  if (!record || record.status !== 'running') return null;

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
      <LinearProgress
        variant="determinate"
        value={record.progress}
        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
      />
      <Typography variant="caption" color="textSecondary">
        {record.progress}%
      </Typography>
    </Box>
  );
};

/**
 * Calculation List Component
 */
export const CalculationList: React.FC = () => {
  const { data: identity } = useGetIdentity();
  const bankingType = identity?.bankingType || 'conventional';

  return (
    <List
      actions={<CalculationListActions />}
      filters={[
        <TextInput key="search" label="Search" source="q" alwaysOn />,
        <SelectInput
          key="calculationType"
          label="Calculation Type"
          source="calculationType"
          choices={[
            { id: 'ecl', name: 'ECL Calculation' },
            { id: 'staging', name: 'Staging Assessment' },
            { id: 'stress_test', name: 'Stress Test' },
          ]}
        />,
        <SelectInput
          key="status"
          label="Status"
          source="status"
          choices={[
            { id: 'pending', name: 'Pending' },
            { id: 'running', name: 'Running' },
            { id: 'completed', name: 'Completed' },
            { id: 'failed', name: 'Failed' },
            { id: 'cancelled', name: 'Cancelled' },
          ]}
        />,
        <SelectInput
          key="bankingType"
          label="Banking Type"
          source="bankingType"
          choices={[
            { id: 'conventional', name: 'Conventional' },
            { id: 'syariah', name: 'Syariah' },
          ]}
        />,
      ]}
      sort={{ field: 'createdAt', order: 'DESC' }}
      perPage={25}
    >
      <Datagrid rowClick="show">
        <TextField source="calculationName" label="Name" />
        <CalculationTypeChip label="Type" />
        <TextField source="portfolioName" label="Portfolio" />
        <CalculationStatusChip label="Status" />
        <ProgressBar label="Progress" />
        <NumberField source="totalAccounts" label="Accounts" />
        <DateField source="startTime" label="Started" showTime />
        <NumberField
          source="duration"
          label="Duration (min)"
          transform={(value: number) => value ? Math.round(value / 60) : 0}
        />
        <ShowButton />
        <EditButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

/**
 * Calculation Show Component
 */
export const CalculationShow: React.FC = () => {
  const record = useRecordContext<Calculation>();
  const notify = useNotify();
  const refresh = useRefresh();

  const handleRerun = () => {
    notify('Calculation restarted', { type: 'success' });
    refresh();
  };

  const handleDownloadResults = () => {
    notify('Downloading calculation results...', { type: 'info' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Show>
      <Box sx={{ p: 2 }}>
        {/* Header Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom>
                  {record?.calculationName}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Portfolio: {record?.portfolioName}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <CalculationTypeChip />
                  <CalculationStatusChip />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {record?.status === 'completed' && (
                    <Button
                      size="small"
                      startIcon={<Download />}
                      onClick={handleDownloadResults}
                    >
                      Download Results
                    </Button>
                  )}
                  {record?.status !== 'running' && (
                    <Button
                      size="small"
                      startIcon={<Refresh />}
                      onClick={handleRerun}
                    >
                      Rerun
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Status Alerts */}
        {record?.status === 'running' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="body2" gutterBottom>
                Calculation is currently running...
              </Typography>
              <ProgressBar />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Processed {record.processedAccounts} of {record.totalAccounts} accounts
              </Typography>
            </Box>
          </Alert>
        )}

        {record?.status === 'failed' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Calculation failed. Please check the logs and try again.
          </Alert>
        )}

        {record?.status === 'completed' && record.results && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ECL Results Summary
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {formatCurrency(record.results.totalEcl)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total ECL
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="success.main">
                      {formatCurrency(record.results.stage1Ecl)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Stage 1 ECL
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="warning.main">
                      {formatCurrency(record.results.stage2Ecl)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Stage 2 ECL
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="error.main">
                      {formatCurrency(record.results.stage3Ecl)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Stage 3 ECL
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Islamic Banking Specific Alert */}
        {record?.bankingType === 'syariah' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            This calculation follows Syariah-compliant methodologies according to AAOIFI standards.
          </Alert>
        )}

        {/* Calculation Details */}
        <TabbedShowLayout>
          <Tab label="Basic Information" icon={<Assessment />}>
            <TextField source="calculationName" label="Calculation Name" />
            <TextField source="calculationType" label="Calculation Type" />
            <TextField source="bankingType" label="Banking Type" />
            <TextField source="portfolioName" label="Portfolio" />
            <TextField source="status" label="Status" />
            <NumberField source="progress" label="Progress (%)" />
            <DateField source="startTime" label="Start Time" showTime />
            <DateField source="endTime" label="End Time" showTime />
            <NumberField
              source="duration"
              label="Duration (minutes)"
              transform={(value: number) => value ? Math.round(value / 60) : 0}
            />
          </Tab>

          <Tab label="Processing Details" icon={<TrendingUp />}>
            <NumberField source="totalAccounts" label="Total Accounts" />
            <NumberField source="processedAccounts" label="Processed Accounts" />
            <TextField source="createdBy" label="Created By" />
            <DateField source="createdAt" label="Created Date" showTime />
            <DateField source="updatedAt" label="Updated Date" showTime />
          </Tab>

          <Tab label="Parameters" icon={<Upload />}>
            <DateField source="parameters.reportingDate" label="Reporting Date" />
            <TextField source="parameters.scenarioType" label="Scenario Type" />
            <TextField source="parameters.modelVersion" label="Model Version" />
          </Tab>

          {record?.results && (
            <Tab label="Results" icon={<CheckCircle />}>
              <NumberField
                source="results.totalEcl"
                label="Total ECL"
                options={{
                  style: 'currency',
                  currency: 'USD'
                }}
              />
              <NumberField
                source="results.stage1Ecl"
                label="Stage 1 ECL"
                options={{
                  style: 'currency',
                  currency: 'USD'
                }}
              />
              <NumberField
                source="results.stage2Ecl"
                label="Stage 2 ECL"
                options={{
                  style: 'currency',
                  currency: 'USD'
                }}
              />
              <NumberField
                source="results.stage3Ecl"
                label="Stage 3 ECL"
                options={{
                  style: 'currency',
                  currency: 'USD'
                }}
              />
            </Tab>
          )}
        </TabbedShowLayout>
      </Box>
    </Show>
  );
};

/**
 * Calculation Create Component
 */
export const CalculationCreate: React.FC = () => {
  const { data: identity } = useGetIdentity();
  const defaultBankingType = identity?.bankingType || 'conventional';

  return (
    <Create>
      <TabbedForm>
        <FormTab label="Basic Information" icon={<Assessment />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextInput
                source="calculationName"
                label="Calculation Name"
                validate={required()}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <SelectInput
                source="calculationType"
                label="Calculation Type"
                choices={[
                  { id: 'ecl', name: 'ECL Calculation' },
                  { id: 'staging', name: 'Staging Assessment' },
                  { id: 'stress_test', name: 'Stress Test' },
                ]}
                defaultValue="ecl"
                validate={required()}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="bankingType"
                label="Banking Type"
                choices={[
                  { id: 'conventional', name: 'Conventional Banking' },
                  { id: 'syariah', name: 'Islamic Banking' },
                ]}
                defaultValue={defaultBankingType}
                validate={required()}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="portfolioId"
                label="Portfolio"
                choices={[
                  { id: '1', name: 'Personal Loans Portfolio' },
                  { id: '2', name: 'Mortgage Portfolio' },
                  { id: '3', name: 'Business Loans Portfolio' },
                  { id: '4', name: 'Islamic Murabaha Portfolio' },
                  { id: '5', name: 'Islamic Musharaka Portfolio' },
                ]}
                validate={required()}
                fullWidth
              />
            </Grid>
          </Grid>
        </FormTab>

        <FormTab label="Parameters" icon={<Upload />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <DateInput
                source="parameters.reportingDate"
                label="Reporting Date"
                validate={required()}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="parameters.scenarioType"
                label="Scenario Type"
                choices={[
                  { id: 'base', name: 'Base Scenario' },
                  { id: 'stressed', name: 'Stressed Scenario' },
                  { id: 'optimistic', name: 'Optimistic Scenario' },
                ]}
                defaultValue="base"
                validate={required()}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="parameters.modelVersion"
                label="Model Version"
                choices={[
                  { id: 'v1.0', name: 'Version 1.0' },
                  { id: 'v1.1', name: 'Version 1.1' },
                  { id: 'v2.0', name: 'Version 2.0 (Latest)' },
                ]}
                defaultValue="v2.0"
                validate={required()}
                fullWidth
              />
            </Grid>
          </Grid>
        </FormTab>
      </TabbedForm>
    </Create>
  );
};

/**
 * Calculation Edit Component
 */
export const CalculationEdit: React.FC = () => {
  return (
    <Edit>
      <SimpleForm>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextInput
              source="calculationName"
              label="Calculation Name"
              validate={required()}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SelectInput
              source="calculationType"
              label="Calculation Type"
              choices={[
                { id: 'ecl', name: 'ECL Calculation' },
                { id: 'staging', name: 'Staging Assessment' },
                { id: 'stress_test', name: 'Stress Test' },
              ]}
              validate={required()}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <SelectInput
              source="bankingType"
              label="Banking Type"
              choices={[
                { id: 'conventional', name: 'Conventional Banking' },
                { id: 'syariah', name: 'Islamic Banking' },
              ]}
              validate={required()}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <SelectInput
              source="portfolioId"
              label="Portfolio"
              choices={[
                { id: '1', name: 'Personal Loans Portfolio' },
                { id: '2', name: 'Mortgage Portfolio' },
                { id: '3', name: 'Business Loans Portfolio' },
                { id: '4', name: 'Islamic Murabaha Portfolio' },
                { id: '5', name: 'Islamic Musharaka Portfolio' },
              ]}
              validate={required()}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DateInput
              source="parameters.reportingDate"
              label="Reporting Date"
              validate={required()}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <SelectInput
              source="parameters.scenarioType"
              label="Scenario Type"
              choices={[
                { id: 'base', name: 'Base Scenario' },
                { id: 'stressed', name: 'Stressed Scenario' },
                { id: 'optimistic', name: 'Optimistic Scenario' },
              ]}
              validate={required()}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <SelectInput
              source="parameters.modelVersion"
              label="Model Version"
              choices={[
                { id: 'v1.0', name: 'Version 1.0' },
                { id: 'v1.1', name: 'Version 1.1' },
                { id: 'v2.0', name: 'Version 2.0 (Latest)' },
              ]}
              validate={required()}
              fullWidth
            />
          </Grid>
        </Grid>
      </SimpleForm>
    </Edit>
  );
};

// Export calculation resource configuration
export const CalculationResource = {
  list: CalculationList,
  show: CalculationShow,
  create: CalculationCreate,
  edit: CalculationEdit,
};