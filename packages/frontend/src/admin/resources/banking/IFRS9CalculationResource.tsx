// packages/frontend/src/admin/resources/banking/IFRS9CalculationResource.tsx
// IFRS 9 ECL Calculation Resource for React Admin
// Comprehensive ECL calculation management and monitoring

import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  BooleanField,
  Show,
  SimpleShowLayout,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  DateInput,
  BooleanInput,
  SelectInput,
  useRecordContext,
  FunctionField,
  EditButton,
  ShowButton,
  DeleteButton,
  Filter,
  SearchInput,
  TopToolbar,
  CreateButton,
  ExportButton,
  FilterButton,
  useListContext,
  Button,
  useRefresh,
  useNotify
} from 'react-admin';
import {
  Chip,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Alert,
  IconButton
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';

// Calculation Status Indicator
const CalculationStatusIndicator = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { color: 'success' as const, icon: <SuccessIcon />, label: 'Completed' };
      case 'RUNNING':
        return { color: 'info' as const, icon: <PendingIcon />, label: 'Running' };
      case 'FAILED':
        return { color: 'error' as const, icon: <ErrorIcon />, label: 'Failed' };
      case 'PENDING':
        return { color: 'warning' as const, icon: <PendingIcon />, label: 'Pending' };
      default:
        return { color: 'default' as const, icon: <PendingIcon />, label: 'Unknown' };
    }
  };
  
  const config = getStatusConfig(record.status);
  
  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      icon={config.icon}
      variant={record.status === 'RUNNING' ? 'filled' : 'outlined'}
    />
  );
};

// IFRS 9 Stage Distribution
const StageDistributionIndicator = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  const total = (record.stage1_count || 0) + (record.stage2_count || 0) + (record.stage3_count || 0);
  if (total === 0) return <Typography variant="body2">No data</Typography>;

  const stage1Pct = ((record.stage1_count || 0) / total * 100).toFixed(1);
  const stage2Pct = ((record.stage2_count || 0) / total * 100).toFixed(1);
  const stage3Pct = ((record.stage3_count || 0) / total * 100).toFixed(1);
  
  return (
    <Stack spacing={0.5}>
      <Typography variant="body2" color="success.main">
        Stage 1: {record.stage1_count} ({stage1Pct}%)
      </Typography>
      <Typography variant="body2" color="warning.main">
        Stage 2: {record.stage2_count} ({stage2Pct}%)
      </Typography>
      <Typography variant="body2" color="error.main">
        Stage 3: {record.stage3_count} ({stage3Pct}%)
      </Typography>
    </Stack>
  );
};

// ECL Amount Indicator
const ECLAmountIndicator = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  const totalECL = Number(record.total_ecl_amount) || 0;
  const coverageRatio = Number(record.ecl_coverage_ratio) || 0;

  return (
    <Stack spacing={0.5}>
      <Typography variant="body2" fontWeight="bold">
        {new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(totalECL)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Coverage: {(coverageRatio * 100).toFixed(2)}%
      </Typography>
    </Stack>
  );
};

// Calculation Progress
const CalculationProgress = () => {
  const record = useRecordContext();
  if (!record || record.status !== 'RUNNING') return null;
  
  const progress = Number(record.progress_percentage) || 0;
  
  return (
    <Box sx={{ width: '100%', minWidth: 100 }}>
      <LinearProgress variant="determinate" value={progress} />
      <Typography variant="caption" color="text.secondary">
        {progress.toFixed(1)}%
      </Typography>
    </Box>
  );
};

// Quick Action Buttons
const QuickActionButtons = () => {
  const record = useRecordContext();
  const refresh = useRefresh();
  const notify = useNotify();
  
  if (!record) return null;
  
  const handleRunCalculation = async () => {
    try {
      // Simulate API call to run calculation
      notify('Calculation started successfully', { type: 'success' });
      refresh();
    } catch (error) {
      notify('Failed to start calculation', { type: 'error' });
    }
  };
  
  const handleStopCalculation = async () => {
    try {
      // Simulate API call to stop calculation
      notify('Calculation stopped', { type: 'info' });
      refresh();
    } catch (error) {
      notify('Failed to stop calculation', { type: 'error' });
    }
  };
  
  return (
    <Stack direction="row" spacing={0.5}>
      {record.status === 'PENDING' && (
        <IconButton size="small" color="primary" onClick={handleRunCalculation}>
          <PlayIcon />
        </IconButton>
      )}
      {record.status === 'RUNNING' && (
        <IconButton size="small" color="error" onClick={handleStopCalculation}>
          <StopIcon />
        </IconButton>
      )}
      <IconButton size="small" onClick={() => refresh()}>
        <RefreshIcon />
      </IconButton>
    </Stack>
  );
};

