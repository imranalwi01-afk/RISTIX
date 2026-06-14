// packages/frontend/src/store/slices/userSettingsSlice.ts
// ============================================================================
// IFRS9 FRONTEND - USER SETTINGS REDUX SLICE
// ============================================================================
// Purpose: Redux state management for user settings, preferences, and profile
// Features: Profile data, theme settings, preferences, notification settings
// Generated: 2025-01-11T11:15:00Z
// Stakeholder: All Users (Banking, Platform, Consultant, Regulator)
// ============================================================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getAuthToken } from '../../utils/auth-token';
import { frontendEnvironmentLoader } from '../../config/environment-loader-frontend';
import { getErrorMessage } from '@/utils/error-message';

// ✅ User Profile Interface
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  employeeId?: string;
  department?: string;
  position?: string;
  phoneNumber?: string;
  address?: string;
  avatar?: string;
  bankingAccess: 'CONVENTIONAL' | 'BOTH';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// ✅ Theme Settings Interface
export interface ThemeSettings {
  mode: 'light' | 'dark';
  bankingTheme: 'conventional' | 'dual';
  primaryColor: string;
  secondaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  borderRadius: 'sharp' | 'rounded' | 'circular';
  sidebarCollapsed: boolean;
  animationsEnabled: boolean;
  highContrast: boolean;
  customColors: {
    header: string;
    sidebar: string;
    cards: string;
  };
}

// ✅ User Preferences Interface
export interface UserPreferences {
  id: string;
  userId: string;

  // Dashboard Preferences
  dashboardLayout: 'grid' | 'list' | 'cards';
  dashboardWidgets: string[];
  refreshInterval: number;
  defaultDateRange: '7d' | '30d' | '90d' | '1y';
  showQuickActions: boolean;
  compactMode: boolean;

  // Data Display Preferences
  defaultPageSize: number;
  defaultSort: 'asc' | 'desc';
  showRowNumbers: boolean;
  alternateRowColors: boolean;
  compactTable: boolean;
  showTooltips: boolean;

  // Export Preferences
  defaultExportFormat: 'excel' | 'csv' | 'pdf';
  includeHeaders: boolean;
  includeTimestamp: boolean;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  numberFormat: 'en-US' | 'id-ID' | 'ar-SA';
  currencyPosition: 'before' | 'after';

  // Notification Preferences
  emailDigest: 'daily' | 'weekly' | 'monthly' | 'never';
  realTimeAlerts: boolean;
  batchNotifications: boolean;
  alertTypes: {
    approvals: boolean;
    calculations: boolean;
    dataUploads: boolean;
    systemMaintenance: boolean;
    compliance: boolean;
  };

  // Workflow Preferences
  autoSaveDrafts: boolean;
  autoSubmitApprovals: boolean;
  requireConfirmation: boolean;
  skipConfirmationDialogs: boolean;
  defaultApprovalRoute: string;

  // Banking Preferences
  defaultBankingMode: 'conventional' | 'dual';
  showIslamicIndicators: boolean;
  complianceWarnings: boolean;


  // Advanced Preferences
  enableBetaFeatures: boolean;
  usageAnalytics: boolean;
  crashReporting: boolean;
  performanceMode: 'balanced' | 'performance' | 'quality';
  cacheSize: number;

  createdAt: string;
  updatedAt?: string;
}

// ✅ User Settings State Interface
export interface UserSettingsState {
  // Data
  profile: UserProfile | null;
  themeSettings: ThemeSettings | null;
  preferences: UserPreferences | null;

  // Loading States
  profileLoading: boolean;
  themeLoading: boolean;
  preferencesLoading: boolean;

  // Error States
  profileError: string | null;
  themeError: string | null;
  preferencesError: string | null;

  // Success States
  profileSaved: boolean;
  themeSaved: boolean;
  preferencesSaved: boolean;

  // Last Updated Timestamps
  lastProfileUpdate: string | null;
  lastThemeUpdate: string | null;
  lastPreferencesUpdate: string | null;
}

// ✅ Initial State
const initialState: UserSettingsState = {
  profile: null,
  themeSettings: null,
  preferences: null,
  profileLoading: false,
  themeLoading: false,
  preferencesLoading: false,
  profileError: null,
  themeError: null,
  preferencesError: null,
  profileSaved: false,
  themeSaved: false,
  preferencesSaved: false,
  lastProfileUpdate: null,
  lastThemeUpdate: null,
  lastPreferencesUpdate: null,
};

// ✅ API Base URL - Use centralized dual-mode configuration
const getApiBase = (): string => {
  try {
    return frontendEnvironmentLoader.getConfiguration().api.base;
  } catch {
    return process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || '/api/v1';
  }
};

