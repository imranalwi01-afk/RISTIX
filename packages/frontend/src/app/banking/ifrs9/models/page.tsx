// packages/frontend/src/app/banking/ifrs9/models/page.tsx
// ============================================================================
// IFRS9 MODELS PAGE - REAL IMPLEMENTATION
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import PageHeader from '@/components/banking/shared/PageHeader';
import AddIcon from '@mui/icons-material/Add';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  ModelDetailsDialog,
  ModelFormDialog,
  ModelManagementTable,
  type ModelRecord,
} from './components';

const API_BASE = typeof window !== 'undefined'
  ? '/api/v1'
  : process.env.BACKEND_INTERNAL_URL
    ? `${process.env.BACKEND_INTERNAL_URL}/api/v1`
    : 'http://backend:5232/api/v1';

const authHeaders = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer demo_token_ADMIN',
  'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
};

const apiReq = (path: string, method = 'GET', body?: any) =>
  fetch(`${API_BASE}${path}`, { method, headers: authHeaders, body: body ? JSON.stringify(body) : undefined }).then(r => r.json());

const modelsApi = {
  getPDModels: () => apiReq('/banking/collective/pd-configurations'),
  deletePDModel: (id: number) => apiReq(`/banking/collective/pd-configurations/${id}`, 'DELETE'),
  updatePDModel: (id: number, data: any) => apiReq(`/banking/collective/pd-configurations/${id}`, 'PUT', data),
  createPDModel: (data: any) => apiReq('/banking/collective/pd-configurations', 'POST', data),
  getLGDModels: () => apiReq('/banking/collective/lgd-configurations'),
  deleteLGDModel: (id: number) => apiReq(`/banking/collective/lgd-configurations/${id}`, 'DELETE'),
  updateLGDModel: (id: number, data: any) => apiReq(`/banking/collective/lgd-configurations/${id}`, 'PUT', data),
  createLGDModel: (data: any) => apiReq('/banking/collective/lgd-configurations', 'POST', data),
  getEADModels: () => apiReq('/banking/collective/ead-configurations'),
  deleteEADModel: (id: number) => apiReq(`/banking/collective/ead-configurations/${id}`, 'DELETE'),
  updateEADModel: (id: number, data: any) => apiReq(`/banking/collective/ead-configurations/${id}`, 'PUT', data),
  createEADModel: (data: any) => apiReq('/banking/collective/ead-configurations', 'POST', data),
  getECLModels: () => apiReq('/banking/collective/ecl-config'),
  deleteECLModel: (id: number) => apiReq(`/banking/collective/ecl-config/${id}`, 'DELETE'),
  updateECLModel: (id: number, data: any) => apiReq(`/banking/collective/ecl-config/${id}`, 'PUT', data),
  createECLModel: (data: any) => apiReq('/banking/collective/ecl-config', 'POST', data),
};

