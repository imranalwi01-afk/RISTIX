"use client";

import React, { useMemo, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    InputAdornment,
    Chip,
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
    History
} from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import AuditDiffViewer from '@/components/audit/AuditDiffViewer';
import { exportAuditLogs } from '@/features/audit/api/audit.api';
import { getAuditRequestId } from '@/features/audit/domain/audit.models';
import { useAuditLogsQuery, useAuditStatsQuery } from '@/features/audit/hooks/useAuditLogQueries';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';

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

const AuditLogList: React.FC = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [requestIdQuery, setRequestIdQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [entityTypeFilter, setEntityTypeFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Filters
    const [eventType, setEventType] = useState('');
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);

    const eventTypeOptions = ['approval', 'auth', 'data', 'job', 'permission', 'system'];

    const logsQuery = useAuditLogsQuery({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        requestId: requestIdQuery || undefined,
        eventType: eventType || undefined,
        action: actionFilter || undefined,
        entityType: entityTypeFilter || undefined,
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
    });

    const statsQuery = useAuditStatsQuery({
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
    });

    const logs = logsQuery.data?.logs ?? [];
    const total = logsQuery.data?.total ?? 0;
    const stats = statsQuery.data ?? null;
    const loading = logsQuery.isLoading || logsQuery.isFetching;
    const statsLoading = statsQuery.isLoading || statsQuery.isFetching;

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleExport = async (format: 'csv' | 'json') => {
        try {
            const data = await exportAuditLogs(format, {
                eventType,
                requestId: requestIdQuery || undefined,
                action: actionFilter || undefined,
                entityType: entityTypeFilter || undefined,
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

    const resetFilters = () => {
        setSearchQuery('');
        setRequestIdQuery('');
        setEventType('');
        setActionFilter('');
        setEntityTypeFilter('');
        setStartDate(null);
        setEndDate(null);
        setPage(0);
    };

    const actionOptions = useMemo(
        () => Array.from(new Set(logs.map((log) => log.action).filter(Boolean))).sort(),
        [logs],
    );
    const entityTypeOptions = useMemo(
        () => Array.from(new Set(logs.map((log) => log.entityType).filter(Boolean) as string[])).sort(),
        [logs],
    );
    const topEventType = stats?.byEventType?.[0];
    const topUser = stats?.topUsers?.[0];
    const totalEventsValue = stats?.total ?? total;
    const topEventTypeLabel = topEventType?.eventType || '-';
    const topEventTypeCount = topEventType?.count ?? 0;
    const topUserLabel = topUser?.userId || 'System';
    const topUserCount = topUser?.count ?? 0;
    const approvalEventsCount = stats?.byEventType
        ?.filter((entry) => entry.eventType.toLowerCase() === 'approval')
        .reduce((sum, entry) => sum + entry.count, 0) ?? 0;
    const openApprovalRequest = (requestId: string) => {
        if (typeof window === 'undefined') return;
        window.location.href = `/banking/maintenance/approval?requestId=${encodeURIComponent(requestId)}`;
    };

    const auditColumns = useMemo<GridColDef<AuditLog>[]>(() => [
        {
            field: 'createdAt',
            headerName: 'Time',
            width: 180,
            renderCell: (params) => dayjs(params.value).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            field: 'eventType',
            headerName: 'Event',
            width: 140,
            renderCell: (params) => <Chip label={params.value} size="small" color="primary" variant="outlined" />,
        },
        {
            field: 'action',
            headerName: 'Action',
            minWidth: 150,
            flex: 0.8,
        },
        {
            field: 'userId',
            headerName: 'User',
            minWidth: 150,
            flex: 0.8,
            renderCell: (params) => params.value || 'System',
        },
        {
            field: 'entityType',
            headerName: 'Entity',
            minWidth: 220,
            flex: 1,
            renderCell: (params) => params.row.entityType ? `${params.row.entityType} (${params.row.entityName || '-'})` : '-',
        },
        {
            field: 'description',
            headerName: 'Description',
            minWidth: 280,
            flex: 1.4,
        },
    ], []);

    const renderAuditDetailPanel = ({ row: log }: { row: AuditLog }) => (
        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
            <Typography variant="h6" gutterBottom component="div">
                Details
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                <Chip size="small" label={`Event: ${log.eventType}`} variant="outlined" />
                <Chip size="small" label={`Action: ${log.action}`} variant="outlined" />
                {log.entityType && (
                    <Chip size="small" label={`Entity: ${log.entityType}`} variant="outlined" />
                )}
                {getAuditRequestId(log) && (
                    <Chip
                        size="small"
                        color="info"
                        variant="outlined"
                        label={`Request ID: ${getAuditRequestId(log)}`}
                    />
                )}
                {getAuditRequestId(log) && (
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openApprovalRequest(getAuditRequestId(log)!)}
                        data-testid={`audit-open-approval-button-${log.id}`}
                    >
                        Open Approval
                    </Button>
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
    );

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
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="overline" color="text.secondary">Total Events</Typography>
                                <Typography variant="h5">{statsLoading ? '...' : totalEventsValue}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="overline" color="text.secondary">Approval Events</Typography>
                                <Typography variant="h5">{statsLoading ? '...' : approvalEventsCount}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="overline" color="text.secondary">Top Event Type</Typography>
                                <Typography variant="h6">{statsLoading ? '...' : topEventTypeLabel}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {statsLoading ? '' : `${topEventTypeCount} events`}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="overline" color="text.secondary">Top User</Typography>
                                <Typography variant="h6">{statsLoading ? '...' : topUserLabel}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {statsLoading ? '' : `${topUserCount} events`}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <TextField
                    fullWidth
                    placeholder="Search logs, entities, actions, or Request ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    inputProps={{ 'data-testid': 'audit-search-input' }}
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
                                        data-testid="audit-event-type-select"
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
                                    inputProps={{ 'data-testid': 'audit-request-id-input' }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 2 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Action</InputLabel>
                                    <Select
                                        value={actionFilter}
                                        label="Action"
                                        onChange={(e) => setActionFilter(e.target.value)}
                                        data-testid="audit-action-select"
                                    >
                                        <MenuItem value="">All Actions</MenuItem>
                                        {actionOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 2 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Entity Type</InputLabel>
                                    <Select
                                        value={entityTypeFilter}
                                        label="Entity Type"
                                        onChange={(e) => setEntityTypeFilter(e.target.value)}
                                        data-testid="audit-entity-type-select"
                                    >
                                        <MenuItem value="">All Entities</MenuItem>
                                        {entityTypeOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
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
                                    <Button variant="text" onClick={resetFilters} data-testid="audit-reset-filters-button">
                                        Reset Filters
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            setPage(0);
                                            void logsQuery.refetch();
                                            void statsQuery.refetch();
                                        }}
                                        data-testid="audit-apply-filters-button"
                                    >
                                        Apply Filters
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                </Collapse>

                <SafeDataGrid
                    rows={logs}
                    columns={auditColumns}
                    loading={loading}
                    getRowId={(row) => row.id}
                    rowCount={total}
                    paginationMode="offset"
                    paginationModel={{ page, pageSize: rowsPerPage }}
                    onPaginationModelChange={(model) => {
                        if (model.page !== page) handleChangePage(null, model.page);
                        if (model.pageSize !== rowsPerPage) {
                            handleChangeRowsPerPage({ target: { value: String(model.pageSize) } } as React.ChangeEvent<HTMLInputElement>);
                        }
                    }}
                    pageSizeOptions={[10, 25, 50]}
                    disableRowSelectionOnClick
                    tableStateKey="audit-log-list-table"
                    fillAvailableHeight
                    maxTableHeight="none"
                    getDetailPanelContent={renderAuditDetailPanel}
                />
            </Paper>
        </Box>
    );
};

export default AuditLogList;
