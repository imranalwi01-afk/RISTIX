// packages/frontend/src/store/slices/analyticsSlice.ts
// ============================================================================
// ANALYTICS REDUX SLICE - IFRS9 ANALYTICS STATE MANAGEMENT
// ============================================================================
// File Path: packages/frontend/src/store/slices/analyticsSlice.ts
// Purpose: Redux state management for banking analytics dashboard
// Dependencies: Redux Toolkit, following established bankingSlice pattern
// Features: KPI metrics, R analytics, reports, export jobs
// ============================================================================

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getErrorMessage } from '@/utils/error-message';

// ✅ Analytics data types following your established patterns
export interface KPIMetrics {
  totalECL: number;
  eclTrend: number;
  portfolioValue: number;
  riskCoverage: number;
  stage1Ratio: number;
  stage2Ratio: number;
  stage3Ratio: number;
  calculationDate: string;
  currency: 'IDR' | 'USD' | 'EUR';
}

export interface RAnalyticsModel {
  id: string;
  name: string;
  type: 'PD' | 'LGD' | 'EAD' | 'STRESS_TEST';
  status: 'active' | 'draft' | 'archived';
  lastRun: string;
  accuracy: number;
  description: string;
}

export interface RExecutionJob {
  id: string;
  modelId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  completedAt?: string;
  results?: any;
  error?: string;
}

export interface FinancialReport {
  id: string;
  name: string;
  type: 'regulatory' | 'internal' | 'executive';
  format: 'pdf' | 'excel' | 'csv';
  status: 'available' | 'generating' | 'failed';
  generatedAt?: string;
  size?: number;
  downloadUrl?: string;
}

export interface ExportJob {
  id: string;
  type: 'portfolio' | 'calculations' | 'reports' | 'analytics';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  error?: string;
}

export interface AnalyticsFilters {
  dateRange: {
    start: string;
    end: string;
  };
  portfolioTypes: string[];
  bankingMode: 'conventional' | 'syariah' | 'all';
  stages: number[];
  riskCategories: string[];
}

export interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: any[];
  config: any;
  lastUpdated: string;
}

// ✅ Analytics state interface
interface AnalyticsState {
  // Dashboard metrics
  kpiMetrics: KPIMetrics | null;
  kpiLoading: boolean;
  kpiError: string | null;
  
  // R Analytics
  rModels: RAnalyticsModel[];
  rExecutions: RExecutionJob[];
  rModelsLoading: boolean;
  rExecutionLoading: boolean;
  
  // Financial Reports
  reports: FinancialReport[];
  reportsLoading: boolean;
  reportGenerating: Record<string, boolean>;
  
  // Export Jobs
  exportJobs: ExportJob[];
  exportLoading: boolean;
  
  // Charts and Visualizations
  charts: ChartData[];
  chartsLoading: boolean;
  
  // Filters and Configuration
  filters: AnalyticsFilters;
  realTimeEnabled: boolean;
  refreshInterval: number;
  
  // UI State
  selectedView: 'dashboard' | 'r-analytics' | 'reports' | 'export';
  sidebarOpen: boolean;
  
  // General loading and error state
  loading: boolean;
  error: string | null;
}

// ✅ Initial state following your established pattern
const initialState: AnalyticsState = {
  kpiMetrics: null,
  kpiLoading: false,
  kpiError: null,
  
  rModels: [],
  rExecutions: [],
  rModelsLoading: false,
  rExecutionLoading: false,
  
  reports: [],
  reportsLoading: false,
  reportGenerating: {},
  
  exportJobs: [],
  exportLoading: false,
  
  charts: [],
  chartsLoading: false,
  
  filters: {
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      end: new Date().toISOString().split('T')[0], // today
    },
    portfolioTypes: ['all'],
    bankingMode: 'all',
    stages: [1, 2, 3],
    riskCategories: ['all'],
  },
  realTimeEnabled: false,
  refreshInterval: 30000, // 30 seconds
  
  selectedView: 'dashboard',
  sidebarOpen: true,
  
  loading: false,
  error: null,
};

