// packages/frontend/src/app/banking/collective/ecl-config/page.tsx
// ============================================================================
// IFRS9 FRONTEND - ECL CONFIGURATION PAGE
// ============================================================================
// Database: frs9_imp_ca_ecl_configh (header) + frs9_imp_ca_ecl_configd (detail)
// Business Parameter: B0023 (Module), B0024 (Period Type), B0020 (Segment)
// Legacy Reference: Master-detail pattern for ECL Model configuration
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Typography,
  Container,
  Paper,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Calculate as EclIcon,
  Home as HomeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Download as ExportIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as RunIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useRouter } from 'next/navigation';

import { GridColDef, GridRowId, GridToolbar } from '@mui/x-data-grid';

// Safe DataGrid wrapper to prevent bundling issues
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { ApprovalNotification, ApprovalStatusBadge } from '@/components/approval';

// Premium Layout Components
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';
import ReportDataGrid from '@/components/ifrs9/ReportDataGrid';

// Types based on live database structure: frs9_imp_ca_ecl_configh + frs9_imp_ca_ecl_configd
interface ECLConfigHeader {
  pkid: number;
  ecl_model_name: string;
  module: string;
  module_name?: string;
  effective_date: string;
  active_flag: boolean;
  last_run_period?: string;
  last_run_status?: string;
  last_run_date?: string;
  createdby?: string;
  createddate?: string;
  updatedby?: string;
  updateddate?: string;
  details: ECLConfigDetail[];
}

interface ECLConfigDetail {
  pkid: number;
  ecl_model_id: number;
  pf_segment_id: number;
  pf_segment_name?: string;
  stage_rule_id: number;
  stage_rule_name?: string;
  pd_model_id: number;
  pd_model_name?: string;
  lgd_model_id: number;
  lgd_model_name?: string;
  ead_model_id: number;
  ead_model_name?: string;
  overlay_rate: number;
  period_type: number;
  period_type_name?: string;
  period_date?: string;
  createdby?: string;
  createddate?: string;
}
// Business parameters from live system
const mockModules = [
  { value: "1", label: "Commercial Module", code: "COMM" },
  { value: "2", label: "Treasury Module", code: "TREAS" },
  { value: "3", label: "Retail Module", code: "RETAIL" },
  { value: "4", label: "Corporate Module", code: "CORP" }
];

const mockSegments = [
  { value: 1, label: "All Segments", code: "ALL" },
  { value: 5, label: "Treasury - Gov Bonds", code: "TREAS_GOV" },
  { value: 6, label: "Treasury - Corporate Bonds", code: "TREAS_CORP" },
  { value: 13, label: "Factoring", code: "FACTORING" },
  { value: 16, label: "Repo", code: "REPO" },
  { value: 17, label: "Treasury", code: "TREASURY" }
];

const mockStageRules = [
  { value: 1, label: "Conservative Rule", code: "CONSERVATIVE" },
  { value: 2, label: "Standard Rule", code: "STANDARD" },
  { value: 3, label: "Aggressive Rule", code: "AGGRESSIVE" },
  { value: 5, label: "Low Risk Rule", code: "LOW_RISK" }
];

const mockPdModels = [
  { value: 1, label: "PD All Segment", code: "PD_ALL" },
  { value: 4, label: "PD Repo Model", code: "PD_REPO" },
  { value: 5, label: "PD Factoring Model", code: "PD_FACTORING" },
  { value: 6, label: "PD Treasury Model", code: "PD_TREASURY" }
];

const mockLgdModels = [
  { value: 1, label: "LGD All Segment", code: "LGD_ALL" },
  { value: 2, label: "LGD Factoring", code: "LGD_FACTORING" },
  { value: 3, label: "LGD Treasury", code: "LGD_TREASURY" }
];

const mockEadModels = [
  { value: 1, label: "EAD All Segment", code: "EAD_ALL" },
  { value: 2, label: "EAD Factoring", code: "EAD_FACTORING" },
  { value: 3, label: "EAD Repo", code: "EAD_REPO" },
  { value: 4, label: "EAD Treasury", code: "EAD_TREASURY" }
];

