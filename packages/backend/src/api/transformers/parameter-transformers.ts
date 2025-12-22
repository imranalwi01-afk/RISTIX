// packages/backend/src/api/transformers/parameter-transformers.ts
// ============================================================================
// 🔧 UNIFIED PARAMETER DATA TRANSFORMERS - ALL 4 TYPES
// ============================================================================
// ✅ Application Settings → frs9_param_commond  
// ✅ Business Settings   → frs9_param_commonh
// ✅ Product Parameters  → frs9_param_product
// ✅ Journal Parameters  → frs9_param_journal
// ============================================================================

// Unified frontend interface that all parameter types should conform to
export interface UnifiedParameterResponse {
  pkid: number;
  param_code: string;
  param_seq?: number; // ✅ ADD SEQUENCE FIELD FOR DETAILS
  param_desc: string;
  param_category: string;
  param_value: string;
  param_type: string;
  is_editable: boolean;
  active_flag: boolean;
  created_by?: string;
  created_date?: Date;
}

// ============================================================================
// APPLICATION SETTINGS TRANSFORMERS (frs9_param_commond)
// ============================================================================

export const applicationTransformers = {
  // Transform database record to frontend format (for headers in frs9_param_commonh)
  toFrontend: (dbRecord: any): UnifiedParameterResponse => {
    const data = dbRecord.get ? dbRecord.get({ plain: true }) : dbRecord;
    
    return {
      pkid: data.pkid || Date.now() + Math.random(),
      param_code: data.param_code || '',
      param_desc: data.param_usage || data.param_name || '',
      param_category: data.param_type || 'APPLICATION',
      param_value: data.param_name || '',
      param_type: 'APPLICATION',
      is_editable: true,
      active_flag: true,
      created_by: data.createdby || 'SYSTEM',
      created_date: data.createddate
    };
  },

  // Transform frontend data to database format for headers table (CREATE)
  toDatabase: (frontendData: any, auditContext: any) => {
    return {
      param_code: frontendData.param_code?.trim() || '',
      param_name: frontendData.param_value?.trim() || frontendData.param_code || '',
      param_usage: frontendData.param_desc?.trim() || '',
      param_type: 'S', // Application parameters use type 'S' (System)
      ...auditContext,
      createddate: new Date(),
      updateddate: new Date()
    };
  },

  // Transform frontend data for UPDATE (exclude non-updatable fields)
  toUpdateData: (frontendData: any, auditContext: any) => {
    return {
      param_name: frontendData.param_value?.trim() || '',
      param_usage: frontendData.param_desc?.trim() || '',
      // Don't update param_type to maintain 'S'
      ...auditContext,
      updateddate: new Date()
    };
  },

  // Transform detail record to frontend format (for details in frs9_param_commond)
  detailToFrontend: (dbRecord: any): UnifiedParameterResponse => {
    const data = dbRecord.get ? dbRecord.get({ plain: true }) : dbRecord;
    
    return {
      pkid: data.pkid || Date.now() + Math.random(),
      param_code: data.param_code || '',
      param_seq: data.param_seq || 1, // ✅ ADD MISSING SEQUENCE FIELD
      param_desc: data.paramdesc || '',
      param_category: data.value3 || 'GENERAL',
      param_value: data.value1 || '',
      param_type: data.value2 || 'STRING',
      is_editable: true,
      active_flag: true,
      created_by: data.createdby || 'SYSTEM',
      created_date: data.createddate
    };
  },

  // Transform frontend data to database format for details table (CREATE)
  detailToDatabase: (frontendData: any, auditContext: any) => {
    return {
      param_code: frontendData.param_code?.trim() || '',
      param_seq: frontendData.param_seq || 1,
      value1: frontendData.param_value?.trim() || '',
      value2: frontendData.param_type || 'STRING',
      value3: frontendData.param_category || 'GENERAL',
      paramdesc: frontendData.param_desc?.trim() || frontendData.param_code || '',
      ...auditContext,
      createddate: new Date(),
      updateddate: new Date()
    };
  },

  // Transform frontend data for detail UPDATE (exclude non-updatable fields)
  detailToUpdateData: (frontendData: any, auditContext: any) => {
    return {
      value1: frontendData.param_value?.trim() || '',
      value2: frontendData.param_type || 'STRING',
      value3: frontendData.param_category || 'GENERAL',
      paramdesc: frontendData.param_desc?.trim() || '',
      // Don't update param_code and param_seq to avoid key conflicts
      ...auditContext,
      updateddate: new Date()
    };
  }
};

// ============================================================================
// BUSINESS SETTINGS TRANSFORMERS (frs9_param_commonh)  
// ============================================================================