export default function IFRS9ModelsPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [pdModels, setPDModels] = useState<any[]>([]);
  const [lgdModels, setLGDModels] = useState<any[]>([]);
  const [eadModels, setEADModels] = useState<any[]>([]);
  const [eclModels, setECLModels] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<any>(null);
  
  // Table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Load models data
  const loadModelsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [pdResponse, lgdResponse, eadResponse, eclResponse] = await Promise.all([
        modelsApi.getPDModels(),
        modelsApi.getLGDModels(),
        modelsApi.getEADModels(),
        modelsApi.getECLModels()
      ]);

      if (pdResponse.success) setPDModels(pdResponse.data || []);
      if (lgdResponse.success) setLGDModels(lgdResponse.data || []);
      if (eadResponse.success) setEADModels(eadResponse.data || []);
      if (eclResponse.success) setECLModels(eclResponse.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load models data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModelsData();
  }, []);

  // CRUD Handler Functions
  const handleCreate = useCallback(() => {
    setEditingModel(null);
    setCreateDialogOpen(true);
  }, []);

  const handleEdit = useCallback((model: ModelRecord) => {
    setEditingModel(model);
    setEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (model: ModelRecord) => {
    if (!window.confirm(`Are you sure you want to delete ${model.model_name || model.name}?`)) {
      return;
    }

    try {
      let response;
      switch (activeTab) {
        case 0: // PD
          response = await modelsApi.deletePDModel(model.id);
          break;
        case 1: // LGD
          response = await modelsApi.deleteLGDModel(model.id);
          break;
        case 2: // EAD
          response = await modelsApi.deleteEADModel(model.id);
          break;
        case 3: // ECL
          response = await modelsApi.deleteECLModel(model.id);
          break;
        default:
          return;
      }

      // Handle different response formats
      const isSuccess = response.status >= 200 && response.status < 300;
      
      if (isSuccess) {
        await loadModelsData(); // Refresh data
        alert('Model deleted successfully');
      } else {
        const errorMessage = response.message || response.error || 'Unknown error';
        alert('Failed to delete model: ' + errorMessage);
      }
    } catch (error: any) {
      alert('Error deleting model: ' + error.message);
    }
  }, [activeTab, loadModelsData]);

  const handleSave = useCallback(async (data: Record<string, FormDataEntryValue>) => {
    try {
      let response;
      
      if (editingModel) {
        // Update existing model
        switch (activeTab) {
          case 0: // PD
            response = await modelsApi.updatePDModel(editingModel.id, data);
            break;
          case 1: // LGD
            response = await modelsApi.updateLGDModel(editingModel.id, data);
            break;
          case 2: // EAD
            response = await modelsApi.updateEADModel(editingModel.id, data);
            break;
          case 3: // ECL
            response = await modelsApi.updateECLModel(editingModel.id, data);
            break;
          default:
            return;
        }
      } else {
        // Create new model
        switch (activeTab) {
          case 0: // PD
            response = await modelsApi.createPDModel(data);
            break;
          case 1: // LGD
            response = await modelsApi.createLGDModel(data);
            break;
          case 2: // EAD
            response = await modelsApi.createEADModel(data);
            break;
          case 3: // ECL
            response = await modelsApi.createECLModel(data);
            break;
          default:
            return;
        }
      }

      // Handle different response formats
      const isSuccess = response.status >= 200 && response.status < 300;
      
      if (isSuccess) {
        await loadModelsData(); // Refresh data
        setEditDialogOpen(false);
        setCreateDialogOpen(false);
        setEditingModel(null);
        alert(editingModel ? 'Model updated successfully' : 'Model created successfully');
      } else {
        const errorMessage = response.message || response.error || 'Unknown error';
        alert('Failed to save model: ' + errorMessage);
      }
    } catch (error: any) {
      alert('Error saving model: ' + error.message);
    }
  }, [activeTab, editingModel, loadModelsData]);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0); // Reset pagination when switching tabs
  }, []);

  const getCurrentData = () => {
    switch (activeTab) {
      case 0: return pdModels;
      case 1: return lgdModels;
      case 2: return eadModels;
      case 3: return eclModels;
      default: return [];
    }
  };

  const getCurrentModelType = () => {
    switch (activeTab) {
      case 0: return 'PD';
      case 1: return 'LGD';
      case 2: return 'EAD';
      case 3: return 'ECL';
      default: return '';
    }
  };

  const data = getCurrentData();
  const modelType = getCurrentModelType();

  // Pagination
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end);
  }, [data, page, rowsPerPage]);

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleViewModel = useCallback((model: ModelRecord) => {
    setSelectedModel(model);
    setDialogOpen(true);
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl">
        {/* Breadcrumb Navigation */}
        <PageHeader
          title="IFRS 9 Model Management"
          subtitle="IFRS 9 model management and configuration"
          onRefresh={loadModelsData}
          loading={loading}
          extraActions={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled={loading}
              onClick={handleCreate}
            >
              New {modelType} Model
            </Button>
          }
        />

        {/* Model Type Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Model type tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="PD Models" />
            <Tab label="LGD Models" />
            <Tab label="EAD Models" />
            <Tab label="ECL Models" />
          </Tabs>
        </Paper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Models Data Table */}
        <ModelManagementTable
          loading={loading}
          rowsPerPage={rowsPerPage}
          paginatedData={paginatedData}
          modelType={modelType}
          totalCount={data.length}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          onViewModel={handleViewModel}
          onEditModel={handleEdit}
          onDeleteModel={handleDelete}
        />

        <ModelDetailsDialog
          open={dialogOpen}
          modelType={modelType}
          selectedModel={selectedModel}
          onClose={() => setDialogOpen(false)}
          onEdit={(model) => {
            setDialogOpen(false);
            handleEdit(model);
          }}
        />

        <ModelFormDialog
          open={createDialogOpen}
          mode="create"
          modelType={modelType}
          activeTab={activeTab}
          model={null}
          onClose={() => setCreateDialogOpen(false)}
          onSave={handleSave}
        />

        <ModelFormDialog
          open={editDialogOpen}
          mode="edit"
          modelType={modelType}
          activeTab={activeTab}
          model={editingModel}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleSave}
        />
      </Container>
    </LocalizationProvider>
  );
}
