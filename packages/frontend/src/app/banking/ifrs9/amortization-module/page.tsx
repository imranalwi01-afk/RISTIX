'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { useAuth } from '@/providers/AuthProvider';

interface AmortizationResult {
  id: number;
  accountId: number;
  prcDate: string;
  nLoanAmt: number;
  nIntRate: number;
  nEffIntRate: number;
  startamortdate: string;
  endamortdate: string;
  restBalance: number;
  currency?: string; // Not in schema explicitly, assuming default or derived
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

export default function AmortizationModulePage() {
  const { apiCall } = useApi();

  const [results, setResults] = useState<AmortizationResult[]>([]);
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

      const response = await apiCall(`/api/v1/ifrs9/amortization-module?${params}`) as ApiResponse<AmortizationResult>;

      if (response.success) {
        setResults(response.data);
        setTotalCount(response.pagination?.total || 0);
      } else {
        setError(response.message || 'Failed to load amortization results');
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR', // Defaulting as currency col might be missing
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatPercent = (val: number) => {
    return val ? `${val.toFixed(2)}%` : '0%';
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link color="inherit" href="/banking">Banking</Link>
          <Link color="inherit" href="/banking/ifrs9">IFRS 9</Link>
          <Typography color="text.primary">Amortization</Typography>
        </Breadcrumbs>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1" gutterBottom>
            Amortization / EIR Results
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
          Effective Interest Rate and Amortization Schedule data.
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
                    <TableCell>Process Date</TableCell>
                    <TableCell>Account ID</TableCell>
                    <TableCell align="right">Loan Amount</TableCell>
                    <TableCell align="right">Interest Rate</TableCell>
                    <TableCell align="right">Effective Rate</TableCell>
                    <TableCell>Start Amort</TableCell>
                    <TableCell>End Amort</TableCell>
                    <TableCell align="right">Rest Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.prcDate}</TableCell>
                      <TableCell>{row.accountId}</TableCell>
                      <TableCell align="right">{formatCurrency(row.nLoanAmt)}</TableCell>
                      <TableCell align="right">{formatPercent(row.nIntRate)}</TableCell>
                      <TableCell align="right">{formatPercent(row.nEffIntRate)}</TableCell>
                      <TableCell>{row.startamortdate}</TableCell>
                      <TableCell>{row.endamortdate}</TableCell>
                      <TableCell align="right">{formatCurrency(row.restBalance)}</TableCell>
                    </TableRow>
                  ))}
                  {results.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Box py={4}>
                          <Typography variant="h6" color="text.secondary">
                            No amortization data found
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