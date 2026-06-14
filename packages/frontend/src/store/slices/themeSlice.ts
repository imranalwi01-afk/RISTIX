// ============================================================================
// packages/frontend/src/store/slices/themeSlice.ts
// ============================================================================
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  mode: 'light' | 'dark';
  bankingTheme: 'conventional';
  primaryColor: string;
  language: string;
  rtl: boolean;
}

const initialState: ThemeState = {
  mode: 'light',
  bankingTheme: 'conventional',
  primaryColor: '#1976d2',
  language: 'en',
  rtl: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.mode = action.payload;
    },
    setBankingTheme: (state, action: PayloadAction<'conventional'>) => {
      state.bankingTheme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
      state.rtl = action.payload === 'ar';
    },
  },
});

export const { setThemeMode, setBankingTheme, setLanguage } = themeSlice.actions;
export default themeSlice.reducer;