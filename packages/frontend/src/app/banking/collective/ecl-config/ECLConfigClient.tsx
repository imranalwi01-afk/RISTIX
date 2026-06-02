// packages/frontend/src/app/banking/collective/ecl-config/page.tsx
// ============================================================================
// IFRS9 FRONTEND - ECL CONFIGURATION PAGE
// ============================================================================
// Database: frs9_imp_ca_ecl_configh (header) + frs9_imp_ca_ecl_configd (detail)
// Business Parameter: B0024 (Module), B0025 (Period Type), PF Segment master
// Legacy Reference: Master-detail pattern for ECL Model configuration
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
} from '@mui/material';
import {
  Calculate as EclIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Download as ExportIcon,
  PlayArrow as RunIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
  TableChart as PreviewResultIcon
} from '@mui/icons-material';

import { useSearchParams } from 'next/navigation';

import { GridColDef } from '@mui/x-data-grid';

// Safe DataGrid wrapper to prevent bundling issues
import { SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import {
  ApprovalNotification,
  ApprovalStatusBadge,
  buildApprovalConflictNotification,
  buildApprovalNotification,
  createClosedApprovalNotification,
  type ApprovalNotificationState,
} from '@/components/approval';
import { usePermission } from '@/hooks/usePermission';

// Premium Layout Components
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';
import ReportDataGrid from '@/components/ifrs9/ReportDataGrid';
import { ECLConfigDialog } from './components/ECLConfigDialog';
import { ECLPreviewResultsDialog } from './components/ECLPreviewResultsDialog';
import type { ECLConfigDetail, ECLConfigHeader, ECLPreviewDetail, ECLPreviewHeader, LookupOption } from './types';

// API service for ECL Configuration - Use centralized api service
import { api } from '../../../../services/api';
import { bankingAPI } from '@/services/api';
import { filterPopulationSegmentsByType } from '@/services/api/population-segments.api';
import {
  eclConfigurationSchema,
  eclDetailConfigurationSchema,
  validateWithSchema,
} from '@/lib/validation/collective-config.validation';
import { getErrorMessage } from '@/utils/error-message';


const ECL_PORTFOLIO_SEGMENT_TYPE = 'PF';
const ECL_STAGE_RULE_TYPE = 'STAGE';

const createEmptyHeaderFormData = (): Partial<ECLConfigHeader> => ({
  ecl_model_name: '',
  module: '',
  effective_date: '',
  active_flag: true,
  details: []
});

const createEmptyDetailFormData = (): Partial<ECLConfigDetail> => ({
  pf_segment_id: 0,
  stage_rule_id: 0,
  pd_model_id: 0,
  lgd_model_id: 0,
  ead_model_id: 0,
  overlay_rate: 100,
  period_type: 0,
  period_date: ''
});

const getResponseRows = (response: any): any[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const normalizeBusinessSettingOptions = (response: any): LookupOption[] =>
  getResponseRows(response)
    .map((item: any, index: number) => ({
      value: String(item.value1 ?? item.param_seq ?? item.id ?? index + 1),
      label: String(item.paramdesc ?? item.param_desc ?? item.value2 ?? item.value1 ?? '').trim(),
    }))
    .filter((item: LookupOption) => item.value && item.label);

const normalizePopulationSegmentOptions = (segments: any[]): LookupOption[] =>
  segments
    .map((segment: any) => ({
      value: String(segment.id ?? ''),
      label: String(segment.segment_name ?? segment.segment ?? '').trim(),
    }))
    .filter((item: LookupOption) => item.value && item.label);

const normalizeRuleOptions = (response: any): LookupOption[] =>
  getResponseRows(response)
    .map((item: any) => ({
      value: String(item.id ?? item.pkid ?? ''),
      label: String(item.rule_name ?? item.label ?? '').trim(),
    }))
    .filter((item: LookupOption) => item.value && item.label);

const normalizeModelOptions = (
  configs: any[],
  getSegmentId: (config: any) => unknown,
  segmentLabelLookup: Map<string, string>
): LookupOption[] =>
  configs
    .map((config: any) => ({
      value: String(config.id ?? config.pkid ?? ''),
      label: [
        String(config.model_name ?? '').trim(),
        segmentLabelLookup.get(String(getSegmentId(config) ?? '')) || '',
      ].filter(Boolean).join(' - '),
      segmentId: String(getSegmentId(config) ?? ''),
    }))
    .filter((item: LookupOption) => item.value && item.label);

const createLabelLookup = (options: LookupOption[]) =>
  new Map(options.map((option) => [String(option.value), option.label]));

const normalizeDetailPayload = (detail: Partial<ECLConfigDetail>) => ({
  pfSegmentId: detail.pf_segment_id,
  stageRuleId: detail.stage_rule_id,
  pdModelId: detail.pd_model_id,
  lgdModelId: detail.lgd_model_id,
  eadModelId: detail.ead_model_id,
  overlayRate: detail.overlay_rate,
  periodType: detail.period_type,
  periodDate: detail.period_date || undefined,
});

const normalizeModeToken = (value?: unknown): string => String(value ?? '').trim().toUpperCase();

const filterRowsByBankingMode = <T extends Record<string, any>>(rows: T[], bankingMode: string): T[] => {
  const target = normalizeModeToken(bankingMode);
  if (!target || target === 'DUAL') return rows;

  const filtered = rows.filter((row) => {
    const modeCandidates = [
      row.banking_mode,
      row.bankingMode,
      row.banking_type,
      row.bankingType,
      row.mode,
    ];

    return modeCandidates.some((candidate) => {
      const token = normalizeModeToken(candidate);
      return token === target || token.includes(target);
    });
  });

  return filtered.length > 0 ? filtered : rows;
};

const formatShortDate = (value?: string | null): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const formatDateTime = (value?: string | null): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const datePart = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);

  const timePart = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);

  return `${datePart} ${timePart}`;
};