// ✅ Async thunks for API operations
export const fetchKPIMetrics = createAsyncThunk(
  'analytics/fetchKPIMetrics',
  async (filters: AnalyticsFilters, { rejectWithValue }) => {
    try {
      // This will be implemented when backend analytics API is ready
      // const response = await api.analytics.getKPIMetrics(filters);
      
      // Mock data for now
      const mockMetrics: KPIMetrics = {
        totalECL: 3750000,
        eclTrend: -2.3,
        portfolioValue: 285000000,
        riskCoverage: 92.5,
        stage1Ratio: 85,
        stage2Ratio: 11,
        stage3Ratio: 4,
        calculationDate: new Date().toISOString().split('T')[0],
        currency: 'IDR',
      };
      
      return mockMetrics;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch KPI metrics'));
    }
  }
);

export const fetchRModels = createAsyncThunk(
  'analytics/fetchRModels',
  async (_, { rejectWithValue }) => {
    try {
      // Mock R models data
      const mockModels: RAnalyticsModel[] = [
        {
          id: 'rm_001',
          name: 'PD Model - Corporate Loans',
          type: 'PD',
          status: 'active',
          lastRun: new Date().toISOString(),
          accuracy: 94.2,
          description: 'Probability of Default model for corporate loan portfolio',
        },
        {
          id: 'rm_002',
          name: 'LGD Model - Retail Banking',
          type: 'LGD',
          status: 'active',
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          accuracy: 87.8,
          description: 'Loss Given Default model for retail banking products',
        },
      ];
      
      return mockModels;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch R models'));
    }
  }
);

export const executeRModel = createAsyncThunk(
  'analytics/executeRModel',
  async (modelId: string, { rejectWithValue }) => {
    try {
      // This will call R analytics API when backend is ready
      const executionJob: RExecutionJob = {
        id: `exec_${Date.now()}`,
        modelId,
        status: 'running',
        progress: 0,
        startedAt: new Date().toISOString(),
      };
      
      return executionJob;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to execute R model'));
    }
  }
);

export const generateReport = createAsyncThunk(
  'analytics/generateReport',
  async (reportConfig: { type: string; format: string; filters: AnalyticsFilters }, { rejectWithValue }) => {
    try {
      const reportJob: FinancialReport = {
        id: `report_${Date.now()}`,
        name: `${reportConfig.type} Report`,
        type: reportConfig.type as any,
        format: reportConfig.format as any,
        status: 'generating',
        generatedAt: new Date().toISOString(),
      };
      
      return reportJob;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to generate report'));
    }
  }
);

export const createExportJob = createAsyncThunk(
  'analytics/createExportJob',
  async (exportConfig: { type: string; format: string; filters: AnalyticsFilters }, { rejectWithValue }) => {
    try {
      const exportJob: ExportJob = {
        id: `export_${Date.now()}`,
        type: exportConfig.type as any,
        format: exportConfig.format as any,
        status: 'queued',
        progress: 0,
        createdAt: new Date().toISOString(),
      };
      
      return exportJob;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create export job'));
    }
  }
);

