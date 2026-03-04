'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { notificationAPI, type NotificationCategory, type NotificationPreferences, type NotificationReadStatus } from '@/services/api/notification.api'
import { formatNotificationCategory, NOTIFICATION_CATEGORIES, resolveNotificationActionRoute } from '@/utils/notification-utils'
import { useNotifications } from '@/providers/NotificationProvider'

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

  const allSelected = useMemo(
    () => rows.length > 0 && rows.every((row) => selectedIds.includes(row.notificationId)),
    [rows, selectedIds]
  )

  const handleToggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? rows.map((row) => row.notificationId) : [])
  }

  const handleToggleSelect = (notificationId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) return Array.from(new Set([...prev, notificationId]))
      return prev.filter((id) => id !== notificationId)
    })
  }

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

            {loading ? (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={allSelected}
                          indeterminate={!allSelected && selectedIds.length > 0}
                          onChange={(event) => handleToggleSelectAll(event.target.checked)}
                        />
                      </TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Message</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => {
                      const isUnread = !row.readAt
                      const clickable = Boolean(resolveNotificationActionRoute(row.actionUrl || undefined))
                      return (
                        <TableRow key={`${row.id}-${row.notificationId}`} hover selected={isUnread}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedIds.includes(row.notificationId)}
                              onChange={(event) => handleToggleSelect(row.notificationId, event.target.checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={formatNotificationCategory(row.category)} variant="outlined" />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 280 }}>
                            <Typography variant="body2" fontWeight={isUnread ? 700 : 500}>
                              {row.title}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 420 }}>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {row.message}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={isUnread ? 'Unread' : 'Read'}
                              color={isUnread ? 'warning' : 'default'}
                              variant={isUnread ? 'filled' : 'outlined'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Button size="small" disabled={!clickable} onClick={() => handleOpenNotification(row)}>
                              Open
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                            No notifications found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <TablePagination
                  component="div"
                  count={total}
                  page={page}
                  onPageChange={(_event, value) => setPage(value)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(event) => {
                    setRowsPerPage(Number(event.target.value))
                    setPage(0)
                  }}
                  rowsPerPageOptions={[10, 20, 50, 100]}
                />
              </>
            )}
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
