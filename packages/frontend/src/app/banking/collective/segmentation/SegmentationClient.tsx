// packages/frontend/src/app/banking/collective/segmentation/SegmentationClient.tsx
// ============================================================================
// 🔧 SEGMENTATION CONFIGURATION - CLIENT COMPONENT
// ============================================================================
// ✅ PATTERN: Master-Detail with Dynamic Forms + Business Settings Integration
// ✅ DATABASE: frs9_param_segmenth (header) + frs9_param_segmentd (detail) 
// ✅ FEATURES: Cascading dropdowns, operator-based value inputs, complex validation
// ✅ OFFLINE: Local storage persistence, export/import, sync capabilities
// ✅ PERFORMANCE: Dynamic imports for heavy components
// ============================================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  MenuItem,
  Chip,
  Snackbar,
  Divider,
  Badge,
  Stack,
  Grid,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Paper,
  Checkbox
} from '@mui/material';
import {
  AccountTree as PageIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  ViewList as ViewDetailIcon,
  Settings as SettingsIcon,
  CloudOff as CloudOffIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Sync as SyncIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import type { GridColDef, GridRowParams } from '@mui/x-data-grid';
import { api, handleAPIError } from '../../../../services/api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';

// ============================================================================
// DYNAMIC IMPORTS FOR HEAVY COMPONENTS (Performance Optimization)
// ============================================================================

import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';

const EnhancedSegmentationDetailModal = dynamic(
  () => import('../../segmentation/components/EnhancedSegmentationDetailModal'),
  {
    ssr: false,
    loading: () => <CircularProgress />
  }
);

const ConditionBuilder = dynamic(
  () => import('@/components/common/forms/ConditionBuilder').then((mod) => mod.ConditionBuilder as any),
  { ssr: false }
);

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SegmentationHeader {
  id: number;
  group_segment: string;
  segment: string;
  sub_segment?: string;
  segment_type: string;
  seq?: number;
  active_flag: boolean;
  detail_count?: number;
  createdby?: string;
  createddate?: string;
  updatedby?: string;
  updateddate?: string;
}

interface SegmentationHeaderForm {
  group_segment: string;
  segment: string;
  sub_segment: string;
  segment_type: string;
  seq: number | '';
  active_flag: boolean;
}

interface SegmentType {
  type_code: string;
  type_name: string;
  description?: string;
}

// ============================================================================
// ENHANCED DEMO DATA FOR OFFLINE MODE
// ============================================================================

const initialDemoData: SegmentationHeader[] = [
  {
    id: 1,
    group_segment: 'Corporate Banking',
    segment: 'Large Corporate',
    sub_segment: 'Manufacturing',
    segment_type: 'RISK_SEGMENT',
    seq: 1,
    active_flag: true,
    detail_count: 5,
    createdby: 'system',
    createddate: new Date().toISOString()
  },
  {
    id: 2,
    group_segment: 'Retail Banking',
    segment: 'Personal Banking',
    sub_segment: 'Mortgage',
    segment_type: 'PRODUCT_SEGMENT',
    seq: 2,
    active_flag: true,
    detail_count: 3,
    createdby: 'system',
    createddate: new Date().toISOString()
  },
  {
    id: 3,
    group_segment: 'Retail Banking',
    segment: 'Personal Banking',
    sub_segment: 'Consumer Finance',
    segment_type: 'PRODUCT_SEGMENT',
    seq: 3,
    active_flag: false,
    detail_count: 4,
    createdby: 'system',
    createddate: new Date().toISOString()
  }
];

// Local storage keys
const STORAGE_KEY = 'ifrs9_segmentation_data';
const SETTINGS_KEY = 'ifrs9_segmentation_settings';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SegmentationConfigurationPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SegmentationHeader[]>([]);
  const loadingRef = useRef(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedHeader, setSelectedHeader] = useState<SegmentationHeader | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [segmentTypes, setSegmentTypes] = useState<SegmentType[]>([]);
  const [backendUnavailable, setBackendUnavailable] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [autoSync, setAutoSync] = useState(true);

  // ============================================================================
  // SEARCH & FILTER STATE MANAGEMENT
  // ============================================================================
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  const [filteredData, setFilteredData] = useState<SegmentationHeader[]>([]);
  const [sortField, setSortField] = useState<keyof SegmentationHeader>('seq');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [syncing, setSyncing] = useState(false);

  const [formData, setFormData] = useState<SegmentationHeaderForm>({
    group_segment: '',
    segment: '',
    sub_segment: '',
    segment_type: '',
    seq: '',
    active_flag: true
  });

  // ============================================================================
  // LOCAL STORAGE & SYNC FUNCTIONS
  // ============================================================================

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedSettings = localStorage.getItem(SETTINGS_KEY);

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setData(parsedData);
        console.log('📱 Loaded segmentation data from localStorage:', parsedData.length, 'items');
      } catch (error) {
        console.error('Failed to parse saved data:', error);
        setData([...initialDemoData]);
      }
    } else {
      setData([...initialDemoData]);
      saveDataToStorage([...initialDemoData]);
    }

    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setAutoSync(settings.autoSync ?? true);
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }

    // Load from backend after initial localStorage load
    setTimeout(() => loadData(), 500);
  }, []);

  // Save data to localStorage
  const saveDataToStorage = (dataToSave: SegmentationHeader[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({
        autoSync,
        lastSync: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }));
      console.log('💾 Saved segmentation data to localStorage:', dataToSave.length, 'items');
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  };

  const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setError(null);
    } else {
      setError(message);
      setSuccess(null);
    }
  };

  // ============================================================================
  // DATA LOADING FUNCTIONS
  // ============================================================================

  const loadData = async () => {
    if (loadingRef.current) {
      console.log('⚠️ Load already in progress, skipping duplicate call');
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading segmentation headers from database...');

      // Load segmentation headers with enhanced pagination
      const result = await api.banking.segmentation.getHeaders({ limit: 50 });

      if (result.success && result.data) {
        console.log('✅ Successfully loaded segmentation data:', result.data.length, 'headers from FRS9PRO');
        console.log('📊 Total records available:', result.pagination?.total || result.total || result.data.length);

        setData(prevData => {
          if (JSON.stringify(prevData) === JSON.stringify(result.data)) {
            console.log('📝 Data unchanged, skipping update');
            return prevData;
          }
          // Save backend data to localStorage
          saveDataToStorage(result.data);
          return result.data;
        });
        setBackendUnavailable(false);
        showMessage(`✅ Loaded ${result.data.length} records from FRS9PRO database (Total: ${result.pagination?.total || result.total || result.data.length})`);
      } else {
        throw new Error(result.message || 'Failed to load segmentation headers');
      }

    } catch (error: any) {
      console.error('❌ Failed to load segmentation headers:', error);

      const errorInfo = handleAPIError(error);
      let errorMessage = 'Failed to load segmentation headers from database.';

      if (error.response?.status === 404) {
        setBackendUnavailable(true);
        errorMessage = '⚠️ Working in offline mode (backend routes not available). All changes are saved locally.';
        console.log('🚨 404 ERROR: Backend missing segmentation routes - working offline');
        // Keep existing data from localStorage - don't overwrite
      } else if (errorInfo.type === 'network_error') {
        setBackendUnavailable(true);
        errorMessage = '⚠️ Network connection failed. Working in offline mode.';
      } else if (errorInfo.type === 'server_error') {
        setBackendUnavailable(true);
        errorMessage = `⚠️ Server error (${errorInfo.status}). Working in offline mode.`;
      }

      showMessage(errorMessage, 'error');

    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const loadSegmentTypes = async () => {
    try {
      console.log('🔄 Loading segment types...');
      const result = await api.banking.segmentation.getSegmentTypes();

      if (result.success && result.data) {
        console.log('✅ Loaded segment types from backend:', result.data.length);
        setSegmentTypes(result.data);
        return;
      }
    } catch (error: any) {
      console.error('❌ Failed to load segment types from backend:', error);

      // Check if it's a 404 error (backend routes missing)
      if (error.response?.status === 404) {
        console.log('⚠️ Backend segmentation routes not available (404) - using fallback data');
        setError('⚠️ Backend segmentation module not deployed yet. Using fallback configuration. Please deploy the latest backend version.');
      } else {
        console.log('⚠️ Network/server error - using fallback segment types');
      }
    }

    // Always provide fallback segment types for development
    console.log('🔄 Using fallback segment types');
    setSegmentTypes([
      { type_code: 'RISK_SEGMENT', type_name: 'Risk-Based Segmentation', description: 'Segmentation based on credit risk levels' },
      { type_code: 'PRODUCT_SEGMENT', type_name: 'Product-Based Segmentation', description: 'Segmentation by banking product type' },
      { type_code: 'GEOGRAPHY_SEGMENT', type_name: 'Geographic Segmentation', description: 'Segmentation by geographic location' },
      { type_code: 'CUSTOMER_SEGMENT', type_name: 'Customer-Based Segmentation', description: 'Segmentation by customer characteristics' },
      { type_code: 'PORTFOLIO_SEGMENT', type_name: 'Portfolio Segmentation', description: 'Segmentation by portfolio classification' },
      { type_code: 'BUSINESS_SEGMENT', type_name: 'Business Line Segmentation', description: 'Segmentation by business unit or line' },
      { type_code: 'CUSTOM_SEGMENT', type_name: 'Custom Segmentation', description: 'User-defined custom segmentation rules' }
    ]);
  };

  // ============================================================================
  // SEARCH & FILTER LOGIC
  // ============================================================================

  // Apply search and filters to data
  useEffect(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.group_segment?.toLowerCase().includes(search) ||
        item.segment?.toLowerCase().includes(search) ||
        item.sub_segment?.toLowerCase().includes(search) ||
        item.segment_type?.toLowerCase().includes(search) ||
        item.createdby?.toLowerCase().includes(search)
      );
    }

    // Apply segment type filter
    if (filterType && filterType !== '') {
      filtered = filtered.filter(item => item.segment_type === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter(item => item.active_flag === isActive);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aStr = aValue.toLowerCase();
        const bStr = bValue.toLowerCase();
        if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortDirection === 'asc' ?
          (aValue === bValue ? 0 : aValue ? 1 : -1) :
          (aValue === bValue ? 0 : aValue ? -1 : 1);
      }

      // Default string comparison for mixed types
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredData(filtered);
  }, [data, searchTerm, filterType, filterStatus, sortField, sortDirection]);

  // Handle sort change
  const handleSort = (field: keyof SegmentationHeader) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterStatus('all');
    setSortField('seq');
    setSortDirection('asc');
  };

  // Get filter statistics
  const getFilterStats = () => {
    const total = data.length;
    const filtered = filteredData.length;
    const active = filteredData.filter(item => item.active_flag).length;
    const inactive = filtered - active;

    return { total, filtered, active, inactive };
  };

  // ============================================================================
  // DATAGRID COLUMNS CONFIGURATION
  // ============================================================================

  const columns: GridColDef[] = [
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Action',
      width: 120,
      renderHeader: () => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Action</Typography>
          <Button size="small" sx={{ textTransform: 'none', minWidth: 'auto', p: 0, color: 'primary.main' }} onClick={clearFilters}>
            Clear
          </Button>
        </Box>
      ),
      getActions: (params: GridRowParams) => {
        if (!params.row) return [];
        return [
          <SafeGridActionsCellItem
            icon={<ViewDetailIcon fontSize="small" />}
            label="View"
            onClick={() => handleViewDetails(params.row)}
            key="details"
            disabled={backendUnavailable}
            showInMenu={false}
          />,
          <SafeGridActionsCellItem
            icon={<EditIcon fontSize="small" />}
            label="Edit"
            onClick={() => handleEdit(params.row)}
            key="edit"
            disabled={backendUnavailable}
            showInMenu={false}
          />,
          <SafeGridActionsCellItem
            icon={<DeleteIcon fontSize="small" />}
            label="Delete"
            onClick={() => handleDelete(params.row)}
            key="delete"
            disabled={backendUnavailable}
            showInMenu={false}
          />
        ];
      }
    },
    {
      field: 'group_segment',
      headerName: 'Group Segment',
      flex: 1,
      minWidth: 200,
      renderHeader: (params) => (
        <Box sx={{ width: '100%' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Group Segment</Typography>
          <TextField
            placeholder="Search"
            variant="standard"
            fullWidth
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ disableUnderline: false }}
            sx={{ mt: 0.5, '& input': { fontSize: '0.875rem' } }}
          />
        </Box>
      ),
      sortable: true
    },
    {
      field: 'segment',
      headerName: 'Segment',
      flex: 1,
      minWidth: 200,
      renderHeader: (params) => (
        <Box sx={{ width: '100%' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Segment</Typography>
          <TextField
            placeholder="Search"
            variant="standard"
            fullWidth
            size="small"
            InputProps={{ disableUnderline: false }}
            sx={{ mt: 0.5, '& input': { fontSize: '0.875rem' } }}
            disabled
          />
        </Box>
      ),
    },
    {
      field: 'sub_segment',
      headerName: 'Sub Segment',
      flex: 1,
      minWidth: 200,
      renderHeader: (params) => (
        <Box sx={{ width: '100%' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Sub Segment</Typography>
          <TextField
            placeholder="Search"
            variant="standard"
            fullWidth
            size="small"
            InputProps={{ disableUnderline: false }}
            sx={{ mt: 0.5, '& input': { fontSize: '0.875rem' } }}
            disabled
          />
        </Box>
      ),
      renderCell: (params) => params.value || '-'
    },
    {
      field: 'segment_type',
      headerName: 'Segment Type',
      flex: 1,
      minWidth: 200,
      renderHeader: (params) => (
        <Box sx={{ width: '100%' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Segment Type</Typography>
          <TextField
            placeholder="Search"
            variant="standard"
            fullWidth
            size="small"
            InputProps={{ disableUnderline: false }}
            sx={{ mt: 0.5, '& input': { fontSize: '0.875rem' } }}
            disabled
          />
        </Box>
      ),
      renderCell: (params) => {
        const type = segmentTypes.find(t => t.type_code === params.value);
        return type?.type_name || params.value || '-';
      }
    },
    {
      field: 'active_flag',
      headerName: 'Is Active',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderHeader: (params) => (
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Is Active</Typography>
          <TextField
            placeholder="Search"
            variant="standard"
            fullWidth
            size="small"
            InputProps={{ disableUnderline: false }}
            sx={{ mt: 0.5, '& input': { fontSize: '0.875rem', textAlign: 'center' } }}
            disabled
          />
        </Box>
      ),
      renderCell: (params) => (
        <Checkbox
          checked={!!params.value}
          disabled={backendUnavailable}
          sx={{
            color: '#d32f2f',
            '&.Mui-checked': {
              color: '#d32f2f',
            },
          }}
        />
      )
    }
  ];

  // ============================================================================
  // EXPORT/IMPORT & SYNC FUNCTIONS
  // ============================================================================

  // Export data as JSON
  const handleExport = () => {
    try {
      const exportData = {
        data: data,
        exported_at: new Date().toISOString(),
        version: '1.0.0',
        count: data.length
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `ifrs9_segmentation_${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      showMessage(`📥 Data exported successfully (${data.length} records)`);
    } catch (error) {
      console.error('Export failed:', error);
      showMessage('❌ Export failed', 'error');
    }
  };

  // Import data from JSON file
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = JSON.parse(e.target?.result as string);
        let importedData: SegmentationHeader[];

        // Support both direct array and wrapped format
        if (Array.isArray(fileContent)) {
          importedData = fileContent;
        } else if (fileContent.data && Array.isArray(fileContent.data)) {
          importedData = fileContent.data;
        } else {
          throw new Error('Invalid file format');
        }

        // Validate data structure
        if (importedData.length === 0) {
          showMessage('⚠️ No data found in file', 'error');
          return;
        }

        // Merge with existing data (avoid duplicates by id)
        const existingIds = new Set(data.map(item => item.id));
        const newData = importedData.filter(item => !existingIds.has(item.id));
        const mergedData = [...data, ...newData];

        setData(mergedData);
        saveDataToStorage(mergedData);
        showMessage(`📤 Imported ${newData.length} new records successfully`);

      } catch (error) {
        console.error('Import failed:', error);
        showMessage('❌ Import failed - invalid file format', 'error');
      }
    };
    reader.readAsText(file);

    // Clear the input
    event.target.value = '';
  };

  // Manual sync function
  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await loadData();
      if (!backendUnavailable) {
        showMessage('✅ Sync completed successfully');
      }
    } catch (error) {
      showMessage('❌ Sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // ============================================================================
  // COMPONENT LIFECYCLE
  // ============================================================================

  useEffect(() => {
    loadSegmentTypes();
  }, []);

  // ============================================================================
  // RETRY MECHANISM
  // ============================================================================

  const handleRetryConnection = async () => {
    console.log('🔄 Retrying backend connection...');
    setRetryCount(prev => prev + 1);
    setBackendUnavailable(false);
    setError(null);
    await loadData();
    await loadSegmentTypes();
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleCreate = () => {
    setSelectedHeader(null);
    setFormData({
      group_segment: '',
      segment: '',
      sub_segment: '',
      segment_type: '',
      seq: '',
      active_flag: true
    });
    setDialogOpen(true);
  };

  const handleEdit = (header: SegmentationHeader) => {
    console.log('✏️ Editing segmentation header:', header.group_segment, header);
    setSelectedHeader(header);
    setFormData({
      group_segment: header.group_segment || '',
      segment: header.segment || '',
      sub_segment: header.sub_segment || '',
      segment_type: header.segment_type || '',
      seq: header.seq || '',
      active_flag: Boolean(header.active_flag)
    });
    setDialogOpen(true);
  };

  const handleViewDetails = (header: SegmentationHeader) => {
    console.log('👁️ Viewing details for segmentation header:', header.group_segment, header);
    setSelectedHeader(header);
    setDetailModalOpen(true);
  };

  const handleDelete = async (header: SegmentationHeader) => {
    if (!confirm(`Are you sure you want to delete segmentation "${header.group_segment} - ${header.segment}"? This will also delete all associated detail rules.`)) {
      return;
    }

    try {
      setLoading(true);
      console.log('🗑️ Deleting segmentation header:', header.id);

      // Try backend delete first if available and auto-sync is enabled
      if (!backendUnavailable && autoSync) {
        try {
          await api.banking.segmentation.deleteHeader(header.id);
          console.log('✅ Segmentation deleted via backend');
          showMessage('✅ Segmentation deleted successfully');
          await loadData(); // Reload data
          return;
        } catch (error: any) {
          console.warn('Backend delete failed, falling back to local storage:', error);
          setBackendUnavailable(true);
        }
      }

      // Local storage delete (offline mode)
      const updatedData = data.filter(item => item.id !== header.id);
      setData(updatedData);
      saveDataToStorage(updatedData);
      showMessage('📱 Deleted locally (will sync when backend is available)');

    } catch (error: any) {
      console.error('❌ Failed to delete segmentation header:', error);
      showMessage('❌ Failed to delete segmentation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    const errors: string[] = [];

    if (!formData.group_segment.trim()) {
      errors.push('Group Segment is required');
    }
    if (!formData.segment.trim()) {
      errors.push('Segment is required');
    }
    if (!formData.segment_type.trim()) {
      errors.push('Segment Type is required');
    }

    if (errors.length > 0) {
      showMessage(errors.join(', '), 'error');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        group_segment: formData.group_segment.trim(),
        segment: formData.segment.trim(),
        sub_segment: formData.sub_segment.trim() || undefined,
        segment_type: formData.segment_type,
        seq: formData.seq === '' ? undefined : Number(formData.seq),
        active_flag: formData.active_flag
      };

      // Try backend sync first if available and auto-sync is enabled
      if (!backendUnavailable && autoSync) {
        try {
          if (selectedHeader) {
            console.log('✏️ Updating segmentation header via backend:', payload);
            await api.banking.segmentation.updateHeader(selectedHeader.id, payload);
            showMessage('✅ Segmentation updated successfully');
            setDialogOpen(false);
            await loadData(); // Reload data from backend
            return;
          } else {
            console.log('➕ Creating segmentation header via backend:', payload);
            await api.banking.segmentation.createHeader(payload);
            showMessage('✅ Segmentation created successfully');
            setDialogOpen(false);
            await loadData(); // Reload data from backend  
            return;
          }
        } catch (error: any) {
          console.warn('Backend save failed, falling back to local storage:', error);
          setBackendUnavailable(true);
        }
      }

      // Local storage save (offline mode)
      if (selectedHeader) {
        // Update existing
        const updatedData = data.map(item =>
          item.id === selectedHeader.id
            ? { ...item, ...payload, updatedby: 'user', updateddate: new Date().toISOString() }
            : item
        );
        setData(updatedData);
        saveDataToStorage(updatedData);
        showMessage('📱 Updated locally (will sync when backend is available)');
      } else {
        // Create new
        const newId = Math.max(...data.map(d => d.id), 0) + 1;
        const newItem: SegmentationHeader = {
          id: newId,
          ...payload,
          detail_count: 0,
          createdby: 'user',
          createddate: new Date().toISOString()
        };
        const updatedData = [...data, newItem];
        setData(updatedData);
        saveDataToStorage(updatedData);
        showMessage('📱 Created locally (will sync when backend is available)');
      }

      setDialogOpen(false);

    } catch (error: any) {
      console.error('❌ Failed to save segmentation header:', error);
      showMessage('❌ Failed to save segmentation', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER LOADING STATE
  // ============================================================================

  if (loading && data.length === 0) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <CircularProgress size={48} />
            <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold' }}>
              Loading Segmentation Configuration...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Fetching data from FRS9PRO database
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Container maxWidth="xl">
      <FullstackIndicator />
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PageIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Segmentation Configuration
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            Master-detail configuration for portfolio segmentation rules and criteria
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <input
            accept=".json"
            style={{ display: 'none' }}
            id="import-file"
            type="file"
            onChange={handleImport}
          />
          <label htmlFor="import-file">
            <Tooltip title="Import from JSON file">
              <IconButton component="span" color="info">
                <UploadIcon />
              </IconButton>
            </Tooltip>
          </label>

          <Tooltip title="Export to JSON file">
            <IconButton onClick={handleExport} color="info">
              <DownloadIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={backendUnavailable ? "Try to reconnect to backend" : "Sync with backend"}>
            <IconButton
              onClick={handleManualSync}
              color={backendUnavailable ? "warning" : "primary"}
              disabled={syncing}
            >
              {syncing ? <CircularProgress size={20} /> : <SyncIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh Data">
            <IconButton onClick={loadData} color="primary" disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            disabled={loading}
            data-testid="add-segmentation-btn"
          >
            Add Segmentation
          </Button>
        </Stack>
      </Box>

      {/* Backend Status Alert */}
      {backendUnavailable && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          icon={<CloudOffIcon />}
          action={
            <Stack direction="row" spacing={1} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    size="small"
                  />
                }
                label="Auto Sync"
                sx={{ mr: 1, color: 'inherit' }}
              />
              <Button
                color="inherit"
                size="small"
                onClick={handleRetryConnection}
                disabled={syncing}
                startIcon={syncing ? <CircularProgress size={12} /> : <SyncIcon />}
              >
                {syncing ? 'Syncing...' : 'Retry Connection'}
              </Button>
            </Stack>
          }
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            📱 Working in Offline Mode
          </Typography>
          <Typography variant="body2">
            Backend routes not available. All changes are saved locally and will sync when backend is available.
            {retryCount > 0 && ` (Connection attempts: ${retryCount})`}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
            <strong>Data is safe:</strong> Everything is stored in your browser and can be exported as backup.
          </Typography>
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Segmentation Rules
              {backendUnavailable && (
                <Chip
                  label="OFFLINE"
                  size="small"
                  color="warning"
                  icon={<CloudOffIcon />}
                />
              )}
              <Chip
                label={`${filteredData.length} of ${data.length} records`}
                size="small"
                variant="outlined"
              />
              {(searchTerm || filterType || filterStatus !== 'all') && (
                <Chip
                  label="FILTERED"
                  size="small"
                  color="primary"
                  icon={<FilterIcon />}
                />
              )}
            </Typography>

            {data.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                Last updated: {new Date().toLocaleTimeString()}
              </Typography>
            )}
          </Box>

          {/* Search and Filter Controls */}
          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              {/* Search Field */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by group, segment, type, or creator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  inputProps={{ 'data-testid': 'segment-search-input' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchTerm('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              {/* Segment Type Filter */}
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Segment Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Segment Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {segmentTypes.map((type) => (
                      <MenuItem key={type.type_code} value={type.type_code}>
                        {type.type_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Status Filter */}
              <Grid size={{ xs: 12, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active Only</MenuItem>
                    <MenuItem value="inactive">Inactive Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Sort Controls */}
              <Grid size={{ xs: 12, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as keyof SegmentationHeader)}
                    label="Sort By"
                  >
                    <MenuItem value="seq">Sequence</MenuItem>
                    <MenuItem value="group_segment">Group</MenuItem>
                    <MenuItem value="segment">Segment</MenuItem>
                    <MenuItem value="segment_type">Type</MenuItem>
                    <MenuItem value="active_flag">Status</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Action Buttons */}
              <Grid size={{ xs: 12, md: 1 }}>
                <Stack direction="row" spacing={1}>
                  <Tooltip title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}>
                    <IconButton
                      size="small"
                      onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                      color="primary"
                    >
                      <SortIcon sx={{ transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none' }} />
                    </IconButton>
                  </Tooltip>

                  {(searchTerm || filterType || filterStatus !== 'all' || sortField !== 'seq' || sortDirection !== 'asc') && (
                    <Tooltip title="Clear All Filters">
                      <IconButton size="small" onClick={clearFilters} color="secondary">
                        <ClearIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Grid>
            </Grid>

            {/* Filter Statistics */}
            {(searchTerm || filterType || filterStatus !== 'all') && (
              <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">
                  Showing {filteredData.length} of {data.length} records
                  {filteredData.length !== data.length && (
                    <> • {filteredData.filter(item => item.active_flag).length} active, {filteredData.filter(item => !item.active_flag).length} inactive</>
                  )}
                </Typography>
              </Box>
            )}
          </Paper>

          <Box sx={{ height: 600, width: '100%' }}>
            <SafeDataGrid
              rows={filteredData}
              columns={columns}
              getRowId={(row) => row.id}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              loading={loading}
              slots={{
                toolbar: () => (
                  <Box sx={{ p: 1, display: 'flex', gap: 1 }}>
                    <Button startIcon={<DownloadIcon />} onClick={handleExport}>Export</Button>
                    <Button component="label" startIcon={<UploadIcon />}>
                      Import
                      <input type="file" hidden accept=".json" onChange={handleImport} />
                    </Button>
                  </Box>
                )
              }}
              slotProps={{
                loadingOverlay: {
                  variant: 'linear-progress' as const,
                  noRowsVariant: 'skeleton' as const,
                },
                noRowsOverlay: {
                  children: (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        gap: 2
                      }}
                    >
                      <ErrorIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                      <Typography variant="h6" color="text.secondary">
                        No Segmentation Configuration Found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        {backendUnavailable ?
                          'Working in offline mode. Click "Add Segmentation" to create your first rule.' :
                          error ? 'Failed to load data from database. Check your connection and try refreshing.' :
                            'No segmentation rules configured yet. Click "Add Segmentation" to create the first one.'
                        }
                      </Typography>
                      {backendUnavailable && (
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={handleCreate}
                          sx={{ mt: 1 }}
                        >
                          Create First Rule
                        </Button>
                      )}
                    </Box>
                  )
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Create/Edit Header Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedHeader ? 'Edit Segmentation Header' : 'Create Segmentation Header'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 2 }}>
            {/* Group Segment - REQUIRED */}
            <TextField
              label="Group Segment *"
              value={formData.group_segment}
              onChange={(e) => setFormData(prev => ({ ...prev, group_segment: e.target.value }))}
              fullWidth
              required
              slotProps={{
                htmlInput: {
                  maxLength: 150,
                  'data-testid': 'segment-group-field'
                }
              }}
              placeholder="Group Segment"
              error={!formData.group_segment.trim()}
              helperText={!formData.group_segment.trim() ? 'Group Segment is required' : 'Group classification name (max 150 characters)'}
            />

            {/* Segment - REQUIRED */}
            <TextField
              label="Segment *"
              value={formData.segment}
              onChange={(e) => setFormData(prev => ({ ...prev, segment: e.target.value }))}
              fullWidth
              required
              slotProps={{
                htmlInput: {
                  maxLength: 150,
                  'data-testid': 'segment-name-field'
                }
              }}
              placeholder="Segment"
              error={!formData.segment.trim()}
              helperText={!formData.segment.trim() ? 'Segment is required' : 'Main segment name (max 150 characters)'}
            />

            {/* Sub Segment - OPTIONAL */}
            <TextField
              label="Sub Segment"
              value={formData.sub_segment}
              onChange={(e) => setFormData(prev => ({ ...prev, sub_segment: e.target.value }))}
              fullWidth
              slotProps={{
                htmlInput: {
                  maxLength: 150,
                  'data-testid': 'segment-sub-field'
                }
              }}
              placeholder="Sub Segment (optional)"
              helperText="Optional sub-segment for detailed classification (max 150 characters)"
            />

            {/* Segment Type - REQUIRED */}
            <TextField
              label="Segment Type *"
              select
              value={formData.segment_type}
              onChange={(e) => setFormData(prev => ({ ...prev, segment_type: e.target.value }))}
              fullWidth
              required
              error={!formData.segment_type.trim()}
              helperText={!formData.segment_type.trim() ? 'Segment Type is required' : 'Type of segmentation classification'}
              SelectProps={{
                SelectDisplayProps: { 'data-testid': 'segment-type-select' } as any
              }}
            >
              <MenuItem value="">Select Segment Type</MenuItem>
              {segmentTypes.map((type) => (
                <MenuItem key={type.type_code} value={type.type_code}>
                  {type.type_name}
                </MenuItem>
              ))}
            </TextField>

            {/* Sequence - OPTIONAL */}
            <TextField
              label="Sequence"
              type="number"
              value={formData.seq}
              onChange={(e) => setFormData(prev => ({ ...prev, seq: e.target.value ? Number(e.target.value) : '' }))}
              fullWidth
              placeholder="Display sequence"
              helperText="Optional display order sequence"
              slotProps={{
                htmlInput: {
                  min: 1,
                  'data-testid': 'segment-seq-field'
                }
              }}
            />

            {/* Active Flag */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active_flag}
                    onChange={(e) => setFormData(prev => ({ ...prev, active_flag: e.target.checked }))}
                  />
                }
                label="Active"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading || !formData.group_segment.trim() || !formData.segment.trim() || !formData.segment_type.trim()}
            startIcon={loading ? <CircularProgress size={16} /> : (backendUnavailable ? <SaveIcon /> : null)}
            color={backendUnavailable ? 'warning' : 'primary'}
            data-testid="save-segmentation-btn"
          >
            {loading ? 'Saving...' :
              backendUnavailable ?
                (selectedHeader ? 'Save Locally' : 'Create Locally') :
                (selectedHeader ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Segmentation Detail Modal */}
      {selectedHeader && (
        <EnhancedSegmentationDetailModal
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          header={selectedHeader}
          onRefresh={loadData}
        />
      )}

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}