// ✅ Analytics slice following your established pattern
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    // UI State Management
    setSelectedView: (state, action: PayloadAction<'dashboard' | 'r-analytics' | 'reports' | 'export'>) => {
      state.selectedView = action.payload;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setRealTimeEnabled: (state, action: PayloadAction<boolean>) => {
      state.realTimeEnabled = action.payload;
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
    
    // Filters Management
    updateFilters: (state, action: PayloadAction<Partial<AnalyticsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Charts Management
    addChart: (state, action: PayloadAction<ChartData>) => {
      state.charts.push(action.payload);
    },
    updateChart: (state, action: PayloadAction<{ id: string; data: Partial<ChartData> }>) => {
      const index = state.charts.findIndex(chart => chart.id === action.payload.id);
      if (index !== -1) {
        state.charts[index] = { ...state.charts[index], ...action.payload.data };
      }
    },
    removeChart: (state, action: PayloadAction<string>) => {
      state.charts = state.charts.filter(chart => chart.id !== action.payload);
    },
    
    // R Execution Management
    updateRExecutionProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const execution = state.rExecutions.find(exec => exec.id === action.payload.id);
      if (execution) {
        execution.progress = action.payload.progress;
      }
    },
    completeRExecution: (state, action: PayloadAction<{ id: string; results: any }>) => {
      const execution = state.rExecutions.find(exec => exec.id === action.payload.id);
      if (execution) {
        execution.status = 'completed';
        execution.progress = 100;
        execution.completedAt = new Date().toISOString();
        execution.results = action.payload.results;
      }
    },
    
    // Export Job Management
    updateExportProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const job = state.exportJobs.find(job => job.id === action.payload.id);
      if (job) {
        job.progress = action.payload.progress;
      }
    },
    completeExportJob: (state, action: PayloadAction<{ id: string; downloadUrl: string }>) => {
      const job = state.exportJobs.find(job => job.id === action.payload.id);
      if (job) {
        job.status = 'completed';
        job.progress = 100;
        job.completedAt = new Date().toISOString();
        job.downloadUrl = action.payload.downloadUrl;
      }
    },
    
    // Report Management
    completeReportGeneration: (state, action: PayloadAction<{ id: string; downloadUrl: string; size: number }>) => {
      const report = state.reports.find(report => report.id === action.payload.id);
      if (report) {
        report.status = 'available';
        report.downloadUrl = action.payload.downloadUrl;
        report.size = action.payload.size;
      }
    },
    
    // Error Management
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Loading States
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // KPI Metrics
    builder
      .addCase(fetchKPIMetrics.pending, (state) => {
        state.kpiLoading = true;
        state.kpiError = null;
      })
      .addCase(fetchKPIMetrics.fulfilled, (state, action) => {
        state.kpiLoading = false;
        state.kpiMetrics = action.payload;
        state.kpiError = null;
      })
      .addCase(fetchKPIMetrics.rejected, (state, action) => {
        state.kpiLoading = false;
        state.kpiError = action.payload as string;
      });
    
    // R Models
    builder
      .addCase(fetchRModels.pending, (state) => {
        state.rModelsLoading = true;
      })
      .addCase(fetchRModels.fulfilled, (state, action) => {
        state.rModelsLoading = false;
        state.rModels = action.payload;
      })
      .addCase(fetchRModels.rejected, (state, action) => {
        state.rModelsLoading = false;
        state.error = action.payload as string;
      });
    
    // R Model Execution
    builder
      .addCase(executeRModel.pending, (state) => {
        state.rExecutionLoading = true;
      })
      .addCase(executeRModel.fulfilled, (state, action) => {
        state.rExecutionLoading = false;
        state.rExecutions.push(action.payload);
      })
      .addCase(executeRModel.rejected, (state, action) => {
        state.rExecutionLoading = false;
        state.error = action.payload as string;
      });
    
    // Report Generation
    builder
      .addCase(generateReport.pending, (state) => {
        state.reportsLoading = true;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.reportsLoading = false;
        state.reports.push(action.payload);
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.reportsLoading = false;
        state.error = action.payload as string;
      });
    
    // Export Jobs
    builder
      .addCase(createExportJob.pending, (state) => {
        state.exportLoading = true;
      })
      .addCase(createExportJob.fulfilled, (state, action) => {
        state.exportLoading = false;
        state.exportJobs.push(action.payload);
      })
      .addCase(createExportJob.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.payload as string;
      });
  },
});

// ✅ Export actions and reducer following your pattern
export const {
  setSelectedView,
  setSidebarOpen,
  setRealTimeEnabled,
  setRefreshInterval,
  updateFilters,
  resetFilters,
  addChart,
  updateChart,
  removeChart,
  updateRExecutionProgress,
  completeRExecution,
  updateExportProgress,
  completeExportJob,
  completeReportGeneration,
  setError,
  clearError,
  setLoading,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
