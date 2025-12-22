// packages/frontend/src/components/react-admin/ApplicationParameterCreate.tsx
// ============================================================================
// 🔧 APPL-006: APPLICATION PARAMETER CREATE - REACT ADMIN CREATE FORM
// ============================================================================
// ✅ IMPLEMENTS: React Admin Create component for Application Parameters
// ✅ PATTERN: Standard React Admin form with validation
// ✅ FEATURES: Complete form with master-detail structure preparation
// ✅ INTEGRATION: Works with ApplicationParameterResource
// ============================================================================

import React from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  BooleanInput,
  required,
  minLength,
  maxLength,
  regex,
  SaveButton,
  Toolbar,
  useCreate,
  useNotify,
  useRedirect,
  TopToolbar,
  ListButton
} from 'react-admin';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  Info as InfoIcon
} from '@mui/icons-material';

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
// CUSTOM TOOLBAR
// =====================================================

const ApplicationParameterCreateToolbar: React.FC = () => (
  <Toolbar>
    <SaveButton 
      label="Create Parameter"
      variant="contained"
      icon={<AddIcon />}
    />
  </Toolbar>
);

// =====================================================
// CUSTOM ACTIONS
// =====================================================

const ApplicationParameterCreateActions: React.FC = () => (
  <TopToolbar>
    <ListButton />
  </TopToolbar>
);

import { ApplicationParameterForm } from './ApplicationParameterForm';

// =====================================================
// MAIN CREATE COMPONENT
// =====================================================

export const ApplicationParameterCreate: React.FC = () => {
  console.log('🎯 [APPL-006] Rendering ApplicationParameterCreate');

  return (
    <Create
      resource="application/headers"
      title="Create Application Parameter"
      actions={<ApplicationParameterCreateActions />}
      redirect="list"
      mutationMode="pessimistic"
    >
      <SimpleForm toolbar={<ApplicationParameterCreateToolbar />}>
        <ApplicationParameterForm mode="create" />
      </SimpleForm>
    </Create>
  );
};

console.log('✅ [APPL-006] ApplicationParameterCreate component loaded - React Admin create form with validation');

export default ApplicationParameterCreate;