const hydrateEclDetails = (
  details: ECLConfigDetail[],
  lookups: {
    segments: Map<string, string>;
    stageRules: Map<string, string>;
    pdModels: Map<string, string>;
    lgdModels: Map<string, string>;
    eadModels: Map<string, string>;
    periodTypes: Map<string, string>;
  }
): ECLConfigDetail[] =>
  details.map((detail) => ({
    ...detail,
    pf_segment_name: lookups.segments.get(String(detail.pf_segment_id ?? '')) || detail.pf_segment_name,
    stage_rule_name: lookups.stageRules.get(String(detail.stage_rule_id ?? '')) || detail.stage_rule_name,
    pd_model_name: lookups.pdModels.get(String(detail.pd_model_id ?? '')) || detail.pd_model_name,
    lgd_model_name: lookups.lgdModels.get(String(detail.lgd_model_id ?? '')) || detail.lgd_model_name,
    ead_model_name: lookups.eadModels.get(String(detail.ead_model_id ?? '')) || detail.ead_model_name,
    period_type_name: lookups.periodTypes.get(String(detail.period_type ?? '')) || detail.period_type_name,
  }));

// Alias to match existing usage patterns in this file
const eclConfigurationAPI = {
  getHeaders: async (): Promise<ECLConfigHeader[]> => {
    try {
      const data = await api.banking.eclConfigurations.getAll();
      console.log('🔍 [ECL-API] Raw API Response:', JSON.stringify(data, null, 2));

      // Handle case where data might be nested in { data: [...] } if API client behaves unexpectedly
      const resultData = Array.isArray(data) ? data : (data as any).data || [];

      if (!Array.isArray(resultData)) {
        console.error('❌ [ECL-API] Expected array but got:', typeof resultData);
        return [];
      }

      // Transform to match expected structure
      const transformed = resultData.map((item: any) => {
        return {
          pkid: Number(item.id), // Ensure number
          ecl_model_name: item.model_name,
          module: String(item.module),
          module_name: String(item.module || ''),
          effective_date: item.effective_date,
          active_flag: item.active_flag ?? true,
          last_run_period: item.last_run_period,
          last_run_status: item.last_run_status,
          last_run_date: item.last_run_date,
          createdby: item.created_by,
          createddate: item.created_date,
          details: []
        };
      });
      console.log('✅ [ECL-API] Transformed Data:', transformed.length, 'records');
      return transformed;
    } catch (error) {
      console.error('Error fetching ECL configurations:', error);
      throw error;
    }
  },

  createHeader: async (data: Partial<ECLConfigHeader>): Promise<ECLConfigHeader> => {
    try {
      const result = await api.banking.eclConfigurations.create({
        modelName: data.ecl_model_name || '',
        effectiveDate: data.effective_date || new Date().toISOString(),
        activeFlag: data.active_flag ?? true,
        module: data.module,
        details: (data.details || []).map(normalizeDetailPayload)
      });
      if ((result as any)?.approvalRequired) {
        return result as any;
      }
      const payload: any = (result as any)?.data || result;
      return {
        pkid: payload.id,
        ecl_model_name: payload.model_name,
        module: payload.module || '',
        effective_date: payload.effective_date,
        active_flag: payload.active_flag,
        details: payload.details?.map((d: any) => ({
          pkid: d.id,
          ecl_model_id: payload.id,
          pf_segment_id: d.pf_segment_id,
          stage_rule_id: d.stage_rule_id,
          pd_model_id: d.pd_model_id,
          lgd_model_id: d.lgd_model_id,
          ead_model_id: d.ead_model_id,
          overlay_rate: d.overlay_rate,
          period_type: d.period_type,
          period_date: d.period_date
        })) || []
      };
    } catch (error) {
      console.error('Error creating ECL configuration:', error);
      throw error;
    }
  },

  updateHeader: async (pkid: number, data: Partial<ECLConfigHeader>): Promise<ECLConfigHeader> => {
    try {
      const result = await api.banking.eclConfigurations.update(pkid, {
        modelName: data.ecl_model_name,
        effectiveDate: data.effective_date,
        activeFlag: data.active_flag,
        module: data.module,
        ...(data.details ? { details: data.details.map(normalizeDetailPayload) } : {})
      });
      if ((result as any)?.approvalRequired) {
        return result as any;
      }
      const payload: any = (result as any)?.data || result;
      return {
        pkid: payload.id,
        ecl_model_name: payload.model_name,
        module: payload.module || '',
        effective_date: payload.effective_date,
        active_flag: payload.active_flag,
        details: payload.details?.map((d: any) => ({
          pkid: d.id,
          ecl_model_id: payload.id,
          pf_segment_id: d.pf_segment_id,
          stage_rule_id: d.stage_rule_id,
          pd_model_id: d.pd_model_id,
          lgd_model_id: d.lgd_model_id,
          ead_model_id: d.ead_model_id,
          overlay_rate: d.overlay_rate,
          period_type: d.period_type,
          period_date: d.period_date
        })) || []
      };
    } catch (error) {
      console.error('Error updating ECL configuration:', error);
      throw error;
    }
  },

  deleteHeader: async (pkid: number): Promise<any> => {
    try {
      return await api.banking.eclConfigurations.delete(pkid);
    } catch (error) {
      console.error('Error deleting ECL configuration:', error);
      throw error;
    }
  }
};

