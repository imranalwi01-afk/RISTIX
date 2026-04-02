// packages/frontend/src/store/slices/parametersSlice.ts
// ============================================================================
// 🩹 SURGICAL FIX: Parameters Slice for Product/Journal Parameters
// ============================================================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { getErrorMessage } from '@/utils/error-message';

// Types
export interface ProductParameter {
  pkid: number;
  data_source: string;
  prd_group: string;
  prd_type: string;
  prd_code: string;
  prd_desc: string;
  currency: string;
  amortization_type?: string;
  al_flag?: string;
  impaired_flag?: boolean;
  bm_flag?: boolean;
  expected_life?: number;
  borrowing_rate?: number;
  market_rate?: number;
  active_flag: boolean;
}

export interface JournalParameter {
  pkid: number;
  gl_group?: string;
  currency?: string;
  gl_type?: string;
  gl_code?: string;
  gl_number?: string;
  dbcr?: string;
  gl_desc?: string;
  active_flag?: boolean;
}

interface ParametersState {
  products: ProductParameter[];
  journals: JournalParameter[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastUpdated: string | null;
  searchQuery: string;
  filters: {
    activeOnly: boolean;
    productGroup?: string;
    journalGroup?: string;
  };
}

// Initial state
const initialState: ParametersState = {
  products: [],
  journals: [],
  loading: false,
  saving: false,
  error: null,
  lastUpdated: null,
  searchQuery: '',
  filters: {
    activeOnly: true,
  },
};

// Async thunks for products
export const fetchProductParameters = createAsyncThunk(
  'parameters/fetchProducts',
  async (params: any = undefined, { rejectWithValue }) => {
    try {
      const response = await api.banking.productParameters.getAll(params);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch product parameters'));
    }
  }
);

export const createProductParameter = createAsyncThunk(
  'parameters/createProduct',
  async (data: Partial<ProductParameter>, { rejectWithValue }) => {
    try {
      const response = await api.banking.productParameters.create(data);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create product parameter'));
    }
  }
);

export const updateProductParameter = createAsyncThunk(
  'parameters/updateProduct',
  async ({ id, data }: { id: number; data: Partial<ProductParameter> }, { rejectWithValue }) => {
    try {
      const response = await api.banking.productParameters.update(id.toString(), data);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update product parameter'));
    }
  }
);

export const deleteProductParameter = createAsyncThunk(
  'parameters/deleteProduct',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.banking.productParameters.delete(id.toString());
      if (!response.success) {
        throw new Error(response.message);
      }
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to delete product parameter'));
    }
  }
);

// Async thunks for journals
export const fetchJournalParameters = createAsyncThunk(
  'parameters/fetchJournals',
  async (params: any = undefined, { rejectWithValue }) => {
    try {
      const response = await api.banking.journalParameters.getAll();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch journal parameters'));
    }
  }
);

export const createJournalParameter = createAsyncThunk(
  'parameters/createJournal',
  async (data: Partial<JournalParameter>, { rejectWithValue }) => {
    try {
      const response = await api.banking.journalParameters.create(data);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create journal parameter'));
    }
  }
);

export const updateJournalParameter = createAsyncThunk(
  'parameters/updateJournal',
  async ({ id, data }: { id: number; data: Partial<JournalParameter> }, { rejectWithValue }) => {
    try {
      const response = await api.banking.journalParameters.update(id, data);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update journal parameter'));
    }
  }
);

export const deleteJournalParameter = createAsyncThunk(
  'parameters/deleteJournal',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.banking.journalParameters.delete(id);
      if (!response.success) {
        throw new Error(response.message);
      }
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to delete journal parameter'));
    }
  }
);

// Parameters slice
const parametersSlice = createSlice({
  name: 'parameters',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<ParametersState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { activeOnly: true };
      state.searchQuery = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Product parameters
      .addCase(fetchProductParameters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductParameters.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchProductParameters.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch product parameters';
      })

      .addCase(createProductParameter.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createProductParameter.fulfilled, (state, action) => {
        state.saving = false;
        state.products.push(action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(createProductParameter.rejected, (state, action) => {
        state.saving = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to create product parameter';
      })

      .addCase(deleteProductParameter.fulfilled, (state, action) => {
        state.products = state.products.filter(product => product.pkid !== action.payload);
        state.lastUpdated = new Date().toISOString();
      })

      // Journal parameters
      .addCase(fetchJournalParameters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJournalParameters.fulfilled, (state, action) => {
        state.loading = false;
        state.journals = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchJournalParameters.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch journal parameters';
      })

      .addCase(createJournalParameter.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createJournalParameter.fulfilled, (state, action) => {
        state.saving = false;
        state.journals.push(action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(createJournalParameter.rejected, (state, action) => {
        state.saving = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to create journal parameter';
      })

      .addCase(deleteJournalParameter.fulfilled, (state, action) => {
        state.journals = state.journals.filter(journal => journal.pkid !== action.payload);
        state.lastUpdated = new Date().toISOString();
      });
  },
});

export const {
  clearError,
  setError,
  setSearchQuery,
  updateFilters,
  clearFilters
} = parametersSlice.actions;

export default parametersSlice.reducer;
