// packages/frontend/src/app/(auth)/login/page.tsx
// ============================================================================
// 🏢 IAF PRODUCTION LOGIN PAGE
// ============================================================================
// Clean production login page for Indonesia Airawata Finance
// No debug information - production ready
// Implements 3-payload login system: email, password, tenantId
// ============================================================================

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material'
import {
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
  Business
} from '@mui/icons-material'
import { useAuth } from '../../../providers/AuthProvider'
import { frontendEnvironmentLoader } from '@/config/environment-loader-frontend'

// ============================================================================
// TENANT DATA FROM LIVE DATABASE
// ============================================================================
interface TenantOption {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  bankingType: 'conventional' | 'syariah' | 'dual';
  status: 'active' | 'inactive' | 'suspended';
  isActive: boolean;
}

interface LoginData {
  tenants: TenantOption[];
  systemInfo: {
    version: string;
    timestamp: string;
    totalTenants: number;
  };
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth()

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedTenantId, setSelectedTenantId] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [localError, setLocalError] = useState('')

  // Tenant data state
  const [tenants, setTenants] = useState<TenantOption[]>([])
  const [tenantsLoading, setTenantsLoading] = useState(true)
  const [tenantsError, setTenantsError] = useState('')

  // Get error from query params
  const errorParam = searchParams?.get('error')

  // ============================================================================
  // 🔄 FETCH TENANT DATA WITH IAF FALLBACK (CRITICAL FOR PRODUCTION)
  // ============================================================================
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const config = frontendEnvironmentLoader.getConfiguration();
        const response = await fetch(`${config.api.backend}${config.api.auth}/login-data`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch tenant data: ${response.status}`)
        }

        const result = await response.json()

        if (result.success && result.data) {
          setTenants(result.data.tenants.filter(t => t.isActive))
          // Auto-select first available tenant
          const activeTenants = result.data.tenants.filter(t => t.isActive)
          if (activeTenants.length > 0) {
            setSelectedTenantId(activeTenants[0].slug) // Use slug instead of UUID for backend compatibility
          }
        } else {
          throw new Error(result.error || 'Invalid response format')
        }
      } catch (error) {
        console.error('Failed to fetch tenant data from backend, using fallback:', error)
        setTenantsError('Using fallback tenant configuration')

        // 🚨 CRITICAL FALLBACK: Static IAF tenant configuration
        // This prevents the login form from being stuck in loading state
        const iafTenant: TenantOption = {
          id: 'iaf-fallback',
          slug: 'iaf',
          name: 'Indonesia Airawata Finance',
          displayName: 'Indonesia Airawata Finance (IAF)',
          bankingType: 'conventional',
          status: 'active',
          isActive: true
        }

        setTenants([iafTenant])
        setSelectedTenantId('iaf') // Auto-select IAF tenant
      } finally {
        setTenantsLoading(false)
      }
    }

    fetchTenants()
  }, [])

  // ✅ REMOVED: Let AuthProvider handle redirects to prevent conflicts
  // The AuthProvider initialization logic will handle authenticated user redirects
  // Removing this prevents double redirects and authentication loops

  // Clear errors when inputs change
  useEffect(() => {
    if (localError) setLocalError('')
    if (error) clearError()
  }, [email, password, selectedTenantId])

  // ============================================================================
  // 🔄 PRODUCTION LOGIN WITH 3-PAYLOAD SYSTEM
  // ============================================================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLocalError('')

    try {
      // Validate inputs
      if (!email || !password || !selectedTenantId) {
        setLocalError('Please enter email, password, and select tenant')
        return
      }

      // Prepare 3-payload authentication
      const loginPayload = {
        email,
        password,
        tenantId: selectedTenantId
      }

      const success = await login(loginPayload)

      if (!success) {
        setLocalError('Invalid email, password, or tenant selection')
      }
      // AuthProvider will handle redirect automatically
    } catch (err: any) {
      setLocalError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Card sx={{ maxWidth: 450, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
              <img
                src="/images/logo-iaf.png"
                alt="Indonesia Airawata Finance"
                style={{
                  height: '40px',
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
            </Box>
            <Typography variant="h4" component="h1" sx={{
              fontWeight: 'bold',
              mb: 1,
              color: '#1565C0'
            }}>
              Indonesia Airawata Finance
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              IFRS 9 Platform
            </Typography>
          </Box>

          {/* Error Messages */}
          {errorParam && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorParam === 'unauthorized' && 'Access denied. Please login with appropriate credentials.'}
              {errorParam === 'access_denied' && 'You do not have permission to access this resource.'}
              {errorParam === 'no_role' && 'User role not found. Please contact administrator.'}
              {errorParam === 'session_expired' && 'Your session has expired. Please login again.'}
            </Alert>
          )}

          {(localError || error) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localError || error}
            </Alert>
          )}

          {/* Tenant Loading */}
          {tenantsLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {/* Login Form */}
          <Box
            component="form"
            id="login-form"
            onSubmit={handleLogin}
            sx={{ mb: 3 }}
          >
            {/* Tenant Selection */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tenant</InputLabel>
              <Select
                value={selectedTenantId}
                label="Tenant"
                onChange={(e) => setSelectedTenantId(e.target.value)}
                disabled={loginLoading || isLoading || tenantsLoading}
                required
              >
                {tenants.map((tenant) => (
                  <MenuItem key={tenant.id} value={tenant.slug}> {/* Use slug instead of UUID for backend compatibility */}
                    {tenant.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loginLoading || isLoading}
              sx={{ mb: 2 }}
              placeholder="Enter your email address"
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loginLoading || isLoading}
              sx={{ mb: 3 }}
              placeholder="Enter your password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loginLoading || isLoading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loginLoading || isLoading || !email || !password || !selectedTenantId}
              startIcon={loginLoading || isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
              sx={{
                py: 1.5,
                backgroundColor: '#1565C0',
                '&:hover': {
                  backgroundColor: '#135a9f',
                },
                '&:disabled': {
                  backgroundColor: '#ccc',
                }
              }}
            >
              {loginLoading || isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Having trouble? Contact{' '}
              <Box component="span" sx={{ color: '#1565C0', cursor: 'pointer' }}>
                support@iaf.co.id
              </Box>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}