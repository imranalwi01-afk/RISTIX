'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
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
  TextField,
  Chip
} from '@mui/material';

import {
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon
} from '@mui/icons-material';

import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/providers/AuthProvider';

interface ImpairmentResult {
  accountId: number;
  facilityNumber: string;
  cifNumber: string;
  prcDate: string;
  stage: number;
  outstanding: number;
  eclFinal: number;
  currency: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ImpairmentModulePage() {
  const { apiCall } = useApi();

  const [results, setResults] = useState<ImpairmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const loadResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString()
      });

      // Fetch from the new /results endpoint
      const response = await apiCall(`/api/v1/ifrs9/impairment-module/results?${params}`) as ApiResponse<ImpairmentResult>;

      if (response.success) {
        setResults(response.data);
        setTotalCount(response.pagination?.total || 0);
      } else {
        setError(response.message || 'Failed to load impairment results');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiCall, page, rowsPerPage]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const formatCurrency = (amount: number, currency: string = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link color="inherit" href="/banking">Banking</Link>
          <Link color="inherit" href="/banking/ifrs9">IFRS 9</Link>
          <Typography color="text.primary">Impairment Results</Typography>
        </Breadcrumbs>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1" gutterBottom>
            Impairment Results
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={loadResults}
          >
            Refresh Data
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Detailed view of impairment calculations and ECL results per account.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Results Table */}
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
                    <TableCell>Reporting Date</TableCell>
                    <TableCell>Account ID</TableCell>
                    <TableCell>Facility No</TableCell>
                    <TableCell>CIF</TableCell>
                    <TableCell>Stage</TableCell>
                    <TableCell align="right">Outstanding Balance</TableCell>
                    <TableCell align="right">ECL Final</TableCell>
                    <TableCell align="right">Covg %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((row) => {
                    const coverage = row.outstanding ? (row.eclFinal / row.outstanding) * 100 : 0;
                    return (
                      <TableRow key={`${row.accountId}-${row.prcDate}`}>
                        <TableCell>{row.prcDate}</TableCell>
                        <TableCell>{row.accountId}</TableCell>
                        <TableCell>{row.facilityNumber}</TableCell>
                        <TableCell>{row.cifNumber}</TableCell>
                        <TableCell>
                          <Chip
                            label={`Stage ${row.stage}`}
                            color={row.stage === 3 ? 'error' : row.stage === 2 ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(row.outstanding, row.currency)}</TableCell>
                        <TableCell align="right">{formatCurrency(row.eclFinal, row.currency)}</TableCell>
                        <TableCell align="right">{coverage.toFixed(2)}%</TableCell>
                      </TableRow>
                    )
                  })}
                  {results.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Box py={4}>
                          <Typography variant="h6" color="text.secondary">
                            No impairment results found
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
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