// packages/frontend/src/app/banking/collective/rule-base/page.tsx
// ============================================================================
// IFRS9 FRONTEND - RULE BASE SETTING PAGE - MASTER-DETAIL PATTERN
// ============================================================================
// Purpose: Collective Impairment - Rule Based Setting with Application Setup UI/UX
// Database: FRS9_PARAM_SCENARIO_RULESH (Header) + FRS9_PARAM_SCENARIO_RULESD (Detail)
// Live DB: DS2 FRS9PRO (192.168.0.106:5433) - ACTUAL DATA, NO MOCK DATA
// UI Pattern: Matches /banking/setup/application with master-detail expandable rows
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider
} from '@mui/material';
import {
  Rule as PageIcon,
  Home as HomeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Visibility as ViewIcon,
  CheckCircle as SuccessIcon,
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { bankingAPI } from '../../../../services/api';

// =====================================================
// INTERFACES MATCHING DS2 FRS9PRO DATABASE SCHEMA
// =====================================================

interface RuleBaseHeader {
  pkid: number;
  rule_name: string;
  rule_type: string;
  rule_type_desc?: string;
  updated_table: string;
  updated_table_desc?: string;
  updated_column: string;
  updated_column_desc?: string;
  value: string;
  seq: number;
  active_flag: boolean;
  details_count?: number;
  createdby?: string;
  createddate?: string;
  details?: RuleBaseDetail[];
}

interface RuleBaseDetail {
  pkid: number;
  rule_id: number;
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
  createdby?: string;
  createddate?: string;
}

// =====================================================
// EXPANDABLE ROW COMPONENT - MASTER-DETAIL PATTERN
// =====================================================

interface ExpandableRowProps {
  header: RuleBaseHeader;
  onEditHeader: (header: RuleBaseHeader) => void;
  onDeleteHeader: (header: RuleBaseHeader) => void;
  onCreateDetail: (headerId: number) => void;
  onEditDetail: (detail: RuleBaseDetail) => void;
  onDeleteDetail: (detail: RuleBaseDetail) => void;
  loading: boolean;
}

function ExpandableRow({ 
  header, 
  onEditHeader, 
  onDeleteHeader, 
  onCreateDetail, 
  onEditDetail, 
  onDeleteDetail,
  loading 
}: ExpandableRowProps) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<RuleBaseDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleToggle = async () => {
    if (!open && details.length === 0) {
      await loadDetails();
    }
    setOpen(!open);
  };

  const loadDetails = async () => {
    setLoadingDetails(true);
    try {
      console.log(`🔍 Loading Rule Base Setting details for rule ${header.pkid}`);
      
      const response = await bankingAPI.ruleBaseSetting.getDetails(header.pkid);
      if (response.success) {
        setDetails(response.data);
        console.log(`✅ Loaded ${response.data.length} rule details from DS2 database`);
      } else {
        throw new Error(response.error || 'Failed to load rule details');
      }
    } catch (error) {
      console.error('❌ Error loading rule details:', error);
      setDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={handleToggle}
            disabled={loading}
          >
            {open ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
            {header.pkid}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {header.rule_name}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip 
            label={header.rule_type} 
            size="small"
            color={header.rule_type === 'STAGE' ? 'primary' : header.rule_type === 'DEFAULT' ? 'warning' : 'info'}
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {header.updated_table}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {header.updated_column}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {header.value}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Chip 
            label={header.seq} 
            size="small" 
            variant="outlined"
          />
        </TableCell>
        <TableCell>
          <Chip 
            label={header.active_flag ? 'Active' : 'Inactive'}
            size="small"
            color={header.active_flag ? 'success' : 'default'}
          />
        </TableCell>
        <TableCell>
          <Chip 
            label={details.length || 0} 
            size="small" 
            color="info"
          />
        </TableCell>
        <TableCell>
          <Tooltip title="Edit Rule Header">
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => onEditHeader(header)}
              disabled={loading}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Rule Header">
            <IconButton 
              size="small" 
              color="error"
              onClick={() => onDeleteHeader(header)}
              disabled={loading}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {/* Expandable Details Section */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold' }}>
                  Rule Details for: {header.rule_name}
                </Typography>
                <Button 
                  size="small" 
                  startIcon={<AddIcon />} 
                  onClick={() => onCreateDetail(header.pkid)}
                  disabled={loading}
                  variant="outlined"
                >
                  Add Detail
                </Button>
              </Box>

              {loadingDetails ? (
                <Box display="flex" justifyContent="center" py={3}>
                  <CircularProgress size={24} />
                </Box>
              ) : details.length === 0 ? (
                <Alert severity="info">
                  No rule details found for this header.
                </Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Group</strong></TableCell>
                        <TableCell><strong>Seq</strong></TableCell>
                        <TableCell><strong>Table</strong></TableCell>
                        <TableCell><strong>Column</strong></TableCell>
                        <TableCell><strong>Data Type</strong></TableCell>
                        <TableCell><strong>Operator</strong></TableCell>
                        <TableCell><strong>Value 1</strong></TableCell>
                        <TableCell><strong>Value 2</strong></TableCell>
                        <TableCell><strong>Condition</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {details.map((detail) => (
                        <TableRow key={detail.pkid} hover>
                          <TableCell>
                            <Chip label={detail.query_group} size="small" color="info" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {detail.seq}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {detail.table_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {detail.column_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={detail.data_type} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {detail.operator}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {detail.value1 || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {detail.value2 || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={detail.condition} 
                              size="small" 
                              color={detail.condition === 'AND' ? 'primary' : 'secondary'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {detail.detail_type || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Edit Detail">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => onEditDetail(detail)}
                                disabled={loading}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Detail">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => onDeleteDetail(detail)}
                                disabled={loading}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function RuleBaseSettingPage() {
  const router = useRouter();
  
  // State Management - Live Database Integration
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [headers, setHeaders] = useState<RuleBaseHeader[]>([]);
  const [filteredHeaders, setFilteredHeaders] = useState<RuleBaseHeader[]>([]);
  
  // Filter and Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRuleType, setFilterRuleType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCreatedBy, setFilterCreatedBy] = useState('');
  
  // Dialog States
  const [headerDialogOpen, setHeaderDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedHeader, setSelectedHeader] = useState<RuleBaseHeader | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<RuleBaseDetail | null>(null);
  const [selectedHeaderId, setSelectedHeaderId] = useState<number | null>(null);
  
  // Form States
  const [headerFormData, setHeaderFormData] = useState<Partial<RuleBaseHeader>>({});
  const [detailFormData, setDetailFormData] = useState<Partial<RuleBaseDetail>>({});
  
  // Dropdown Options - Live Database Metadata
  const [ruleTypes, setRuleTypes] = useState<{label: string, value: string}[]>([]);
  const [conditions, setConditions] = useState<{label: string, value: string}[]>([]);
  const [stages, setStages] = useState<{label: string, value: string}[]>([]);

  // Filter functions
  const applyFilters = () => {
    let filtered = headers;
    
    if (searchTerm) {
      filtered = filtered.filter(h => 
        h.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.rule_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.updated_table.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.updated_column.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterRuleType) {
      filtered = filtered.filter(h => h.rule_type === filterRuleType);
    }
    
    if (filterStatus === 'active') {
      filtered = filtered.filter(h => h.active_flag === true);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(h => h.active_flag === false);
    }
    
    if (filterCreatedBy) {
      filtered = filtered.filter(h => h.createdby === filterCreatedBy);
    }
    
    setFilteredHeaders(filtered);
  };

  // Get unique values for filters
  const getUniqueRuleTypes = () => {
    const types = headers.map(h => h.rule_type).filter(Boolean);
    return [...new Set(types)].sort();
  };

  const getUniqueCreatedBy = () => {
    const creators = headers.map(h => h.createdby).filter(Boolean);
    return [...new Set(creators)].sort();
  };

  // Load rule base setting headers
  const loadHeaders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading Rule Base Setting headers from DS2 FRS9PRO database...');
      
      const result = await bankingAPI.ruleBaseSetting.getHeaders({
        page: 1,
        limit: 100
      });
      
      if (result.success && result.data) {
        console.log('✅ Successfully loaded rule headers:', result.data.length);
        setHeaders(result.data);
        setFilteredHeaders(result.data);
        setSuccess('Rule Base Settings loaded successfully');
      } else {
        throw new Error(result.error || 'Failed to load rule base settings');
      }
      
    } catch (error: any) {
      console.error('❌ Failed to load rule base settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load rule base settings: ${errorMessage}`);
      setHeaders([]);
      setFilteredHeaders([]);
    } finally {
      setLoading(false);
    }
  };

  // Load dropdown metadata from DS2 database
  const loadMetadata = async () => {
    try {
      console.log('🔄 Loading Rule Base Setting metadata from DS2 database...');
      
      // Load all metadata in parallel
      const [ruleTypesRes, conditionsRes, stagesRes] = await Promise.all([
        bankingAPI.ruleBaseSetting.getRuleTypes(),
        bankingAPI.ruleBaseSetting.getConditions(), 
        bankingAPI.ruleBaseSetting.getStages()
      ]);
      
      if (ruleTypesRes.success) {
        setRuleTypes(ruleTypesRes.data.map((item: any) => ({ label: item.name, value: item.value })));
      }
      
      if (conditionsRes.success) {
        setConditions(conditionsRes.data.map((item: any) => ({ label: item.name, value: item.value })));
      }
      
      if (stagesRes.success) {
        setStages(stagesRes.data.map((item: any) => ({ label: item.name, value: item.value })));
      }
      
      console.log('✅ Rule Base Setting metadata loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading metadata:', error);
    }
  };

  // Component lifecycle
  useEffect(() => {
    loadHeaders();
    loadMetadata();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterRuleType, filterStatus, filterCreatedBy, headers]);

  // Header CRUD operations
  const handleCreateHeader = () => {
    setSelectedHeader(null);
    setHeaderFormData({
      rule_name: '',
      rule_type: '',
      updated_table: '',
      updated_column: '',
      value: '',
      seq: 1,
      active_flag: true
    });
    setHeaderDialogOpen(true);
  };

  const handleEditHeader = (header: RuleBaseHeader) => {
    setSelectedHeader(header);
    setHeaderFormData({
      rule_name: header.rule_name,
      rule_type: header.rule_type,
      updated_table: header.updated_table,
      updated_column: header.updated_column,
      value: header.value,
      seq: header.seq,
      active_flag: header.active_flag
    });
    setHeaderDialogOpen(true);
  };

  const handleDeleteHeader = async (header: RuleBaseHeader) => {
    if (!confirm(`Are you sure you want to delete rule "${header.rule_name}"? This will also delete all associated details.`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await bankingAPI.ruleBaseSetting.deleteHeader(header.pkid);
      setSuccess('Rule header deleted successfully');
      await loadHeaders();
      
    } catch (error: any) {
      console.error('❌ Failed to delete rule header:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to delete rule header: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHeader = async () => {
    if (!headerFormData.rule_name?.trim() || !headerFormData.rule_type?.trim()) {
      setError('Rule name and type are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        rule_name: headerFormData.rule_name!.trim(),
        rule_type: headerFormData.rule_type!.trim(),
        updated_table: headerFormData.updated_table!.trim(),
        updated_column: headerFormData.updated_column!.trim(),
        value: headerFormData.value!.trim(),
        seq: headerFormData.seq || 1,
        active_flag: headerFormData.active_flag !== false
      };
      
      if (selectedHeader) {
        // Update existing header
        await bankingAPI.ruleBaseSetting.updateHeader(selectedHeader.pkid, payload);
        setSuccess('Rule header updated successfully');
      } else {
        // Create new header
        await bankingAPI.ruleBaseSetting.createHeader(payload);
        setSuccess('Rule header created successfully');
      }
      
      setHeaderDialogOpen(false);
      await loadHeaders();
      
    } catch (error: any) {
      console.error('❌ Failed to save rule header:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to save rule header: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Detail CRUD operations
  const handleCreateDetail = (headerId: number) => {
    setSelectedDetail(null);
    setSelectedHeaderId(headerId);
    setDetailFormData({
      query_group: 1,
      seq: 1,
      table_name: '',
      column_name: '',
      data_type: '',
      operator: '=',
      value1: '',
      value2: '',
      condition: 'AND'
    });
    setDetailDialogOpen(true);
  };

  const handleEditDetail = (detail: RuleBaseDetail) => {
    setSelectedDetail(detail);
    setSelectedHeaderId(detail.rule_id);
    setDetailFormData(detail);
    setDetailDialogOpen(true);
  };

  const handleDeleteDetail = async (detail: RuleBaseDetail) => {
    if (!confirm(`Are you sure you want to delete this rule detail?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await bankingAPI.ruleBaseSetting.deleteDetail(detail.pkid);
      setSuccess('Rule detail deleted successfully');
      await loadHeaders();
      
    } catch (error: any) {
      console.error('❌ Failed to delete rule detail:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to delete rule detail: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDetail = async () => {
    if (!detailFormData.table_name?.trim() || !detailFormData.column_name?.trim()) {
      setError('Table name and column name are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        query_group: detailFormData.query_group || 1,
        seq: detailFormData.seq || 1,
        table_name: detailFormData.table_name!.trim(),
        column_name: detailFormData.column_name!.trim(),
        data_type: detailFormData.data_type!.trim(),
        operator: detailFormData.operator!.trim(),
        value1: detailFormData.value1?.trim() || '',
        value2: detailFormData.value2?.trim() || '',
        condition: detailFormData.condition || 'AND',
        detail_type: detailFormData.detail_type?.trim() || '',
        stage_from: detailFormData.stage_from?.trim() || '',
        stage_to: detailFormData.stage_to?.trim() || ''
      };
      
      if (selectedDetail) {
        // Update existing detail
        await bankingAPI.ruleBaseSetting.updateDetail(selectedDetail.pkid, payload);
        setSuccess('Rule detail updated successfully');
      } else {
        // Create new detail
        await bankingAPI.ruleBaseSetting.createDetail(selectedHeaderId!, payload);
        setSuccess('Rule detail created successfully');
      }
      
      setDetailDialogOpen(false);
      await loadHeaders();
      
    } catch (error: any) {
      console.error('❌ Failed to save rule detail:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to save rule detail: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterRuleType('');
    setFilterStatus('');
    setFilterCreatedBy('');
  };

  // Loading state
  if (loading && headers.length === 0) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <CircularProgress size={48} />
            <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold' }}>
              Loading Rule Base Settings...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link 
          underline="hover" 
          color="inherit"
          href="/banking/dashboard"
          onClick={(e) => {
            e.preventDefault();
            router.push('/banking/dashboard');
          }}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Banking Dashboard
        </Link>
        <Link 
          underline="hover" 
          color="inherit"
          href="/banking/collective"
          onClick={(e) => {
            e.preventDefault();
            router.push('/banking/collective');
          }}
        >
          Collective Impairment
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <PageIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Rule Base Setting
        </Typography>
      </Breadcrumbs>

      {/* Error Display */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Success Display */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={4000} 
        onClose={() => setSuccess(null)}
      >
        <Alert 
          onClose={() => setSuccess(null)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>

      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PageIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Rule Base Setting
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            IFRS 9 Rule-based collective impairment configuration.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={loadHeaders} color="primary" disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateHeader}
            disabled={loading}
          >
            Add Rule
          </Button>
        </Box>
      </Box>

      {/* Search and Filter Controls */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Search & Filter Rule Base Settings
            </Typography>
            <Chip 
              label={`${filteredHeaders.length} of ${headers.length} rules`} 
              size="small" 
              color="primary" 
              sx={{ ml: 2 }}
            />
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search Rules"
                placeholder="Search name, type, table, column..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Rule Type</InputLabel>
                <Select
                  value={filterRuleType}
                  onChange={(e) => setFilterRuleType(e.target.value)}
                  label="Rule Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  {getUniqueRuleTypes().map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Created By</InputLabel>
                <Select
                  value={filterCreatedBy}
                  onChange={(e) => setFilterCreatedBy(e.target.value)}
                  label="Created By"
                >
                  <MenuItem value="">All Creators</MenuItem>
                  {getUniqueCreatedBy().map((creator) => (
                    <MenuItem key={creator} value={creator}>{creator}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1, height: '40px' }}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  disabled={loading}
                  size="small"
                >
                  Clear Filters
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadHeaders}
                  disabled={loading}
                  size="small"
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Master Table with Expandable Details */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {filteredHeaders.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity="info">
                {headers.length === 0 
                  ? 'No rule base settings found. Click "Add Rule" to create your first rule.'
                  : 'No rules match your current filters. Try adjusting your search criteria.'
                }
              </Alert>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Rule Name</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Updated Table</strong></TableCell>
                    <TableCell><strong>Updated Column</strong></TableCell>
                    <TableCell><strong>Value</strong></TableCell>
                    <TableCell align="center"><strong>Seq</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Details</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHeaders.map((header) => (
                    <ExpandableRow
                      key={header.pkid}
                      header={header}
                      onEditHeader={handleEditHeader}
                      onDeleteHeader={handleDeleteHeader}
                      onCreateDetail={handleCreateDetail}
                      onEditDetail={handleEditDetail}
                      onDeleteDetail={handleDeleteDetail}
                      loading={loading}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Header Create/Edit Dialog */}
      <Dialog open={headerDialogOpen} onClose={() => setHeaderDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedHeader ? 'Edit Rule Header' : 'Create Rule Header'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Rule Configuration:</strong><br />
            Configure the main rule parameters that will be used for IFRS 9 collective impairment calculations.
          </Alert>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <TextField
              label="Rule Name"
              value={headerFormData.rule_name || ''}
              onChange={(e) => setHeaderFormData(prev => ({ ...prev, rule_name: e.target.value }))}
              fullWidth
              required
              placeholder="e.g., Stage Classification Rule"
            />
            <FormControl fullWidth required>
              <InputLabel>Rule Type</InputLabel>
              <Select
                value={headerFormData.rule_type || ''}
                onChange={(e) => setHeaderFormData(prev => ({ ...prev, rule_type: e.target.value }))}
                label="Rule Type"
              >
                <MenuItem value="STAGE">STAGE</MenuItem>
                <MenuItem value="DEFAULT">DEFAULT</MenuItem>
                <MenuItem value="GL">GL</MenuItem>
                <MenuItem value="SICR">SICR</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Updated Table"
              value={headerFormData.updated_table || ''}
              onChange={(e) => setHeaderFormData(prev => ({ ...prev, updated_table: e.target.value }))}
              fullWidth
              required
              placeholder="e.g., FRS9_MASTER_ACCOUNT"
            />
            <TextField
              label="Updated Column"
              value={headerFormData.updated_column || ''}
              onChange={(e) => setHeaderFormData(prev => ({ ...prev, updated_column: e.target.value }))}
              fullWidth
              required
              placeholder="e.g., STAGE"
            />
            <TextField
              label="Value"
              value={headerFormData.value || ''}
              onChange={(e) => setHeaderFormData(prev => ({ ...prev, value: e.target.value }))}
              fullWidth
              required
              placeholder="Target value to set"
            />
            <TextField
              label="Sequence"
              type="number"
              value={headerFormData.seq || 1}
              onChange={(e) => setHeaderFormData(prev => ({ ...prev, seq: parseInt(e.target.value) || 1 }))}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <FormControl component="fieldset">
              <Typography component="legend">Status</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={headerFormData.active_flag !== false}
                  onChange={(e) => setHeaderFormData(prev => ({ ...prev, active_flag: e.target.checked }))}
                />
                <Typography sx={{ ml: 1 }}>Active</Typography>
              </Box>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHeaderDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSaveHeader} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : (selectedHeader ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Create/Edit Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedDetail ? 'Edit Rule Detail' : 'Create Rule Detail'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Detail Configuration:</strong><br />
            Configure the specific conditions and logic for this rule detail.
          </Alert>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <TextField
              label="Query Group"
              type="number"
              value={detailFormData.query_group || 1}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, query_group: parseInt(e.target.value) || 1 }))}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Sequence"
              type="number"
              value={detailFormData.seq || 1}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, seq: parseInt(e.target.value) || 1 }))}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Table Name"
              value={detailFormData.table_name || ''}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, table_name: e.target.value }))}
              fullWidth
              required
              placeholder="e.g., FRS9_MASTER_ACCOUNT"
            />
            <TextField
              label="Column Name"
              value={detailFormData.column_name || ''}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, column_name: e.target.value }))}
              fullWidth
              required
              placeholder="e.g., DPD"
            />
            <TextField
              label="Data Type"
              value={detailFormData.data_type || ''}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, data_type: e.target.value }))}
              fullWidth
              required
              placeholder="e.g., NUMBER, VARCHAR, DATE"
            />
            <FormControl fullWidth required>
              <InputLabel>Operator</InputLabel>
              <Select
                value={detailFormData.operator || '='}
                onChange={(e) => setDetailFormData(prev => ({ ...prev, operator: e.target.value }))}
                label="Operator"
              >
                <MenuItem value="=">=</MenuItem>
                <MenuItem value="!=">!=</MenuItem>
                <MenuItem value="<>">&lt;&gt;</MenuItem>
                <MenuItem value=">">&gt;</MenuItem>
                <MenuItem value=">=">&gt;=</MenuItem>
                <MenuItem value="<">&lt;</MenuItem>
                <MenuItem value="<=">&lt;=</MenuItem>
                <MenuItem value="LIKE">LIKE</MenuItem>
                <MenuItem value="NOT LIKE">NOT LIKE</MenuItem>
                <MenuItem value="IN">IN</MenuItem>
                <MenuItem value="NOT IN">NOT IN</MenuItem>
                <MenuItem value="BETWEEN">BETWEEN</MenuItem>
                <MenuItem value="IS NULL">IS NULL</MenuItem>
                <MenuItem value="IS NOT NULL">IS NOT NULL</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Value 1"
              value={detailFormData.value1 || ''}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, value1: e.target.value }))}
              fullWidth
              placeholder="Primary comparison value"
            />
            <TextField
              label="Value 2"
              value={detailFormData.value2 || ''}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, value2: e.target.value }))}
              fullWidth
              placeholder="Secondary value (for BETWEEN, etc.)"
            />
            <FormControl fullWidth required>
              <InputLabel>Condition</InputLabel>
              <Select
                value={detailFormData.condition || 'AND'}
                onChange={(e) => setDetailFormData(prev => ({ ...prev, condition: e.target.value as 'AND' | 'OR' }))}
                label="Condition"
              >
                <MenuItem value="AND">AND</MenuItem>
                <MenuItem value="OR">OR</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Detail Type"
              value={detailFormData.detail_type || ''}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, detail_type: e.target.value }))}
              fullWidth
              placeholder="e.g., SICR, DEFAULT, 1, 2, 3"
            />
            <TextField
              label="Stage From"
              value={detailFormData.stage_from || ''}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, stage_from: e.target.value }))}
              fullWidth
              placeholder="Source stage (1, 2, or 3)"
            />
            <TextField
              label="Stage To"
              value={detailFormData.stage_to || ''}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, stage_to: e.target.value }))}
              fullWidth
              placeholder="Target stage (1, 2, or 3)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSaveDetail} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : (selectedDetail ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}