// packages/frontend/src/components/react-admin/resources/ApplicationParameterResource.tsx
// ============================================================================
// 🔧 APPL-004: APPLICATION PARAMETER RESOURCE - REACT ADMIN INTEGRATION
// ============================================================================
// ✅ IMPLEMENTS: Complete React Admin resource for Application Parameters
// ✅ PATTERN: Master-Detail Pattern with React Admin framework
// ✅ FEATURES: List, Create, Edit, Show, Delete operations
// ✅ INTEGRATION: Links all components together for React Admin
// ============================================================================

import React from 'react';
import { Resource } from 'react-admin';
import {
  Settings as SettingsIcon
} from '@mui/icons-material';

import { ApplicationParameterList } from '../ApplicationParameterList';
import { ApplicationParameterShow } from '../ApplicationParameterShow';
import { ApplicationParameterCreate } from '../ApplicationParameterCreate'; // ✅ APPL-006 COMPLETED
import { ApplicationParameterEdit } from '../ApplicationParameterEdit';     // ✅ APPL-006 COMPLETED

// =====================================================
// ALL COMPONENTS NOW IMPLEMENTED
// =====================================================

// =====================================================
// MAIN RESOURCE CONFIGURATION
// =====================================================

/**
 * Application Parameter Resource for React Admin
 * 
 * This resource provides complete CRUD operations for application parameters
 * using the master-detail pattern identified in the legacy analysis.
 * 
 * Features:
 * - Master-detail list view with expandable rows
 * - Full CRUD operations (Create, Read, Update, Delete)
 * - Parameter validation and business rules
 * - Audit trail display
 * - Bulk operations support
 * 
 * API Integration:
 * - Headers: /api/v1/application/headers
 * - Details: /api/v1/application/headers/:id/details
 * - Health: /api/v1/application/health
 * - Metadata: /api/v1/application/metadata
 */
export const ApplicationParameterResource: React.FC = () => {
  console.log('🎯 [APPL-004] Loading ApplicationParameterResource for React Admin');

  return (
    <Resource
      name="application/headers"
      options={{
        label: 'Application Parameters',
        icon: SettingsIcon
      }}
      list={ApplicationParameterList}
      create={ApplicationParameterCreate}
      edit={ApplicationParameterEdit}
      show={ApplicationParameterShow}
      recordRepresentation={(record) => record.param_name || record.param_code || `Parameter #${record.id}`}
    />
  );
};

// =====================================================
// RESOURCE METADATA
// =====================================================

export const applicationParameterResourceMetadata = {
  name: 'application/headers',
  label: 'Application Parameters',
  description: 'System configuration and application parameter management using master-detail pattern',
  icon: SettingsIcon,
  
  // API endpoints
  endpoints: {
    base: '/api/v1/application',
    headers: '/api/v1/application/headers',
    details: '/api/v1/application/headers/:id/details',
    health: '/api/v1/application/health',
    metadata: '/api/v1/application/metadata'
  },
  
  // Permissions
  permissions: {
    list: ['ADMIN', 'BANK_CRO', 'BANK_IFRS_MANAGER'],
    create: ['ADMIN', 'BANK_CRO'],
    edit: ['ADMIN', 'BANK_CRO'],
    delete: ['ADMIN'],
    show: ['ADMIN', 'BANK_CRO', 'BANK_IFRS_MANAGER', 'BANK_RISK_ANALYST']
  },
  
  // Business rules
  validation: {
    param_code: {
      required: true,
      maxLength: 10,
      pattern: '^[A-Z0-9_-]+$',
      unique: true
    },
    param_name: {
      required: true,
      maxLength: 255
    },
    param_usage: {
      required: true,
      maxLength: 255
    }
  },
  
  // Master-detail configuration
  masterDetail: {
    master: 'application/headers',
    detail: 'application/details',
    relationship: 'one-to-many',
    foreignKey: 'param_code'
  }
};

// =====================================================
// RESOURCE REGISTRATION HELPER
// =====================================================

/**
 * Helper function to register the Application Parameter resource
 * in a React Admin application
 */
export const registerApplicationParameterResource = (admin: any) => {
  console.log('📋 [APPL-004] Registering Application Parameter resource in React Admin');
  
  return admin.addResource(ApplicationParameterResource);
};

console.log('✅ [APPL-004] ApplicationParameterResource loaded - Complete React Admin integration ready');

export default ApplicationParameterResource;