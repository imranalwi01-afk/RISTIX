// packages/frontend/src/store/hooks.ts
// ============================================================================
// IFRS9 FRONTEND - TYPED REDUX HOOKS
// ============================================================================
// File Path: packages/frontend/src/store/hooks.ts
// Purpose: TypeScript typed hooks for Redux store
// Dependencies: react-redux, store types
// ============================================================================

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// ============================================================================
// TYPED HOOKS
// ============================================================================

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ============================================================================
// CUSTOM SELECTOR HOOKS
// ============================================================================

// Auth selectors
export const useAuth = () => useAppSelector((state) => state.auth);
export const useUser = () => useAppSelector((state) => state.auth.user);
export const useIsAuthenticated = () => useAppSelector((state) => state.auth.isAuthenticated);
export const useAuthToken = () => useAppSelector((state) => state.auth.token);
export const useAuthLoading = () => useAppSelector((state) => state.auth.loading);
export const useAuthError = () => useAppSelector((state) => state.auth.error);

// Configuration selectors
export const useConfiguration = () => useAppSelector((state) => state.configuration);
export const useBankingMode = () => useAppSelector((state) => state.configuration.bankingMode);
export const useFeatures = () => useAppSelector((state) => state.configuration.features);
export const useApiUrl = () => useAppSelector((state) => state.configuration.apiUrl);
export const useEnvironment = () => useAppSelector((state) => state.configuration.environment);

// UI selectors
export const useUI = () => useAppSelector((state) => state.ui);
export const useSidebarOpen = () => useAppSelector((state) => state.ui.sidebarOpen);
export const useTheme = () => useAppSelector((state) => state.ui.theme);
export const useLanguage = () => useAppSelector((state) => state.ui.language);
export const useUILoading = () => useAppSelector((state) => state.ui.loading);
export const useNotifications = () => useAppSelector((state) => state.ui.notifications);
export const useModals = () => useAppSelector((state) => state.ui.modals);

// ============================================================================
// CUSTOM ACTION HOOKS
// ============================================================================

export const useAuthActions = () => {
  const dispatch = useAppDispatch();
  
  return {
    loginStart: () => dispatch({ type: 'auth/loginStart' }),
    loginSuccess: (payload: { user: any; token: string; refreshToken: string }) => 
      dispatch({ type: 'auth/loginSuccess', payload }),
    loginFailure: (error: string) => dispatch({ type: 'auth/loginFailure', payload: error }),
    logout: () => dispatch({ type: 'auth/logout' }),
    updateToken: (token: string) => dispatch({ type: 'auth/updateToken', payload: token }),
    clearError: () => dispatch({ type: 'auth/clearError' }),
  };
};

export const useConfigurationActions = () => {
  const dispatch = useAppDispatch();
  
  return {
    setConfiguration: (config: any) => dispatch({ type: 'configuration/setConfiguration', payload: config }),
    setBankingMode: (mode: 'conventional' | 'syariah' | 'dual') => 
      dispatch({ type: 'configuration/setBankingMode', payload: mode }),
    updateFeature: (feature: string, enabled: boolean) => 
      dispatch({ type: 'configuration/updateFeature', payload: { feature, enabled } }),
    updateSetting: (key: string, value: any) => 
      dispatch({ type: 'configuration/updateSetting', payload: { key, value } }),
  };
};

export const useUIActions = () => {
  const dispatch = useAppDispatch();
  
  return {
    toggleSidebar: () => dispatch({ type: 'ui/toggleSidebar' }),
    setTheme: (theme: 'light' | 'dark') => dispatch({ type: 'ui/setTheme', payload: theme }),
    setLanguage: (language: string) => dispatch({ type: 'ui/setLanguage', payload: language }),
    setLoading: (loading: boolean) => dispatch({ type: 'ui/setLoading', payload: loading }),
    addNotification: (notification: any) => dispatch({ type: 'ui/addNotification', payload: notification }),
    removeNotification: (id: string) => dispatch({ type: 'ui/removeNotification', payload: id }),
    openModal: (modal: string) => dispatch({ type: 'ui/openModal', payload: modal }),
    closeModal: (modal: string) => dispatch({ type: 'ui/closeModal', payload: modal }),
  };
};