export const businessTransformers = {
  // Transform database record to frontend format
  toFrontend: (dbRecord: any): UnifiedParameterResponse => {
    const data = dbRecord.get ? dbRecord.get({ plain: true }) : dbRecord;
    
    return {
      pkid: data.pkid || Date.now() + Math.random(),
      param_code: data.param_code || '',
      param_desc: data.param_usage || '',
      param_category: data.param_type || 'BUSINESS',
      param_value: data.param_name || '',
      param_type: 'BUSINESS',
      is_editable: true,
      active_flag: true,
      created_by: data.createdby || 'SYSTEM',
      created_date: data.createddate
    };
  },

  // Transform frontend data to database format (CREATE)
  toDatabase: (frontendData: any, auditContext: any) => {
    return {
      param_code: frontendData.param_code?.trim() || '',
      param_name: frontendData.param_value?.trim() || frontendData.param_code || '',
      param_usage: frontendData.param_desc?.trim() || '',
      param_type: 'B', // Business parameter type
      ...auditContext,
      createddate: new Date(),
      updateddate: new Date()
    };
  },

  // Transform frontend data for UPDATE
  toUpdateData: (frontendData: any, auditContext: any) => {
    return {
      param_name: frontendData.param_value?.trim() || '',
      param_usage: frontendData.param_desc?.trim() || '',
      // Don't update param_type to maintain 'B'
      ...auditContext,
      updateddate: new Date()
    };
  },

  // Transform detail record to frontend format (for details in frs9_param_commond)
  // ✅ FIXED: Match exact legacy format from ss02.png
  detailToFrontend: (dbRecord: any): UnifiedParameterResponse => {
    const data = dbRecord.get ? dbRecord.get({ plain: true }) : dbRecord;
    
    return {
      pkid: data.pkid || Date.now() + Math.random(),
      param_code: data.param_code || '',
      param_seq: data.param_seq || 1, // ✅ PRESERVE EXACT SEQUENCE FROM DATABASE
      param_desc: data.paramdesc || '', // ✅ PRESERVE EXACT DESCRIPTION 
      param_category: data.value3 || '', // ✅ KEEP EMPTY IF NULL (legacy shows empty)
      param_value: data.value1 || '',   // ✅ PRIMARY VALUE (IDR, USD, ALL)
      param_type: data.value2 || '',    // ✅ KEEP EMPTY IF NULL (legacy shows empty)
      is_editable: true,
      active_flag: true,
      created_by: data.createdby || 'SYSTEM',
      created_date: data.createddate
    };
  },

  // Transform frontend data to database format for details table (CREATE)
  // ✅ FIXED: Create records matching legacy format
  detailToDatabase: (frontendData: any, auditContext: any) => {
    return {
      param_code: frontendData.param_code?.trim() || '',
      param_seq: frontendData.param_seq || 1,
      value1: frontendData.value1?.trim() || '', // ✅ USE RAW VALUE1 (currency code)
      value2: frontendData.value2?.trim() || null, // ✅ ALLOW NULL/EMPTY
      value3: frontendData.value3?.trim() || null, // ✅ ALLOW NULL/EMPTY
      paramdesc: frontendData.paramdesc?.trim() || '',
      ...auditContext,
      createddate: new Date(),
      updateddate: new Date()
    };
  },

  // Transform frontend data for detail UPDATE (exclude non-updatable fields)
  // ✅ FIXED: Update records preserving legacy format
  detailToUpdateData: (frontendData: any, auditContext: any) => {
    return {
      value1: frontendData.value1?.trim() || '', // ✅ USE RAW VALUE1 
      value2: frontendData.value2?.trim() || null, // ✅ ALLOW NULL/EMPTY
      value3: frontendData.value3?.trim() || null, // ✅ ALLOW NULL/EMPTY
      paramdesc: frontendData.paramdesc?.trim() || '',
      // Don't update param_code and param_seq to avoid key conflicts
      ...auditContext,
      updateddate: new Date()
    };
  }
};

// ============================================================================
// PRODUCT PARAMETERS TRANSFORMERS (frs9_param_product)
// ============================================================================

export const productTransformers = {
  // Transform database record to frontend format (ACTUAL PRODUCT SCHEMA)
  toFrontend: (dbRecord: any): any => {
    const data = dbRecord.get ? dbRecord.get({ plain: true }) : dbRecord;
    
    return {
      pkid: data.pkid || Date.now() + Math.random(),
      prd_code: data.prd_code || '',
      prd_desc: data.prd_desc || '',
      prd_group: data.prd_group || 'KREDIT',
      prd_type: data.prd_type || 'KONSUMTIF',
      currency: data.currency || 'IDR',
      data_source: data.data_source || 'CORE_BANKING',
      amortization_type: data.amortization_type || 'EFFECTIVE',
      al_flag: data.al_flag || 'Y',
      impaired_flag: data.impaired_flag ?? false,
      bm_flag: data.bm_flag ?? true,
      expected_life: data.expected_life || 60,
      borrowing_rate: data.borrowing_rate || 0.0,
      market_rate: data.market_rate || 0.0,
      active_flag: data.active_flag ?? true,
      createdby: data.createdby || 'SYSTEM',
      createddate: data.createddate,
      updatedby: data.updatedby,
      updateddate: data.updateddate,
      createdhost: data.createdhost,
      updatedhost: data.updatedhost
    };
  },

  // Transform frontend data to database format (CREATE)
  toDatabase: (frontendData: any, auditContext: any) => {
    return {
      prd_code: frontendData.param_code?.trim() || '',
      prd_desc: frontendData.param_desc?.trim() || frontendData.param_code || '',
      prd_group: frontendData.param_category || 'LOAN',
      prd_type: frontendData.param_value?.trim() || '',
      currency: frontendData.param_type || 'IDR',
      data_source: 'MANUAL',
      amortization_type: 'EFFECTIVE',
      al_flag: 'Y',
      impaired_flag: false,
      bm_flag: true,
      expected_life: 60,
      borrowing_rate: 0.0,
      market_rate: 0.0,
      active_flag: true,
      ...auditContext,
      createddate: new Date(),
      updateddate: new Date()
    };
  },

  // Transform frontend data for UPDATE
  toUpdateData: (frontendData: any, auditContext: any) => {
    return {
      prd_desc: frontendData.param_desc?.trim() || '',
      prd_group: frontendData.param_category || 'LOAN',
      prd_type: frontendData.param_value?.trim() || '',
      currency: frontendData.param_type || 'IDR',
      active_flag: frontendData.active_flag ?? true,
      ...auditContext,
      updateddate: new Date()
    };
  }
};

