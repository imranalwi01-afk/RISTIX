// ============================================================================
// packages/frontend/src/store/slices/bankingSlice.ts
// ============================================================================
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BankingState {
  mode: 'conventional' | 'syariah' | 'dual';
  currentTenant: string | null;
  bankingFeatures: Record<string, boolean>;
  calculations: any[];
  loading: boolean;
}

const initialState: BankingState = {
  mode: 'conventional',
  currentTenant: null,
  bankingFeatures: {},
  calculations: [],
  loading: false,
};

const bankingSlice = createSlice({
  name: 'banking',
  initialState,
  reducers: {
    setBankingMode: (state, action: PayloadAction<'conventional' | 'syariah' | 'dual'>) => {
      state.mode = action.payload;
    },
    setCurrentTenant: (state, action: PayloadAction<string>) => {
      state.currentTenant = action.payload;
    },
    updateBankingFeature: (state, action: PayloadAction<{ feature: string; enabled: boolean }>) => {
      state.bankingFeatures[action.payload.feature] = action.payload.enabled;
    },
    addCalculation: (state, action: PayloadAction<any>) => {
      state.calculations.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setBankingMode, setCurrentTenant, updateBankingFeature, addCalculation, setLoading } = bankingSlice.actions;
export default bankingSlice.reducer;