const API_BASE = getApiBase();

// ✅ Get Headers Helper
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken() || ''}`
});

const buildFetchError = async (response: Response, fallbackMessage: string) => {
  let data: unknown = null;
  try {
    data = await response.clone().json();
  } catch {
    try {
      data = await response.clone().text();
    } catch {
      data = null;
    }
  }

  return {
    message: fallbackMessage,
    response: {
      status: response.status,
      data,
    },
  };
};

// ✅ Async Thunks

// Fetch User Profile
export const fetchUserProfile = createAsyncThunk(
  'userSettings/fetchProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/user/${userId}/profile`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw await buildFetchError(response, 'Failed to fetch user profile');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch profile'));
    }
  }
);

// Update User Profile
export const updateUserProfile = createAsyncThunk(
  'userSettings/updateProfile',
  async ({ userId, profileData }: { userId: string; profileData: Partial<UserProfile> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/user/${userId}/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw await buildFetchError(response, 'Failed to update user profile');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update profile'));
    }
  }
);

// Upload User Avatar
export const uploadUserAvatar = createAsyncThunk(
  'userSettings/uploadAvatar',
  async ({ userId, file }: { userId: string; file: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_BASE}/user/${userId}/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken() || ''}`
        },
        body: formData
      });

      if (!response.ok) {
        throw await buildFetchError(response, 'Failed to upload avatar');
      }

      const data = await response.json();
      return data.data.avatar;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to upload avatar'));
    }
  }
);

// Fetch Theme Settings
export const fetchThemeSettings = createAsyncThunk(
  'userSettings/fetchThemeSettings',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/user/${userId}/theme`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw await buildFetchError(response, 'Failed to fetch theme settings');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch theme settings'));
    }
  }
);

// Update Theme Settings
export const updateThemeSettings = createAsyncThunk(
  'userSettings/updateThemeSettings',
  async ({ userId, themeData }: { userId: string; themeData: Partial<ThemeSettings> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/user/${userId}/theme`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(themeData)
      });

      if (!response.ok) {
        throw await buildFetchError(response, 'Failed to update theme settings');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update theme settings'));
    }
  }
);

// Fetch User Preferences
export const fetchUserPreferences = createAsyncThunk(
  'userSettings/fetchPreferences',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/user/${userId}/preferences`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw await buildFetchError(response, 'Failed to fetch user preferences');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch preferences'));
    }
  }
);

