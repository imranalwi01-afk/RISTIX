// packages/frontend/src/components/dashboard/WidgetManager.tsx
// ============================================================================
// 🎛️ DASHBOARD WIDGET MANAGER - Personalization System
// ============================================================================
// ✅ Feature: Drag-and-drop widget arrangement
// ✅ Feature: Customizable widget layouts
// ✅ Feature: Personalized content display
// ✅ Feature: Widget preferences persistence
// ============================================================================

'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Divider,
  Tooltip,
  Badge,
  Alert
} from '@mui/material'
import {
  DragIndicator,
  Close,
  Settings,
  Add,
  Remove,
  Visibility,
  VisibilityOff,
  Refresh,
  Download,
  Upload,
  Save,
  Restore,
  DashboardCustomize,
  TrendingUp,
  Assessment,
  PieChart,
  Timeline,
  AccountBalance,
  Calculate,
  Warning,
  CheckCircle
} from '@mui/icons-material'

// Widget configuration interface
interface WidgetConfig {
  id: string
  type: 'ecl-summary' | 'portfolio-metrics' | 'quick-actions' | 'activities' | 'chart' | 'custom'
  title: string
  isVisible: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  refreshInterval: number
  customSettings: Record<string, any>
}

interface WidgetManagerProps {
  userId: string
  tenantId: string
  onLayoutChange: (widgets: WidgetConfig[]) => void
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'ecl-summary',
    type: 'ecl-summary',
    title: 'ECL Summary',
    isVisible: true,
    position: { x: 0, y: 0 },
    size: { width: 12, height: 4 },
    refreshInterval: 30000,
    customSettings: { showStages: true, currency: 'IDR' }
  },
  {
    id: 'portfolio-metrics',
    type: 'portfolio-metrics',
    title: 'Portfolio Metrics',
    isVisible: true,
    position: { x: 0, y: 4 },
    size: { width: 12, height: 4 },
    refreshInterval: 60000,
    customSettings: { showCharts: true, metrics: ['exposure', 'accounts', 'rating'] }
  },
  {
    id: 'quick-actions',
    type: 'quick-actions',
    title: 'Quick Actions',
    isVisible: true,
    position: { x: 0, y: 8 },
    size: { width: 6, height: 6 },
    refreshInterval: 0,
    customSettings: { actions: ['calculate', 'analyze', 'report'] }
  },
  {
    id: 'activities',
    type: 'activities',
    title: 'Recent Activities',
    isVisible: true,
    position: { x: 6, y: 8 },
    size: { width: 6, height: 6 },
    refreshInterval: 45000,
    customSettings: { maxItems: 10, showTimestamp: true }
  }
]