// Calculation Filters
const CalculationFilter = (props: any) => (
  <Filter {...props}>
    <SearchInput source="q" placeholder="Search calculations..." alwaysOn />
    <SelectInput
      source="status"
      label="Status"
      choices={[
        { id: 'PENDING', name: 'Pending' },
        { id: 'RUNNING', name: 'Running' },
        { id: 'COMPLETED', name: 'Completed' },
        { id: 'FAILED', name: 'Failed' },
      ]}
      emptyText="All Statuses"
    />
    <SelectInput
      source="calculation_type"
      label="Calculation Type"
      choices={[
        { id: 'ECL', name: 'ECL Calculation' },
        { id: 'STAGING', name: 'IFRS 9 Staging' },
        { id: 'PD', name: 'PD Modeling' },
        { id: 'LGD', name: 'LGD Modeling' },
        { id: 'EAD', name: 'EAD Modeling' },
      ]}
      emptyText="All Types"
    />
    <DateInput source="calculation_date_from" label="Date From" />
    <DateInput source="calculation_date_to" label="Date To" />
  </Filter>
);

// Calculation Actions
const CalculationActions = () => {
  return (
    <TopToolbar>
      <FilterButton />
      <CreateButton 
        label="New Calculation" 
        variant="contained" 
        sx={{ ml: 1 }}
      />
      <Button
        label="Bulk Run"
        variant="outlined"
        sx={{ ml: 1 }}
        startIcon={<PlayIcon />}
      />
      <ExportButton 
        label="Export Results"
        variant="outlined"
        sx={{ ml: 1 }}
      />
    </TopToolbar>
  );
};