// Update User Preferences
export const updateUserPreferences = createAsyncThunk(
  'userSettings/updatePreferences',
  async ({ userId, preferencesData }: { userId: string; preferencesData: Partial<UserPreferences> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/user/${userId}/preferences`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(preferencesData)
      });

      if (!response.ok) {
        throw await buildFetchError(response, 'Failed to update user preferences');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update preferences'));
    }
  }
);

// ✅ Create Slice
const userSettingsSlice = createSlice({
  name: 'userSettings',
  initialState,
  reducers: {
    // ✅ Clear Errors
    clearProfileError: (state) => {
      state.profileError = null;
    },
    clearThemeError: (state) => {
      state.themeError = null;
    },
    clearPreferencesError: (state) => {
      state.preferencesError = null;
    },
    clearAllErrors: (state) => {
      state.profileError = null;
      state.themeError = null;
      state.preferencesError = null;
    },

    // ✅ Reset Success States
    resetProfileSaved: (state) => {
      state.profileSaved = false;
    },
    resetThemeSaved: (state) => {
      state.themeSaved = false;
    },
    resetPreferencesSaved: (state) => {
      state.preferencesSaved = false;
    },

    // ✅ Local Updates (for optimistic updates)
    updateProfileLocally: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    updateThemeSettingsLocally: (state, action: PayloadAction<Partial<ThemeSettings>>) => {
      if (state.themeSettings) {
        state.themeSettings = { ...state.themeSettings, ...action.payload };
      }
    },
    updatePreferencesLocally: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      if (state.preferences) {
        state.preferences = { ...state.preferences, ...action.payload };
      }
    },

    // ✅ Reset State
    resetUserSettingsState: () => initialState,
  },
  extraReducers: (builder) => {
    // ✅ Fetch Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
        state.lastProfileUpdate = new Date().toISOString();
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      });

    // ✅ Update Profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
        state.profileSaved = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
        state.profileSaved = true;
        state.lastProfileUpdate = new Date().toISOString();
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
        state.profileSaved = false;
      });

    // ✅ Upload Avatar
    builder
      .addCase(uploadUserAvatar.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(uploadUserAvatar.fulfilled, (state, action) => {
        state.profileLoading = false;
        if (state.profile) {
          state.profile.avatar = action.payload;
        }
        state.lastProfileUpdate = new Date().toISOString();
      })
      .addCase(uploadUserAvatar.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      });

    // ✅ Fetch Theme Settings
    builder
      .addCase(fetchThemeSettings.pending, (state) => {
        state.themeLoading = true;
        state.themeError = null;
      })
      .addCase(fetchThemeSettings.fulfilled, (state, action) => {
        state.themeLoading = false;
        state.themeSettings = action.payload;
        state.lastThemeUpdate = new Date().toISOString();
      })
      .addCase(fetchThemeSettings.rejected, (state, action) => {
        state.themeLoading = false;
        state.themeError = action.payload as string;
      });

    // ✅ Update Theme Settings
    builder
      .addCase(updateThemeSettings.pending, (state) => {
        state.themeLoading = true;
        state.themeError = null;
        state.themeSaved = false;
      })
      .addCase(updateThemeSettings.fulfilled, (state, action) => {
        state.themeLoading = false;
        state.themeSettings = action.payload;
        state.themeSaved = true;
        state.lastThemeUpdate = new Date().toISOString();
      })
      .addCase(updateThemeSettings.rejected, (state, action) => {
        state.themeLoading = false;
        state.themeError = action.payload as string;
        state.themeSaved = false;
      });

    // ✅ Fetch User Preferences
    builder
      .addCase(fetchUserPreferences.pending, (state) => {
        state.preferencesLoading = true;
        state.preferencesError = null;
      })
      .addCase(fetchUserPreferences.fulfilled, (state, action) => {
        state.preferencesLoading = false;
        state.preferences = action.payload;
        state.lastPreferencesUpdate = new Date().toISOString();
      })
      .addCase(fetchUserPreferences.rejected, (state, action) => {
        state.preferencesLoading = false;
        state.preferencesError = action.payload as string;
      });

    // ✅ Update User Preferences
    builder
      .addCase(updateUserPreferences.pending, (state) => {
        state.preferencesLoading = true;
        state.preferencesError = null;
        state.preferencesSaved = false;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.preferencesLoading = false;
        state.preferences = action.payload;
        state.preferencesSaved = true;
        state.lastPreferencesUpdate = new Date().toISOString();
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.preferencesLoading = false;
        state.preferencesError = action.payload as string;
        state.preferencesSaved = false;
      });
  },
});

// ✅ Export Actions
export const {
  clearProfileError,
  clearThemeError,
  clearPreferencesError,
  clearAllErrors,
  resetProfileSaved,
  resetThemeSaved,
  resetPreferencesSaved,
  updateProfileLocally,
  updateThemeSettingsLocally,
  updatePreferencesLocally,
  resetUserSettingsState,
} = userSettingsSlice.actions;

// ✅ Export Reducer
export default userSettingsSlice.reducer;

// ✅ Selectors
export const selectUserSettingsState = (state: { userSettings: UserSettingsState }) => state.userSettings;

export const selectProfile = (state: { userSettings: UserSettingsState }) => state.userSettings.profile;
export const selectProfileLoading = (state: { userSettings: UserSettingsState }) => state.userSettings.profileLoading;
export const selectProfileError = (state: { userSettings: UserSettingsState }) => state.userSettings.profileError;
export const selectProfileSaved = (state: { userSettings: UserSettingsState }) => state.userSettings.profileSaved;

export const selectThemeSettings = (state: { userSettings: UserSettingsState }) => state.userSettings.themeSettings;
export const selectThemeLoading = (state: { userSettings: UserSettingsState }) => state.userSettings.themeLoading;
export const selectThemeError = (state: { userSettings: UserSettingsState }) => state.userSettings.themeError;
export const selectThemeSaved = (state: { userSettings: UserSettingsState }) => state.userSettings.themeSaved;

export const selectPreferences = (state: { userSettings: UserSettingsState }) => state.userSettings.preferences;
export const selectPreferencesLoading = (state: { userSettings: UserSettingsState }) => state.userSettings.preferencesLoading;
export const selectPreferencesError = (state: { userSettings: UserSettingsState }) => state.userSettings.preferencesError;
export const selectPreferencesSaved = (state: { userSettings: UserSettingsState }) => state.userSettings.preferencesSaved;

// ✅ Computed Selectors
export const selectUserSettingsLoading = (state: { userSettings: UserSettingsState }) =>
  selectProfileLoading(state) || selectThemeLoading(state) || selectPreferencesLoading(state);

export const selectUserSettingsError = (state: { userSettings: UserSettingsState }) =>
  selectProfileError(state) || selectThemeError(state) || selectPreferencesError(state);

export const selectUserSettingsSaved = (state: { userSettings: UserSettingsState }) =>
  selectProfileSaved(state) || selectThemeSaved(state) || selectPreferencesSaved(state);
