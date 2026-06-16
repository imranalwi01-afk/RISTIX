// packages/frontend/src/app/banking/settings/profile/page.tsx
// ============================================================================
// IFRS9 FRONTEND - BANKING USER PROFILE SETTINGS PAGE
// ============================================================================
// Purpose: Banking user profile management and personal settings
// Features: Personal info, avatar, contact details, banking preferences
// Generated: 2025-01-11T10:30:00Z
// Stakeholder: Banking Users (conventional)
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { frontendEnvironmentLoader } from '../../../../config/environment-loader-frontend';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Alert,
  Snackbar,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  CircularProgress,
  Breadcrumbs,
  Link,
  InputAdornment,
  Badge,
  Tabs, // Added
  Tab, // Added
  ListItemIcon, // Added
  Menu // Added
} from '@mui/material';
import {
  Person as ProfileIcon,
  Home as HomeIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Camera as CameraIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Notifications as NotificationIcon,
  Language as LanguageIcon,
  Brightness4 as ThemeIcon,
  AccessTime as TimeIcon,
  CloudUpload as UploadIcon,
  CheckCircle as VerifiedIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  LockReset as PasswordIcon,
  Smartphone as MobileIcon,
  History as HistoryIcon,
  Fingerprint as FingerprintIcon,
  Key as KeyIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  Timeline as ActivityIcon,
  Download as ExportIcon,
  Backup as BackupIcon,
  Refresh as SyncIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../providers/AuthProvider';
import { useUserProfileQuery, useUpdateProfileMutation, useUserActivitiesQuery } from '@/features/profile/hooks/useProfileQueries';
import { useSelector } from 'react-redux';
import type { RootState } from "../../../../store";
import { getAuthToken } from '@/utils/auth-token';

// ✅ User Profile Interface
interface UserProfile {
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

// ✅ Form Data Interface
interface ProfileFormData {
  fullName: string;
  phoneNumber: string;
  address: string;
  language: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, logout } = useAuth();
  const updateProfile = (currentUser as any)?.updateProfile || (() => { console.warn('updateProfile not implemented in this context') });
  const bankingMode = useSelector((state: RootState) => state.configuration?.bankingMode || 'conventional');

  // ✅ State Management
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // ✅ Form State
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    phoneNumber: '',
    address: '',
    language: 'en',
    timezone: 'Asia/Jakarta',
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true
  });

  // ✅ UI States
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // ✅ Security Dialog States
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [mfaDialog, setMfaDialog] = useState(false);
  const [sessionDialog, setSessionDialog] = useState(false);
  const [activityDialog, setActivityDialog] = useState(false);

  // ✅ Security Form States
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ✅ Activity State
  const [userActivities, setUserActivities] = useState([]);

  // ✅ API Base URL - Use centralized dual-mode configuration
  const getApiBase = (): string => {
    try {
      // Use centralized environment loader first
      // Using imported frontendEnvironmentLoader
      const config = frontendEnvironmentLoader.getConfiguration();
      return config.api.base;
    } catch (error) {
      console.warn('⚠️ Profile Page: Failed to load centralized API base URL, using fallback:', error);

      // Fallback to hostname detection
      const isProductionDomain = typeof window !== 'undefined' && window.location.hostname.includes('danafin.com');
      const fallbackUrl = process.env.NEXT_PUBLIC_API_URL ||
        (isProductionDomain ? 'https://iaf-ifrs-be.danafin.com/api/v1' : 'https://iaf-ifrs-be.ifrspro.id/api/v1');


      return fallbackUrl;
    }
  };

  const API_BASE = getApiBase();

  // ✅ Get Auth Token
  const getAuthTokenValue = useCallback(() => {
    return getAuthToken() || '';
  }, []);

  // ✅ API Headers
  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
  }), [getAuthToken]);

  // ✅ Profile loaded via React Query (useUserProfileQuery)

  // ✅ Update Profile via React Query
  const updateProfileMutation = useUpdateProfileMutation();

  const updateProfileData = async () => {
    if (!profile) return;
    try {
      const result = await updateProfileMutation.mutateAsync(formData);
      if (result?.data) setProfile(result.data);
      setEditMode(false);
      setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
      if (updateProfile) updateProfile(formData);
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to update profile', severity: 'error' });
    }
  };

  // ✅ Upload Avatar
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_BASE}/user/${profile.id}/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, avatar: data.data.avatar } : null);
        setSnackbar({
          open: true,
          message: 'Avatar updated successfully',
          severity: 'success'
        });
      } else {
        throw new Error('Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setSnackbar({
        open: true,
        message: 'Failed to upload avatar',
        severity: 'error'
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ✅ Load User Activities
  const loadUserActivities = useCallback(async () => {
    if (!isAuthenticated || !currentUser?.id) return;

    try {
      const response = await fetch(`${API_BASE}/user-activity/activities?userId=${currentUser.id}`, {
        headers: getHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setUserActivities(data.data || []);
      }
    } catch (error) {
      console.error('Error loading user activities:', error);
    }
  }, [isAuthenticated, currentUser, API_BASE, getHeaders]);

  // ✅ Change Password
  const changePassword = async () => {
    if (!profile || passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'New passwords do not match',
        severity: 'error'
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/user/${profile.id}/change-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Password changed successfully',
          severity: 'success'
        });
        setChangePasswordDialog(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        throw new Error('Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setSnackbar({
        open: true,
        message: 'Failed to change password',
        severity: 'error'
      });
    }
  };

  // ✅ Toggle MFA
  const toggleMFA = async () => {
    if (!profile) return;

    try {
      const response = await fetch(`${API_BASE}/user/${profile.id}/toggle-mfa`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, twoFactorEnabled: data.enabled } : null);
        setSnackbar({
          open: true,
          message: data.enabled ? 'MFA enabled successfully' : 'MFA disabled',
          severity: 'success'
        });
      } else {
        throw new Error('Failed to toggle MFA');
      }
    } catch (error) {
      console.error('Error toggling MFA:', error);
      setSnackbar({
        open: true,
        message: 'Failed to toggle MFA',
        severity: 'error'
      });
    }
  };

  // ✅ Logout All Sessions
  const logoutAllSessions = async () => {
    if (!profile) return;

    try {
      const response = await fetch(`${API_BASE}/user/${profile.id}/logout-all`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'All sessions logged out successfully',
          severity: 'success'
        });
        setSessionDialog(false);
      } else {
        throw new Error('Failed to logout all sessions');
      }
    } catch (error) {
      console.error('Error logging out all sessions:', error);
      setSnackbar({
        open: true,
        message: 'Failed to logout all sessions',
        severity: 'error'
      });
    }
  };

  // ✅ Export User Data
  const exportUserData = async () => {
    if (!profile) return;

    try {
      const response = await fetch(`${API_BASE}/user/${profile.id}/export-data`, {
        headers: getHeaders()
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-data-${profile.id}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setSnackbar({
          open: true,
          message: 'User data exported successfully',
          severity: 'success'
        });
      } else {
        throw new Error('Failed to export user data');
      }
    } catch (error) {
      console.error('Error exporting user data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to export user data',
        severity: 'error'
      });
    }
  };

  // ✅ Profile + Activities loaded via React Query
  const { data: fetchedProfile } = useUserProfileQuery(currentUser?.id);
  const { data: fetchedActivities } = useUserActivitiesQuery(currentUser?.id);

  useEffect(() => {
    if (fetchedProfile) {
      setProfile(fetchedProfile);
      setFormData({
        fullName: fetchedProfile.fullName || '',
        phoneNumber: fetchedProfile.phoneNumber || '',
        address: fetchedProfile.address || '',
        language: fetchedProfile.language || 'en',
        timezone: fetchedProfile.timezone || 'Asia/Jakarta',
        emailNotifications: fetchedProfile.emailNotifications ?? true,
        smsNotifications: fetchedProfile.smsNotifications ?? false,
        inAppNotifications: fetchedProfile.inAppNotifications ?? true
      });
    }
  }, [fetchedProfile]);

  useEffect(() => { if (fetchedActivities) setUserActivities(fetchedActivities); }, [fetchedActivities]);

  // ✅ Handle avatar preview
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      uploadAvatar(event);
    }
  };

  // ✅ Handle form changes
  const handleFormChange = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ✅ Cancel edit
  const cancelEdit = () => {
    setEditMode(false);
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
        language: profile.language || 'en',
        timezone: profile.timezone || 'Asia/Jakarta',
        emailNotifications: profile.emailNotifications ?? true,
        smsNotifications: profile.smsNotifications ?? false,
        inAppNotifications: profile.inAppNotifications ?? true
      });
    }
    setAvatarPreview(null);
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="xl">
        <Alert severity="warning">
          Please log in to access profile settings.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/banking/dashboard"
          onClick={(e) => {
            e.preventDefault();
            router.push('/banking/dashboard');
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <ProfileIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Profile Settings
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ProfileIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Profile Settings
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Manage your personal information and preferences
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {!editMode ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
                size="large"
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                  onClick={updateProfileData}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {profile && (
        <Grid container spacing={3}>
          {/* Profile Overview Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      editMode ? (
                        <Tooltip title="Change Avatar">
                          <IconButton
                            component="label"
                            size="small"
                            sx={{
                              bgcolor: 'background.paper',
                              border: '2px solid',
                              borderColor: 'divider',
                              '&:hover': { bgcolor: 'background.default' }
                            }}
                            disabled={uploadingAvatar}
                          >
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={handleAvatarChange}
                            />
                            {uploadingAvatar ? (
                              <CircularProgress size={16} />
                            ) : (
                              <CameraIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      ) : null
                    }
                  >
                    <Avatar
                      src={avatarPreview || profile.avatar}
                      sx={{
                        width: 100,
                        height: 100,
                        mx: 'auto',
                        mb: 2,
                        border: '3px solid',
                        borderColor: 'primary.main'
                      }}
                    >
                      {profile.fullName.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                  <Typography variant="h6" gutterBottom>
                    {profile.fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {profile.position} {profile.department && `• ${profile.department}`}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Quick Info */}
                <List dense>
                  <ListItem>
                    <EmailIcon sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                    <ListItemText
                      primary="Email"
                      secondary={profile.email}
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  {profile.employeeId && (
                    <ListItem>
                      <BusinessIcon sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                      <ListItemText
                        primary="Employee ID"
                        secondary={profile.employeeId}
                        primaryTypographyProps={{ variant: 'subtitle2' }}
                        secondaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  )}
                  <ListItem>
                    <TimeIcon sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                    <ListItemText
                      primary="Last Login"
                      secondary={profile.lastLoginAt ?
                        new Date(profile.lastLoginAt).toLocaleString() : 'Never'
                      }
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Personal Information Card */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <ProfileIcon sx={{ mr: 1 }} />
                  Personal Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={formData.fullName}
                      onChange={(e) => handleFormChange('fullName', e.target.value)}
                      disabled={!editMode}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.phoneNumber}
                      onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={formData.address}
                      onChange={(e) => handleFormChange('address', e.target.value)}
                      disabled={!editMode}
                      multiline
                      rows={2}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Preferences Card */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <LanguageIcon sx={{ mr: 1 }} />
                  Preferences
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={formData.language}
                        onChange={(e) => handleFormChange('language', e.target.value)}
                        label="Language"
                        disabled={!editMode}
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="id">Bahasa Indonesia</MenuItem>
                        <MenuItem value="ar">العربية</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        value={formData.timezone}
                        onChange={(e) => handleFormChange('timezone', e.target.value)}
                        label="Timezone"
                        disabled={!editMode}
                      >
                        <MenuItem value="Asia/Jakarta">Asia/Jakarta</MenuItem>
                        <MenuItem value="Asia/Singapore">Asia/Singapore</MenuItem>
                        <MenuItem value="UTC">UTC</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <NotificationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Notification Preferences
                  </Typography>

                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Email Notifications"
                        secondary="Receive updates and alerts via email"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={formData.emailNotifications}
                          onChange={(e) => handleFormChange('emailNotifications', e.target.checked)}
                          disabled={!editMode}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="SMS Notifications"
                        secondary="Receive important alerts via SMS"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={formData.smsNotifications}
                          onChange={(e) => handleFormChange('smsNotifications', e.target.checked)}
                          disabled={!editMode}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="In-App Notifications"
                        secondary="Show notifications within the platform"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={formData.inAppNotifications}
                          onChange={(e) => handleFormChange('inAppNotifications', e.target.checked)}
                          disabled={!editMode}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Security Settings Card */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ mr: 1 }} />
                  Security Settings
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                      variant="outlined"
                      startIcon={<PasswordIcon />}
                      onClick={() => setChangePasswordDialog(true)}
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      Change Password
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                      variant="outlined"
                      startIcon={<FingerprintIcon />}
                      onClick={toggleMFA}
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      {profile?.twoFactorEnabled ? 'Disable MFA' : 'Enable MFA'}
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ActivityIcon />}
                      onClick={() => setActivityDialog(true)}
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      View Activity Log
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                      variant="outlined"
                      startIcon={<SyncIcon />}
                      onClick={logoutAllSessions}
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      Logout All Sessions
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ExportIcon />}
                      onClick={exportUserData}
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      Export My Data
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                      variant="outlined"
                      startIcon={<BackupIcon />}
                      fullWidth
                      sx={{ mb: 2 }}
                      onClick={() => setSnackbar({
                        open: true,
                        message: 'Backup feature coming soon',
                        severity: 'info'
                      })}
                    >
                      Request Backup
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialog} onClose={() => setChangePasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PasswordIcon />
            Change Password
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
              helperText={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== '' ? 'Passwords do not match' : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ShieldIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={changePassword}>
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Activity Log Dialog */}
      <Dialog open={activityDialog} onClose={() => setActivityDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon />
            Activity Log
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {userActivities.length > 0 ? (
              <List dense>
                {userActivities.map((activity: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {activity.type === 'login' && <LoginIcon />}
                      {activity.type === 'password_change' && <PasswordIcon />}
                      {activity.type === 'profile_update' && <PersonIcon />}
                      {activity.type === 'mfa_toggle' && <FingerprintIcon />}
                      {activity.type === 'session_logout' && <LogoutIcon />}
                      {!['login', 'password_change', 'profile_update', 'mfa_toggle', 'session_logout'].includes(activity.type) && <ActivityIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={new Date(activity.timestamp).toLocaleString()}
                    />
                    <Chip
                      label={activity.status || 'completed'}
                      size="small"
                      color={activity.status === 'success' ? 'success' : activity.status === 'error' ? 'error' : 'default'}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary">No recent activity found</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivityDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Session Management Dialog */}
      <Dialog open={sessionDialog} onClose={() => setSessionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SyncIcon />
            Session Management
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              This action will log you out from all devices and sessions. You will need to log in again on all devices.
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to continue? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionDialog(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={logoutAllSessions}>
            Logout All Sessions
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}