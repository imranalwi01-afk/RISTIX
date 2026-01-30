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
    Button
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useApi } from '@/hooks/useApi';

interface FeesCost {
    pkid: number;
    accountNumber?: string;
    transactionType?: string;
    costAmount?: number;
    feeAmount?: number;
    effectiveDate?: string;
    createdby?: string;
    createddate?: string;
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

export default function FeesCostsPage() {
    const { apiCall } = useApi();
    const [data, setData] = useState<FeesCost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: rowsPerPage.toString()
            });

            const response = await apiCall(`/api/v1/banking/ifrs9/amortization-module/fees-costs?${params}`) as ApiResponse<FeesCost>;

            if (response.success) {
                setData(response.data);
                setTotalCount(response.pagination?.total || 0);
            } else {
                setError('Failed to load fees and costs');
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
                    <Typography color="text.primary">Fees & Costs</Typography>
                </Breadcrumbs>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" component="h1" gutterBottom>
                        Transaction Fees & Costs
                    </Typography>
                    <Button variant="contained" startIcon={<RefreshIcon />} onClick={loadData}>
                        Refresh
                    </Button>
                </Box>
                <Typography variant="body1" color="text.secondary">
                    Transaction costs and fees from the amortization system.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

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
                                        <TableCell>ID</TableCell>
                                        <TableCell>Account Number</TableCell>
                                        <TableCell>Transaction Type</TableCell>
                                        <TableCell align="right">Cost Amount</TableCell>
                                        <TableCell align="right">Fee Amount</TableCell>
                                        <TableCell>Effective Date</TableCell>
                                        <TableCell>Created By</TableCell>
                                        <TableCell>Created Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.map((row) => (
                                        <TableRow key={row.pkid}>
                                            <TableCell>{row.pkid}</TableCell>
                                            <TableCell>{row.accountNumber || '-'}</TableCell>
                                            <TableCell>{row.transactionType || '-'}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.costAmount)}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.feeAmount)}</TableCell>
                                            <TableCell>{row.effectiveDate ? new Date(row.effectiveDate).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell>{row.createdby || '-'}</TableCell>
                                            <TableCell>{row.createddate ? new Date(row.createddate).toLocaleDateString() : '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                    {data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                <Box py={4}>
                                                    <Typography variant="h6" color="text.secondary">
                                                        No fees and costs found
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
