// packages/frontend/src/components/react-admin/resources/BusinessParameterResource.tsx
// ============================================================================
// 🔧 BUSI-006: BUSINESS PARAMETER RESOURCE - REACT ADMIN CONFIGURATION
// ============================================================================
// ✅ IMPLEMENTS: Complete React Admin Resource for Business Parameters
// ✅ PATTERN: React Admin Resource with all CRUD components
// ✅ FEATURES: List, Create, Edit, Show with professional UI
// ✅ ROUTING: /business/headers for master-detail operations
// ============================================================================

import React from 'react';
import { Resource } from 'react-admin';
import { Business as BusinessIcon } from '@mui/icons-material';

// Import all Business Parameter components
import { BusinessParameterList } from '../BusinessParameterList';
import { BusinessParameterCreate } from '../BusinessParameterCreate';
import { BusinessParameterEdit } from '../BusinessParameterEdit';

// ==========================================
// BUSINESS PARAMETER RESOURCE CONFIGURATION
// ==========================================

export const BusinessParameterResource: React.FC = () => {
  return (
    <Resource
      name="business/headers"
      list={BusinessParameterList}
      create={BusinessParameterCreate}
      edit={BusinessParameterEdit}
      icon={BusinessIcon}
      options={{
        label: 'Business Parameters',
        description: 'Manage business configuration parameters and operational rules'
      }}
    />
  );
};

// Export individual components for direct usage
export {
  BusinessParameterList,
  BusinessParameterCreate,
  BusinessParameterEdit
};

console.log('✅ [BUSI-006] BusinessParameterResource loaded - Complete React Admin Resource configuration');