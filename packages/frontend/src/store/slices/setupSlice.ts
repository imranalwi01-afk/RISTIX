// packages/frontend/src/store/slices/setupSlice.ts
// ============================================================================
// 🩹 SURGICAL FIX: General Setup Parameter Slice
// ============================================================================
// Purpose: Redux state management for Application/Business Setup parameters
// ============================================================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { getErrorMessage } from '@/utils/error-message';

// Types
export interface SetupParameter {
  pkid: number;
  param_code: string;
  param_name: string;
  param_usage: string;
  param_type: 'A' | 'B'; // A = Application, B = Business
  details?: ParameterDetail[];
  createdby?: string;
  createddate?: string;
  updatedby?: string;
  updateddate?: string;
}

export interface ParameterDetail {
  pkid: number;
  param_code: string;
  param_seq: number;
  value1: string;
  value2: string;
  value3: string;
  paramdesc: string;
}

interface SetupState {
  applicationParameters: SetupParameter[];
  businessParameters: SetupParameter[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Initial state
const initialState: SetupState = {
  applicationParameters: [],
  businessParameters: [],
  loading: false,
  saving: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchApplicationParameters = createAsyncThunk(
  'setup/fetchApplicationParameters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.banking.applicationSetup.getAll();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch application parameters'));
    }
  }
);

export const fetchBusinessParameters = createAsyncThunk(
  'setup/fetchBusinessParameters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.banking.businessSetup.getAll();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch business parameters'));
    }
  }
);

export const createApplicationParameter = createAsyncThunk(
  'setup/createApplicationParameter',
  async (data: Partial<SetupParameter>, { rejectWithValue }) => {
    try {
      const response = await api.banking.applicationSetup.create(data);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create application parameter'));
    }
  }
);

export const createBusinessParameter = createAsyncThunk(
  'setup/createBusinessParameter',
  async (data: Partial<SetupParameter>, { rejectWithValue }) => {
    try {
      const response = await api.banking.businessSetup.create(data);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create business parameter'));
    }
  }
);

export const updateApplicationParameter = createAsyncThunk(
  'setup/updateApplicationParameter',
  async ({ paramCode, data }: { paramCode: string; data: Partial<SetupParameter> }, { rejectWithValue }) => {
    try {
      const response = await api.banking.applicationSetup.update(paramCode, data);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update application parameter'));
    }
  }
);

export const updateBusinessParameter = createAsyncThunk(
  'setup/updateBusinessParameter',
  async ({ paramCode, data }: { paramCode: string; data: Partial<SetupParameter> }, { rejectWithValue }) => {
    try {
      const response = await api.banking.businessSetup.update(paramCode, data);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update business parameter'));
    }
  }
);

export const deleteApplicationParameter = createAsyncThunk(
  'setup/deleteApplicationParameter',
  async (paramCode: string, { rejectWithValue }) => {
    try {
      const response = await api.banking.applicationSetup.delete(paramCode);
      if (!response.success) {
        throw new Error(response.message);
      }
      return paramCode;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to delete application parameter'));
    }
  }
);

export const deleteBusinessParameter = createAsyncThunk(
  'setup/deleteBusinessParameter',
  async (paramCode: string, { rejectWithValue }) => {
    try {
      const response = await api.banking.businessSetup.delete(paramCode);
      if (!response.success) {
        throw new Error(response.message);
      }
      return paramCode;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to delete business parameter'));
    }
  }
);

// Setup slice
const setupSlice = createSlice({
  name: 'setup',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch application parameters
      .addCase(fetchApplicationParameters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationParameters.fulfilled, (state, action) => {
        state.loading = false;
        state.applicationParameters = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchApplicationParameters.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch application parameters';
      })
      
      // Fetch business parameters
      .addCase(fetchBusinessParameters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinessParameters.fulfilled, (state, action) => {
        state.loading = false;
        state.businessParameters = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchBusinessParameters.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch business parameters';
      })
      
      // Create/Update/Delete - Application
      .addCase(createApplicationParameter.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createApplicationParameter.fulfilled, (state, action) => {
        state.saving = false;
        state.applicationParameters.push(action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(createApplicationParameter.rejected, (state, action) => {
        state.saving = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to create application parameter';
      })
      
      .addCase(deleteApplicationParameter.fulfilled, (state, action) => {
        state.applicationParameters = state.applicationParameters.filter(
          param => param.param_code !== action.payload
        );
      })
      .addCase(deleteBusinessParameter.fulfilled, (state, action) => {
        state.businessParameters = state.businessParameters.filter(
          param => param.param_code !== action.payload
        );
      });
  },
});

export const { clearError, setError } = setupSlice.actions;
export default setupSlice.reducer;
