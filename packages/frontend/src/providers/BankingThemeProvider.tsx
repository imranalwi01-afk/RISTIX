// packages/frontend/src/providers/BankingThemeProvider.tsx
// ============================================================================
// IFRS9 BANKING THEME PROVIDER - SURGICAL FIX FOR $$material ERROR
// ============================================================================
// ✅ SURGICAL FIX: Robust theme fallbacks to prevent undefined themes
// ✅ FIXED: Never pass undefined to Material-UI ThemeProvider
// ============================================================================

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { useConfiguration } from './ConfigurationProvider';

// ✅ SURGICAL FIX: Create robust default themes to prevent undefined themes
const createDefaultConventionalTheme = (): Theme => createTheme({
  palette: {
    primary: { main: '#0078BD' },
    secondary: { main: '#3393ca' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const createDefaultSyariahTheme = (): Theme => createTheme({
  palette: {
    primary: { main: '#2e7d32' },
    secondary: { main: '#66bb6a' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// ✅ SURGICAL FIX: Safer theme imports with guaranteed fallbacks
const loadThemes = async (): Promise<{ conventional: Theme; syariah: Theme }> => {
  let conventionalTheme: Theme;
  let syariahTheme: Theme;

  // Load conventional theme with fallback
  try {
    const conventionalModule = await import('../themes/conventional/theme');
    conventionalTheme = conventionalModule.conventionalBankingTheme || conventionalModule.default;
    if (!conventionalTheme) {
      throw new Error('No theme exported');
    }
    console.log('✅ Conventional theme loaded successfully');
  } catch (error) {
    console.warn('⚠️ Conventional theme not found, using fallback');
    conventionalTheme = createDefaultConventionalTheme();
  }

  // Load syariah theme with fallback
  try {
    const syariahModule = await import('../themes/syariah/theme');
    syariahTheme = syariahModule.syariahBankingTheme || syariahModule.default;
    if (!syariahTheme) {
      throw new Error('No theme exported');
    }
    console.log('✅ Syariah theme loaded successfully');
  } catch (error) {
    console.warn('⚠️ Syariah theme not found, using fallback');
    syariahTheme = createDefaultSyariahTheme();
  }

  return { conventional: conventionalTheme, syariah: syariahTheme };
};

type BankingMode = 'conventional' | 'syariah' | 'dual';

interface BankingThemeContextType {
  currentTheme: Theme;
  bankingMode: BankingMode;
  setBankingMode: (mode: BankingMode) => void;
  toggleTheme: () => void;
  availableThemes: { conventional: Theme; syariah: Theme } | null;
  isLoading: boolean;
}

const BankingThemeContext = createContext<BankingThemeContextType | undefined>(undefined);

interface BankingThemeProviderProps {
  children: ReactNode;
}

export const BankingThemeProvider: React.FC<BankingThemeProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { config } = useConfiguration();
  
  // Get user info from Redux store
  const user = useSelector((state: any) => state.auth?.user);
  const storedBankingMode = useSelector((state: any) => state.configuration?.bankingMode);
  
  const [themes, setThemes] = useState<{ conventional: Theme; syariah: Theme } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bankingMode, setBankingModeState] = useState<BankingMode>(
    storedBankingMode || config?.banking?.defaultMode || 'conventional'
  );
  
  // ✅ SURGICAL FIX: Always initialize with a valid theme, never undefined
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => createDefaultConventionalTheme());

  // Load themes on mount
  useEffect(() => {
    const initializeThemes = async () => {
      try {
        const loadedThemes = await loadThemes();
        setThemes(loadedThemes);
        
        // ✅ SURGICAL FIX: Ensure theme is always valid
        const initialTheme = getCurrentTheme(bankingMode, loadedThemes);
        setCurrentTheme(initialTheme);
        
        console.log('🎨 Banking themes initialized successfully');
      } catch (error) {
        console.error('❌ Failed to load banking themes:', error);
        // ✅ SURGICAL FIX: Even on error, ensure we have valid themes
        const fallbackThemes = {
          conventional: createDefaultConventionalTheme(),
          syariah: createDefaultSyariahTheme()
        };
        setThemes(fallbackThemes);
        setCurrentTheme(fallbackThemes.conventional);
      } finally {
        setIsLoading(false);
      }
    };

    initializeThemes();
  }, []);

  // ✅ SURGICAL FIX: Guaranteed to return a valid Theme, never undefined
  const getCurrentTheme = (
    mode: BankingMode, 
    themeSet?: { conventional: Theme; syariah: Theme } | null
  ): Theme => {
    const useThemes = themeSet || themes;
    
    // ✅ SURGICAL FIX: Always return a valid theme
    if (!useThemes) {
      return currentTheme || createDefaultConventionalTheme();
    }

    switch (mode) {
      case 'syariah':
        return useThemes.syariah || createDefaultSyariahTheme();
      case 'conventional':
        return useThemes.conventional || createDefaultConventionalTheme();
      case 'dual':
        // For dual banking, choose based on user role
        if (user?.role?.includes('SYARIAH') || user?.role?.includes('DPS')) {
          return useThemes.syariah || createDefaultSyariahTheme();
        }
        return useThemes.conventional || createDefaultConventionalTheme();
      default:
        return useThemes.conventional || createDefaultConventionalTheme();
    }
  };

  // Set banking mode and update theme
  const setBankingMode = (mode: BankingMode) => {
    setBankingModeState(mode);
    
    // ✅ SURGICAL FIX: Always ensure valid theme
    const newTheme = getCurrentTheme(mode);
    setCurrentTheme(newTheme);
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ifrs9_banking_mode', mode);
      } catch (error) {
        console.warn('⚠️ Could not persist banking mode to localStorage');
      }
    }
    
    // Update Redux store
    try {
      dispatch({ type: 'configuration/setBankingMode', payload: mode });
    } catch (error) {
      console.warn('⚠️ Could not update Redux store with banking mode');
    }
    
    console.log(`🎨 Banking theme switched to: ${mode}`);
  };

  // Toggle between conventional and syariah
  const toggleTheme = () => {
    if (bankingMode === 'dual') {
      // In dual mode, toggle between the two themes
      const newMode = currentTheme === themes?.conventional ? 'syariah' : 'conventional';
      setBankingMode(newMode);
    } else {
      // Switch between conventional and syariah
      const newMode = bankingMode === 'conventional' ? 'syariah' : 'conventional';
      setBankingMode(newMode);
    }
  };

  // Initialize banking mode from various sources
  useEffect(() => {
    let initialMode: BankingMode = 'conventional';
    
    // Priority 1: User role
    if (user?.role) {
      if (user.role.includes('SYARIAH') || user.role.includes('DPS')) {
        initialMode = 'syariah';
      } else if (user.role.includes('DUAL_BANKING')) {
        initialMode = 'dual';
      }
    }
    
    // Priority 2: Stored preference
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ifrs9_banking_mode') as BankingMode;
        if (stored && ['conventional', 'syariah', 'dual'].includes(stored)) {
          initialMode = stored;
        }
      } catch (error) {
        console.warn('⚠️ Could not read banking mode from localStorage');
      }
    }
    
    // Priority 3: Configuration default
    if (config?.banking?.defaultMode) {
      initialMode = config.banking.defaultMode;
    }
    
    setBankingMode(initialMode);
  }, [user, config, themes]);

  // Update theme when banking mode changes
  useEffect(() => {
    // ✅ SURGICAL FIX: Always ensure valid theme update
    const newTheme = getCurrentTheme(bankingMode);
    setCurrentTheme(newTheme);
  }, [bankingMode, user, themes]);

  const contextValue: BankingThemeContextType = {
    currentTheme,
    bankingMode,
    setBankingMode,
    toggleTheme,
    availableThemes: themes,
    isLoading,
  };

  // Show loading while themes are loading
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
            🎨 Loading Banking Themes...
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Preparing dual banking interface
          </div>
        </div>
      </div>
    );
  }

  // ✅ SURGICAL FIX: Guarantee currentTheme is never undefined
  const safeCurrentTheme = currentTheme || createDefaultConventionalTheme();

  return (
    <BankingThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={safeCurrentTheme}>
        {children}
      </ThemeProvider>
    </BankingThemeContext.Provider>
  );
};

// Custom hook to use banking theme
export const useBankingTheme = (): BankingThemeContextType => {
  const context = useContext(BankingThemeContext);
  if (context === undefined) {
    throw new Error('useBankingTheme must be used within a BankingThemeProvider');
  }
  return context;
};

// Export context for advanced usage
export { BankingThemeContext };

// Utility function to get theme by banking mode
export const getThemeByBankingMode = (
  mode: BankingMode, 
  themes?: { conventional: Theme; syariah: Theme }
): Theme => {
  if (!themes) {
    return mode === 'syariah' ? createDefaultSyariahTheme() : createDefaultConventionalTheme();
  }
  
  switch (mode) {
    case 'syariah':
      return themes.syariah || createDefaultSyariahTheme();
    case 'conventional':
    default:
      return themes.conventional || createDefaultConventionalTheme();
  }
};