// Calculation List Component
export const CalculationList = (props: any) => (
  <List 
    {...props}
    filters={<CalculationFilter />}
    actions={<CalculationActions />}
    sort={{ field: 'calculation_date', order: 'DESC' }}
    pollInterval={5000} // Poll every 5 seconds for running calculations
  >
    <Datagrid rowClick="show" sx={{ '& .RaDatagrid-headerCell': { fontWeight: 'bold' } }}>
      <TextField source="calculation_id" label="ID" />
      <TextField source="calculation_name" label="Name" />
      <TextField source="calculation_type" label="Type" />
      <DateField source="calculation_date" label="Date" />
      <FunctionField label="Status" render={() => <CalculationStatusIndicator />} />
      <FunctionField label="Progress" render={() => <CalculationProgress />} />
      <FunctionField label="ECL Amount" render={() => <ECLAmountIndicator />} />
      <NumberField source="accounts_processed" label="Accounts" />
      <FunctionField label="Actions" render={() => <QuickActionButtons />} />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// Calculation Show Component
export const CalculationShow = (props: any) => (
  <Show {...props}>
    <SimpleShowLayout>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Calculation Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField source="calculation_id" label="Calculation ID" />
                  <TextField source="calculation_name" label="Name" />
                  <TextField source="calculation_type" label="Type" />
                  <DateField source="calculation_date" label="Calculation Date" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FunctionField label="Status" render={() => <CalculationStatusIndicator />} />
                  <FunctionField label="Progress" render={() => <CalculationProgress />} />
                  <NumberField source="accounts_processed" label="Accounts Processed" />
                  <TextField source="created_by" label="Created By" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                IFRS 9 Stage Distribution
              </Typography>
              <FunctionField label="" render={() => <StageDistributionIndicator />} />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ECL Results
              </Typography>
              <Stack spacing={2}>
                <FunctionField label="Total ECL" render={() => <ECLAmountIndicator />} />
                <NumberField 
                  source="stage1_ecl_amount" 
                  label="Stage 1 ECL" 
                  options={{ style: 'currency', currency: 'IDR' }} 
                />
                <NumberField 
                  source="stage2_ecl_amount" 
                  label="Stage 2 ECL" 
                  options={{ style: 'currency', currency: 'IDR' }} 
                />
                <NumberField 
                  source="stage3_ecl_amount" 
                  label="Stage 3 ECL" 
                  options={{ style: 'currency', currency: 'IDR' }} 
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Execution Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <DateField source="start_time" label="Start Time" showTime />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <DateField source="end_time" label="End Time" showTime />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <NumberField source="execution_duration" label="Duration (seconds)" />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField source="r_model_version" label="R Model Version" />
                </Grid>
              </Grid>
              
              {/* Error Display */}
              <Box sx={{ mt: 2 }}>
                <TextField source="error_message" label="Error Message" multiline fullWidth />
              </Box>
              
              {/* Calculation Parameters */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Calculation Parameters
                </Typography>
                <TextField source="parameters_json" label="Parameters" multiline rows={4} fullWidth />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </SimpleShowLayout>
  </Show>
);

// Calculation Edit Component
export const CalculationEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          <TextInput source="calculation_name" label="Calculation Name" required fullWidth />
          <SelectInput
            source="calculation_type"
            label="Calculation Type"
            choices={[
              { id: 'ECL', name: 'ECL Calculation' },
              { id: 'STAGING', name: 'IFRS 9 Staging' },
              { id: 'PD', name: 'PD Modeling' },
              { id: 'LGD', name: 'LGD Modeling' },
              { id: 'EAD', name: 'EAD Modeling' },
            ]}
            required
            fullWidth
          />
          <DateInput source="calculation_date" label="Calculation Date" required fullWidth />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Configuration
          </Typography>
          <BooleanInput source="include_stage1" label="Include Stage 1" defaultValue={true} />
          <BooleanInput source="include_stage2" label="Include Stage 2" defaultValue={true} />
          <BooleanInput source="include_stage3" label="Include Stage 3" defaultValue={true} />
          <BooleanInput source="auto_start" label="Auto Start" defaultValue={false} />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Parameters
          </Typography>
          <TextInput 
            source="parameters_json" 
            label="Calculation Parameters (JSON)" 
            multiline 
            rows={6} 
            fullWidth
            helperText="Enter calculation parameters in JSON format"
          />
        </Grid>
      </Grid>
    </SimpleForm>
  </Edit>
);

// Calculation Create Component
export const CalculationCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <Alert severity="info" sx={{ mb: 2 }}>
        Create a new IFRS 9 calculation job. The calculation will process portfolio accounts 
        based on the selected parameters and generate ECL results.
      </Alert>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          <TextInput source="calculation_name" label="Calculation Name" required fullWidth />
          <SelectInput
            source="calculation_type"
            label="Calculation Type"
            choices={[
              { id: 'ECL', name: 'ECL Calculation' },
              { id: 'STAGING', name: 'IFRS 9 Staging' },
              { id: 'PD', name: 'PD Modeling' },
              { id: 'LGD', name: 'LGD Modeling' },
              { id: 'EAD', name: 'EAD Modeling' },
            ]}
            required
            fullWidth
            defaultValue="ECL"
          />
          <DateInput source="calculation_date" label="Calculation Date" required fullWidth />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Configuration
          </Typography>
          <BooleanInput source="include_stage1" label="Include Stage 1" defaultValue={true} />
          <BooleanInput source="include_stage2" label="Include Stage 2" defaultValue={true} />
          <BooleanInput source="include_stage3" label="Include Stage 3" defaultValue={true} />
          <BooleanInput source="auto_start" label="Auto Start" defaultValue={false} />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Parameters
          </Typography>
          <TextInput 
            source="parameters_json" 
            label="Calculation Parameters (JSON)" 
            multiline 
            rows={6} 
            fullWidth
            helperText="Enter calculation parameters in JSON format"
            defaultValue={JSON.stringify({
              scenario: "base",
              lookback_periods: 12,
              forward_looking_adjustment: true,
              macroeconomic_factors: true,
              stress_testing: false
            }, null, 2)}
          />
        </Grid>
      </Grid>
    </SimpleForm>
  </Create>
);

// Resource Configuration
export const IFRS9CalculationResource = {
  list: CalculationList,
  show: CalculationShow,
  edit: CalculationEdit,
  create: CalculationCreate,
  icon: CalculateIcon,
  options: {
    label: 'IFRS 9 Calculations'
  }
};

export default IFRS9CalculationResource;