const mockPeriodTypes = [
  { value: 1, label: "Monthly", code: "MONTHLY" },
  { value: 2, label: "Quarterly", code: "QUARTERLY" },
  { value: 3, label: "Semi-Annual", code: "SEMI_ANNUAL" },
  { value: 4, label: "Annual", code: "ANNUAL" }
];

// API service for ECL Configuration - Use centralized api service
import { api } from '../../../../services/api';
import { bankingAPI } from '@/services/api';

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
        // Lookup module name from mockModules
        const moduleInfo = mockModules.find(m => m.value === String(item.module));

        return {
          pkid: Number(item.id), // Ensure number
          ecl_model_name: item.model_name,
          module: String(item.module),
          module_name: moduleInfo?.label || `Module ${item.module}`,
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
        details: (data.details || []).map(d => ({
          pfSegmentId: d.pf_segment_id,
          stageRuleId: d.stage_rule_id,
          pdModelId: d.pd_model_id,
          lgdModelId: d.lgd_model_id,
          eadModelId: d.ead_model_id,
          overlayRate: d.overlay_rate,
          periodType: d.period_type,
          periodDate: d.period_date
        }))
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
        details: (data.details || []).map(d => ({
          pfSegmentId: d.pf_segment_id,
          stageRuleId: d.stage_rule_id,
          pdModelId: d.pd_model_id,
          lgdModelId: d.lgd_model_id,
          eadModelId: d.ead_model_id,
          overlayRate: d.overlay_rate,
          periodType: d.period_type,
          periodDate: d.period_date
        }))
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
  const router = useRouter();

  // State management
  const [loading, setLoading] = useState(false);
  const [eclConfigs, setEclConfigs] = useState<ECLConfigHeader[]>([]);
  const [filteredConfigs, setFilteredConfigs] = useState<ECLConfigHeader[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedEclConfig, setSelectedEclConfig] = useState<ECLConfigHeader | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState<string>('');
  const [currentTab, setCurrentTab] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [approvalNotification, setApprovalNotification] = useState<{
    open: boolean;
    message: string;
    requestId?: string;
  }>({ open: false, message: '' });

  // Form data state
  const [headerFormData, setHeaderFormData] = useState<Partial<ECLConfigHeader>>({
    ecl_model_name: '',
    module: '',
    effective_date: '',
    active_flag: true,
    details: []
  });

  const [detailFormData, setDetailFormData] = useState<Partial<ECLConfigDetail>>({
    pf_segment_id: 0,
    stage_rule_id: 0,
    pd_model_id: 0,
    lgd_model_id: 0,
    ead_model_id: 0,
    overlay_rate: 100,
    period_type: 1,
    period_date: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  const loadEclConfigurations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eclConfigurationAPI.getHeaders();
      console.log('🔍 [ECL-CONFIG] Loaded ECL configurations:', data.length, 'records');
      setEclConfigs(data);
    } catch (error) {
      console.error('❌ [ECL-CONFIG] Error loading configurations:', error);
      setError('Failed to load ECL configurations. Please try again.');
      setEclConfigs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

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
    const errors: Record<string, string> = {};

    if (!headerFormData.ecl_model_name?.trim()) {
      errors.ecl_model_name = 'ECL Model Name is required';
    }

    if (!headerFormData.module?.trim()) {
      errors.module = 'Module is required';
    }

    if (!headerFormData.effective_date?.trim()) {
      errors.effective_date = 'Effective Date is required';
    }

    // Validate at least one detail entry
    if (!headerFormData.details || headerFormData.details.length === 0) {
      errors.details = 'At least one segment configuration is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [headerFormData]);

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
  };

  // Add detail configuration
  const handleAddDetail = () => {
    if (!detailFormData.pf_segment_id || !detailFormData.pd_model_id ||
      !detailFormData.lgd_model_id || !detailFormData.ead_model_id) {
      return;
    }

    const segmentInfo = mockSegments.find(s => s.value === detailFormData.pf_segment_id);
    const stageRuleInfo = mockStageRules.find(r => r.value === detailFormData.stage_rule_id);
    const pdModelInfo = mockPdModels.find(m => m.value === detailFormData.pd_model_id);
    const lgdModelInfo = mockLgdModels.find(m => m.value === detailFormData.lgd_model_id);
    const eadModelInfo = mockEadModels.find(m => m.value === detailFormData.ead_model_id);
    const periodTypeInfo = mockPeriodTypes.find(t => t.value === detailFormData.period_type);

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
    setDetailFormData({
      pf_segment_id: 0,
      stage_rule_id: 0,
      pd_model_id: 0,
      lgd_model_id: 0,
      ead_model_id: 0,
      overlay_rate: 100,
      period_type: 1,
      period_date: ''
    });

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
  const handleAdd = () => {
    setSelectedEclConfig(null);
    setHeaderFormData({
      ecl_model_name: '',
      module: '',
      effective_date: '',
      active_flag: true,
      details: []
    });
    setDetailFormData({
      pf_segment_id: 0,
      stage_rule_id: 0,
      pd_model_id: 0,
      lgd_model_id: 0,
      ead_model_id: 0,
      overlay_rate: 100,
      period_type: 1,
      period_date: ''
    });
    setFormErrors({});
    setIsEditing(false);
    setCurrentTab(0);
    setIsDialogOpen(true);
  };

  const handleEdit = (eclConfig: ECLConfigHeader) => {
    setSelectedEclConfig(eclConfig);
    setHeaderFormData({
      ecl_model_name: eclConfig.ecl_model_name,
      module: eclConfig.module,
      effective_date: eclConfig.effective_date,
      active_flag: eclConfig.active_flag,
      details: [...eclConfig.details]
    });
    setDetailFormData({
      pf_segment_id: 0,
      stage_rule_id: 0,
      pd_model_id: 0,
      lgd_model_id: 0,
      ead_model_id: 0,
      overlay_rate: 100,
      period_type: 1,
      period_date: ''
    });
    setFormErrors({});
    setIsEditing(true);
    setCurrentTab(0);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const saveData = {
        ecl_model_name: headerFormData.ecl_model_name!,
        module: headerFormData.module!,
        effective_date: headerFormData.effective_date!,
        active_flag: headerFormData.active_flag!,
        details: headerFormData.details || []
      };

      let savedConfig: any;

      if (isEditing && selectedEclConfig) {
        savedConfig = await eclConfigurationAPI.updateHeader(selectedEclConfig.pkid, saveData);
      } else {
        savedConfig = await eclConfigurationAPI.createHeader(saveData);
      }

      const isApprovalResponse = savedConfig?.approvalRequired || savedConfig?.status === 202;
      if (isApprovalResponse) {
        setApprovalNotification({
          open: true,
          message: savedConfig?.message || 'Request submitted for approval',
          requestId: savedConfig?.requestId
        });
      } else {
        console.log('✅ [ECL-CONFIG] Saved ECL configuration:', savedConfig?.pkid);
      }

      // Reload all configurations to get the latest data
      await loadEclConfigurations();
      await loadPendingApprovals();

      setIsDialogOpen(false);
      setHeaderFormData({});
      setDetailFormData({});
      setSelectedEclConfig(null);

    } catch (error) {
      console.error('❌ [ECL-CONFIG] Error saving configuration:', error);
      setError(isEditing ? 'Failed to update ECL configuration.' : 'Failed to create ECL configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eclConfig: ECLConfigHeader) => {
    if (!confirm(`Are you sure you want to delete ECL configuration "${eclConfig.ecl_model_name}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response: any = await eclConfigurationAPI.deleteHeader(eclConfig.pkid);
      const isApprovalResponse = response?.approvalRequired || response?.status === 202;
      if (isApprovalResponse) {
        setApprovalNotification({
          open: true,
          message: response?.message || 'Deletion request submitted for approval',
          requestId: response?.requestId
        });
      } else {
        console.log('✅ [ECL-CONFIG] Deleted ECL configuration:', eclConfig.pkid);
      }

      // Reload all configurations to get the latest data
      await loadEclConfigurations();
      await loadPendingApprovals();
    } catch (error) {
      console.error('❌ [ECL-CONFIG] Error deleting configuration:', error);
      setError('Failed to delete ECL configuration.');
    } finally {
      setLoading(false);
    }
  };

  // DataGrid columns
  const columns: GridColDef[] = [
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
      headerName: 'Segments',
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
      field: 'last_run_status',
      headerName: 'Last Run Status',
      width: 130,
      renderCell: (params) => (
        params.value ? (
          <Chip
            label={params.value}
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
      width: 150,
      getActions: (params) => [
        <SafeGridActionsCellItem
          key="run"
          icon={<RunIcon />}
          label="Run ECL"
          onClick={() => console.log('Run ECL calculation for', params.row.pkid)}
          color="primary"
        />,
        <SafeGridActionsCellItem
          key="edit"
          icon={<EditIcon color="primary" />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
          color="primary"
        />,
        <SafeGridActionsCellItem
          key="delete"
          icon={<DeleteIcon color="error" />}
          label="Delete"
          onClick={() => handleDelete(params.row)}
          color="error"
        />
      ]
    }
  ];

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
          disabled: loading
        },
        {
          label: 'Add ECL Configuration',
          icon: <AddIcon />,
          onClick: handleAdd,
          variant: 'contained',
          color: 'primary'
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
                  {mockModules.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Modules
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
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
                >
                  <MenuItem value="">All Modules</MenuItem>
                  {mockModules.map((module) => (
                    <MenuItem key={module.value} value={module.value}>
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
                onClick={() => console.log('Run all ECL calculations')}
              >
                Run All ECL
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

      {/* Add/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EclIcon />
          {isEditing ? 'Edit ECL Configuration' : 'Add ECL Configuration'}
        </DialogTitle>
        <DialogContent dividers>
          <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
            <Tab label="Header Information" />
            <Tab label="Segment Configuration" />
          </Tabs>

          {currentTab === 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                ECL Model Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                <Box sx={{ gridColumn: 'span 2' }}>
                  <TextField
                    fullWidth
                    label="ECL Model Name"
                    value={headerFormData.ecl_model_name || ''}
                    onChange={(e) => handleHeaderFieldChange('ecl_model_name', e.target.value)}
                    error={!!formErrors.ecl_model_name}
                    helperText={formErrors.ecl_model_name}
                    required
                  />
                </Box>

                <Box>
                  <FormControl fullWidth error={!!formErrors.module} required>
                    <InputLabel>Module</InputLabel>
                    <Select
                      value={headerFormData.module || ''}
                      label="Module"
                      onChange={(e) => handleHeaderFieldChange('module', e.target.value)}
                    >
                      {mockModules.map((module) => (
                        <MenuItem key={module.value} value={module.value}>
                          {module.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.module && (
                      <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>
                        {formErrors.module}
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                <Box>
                  <DatePicker
                    label="Effective Date"
                    value={headerFormData.effective_date ? new Date(headerFormData.effective_date as string) : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        const dateStr = newValue instanceof Date 
                          ? newValue.toISOString().split('T')[0] 
                          : (newValue as any).toISOString().split('T')[0];
                        handleHeaderFieldChange('effective_date', dateStr);
                      } else {
                        handleHeaderFieldChange('effective_date', '');
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!formErrors.effective_date,
                        helperText: formErrors.effective_date,
                        required: true,
                        InputLabelProps: { shrink: true }
                      }
                    }}
                  />
                </Box>

                <Box sx={{ gridColumn: 'span 2' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={headerFormData.active_flag || false}
                        onChange={(e) => handleHeaderFieldChange('active_flag', e.target.checked)}
                      />
                    }
                    label="Active Configuration"
                  />
                </Box>
              </Box>
            </Box>
          )}

          {currentTab === 1 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Add Segment Configuration
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, mb: 3 }}>
                <Box>
                  <FormControl fullWidth required>
                    <InputLabel>Segment</InputLabel>
                    <Select
                      value={detailFormData.pf_segment_id || ''}
                      label="Segment"
                      onChange={(e) => handleDetailFieldChange('pf_segment_id', e.target.value)}
                    >
                      {mockSegments.map((segment) => (
                        <MenuItem key={segment.value} value={segment.value}>
                          {segment.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <FormControl fullWidth>
                    <InputLabel>Stage Rule</InputLabel>
                    <Select
                      value={detailFormData.stage_rule_id || ''}
                      label="Stage Rule"
                      onChange={(e) => handleDetailFieldChange('stage_rule_id', e.target.value)}
                    >
                      {mockStageRules.map((rule) => (
                        <MenuItem key={rule.value} value={rule.value}>
                          {rule.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <FormControl fullWidth required>
                    <InputLabel>PD Model</InputLabel>
                    <Select
                      value={detailFormData.pd_model_id || ''}
                      label="PD Model"
                      onChange={(e) => handleDetailFieldChange('pd_model_id', e.target.value)}
                    >
                      {mockPdModels.map((model) => (
                        <MenuItem key={model.value} value={model.value}>
                          {model.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <FormControl fullWidth required>
                    <InputLabel>LGD Model</InputLabel>
                    <Select
                      value={detailFormData.lgd_model_id || ''}
                      label="LGD Model"
                      onChange={(e) => handleDetailFieldChange('lgd_model_id', e.target.value)}
                    >
                      {mockLgdModels.map((model) => (
                        <MenuItem key={model.value} value={model.value}>
                          {model.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <FormControl fullWidth required>
                    <InputLabel>EAD Model</InputLabel>
                    <Select
                      value={detailFormData.ead_model_id || ''}
                      label="EAD Model"
                      onChange={(e) => handleDetailFieldChange('ead_model_id', e.target.value)}
                    >
                      {mockEadModels.map((model) => (
                        <MenuItem key={model.value} value={model.value}>
                          {model.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Overlay Rate (%)"
                    type="number"
                    value={detailFormData.overlay_rate || ''}
                    onChange={(e) => handleDetailFieldChange('overlay_rate', Number(e.target.value))}
                    inputProps={{ min: 0, max: 500, step: 1 }}
                  />
                </Box>

                <Box sx={{ gridColumn: 'span 2' }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddDetail}
                    disabled={!detailFormData.pf_segment_id || !detailFormData.pd_model_id ||
                      !detailFormData.lgd_model_id || !detailFormData.ead_model_id}
                  >
                    Add Segment Configuration
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Current Segment Configurations ({(headerFormData.details || []).length})
              </Typography>

              {formErrors.details && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formErrors.details}
                </Alert>
              )}

              {(headerFormData.details || []).map((detail, index) => (
                <Accordion key={detail.pkid}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={index + 1} size="small" />
                      {detail.pf_segment_name} - PD: {detail.pd_model_name}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveDetail(detail.pkid);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2"><strong>Segment:</strong> {detail.pf_segment_name}</Typography>
                        <Typography variant="body2"><strong>Stage Rule:</strong> {detail.stage_rule_name || 'Default'}</Typography>
                        <Typography variant="body2"><strong>PD Model:</strong> {detail.pd_model_name}</Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2"><strong>LGD Model:</strong> {detail.lgd_model_name}</Typography>
                        <Typography variant="body2"><strong>EAD Model:</strong> {detail.ead_model_name}</Typography>
                        <Typography variant="body2"><strong>Overlay Rate:</strong> {detail.overlay_rate}%</Typography>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {isEditing ? 'Update' : 'Create'} Configuration
          </Button>
        </DialogActions>
      </Dialog>
      <ApprovalNotification
        open={approvalNotification.open}
        message={approvalNotification.message}
        requestId={approvalNotification.requestId}
        onClose={() => setApprovalNotification({ ...approvalNotification, open: false })}
      />
    </ReportPageLayout>
  );
}
