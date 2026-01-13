'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, Theme } from '@mui/material/styles';
import { useConfiguration } from './ConfigurationProvider';
import { getConventionalTheme, PaletteMode } from '../themes/conventional/theme';
// We'll treat syariah as conventional for now or need similar refactor. 
// For this step, we'll focus on making the main conventional theme dynamic.
// If syariah theme isn't refactored yet, we can fallback to light mode for it or wrap it later.
// To keep it simple, we assume syariah is currently static or less critical for this user request.
// Importing static for syariah for now to avoid breaking imports.
import { syariahBankingTheme as staticSyariahTheme } from '../themes/syariah/theme';

export type BankingMode = 'conventional' | 'syariah' | 'dual';

interface BankingThemeContextType {
  currentTheme: Theme;
  bankingMode: BankingMode;
  colorMode: PaletteMode;
  setBankingMode: (mode: BankingMode) => void;
  setTheme: (mode: BankingMode) => void; // Alias for setBankingMode to match component usage
  toggleTheme: () => void; // Switches banking mode (conv/syariah)
  toggleColorMode: () => void; // Switches light/dark
  isLoading: boolean;
  isConventionalTheme: boolean;
  isSyariahTheme: boolean;
}

const BankingThemeContext = createContext<BankingThemeContextType | undefined>(undefined);

interface BankingThemeProviderProps {
  children: ReactNode;
}

export const BankingThemeProvider: React.FC<BankingThemeProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { config } = useConfiguration();

  // Get user info from Redux store/LocalStorage
  const user = useSelector((state: any) => state.auth?.user);
  const storedBankingMode = useSelector((state: any) => state.configuration?.bankingMode);

  const [bankingMode, setBankingModeState] = useState<BankingMode>('conventional');
  const [colorMode, setColorMode] = useState<PaletteMode>('light');
  const [currentTheme, setCurrentTheme] = useState<Theme>(getConventionalTheme('light'));
  const [isLoading, setIsLoading] = useState(true);

  // Initialize state on mount
  useEffect(() => {
    let mode: BankingMode = 'conventional';
    let cMode: PaletteMode = 'light';

    if (typeof window !== 'undefined') {
      const storedBMode = localStorage.getItem('ifrs9_banking_mode') as BankingMode;
      if (storedBMode) mode = storedBMode;

      const storedCMode = localStorage.getItem('ifrs9_color_mode') as PaletteMode;
      if (storedCMode) cMode = storedCMode;
    }

    if (storedBankingMode) mode = storedBankingMode;

    setBankingModeState(mode);
    setColorMode(cMode);
    setIsLoading(false);
  }, [storedBankingMode]);

  // Update Theme whenever bankingMode or colorMode changes
  useEffect(() => {
    let theme: Theme;
    if (bankingMode === 'syariah') {
      // Fallback for Syariah (using static for now, or could map it similarly)
      theme = staticSyariahTheme || getConventionalTheme(colorMode);
    } else {
      theme = getConventionalTheme(colorMode);
    }
    setCurrentTheme(theme);
  }, [bankingMode, colorMode]);


  const setBankingMode = (mode: BankingMode) => {
    setBankingModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ifrs9_banking_mode', mode);
    }
    dispatch({ type: 'configuration/setBankingMode', payload: mode });
  };

  const toggleTheme = () => {
    // Legacy toggle for banking mode
    const newMode = bankingMode === 'conventional' ? 'syariah' : 'conventional';
    setBankingMode(newMode);
  };

  const toggleColorMode = () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ifrs9_color_mode', newMode);
    }
  };

  const contextValue: BankingThemeContextType = {
    currentTheme,
    bankingMode,
    colorMode,
    setBankingMode,
    setTheme: setBankingMode,
    toggleTheme,
    toggleColorMode,
    isLoading,
    isConventionalTheme: bankingMode === 'conventional',
    isSyariahTheme: bankingMode === 'syariah',
  };

  if (isLoading) {
    return null; // Or loading spinner
  }

  return (
    <BankingThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={currentTheme}>
        {children}
      </ThemeProvider>
    </BankingThemeContext.Provider>
  );
};

export const useBankingTheme = (): BankingThemeContextType => {
  const context = useContext(BankingThemeContext);
  if (context === undefined) {
    throw new Error('useBankingTheme must be used within a BankingThemeProvider');
  }
  return context;
};

export { BankingThemeContext };