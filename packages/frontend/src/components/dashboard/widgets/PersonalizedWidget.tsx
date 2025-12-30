// packages/frontend/src/components/dashboard/widgets/PersonalizedWidget.tsx
// ============================================================================
// 🎛️ PERSONALIZED DASHBOARD WIDGET - Individual Widget Component
// ============================================================================
// ✅ Feature: Configurable widget display
// ✅ Feature: Real-time data refresh
// ✅ Feature: Customizable content
// ✅ Feature: Interactive controls
// ============================================================================

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  IconButton,
  Box,
  Grid,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Button,
  Alert,
  Badge,
  Switch,
  FormControlLabel
} from '@mui/material'
import { getAuthToken } from '@/utils/auth-token';
import {
  MoreVert,
  Refresh,
  Settings,
  Fullscreen,
  FullscreenExit,
  Download,
  Visibility,
  VisibilityOff,
  TrendingUp,
  TrendingDown,
  Info,
  Warning,
  CheckCircle,
  Assessment,
  Calculate,
  AccountBalance,
  PieChart,
  Timeline,
  ShowChart,
  BarChart
} from '@mui/icons-material'

interface WidgetData {
  isLoading?: boolean
  error?: string
  lastUpdated?: string
  data?: any
}

interface PersonalizedWidgetProps {
  id: string
  type: string
  title: string
  isVisible: boolean
  size: { width: number; height: number }
  refreshInterval: number
  customSettings: Record<string, any>
  onEdit?: () => void
  onVisibilityToggle?: () => void
  onRemove?: () => void
  onDataUpdate?: (data: any) => void
  bankingContext?: {
    type: 'conventional' | 'syariah'
    primary: string
    secondary: string
  }
}

const WIDGET_ICONS = {
  'ecl-summary': <Calculate />,
  'portfolio-metrics': <PieChart />,
  'quick-actions': <Assessment />,
  'activities': <Timeline />,
  'chart': <ShowChart />,
  'custom': <BarChart />
}

