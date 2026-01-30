'use client'

import React, { useState, useEffect } from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Paper
} from '@mui/material'
import {
    Visibility as VisibilityIcon,
    Download as DownloadIcon,
    FilterList as FilterListIcon
} from '@mui/icons-material'
import { api } from '@/services/api'
import { format } from 'date-fns'

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
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="Start Date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="End Date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
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

            {/* Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>Event Type</TableCell>
                            <TableCell>Action</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Risk Level</TableCell>
                            <TableCell>IP Address</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">Loading...</TableCell>
                            </TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">No audit logs found</TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id} hover>
                                    <TableCell>
                                        {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={log.eventType}
                                            size="small"
                                            color={getEventTypeColor(log.eventType) as any}
                                        />
                                    </TableCell>
                                    <TableCell>{log.action}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                                            {log.description}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={log.riskLevel}
                                            size="small"
                                            color={getRiskLevelColor(log.riskLevel) as any}
                                        />
                                    </TableCell>
                                    <TableCell>{log.ipAddress || '-'}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleViewDetails(log)}
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10))
                        setPage(0)
                    }}
                />
            </TableContainer>

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
