// packages/frontend/src/admin/resources/parameters/ProductParameterResource.tsx
// ============================================================================
// 🔧 PROD-006A: PRODUCT PARAMETER RESOURCE - REACT ADMIN INTEGRATION
// ============================================================================
// ✅ IMPLEMENTS: Complete React Admin resource for Product Parameters
// ✅ PATTERN: React Admin v4 Resource with Material-UI v6 integration
// ✅ FEATURES: CRUD operations, validation, dual banking theme support
// ✅ INTEGRATION: Product Parameter standalone CRUD API
// ============================================================================

import React from 'react';
import { Resource } from 'react-admin';
import { Category as ProductIcon } from '@mui/icons-material';

// Import our React Admin components
import { ProductParameterList } from '../../../components/parameters/product/ProductParameterList';
import { ProductParameterCreate } from '../../../components/parameters/product/ProductParameterCreate';
import { ProductParameterEdit } from '../../../components/parameters/product/ProductParameterEdit';

// ==========================================
// PRODUCT PARAMETER RESOURCE CONFIGURATION
// ==========================================

export const ProductParameterResource = () => (
  <Resource
    name="product-parameters"
    list={ProductParameterList}
    create={ProductParameterCreate}
    edit={ProductParameterEdit}
    // show={ProductParameterShow} // TODO: Create show component if needed
    icon={ProductIcon}
    options={{
      label: 'Product Parameters',
      undoable: true
    }}
    recordRepresentation={(record: any) => 
      record ? `${record.prd_code} - ${record.prd_desc}` : 'Product Parameter'
    }
  />
);

// ==========================================
// RESOURCE METADATA
// ==========================================

export const ProductParameterResourceMeta = {
  name: 'product-parameters',
  endpoint: '/api/banking/parameters/product',
  label: 'Product Parameters',
  icon: ProductIcon,
  permissions: {
    list: ['BANK_USER', 'BANK_ADMIN', 'PLATFORM_ADMIN'],
    create: ['BANK_ADMIN', 'PLATFORM_ADMIN'],
    edit: ['BANK_ADMIN', 'PLATFORM_ADMIN'],
    delete: ['BANK_ADMIN', 'PLATFORM_ADMIN']
  },
  features: {
    search: true,
    filter: true,
    export: true,
    bulkActions: true,
    pagination: true,
    sorting: true
  },
  defaultSort: { field: 'prd_code', order: 'ASC' as const },
  perPage: 25
};

export default ProductParameterResource;

console.log('✅ [PROD-006A] ProductParameterResource loaded - React Admin resource integration ready');