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
    Chip,
    Grid
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useApi } from '@/hooks/useApi';

interface WatchlistItem {
    pkid: number;
    account_number: string;
    cif_name: string;
    cif_number: string;
    outstanding_balance: number;
    stage: number;
    ecl_amount: number;
    impaired_flag: string;
    rating_code: string;
    assessment_status: string;
    currency: string;
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

export default function IndividualImpairmentPage() {
    const { apiCall } = useApi();
    const [data, setData] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: rowsPerPage.toString()
            });

            if (searchTerm) {
                params.append('search', searchTerm);
            }

            const response = await apiCall(`/api/v1/banking/individual/impairment/watchlist?${params}`) as ApiResponse<WatchlistItem>;

            if (response.success) {
                setData(response.data);
                setTotalCount(response.pagination?.total || 0);
            } else {
                setError('Failed to load individual impairment data');
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

    const formatCurrency = (amount: number, currency: string = 'IDR') => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const getStageColor = (stage: number) => {
        switch (stage) {
            case 1: return 'success';
            case 2: return 'warning';
            case 3: return 'error';
            default: return 'default';
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Box mb={3}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link color="inherit" href="/banking">Banking</Link>
                    <Link color="inherit" href="/banking/ifrs9">IFRS 9</Link>
                    <Link color="inherit" href="/banking/ifrs9/impairment">Impairment</Link>
                    <Typography color="text.primary">Individual Impairment</Typography>
                </Breadcrumbs>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" component="h1" gutterBottom>
                        Individual Impairment Watchlist
                    </Typography>
                    <Box>
                        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} sx={{ mr: 2 }}>
                            Refresh
                        </Button>
                        <Button variant="contained" startIcon={<AddIcon />}>
                            Add to Watchlist
                        </Button>
                    </Box>
                </Box>
                <Typography variant="body1" color="text.secondary">
                    Individual impairment assessments and watchlist management.
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
                            label="Search by Account or Customer"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSearch}>
                            Search
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            {data.length > 0 && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="primary">
                                    {data.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Watchlist Items
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="error">
                                    {data.filter(item => item.impaired_flag === 'I').length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Impaired Accounts
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="warning.main">
                                    {data.filter(item => item.stage === 2).length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Stage 2 Accounts
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="error.main">
                                    {data.filter(item => item.stage === 3).length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Stage 3 Accounts
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
                                        <TableCell>Account Number</TableCell>
                                        <TableCell>Customer Name</TableCell>
                                        <TableCell>CIF Number</TableCell>
                                        <TableCell align="right">Outstanding Balance</TableCell>
                                        <TableCell>Stage</TableCell>
                                        <TableCell align="right">ECL Amount</TableCell>
                                        <TableCell>Impaired</TableCell>
                                        <TableCell>Rating</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.map((row) => (
                                        <TableRow key={row.pkid}>
                                            <TableCell>{row.account_number}</TableCell>
                                            <TableCell>{row.cif_name}</TableCell>
                                            <TableCell>{row.cif_number}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.outstanding_balance, row.currency)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={`Stage ${row.stage}`}
                                                    size="small"
                                                    color={getStageColor(row.stage) as any}
                                                />
                                            </TableCell>
                                            <TableCell align="right">{formatCurrency(row.ecl_amount, row.currency)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.impaired_flag === 'I' ? 'Impaired' : 'Not Impaired'}
                                                    size="small"
                                                    color={row.impaired_flag === 'I' ? 'error' : 'success'}
                                                />
                                            </TableCell>
                                            <TableCell>{row.rating_code}</TableCell>
                                            <TableCell>
                                                <Chip label={row.assessment_status} size="small" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={9} align="center">
                                                <Box py={4}>
                                                    <Typography variant="h6" color="text.secondary">
                                                        No watchlist items found
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
