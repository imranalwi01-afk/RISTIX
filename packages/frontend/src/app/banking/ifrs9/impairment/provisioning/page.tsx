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
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import { useApi } from '@/hooks/useApi';

interface ProvisionSummary {
    prcDate: string;
    totalAccounts: number;
    totalOutstanding: number;
    totalECLOnBalance: number;
    totalECLOffBalance: number;
    totalECL: number;
    stage1Provision: number;
    stage2Provision: number;
    stage3Provision: number;
    coverageRatio: number;
}

interface ApiResponse<T> {
    success: boolean;
    data: T[];
}

export default function ProvisioningPage() {
    const { apiCall } = useApi();
    const [data, setData] = useState<ProvisionSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = selectedPeriod !== 'all' ? `?prcDate=${selectedPeriod}` : '';
            const response = await apiCall(`/api/v1/banking/ifrs9/impairment-module/provision-summary${params}`) as ApiResponse<ProvisionSummary>;

            if (response.success) {
                setData(response.data);
            } else {
                setError('Failed to load provision summary');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedPeriod]);

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

    const latestData = data.length > 0 ? data[0] : null;

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Box mb={3}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link color="inherit" href="/banking">Banking</Link>
                    <Link color="inherit" href="/banking/ifrs9">IFRS 9</Link>
                    <Link color="inherit" href="/banking/ifrs9/impairment">Impairment</Link>
                    <Typography color="text.primary">Provisioning</Typography>
                </Breadcrumbs>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" component="h1" gutterBottom>
                        Provision Summary
                    </Typography>
                    <Box>
                        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} sx={{ mr: 2 }}>
                            Refresh
                        </Button>
                        <Button variant="contained" startIcon={<DownloadIcon />}>
                            Export
                        </Button>
                    </Box>
                </Box>
                <Typography variant="body1" color="text.secondary">
                    ECL provision summary and coverage analysis by reporting period.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <FormControl fullWidth>
                        <InputLabel>Reporting Period</InputLabel>
                        <Select
                            value={selectedPeriod}
                            label="Reporting Period"
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                        >
                            <MenuItem value="all">All Periods (Last 12)</MenuItem>
                            {data.map((item, idx) => (
                                <MenuItem key={`${item.prcDate}-${idx}`} value={item.prcDate}>
                                    {new Date(item.prcDate).toLocaleDateString()}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            {latestData && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="primary">
                                    {formatCurrency(latestData.totalOutstanding)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Outstanding
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="error">
                                    {formatCurrency(latestData.totalECL)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total ECL Provision
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="warning.main">
                                    {formatPercent(latestData.coverageRatio)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Coverage Ratio
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="info.main">
                                    {latestData.totalAccounts.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Accounts
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
                                        <TableCell>Process Date</TableCell>
                                        <TableCell align="right">Total Accounts</TableCell>
                                        <TableCell align="right">Total Outstanding</TableCell>
                                        <TableCell align="right">Stage 1 Provision</TableCell>
                                        <TableCell align="right">Stage 2 Provision</TableCell>
                                        <TableCell align="right">Stage 3 Provision</TableCell>
                                        <TableCell align="right">Total ECL</TableCell>
                                        <TableCell align="right">Coverage Ratio</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{new Date(row.prcDate).toLocaleDateString()}</TableCell>
                                            <TableCell align="right">{row.totalAccounts.toLocaleString()}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.totalOutstanding)}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.stage1Provision)}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.stage2Provision)}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.stage3Provision)}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.totalECL)}</TableCell>
                                            <TableCell align="right">{formatPercent(row.coverageRatio)}</TableCell>
                                        </TableRow>
                                    ))}
                                    {data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                <Box py={4}>
                                                    <Typography variant="h6" color="text.secondary">
                                                        No provision data found
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
}