export default function WidgetManager({ userId, tenantId, onLayoutChange }: WidgetManagerProps) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState<WidgetConfig | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
  const dragCounter = useRef(0)

  // Load widget preferences from localStorage
  useEffect(() => {
    const savedWidgets = localStorage.getItem(`dashboard-widgets-${userId}-${tenantId}`)
    if (savedWidgets) {
      try {
        const parsedWidgets = JSON.parse(savedWidgets)
        setWidgets(parsedWidgets)
        onLayoutChange(parsedWidgets)
      } catch (error) {
        console.warn('Failed to load widget preferences:', error)
      }
    }
  }, [userId, tenantId, onLayoutChange])

  // Save widget preferences to localStorage
  const saveWidgetPreferences = (updatedWidgets: WidgetConfig[]) => {
    localStorage.setItem(`dashboard-widgets-${userId}-${tenantId}`, JSON.stringify(updatedWidgets))
    setWidgets(updatedWidgets)
    onLayoutChange(updatedWidgets)
  }

  // Toggle widget visibility
  const toggleWidgetVisibility = (widgetId: string) => {
    const updatedWidgets = widgets.map(widget =>
      widget.id === widgetId ? { ...widget, isVisible: !widget.isVisible } : widget
    )
    saveWidgetPreferences(updatedWidgets)
  }

  // Update widget settings
  const updateWidgetSettings = (widgetId: string, settings: Partial<WidgetConfig>) => {
    const updatedWidgets = widgets.map(widget =>
      widget.id === widgetId ? { ...widget, ...settings } : widget
    )
    saveWidgetPreferences(updatedWidgets)
  }

  // Reset to default layout
  const resetToDefault = () => {
    saveWidgetPreferences(DEFAULT_WIDGETS)
    setShowSettings(false)
  }

  // Export widget configuration
  const exportConfiguration = () => {
    const config = {
      userId,
      tenantId,
      widgets,
      timestamp: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-config-${userId}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import widget configuration
  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string)
          if (config.widgets && Array.isArray(config.widgets)) {
            saveWidgetPreferences(config.widgets)
          }
        } catch (error) {
          console.error('Failed to import configuration:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  // Get widget icon based on type
  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'ecl-summary': return <Calculate />
      case 'portfolio-metrics': return <PieChart />
      case 'quick-actions': return <DashboardCustomize />
      case 'activities': return <Timeline />
      case 'chart': return <TrendingUp />
      default: return <Assessment />
    }
  }

  return (
    <Box>
      {/* Widget Manager Controls */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <DashboardCustomize sx={{ mr: 1 }} />
            Dashboard Personalization
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={isEditMode ? "contained" : "outlined"}
              startIcon={<Settings />}
              onClick={() => setIsEditMode(!isEditMode)}
              size="small"
            >
              {isEditMode ? 'Done Editing' : 'Customize'}
            </Button>

            <Button
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => setShowSettings(true)}
              size="small"
            >
              Manage Widgets
            </Button>

            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={exportConfiguration}
              size="small"
            >
              Export
            </Button>

            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              size="small"
            >
              Import
              <input
                type="file"
                accept=".json"
                hidden
                onChange={importConfiguration}
              />
            </Button>
          </Box>
        </Box>

        {isEditMode && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Drag widgets to rearrange, click the settings icon to customize, or toggle visibility in the widget manager.
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Widget Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Widget Configuration</Typography>
            <Button onClick={resetToDefault} startIcon={<Restore />} size="small">
              Reset to Default
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2}>
            {widgets.map((widget) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={widget.id}>
                <Card
                  sx={{
                    border: selectedWidget?.id === widget.id ? 2 : 1,
                    borderColor: selectedWidget?.id === widget.id ? 'primary.main' : 'grey.300'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getWidgetIcon(widget.type)}
                        <Typography variant="subtitle2" sx={{ ml: 1 }}>
                          {widget.title}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => setSelectedWidget(widget)}
                          color={selectedWidget?.id === widget.id ? 'primary' : 'default'}
                        >
                          <Settings />
                        </IconButton>

                        <Switch
                          size="small"
                          checked={widget.isVisible}
                          onChange={() => toggleWidgetVisibility(widget.id)}
                          color="primary"
                        />
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${widget.size.width}x${widget.size.height}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={widget.refreshInterval > 0 ? `Auto: ${widget.refreshInterval / 1000}s` : 'Manual'}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={widget.isVisible ? 'Visible' : 'Hidden'}
                        size="small"
                        color={widget.isVisible ? 'success' : 'default'}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Widget Details Settings */}
      {selectedWidget && (
        <Dialog open={Boolean(selectedWidget)} onClose={() => setSelectedWidget(null)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getWidgetIcon(selectedWidget.type)}
              <Typography variant="h6" sx={{ ml: 1 }}>
                {selectedWidget.title} Settings
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Widget Size
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Typography variant="body2">Width:</Typography>
                  <Slider
                    value={selectedWidget.size.width}
                    onChange={(_, value) => updateWidgetSettings(selectedWidget.id, {
                      size: { ...selectedWidget.size, width: value as number }
                    })}
                    min={3}
                    max={12}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                  <Typography variant="body2">Height:</Typography>
                  <Slider
                    value={selectedWidget.size.height}
                    onChange={(_, value) => updateWidgetSettings(selectedWidget.id, {
                      size: { ...selectedWidget.size, height: value as number }
                    })}
                    min={2}
                    max={8}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Refresh Interval (seconds)
                </Typography>
                <Slider
                  value={selectedWidget.refreshInterval / 1000}
                  onChange={(_, value) => updateWidgetSettings(selectedWidget.id, {
                    refreshInterval: (value as number) * 1000
                  })}
                  min={0}
                  max={300}
                  step={10}
                  marks={[
                    { value: 0, label: 'Manual' },
                    { value: 30, label: '30s' },
                    { value: 60, label: '1m' },
                    { value: 120, label: '2m' },
                    { value: 300, label: '5m' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setSelectedWidget(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}