'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Breadcrumbs,
    Link,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Button,
    TextField,
    Chip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { useApi } from '@/hooks/useApi';

interface Event {
    prcDate?: string;
    accountId?: number;
    accountNumber?: string;
    effectiveDate?: string;
    beforeValue?: string;
    afterValue?: string;
    eventId?: number;
    remarks?: string;
    createdby?: string;
    createdDate?: string;
}

interface ApiResponse<T> {
    success: boolean;
    data: T[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function EventsPage() {
    const { apiCall } = useApi();
    const [data, setData] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalCount, setTotalCount] = useState(0);
    const [searchAccountId, setSearchAccountId] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: rowsPerPage.toString()
            });

            if (searchAccountId) {
                params.append('accountId', searchAccountId);
            }

            const response = await apiCall(`/api/v1/banking/ifrs9/amortization-module/events?${params}`) as ApiResponse<Event>;

            if (response.success) {
                setData(response.data);
                setTotalCount(response.pagination?.total || 0);
            } else {
                setError('Failed to load events');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [page, rowsPerPage]);

    const handleSearch = () => {
        setPage(0);
        loadData();
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Box mb={3}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link color="inherit" href="/banking">Banking</Link>
                    <Link color="inherit" href="/banking/ifrs9">IFRS 9</Link>
                    <Typography color="text.primary">Amortization Events</Typography>
                </Breadcrumbs>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" component="h1" gutterBottom>
                        Amortization Events
                    </Typography>
                    <Button variant="contained" startIcon={<RefreshIcon />} onClick={loadData}>
                        Refresh
                    </Button>
                </Box>
                <Typography variant="body1" color="text.secondary">
                    Event changes and modifications in the amortization system.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Box display="flex" gap={2}>
                        <TextField
                            fullWidth
                            label="Search by Account ID"
                            type="number"
                            value={searchAccountId}
                            onChange={(e) => setSearchAccountId(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSearch}>
                            Search
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {loading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Process Date</TableCell>
                                        <TableCell>Account ID</TableCell>
                                        <TableCell>Account Number</TableCell>
                                        <TableCell>Event ID</TableCell>
                                        <TableCell>Before Value</TableCell>
                                        <TableCell>After Value</TableCell>
                                        <TableCell>Remarks</TableCell>
                                        <TableCell>Created By</TableCell>
                                        <TableCell>Created Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{row.prcDate ? new Date(row.prcDate).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell>{row.accountId || '-'}</TableCell>
                                            <TableCell>{row.accountNumber || '-'}</TableCell>
                                            <TableCell>
                                                {row.eventId ? <Chip label={row.eventId} size="small" color="primary" /> : '-'}
                                            </TableCell>
                                            <TableCell>{row.beforeValue || '-'}</TableCell>
                                            <TableCell>{row.afterValue || '-'}</TableCell>
                                            <TableCell>{row.remarks || '-'}</TableCell>
                                            <TableCell>{row.createdby || '-'}</TableCell>
                                            <TableCell>{row.createdDate ? new Date(row.createdDate).toLocaleDateString() : '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                    {data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={9} align="center">
                                                <Box py={4}>
                                                    <Typography variant="h6" color="text.secondary">
                                                        No events found
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[10, 20, 50]}
                                component="div"
                                count={totalCount}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={(_, newPage) => setPage(newPage)}
                                onRowsPerPageChange={(e) => {
                                    setRowsPerPage(parseInt(e.target.value));
                                    setPage(0);
                                }}
                            />
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
}
