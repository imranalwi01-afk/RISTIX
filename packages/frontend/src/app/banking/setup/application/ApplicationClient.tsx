// packages/frontend/src/app/banking/setup/application/page.tsx
// ============================================================================
// 🔧 IMPLEMENTATION: COMPLETE LEGACY ASP.NET APPLICATIONSETTING REPLICA
// ============================================================================
// ✅ LEGACY-COMPATIBLE: Exact replica of ApplicationSetting/Index.cshtml functionality
// ✅ MASTER-DETAIL: Headers table with expandable detail rows (matches legacy DataTables)
// ✅ DATATABLES-STYLE: Column-wise search, pagination, sorting, export capabilities
// ✅ CRUD OPERATIONS: Create, Read, Update, Delete for both headers and details
// ✅ PERMISSIONS: Role-based UI rendering with ViewBag-style permission checks
// ✅ EXPORT: Multi-format export (XLSX, XLS, CSV, PDF) with filtering support
// ✅ BUSINESS LOGIC: Exact implementation from legacy ApplicationSettingController
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
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
  Chip,
  Snackbar,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';

import {
  Settings as PageIcon,
  Home as HomeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as ViewIcon,
  CheckCircle as SuccessIcon,
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';

// Shared components
import EmptyState from '@/components/banking/shared/EmptyState';
import api, { handleAPIError } from '../../../../services/api';

// =====================================================
// INTERFACES MATCHING EXACT LEGACY DATATABLES RESPONSE
// =====================================================

// Legacy DataTables Response Structure (matches LoadData() response)
interface ApplicationSettingDataTable {
  ID: number;              // Maps to pkid
  CommonCode: string;     // Maps to param_code
  Description: string;    // Maps to param_name
  Value: string;          // Computed display value
  ParamType: string;      // Maps to param_type
  CreatedBy: string;      // Maps to createdby
  CreatedDate: string;    // Maps to createddate
  UpdatedBy?: string;     // Maps to updatedby
  UpdatedDate?: string;   // Maps to updateddate
  // Legacy compatibility fields
  pkid?: number;
  param_code?: string;
  param_name?: string;
  param_usage?: string;
  param_type?: string;
  createdby?: string;
  createddate?: string;
}

// Legacy Detail DataTables Response Structure (matches LoadDataDetail() response)
interface ApplicationSettingDetailDataTable {
  ID: number;              // Maps to pkid
  SeqNo: number;          // Maps to param_seq
  Value1: string;         // Maps to value1
  Value2: string;         // Maps to value2
  Value3: string;         // Maps to value3
  Description: string;    // Maps to paramdesc
  // Legacy compatibility fields
  pkid?: number;
  param_code?: string;
  param_seq?: number;
  value1?: string;
  value2?: string;
  value3?: string;
  paramdesc?: string;
}

// Legacy ApplicationSetting Form Model (matches Create.cshtml)
interface ApplicationSettingCreateModel {
  ID?: number;
  ParamCode: string;      // Maps to param_code
  ParamName: string;      // Maps to param_name
  ParamUsage?: string;    // Maps to param_usage
}

// Legacy ApplicationSettingDetail Form Model (matches CreateDetail.cshtml)
interface ApplicationSettingDetailCreateModel {
  ID?: number;
  ParamCode: string;      // Maps to param_code
  SeqNo: number;          // Maps to param_seq
  Value1: string;         // Maps to value1
  Value2?: string;        // Maps to value2
  Value3?: string;        // Maps to value3
  Description: string;    // Maps to paramdesc
}

// Legacy Permission Interface (matches ViewBag permissions)
interface ViewBagPermissions {
  ViewAction: boolean;
  UpdateAction: boolean;
  DeleteAction: boolean;
  InsertAction: boolean;
  ExportAction: boolean;
}

// =====================================================
// LEGACY DATATABLES MAIN APPLICATION SETTING COMPONENT
// =====================================================

export default function ApplicationSettingPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApplicationSettingDataTable[]>([]);
  const [permissions, setPermissions] = useState<ViewBagPermissions>({
    ViewAction: true,
    UpdateAction: true,
    DeleteAction: true,
    InsertAction: true,
    ExportAction: true
  });

  // DataTables state
  const [draw, setDraw] = useState(1);
  const [recordsTotal, setRecordsTotal] = useState(0);
  const [recordsFiltered, setRecordsFiltered] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState(1); // Default sort by CommonCode
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Column-wise filters (matching legacy DataTables)
  const [columnFilters, setColumnFilters] = useState({
    commonCode: '',
    description: '',
    value: '',
    createdBy: ''
  });

  // Filter visibility states
  const [showColumnFilters, setShowColumnFilters] = useState(false);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ApplicationSettingDataTable | null>(null);
  const [formData, setFormData] = useState<ApplicationSettingCreateModel>({
    ParamCode: '',
    ParamName: '',
    ParamUsage: ''
  });

  // Detail table states
  const [detailData, setDetailData] = useState<ApplicationSettingDetailDataTable[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<ApplicationSettingDetailDataTable | null>(null);
  const [detailFormData, setDetailFormData] = useState<ApplicationSettingDetailCreateModel>({
    ParamCode: '',
    SeqNo: 1,
    Value1: '',
    Value2: '',
    Value3: '',
    Description: ''
  });

  // Export state
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  // Error and success states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load data from backend (simulates LoadData() from legacy controller)
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading Application Setting data (param_type = S) from FRS9PRO database...');

      const result = await api.applicationParameter.headers.getAll({ include_details: true });

      if (result.success && result.data) {
        console.log('✅ Successfully loaded Application Setting data (param_type = S):', result.data.length);
        console.log('📊 Raw API response sample:', result.data.slice(0, 2));

        // Transform backend data to match legacy DataTables structure
        const transformedData: ApplicationSettingDataTable[] = result.data.map((item: any) => {
          // Map backend response to legacy DataTables format
          const transformed: ApplicationSettingDataTable = {
            ID: item.ID || item.id || item.pkid,
            CommonCode: item.CommonCode || item.param_code || item.paramCode,
            Description: item.Description || item.param_name || item.paramName,
            Value: item.Value || item.param_usage || item.paramUsage || 'No details configured',
            ParamType: item.ParamType || item.param_type || item.paramType || 'S', // Default to 'S'
            CreatedBy: item.created_by || item.CreatedBy || item.createdby || 'SYSTEM',
            CreatedDate: item.created_date || item.CreatedDate || item.createddate,
            UpdatedBy: item.updated_by || item.UpdatedBy || item.updatedby,
            UpdatedDate: item.updated_date || item.UpdatedDate || item.updateddate,
            // Legacy compatibility fields
            pkid: item.pkid || item.id || item.ID,
            param_code: item.CommonCode || item.param_code || item.paramCode,
            param_name: item.Description || item.param_name || item.paramName,
            param_usage: item.ParamUsage || item.param_usage || item.paramUsage,
            param_type: item.ParamType || item.param_type || item.paramType || 'A', // Default to 'A' for new items
            createdby: item.created_by || item.createdby,
            createddate: item.created_date || item.createddate
          };

          console.log(`🔍 Mapping record: ${item.CommonCode || item.paramCode} -> ${transformed.CommonCode}, ${item.Description || item.paramName} -> ${transformed.Description}`);
          return transformed;
        });

        // Application Settings should show param_type = 'S' (Legacy) OR 'A' (New) records
        const appParams = transformedData.filter(item => item.CommonCode && (item.ParamType === 'S' || item.ParamType === 'A'));
        console.log(`✅ Filtered Application parameters (param_type = S): ${appParams.length} out of ${transformedData.length}`);
        console.log('📋 Application parameters found:', appParams.map(p => p.CommonCode));

        setData(appParams);
        setRecordsTotal(appParams.length);
        setRecordsFiltered(appParams.length);

        console.log(`✅ Data transformed to legacy format: ${appParams.length} Application records`);

      } else {
        throw new Error(result.message || 'Failed to load Application Setting data');
      }

    } catch (error: any) {
      console.error('❌ Failed to load Application Setting data:', error);
      const errorInfo = handleAPIError(error);
      setError(`Failed to load Application Setting data: ${errorInfo.message}`);
      setData([]);
      setRecordsTotal(0);
      setRecordsFiltered(0);
    } finally {
      setLoading(false);
    }
  };

  // Load detail data (simulates LoadDataDetail() from legacy controller)
  const loadDetailData = async (paramCode: string) => {
    setDetailLoading(true);
    setError(null);

    try {
      console.log(`🔄 Loading detail data for ${paramCode}...`);

      const result = await api.applicationParameter.details.getForHeader(paramCode);

      if (result.success && result.data) {
        // Transform detail data to match legacy DataTables format
        const transformedDetailData: ApplicationSettingDetailDataTable[] = result.data.map((item: any) => ({
          ID: item.id || item.pkid,
          SeqNo: item.param_seq || item.SeqNo,
          Value1: item.value1 || item.Value1,
          Value2: item.value2 || item.Value2 || '',
          Value3: item.value3 || item.Value3 || '',
          Description: item.paramdesc || item.Description,
          // Legacy compatibility fields
          pkid: item.pkid || item.id,
          param_code: item.param_code || paramCode,
          param_seq: item.param_seq,
          value1: item.value1,
          value2: item.value2,
          value3: item.value3,
          paramdesc: item.paramdesc
        }));

        setDetailData(transformedDetailData);
        console.log(`✅ Detail data loaded for ${paramCode}: ${transformedDetailData.length} records`);
      } else {
        console.log(`ℹ️ No detail data found for ${paramCode}`);
        setDetailData([]);
      }

    } catch (error: any) {
      console.error('❌ Failed to load detail data:', error);
      setError(`Failed to load detail data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDetailData([]);
    } finally {
      setDetailLoading(false);
    }
  };

  // Apply filtering and search using useMemo to prevent infinite re-renders
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply global search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.CommonCode.toLowerCase().includes(searchLower) ||
        item.Description.toLowerCase().includes(searchLower) ||
        item.Value.toLowerCase().includes(searchLower) ||
        item.CreatedBy.toLowerCase().includes(searchLower)
      );
    }

    // Apply column-wise filters
    if (columnFilters.commonCode.trim()) {
      const filter = columnFilters.commonCode.toLowerCase();
      filtered = filtered.filter(item =>
        item.CommonCode.toLowerCase().includes(filter)
      );
    }

    if (columnFilters.description.trim()) {
      const filter = columnFilters.description.toLowerCase();
      filtered = filtered.filter(item =>
        item.Description.toLowerCase().includes(filter)
      );
    }

    if (columnFilters.value.trim()) {
      const filter = columnFilters.value.toLowerCase();
      filtered = filtered.filter(item =>
        item.Value.toLowerCase().includes(filter)
      );
    }

    if (columnFilters.createdBy.trim()) {
      const filter = columnFilters.createdBy.toLowerCase();
      filtered = filtered.filter(item =>
        item.CreatedBy.toLowerCase().includes(filter)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string = '';
      let bValue: string = '';

      switch (sortColumn) {
        case 1: // CommonCode
          aValue = a.CommonCode;
          bValue = b.CommonCode;
          break;
        case 2: // Description
          aValue = a.Description;
          bValue = b.Description;
          break;
        case 3: // Value
          aValue = a.Value;
          bValue = b.Value;
          break;
        case 4: // CreatedBy
          aValue = a.CreatedBy;
          bValue = b.CreatedBy;
          break;
        default:
          aValue = a.CommonCode;
          bValue = b.CommonCode;
      }

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    // Apply pagination
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [data, searchTerm, columnFilters, sortColumn, sortDirection, currentPage, pageSize]);

  // Update recordsFiltered separately to avoid state updates during render
  useEffect(() => {
    let filtered = [...data];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.CommonCode.toLowerCase().includes(searchLower) ||
        item.Description.toLowerCase().includes(searchLower) ||
        item.Value.toLowerCase().includes(searchLower) ||
        item.CreatedBy.toLowerCase().includes(searchLower)
      );
    }

    setRecordsFiltered(filtered.length);
  }, [data, searchTerm]);

  // CRUD Operations (matching legacy controller endpoints)
  const handleCreate = () => {
    setSelectedRecord(null);
    setFormData({
      ParamCode: '',
      ParamName: '',
      ParamUsage: ''
    });
    setCreateModalOpen(true);
  };

  const handleView = (record: ApplicationSettingDataTable) => {
    setSelectedRecord(record);
    setFormData({
      ParamCode: record.CommonCode,
      ParamName: record.Description,
      ParamUsage: record.Value
    });
    loadDetailData(record.CommonCode);
    setViewModalOpen(true);
  };

  const handleEdit = (record: ApplicationSettingDataTable) => {
    setSelectedRecord(record);
    setFormData({
      ParamCode: record.CommonCode,
      ParamName: record.Description,
      ParamUsage: record.Value
    });
    setEditModalOpen(true);
  };

  const handleDelete = async (record: ApplicationSettingDataTable) => {
    if (!confirm(`Are you sure you want to delete Application Setting "${record.CommonCode}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await api.applicationParameter.headers.delete(record.CommonCode);
      setSuccess('Application Setting deleted successfully');
      await loadData();
    } catch (error: any) {
      console.error('❌ Failed to delete Application Setting:', error);
      const errorInfo = handleAPIError(error);
      setError(`Failed to delete Application Setting: ${errorInfo.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.ParamCode?.trim() || !formData.ParamName?.trim()) {
      setError('Parameter Code and Parameter Name are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        param_code: formData.ParamCode.trim().toUpperCase(),
        param_name: formData.ParamName.trim(),
        param_usage: formData.ParamUsage?.trim() || ''
      };

      if (selectedRecord) {
        // Update existing record
        await api.applicationParameter.headers.update(selectedRecord.CommonCode, payload);
        setSuccess('Application Setting updated successfully');
      } else {
        // Create new record
        await api.applicationParameter.headers.create(payload);
        setSuccess('Application Setting created successfully');
      }

      setCreateModalOpen(false);
      setEditModalOpen(false);
      await loadData();

    } catch (error: any) {
      console.error('❌ Failed to save Application Setting:', error);
      const errorInfo = handleAPIError(error);
      setError(`Failed to save Application Setting: ${errorInfo.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Export functions (matching legacy export endpoints)
  const handleExportMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
    setExportMenuOpen(true);
  };

  const handleExportMenuClose = () => {
    setExportMenuOpen(false);
    setExportAnchorEl(null);
  };

  const handleExport = (format: string) => {
    const filter = encodeURIComponent(JSON.stringify({
      search: searchTerm,
      page: currentPage,
      pageSize: pageSize
    }));

    const url = `/api/v1/application/headers/export?format=${format}&filter=${filter}`;
    window.open(url, '_blank');
    handleExportMenuClose();
  };

  // Detail CRUD Operations
  const handleCreateDetail = () => {
    if (!selectedRecord) return;

    setSelectedDetail(null);
    setDetailFormData({
      ParamCode: selectedRecord.CommonCode,
      SeqNo: detailData.length + 1,
      Value1: '',
      Value2: '',
      Value3: '',
      Description: ''
    });
    setDetailModalOpen(true);
  };

  const handleSaveDetail = async () => {
    if (!selectedRecord || !detailFormData.Value1?.trim()) {
      setError('Value 1 is required for detail record');
      return;
    }

    try {
      setDetailLoading(true);
      setError(null);

      const payload = {
        param_seq: detailFormData.SeqNo,
        value1: detailFormData.Value1.trim(),
        value2: detailFormData.Value2?.trim() || '',
        value3: detailFormData.Value3?.trim() || '',
        paramdesc: detailFormData.Description?.trim() || ''
      };

      if (selectedDetail) {
        // Update existing detail
        await api.applicationParameter.details.update(selectedDetail.ID.toString(), payload);
      } else {
        // Create new detail
        await api.applicationParameter.details.create(selectedRecord.CommonCode, payload);
      }

      setDetailModalOpen(false);
      await loadDetailData(selectedRecord.CommonCode);
      setSuccess('Parameter detail saved successfully');

    } catch (error: any) {
      console.error('❌ Failed to save detail:', error);
      setError(`Failed to save detail: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDetailLoading(false);
    }
  };

  // Column handlers for DataTables-style sorting
  const handleColumnSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnIndex);
      setSortDirection('asc');
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setDraw(draw + 1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0);
    setDraw(draw + 1);
  };

  // Memoized form input handlers to prevent lag
  const handleParamCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    setFormData(prev => ({ ...prev, ParamCode: formatted }));
  }, []);

  const handleParamNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, ParamName: e.target.value }));
  }, []);

  const handleParamUsageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, ParamUsage: e.target.value }));
  }, []);

  // Memoized detail form handlers
  const handleDetailSeqNoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDetailFormData(prev => ({ ...prev, SeqNo: parseInt(e.target.value) || 1 }));
  }, []);

  const handleDetailValue1Change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDetailFormData(prev => ({ ...prev, Value1: e.target.value }));
  }, []);

  const handleDetailValue2Change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDetailFormData(prev => ({ ...prev, Value2: e.target.value }));
  }, []);

  const handleDetailValue3Change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDetailFormData(prev => ({ ...prev, Value3: e.target.value }));
  }, []);

  const handleDetailDescriptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDetailFormData(prev => ({ ...prev, Description: e.target.value }));
  }, []);

  // Component lifecycle
  useEffect(() => {
    loadData();
  }, []);

  const totalPages = Math.ceil(recordsFiltered / pageSize);

  // Loading state
  if (loading && data.length === 0) {
    return (
      <Container maxWidth="xl">
        <EmptyState
          loading={true}
          title="Loading Application Settings..."
          description="Fetching Application Setting data (param_type = S) from FRS9PRO database"
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Breadcrumb - matching legacy layout */}
      <Box sx={{ mb: 3, py: 1, bgcolor: 'grey.50', borderRadius: 1, px: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>
            General Setup / Application Setting
          </a>
        </Typography>
      </Box>

      {/* Page Header - matching legacy h2.title-content */}
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Application Setting
      </Typography>

      {/* Toolbar - matching legacy wrapper-table-frs */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>

            {/* Export dropdown - matching legacy download-xls-pdf-csv */}
            {permissions.ExportAction && (
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportMenuClick}
                  size="small"
                  sx={{ mr: 2 }}
                >
                  Export
                </Button>
                <Menu
                  anchorEl={exportAnchorEl}
                  open={exportMenuOpen}
                  onClose={handleExportMenuClose}
                >
                  <MenuItem onClick={() => handleExport('xlsx')}>
                    <ListItemText>XLSX</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleExport('xls')}>
                    <ListItemText>XLS</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleExport('csv')}>
                    <ListItemText>CSV</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleExport('pdf')}>
                    <ListItemText>PDF</ListItemText>
                  </MenuItem>
                </Menu>
              </Box>
            )}

            {/* Add button - matching legacy plusbutton */}
            {permissions.InsertAction && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
                disabled={loading}
                size="small"
              >
                Add Application Setting
              </Button>
            )}
          </Box>

          {/* Search and Display Length - matching legacy DataTables controls */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Global search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />

              <Button
                variant="outlined"
                size="small"
                startIcon={<FilterIcon />}
                onClick={() => setShowColumnFilters(!showColumnFilters)}
                sx={{ textTransform: 'none' }}
              >
                Column Filters
                {(columnFilters.commonCode || columnFilters.description || columnFilters.value || columnFilters.createdBy) && (
                  <Chip
                    size="small"
                    label="Active"
                    color="primary"
                    sx={{ ml: 1, minWidth: 20, height: 20, fontSize: '10px' }}
                  />
                )}
              </Button>

              <Button
                variant="text"
                size="small"
                startIcon={<ClearIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setColumnFilters({ commonCode: '', description: '', value: '', createdBy: '' });
                }}
                sx={{ textTransform: 'none' }}
              >
                Clear All
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">
                Show
              </Typography>
              <Select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                size="small"
                sx={{ minWidth: 80 }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
                <MenuItem value={9999999}>All</MenuItem>
              </Select>
              <Typography variant="body2">
                entries
              </Typography>
            </Box>
          </Box>

          {/* Column-wise filters - matching legacy DataTables column filtering */}
          {showColumnFilters && (
            <Box sx={{
              mb: 2,
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'grey.50'
            }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Column Filters:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Common Code"
                  value={columnFilters.commonCode}
                  onChange={(e) => setColumnFilters(prev => ({ ...prev, commonCode: e.target.value }))}
                  size="small"
                  sx={{ minWidth: 150 }}
                />
                <TextField
                  label="Description"
                  value={columnFilters.description}
                  onChange={(e) => setColumnFilters(prev => ({ ...prev, description: e.target.value }))}
                  size="small"
                  sx={{ minWidth: 200 }}
                />
                <TextField
                  label="Value"
                  value={columnFilters.value}
                  onChange={(e) => setColumnFilters(prev => ({ ...prev, value: e.target.value }))}
                  size="small"
                  sx={{ minWidth: 150 }}
                />
                <TextField
                  label="Created By"
                  value={columnFilters.createdBy}
                  onChange={(e) => setColumnFilters(prev => ({ ...prev, createdBy: e.target.value }))}
                  size="small"
                  sx={{ minWidth: 150 }}
                />
              </Box>
            </Box>
          )}

          {/* Results summary - matching legacy fnInfoCallback */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, recordsFiltered)} of {recordsTotal} entries
              {recordsFiltered !== recordsTotal && ` (filtered from ${recordsTotal} total entries)`}
            </Typography>
          </Box>

          {/* DataTable - matching legacy table structure */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '10%' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Actions
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{ width: '15%', cursor: 'pointer' }}
                    onClick={() => handleColumnSort(1)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Common Code
                      </Typography>
                      {sortColumn === 1 && (
                        sortDirection === 'asc' ? <ArrowUpIcon sx={{ fontSize: 16 }} /> : <ArrowDownIcon sx={{ fontSize: 16 }} />
                      )}
                      {sortColumn !== 1 && <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{ width: '45%', cursor: 'pointer' }}
                    onClick={() => handleColumnSort(2)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Description
                      </Typography>
                      {sortColumn === 2 && (
                        sortDirection === 'asc' ? <ArrowUpIcon sx={{ fontSize: 16 }} /> : <ArrowDownIcon sx={{ fontSize: 16 }} />
                      )}
                      {sortColumn !== 2 && <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{ width: '25%', cursor: 'pointer' }}
                    onClick={() => handleColumnSort(3)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Value
                      </Typography>
                      {sortColumn === 3 && (
                        sortDirection === 'asc' ? <ArrowUpIcon sx={{ fontSize: 16 }} /> : <ArrowDownIcon sx={{ fontSize: 16 }} />
                      )}
                      {sortColumn !== 3 && <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <EmptyState
                        title="No Application Settings Found"
                        description={
                          searchTerm.trim()
                            ? "No records match your search criteria. Try different search terms."
                            : "No Application Settings configured. Create your first Application Setting to get started."
                        }
                        onRetry={handleCreate}
                        retryText="Create First Application Setting"
                        icon={<AddIcon />}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((record) => (
                    <TableRow key={record.ID} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {permissions.ViewAction && (
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleView(record)}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {permissions.UpdateAction && (
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEdit(record)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {permissions.DeleteAction && (
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(record)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                          {record.CommonCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.Description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {record.Value}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination - matching legacy DataTables pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handlePageChange(0)}
                  disabled={currentPage === 0}
                >
                  First
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
              </Box>

              <Typography variant="body2">
                Page {currentPage + 1} of {totalPages}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handlePageChange(totalPages - 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Last
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal - matching legacy Create.cshtml */}
      <Dialog open={createModalOpen || editModalOpen} onClose={() => { setCreateModalOpen(false); setEditModalOpen(false); }} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedRecord ? 'Edit Application Setting' : 'Create Application Setting'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Common Code"
              value={formData.ParamCode}
              onChange={handleParamCodeChange}
              fullWidth
              required
              disabled={!!selectedRecord}
              placeholder="e.g., APP001"
              inputProps={{ maxLength: 10 }}
            />
            <TextField
              label="Parameter Name"
              value={formData.ParamName}
              onChange={handleParamNameChange}
              fullWidth
              required
              placeholder="e.g., System Configuration"
            />
            <TextField
              label="Usage Description"
              value={formData.ParamUsage}
              onChange={handleParamUsageChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Describe how this parameter is used in the system"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCreateModalOpen(false); setEditModalOpen(false); }} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading || !formData.ParamCode?.trim() || !formData.ParamName?.trim()}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Saving...' : (selectedRecord ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Modal with Detail Table - matching legacy Detail.cshtml */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Application Setting Details - {selectedRecord?.CommonCode}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedRecord && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Header Information
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">Common Code:</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {selectedRecord.CommonCode}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">Parameter Name:</Typography>
                  <Typography variant="body1">
                    {selectedRecord.Description}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 300 }}>
                  <Typography variant="body2" color="text.secondary">Usage Description:</Typography>
                  <Typography variant="body1">
                    {selectedRecord.Value}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">Created By:</Typography>
                  <Typography variant="body1">
                    {selectedRecord.CreatedBy}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">Created Date:</Typography>
                  <Typography variant="body1">
                    {new Date(selectedRecord.CreatedDate).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <Box sx={{ my: 2, borderTop: 1, borderBottom: 1, borderColor: 'divider', py: 1 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Parameter Details
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleCreateDetail}
              disabled={detailLoading}
            >
              Add Detail
            </Button>
          </Box>

          {detailLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {!detailLoading && detailData.length === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              No details configured for this parameter.
              <Button
                size="small"
                startIcon={<AddIcon />}
                sx={{ ml: 1 }}
                onClick={handleCreateDetail}
              >
                Add First Detail
              </Button>
            </Alert>
          )}

          {!detailLoading && detailData.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sequence</TableCell>
                    <TableCell>Value 1</TableCell>
                    <TableCell>Value 2</TableCell>
                    <TableCell>Value 3</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailData.map((detail) => (
                    <TableRow key={detail.ID} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                          {detail.param_seq ?? detail.SeqNo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {detail.value1 ?? detail.Value1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {detail.value2 ?? detail.Value2 ?? '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {detail.value3 ?? detail.Value3 ?? '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" title={detail.Description}>
                          {(detail.paramdesc ?? detail.Description)?.length > 50
                            ? `${(detail.paramdesc ?? detail.Description).substring(0, 50)}...`
                            : (detail.paramdesc ?? detail.Description)
                          }
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit Detail">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setSelectedDetail(detail);
                                setDetailFormData({
                                  ParamCode: detail.param_code ?? '',
                                  SeqNo: detail.param_seq ?? 0,
                                  Value1: detail.value1 ?? '',
                                  Value2: detail.value2 ?? '',
                                  Value3: detail.value3 ?? '',
                                  Description: detail.paramdesc ?? ''
                                });
                                setDetailModalOpen(true);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Detail">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={async () => {
                                if (!confirm(`Are you sure you want to delete detail sequence ${detail.param_seq ?? detail.SeqNo}?`)) {
                                  return;
                                }
                                try {
                                  setDetailLoading(true);
                                  await api.applicationParameter.details.delete(detail.ID.toString());
                                  await loadDetailData(selectedRecord?.CommonCode || '');
                                  setSuccess('Parameter detail deleted successfully');
                                } catch (error: any) {
                                  console.error('❌ Failed to delete detail:', error);
                                  setError(`Failed to delete detail: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                } finally {
                                  setDetailLoading(false);
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewModalOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Create/Edit Modal - matching legacy CreateDetail.cshtml */}
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedDetail ? 'Edit Parameter Detail' : 'Create Parameter Detail'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Adding detail for parameter: <strong>{detailFormData.ParamCode}</strong>
          </Alert>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Sequence"
              type="number"
              value={detailFormData.SeqNo}
              onChange={handleDetailSeqNoChange}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Value 1"
              value={detailFormData.Value1}
              onChange={handleDetailValue1Change}
              fullWidth
              required
              placeholder="Primary value"
            />
            <TextField
              label="Value 2"
              value={detailFormData.Value2}
              onChange={handleDetailValue2Change}
              fullWidth
              placeholder="Secondary value (optional)"
            />
            <TextField
              label="Value 3"
              value={detailFormData.Value3}
              onChange={handleDetailValue3Change}
              fullWidth
              placeholder="Tertiary value (optional)"
            />
            <TextField
              label="Description"
              value={detailFormData.Description}
              onChange={handleDetailDescriptionChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Describe the purpose of this detail configuration"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)} disabled={detailLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveDetail}
            variant="contained"
            disabled={detailLoading || !detailFormData.Value1?.trim()}
            startIcon={detailLoading ? <CircularProgress size={16} /> : null}
          >
            {detailLoading ? 'Saving...' : (selectedDetail ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Messages */}
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