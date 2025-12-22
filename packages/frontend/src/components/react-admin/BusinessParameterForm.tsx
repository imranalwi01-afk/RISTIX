// packages/frontend/src/components/react-admin/BusinessParameterForm.tsx
// ============================================================================
// 🔧 BUSI-006: BUSINESS PARAMETER FORM - SHARED FORM COMPONENT
// ============================================================================
// ✅ IMPLEMENTS: Shared form component for Create/Edit Business Parameters
// ✅ PATTERN: React Admin shared form with validation and guidelines
// ✅ FEATURES: Professional UI, validation, business-specific patterns
// ✅ MODES: Create mode and Edit mode with conditional rendering
// ============================================================================

import React from 'react';
import {
  TextInput,
  required,
  maxLength,
  minLength,
  regex,
  useRecordContext
} from 'react-admin';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Business as BusinessIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

// ==========================================
// VALIDATION RULES
// ==========================================

const validateParamCode = [
  required('Parameter code is required'),
  minLength(3, 'Parameter code must be at least 3 characters'),
  maxLength(10, 'Parameter code must be 10 characters or less'),
  regex(/^[A-Z0-9_-]+$/, 'Parameter code must contain only uppercase letters, numbers, underscores, and hyphens')
];

const validateParamName = [
  required('Parameter name is required'),
  minLength(3, 'Parameter name must be at least 3 characters'),
  maxLength(255, 'Parameter name must be 255 characters or less')
];

const validateParamUsage = [
  required('Parameter usage is required'),
  minLength(10, 'Parameter usage must be at least 10 characters'),
  maxLength(255, 'Parameter usage must be 255 characters or less')
];

// ==========================================
// PARAMETER CODE GUIDELINES COMPONENT
// ==========================================

const ParameterCodeGuidelines: React.FC = () => (
  <Card variant="outlined" sx={{ mb: 3 }}>
    <CardHeader
      avatar={<InfoIcon color="info" />}
      title="Business Parameter Code Guidelines"
      subheader="Follow these patterns for consistent business parameter codes"
    />
    <CardContent>
      <Alert severity="info" sx={{ mb: 2 }}>
        Business parameters control business logic, operational rules, and workflow configurations.
      </Alert>
      
      <Typography variant="subtitle2" gutterBottom>
        📋 Recommended Business Parameter Patterns:
      </Typography>
      
      <List dense>
        <ListItem>
          <ListItemIcon><CodeIcon color="primary" /></ListItemIcon>
          <ListItemText 
            primary="BIZ001-BIZ099: General Business Configuration"
            secondary="Core business rules and operational parameters"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon><SettingsIcon color="secondary" /></ListItemIcon>
          <ListItemText 
            primary="WFLOW01-WFLOW99: Workflow Configuration"
            secondary="Approval workflows, escalation rules, delegation settings"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon><BusinessIcon color="success" /></ListItemIcon>
          <ListItemText 
            primary="LIMIT01-LIMIT99: Business Limits"
            secondary="Credit limits, transaction limits, exposure limits"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon><AssignmentIcon color="warning" /></ListItemIcon>
          <ListItemText 
            primary="RULE01-RULE99: Business Rules"
            secondary="Validation rules, calculation rules, compliance rules"
          />
        </ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" gutterBottom color="text.secondary">
        ✅ Valid Examples: BIZ001, WFLOW01, LIMIT05, RULE_001, BIZ-CONFIG
      </Typography>
      <Typography variant="subtitle2" color="error">
        ❌ Invalid Examples: biz001, BIZ 001, BIZ@001, very-long-parameter-code
      </Typography>
    </CardContent>
  </Card>
);

// ==========================================
// AUDIT INFORMATION COMPONENT
// ==========================================

