// packages/frontend/src/components/react-admin/BusinessParameterEdit.tsx
// ============================================================================
// 🔧 BUSI-006: BUSINESS PARAMETER EDIT - REACT ADMIN FORM
// ============================================================================
// ✅ IMPLEMENTS: React Admin Edit component for Business Parameters
// ✅ PATTERN: React Admin Edit with shared form component
// ✅ FEATURES: Form validation, audit information, professional UI
// ✅ API: PUT /api/v1/business/headers/:id (Master-Detail Pattern)
// ============================================================================

import React from 'react';
import {
  Edit,
  SimpleForm,
  TopToolbar,
  ListButton,
  ShowButton,
  DeleteButton,
  SaveButton,
  Toolbar,
  useEditContext,
  useRedirect,
  useNotify
} from 'react-admin';
import {
  Business as BusinessIcon,
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { BusinessParameterForm } from './BusinessParameterForm';

// ==========================================
// EDIT ACTIONS (TOP TOOLBAR)
// ==========================================

const BusinessParameterEditActions = () => (
  <TopToolbar>
    <ListButton label="Back to Business Parameters" icon={<ArrowBackIcon />} />
    <ShowButton label="View Details" icon={<ViewIcon />} />
    <DeleteButton 
      label="Delete Parameter" 
      icon={<DeleteIcon />}
      confirmTitle="Delete Business Parameter"
      confirmContent="Are you sure you want to delete this business parameter? All associated details will also be deleted."
    />
  </TopToolbar>
);

// ==========================================
// EDIT TOOLBAR (BOTTOM ACTIONS)
// ==========================================

const BusinessParameterEditToolbar = () => {
  const redirect = useRedirect();
  const notify = useNotify();

  const handleSaveAndContinue = () => {
    notify('Business parameter updated successfully', { type: 'success' });
    // Stay on edit form
  };

  const handleSaveAndList = () => {
    notify('Business parameter updated successfully', { type: 'success' });
    redirect('list', 'business/headers');
  };

  return (
    <Toolbar>
      <SaveButton 
        label="Save & Continue Editing"
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
// MAIN EDIT COMPONENT
// ==========================================

export const BusinessParameterEdit: React.FC = () => {
  const { record } = useEditContext();

  return (
    <Edit
      resource="business/headers"
      title={`Edit Business Parameter: ${record?.param_code}`}
      actions={<BusinessParameterEditActions />}
      mutationMode="pessimistic"
      sx={{
        '& .RaEdit-main': {
          backgroundColor: 'background.paper',
          borderRadius: 1,
          boxShadow: 1,
          p: 2
        }
      }}
    >
      <SimpleForm toolbar={<BusinessParameterEditToolbar />}>
        <BusinessParameterForm mode="edit" />
      </SimpleForm>
    </Edit>
  );
};

console.log('✅ [BUSI-006] BusinessParameterEdit component loaded - React Admin Edit form');