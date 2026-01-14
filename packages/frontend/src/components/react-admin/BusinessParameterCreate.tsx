// packages/frontend/src/components/react-admin/BusinessParameterCreate.tsx
// ============================================================================
// 🔧 BUSI-006: BUSINESS PARAMETER CREATE - REACT ADMIN FORM
// ============================================================================
// ✅ IMPLEMENTS: React Admin Create component for Business Parameters
// ✅ PATTERN: React Admin Create with shared form component
// ✅ FEATURES: Form validation, guidelines, professional UI
// ✅ API: POST /api/v1/business/headers (Master-Detail Pattern)
// ============================================================================

import React from 'react';
import {
  Create,
  SimpleForm,
  TopToolbar,
  ListButton,
  Button,
  SaveButton,
  Toolbar,
  useRedirect,
  useNotify
} from 'react-admin';
import {
  Business as BusinessIcon,
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { BusinessParameterForm } from './BusinessParameterForm';

// ==========================================
// CREATE ACTIONS (TOP TOOLBAR)
// ==========================================

const BusinessParameterCreateActions = () => (
  <TopToolbar>
    <ListButton label="Back to Business Parameters" icon={<ArrowBackIcon />} />
  </TopToolbar>
);

// ==========================================
// CREATE TOOLBAR (BOTTOM ACTIONS)
// ==========================================

const BusinessParameterCreateToolbar = () => {
  const redirect = useRedirect();
  const notify = useNotify();

  const handleSaveAndContinue = () => {
    notify('Business parameter saved successfully', { type: 'success' });
    // Stay on create form for adding more parameters
  };

  const handleSaveAndList = () => {
    notify('Business parameter saved successfully', { type: 'success' });
    redirect('list', 'business/headers');
  };

  return (
    <Toolbar>
      <SaveButton
        label="Save & Continue Adding"
        icon={<SettingsIcon />}
        variant="text"
        onClick={handleSaveAndContinue}
        transform={(data: any) => ({
          ...data,
          redirect: false
        })}
      />
      <SaveButton
        label="Save & Return to List"
        icon={<BusinessIcon />}
        variant="contained"
        onClick={handleSaveAndList}
        transform={(data: any) => ({
          ...data,
          redirect: 'list'
        })}
      />
    </Toolbar>
  );
};

// ==========================================
// MAIN CREATE COMPONENT
// ==========================================

export const BusinessParameterCreate: React.FC = () => {
  return (
    <Create
      resource="business/headers"
      title="Create Business Parameter"
      actions={<BusinessParameterCreateActions />}
      redirect="list"
      sx={{
        '& .RaCreate-main': {
          backgroundColor: 'background.paper',
          borderRadius: 1,
          boxShadow: 1,
          p: 2
        }
      }}
    >
      <SimpleForm toolbar={<BusinessParameterCreateToolbar />}>
        <BusinessParameterForm mode="create" />
      </SimpleForm>
    </Create>
  );
};

console.log('✅ [BUSI-006] BusinessParameterCreate component loaded - React Admin Create form');