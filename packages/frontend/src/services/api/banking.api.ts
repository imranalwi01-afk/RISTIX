import { apiClient } from '../api-client';
import { API_BASE_URL } from '../api-setup';
import { pdConfigurationsApi } from './pd-configurations.api';
import { lgdConfigurationsApi } from './lgd-configurations.api';
import { eadConfigurationsApi } from './ead-configurations.api';
import { populationSegmentsApi } from './population-segments.api';
import { eclConfigurationsApi } from './ecl-configurations.api';
import { impairmentApi } from './impairment.api';
import { approvalAPI } from './approval.api';
import { notificationAPI } from './notification.api';
import { ifrs9API } from './ifrs9.api';
import { getErrorMessage } from '@/utils/error-message';

// ============================================================================
export const bankingAPI = {
  // Health check DS2 database connection
  health: async () => {
    const response = await apiClient.get('/banking/health');
    return response.data;
  },

  // New Standardized APIs
  pdConfigurations: pdConfigurationsApi,
  lgdConfigurations: lgdConfigurationsApi,
  eadConfigurations: eadConfigurationsApi,
  populationSegments: populationSegmentsApi,
  eclConfigurations: eclConfigurationsApi,
  impairment: impairmentApi,
  approval: approvalAPI,
  notifications: notificationAPI,

  // Jobs Monitoring API (backend /api/v1/jobs)
  jobs: {
    getDefinitions: async () => {
      const response = await apiClient.get('/jobs/definitions')
      return response.data
    },
    getExecutions: async (params?: { page?: number; limit?: number; status?: string; jobType?: string }) => {
      const response = await apiClient.get('/jobs/executions', { params })
      return response.data
    },
    getExecution: async (executionId: string) => {
      const response = await apiClient.get(`/jobs/executions/${executionId}`)
      return response.data
    },
    getMetrics: async () => {
      const response = await apiClient.get('/jobs/metrics')
      return response.data
    },
    getExecutionRuntime: async (executionId: string) => {
      const response = await apiClient.get(`/jobs/executions/${executionId}/runtime`)
      return response.data
    },
    runJob: async (definitionId: string) => {
      const response = await apiClient.post(`/jobs/${definitionId}/run`)
      return response.data
    },
    approveExecution: async (executionId: string, comment?: string) => {
      const payload = comment ? { comment } : {}
      const response = await apiClient.post(`/jobs/executions/${executionId}/approve`, payload)
      return response.data
    },
    rejectExecution: async (executionId: string, comment?: string) => {
      const payload = comment ? { comment } : {}
      const response = await apiClient.post(`/jobs/executions/${executionId}/reject`, payload)
      return response.data
    },
    controlJob: async (executionId: string, action: 'pause' | 'resume' | 'stop') => {
      const response = await apiClient.post(`/jobs/${executionId}/control`, { action })
      return response.data
    },
    toggleJob: async (definitionId: string) => {
      const response = await apiClient.post(`/jobs/${definitionId}/toggle`)
      return response.data
    },
    createDefinition: async (data: any) => {
      const response = await apiClient.post('/jobs/definitions', data)
      return response.data
    },
    updateDefinition: async (definitionId: string, data: any) => {
      const response = await apiClient.patch(`/jobs/definitions/${definitionId}`, data)
      return response.data
    },
    deleteDefinition: async (definitionId: string) => {
      const response = await apiClient.delete(`/jobs/definitions/${definitionId}`)
      return response.data
    },
  },



  // Application setup parameters (FRS9_PARAM_COMMONH - Type A)
  applicationSetup: {
    getAll: async () => {
      const response = await apiClient.get('/banking/setup/application');
      return response.data;
    },

    create: async (setupData: any) => {
      const response = await apiClient.post('/banking/setup/application', setupData);
      return response.data;
    },

    update: async (paramCode: string, setupData: any) => {
      const response = await apiClient.put(`/banking/setup/application/${paramCode}`, setupData);
      return response.data;
    },

    delete: async (paramCode: string) => {
      const response = await apiClient.delete(`/banking/setup/application/${paramCode}`);
      return response.data;
    },

    getHeaderDetails: async (paramCode: string) => {
      const response = await apiClient.get(`/banking/setup/application/${paramCode}/details`);
      return response.data;
    },

    createDetail: async (paramCode: string, detailData: any) => {
      const response = await apiClient.post(`/banking/setup/application/${paramCode}/details`, detailData);
      return response.data;
    },

    updateDetail: async (detailId: number, detailData: any) => {
      const response = await apiClient.put(`/banking/setup/application/details/${detailId}`, detailData);
      return response.data;
    },

    deleteDetail: async (detailId: number) => {
      const response = await apiClient.delete(`/banking/setup/application/details/${detailId}`);
      return response.data;
    }
  },

  // Business setup parameters (FRS9_PARAM_COMMONH - Type B)
  businessSetup: {
    getAll: async (params?: {
      page?: number;
      offset?: number;
      limit?: number;
      search?: string;
      filters?: string;
      sort?: string;
      paginationMode?: 'client' | 'offset' | 'cursor';
    }) => {
      const response = await apiClient.get('/banking/setup/business', { params });
      return response.data;
    },

    create: async (setupData: any) => {
      const response = await apiClient.post('/banking/setup/business', { ...setupData, param_type: 'B' });
      return response.data;
    },

    update: async (paramCode: string, setupData: any) => {
      const response = await apiClient.put(`/banking/setup/business/${paramCode}`, { ...setupData, param_type: 'B' });
      return response.data;
    },

    delete: async (paramCode: string) => {
      const response = await apiClient.delete(`/banking/setup/business/${paramCode}`);
      return response.data;
    },

    getHeaderDetails: async (paramCode: string) => {
      const response = await apiClient.get(`/banking/setup/business/${paramCode}/details`);
      return response.data;
    },

    createDetail: async (paramCode: string, detailData: any) => {
      const response = await apiClient.post(`/banking/setup/business/${paramCode}/details`, detailData);
      return response.data;
    },

    updateDetail: async (detailId: number, detailData: any) => {
      const response = await apiClient.put(`/banking/setup/business/details/${detailId}`, detailData);
      return response.data;
    },

    deleteDetail: async (detailId: number) => {
      const response = await apiClient.delete(`/banking/setup/business/details/${detailId}`);
      return response.data;
    }
  },

  // Product parameters (FRS9_PARAM_PRODUCT)
  productParameters: {
    getAll: async (mode: string, params?: {
      page?: number;
      offset?: number;
      limit?: number;
      paginationMode?: 'offset' | 'cursor';
      search?: string;
      sort?: string;
      prdGroup?: string;
      prdType?: string;
      currency?: string;
      dataSource?: string;
      activeOnly?: boolean | string;
      filters?: string;
    }) => {
      const response = await apiClient.get('/banking/parameters/product', { params: { ...params, mode } });
      return response.data;
    },

    getInstrumentClassOptions: async () => {
      const response = await apiClient.get('/banking/parameters/product/instrument-class-options');
      return response.data;
    },

    getById: async (prdCode: string) => {
      const response = await apiClient.get(`/banking/parameters/product/${prdCode}`);
      return response.data;
    },

    create: async (productData: any) => {
      const response = await apiClient.post('/banking/parameters/product', productData);
      return response.data;
    },

    update: async (prdCode: string, productData: any) => {
      const response = await apiClient.put(`/banking/parameters/product/${prdCode}`, productData);
      return response.data;
    },

    delete: async (prdCode: string) => {
      const response = await apiClient.delete(`/banking/parameters/product/${prdCode}`);
      return response.data;
    }
  },



  // Segmentation Configuration (FRS9_PARAM_SEGMENTH + FRS9_PARAM_SEGMENTD)
  segmentation: {
    // Header Operations
    getHeaders: async (params?: {
      page?: number; limit?: number; search?: string;
      segmentType?: string; status?: string;
      columnFilters?: Record<string, any>;
    }) => {
      const apiParams: Record<string, any> = { ...params };
      if (params?.columnFilters && Object.keys(params.columnFilters).length > 0) {
        apiParams.columnFilters = JSON.stringify(params.columnFilters);
      }
      delete apiParams.columnFilters;
      const response = await apiClient.get('/banking/parameters/segmentation', { params: apiParams });
      return response.data;
    },

    getHeader: async (id: number) => {
      const response = await apiClient.get(`/banking/parameters/segmentation/${id}`);
      return response.data;
    },

    createHeader: async (headerData: any) => {
      const response = await apiClient.post('/banking/parameters/segmentation', headerData);
      return response.data;
    },

    updateHeader: async (id: number, headerData: any) => {
      const response = await apiClient.put(`/banking/parameters/segmentation/${id}`, headerData);
      return response.data;
    },

    deleteHeader: async (id: number) => {
      const response = await apiClient.delete(`/banking/parameters/segmentation/${id}`);
      return response.data;
    },

    // Detail Operations
    getDetails: async (headerId: number) => {
      const response = await apiClient.get(`/banking/parameters/segmentation/${headerId}/details`);
      return response.data;
    },

    createDetail: async (headerId: number, detailData: any) => {
      const response = await apiClient.post(`/banking/parameters/segmentation/${headerId}/details`, detailData);
      return response.data;
    },

    updateDetail: async (detailId: number, detailData: any) => {
      const response = await apiClient.put(`/banking/parameters/segmentation/details/${detailId}`, detailData);
      return response.data;
    },

    deleteDetail: async (detailId: number) => {
      const response = await apiClient.delete(`/banking/parameters/segmentation/details/${detailId}`);
      return response.data;
    },

    // Business Settings Metadata for Rules
    getBusinessSettingsTables: async () => {
      const response = await apiClient.get('/banking/setup/business/tables');
      return response.data;
    },

    getBusinessSettingsColumns: async (tableName: string) => {
      const response = await apiClient.get('/banking/setup/business/columns', { params: { table: tableName } });
      return response.data;
    },

    getBusinessSettingsDataType: async (tableName: string, columnName: string) => {
      const response = await apiClient.get('/banking/setup/business/data-type', { params: { table: tableName, column: columnName } });
      return response.data;
    },

    getBusinessSettingsOperators: async (dataType: string) => {
      const response = await apiClient.get('/banking/setup/business/operators', { params: { dataType } });
      return response.data;
    },

    getBusinessSettingsConditions: async () => {
      const response = await apiClient.get('/banking/setup/business/conditions');
      return response.data;
    },

    getBusinessSettingsValues: async (tableName: string, columnName: string) => {
      const response = await apiClient.get('/banking/setup/business/column-values', { params: { column: columnName, table: tableName } });
      return response.data;
    },

    getSegmentTypes: async () => {
      const response = await apiClient.get('/banking/parameters/segmentation/business-settings/segment-types');
      return response.data;
    }
  },

  // ==========================================
  // JOURNAL PARAMETER API (frs9_param_journal)
  // ==========================================
  journalParameters: {
    getAll: async (params?: {
      page?: number;
      offset?: number;
      limit?: number;
      paginationMode?: 'offset' | 'cursor';
      search?: string;
      filters?: string;
      sort?: string;
      glGroup?: string;
      currency?: string;
      activeFlag?: boolean | string;
    }) => {
      const response = await apiClient.get('/banking/parameters/journal', { params });
      return response.data;
    },
    getById: async (id: number) => {
      const response = await apiClient.get(`/banking/parameters/journal/${id}`);
      return response.data;
    },
    create: async (data: any) => {
      const response = await apiClient.post('/banking/parameters/journal', data);
      return response.data;
    },
    update: async (id: number, data: any) => {
      const response = await apiClient.put(`/banking/parameters/journal/${id}`, data);
      return response.data;
    },
    delete: async (id: number) => {
      const response = await apiClient.delete(`/banking/parameters/journal/${id}`);
      return response.data;
    },
    // Options for dropdowns
    getGlGroupOptions: async () => {
      const response = await apiClient.get('/banking/parameters/journal/gl-group-options');
      return response.data;
    },
    getCurrencyOptions: async () => {
      const response = await apiClient.get('/banking/parameters/journal/currency-options');
      return response.data;
    },
    getJournalTypeOptions: async () => {
      const response = await apiClient.get('/banking/parameters/journal/journal-type-options');
      return response.data;
    },
    getJournalCodeOptions: async () => {
      const response = await apiClient.get('/banking/parameters/journal/journal-code-options');
      return response.data;
    },
    getDbcrOptions: async () => {
      const response = await apiClient.get('/banking/parameters/journal/dbcr-options');
      return response.data;
    }
  },

  pdSetup: {
    // Get all PD configurations with joined lookup data
    getConfigs: async () => {
      const response = await apiClient.get('/banking/pd-setup/configs');
      return response.data;
    },

    // Get single PD configuration by ID
    getConfigById: async (id: string) => {
      const response = await apiClient.get(`/banking/pd-setup/configs/${id}`);
      return response.data;
    },

    // Create new PD configuration
    createConfig: async (configData: any) => {
      const response = await apiClient.post('/banking/pd-setup/configs', configData);
      return response.data;
    },

    // Update existing PD configuration
    updateConfig: async (id: string, configData: any) => {
      const response = await apiClient.put(`/banking/pd-setup/configs/${id}`, configData);
      return response.data;
    },

    // Delete PD configuration
    deleteConfig: async (id: string) => {
      const response = await apiClient.delete(`/banking/pd-setup/configs/${id}`);
      return response.data;
    },

    // Get population segments for PD type
    getPopulationSegments: async (segmentType: string = 'PD') => {
      const response = await apiClient.get('/banking/pd-setup/segments', {
        params: { segment_type: segmentType }
      });
      return response.data;
    },

    // Get business parameters for PD methods and population types
    getBusinessParameters: async (paramCode?: string) => {
      const response = await apiClient.get('/banking/pd-setup/business-parameters', {
        params: paramCode ? { param_code: paramCode } : {}
      });
      return response.data;
    },

    // Get bucket groups from bucket header table
    getBucketGroups: async () => {
      const response = await apiClient.get('/banking/pd-setup/bucket-groups');
      return response.data;
    },

    // Health check for PD Setup service and DS2 database connection
    health: async () => {
      const response = await apiClient.get('/banking/pd-setup/health');
      return response.data;
    },

    // Get PD structure (marginal PD rates) for a specific configuration
    getPDStructure: async (id: string, params?: { prc_date?: string; pd_method?: string }) => {
      const response = await apiClient.get(`/banking/pd-setup/configs/${id}/structure`, { params });
      return response.data;
    }
  },

  // ==========================================
  // BUSINESS SETTINGS API - EXACT USER SPECIFICATIONS B0012-B0016
  // ==========================================
  businessSettings: {
    // B0012: Get table names
    getTables: async () => {
      const response = await apiClient.get('/banking/business-settings/tables');
      return response.data;
    },

    // B0013: Get columns by selected table
    getColumns: async (tableName: string) => {
      const response = await apiClient.get(`/banking/business-settings/columns?table=${encodeURIComponent(tableName)}`);
      return response.data;
    },

    // B0013: Get data type for selected column and table
    getDataType: async (columnName: string, tableName: string) => {
      const response = await apiClient.get(`/banking/business-settings/data-type?column=${encodeURIComponent(columnName)}&table=${encodeURIComponent(tableName)}`);
      return response.data;
    },

    // Alias for component compatibility (Parameter order flipped: Table, Column)
    getBusinessSettingsDataType: async (tableName: string, columnName: string) => {
      const response = await apiClient.get(`/banking/business-settings/data-type?column=${encodeURIComponent(columnName)}&table=${encodeURIComponent(tableName)}`);
      return response.data;
    },

    // B0014: Get operators by selected data type
    getOperators: async (dataType: string) => {
      const response = await apiClient.get(`/banking/business-settings/operators?dataType=${encodeURIComponent(dataType)}`);
      return response.data;
    },

    // B0015: Get conditions (AND/OR)
    getConditions: async () => {
      const response = await apiClient.get('/banking/business-settings/conditions');
      return response.data;
    },

    // B0016: Get column values for multi-select (IN/NOT IN operators)
    getColumnValues: async (columnName: string, tableName: string) => {
      const response = await apiClient.get(`/banking/business-settings/column-values?column=${encodeURIComponent(columnName)}&table=${encodeURIComponent(tableName)}`);
      return response.data;
    },

    // Debug endpoint to check available business settings
    getDebugInfo: async () => {
      const response = await apiClient.get('/banking/business-settings/debug');
      return response.data;
    }
  },

  // LGD SETUP API - IFRS9 LOSS GIVEN DEFAULT CONFIGURATION MANAGEMENT
  // ================================================================
  lgdSetup: {
    // Get all LGD configurations with business parameter lookups
    getAll: async () => {
      const response = await apiClient.get('/banking/collective/lgd-setup');
      return response.data;
    },

    // Get business parameters for LGD setup (methods, population types, segments)
    getBusinessParameters: async () => {
      const response = await apiClient.get('/banking/collective/lgd-setup/business-parameters');
      return response.data;
    },

    // Get single LGD configuration by ID
    getById: async (id: string) => {
      const response = await apiClient.get(`/banking/collective/lgd-setup/${id}`);
      return response.data;
    },

    // Create new LGD configuration
    create: async (lgdData: any) => {
      const response = await apiClient.post('/banking/collective/lgd-setup', lgdData);
      return response.data;
    },

    // Update LGD configuration
    update: async (id: string, lgdData: any) => {
      const response = await apiClient.put(`/banking/collective/lgd-setup/${id}`, lgdData);
      return response.data;
    },

    // Delete LGD configuration
    delete: async (id: string) => {
      const response = await apiClient.delete(`/banking/collective/lgd-setup/${id}`);
      return response.data;
    },

    // Health check for LGD Setup service
    health: async () => {
      const response = await apiClient.get('/banking/collective/lgd-setup/health');
      return response.data;
    }
  },

  // ============================================================================
  // RULE BASE SETTING API - IFRS9 RULE-BASED COLLECTIVE IMPAIRMENT
  // ============================================================================
  // Real DS2 FRS9PRO database integration for rule-based configurations
  // Tables: frs9_param_scenario_rulesh (headers), frs9_param_scenario_rulesd (details)
  ruleBaseSetting: {
    // Get all rule base setting headers with pagination and search
    getHeaders: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      rule_type?: string;
      active_flag?: boolean;
    }) => {
      const response = await apiClient.get('/banking/collective/rule-base', { params });
      return response.data;
    },

    // Get single rule header with all details
    getHeader: async (id: string | number) => {
      const response = await apiClient.get(`/banking/collective/rule-base/${id}`);
      return response.data;
    },

    // Create new rule header
    createHeader: async (headerData: {
      rule_name: string;
      rule_type: string;
      updated_table: string;
      updated_column: string;
      value: string;
      seq?: number;
      active_flag?: boolean;
    }) => {
      const response = await apiClient.post('/banking/collective/rule-base', headerData);
      return response.data;
    },

    // Update rule header
    updateHeader: async (id: string | number, headerData: any) => {
      const response = await apiClient.put(`/banking/collective/rule-base/${id}`, headerData);
      return response.data;
    },

    // Delete rule header and all associated details
    deleteHeader: async (id: string | number) => {
      const response = await apiClient.delete(`/banking/collective/rule-base/${id}`);
      return response.data;
    },

    // Get all detail rules for a specific rule header
    getDetails: async (headerId: string | number) => {
      const response = await apiClient.get(`/banking/collective/rule-base/${headerId}/details`);
      return response.data;
    },

    // Create new detail rule for a rule header
    createDetail: async (headerId: string | number, detailData: {
      query_group: number;
      seq: number;
      table_name: string;
      column_name: string;
      data_type: string;
      operator: string;
      value1?: string;
      value2?: string;
      condition: 'AND' | 'OR';
      detail_type?: string;
      stage_from?: string;
      stage_to?: string;
    }) => {
      const response = await apiClient.post(`/banking/collective/rule-base/${headerId}/details`, detailData);
      return response.data;
    },

    // Update rule detail
    updateDetail: async (detailId: string | number, detailData: any) => {
      const response = await apiClient.put(`/banking/collective/rule-base/details/${detailId}`, detailData);
      return response.data;
    },

    // Delete rule detail
    deleteDetail: async (detailId: string | number) => {
      const response = await apiClient.delete(`/banking/collective/rule-base/details/${detailId}`);
      return response.data;
    },

    // Get available rule types for dropdown
    getRuleTypes: async () => {
      const response = await apiClient.get('/banking/collective/rule-base/metadata/rule-types');
      return response.data;
    },

    // Get operators for specific data type
    getOperators: async (dataType: string) => {
      const response = await apiClient.get(`/banking/collective/rule-base/metadata/operators/${dataType}`);
      return response.data;
    },

    // Get available logical conditions (AND/OR)
    getConditions: async () => {
      const response = await apiClient.get('/banking/collective/rule-base/metadata/conditions');
      return response.data;
    },

    // Get IFRS 9 stages for dropdown
    getStages: async () => {
      const response = await apiClient.get('/banking/collective/rule-base/metadata/stages');
      return response.data;
    },

    // Get available tables from Business Settings
    getBusinessSettingsTables: async () => {
      const response = await apiClient.get('/banking/collective/rule-base/business-settings/tables');
      return response.data;
    },

    // Get columns for specific table from Business Settings
    getBusinessSettingsColumns: async (tableName: string) => {
      const response = await apiClient.get(`/banking/collective/rule-base/business-settings/columns/${tableName}`);
      return response.data;
    },

    // Get distinct values for specific column from Business Settings
    getBusinessSettingsValues: async (tableName: string, columnName: string) => {
      const response = await apiClient.get(`/banking/collective/rule-base/business-settings/values/${tableName}/${columnName}`);
      return response.data;
    },

    // Get rule execution summary for monitoring and reporting
    getSummary: async (id: string | number) => {
      const response = await apiClient.get(`/banking/collective/rule-base/${id}/summary`);
      return response.data;
    }
  },

  // ============================================================================
  // BUCKET PARAMETER API - IFRS9 BUCKET PARAMETER MANAGEMENT
  // ============================================================================
  // Real DS2 FRS9PRO database integration for bucket parameter configurations
  // Tables: frs9_param_bucketh (headers), frs9_param_bucketd (details)
  bucketParameter: {
    // Get all bucket parameter headers with pagination and search
    getHeaders: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      basis?: string;
      active_only?: boolean;
      columnFilters?: Record<string, any>;
    }) => {
      const apiParams: Record<string, any> = { ...params };
      if (params?.columnFilters && Object.keys(params.columnFilters).length > 0) {
        apiParams.columnFilters = JSON.stringify(params.columnFilters);
      }
      delete apiParams.columnFilters;
      const response = await apiClient.get('/banking/collective/bucket', { params: apiParams });
      return response.data;
    },

    // Get single bucket header with all details
    getHeader: async (id: string | number) => {
      const response = await apiClient.get(`/banking/collective/bucket/${id}`);
      return response.data;
    },

    // Create new bucket header
    createHeader: async (headerData: {
      bucket_group: string;
      bucket_desc: string;
      basis: string;
      bucket_default: number;
      closed_flag?: boolean;
      wo_flag?: boolean;
    }) => {
      const response = await apiClient.post('/banking/collective/bucket', headerData);
      return response.data;
    },

    // Update bucket header
    updateHeader: async (id: string | number, headerData: any) => {
      const response = await apiClient.put(`/banking/collective/bucket/${id}`, headerData);
      return response.data;
    },

    // Delete bucket header and all associated details
    deleteHeader: async (id: string | number) => {
      const response = await apiClient.delete(`/banking/collective/bucket/${id}`);
      return response.data;
    },

    // Get all detail buckets for a specific bucket header
    getDetails: async (headerId: string | number) => {
      const response = await apiClient.get(`/banking/collective/bucket/${headerId}/details`);
      return response.data;
    },

    // Create new detail bucket for a bucket header
    createDetail: async (headerId: string | number, detailData: {
      bucket_id: number;
      bucket_name: string;
      range_start: number;
      range_end?: number | null;
    }) => {
      const response = await apiClient.post(`/banking/collective/bucket/${headerId}/details`, detailData);
      return response.data;
    },

    // Update bucket detail
    updateDetail: async (detailId: string | number, detailData: any) => {
      const response = await apiClient.put(`/banking/collective/bucket/details/${detailId}`, detailData);
      return response.data;
    },

    // Delete bucket detail
    deleteDetail: async (detailId: string | number) => {
      const response = await apiClient.delete(`/banking/collective/bucket/details/${detailId}`);
      return response.data;
    },

    // Get available basis options for dropdown (B0017 from Business Parameters)
    getBasisOptions: async () => {
      const response = await apiClient.get('/banking/collective/bucket/metadata/basis-options');
      return response.data;
    },

    // Get bucket parameter statistics
    getStats: async () => {
      const response = await apiClient.get('/banking/collective/bucket/metadata/stats');
      return response.data;
    },

    // Health check for Bucket Parameter service
    health: async () => {
      const response = await apiClient.get('/banking/collective/bucket/health');
      return response.data;
    }
  },

  // ============================================================================
  // IFRS 9 REPORTS API - DS2 LIVE DATABASE INTEGRATION
  // ============================================================================
  ifrs9Reports: {
    // Health check for DS2 FRS9PRO database connection
    health: async () => {
      const response = await apiClient.get('/ifrs9/reports/health');
      return response.data;
    },

    // Get reports metadata and configuration
    getMetadata: async () => {
      const response = await apiClient.get('/ifrs9/reports/metadata');
      return response.data;
    },

    // Lifetime PD operations
    lifetimePD: {
      getYearly: async (params: {
        prc_date: string;
        pd_config_id?: number;
        pd_method?: number;
        scalar_id?: number;
        fl_flag?: boolean;
      }) => {
        const response = await apiClient.get('/ifrs9/reports/lifetime-pd/yearly', { params });
        return response.data;
      },

      getMonthly: async (params: {
        prc_date: string;
        pd_config_id?: number;
        pd_method?: number;
        scalar_id?: number;
        fl_flag?: boolean;
      }) => {
        const response = await apiClient.get('/ifrs9/reports/lifetime-pd/monthly', { params });
        return response.data;
      },
      getAccountDetails: async (params: {
        prc_date: string;
        pd_config_id?: number;
        pd_method?: number;
        scalar_id?: number;
        fl_flag?: boolean;
        page?: number;
        limit?: number;
      }) => {
        const response = await apiClient.get('/ifrs9/reports/lifetime-pd/account-details', { params });
        return response.data;
      }
    },

    // Lifetime LGD operations
    lifetimeLGD: {
      get: async (params: {
        prc_date: string;
        lgd_config_id?: number;
        lgd_method?: number;
        model_id?: number;
        segment_id?: number;
        fl_flag?: boolean;
        page?: number;
        limit?: number;
        search?: string;
        sort?: string;
        sortField?: string;
        sortOrder?: string;
        paginationMode?: 'offset' | 'cursor';
        cursor?: string;
        filters?: string;
        filter?: string;
      }) => {
        const response = await apiClient.get('/ifrs9/reports/lifetime-lgd', { params });
        return response.data;
      },
      getSummary: async (params: {
        prc_date: string;
        lgd_config_id?: number;
        lgd_method?: number;
        model_id?: number;
        segment_id?: number;
        fl_flag?: boolean;
      }) => {
        const response = await apiClient.get('/ifrs9/reports/lifetime-lgd/summary', { params });
        return response.data;
      }
    },

    // EAD Model operations
    eadModel: {
      get: async (params: {
        prc_date: string;
        ead_config_id?: number;
        segment_id?: number;
        page?: number;
        limit?: number;
        search?: string;
        sort?: string;
        sortField?: string;
        sortOrder?: string;
        paginationMode?: 'offset' | 'cursor';
        cursor?: string;
        filters?: string;
        filter?: string;
      }) => {
        const response = await apiClient.get('/ifrs9/reports/ead-model', { params });
        return response.data;
      },
      getSummary: async (params: {
        prc_date: string;
        ead_config_id?: number;
        segment_id?: number;
      }) => {
        const response = await apiClient.get('/ifrs9/reports/ead-model/summary', { params });
        return response.data;
      }
    },

    // ECL Result operations
    eclResult: {
      get: async (params: {
        prc_date: string;
        segment_id?: number;
        stage?: string | string[];
        sub_segment?: string;
        page?: number;
        limit?: number;
        search?: string;
        sort?: string;
        sortField?: string;
        sortOrder?: string;
        paginationMode?: 'offset' | 'cursor';
        cursor?: string;
        filters?: string;
        filter?: string;
      }) => {
        const response = await apiClient.get('/ifrs9/reports/ecl-result', { params });
        return response.data;
      }
    },

    debugConfig: {
      get: async () => {
        const response = await apiClient.get('/ifrs9/reports/debug-config');
        return response.data;
      },
      update: async (enabled: boolean) => {
        const response = await apiClient.put('/ifrs9/reports/debug-config', { enabled });
        return response.data;
      }
    },

    // ECL Movement operations
    eclMovement: {
      get: async (params: {
        prc_date: string;
        segment_id?: number;
        stage?: string | string[];
        group_segment?: string;
        page?: number;
        limit?: number;
        search?: string;
        sort?: string;
        sortField?: string;
        sortOrder?: string;
        paginationMode?: 'offset' | 'cursor';
        cursor?: string;
        filters?: string;
        filter?: string;
      }) => {
        const response = await apiClient.get('/ifrs9/reports/ecl-movement', { params });
        return response.data;
      }
    },

    // GCA Movement operations
    gcaMovement: {
      get: async (params: {
        prc_date: string;
        segment_id?: number;
        stage?: string | string[];
        group_segment?: string;
        page?: number;
        limit?: number;
        search?: string;
        sort?: string;
        sortField?: string;
        sortOrder?: string;
        paginationMode?: 'offset' | 'cursor';
        cursor?: string;
        filters?: string;
        filter?: string;
      }) => {
        const response = await apiClient.get('/ifrs9/reports/gca-movement', { params });
        return response.data;
      }
    },

    // Nominative Report operations (with pagination)
    nominativeReport: {
      get: async (params: {
        prc_date: string;
        segment_id?: number;
        stage?: string | string[];
        branch_code?: string;
        page?: number;
        limit?: number;
      }) => {
        const response = await apiClient.get('/ifrs9/reports/nominative-report', { params });
        return response.data;
      }
    },

    // GL Outbound Report
    glOutbound: {
      get: async (params: {
        prc_date: string;
        page?: number;
        limit?: number;
      }) => {
        const response = await apiClient.get('/ifrs9/reports/gl-outbound', { params });
        return response.data;
      }
    },

    // Export functionality for all report types
    export: async (reportType: string, params: any) => {
      try {
        const response = await fetch(`${API_BASE_URL}/ifrs9/reports/${reportType}/export`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''}`
          },
          body: JSON.stringify(params)
        });

        if (response.ok) {
          const blob = await response.blob();
          return {
            success: true,
            data: blob
          };
        } else {
          throw new Error(`Export failed: ${response.statusText}`);
        }
      } catch (error: any) {
        console.error('Export error:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }
  }
};

// ============================================================================
