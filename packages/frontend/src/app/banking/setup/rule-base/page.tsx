// packages/frontend/src/app/banking/setup/rule-base/page.tsx
// ============================================================================
// RULE BASE SETTING PAGE - PHASE 3 MODULE 3.2
// ============================================================================
// React Admin implementation for Rule Base Setting master-detail operations
// Features: Master table with detail modal, cascading dropdowns, dynamic forms
// Legacy compliance: ASP.NET MVC ParamScenarioRules functionality
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Rule as RuleIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { ruleBaseSettingAPI } from '@/services/api.rulebasesetting';
import RuleBaseSettingModal from '@/components/banking/setup/RuleBaseSettingModal';

// ============================================================================
// INTERFACES
// ============================================================================

interface RuleBaseSettingHeader {
  id: number;
  rule_name: string;
  rule_type: string;
  updated_table: string;
  updated_column: string;
  value: string;
  seq: number;
  active_flag: boolean;
  detail_count?: number;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FilterParams {
  search: string;
  rule_type: string;
  active_flag: string;
}

// ============================================================================
// RULE BASE SETTING PAGE COMPONENT
// ============================================================================

export default function RuleBaseSettingPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  // State management
  const [headers, setHeaders] = useState<RuleBaseSettingHeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState<FilterParams>({
    search: '',
    rule_type: '',
    active_flag: ''
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedHeader, setSelectedHeader] = useState<RuleBaseSettingHeader | null>(null);

  // Rule types for filter dropdown
  const [ruleTypes, setRuleTypes] = useState<Array<{ value: string; label: string }>>([]);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadHeaders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const response = await ruleBaseSettingAPI.getHeaders(params);

      if (response.success) {
        setHeaders(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0
        }));
      } else {
        throw new Error(response.error || 'Failed to load rule base settings');
      }
    } catch (err) {
      console.error('Error loading rule base settings:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      enqueueSnackbar('Failed to load rule base settings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadRuleTypes = async () => {
    try {
      const response = await ruleBaseSettingAPI.getRuleTypes();
      if (response.success) {
        setRuleTypes(response.data || []);
      }
    } catch (err) {
      console.error('Error loading rule types:', err);
    }
  };

  // Load data on component mount and when dependencies change
  useEffect(() => {
    loadHeaders();
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    loadRuleTypes();
  }, []);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleCreate = () => {
    setSelectedHeader(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (header: RuleBaseSettingHeader) => {
    setSelectedHeader(header);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleView = (header: RuleBaseSettingHeader) => {
    setSelectedHeader(header);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleDelete = async (header: RuleBaseSettingHeader) => {
    if (!confirm(`Are you sure you want to delete rule "${header.rule_name}"?\n\nThis will also delete all associated rule details and cannot be undone.`)) {
      return;
    }

    try {
      const response = await ruleBaseSettingAPI.deleteHeader(header.id);
      
      if (response.success) {
        enqueueSnackbar('Rule base setting deleted successfully', { variant: 'success' });
        loadHeaders(); // Reload data
      } else {
        throw new Error(response.error || 'Failed to delete rule base setting');
      }
    } catch (err) {
      console.error('Error deleting rule base setting:', err);
      enqueueSnackbar('Failed to delete rule base setting', { variant: 'error' });
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedHeader(null);
  };

  const handleModalSave = () => {
    setModalOpen(false);
    setSelectedHeader(null);
    loadHeaders(); // Reload data after save
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  const handleFilterChange = (field: keyof FilterParams, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filtering
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadHeaders();
  };

  const clearFilters = () => {
    setFilters({ search: '', rule_type: '', active_flag: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getRuleTypeLabel = (value: string) => {
    const ruleType = ruleTypes.find(rt => rt.value === value);
    return ruleType?.label || value;
  };

  const getStatusChip = (active: boolean) => (
    <Chip
      label={active ? 'Active' : 'Inactive'}
      color={active ? 'success' : 'default'}
      size="small"
      variant="outlined"
    />
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RuleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Rule Base Setting
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={{ minWidth: 150 }}
        >
          Create Rule
        </Button>
      </Box>

      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters & Search
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="end">
          <TextField
            label="Search"
            placeholder="Search by rule name, type, table, column, or value..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            sx={{ minWidth: 300 }}
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleSearch} size="small">
                  <SearchIcon />
                </IconButton>
              )
            }}
          />
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Rule Type</InputLabel>
            <Select
              value={filters.rule_type}
              label="Rule Type"
              onChange={(e) => handleFilterChange('rule_type', e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              {ruleTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.active_flag}
              label="Status"
              onChange={(e) => handleFilterChange('active_flag', e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Stack>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Data Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Seq</strong></TableCell>
                <TableCell><strong>Rule Name</strong></TableCell>
                <TableCell><strong>Rule Type</strong></TableCell>
                <TableCell><strong>Updated Table</strong></TableCell>
                <TableCell><strong>Updated Column</strong></TableCell>
                <TableCell><strong>Value</strong></TableCell>
                <TableCell><strong>Details</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading rule base settings...</Typography>
                  </TableCell>
                </TableRow>
              ) : headers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No rule base settings found. Click "Create Rule" to add your first rule.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                headers.map((header) => (
                  <TableRow key={header.id} hover>
                    <TableCell>{header.seq}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {header.rule_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRuleTypeLabel(header.rule_type)}
                        color="primary"
                        variant="outlined"
                        size="small"
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
                      <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {header.value}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${header.detail_count || 0} conditions`}
                        color="info"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{getStatusChip(header.active_flag)}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleView(header)}
                            color="info"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Rule">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(header)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Rule">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(header)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {!loading && headers.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {headers.length} of {pagination.total} rule base settings
            </Typography>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Paper>

      {/* Rule Base Setting Modal */}
      <RuleBaseSettingModal
        open={modalOpen}
        mode={modalMode}
        header={selectedHeader}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
    </Box>
  );
}