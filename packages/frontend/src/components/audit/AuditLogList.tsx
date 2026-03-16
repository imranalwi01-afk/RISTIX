"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    InputAdornment,
    Chip,
    IconButton,
    Tooltip,
    Button,
    Stack,
    Collapse,
    Card,
    CardContent,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Search,
    FilterList,
    GetApp,
    Visibility,
    KeyboardArrowDown,
    KeyboardArrowUp,
    History
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { auditAPI } from '@/services/api';
import AuditDiffViewer from '@/components/audit/AuditDiffViewer';

interface AuditLog {
    id: string;
    eventType: string;
    action: string;
    description?: string;
    entityType?: string;
    entityName?: string;
    userId?: string;
    createdAt: string;
    metadata?: any;
    oldValues?: any;
    newValues?: any;
}

const getRequestId = (log: AuditLog): string | null => {
    if (typeof log.metadata?.requestId === 'string') return log.metadata.requestId;
    if (typeof log.metadata?.request_id === 'string') return log.metadata.request_id;
    return null;
};

const AuditLogList: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [requestIdQuery, setRequestIdQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    // Filters
    const [eventType, setEventType] = useState('');
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);

    const eventTypeOptions = ['approval', 'auth', 'data', 'job', 'permission', 'system'];

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await auditAPI.getLogs({
                page: page + 1,
                limit: rowsPerPage,
                search: searchQuery || undefined,
                requestId: requestIdQuery || undefined,
                eventType: eventType || undefined,
                startDate: startDate ? startDate.toISOString() : undefined,
                endDate: endDate ? endDate.toISOString() : undefined,
            });

            const data = response.data || [];
            const totalCount = response.pagination?.total || data.length;

            setLogs(data);
            setTotal(totalCount);
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchQuery, requestIdQuery, eventType, startDate, endDate]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleExport = async (format: 'csv' | 'json') => {
        try {
            const data = await auditAPI.exportLogs(format, {
                eventType,
                requestId: requestIdQuery || undefined,
                startDate: startDate?.toISOString(),
                endDate: endDate?.toISOString(),
                search: searchQuery || undefined,
            });

            const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `audit_logs_${format === 'csv' ? format : 'json'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Export failed:', err);
        }
    };

    const toggleRowExpansion = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setRequestIdQuery('');
        setEventType('');
        setStartDate(null);
        setEndDate(null);
        setPage(0);
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a365d', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <History /> Audit Logs
                </Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<FilterList />}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        Filters
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<GetApp />}
                        onClick={() => handleExport('csv')}
                    >
                        Export CSV
                    </Button>
                </Stack>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Search logs, entities, actions, or Request ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 2 }}
                />

                <Collapse in={showFilters}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Event Type</InputLabel>
                                    <Select
                                        value={eventType}
                                        label="Event Type"
                                        onChange={(e) => setEventType(e.target.value)}
                                    >
                                        <MenuItem value="">All Events</MenuItem>
                                        {eventTypeOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Request ID"
                                    value={requestIdQuery}
                                    onChange={(e) => setRequestIdQuery(e.target.value)}
                                    size="small"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 2 }}>
                                <DatePicker
                                    label="Start Date"
                                    value={startDate}
                                    onChange={(newValue: any) => setStartDate(newValue)}
                                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 2 }}>
                                <DatePicker
                                    label="End Date"
                                    value={endDate}
                                    onChange={(newValue: any) => setEndDate(newValue)}
                                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <Button variant="text" onClick={resetFilters}>
                                        Reset Filters
                                    </Button>
                                    <Button variant="outlined" onClick={() => { setPage(0); fetchLogs(); }}>
                                        Apply Filters
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                </Collapse>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell>Time</TableCell>
                                <TableCell>Event</TableCell>
                                <TableCell>Action</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Entity</TableCell>
                                <TableCell>Description</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">Loading...</TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">No logs found</TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <React.Fragment key={log.id}>
                                        <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                                            <TableCell>
                                                <IconButton
                                                    aria-label="expand row"
                                                    size="small"
                                                    onClick={() => toggleRowExpansion(log.id)}
                                                >
                                                    {expandedRow === log.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>{dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                                            <TableCell>
                                                <Chip label={log.eventType} size="small" color="primary" variant="outlined" />
                                            </TableCell>
                                            <TableCell>{log.action}</TableCell>
                                            <TableCell>{log.userId || 'System'}</TableCell>
                                            <TableCell>{log.entityType ? `${log.entityType} (${log.entityName || '-'})` : '-'}</TableCell>
                                            <TableCell>{log.description}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                                <Collapse in={expandedRow === log.id} timeout="auto" unmountOnExit>
                                                    <Box sx={{ margin: 1 }}>
                                                        <Typography variant="h6" gutterBottom component="div">
                                                            Details
                                                        </Typography>
                                                        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                                                            <Chip size="small" label={`Event: ${log.eventType}`} variant="outlined" />
                                                            <Chip size="small" label={`Action: ${log.action}`} variant="outlined" />
                                                            {log.entityType && (
                                                                <Chip
                                                                    size="small"
                                                                    label={`Entity: ${log.entityType}`}
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                            {getRequestId(log) && (
                                                                <Chip
                                                                    size="small"
                                                                    color="info"
                                                                    variant="outlined"
                                                                    label={`Request ID: ${getRequestId(log)}`}
                                                                />
                                                            )}
                                                        </Stack>

                                                        <AuditDiffViewer oldValues={log.oldValues} newValues={log.newValues} />

                                                        {log.metadata && (
                                                            <Card variant="outlined" sx={{ mt: 2 }}>
                                                                <CardContent>
                                                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                                        Metadata
                                                                    </Typography>
                                                                    <Box
                                                                        component="pre"
                                                                        sx={{
                                                                            m: 0,
                                                                            p: 1.5,
                                                                            bgcolor: '#f5f5f5',
                                                                            borderRadius: 1,
                                                                            fontSize: '0.8rem',
                                                                            whiteSpace: 'pre-wrap',
                                                                            wordBreak: 'break-word',
                                                                        }}
                                                                    >
                                                                        {JSON.stringify(log.metadata, null, 2)}
                                                                    </Box>
                                                                </CardContent>
                                                            </Card>
                                                        )}
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
};

export default AuditLogList;
