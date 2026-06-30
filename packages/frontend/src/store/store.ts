// packages/frontend/src/store/store.ts
// ✅ SURGICAL CREATION: Redux Toolkit store with all required slices

import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { menuQueryApi } from './api/menuApi';

// ✅ Auth Slice
interface AuthState {
  user: any | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: any; accessToken: string; isAuthenticated: boolean }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
});

// ✅ Banking Slice
interface BankingState {
  currentType: 'conventional' | 'dual';
  tenantConfig: any | null;
  features: {
    eclCalculation: boolean;
    portfolioManagement: boolean;
  };
}

const initialBankingState: BankingState = {
  currentType: 'conventional',
  tenantConfig: null,
  features: {
    eclCalculation: true,
    portfolioManagement: true,
  },
};

const bankingSlice = createSlice({
  name: 'banking',
  initialState: initialBankingState,
  reducers: {
    setBankingType: (state, action: PayloadAction<'conventional' | 'dual'>) => {
      state.currentType = action.payload;
    },
    setTenantConfig: (state, action: PayloadAction<any>) => {
      state.tenantConfig = action.payload;
    },
  },
});

// ✅ Theme Slice
interface ThemeState {
  bankingType: 'conventional';
  isDarkMode: boolean;
  preferences: Record<string, any>;
}

const initialThemeState: ThemeState = {
  bankingType: 'conventional',
  isDarkMode: false,
  preferences: {},
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: initialThemeState,
  reducers: {
    setBankingType: (state, action: PayloadAction<'conventional'>) => {
      state.bankingType = action.payload;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    setPreferences: (state, action: PayloadAction<Record<string, any>>) => {
      state.preferences = action.payload;
    },
  },
});

// ✅ Tenant Slice
interface TenantState {
  currentTenant: any | null;
  availableTenants: any[];
  isLoading: boolean;
}

const initialTenantState: TenantState = {
  currentTenant: null,
  availableTenants: [],
  isLoading: false,
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState: initialTenantState,
  reducers: {
    setCurrentTenant: (state, action: PayloadAction<any>) => {
      state.currentTenant = action.payload;
    },
    setAvailableTenants: (state, action: PayloadAction<any[]>) => {
      state.availableTenants = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

// ✅ Configure Store
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    banking: bankingSlice.reducer,
    theme: themeSlice.reducer,
    tenant: tenantSlice.reducer,
    [menuQueryApi.reducerPath]: menuQueryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(menuQueryApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// ✅ Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ✅ Export actions
export const authActions = authSlice.actions;
export const bankingActions = bankingSlice.actions;
export const themeActions = themeSlice.actions;
export const tenantActions = tenantSlice.actions;