// packages/frontend/src/components/react-admin/ApplicationParameterEdit.tsx
// ============================================================================
// 🔧 APPL-006: APPLICATION PARAMETER EDIT - REACT ADMIN EDIT FORM
// ============================================================================
// ✅ IMPLEMENTS: React Admin Edit component for Application Parameters
// ✅ PATTERN: Standard React Admin form with validation and audit information
// ✅ FEATURES: Complete form with edit restrictions and audit trail
// ✅ INTEGRATION: Works with ApplicationParameterResource
// ============================================================================

import React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  BooleanInput,
  DateInput,
  required,
  minLength,
  maxLength,
  regex,
  SaveButton,
  Toolbar,
  DeleteButton,
  TopToolbar,
  ListButton,
  ShowButton,
  useRecordContext,
  useEditContext
} from 'react-admin';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// =====================================================
// VALIDATION RULES
// =====================================================

const validateParamName = [
  required('Parameter name is required'),
  minLength(1, 'Parameter name must not be empty'),
  maxLength(255, 'Parameter name must be 255 characters or less')
];

const validateParamUsage = [
  required('Parameter usage is required'),
  minLength(1, 'Parameter usage must not be empty'),
  maxLength(255, 'Parameter usage must be 255 characters or less')
];

// =====================================================
// AUDIT INFORMATION COMPONENT
// =====================================================

const AuditInformation: React.FC = () => {
  const record = useRecordContext();
  
  if (!record) return null;
  
  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader 
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color="primary" />
            <Typography variant="h6">Audit Information</Typography>
          </Box>
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Created Information
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`By: ${record.createdby || 'Unknown'}`} 
                size="small" 
                icon={<InfoIcon />}
                variant="outlined"
                color="primary"
              />
              <Chip 
                label={`Date: ${record.createddate ? new Date(record.createddate).toLocaleString() : 'Unknown'}`} 
                size="small" 
                variant="outlined"
                color="primary"
              />
            </Box>
          </Grid>
          
          {record.updatedby && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Last Updated Information
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`By: ${record.updatedby}`} 
                  size="small" 
                  icon={<InfoIcon />}
                  variant="outlined"
                  color="secondary"
                />
                {record.updateddate && (
                  <Chip 
                    label={`Date: ${new Date(record.updateddate).toLocaleString()}`} 
                    size="small" 
                    variant="outlined"
                    color="secondary"
                  />
                )}
              </Box>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <SecurityIcon color="action" fontSize="small" />
              <Typography variant="caption" color="text.secondary">
                Parameter ID: {record.pkid} | 
                Code: {record.param_code} | 
                Type: {record.param_type}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// =====================================================
// CUSTOM TOOLBAR
// =====================================================

const ApplicationParameterEditToolbar: React.FC = () => {
  const record = useRecordContext();
  
  return (
    <Toolbar>
      <SaveButton 
        label="Update Parameter"
        variant="contained"
        icon={<EditIcon />}
      />
      <DeleteButton 
        confirmTitle={`Delete Application Parameter "${record?.param_code}"`}
        confirmContent="Are you sure? This will also delete all related parameter details and cannot be undone."
        mutationMode="pessimistic"
      />
    </Toolbar>
  );
};

// =====================================================
// CUSTOM ACTIONS
// =====================================================

const ApplicationParameterEditActions: React.FC = () => {
  const record = useRecordContext();
  
  return (
    <TopToolbar>
      <ListButton />
      <ShowButton />
    </TopToolbar>
  );
};

import { ApplicationParameterForm } from './ApplicationParameterForm';

// =====================================================
// MAIN EDIT COMPONENT
// =====================================================

export const ApplicationParameterEdit: React.FC = () => {
  const { record } = useEditContext();
  
  console.log('🎯 [APPL-006] Rendering ApplicationParameterEdit for:', record?.param_code);

  return (
    <Edit
      resource="application/headers"
      title={`Edit Application Parameter: ${record?.param_code}`}
      actions={<ApplicationParameterEditActions />}
      mutationMode="pessimistic"
    >
      <SimpleForm toolbar={<ApplicationParameterEditToolbar />}>
        <ApplicationParameterForm mode="edit" />
      </SimpleForm>
    </Edit>
  );
};

console.log('✅ [APPL-006] ApplicationParameterEdit component loaded - React Admin edit form with audit trail');

export default ApplicationParameterEdit;