'use client'

import { useColumnFiltersFromUrl } from '@/hooks/useColumnFiltersFromUrl';
import React, { useState, useEffect, useMemo } from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
} from '@mui/material'
import {
    Visibility as VisibilityIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { api } from '@/services/api';
import { format } from 'date-fns'
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';

interface AuditLog {
    id: string
    eventType: string
    action: string
    description: string
    entityType?: string
    entityId?: string
    entityName?: string
    userId?: string
    riskLevel: string
    timestamp: string
    ipAddress?: string
    requestMethod?: string
    requestPath?: string
}

export const AuditLogViewer: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(25)
    const [total, setTotal] = useState(0)
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)

    // Filters
    const [eventType, setEventType] = useState('')
    const [action, setAction] = useState('')
    const [riskLevel, setRiskLevel] = useState('')
    const [search, setSearch] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    useEffect(() => {
        loadLogs()
    }, [page, rowsPerPage, eventType, action, riskLevel, search, startDate, endDate])

    const columnFilters = useColumnFiltersFromUrl();

    const loadLogs = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: String(page + 1),
                limit: String(rowsPerPage),
                ...(eventType && { eventType }),
                ...(action && { action }),
                ...(riskLevel && { riskLevel }),
                ...(search && { search }),
                ...(startDate && { startDate }),
                ...(endDate && { endDate })
            })

            const response = await api.client.get(`/audit/logs?${params}`)
            setLogs(response.data.data)
            setTotal(response.data.pagination.total)
        } catch (error) {
            console.error('Failed to load audit logs', error)
        } finally {
            setLoading(false)
        }
    }

    const handleViewDetails = (log: AuditLog) => {
        setSelectedLog(log)
        setDetailsOpen(true)
    }

    const handleExport = async () => {
        try {
            const response = await api.client.post('/audit/export', {
                format: 'csv',
                filters: {
                    ...(eventType && { eventType }),
                    ...(startDate && { startDate }),
                    ...(endDate && { endDate })
                }
            })

            // Create download link
            const blob = new Blob([response.data], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `audit-logs-${new Date().toISOString()}.csv`
            a.click()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Failed to export logs', error)
        }
    }

    const getRiskLevelColor = (level: string) => {
        switch (level) {
            case 'critical': return 'error'
            case 'high': return 'warning'
            case 'medium': return 'info'
            case 'low': return 'success'
            default: return 'default'
        }
    }

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'auth': return 'primary'
            case 'data': return 'secondary'
            case 'permission': return 'warning'
            case 'job': return 'info'
            case 'approval': return 'success'
            case 'system': return 'error'
            default: return 'default'
        }
    }

    const auditColumns = useMemo<GridColDef<AuditLog>[]>(() => [
        {
            field: 'timestamp',
            headerName: 'Timestamp',
            width: 190,
            renderCell: (params) => format(new Date(params.value as string), 'MMM dd, yyyy HH:mm:ss'),
        },
        {
            field: 'eventType',
            headerName: 'Event Type',
            width: 150,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={getEventTypeColor(params.value as string) as any}
                />
            ),
        },
        {
            field: 'action',
            headerName: 'Action',
            minWidth: 150,
            flex: 0.8,
        },
        {
            field: 'description',
            headerName: 'Description',
            minWidth: 300,
            flex: 1.4,
            renderCell: (params) => (
                <Typography variant="body2" noWrap sx={{ maxWidth: '100%' }}>
                    {params.value}
                </Typography>
            ),
        },
        {
            field: 'riskLevel',
            headerName: 'Risk Level',
            width: 140,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={getRiskLevelColor(params.value as string) as any}
                />
            ),
        },
        {
            field: 'ipAddress',
            headerName: 'IP Address',
            width: 150,
            renderCell: (params) => params.value || '-',
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 96,
            getActions: (params) => [
                <SafeGridActionsCellItem
                    key="view"
                    icon={<VisibilityIcon />}
                    label="View Details"
                    onClick={() => handleViewDetails(params.row)}
                    showInMenu={false}
                />,
            ],
        },
    ], [])

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">Audit Logs</Typography>
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleExport}
                >
                    Export
                </Button>
            </Box>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Event Type</InputLabel>
                                <Select
                                    value={eventType}
                                    label="Event Type"
                                    onChange={(e) => setEventType(e.target.value)}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="auth">Authentication</MenuItem>
                                    <MenuItem value="data">Data Changes</MenuItem>
                                    <MenuItem value="permission">Permissions</MenuItem>
                                    <MenuItem value="job">Jobs</MenuItem>
                                    <MenuItem value="approval">Approvals</MenuItem>
                                    <MenuItem value="system">System</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Risk Level</InputLabel>
                                <Select
                                    value={riskLevel}
                                    label="Risk Level"
                                    onChange={(e) => setRiskLevel(e.target.value)}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="low">Low</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="high">High</MenuItem>
                                    <MenuItem value="critical">Critical</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <DatePicker
                                label="Start Date"
                                value={startDate ? new Date(startDate) : null}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        const dateStr = newValue instanceof Date 
                                            ? newValue.toISOString().split('T')[0] 
                                            : (newValue as any).toISOString().split('T')[0];
                                        setStartDate(dateStr);
                                    } else {
                                        setStartDate('');
                                    }
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: 'small',
                                        InputLabelProps: { shrink: true }
                                    }
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <DatePicker
                                label="End Date"
                                value={endDate ? new Date(endDate) : null}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        const dateStr = newValue instanceof Date 
                                            ? newValue.toISOString().split('T')[0] 
                                            : (newValue as any).toISOString().split('T')[0];
                                        setEndDate(dateStr);
                                    } else {
                                        setEndDate('');
                                    }
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: 'small',
                                        InputLabelProps: { shrink: true }
                                    }
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search logs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <SafeDataGrid
                rows={logs}
                columns={auditColumns}
                loading={loading}
                getRowId={(row) => row.id}
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
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
                tableStateKey="audit-log-viewer-table"
                fillAvailableHeight
                maxTableHeight="none"
            />

            {/* Details Dialog */}
            <Dialog
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Audit Log Details</DialogTitle>
                <DialogContent>
                    {selectedLog && (
                        <Box sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Event Type</Typography>
                                    <Typography>{selectedLog.eventType}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Action</Typography>
                                    <Typography>{selectedLog.action}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Risk Level</Typography>
                                    <Chip
                                        label={selectedLog.riskLevel}
                                        size="small"
                                        color={getRiskLevelColor(selectedLog.riskLevel) as any}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Timestamp</Typography>
                                    <Typography>{format(new Date(selectedLog.timestamp), 'PPpp')}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                                    <Typography>{selectedLog.description}</Typography>
                                </Grid>
                                {selectedLog.entityType && (
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Entity Type</Typography>
                                        <Typography>{selectedLog.entityType}</Typography>
                                    </Grid>
                                )}
                                {selectedLog.entityId && (
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Entity ID</Typography>
                                        <Typography>{selectedLog.entityId}</Typography>
                                    </Grid>
                                )}
                                {selectedLog.ipAddress && (
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="subtitle2" color="text.secondary">IP Address</Typography>
                                        <Typography>{selectedLog.ipAddress}</Typography>
                                    </Grid>
                                )}
                                {selectedLog.requestMethod && (
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Request Method</Typography>
                                        <Typography>{selectedLog.requestMethod}</Typography>
                                    </Grid>
                                )}
                                {selectedLog.requestPath && (
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Request Path</Typography>
                                        <Typography>{selectedLog.requestPath}</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailsOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
