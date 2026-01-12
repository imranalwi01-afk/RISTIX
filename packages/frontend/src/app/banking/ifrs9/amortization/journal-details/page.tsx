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
    TextField
} from '@mui/material';
import { Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';
import { useApi } from '@/hooks/useApi';

interface JournalDetail {
    id?: number;
    prcDate?: string;
    accountId?: number;
    facno?: string;
    cifno?: string;
    acctno?: string;
    datasource?: string;
    prdtype?: string;
    prdcode?: string;
    trxcode?: string;
    ccy?: string;
    journalcode?: string;
    journalcode2?: string;
    status?: string;
    drcr?: string;
    glno?: string;
    nAmount?: number;
    nAmountIdr?: number;
    sourceprocess?: string;
    branch?: string;
    journalDesc?: string;
    createddate?: string;
    createdby?: string;
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

export default function JournalDetailsPage() {
    const { apiCall } = useApi();
    const [data, setData] = useState<JournalDetail[]>([]);
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

            const response = await apiCall(`/api/v1/banking/ifrs9/amortization-module/journal-details?${params}`) as ApiResponse<JournalDetail>;

            if (response.success) {
                setData(response.data);
                setTotalCount(response.pagination?.total || 0);
            } else {
                setError('Failed to load journal details');
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

    const formatCurrency = (amount?: number) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Box mb={3}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link color="inherit" href="/banking">Banking</Link>
                    <Link color="inherit" href="/banking/ifrs9">IFRS 9</Link>
                    <Typography color="text.primary">Journal Details</Typography>
                </Breadcrumbs>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" component="h1" gutterBottom>
                        Amortization Journal Details
                    </Typography>
                    <Button variant="contained" startIcon={<RefreshIcon />} onClick={loadData}>
                        Refresh
                    </Button>
                </Box>
                <Typography variant="body1" color="text.secondary">
                    Journal entry details from the amortization system.
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
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Process Date</TableCell>
                                        <TableCell>Account ID</TableCell>
                                        <TableCell>Account No</TableCell>
                                        <TableCell>CIF No</TableCell>
                                        <TableCell>Journal Code</TableCell>
                                        <TableCell>GL No</TableCell>
                                        <TableCell>DR/CR</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                        <TableCell align="right">Amount IDR</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Created By</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.map((row, index) => (
                                        <TableRow key={row.id || index}>
                                            <TableCell>{row.prcDate ? new Date(row.prcDate).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell>{row.accountId || '-'}</TableCell>
                                            <TableCell>{row.acctno || '-'}</TableCell>
                                            <TableCell>{row.cifno || '-'}</TableCell>
                                            <TableCell>{row.journalcode || '-'}</TableCell>
                                            <TableCell>{row.glno || '-'}</TableCell>
                                            <TableCell>{row.drcr || '-'}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.nAmount)}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.nAmountIdr)}</TableCell>
                                            <TableCell>{row.status || '-'}</TableCell>
                                            <TableCell>{row.journalDesc || '-'}</TableCell>
                                            <TableCell>{row.createdby || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                    {data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={12} align="center">
                                                <Box py={4}>
                                                    <Typography variant="h6" color="text.secondary">
                                                        No journal details found
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
