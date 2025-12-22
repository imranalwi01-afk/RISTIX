// packages/frontend/src/components/react-admin/ApplicationParameterForm.tsx
// ============================================================================
// 🔧 APPL-006: APPLICATION PARAMETER FORM - SHARED FORM COMPONENT
// ============================================================================
// ✅ IMPLEMENTS: Shared form component for Create and Edit operations
// ✅ PATTERN: Reusable form with conditional rendering based on mode
// ✅ FEATURES: Validation, formatting, and business logic
// ✅ INTEGRATION: Used by both Create and Edit components
// ============================================================================

import React from 'react';
import {
  TextInput,
  SelectInput,
  BooleanInput,
  required,
  minLength,
  maxLength,
  regex,
  useRecordContext
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
  Settings as SettingsIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  History as HistoryIcon
} from '@mui/icons-material';

// =====================================================
// INTERFACES
// =====================================================

interface ApplicationParameterFormProps {
  mode: 'create' | 'edit';
}

// =====================================================
// VALIDATION RULES
// =====================================================

const validateParamCode = [
  required('Parameter code is required'),
  minLength(1, 'Parameter code must not be empty'),
  maxLength(10, 'Parameter code must be 10 characters or less'),
  regex(/^[A-Z0-9_-]+$/, 'Parameter code must contain only uppercase letters, numbers, underscores, and hyphens')
];

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
// FORM FIELD CHOICES
// =====================================================

const PARAMETER_TYPE_CHOICES = [
  { id: 'A', name: 'Application (A) - System Configuration' },
  { id: 'B', name: 'Business (B) - Business Rules' },
  { id: 'C', name: 'Calculation (C) - IFRS 9 Calculations' },
  { id: 'R', name: 'Reporting (R) - Report Configuration' },
  { id: 'S', name: 'Security (S) - Security Settings' }
];

const BANKING_TYPE_CHOICES = [
  { id: 'conventional', name: 'Conventional Banking' },
  { id: 'syariah', name: 'Syariah Banking' },
  { id: 'dual', name: 'Dual Banking (Both)' }
];

// =====================================================
// PARAMETER CODE GUIDELINES COMPONENT
// =====================================================

const ParameterCodeGuidelines: React.FC = () => (
  <Card sx={{ mb: 3 }}>
    <CardHeader 
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="primary" />
          <Typography variant="h6">Parameter Code Guidelines</Typography>
        </Box>
      }
    />
    <CardContent>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Parameter Code Requirements:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Chip label="• Maximum 10 characters" size="small" variant="outlined" />
            <Chip label="• Uppercase letters only" size="small" variant="outlined" />
            <Chip label="• Numbers, underscores (_), hyphens (-) allowed" size="small" variant="outlined" />
            <Chip label="• Must be unique across all parameters" size="small" variant="outlined" />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Examples of Valid Codes:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Chip label="SYS_LIMIT" size="small" color="success" variant="outlined" />
            <Chip label="MAX_AMOUNT" size="small" color="success" variant="outlined" />
            <Chip label="RATE_001" size="small" color="success" variant="outlined" />
            <Chip label="CFG_TIMEOUT" size="small" color="success" variant="outlined" />
          </Box>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

// =====================================================
// AUDIT INFORMATION COMPONENT
// =====================================================

const AuditInformation: React.FC = () => {
  const record = useRecordContext();
  
  if (!record || !record.createdby) return null;
  
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
// MAIN FORM COMPONENT
// =====================================================

export const ApplicationParameterForm: React.FC<ApplicationParameterFormProps> = ({ mode }) => {
  const record = useRecordContext();
  const isEditing = mode === 'edit';
  
  console.log(`🎯 [APPL-006] Rendering ApplicationParameterForm in ${mode} mode`);
  
  return (
    <Box sx={{ p: 2 }}>
      {/* Show guidelines for create mode */}
      {mode === 'create' && <ParameterCodeGuidelines />}
      
      {/* Show parameter code warning for edit mode */}
      {mode === 'edit' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Parameter Code Cannot Be Changed
          </Typography>
          <Typography variant="body2">
            The parameter code "{record?.param_code}" is immutable for data integrity. 
            You can modify the name, usage, and other properties, but not the unique identifier.
          </Typography>
        </Alert>
      )}

      {/* Show audit information for edit mode */}
      {mode === 'edit' && <AuditInformation />}

      {/* Main Form Card */}
      <Card>
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon color="primary" />
              <Typography variant="h6">Parameter Configuration</Typography>
              {isEditing && record?.param_code && (
                <Chip 
                  label={`Code: ${record.param_code}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  sx={{ fontFamily: 'monospace' }}
                />
              )}
            </Box>
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {isEditing ? 'Parameter Identity' : 'Basic Information'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextInput
                source="param_code"
                label="Parameter Code"
                validate={isEditing ? undefined : validateParamCode}
                disabled={isEditing}
                helperText={isEditing ? "Parameter code cannot be changed" : "Unique identifier (e.g., SYS_LIMIT)"}
                fullWidth
                format={(value) => value ? value.toUpperCase() : ''}
                parse={(value) => value ? value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') : ''}
                sx={{ 
                  '& .MuiInputBase-input': { 
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    ...(isEditing && { backgroundColor: 'grey.50' })
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <TextInput
                source="param_name"
                label="Parameter Name"
                validate={validateParamName}
                helperText="Human-readable name for this parameter"
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextInput
                source="param_usage"
                label="Usage Description"
                validate={validateParamUsage}
                multiline
                rows={3}
                helperText="Detailed description of how this parameter is used"
                fullWidth
              />
            </Grid>

            {/* Parameter Configuration Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mt: 2 }}>
                Parameter Configuration
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <SelectInput
                source="param_type"
                label="Parameter Type"
                choices={PARAMETER_TYPE_CHOICES}
                defaultValue="A"
                helperText="Category of parameter functionality"
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <SelectInput
                source="banking_type"
                label="Banking Type"
                choices={BANKING_TYPE_CHOICES}
                defaultValue="dual"
                helperText="Which banking type this parameter applies to"
                fullWidth
              />
            </Grid>

            {/* Status & Configuration Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mt: 2 }}>
                Status & Configuration
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <BooleanInput
                source="is_active"
                label="Active"
                defaultValue={true}
                helperText="Whether this parameter is currently active"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <BooleanInput
                source="requires_approval"
                label="Requires Approval"
                defaultValue={false}
                helperText="Whether changes to this parameter require approval"
              />
            </Grid>

            {/* Detail Count Information for Edit Mode */}
            {isEditing && record?.details && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Parameter Details
                  </Typography>
                  <Typography variant="body2">
                    This parameter has {Array.isArray(record.details) ? record.details.length : 0} detail configurations. 
                    Use the "View" action or the expandable row in the list to manage parameter details.
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

console.log('✅ [APPL-006] ApplicationParameterForm shared component loaded - Supports both create and edit modes');

export default ApplicationParameterForm;