// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/store/slices/banking-theme.slice.ts
// Generated: 2025-07-22T20:25:00Z
// Phase: D2H6 - Dual Banking Admin Themes (Banking Theme Slice)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Redux Toolkit
// Purpose: Redux state management for dual banking theme system
// ============================================================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export type BankingType = 'conventional' | 'dual';
export type ThemeMode = 'light' | 'dark';
export type LanguageType = 'en' | 'id' | 'ar';

interface BankingThemeState {
  currentBankingType: BankingType;
  currentMode: ThemeMode;
  currentLanguage: LanguageType;
  isThemeSwitching: boolean;
  switchingProgress: number;
  tenantId: string | null;
  isLoading: boolean;
  error: string | null;
  analytics: {
    switchCount: number;
    lastSwitchTimestamp: string | null;
    popularBankingType: BankingType;
  };
}

// Initial state
const initialState: BankingThemeState = {
  currentBankingType: 'conventional',
  currentMode: 'light',
  currentLanguage: 'en',
  isThemeSwitching: false,
  switchingProgress: 0,
  tenantId: null,
  isLoading: false,
  error: null,
  analytics: {
    switchCount: 0,
    lastSwitchTimestamp: null,
    popularBankingType: 'conventional',
  },
};

// Async thunk for theme switching
export const switchBankingTheme = createAsyncThunk(
  'bankingTheme/switchBankingTheme',
  async (payload: { bankingType: BankingType; tenantId?: string }) => {
    const { bankingType, tenantId } = payload;
    
    // Simulate theme switching with progress
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Save preferences
    localStorage.setItem('ifrs-pro-banking-type', bankingType);
    localStorage.setItem('ifrs-pro-theme-switched-at', new Date().toISOString());
    
    return {
      bankingType,
      tenantId,
      timestamp: new Date().toISOString()
    };
  }
);

// Banking theme slice
export const bankingThemeSlice = createSlice({
  name: 'bankingTheme',
  initialState,
  reducers: {
    setBankingType: (state, action: PayloadAction<BankingType>) => {
      state.currentBankingType = action.payload;
    },
    
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.currentMode = action.payload;
    },
    
    setLanguage: (state, action: PayloadAction<LanguageType>) => {
      state.currentLanguage = action.payload;
    },
    
    setBankingThemeSwitching: (state, action: PayloadAction<boolean>) => {
      state.isThemeSwitching = action.payload;
      if (!action.payload) {
        state.switchingProgress = 0;
      }
    },
    
    setBankingThemeSwitchingProgress: (state, action: PayloadAction<number>) => {
      state.switchingProgress = Math.min(100, Math.max(0, action.payload));
    },
    
    setTenantId: (state, action: PayloadAction<string | null>) => {
      state.tenantId = action.payload;
    },
    
    incrementSwitchCount: (state) => {
      state.analytics.switchCount += 1;
      state.analytics.lastSwitchTimestamp = new Date().toISOString();
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    resetTheme: (state) => {
      return {
        ...initialState,
        tenantId: state.tenantId,
      };
    }
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(switchBankingTheme.pending, (state) => {
        state.isThemeSwitching = true;
        state.switchingProgress = 0;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(switchBankingTheme.fulfilled, (state, action) => {
        state.isThemeSwitching = false;
        state.switchingProgress = 100;
        state.isLoading = false;
        state.currentBankingType = action.payload.bankingType;
        state.analytics.switchCount += 1;
        state.analytics.lastSwitchTimestamp = action.payload.timestamp;
      })
      .addCase(switchBankingTheme.rejected, (state, action) => {
        state.isThemeSwitching = false;
        state.switchingProgress = 0;
        state.isLoading = false;
        state.error = action.error.message || 'Failed to switch banking theme';
      });
  }
});

// Export actions
export const {
  setBankingType,
  setThemeMode,
  setLanguage,
  setBankingThemeSwitching,
  setBankingThemeSwitchingProgress,
  setTenantId,
  incrementSwitchCount,
  setError,
  clearError,
  resetTheme
} = bankingThemeSlice.actions;

// Selectors
export const selectBankingTheme = (state: { bankingTheme: BankingThemeState }) => state.bankingTheme;
export const selectCurrentBankingType = (state: { bankingTheme: BankingThemeState }) => state.bankingTheme.currentBankingType;
export const selectCurrentMode = (state: { bankingTheme: BankingThemeState }) => state.bankingTheme.currentMode;
export const selectIsThemeSwitching = (state: { bankingTheme: BankingThemeState }) => state.bankingTheme.isThemeSwitching;

// Export reducer
export default bankingThemeSlice.reducer;