// ============================================================================
// JOURNAL PARAMETERS TRANSFORMERS (frs9_param_journal)
// ============================================================================

export const journalTransformers = {
  // Transform database record to frontend format (ACTUAL JOURNAL SCHEMA)
  toFrontend: (dbRecord: any): any => {
    const data = dbRecord.get ? dbRecord.get({ plain: true }) : dbRecord;
    
    return {
      pkid: data.pkid || Date.now() + Math.random(),
      gl_code: data.gl_code || '',
      gl_desc: data.gl_desc || '',
      gl_group: data.gl_group || 'ASSETS',
      gl_number: data.gl_number || '',
      gl_type: data.gl_type || 'LOANS',
      currency: data.currency || 'IDR',
      dbcr: data.dbcr || 'D',
      active_flag: data.active_flag ?? true,
      createdby: data.createdby || 'SYSTEM',
      createddate: data.createddate,
      updatedby: data.updatedby,
      updateddate: data.updateddate,
      createdhost: data.createdhost,
      updatedhost: data.updatedhost
    };
  },

  // Transform frontend data to database format (CREATE)
  toDatabase: (frontendData: any, auditContext: any) => {
    return {
      gl_code: frontendData.param_code?.trim() || '',
      gl_desc: frontendData.param_desc?.trim() || frontendData.param_code || '',
      gl_group: frontendData.param_category || 'ASSETS',
      gl_number: frontendData.param_value?.trim() || '',
      gl_type: frontendData.param_type || 'GENERAL',
      currency: 'IDR',
      dbcr: 'D', // Default to Debit
      active_flag: true,
      ...auditContext,
      createddate: new Date(),
      updateddate: new Date()
    };
  },

  // Transform frontend data for UPDATE
  toUpdateData: (frontendData: any, auditContext: any) => {
    return {
      gl_desc: frontendData.param_desc?.trim() || '',
      gl_group: frontendData.param_category || 'ASSETS',
      gl_number: frontendData.param_value?.trim() || '',
      gl_type: frontendData.param_type || 'GENERAL',
      active_flag: frontendData.active_flag ?? true,
      ...auditContext,
      updateddate: new Date()
    };
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Clean data object by removing null/undefined values
export const cleanData = (data: any) => {
  const cleaned = { ...data };
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined || cleaned[key] === null) {
      delete cleaned[key];
    }
  });
  return cleaned;
};

// Validate required fields for each parameter type
export const validateRequired = (data: any, parameterType: string, isUpdate: boolean = false): string[] => {
  const errors: string[] = [];
  
  console.log(`🔍 [VALIDATION DEBUG] validateRequired called with:`, {
    parameterType,
    isUpdate,
    dataKeys: Object.keys(data),
    hasParamCode: !!data.param_code,
    stackTrace: new Error().stack?.split('\n')[1]?.trim()
  });
  
  // For CREATE operations, param_code is required in body
  // For UPDATE operations, param_code comes from URL params, not body
  if (!isUpdate) {
    if (!data.param_code || data.param_code.trim().length === 0) {
      console.log(`❌ [VALIDATION DEBUG] param_code validation failed for CREATE operation`);
      console.log(`❌ [VALIDATION DEBUG] Call stack:`, new Error().stack);
      errors.push('Parameter code is required');
    }
    
    if (data.param_code && data.param_code.length > 10) {
      errors.push('Parameter code must be 10 characters or less');
    }
  } else {
    console.log(`✅ [VALIDATION DEBUG] Skipping param_code validation for UPDATE operation`);
    console.log(`✅ [VALIDATION DEBUG] Call stack:`, new Error().stack);
  }
  
  // Parameter type specific validations
  switch (parameterType) {
    case 'application':
    case 'business':
      // For application/business parameters, param_value is required
      if (!data.param_value || data.param_value.trim().length === 0) {
        errors.push('Parameter name is required');
      }
      break;
    case 'product':
      if (!data.param_category) {
        errors.push('Product group is required');
      }
      break;
    case 'journal':
      if (!data.param_category) {
        errors.push('GL group is required');
      }
      break;
  }
  
  return errors;
};