// Business parameters from live system


export default function ECLConfigurationPage() {
  const { hasAnyPermission } = usePermission();
  const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all']);
  const searchParams = useSearchParams();
  const bankingMode = (searchParams.get('mode') || 'conventional').toLowerCase();
  const [moduleOptions, setModuleOptions] = useState<LookupOption[]>([]);
  const [segmentOptions, setSegmentOptions] = useState<LookupOption[]>([]);
  const [stageRuleOptions, setStageRuleOptions] = useState<LookupOption[]>([]);
  const [pdModelOptions, setPdModelOptions] = useState<LookupOption[]>([]);
  const [lgdModelOptions, setLgdModelOptions] = useState<LookupOption[]>([]);
  const [eadModelOptions, setEadModelOptions] = useState<LookupOption[]>([]);
  const [periodTypeOptions, setPeriodTypeOptions] = useState<LookupOption[]>([]);

  // State management
  const [loading, setLoading] = useState(false);
  const [eclConfigs, setEclConfigs] = useState<ECLConfigHeader[]>([]);
  const [filteredConfigs, setFilteredConfigs] = useState<ECLConfigHeader[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedEclConfig, setSelectedEclConfig] = useState<ECLConfigHeader | null>(null);
  const [selectedPreviewConfig, setSelectedPreviewConfig] = useState<ECLConfigHeader | null>(null);
  const [selectedPreviewResult, setSelectedPreviewResult] = useState<ECLPreviewHeader | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState<string>('');
  const [currentTab, setCurrentTab] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [runStatus, setRunStatus] = useState<{ severity: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [runningConfigId, setRunningConfigId] = useState<number | null>(null);
  const [runningAll, setRunningAll] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewDetailLoading, setPreviewDetailLoading] = useState(false);
  const [previewResults, setPreviewResults] = useState<ECLPreviewHeader[]>([]);
  const [previewDetailResults, setPreviewDetailResults] = useState<ECLPreviewDetail[]>([]);
  const [approvalNotification, setApprovalNotification] = useState<ApprovalNotificationState>(createClosedApprovalNotification());
  const showApprovalConflict = useCallback((error: unknown, fallbackMessage: string) => {
    const notification = buildApprovalConflictNotification(error, fallbackMessage);
    if (!notification) return false;
    setApprovalNotification(notification);
    return true;
  }, []);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  });
  const [isViewOnly, setIsViewOnly] = useState(false);

  // Form data state
  const [headerFormData, setHeaderFormData] = useState<Partial<ECLConfigHeader>>(createEmptyHeaderFormData());

  const [detailFormData, setDetailFormData] = useState<Partial<ECLConfigDetail>>(createEmptyDetailFormData());

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadEclConfigurations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        moduleResponse,
        periodTypeResponse,
        segmentResponse,
        ruleResponse,
        pdResponse,
        lgdResponse,
        eadResponse,
        headers,
      ] = await Promise.all([
        api.banking.businessSetup.getHeaderDetails('B0024'),
        api.banking.businessSetup.getHeaderDetails('B0025'),
        api.banking.populationSegments.getAll({ active_flag: true, segment_type: ECL_PORTFOLIO_SEGMENT_TYPE }),
        bankingAPI.ruleBaseSetting.getHeaders({ limit: 200, active_flag: true, rule_type: ECL_STAGE_RULE_TYPE }),
        api.banking.pdConfigurations.getAll({ is_active: true }),
        api.banking.lgdConfigurations.getAll({ is_active: true }),
        api.banking.eadConfigurations.getAll({ is_active: true }),
        eclConfigurationAPI.getHeaders(),
      ]);

      const filteredSegments = filterPopulationSegmentsByType(
        filterRowsByBankingMode(segmentResponse, bankingMode),
        ECL_PORTFOLIO_SEGMENT_TYPE
      );
      const filteredStageRules = filterRowsByBankingMode(getResponseRows(ruleResponse), bankingMode);
      const filteredPdConfigs = filterRowsByBankingMode(pdResponse, bankingMode);
      const filteredLgdConfigs = filterRowsByBankingMode(lgdResponse, bankingMode);
      const filteredEadConfigs = filterRowsByBankingMode(eadResponse, bankingMode);

      const modules = normalizeBusinessSettingOptions(moduleResponse);
      const periodTypes = normalizeBusinessSettingOptions(periodTypeResponse);
      const segments = normalizePopulationSegmentOptions(filteredSegments);
      const segmentLookup = createLabelLookup(segments);
      const stageRules = normalizeRuleOptions(filteredStageRules);
      const pdModels = normalizeModelOptions(filteredPdConfigs, (config) => config.population_segment_id ?? config.segment_id, segmentLookup);
      const lgdModels = normalizeModelOptions(filteredLgdConfigs, (config) => config.segment_id, segmentLookup);
      const eadModels = normalizeModelOptions(filteredEadConfigs, (config) => config.segment_id, segmentLookup);

      setModuleOptions(modules);
      setPeriodTypeOptions(periodTypes);
      setSegmentOptions(segments);
      setStageRuleOptions(stageRules);
      setPdModelOptions(pdModels);
      setLgdModelOptions(lgdModels);
      setEadModelOptions(eadModels);

      const lookups = {
        modules: createLabelLookup(modules),
        segments: createLabelLookup(segments),
        stageRules: createLabelLookup(stageRules),
        pdModels: createLabelLookup(pdModels),
        lgdModels: createLabelLookup(lgdModels),
        eadModels: createLabelLookup(eadModels),
        periodTypes: createLabelLookup(periodTypes),
      };

      const hydratedConfigs = await Promise.all(
        headers.map(async (config) => {
          try {
            const detailResponse: any = await api.banking.eclConfigurations.getById(config.pkid);
            const detailPayload = detailResponse?.data || detailResponse;
            const details = hydrateEclDetails(detailPayload?.details || [], lookups);
            return {
              ...config,
              module_name: lookups.modules.get(String(config.module ?? '')) || config.module_name,
              details,
            };
          } catch (detailError) {
            console.warn('Failed to hydrate ECL details for config', config.pkid, detailError);
            return {
              ...config,
              module_name: lookups.modules.get(String(config.module ?? '')) || config.module_name,
              details: config.details || [],
            };
          }
        })
      );

      setEclConfigs(hydratedConfigs);
    } catch (error) {
      console.error('❌ [ECL-CONFIG] Error loading configurations:', error);
      setError('Failed to load ECL configurations. Please try again.');
      setEclConfigs([]);
    } finally {
      setLoading(false);
    }
  }, [bankingMode]);

  const loadConfigDetail = useCallback(async (configId: number): Promise<ECLConfigHeader | null> => {
    try {
      const response: any = await api.banking.eclConfigurations.getById(configId);
      const payload = response?.data || response;
      if (!payload) return null;

      const lookups = {
        modules: createLabelLookup(moduleOptions),
        segments: createLabelLookup(segmentOptions),
        stageRules: createLabelLookup(stageRuleOptions),
        pdModels: createLabelLookup(pdModelOptions),
        lgdModels: createLabelLookup(lgdModelOptions),
        eadModels: createLabelLookup(eadModelOptions),
        periodTypes: createLabelLookup(periodTypeOptions),
      };

      return {
        pkid: Number(payload.id),
        ecl_model_name: payload.model_name,
        module: String(payload.module || ''),
        module_name: lookups.modules.get(String(payload.module || '')) || String(payload.module || ''),
        effective_date: payload.effective_date,
        active_flag: payload.active_flag ?? true,
        last_run_period: payload.last_run_period,
        last_run_status: payload.last_run_status,
        last_run_date: payload.last_run_date,
        createdby: payload.created_by,
        createddate: payload.created_date,
        details: hydrateEclDetails(payload.details || [], lookups),
      };
    } catch (detailError) {
      console.error('Failed to load ECL configuration detail:', detailError);
      setError('Failed to load ECL configuration detail.');
      return null;
    }
  }, [eadModelOptions, lgdModelOptions, moduleOptions, pdModelOptions, periodTypeOptions, segmentOptions, stageRuleOptions]);

  // Load ECL configurations on component mount
  const loadPendingApprovals = useCallback(async () => {
    try {
      const response = await bankingAPI.approval.getPendingApprovals();
      const requests = Array.isArray(response) ? response : response.data || [];
      setPendingRequests(requests.filter((r: any) => r.entityType === 'ecl_configuration'));
    } catch (err) {
      console.error('Error loading pending approvals:', err);
    }
  }, []);

  useEffect(() => {
    loadEclConfigurations();
    loadPendingApprovals();
  }, [loadPendingApprovals]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = eclConfigs;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(config =>
        config.ecl_model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.module_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply module filter
    if (filterModule) {
      filtered = filtered.filter(config => config.module === filterModule);
    }

    setFilteredConfigs(filtered);
  }, [eclConfigs, searchTerm, filterModule]);

  // Form validation
  const validateForm = useCallback(() => {
    const result = validateWithSchema(eclConfigurationSchema, headerFormData);
    setFormErrors(result.errors);
    return result.success;
  }, [headerFormData]);

  const validateHeaderOnlyForm = useCallback(() => {
    const nextErrors: Record<string, string> = {};

    if (!headerFormData.ecl_model_name) {
      nextErrors.ecl_model_name = 'ECL Model Name is required';
    }

    if (!headerFormData.module) {
      nextErrors.module = 'Module is required';
    }

    if (!headerFormData.effective_date) {
      nextErrors.effective_date = 'Effective Date is required';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [headerFormData.ecl_model_name, headerFormData.effective_date, headerFormData.module]);

  // Handle form field changes
  const handleHeaderFieldChange = (field: string, value: any) => {
    setHeaderFormData(prev => ({ ...prev, [field]: value }));

    // Clear validation error for changed field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDetailFieldChange = (field: string, value: any) => {
    setDetailFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Add detail configuration
  const handleAddDetail = () => {
    const result = validateWithSchema(eclDetailConfigurationSchema, detailFormData);
    if (!result.success) {
      setFormErrors(prev => ({ ...prev, ...result.errors }));
      return;
    }

    const segmentInfo = segmentOptions.find(s => s.value === String(detailFormData.pf_segment_id));
    const stageRuleInfo = stageRuleOptions.find(r => r.value === String(detailFormData.stage_rule_id));
    const pdModelInfo = pdModelOptions.find(m => m.value === String(detailFormData.pd_model_id));
    const lgdModelInfo = lgdModelOptions.find(m => m.value === String(detailFormData.lgd_model_id));
    const eadModelInfo = eadModelOptions.find(m => m.value === String(detailFormData.ead_model_id));
    const periodTypeInfo = periodTypeOptions.find(t => String(t.value) === String(detailFormData.period_type));

    const newDetail: ECLConfigDetail = {
      pkid: Date.now(),
      ecl_model_id: selectedEclConfig?.pkid || 0,
      pf_segment_id: detailFormData.pf_segment_id as number,
      pf_segment_name: segmentInfo?.label,
      stage_rule_id: detailFormData.stage_rule_id as number,
      stage_rule_name: stageRuleInfo?.label,
      pd_model_id: detailFormData.pd_model_id as number,
      pd_model_name: pdModelInfo?.label,
      lgd_model_id: detailFormData.lgd_model_id as number,
      lgd_model_name: lgdModelInfo?.label,
      ead_model_id: detailFormData.ead_model_id as number,
      ead_model_name: eadModelInfo?.label,
      overlay_rate: detailFormData.overlay_rate as number,
      period_type: detailFormData.period_type as number,
      period_type_name: periodTypeInfo?.label,
      period_date: detailFormData.period_date || undefined,
      createdby: "current_user",
      createddate: new Date().toISOString().split('T')[0]
    };

    setHeaderFormData(prev => ({
      ...prev,
      details: [...(prev.details || []), newDetail]
    }));

    // Reset detail form
    setDetailFormData(createEmptyDetailFormData());
    setFormErrors(prev => ({
      ...prev,
      details: '',
      pf_segment_id: '',
      stage_rule_id: '',
      pd_model_id: '',
      lgd_model_id: '',
      ead_model_id: '',
      period_type: '',
      period_date: '',
    }));

    // Clear details error if exists
    if (formErrors.details) {
      setFormErrors(prev => ({ ...prev, details: '' }));
    }
  };

  // Remove detail configuration
  const handleRemoveDetail = (detailPkid: number) => {
    setHeaderFormData(prev => ({
      ...prev,
      details: (prev.details || []).filter(detail => detail.pkid !== detailPkid)
    }));
  };

  // CRUD operations
  const handleAdd = useCallback(() => {
    setSelectedEclConfig(null);
    setHeaderFormData(createEmptyHeaderFormData());
    setDetailFormData(createEmptyDetailFormData());
    setFormErrors({});
    setIsEditing(false);
    setIsViewOnly(false);
    setCurrentTab(0);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback(async (eclConfig: ECLConfigHeader) => {
    const detailConfig = await loadConfigDetail(eclConfig.pkid);
    if (!detailConfig) return;

    setSelectedEclConfig(detailConfig);
    setHeaderFormData({
      ecl_model_name: detailConfig.ecl_model_name,
      module: detailConfig.module,
      effective_date: detailConfig.effective_date,
      active_flag: detailConfig.active_flag,
      details: [...detailConfig.details]
    });
    setDetailFormData(createEmptyDetailFormData());
    setFormErrors({});
    setIsEditing(true);
    setIsViewOnly(false);
    setCurrentTab(0);
    setIsDialogOpen(true);
  }, [loadConfigDetail]);

  const handleView = useCallback(async (eclConfig: ECLConfigHeader) => {
    const detailConfig = await loadConfigDetail(eclConfig.pkid);
    if (!detailConfig) return;

    setSelectedEclConfig(detailConfig);
    setHeaderFormData({
      ecl_model_name: detailConfig.ecl_model_name,
      module: detailConfig.module,
      effective_date: detailConfig.effective_date,
      active_flag: detailConfig.active_flag,
      details: [...detailConfig.details]
    });
    setDetailFormData(createEmptyDetailFormData());
    setFormErrors({});
    setIsEditing(false);
    setIsViewOnly(true);
    setCurrentTab(0);
    setIsDialogOpen(true);
  }, [loadConfigDetail]);

  const handleSave = async () => {
    const isHeaderOnlyUpdate = isEditing && currentTab === 0;

    if (!(isHeaderOnlyUpdate ? validateHeaderOnlyForm() : validateForm())) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const saveData: Partial<ECLConfigHeader> = {
        ecl_model_name: headerFormData.ecl_model_name!,
        module: headerFormData.module!,
        effective_date: headerFormData.effective_date!,
        active_flag: headerFormData.active_flag!,
      };

      if (!isEditing || currentTab === 1) {
        saveData.details = headerFormData.details || [];
      }

      let savedConfig: any;

      if (isEditing && selectedEclConfig) {
        savedConfig = await eclConfigurationAPI.updateHeader(selectedEclConfig.pkid, saveData);
      } else {
        savedConfig = await eclConfigurationAPI.createHeader(saveData);
      }

      const isApprovalResponse = savedConfig?.approvalRequired || savedConfig?.status === 202;
      if (isApprovalResponse) {
        setApprovalNotification(buildApprovalNotification(savedConfig, 'Request submitted for approval'));
      } else {
        setSnackbar({
          open: true,
          message: isEditing ? 'ECL configuration updated' : 'ECL configuration created',
          type: 'success',
        });
      }

      // Reload all configurations to get the latest data
      await loadEclConfigurations();
      await loadPendingApprovals();

      setIsDialogOpen(false);
      setHeaderFormData(createEmptyHeaderFormData());
      setDetailFormData(createEmptyDetailFormData());
      setFormErrors({});
      setSelectedEclConfig(null);
      setIsViewOnly(false);

    } catch (error) {
      console.error('❌ [ECL-CONFIG] Error saving configuration:', error);
      if (!showApprovalConflict(error, 'Request submitted for approval')) {
        setError(isEditing ? 'Failed to update ECL configuration.' : 'Failed to create ECL configuration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = useCallback(async (eclConfig: ECLConfigHeader) => {
    if (!confirm(`Are you sure you want to delete ECL configuration "${eclConfig.ecl_model_name}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response: any = await eclConfigurationAPI.deleteHeader(eclConfig.pkid);
      const isApprovalResponse = response?.approvalRequired || response?.status === 202;
      if (isApprovalResponse) {
        setApprovalNotification(buildApprovalNotification(response, 'Deletion request submitted for approval'));
      } else {
        setSnackbar({
          open: true,
          message: 'ECL configuration deleted',
          type: 'success',
        });
      }

      // Reload all configurations to get the latest data
      await loadEclConfigurations();
      await loadPendingApprovals();
    } catch (error) {
      console.error('❌ [ECL-CONFIG] Error deleting configuration:', error);
      if (!showApprovalConflict(error, 'Deletion request submitted for approval')) {
        setError('Failed to delete ECL configuration.');
      }
    } finally {
      setLoading(false);
    }
  }, [loadEclConfigurations, loadPendingApprovals, showApprovalConflict]);

  const buildEclRunPayload = useCallback(async (eclConfig?: ECLConfigHeader) => {
    const processDate = new Date().toISOString().split('T')[0];
    let configHeader = eclConfig?.ecl_model_name?.trim() || '';
    let segmentIds: number[] = [];

    if (eclConfig?.pkid) {
      try {
        const configDetailResponse: any = await api.banking.eclConfigurations.getById(eclConfig.pkid);
        const configDetail = configDetailResponse?.data || configDetailResponse;
        configHeader = configHeader || String(configDetail?.model_name || '').trim();

        const detailRows = Array.isArray(configDetail?.details) ? configDetail.details : [];
        segmentIds = Array.from(
          new Set(
            detailRows
              .map((detail: any) => Number(detail?.pf_segment_id))
              .filter((id: number) => Number.isFinite(id) && id > 0)
          )
        );
      } catch (detailError) {
        console.warn('Failed to load ECL configuration details; continuing with header-only payload.', detailError);
      }
    }

    return {
      processDate,
      calculationType: 'full',
      recalculate: false,
      scenarios: ['Base', 'Optimistic', 'Pessimistic'],
      segmentIds,
      ...(configHeader ? { configHeader, eclModelName: configHeader } : {})
    };
  }, []);

  const handleRunEcl = useCallback(async (eclConfig: ECLConfigHeader) => {
    setRunStatus(null);
    setError(null);
    setRunningConfigId(eclConfig.pkid);

    try {
      const payload = await buildEclRunPayload(eclConfig);
      const response: any = await api.ifrs9.runECLPreviewCalculation(payload);

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to queue ECL calculation');
      }

      setRunStatus({
        severity: 'success',
        message: `ECL queued for "${eclConfig.ecl_model_name}" (Execution ID: ${response.executionId || response.jobId || '-'})`
      });
    } catch (runError: any) {
      setRunStatus({
        severity: 'error',
        message: runError?.message || 'Failed to run ECL calculation'
      });
    } finally {
      setRunningConfigId(null);
    }
  }, [buildEclRunPayload]);

  const handleRunAllEcl = useCallback(async () => {
    setRunStatus(null);
    setError(null);
    setRunningAll(true);

    try {
      const payload = await buildEclRunPayload();
      const response: any = await api.ifrs9.runECLPreviewCalculation(payload);

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to queue ECL calculation');
      }

      setRunStatus({
        severity: 'success',
        message: `ECL queued from ECL Configuration page (Execution ID: ${response.executionId || response.jobId || '-'})`
      });
    } catch (runError: any) {
      setRunStatus({
        severity: 'error',
        message: runError?.message || 'Failed to run all ECL calculations'
      });
    } finally {
      setRunningAll(false);
    }
  }, [buildEclRunPayload]);

  const handleLoadPreviewDetail = useCallback(
    async (configId: number, result: ECLPreviewHeader) => {
      const accountId = Number(result.account_id);
      if (!Number.isFinite(accountId)) {
        setPreviewDetailResults([]);
        setSelectedPreviewResult(result);
        return;
      }

      setPreviewDetailLoading(true);
      try {
        const response = await api.banking.eclConfigurations.getPreviewResultDetail(configId, accountId);
        const rows = Array.isArray(response)
          ? response
          : Array.isArray((response as any)?.data)
            ? (response as any).data
            : [];
        setSelectedPreviewResult(result);
        setPreviewDetailResults(rows as ECLPreviewDetail[]);
      } catch (previewError) {
        setPreviewDetailResults([]);
        setError(getErrorMessage(previewError, 'Failed to load ECL preview detail'));
      } finally {
        setPreviewDetailLoading(false);
      }
    },
    []
  );

  const handleOpenPreviewResults = useCallback(async (eclConfig: ECLConfigHeader) => {
    setSelectedPreviewConfig(eclConfig);
    setSelectedPreviewResult(null);
    setPreviewResults([]);
    setPreviewDetailResults([]);
    setPreviewLoading(true);
    setPreviewDetailLoading(false);
    setIsPreviewDialogOpen(true);
    setError(null);

    try {
      const response = await api.banking.eclConfigurations.getPreviewResults(eclConfig.pkid);
      const rows = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.data)
          ? (response as any).data
          : [];

      setPreviewResults(rows as ECLPreviewHeader[]);

      if (rows.length > 0) {
        await handleLoadPreviewDetail(eclConfig.pkid, rows[0] as ECLPreviewHeader);
      }
    } catch (previewError) {
      setError(getErrorMessage(previewError, 'Failed to load ECL preview results'));
    } finally {
      setPreviewLoading(false);
    }
  }, [handleLoadPreviewDetail]);

  const handleClosePreviewDialog = useCallback(() => {
    setIsPreviewDialogOpen(false);
    setSelectedPreviewConfig(null);
    setSelectedPreviewResult(null);
    setPreviewResults([]);
    setPreviewDetailResults([]);
    setPreviewLoading(false);
    setPreviewDetailLoading(false);
  }, []);

  const handleCloseConfigDialog = useCallback(() => {
    setIsDialogOpen(false);
    setFormErrors({});
    setIsViewOnly(false);
  }, []);

  // DataGrid columns
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'ecl_model_name',
      headerName: 'ECL Model Name',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EclIcon color="primary" fontSize="small" />
          <Typography variant="body2" fontWeight="medium">
            {params.value || 'Unnamed Model'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'module_name',
      headerName: 'Module',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value || params.row.module || 'Unknown'}
          size="small"
          color="primary"
          variant="outlined"
        />
      )
    },
    {
      field: 'effective_date',
      headerName: 'Effective Date',
      width: 130,
      renderCell: (params) => {
        if (!params.value) return '-';
        const date = new Date(params.value);
        return isNaN(date.getTime()) ? params.value : date.toLocaleDateString();
      }
    },
    {
      field: 'details',
      headerName: 'Total Segments',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value?.length || 0}
          size="small"
          color="info"
          variant="outlined"
        />
      )
    },
    {
      field: 'last_run_period',
      headerName: 'Last Run Period',
      width: 160,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {formatShortDate(params.row.last_run_period)}
        </Typography>
      )
    },
    {
      field: 'last_run_status',
      headerName: 'Last Run Status',
      width: 160,
      renderCell: (params) => (
        params.value ? (
          <Chip
            label={String(params.value).toUpperCase()}
            size="small"
            color="warning"
            variant="outlined"
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Not run
          </Typography>
        )
      )
    },
    {
      field: 'last_run_date',
      headerName: 'Last Run Date',
      width: 220,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {formatDateTime(params.value)}
        </Typography>
      )
    },
    {
      field: 'active_flag',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => {
        const isPending = pendingRequests.some(r => r.entityId === params.row.pkid?.toString());
        if (isPending) return <ApprovalStatusBadge status="pending" />;
        return (
          <Chip
            label={params.value ? 'Active' : 'Inactive'}
            size="small"
            color={params.value ? 'success' : 'error'}
            variant="outlined"
          />
        );
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 190,
      getActions: (params) => [
        <SafeGridActionsCellItem
          key="run"
          icon={<RunIcon />}
          label="Run ECL"
          onClick={() => handleRunEcl(params.row)}
          disabled={runningConfigId !== null || runningAll}
          color="primary"
        />,
        <SafeGridActionsCellItem
          key="preview-results"
          icon={<PreviewResultIcon color="secondary" />}
          label="Preview Result"
          data-testid="view-ecl-preview-btn"
          onClick={() => handleOpenPreviewResults(params.row)}
          color="inherit"
        />,
        <SafeGridActionsCellItem
          key="view"
          icon={<VisibilityIcon color="info" />}
          label="View Config"
          data-testid="view-ecl-config-btn"
          onClick={() => handleView(params.row)}
          color="inherit"
        />,
        <SafeGridActionsCellItem
          key="edit"
          icon={<EditIcon color="primary" />}
          label="Edit"
          data-testid="edit-ecl-config-btn"
          onClick={() => handleEdit(params.row)}
          color="primary"
        />,
        <SafeGridActionsCellItem
          key="delete"
          icon={<DeleteIcon color="error" />}
          label="Delete"
          data-testid="delete-ecl-config-btn"
          onClick={() => handleDelete(params.row)}
          color="error"
        />
      ]
    }
  ], [
    handleDelete,
    handleEdit,
    handleOpenPreviewResults,
    handleRunEcl,
    handleView,
    pendingRequests,
    runningAll,
    runningConfigId,
  ]);

  return (
    <ReportPageLayout
      title="ECL Configuration"
      description="Expected Credit Loss calculation configuration and management"
      icon={<EclIcon />}
      breadcrumbLabel="ECL Configuration"
      actionButtons={[
        {
          label: 'Schedule',
          icon: <ScheduleIcon />,
          onClick: () => console.log('Schedule ECL batch job'),
          variant: 'outlined',
        },
        {
          label: 'Refresh',
          icon: <RefreshIcon />,
          onClick: loadEclConfigurations,
          variant: 'outlined',
          disabled: loading,
          dataTestId: 'refresh-ecl-config-btn'
        },
        {
          label: 'Add ECL Configuration',
          icon: <AddIcon />,
          onClick: handleAdd,
          variant: 'contained',
          color: 'primary',
          dataTestId: 'add-ecl-config-btn'
        }
      ]}
    >
      {/* Statistics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <Box>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {eclConfigs.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ECL Models
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {eclConfigs.filter(c => c.active_flag).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Models
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {eclConfigs.reduce((sum, config) => sum + (config.details?.length || 0), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Segments
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {moduleOptions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available Modules
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {snackbar.open && (
        <Snackbar sx={{ mb: 3 }} open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.type} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {runStatus && (
        <Alert severity={runStatus.severity} sx={{ mb: 3 }} onClose={() => setRunStatus(null)}>
          {runStatus.message}
        </Alert>
      )}

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon />
            Search and Filters
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ flex: 4, minWidth: 200 }}>
              <TextField
                fullWidth
                label="Search ECL Configurations"
                placeholder="Search by model name, module..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="search-ecl-config-input"
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Box>
            <Box sx={{ flex: 3, minWidth: 150 }}>
              <FormControl fullWidth>
                <InputLabel>Filter by Module</InputLabel>
                <Select
                  value={filterModule}
                  label="Filter by Module"
                  onChange={(e) => setFilterModule(e.target.value as string)}
                  data-testid="filter-ecl-module-select"
                >
                  <MenuItem value="">All Modules</MenuItem>
                  {moduleOptions.map((module, idx) => (
                    <MenuItem key={`${module.value}-${idx}`} value={module.value}>
                      {module.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 3, minWidth: 150 }}>
              <Button
                variant="outlined"
                startIcon={<RunIcon />}
                fullWidth
                onClick={handleRunAllEcl}
                disabled={runningAll || runningConfigId !== null}
              >
                {runningAll ? 'Queueing...' : 'Run All ECL'}
              </Button>
            </Box>
            <Box sx={{ flex: 2, minWidth: 100 }}>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                size="small"
              >
                Export
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Data Grid */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ECL Configurations ({filteredConfigs.length})
          </Typography>
          <Box sx={{ height: 600, width: '100%' }}>
            <ReportDataGrid
              rows={filteredConfigs}
              columns={columns}
              getRowId={(row: any) => row.pkid}
              loading={loading}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } }
              }}
              disableRowSelectionOnClick
            />
          </Box>
        </CardContent>
      </Card>

      <ECLConfigDialog
        open={isDialogOpen}
        loading={loading}
        isViewOnly={isViewOnly}
        isEditing={isEditing}
        currentTab={currentTab}
        headerFormData={headerFormData}
        detailFormData={detailFormData}
        formErrors={formErrors}
        moduleOptions={moduleOptions}
        segmentOptions={segmentOptions}
        stageRuleOptions={stageRuleOptions}
        pdModelOptions={pdModelOptions}
        lgdModelOptions={lgdModelOptions}
        eadModelOptions={eadModelOptions}
        periodTypeOptions={periodTypeOptions}
        onClose={handleCloseConfigDialog}
        onSave={handleSave}
        onTabChange={setCurrentTab}
        onHeaderFieldChange={handleHeaderFieldChange}
        onDetailFieldChange={handleDetailFieldChange}
        onAddDetail={handleAddDetail}
        onRemoveDetail={handleRemoveDetail}
      />
      <ECLPreviewResultsDialog
        open={isPreviewDialogOpen}
        previewLoading={previewLoading}
        previewDetailLoading={previewDetailLoading}
        previewResults={previewResults}
        previewDetailResults={previewDetailResults}
        selectedPreviewConfig={selectedPreviewConfig}
        selectedPreviewResult={selectedPreviewResult}
        onClose={handleClosePreviewDialog}
        onDrillDown={(row) => {
          if (!selectedPreviewConfig) return;
          handleLoadPreviewDetail(selectedPreviewConfig.pkid, row);
        }}
      />
      <ApprovalNotification
        open={approvalNotification.open}
        message={approvalNotification.message}
        requestId={approvalNotification.requestId}
        actionLabel={canOpenApprovalInbox ? 'Open Approval' : undefined}
        actionHref={canOpenApprovalInbox ? (approvalNotification.requestId ? `/banking/maintenance/approval?requestId=${encodeURIComponent(approvalNotification.requestId)}` : '/banking/maintenance/approval') : undefined}
        onClose={() => setApprovalNotification(createClosedApprovalNotification())}
      />
    </ReportPageLayout>
  );
}