export default function PersonalizedWidget({
  id,
  type,
  title,
  isVisible,
  size,
  refreshInterval,
  customSettings,
  onEdit,
  onVisibilityToggle,
  onRemove,
  onDataUpdate,
  bankingContext
}: PersonalizedWidgetProps) {
  const [widgetData, setWidgetData] = useState<WidgetData>({ isLoading: false })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [autoRefresh, setAutoRefresh] = useState(refreshInterval > 0)
  const refreshTimer = useRef<NodeJS.Timeout | null>(null)

  // Load widget data based on type
  const loadWidgetData = useCallback(async () => {
    setWidgetData({ isLoading: true, error: undefined })

    try {
      let response
      const { bankingAPI, ifrs9API } = await import('../../../services/api')

      switch (type) {
        case 'ecl-summary':
          response = await ifrs9API.getCalculationsSummary()
          break

        case 'portfolio-summary':
          // ✅ FIXED: Use proper API service instead of direct fetch
          response = await bankingAPI.portfolio.summary()
          break

        case 'activities':
          response = await bankingAPI.audit.getActivities()
          break

        default:
          // For custom widgets, use custom endpoint if specified
          if (customSettings.endpoint) {
            response = await fetch(customSettings.endpoint, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            })
          } else {
            // If no custom endpoint, return early as there's no data to fetch
            setWidgetData({
              error: 'No data source configured for this custom widget.',
              isLoading: false
            });
            return;
          }
      }

      if (response && response.ok) {
        const data = await response.json()
        setWidgetData({
          data: data.success ? data.data : data,
          lastUpdated: new Date().toISOString(),
          isLoading: false
        })
        onDataUpdate?.(data.success ? data.data : data)
      } else {
        throw new Error(`Failed to load widget data: ${response?.statusText}`)
      }

    } catch (error: any) {
      console.error(`Error loading widget ${id}:`, error)
      setWidgetData({
        error: error.message || 'Failed to load data',
        isLoading: false
      })
    }
  }, [id, type, customSettings, onDataUpdate])

  // Handle auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshTimer.current = setInterval(loadWidgetData, refreshInterval)
      return () => {
        if (refreshTimer.current) {
          clearInterval(refreshTimer.current)
        }
      }
    }
  }, [autoRefresh, refreshInterval, loadWidgetData])

  // Initial data load
  useEffect(() => {
    if (isVisible) {
      loadWidgetData()
    }
  }, [isVisible, loadWidgetData])

  // Handle menu actions
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
  }

  const handleRefresh = () => {
    loadWidgetData()
    handleMenuClose()
  }

  const handleToggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh)
    handleMenuClose()
  }

  const handleExport = () => {
    if (widgetData.data) {
      const blob = new Blob([JSON.stringify(widgetData.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${id}-data-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
    handleMenuClose()
  }

  // Format currency helper
  const formatCurrency = (amount: number, currency: string = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Render widget content based on type
  const renderWidgetContent = () => {
    if (widgetData.isLoading) {
      return (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 200 }}>
          <LinearProgress sx={{ width: '100%', mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Loading {title}...
          </Typography>
        </Box>
      )
    }

    if (widgetData.error) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" action={
            <IconButton size="small" onClick={loadWidgetData}>
              <Refresh />
            </IconButton>
          }>
            <Typography variant="body2">
              {widgetData.error}
            </Typography>
          </Alert>
        </Box>
      )
    }

    switch (type) {
      case 'ecl-summary':
        return (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {customSettings.showStages !== false && widgetData.data && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ textAlign: 'center', py: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: bankingContext?.primary }}>
                        {formatCurrency(widgetData.data.totalECL, widgetData.data.currency)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total ECL
                      </Typography>
                      <Chip
                        label={`${widgetData.data.eclRate?.toFixed(2) || 0}%`}
                        size="small"
                        color="primary"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ textAlign: 'center', py: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                        {formatCurrency(widgetData.data.stage1ECL, widgetData.data.currency)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Stage 1 ECL
                      </Typography>
                      <Chip
                        label="Low Risk"
                        size="small"
                        color="success"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        )

      case 'portfolio-metrics':
        return (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {customSettings.metrics?.includes('exposure') && widgetData.data && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'center', py: 1 }}>
                    <Avatar sx={{ backgroundColor: bankingContext?.primary, mx: 'auto', mb: 1 }}>
                      <AccountBalance />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(widgetData.data.totalExposure, widgetData.data.currency)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Exposure
                    </Typography>
                  </Box>
                </Grid>
              )}
              {customSettings.metrics?.includes('accounts') && widgetData.data && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'center', py: 1 }}>
                    <Avatar sx={{ backgroundColor: bankingContext?.secondary, mx: 'auto', mb: 1 }}>
                      <PieChart />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {widgetData.data.numberOfAccounts?.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Accounts
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )

      case 'quick-actions':
        return (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={1}>
              {customSettings.actions?.includes('calculate') && (
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Calculate />}
                    sx={{ backgroundColor: bankingContext?.primary }}
                  >
                    Run ECL Calculation
                  </Button>
                </Grid>
              )}
              {customSettings.actions?.includes('analyze') && (
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Assessment />}
                  >
                    View Analysis
                  </Button>
                </Grid>
              )}
              {customSettings.actions?.includes('report') && (
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Download />}
                  >
                    Generate Report
                  </Button>
                </Grid>
              )}
            </Grid>
          </Box>
        )

      case 'activities':
        return (
          <Box sx={{ p: 2 }}>
            {widgetData.data && widgetData.data.length > 0 ? (
              widgetData.data.slice(0, customSettings.maxItems || 5).map((activity: any, index: number) => (
                <Box key={activity.id || index} sx={{ py: 1, borderBottom: index < (widgetData.data.length - 1) ? 1 : 0, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, backgroundColor: activity.type === 'success' ? '#4caf50' : activity.type === 'warning' ? '#ff9800' : '#2196f3' }}>
                      {activity.type === 'success' && <CheckCircle sx={{ fontSize: 14 }} />}
                      {activity.type === 'warning' && <Warning sx={{ fontSize: 14 }} />}
                      {activity.type === 'info' && <Info sx={{ fontSize: 14 }} />}
                    </Avatar>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {activity.text}
                    </Typography>
                  </Box>
                  {customSettings.showTimestamp && (
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  )}
                </Box>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Info color="action" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No recent activities
                </Typography>
              </Box>
            )}
          </Box>
        )

      default:
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Assessment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              {title} Widget
            </Typography>
          </Box>
        )
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <Card
      sx={{
        height: 'auto',
        minHeight: 320,
        position: 'relative',
        zIndex: 1,
        borderRadius: isFullscreen ? 0 : 1,
        overflow: isFullscreen ? 'auto' : 'visible'
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {WIDGET_ICONS[type as keyof typeof WIDGET_ICONS]}
            <Typography variant="h6" sx={{ ml: 1, fontSize: '1rem' }}>
              {title}
            </Typography>
            {autoRefresh && (
              <Chip
                label="Auto"
                size="small"
                color="success"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        }
        action={
          <Box>
            <Tooltip title="Widget Options">
              <IconButton onClick={handleMenuClick} size="small">
                <MoreVert />
              </IconButton>
            </Tooltip>
          </Box>
        }
        sx={{ pb: 0 }}
      />

      <CardContent sx={{ pt: 0 }}>
        {renderWidgetContent()}

        {widgetData.lastUpdated && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Last updated: {new Date(widgetData.lastUpdated).toLocaleTimeString()}
          </Typography>
        )}
      </CardContent>

      {/* Widget Options Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRefresh}>
          <Refresh sx={{ mr: 1 }} fontSize="small" />
          Refresh
        </MenuItem>

        <MenuItem onClick={handleToggleAutoRefresh}>
          {autoRefresh ? <VisibilityOff sx={{ mr: 1 }} fontSize="small" /> : <Visibility sx={{ mr: 1 }} fontSize="small" />}
          Auto Refresh: {autoRefresh ? 'On' : 'Off'}
        </MenuItem>

        <MenuItem onClick={handleExport} disabled={!widgetData.data}>
          <Download sx={{ mr: 1 }} fontSize="small" />
          Export Data
        </MenuItem>

        <MenuItem onClick={() => setIsFullscreen(!isFullscreen)}>
          {isFullscreen ? <FullscreenExit sx={{ mr: 1 }} fontSize="small" /> : <Fullscreen sx={{ mr: 1 }} fontSize="small" />}
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </MenuItem>

        {onEdit && (
          <MenuItem onClick={() => { onEdit(); handleMenuClose(); }}>
            <Settings sx={{ mr: 1 }} fontSize="small" />
            Settings
          </MenuItem>
        )}

        {onVisibilityToggle && (
          <MenuItem onClick={() => { onVisibilityToggle(); handleMenuClose(); }}>
            <VisibilityOff sx={{ mr: 1 }} fontSize="small" />
            Hide Widget
          </MenuItem>
        )}

        {onRemove && (
          <MenuItem onClick={() => { onRemove(); handleMenuClose(); }} sx={{ color: 'error.main' }}>
            <Typography sx={{ mr: 1, fontSize: 'small' }}>×</Typography>
            Remove Widget
          </MenuItem>
        )}
      </Menu>
    </Card>
  )
}