const AuditInformation: React.FC = () => {
  const record = useRecordContext();
  
  if (!record) return null;

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardHeader
        avatar={<CheckIcon color="success" />}
        title="Business Parameter Information"
        subheader="Current business parameter details and audit trail"
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Parameter Code</Typography>
            <Box display="flex" alignItems="center" mt={0.5}>
              <BusinessIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body1" fontWeight="bold">{record.param_code}</Typography>
              <Chip label="BUSINESS" size="small" color="success" sx={{ ml: 2 }} />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Parameter Type</Typography>
            <Typography variant="body1" mt={0.5}>
              {record.param_type === 'B' ? 'Business Parameter' : record.param_type}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Created By</Typography>
            <Typography variant="body1" mt={0.5}>{record.createdby}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Created Date</Typography>
            <Typography variant="body1" mt={0.5}>
              {record.createddate ? new Date(record.createddate).toLocaleString() : '-'}
            </Typography>
          </Grid>
          
          {record.updatedby && (
            <>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Last Updated By</Typography>
                <Typography variant="body1" mt={0.5}>{record.updatedby}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Last Updated Date</Typography>
                <Typography variant="body1" mt={0.5}>
                  {record.updateddate ? new Date(record.updateddate).toLocaleString() : '-'}
                </Typography>
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

// ==========================================
// MAIN FORM COMPONENT
// ==========================================

interface BusinessParameterFormProps {
  mode: 'create' | 'edit';
}

export const BusinessParameterForm: React.FC<BusinessParameterFormProps> = ({ mode }) => {
  const record = useRecordContext();
  const isEditing = mode === 'edit';

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {isEditing ? '✏️ Edit Business Parameter' : '➕ Create Business Parameter'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isEditing 
            ? 'Update business parameter information. Parameter code cannot be changed.'
            : 'Create a new business parameter to control business logic and operational rules.'
          }
        </Typography>
      </Box>

      {/* Guidelines for Create mode */}
      {mode === 'create' && <ParameterCodeGuidelines />}
      
      {/* Audit Information for Edit mode */}
      {mode === 'edit' && <AuditInformation />}

      {/* Form Fields */}
      <Card>
        <CardHeader
          avatar={<BusinessIcon color="primary" />}
          title="Business Parameter Details"
          subheader="Configure business parameter information and usage"
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* Parameter Code */}
            <Grid item xs={12} md={4}>
              <TextInput
                source="param_code"
                label="Parameter Code"
                validate={isEditing ? undefined : validateParamCode}
                disabled={isEditing}
                helperText={isEditing 
                  ? "Parameter code cannot be changed after creation"
                  : "Unique identifier (e.g., BIZ001, WFLOW01, LIMIT05)"
                }
                format={(value) => value ? value.toUpperCase() : ''}
                parse={(value) => value ? value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') : ''}
                fullWidth
              />
            </Grid>

            {/* Parameter Name */}
            <Grid item xs={12} md={8}>
              <TextInput
                source="param_name"
                label="Parameter Name"
                validate={validateParamName}
                helperText="Descriptive name for the business parameter"
                fullWidth
              />
            </Grid>

            {/* Parameter Usage */}
            <Grid item xs={12}>
              <TextInput
                source="param_usage"
                label="Parameter Usage Description"
                validate={validateParamUsage}
                helperText="Detailed description of what this business parameter controls and how it's used"
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
          </Grid>

          {/* Additional Information */}
          <Box mt={3}>
            <Alert severity="info" icon={<InfoIcon />}>
              <Typography variant="body2">
                <strong>Business Parameter Usage:</strong>
                <br />
                • Configure business logic and operational rules
                <br />
                • Set approval workflow parameters and escalation rules
                <br />
                • Define business limits and validation criteria
                <br />
                • Control system behavior and compliance settings
              </Typography>
            </Alert>
          </Box>

          {mode === 'create' && (
            <Box mt={2}>
              <Alert severity="warning" icon={<WarningIcon />}>
                <Typography variant="body2">
                  <strong>Note:</strong> After creation, you can add detailed configuration values 
                  using the master-detail interface. The parameter code cannot be changed once created.
                </Typography>
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

console.log('✅ [BUSI-006] BusinessParameterForm component loaded - Shared form for Create/Edit modes');