'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { notificationAPI, type NotificationCategory, type NotificationPreferences, type NotificationReadStatus } from '@/services/api/notification.api'
import { formatNotificationCategory, NOTIFICATION_CATEGORIES, resolveNotificationActionRoute } from '@/utils/notification-utils'
import { useNotifications } from '@/providers/NotificationProvider'
import { SafeDataGrid } from '@/components/shared/SafeDataGrid'

interface NotificationRecord {
  id: string
  notificationId: string
  type: string
  category: NotificationCategory
  severity: string
  title: string
  message: string
  actionUrl?: string | null
  readAt?: string | null
  createdAt: string
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  muteAll: false,
  mutedCategories: [],
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  timezone: 'Asia/Jakarta',
}

export default function NotificationsPage() {
  const router = useRouter()
  const { refreshNotifications } = useNotifications()

  const [rows, setRows] = useState<NotificationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'all' | NotificationCategory>('all')
  const [readStatus, setReadStatus] = useState<NotificationReadStatus>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkRunning, setBulkRunning] = useState(false)

  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES)
  const [savingPreferences, setSavingPreferences] = useState(false)

  const toIsoDateFrom = (date: string): string | undefined => {
    if (!date) return undefined
    return new Date(`${date}T00:00:00.000Z`).toISOString()
  }

  const toIsoDateTo = (date: string): string | undefined => {
    if (!date) return undefined
    return new Date(`${date}T23:59:59.999Z`).toISOString()
  }

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await notificationAPI.list({
        search: search.trim() || undefined,
        category: category === 'all' ? undefined : category,
        readStatus,
        dateFrom: toIsoDateFrom(dateFrom),
        dateTo: toIsoDateTo(dateTo),
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      })

      const data = Array.isArray(response?.data) ? response.data : []
      setRows(data)
      setTotal(Number(response?.meta?.total || 0))
      setSelectedIds([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [category, dateFrom, dateTo, page, readStatus, rowsPerPage, search])

  const loadPreferences = useCallback(async () => {
    try {
      const response = await notificationAPI.getPreferences()
      if (response?.data) {
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...response.data,
        })
      }
    } catch {
      // Keep defaults if request fails.
    }
  }, [])

  useEffect(() => {
    void loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    void loadPreferences()
  }, [loadPreferences])

  const runBulkUpdate = async (read: boolean) => {
    if (selectedIds.length === 0) return
    setBulkRunning(true)
    try {
      await notificationAPI.markReadStatusBulk({
        notificationIds: selectedIds,
        read,
      })
      await Promise.all([loadNotifications(), refreshNotifications()])
    } finally {
      setBulkRunning(false)
    }
  }

  const markAllRead = async () => {
    setBulkRunning(true)
    try {
      await notificationAPI.markAllRead()
      await Promise.all([loadNotifications(), refreshNotifications()])
    } finally {
      setBulkRunning(false)
    }
  }

  const handleOpenNotification = (row: NotificationRecord) => {
    const route = resolveNotificationActionRoute(row.actionUrl || undefined)
    if (!route) return

    if (/^https?:\/\//i.test(route)) {
      window.open(route, '_blank', 'noopener,noreferrer')
      return
    }

    router.push(route)
  }

  const notificationColumns = useMemo<GridColDef<NotificationRecord>[]>(() => [
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      renderCell: (params) => (
        <Chip size="small" label={formatNotificationCategory(params.value)} variant="outlined" />
      ),
    },
    {
      field: 'title',
      headerName: 'Title',
      minWidth: 220,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={!params.row.readAt ? 700 : 500}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'message',
      headerName: 'Message',
      minWidth: 320,
      flex: 1.5,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'readAt',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const isUnread = !params.value
        return (
          <Chip
            size="small"
            label={isUnread ? 'Unread' : 'Read'}
            color={isUnread ? 'warning' : 'default'}
            variant={isUnread ? 'filled' : 'outlined'}
          />
        )
      },
    },
    {
      field: 'createdAt',
      headerName: 'Time',
      width: 170,
      renderCell: (params) => (
        <Typography variant="caption" color="text.secondary">
          {formatDistanceToNow(new Date(params.value), { addSuffix: true })}
        </Typography>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const clickable = Boolean(resolveNotificationActionRoute(params.row.actionUrl || undefined))
        return (
          <Button size="small" disabled={!clickable} onClick={() => handleOpenNotification(params.row)}>
            Open
          </Button>
        )
      },
    },
  ], [handleOpenNotification])

  const toggleMutedCategory = (value: NotificationCategory) => {
    setPreferences((prev) => {
      const current = prev.mutedCategories || []
      const exists = current.includes(value)
      return {
        ...prev,
        mutedCategories: exists ? current.filter((item) => item !== value) : [...current, value],
      }
    })
  }

  const savePreferences = async () => {
    setSavingPreferences(true)
    try {
      const response = await notificationAPI.updatePreferences(preferences)
      if (response?.data) {
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...response.data,
        })
      }
    } finally {
      setSavingPreferences(false)
    }
  }

  return (
    <Box sx={{ p: 1 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Notifications</Typography>
            <Typography variant="body2" color="text.secondary">
              Full history, filters, and bulk actions
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => void loadNotifications()} disabled={loading}>Refresh</Button>
            <Button variant="contained" onClick={markAllRead} disabled={bulkRunning}>Mark All Read</Button>
          </Stack>
        </Box>

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Search"
                  value={search}
                  onChange={(event) => {
                    setPage(0)
                    setSearch(event.target.value)
                  }}
                  fullWidth
                />
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={readStatus}
                    label="Status"
                    onChange={(event) => {
                      setPage(0)
                      setReadStatus(event.target.value as NotificationReadStatus)
                    }}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="unread">Unread</MenuItem>
                    <MenuItem value="read">Read</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  type="date"
                  label="Date From"
                  value={dateFrom}
                  onChange={(event) => {
                    setPage(0)
                    setDateFrom(event.target.value)
                  }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="date"
                  label="Date To"
                  value={dateTo}
                  onChange={(event) => {
                    setPage(0)
                    setDateTo(event.target.value)
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label="All"
                  color={category === 'all' ? 'primary' : 'default'}
                  variant={category === 'all' ? 'filled' : 'outlined'}
                  onClick={() => {
                    setPage(0)
                    setCategory('all')
                  }}
                />
                {NOTIFICATION_CATEGORIES.map((item) => (
                  <Chip
                    key={item}
                    label={formatNotificationCategory(item)}
                    color={category === item ? 'primary' : 'default'}
                    variant={category === item ? 'filled' : 'outlined'}
                    onClick={() => {
                      setPage(0)
                      setCategory(item)
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" disabled={selectedIds.length === 0 || bulkRunning} onClick={() => void runBulkUpdate(true)}>
                  Mark Selected Read
                </Button>
                <Button size="small" variant="outlined" disabled={selectedIds.length === 0 || bulkRunning} onClick={() => void runBulkUpdate(false)}>
                  Mark Selected Unread
                </Button>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {selectedIds.length} selected
              </Typography>
            </Box>

            {error && (
              <Box sx={{ px: 2, pb: 2 }}>
                <Alert severity="error">{error}</Alert>
              </Box>
            )}

            <SafeDataGrid
              rows={rows}
              columns={notificationColumns}
              loading={loading}
              getRowId={(row) => row.notificationId}
              rowCount={total}
              paginationMode="offset"
              paginationModel={{ page, pageSize: rowsPerPage }}
              onPaginationModelChange={(model) => {
                if (model.page !== page) setPage(model.page)
                if (model.pageSize !== rowsPerPage) {
                  setRowsPerPage(model.pageSize)
                  setPage(0)
                }
              }}
              pageSizeOptions={[10, 20, 50, 100]}
              checkboxSelection
              rowSelectionModel={selectedIds as any}
              onRowSelectionModelChange={(ids: any) => {
                const nextIds = Array.isArray(ids) ? ids : Array.from(ids?.ids ?? [])
                setSelectedIds(nextIds.map(String))
              }}
              getRowSx={({ row }) => ({
                bgcolor: !row.readAt ? 'rgba(245, 158, 11, 0.08)' : undefined,
              })}
              tableStateKey="banking-notifications-table"
              fillAvailableHeight
              maxTableHeight="none"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Notification Preferences</Typography>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Switch
                  checked={preferences.muteAll}
                  onChange={(event) => setPreferences((prev) => ({ ...prev, muteAll: event.target.checked }))}
                />
                <Typography variant="body2">Mute all notifications</Typography>
              </Stack>

              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>Muted Categories</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {NOTIFICATION_CATEGORIES.map((item) => {
                    const muted = preferences.mutedCategories.includes(item)
                    return (
                      <Chip
                        key={item}
                        label={formatNotificationCategory(item)}
                        color={muted ? 'warning' : 'default'}
                        variant={muted ? 'filled' : 'outlined'}
                        onClick={() => toggleMutedCategory(item)}
                      />
                    )
                  })}
                </Stack>
              </Box>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Switch
                  checked={preferences.quietHoursEnabled}
                  onChange={(event) => setPreferences((prev) => ({ ...prev, quietHoursEnabled: event.target.checked }))}
                />
                <Typography variant="body2">Enable quiet hours</Typography>
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Quiet Hours Start"
                  type="time"
                  value={preferences.quietHoursStart}
                  onChange={(event) => setPreferences((prev) => ({ ...prev, quietHoursStart: event.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 60 }}
                />
                <TextField
                  label="Quiet Hours End"
                  type="time"
                  value={preferences.quietHoursEnd}
                  onChange={(event) => setPreferences((prev) => ({ ...prev, quietHoursEnd: event.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 60 }}
                />
                <TextField
                  label="Timezone"
                  value={preferences.timezone}
                  onChange={(event) => setPreferences((prev) => ({ ...prev, timezone: event.target.value }))}
                  fullWidth
                />
              </Stack>

              <Box>
                <Button variant="contained" onClick={() => void savePreferences()} disabled={savingPreferences}>
                  {savingPreferences ? 'Saving...' : 'Save Preferences'}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  )
}
