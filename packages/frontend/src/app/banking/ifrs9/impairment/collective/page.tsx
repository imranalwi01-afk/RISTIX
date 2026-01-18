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
    Grid,
    Chip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useApi } from '@/hooks/useApi';

interface ECLCalculation {
    id: string;
    calculationName: string;
    calculationType: string;
    reportingDate: string;
    totalExposure: number;
    totalECL: number;
    stage1Exposure: number;
    stage2Exposure: number;
    stage3Exposure: number;
    stage1ECL: number;
    stage2ECL: number;
    stage3ECL: number;
    coverageRatio: number;
    status: string;
    createdAt: string;
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

export default function CollectiveImpairmentPage() {
    const { apiCall } = useApi();
    const [data, setData] = useState<ECLCalculation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiCall('/api/v1/banking/ifrs9/impairment-module/calculations') as ApiResponse<ECLCalculation>;

            if (response.success) {
                setData(response.data);
            } else {
                setError('Failed to load collective impairment data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatPercent = (value: number) => {
        return `${(value || 0).toFixed(2)}%`;
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Box mb={3}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link color="inherit" href="/banking">Banking</Link>
                    <Link color="inherit" href="/banking/ifrs9">IFRS 9</Link>
                    <Link color="inherit" href="/banking/ifrs9/impairment">Impairment</Link>
                    <Typography color="text.primary">Collective Impairment</Typography>
                </Breadcrumbs>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" component="h1" gutterBottom>
                        Collective Impairment (ECL)
                    </Typography>
                    <Box>
                        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} sx={{ mr: 2 }}>
                            Refresh
                        </Button>
                        <Button variant="contained" startIcon={<CalculateIcon />}>
                            Run Calculation
                        </Button>
                    </Box>
                </Box>
                <Typography variant="body1" color="text.secondary">
                    Expected Credit Loss calculations and collective impairment analysis.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Summary Cards */}
            {data.length > 0 && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="primary">
                                    {formatCurrency(data.reduce((sum, item) => sum + item.totalExposure, 0))}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Exposure
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="error">
                                    {formatCurrency(data.reduce((sum, item) => sum + item.totalECL, 0))}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total ECL
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="success.main">
                                    {formatCurrency(data.reduce((sum, item) => sum + item.stage1Exposure, 0))}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Stage 1 Exposure
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="warning.main">
                                    {formatPercent(data.reduce((sum, item) => sum + item.coverageRatio, 0) / data.length)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Avg Coverage Ratio
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
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
                                        <TableCell>Calculation Name</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Reporting Date</TableCell>
                                        <TableCell align="right">Total Exposure</TableCell>
                                        <TableCell align="right">Total ECL</TableCell>
                                        <TableCell align="right">Stage 1 ECL</TableCell>
                                        <TableCell align="right">Stage 2 ECL</TableCell>
                                        <TableCell align="right">Stage 3 ECL</TableCell>
                                        <TableCell align="right">Coverage %</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.calculationName}</TableCell>
                                            <TableCell><Chip label={row.calculationType} size="small" color="primary" /></TableCell>
                                            <TableCell>{new Date(row.reportingDate).toLocaleDateString()}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.totalExposure)}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.totalECL)}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.stage1ECL)}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.stage2ECL)}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.stage3ECL)}</TableCell>
                                            <TableCell align="right">{formatPercent(row.coverageRatio)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.status}
                                                    size="small"
                                                    color={row.status === 'COMPLETED' ? 'success' : 'warning'}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center">
                                                <Box py={4}>
                                                    <Typography variant="h6" color="text.secondary">
                                                        No collective impairment calculations found
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
                                count={data.length}
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
