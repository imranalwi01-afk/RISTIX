// packages/frontend/src/app/banking/reports/nominative/page.tsx
// ============================================================================
// IFRS9 FRONTEND - NOMINATIVE REPORTS PAGE
// ============================================================================
// Purpose: Detailed nominative reporting and account-level analysis
// Generated: 2025-07-28T05:12:54Z
// Stakeholder: Banking Institution
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import {
  Assessment as PageIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { reportsAPI } from '@/services/api.reports';

interface NominativeItem {
  prcDate: string;
  accountId: number;
  facilityNumber: string;
  cifNumber: string;
  stage: number;
  outstanding: number;
  eclFinal: number;
  bucketId: number;
}

export default function NominativeReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<NominativeItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await reportsAPI.nominativeReport.get({ page: 1, limit: 100 });
      if (result.success && Array.isArray(result.data)) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error loading Nominative Reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Container maxWidth="xl">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            router.push('/dashboard');
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <PageIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Nominative Reports
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PageIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Nominative Reports
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Detailed ECL calculation results per account
        </Typography>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Process Date</TableCell>
                        <TableCell>Facility Number</TableCell>
                        <TableCell>CIF Number</TableCell>
                        <TableCell>Bucket</TableCell>
                        <TableCell>Stage</TableCell>
                        <TableCell align="right">Outstanding</TableCell>
                        <TableCell align="right">ECL Final</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">No data available</TableCell>
                        </TableRow>
                      ) : (
                        data.map((row, index) => (
                          <TableRow key={`${row.accountId}-${index}`}>
                            <TableCell>{formatDate(row.prcDate)}</TableCell>
                            <TableCell>{row.facilityNumber || '-'}</TableCell>
                            <TableCell>{row.cifNumber || '-'}</TableCell>
                            <TableCell>{row.bucketId}</TableCell>
                            <TableCell>
                              <Chip
                                label={`Stage ${row.stage}`}
                                color={row.stage === 3 ? 'error' : row.stage === 2 ? 'warning' : 'success'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">{formatCurrency(row.outstanding)}</TableCell>
                            <TableCell align="right">{formatCurrency(row.eclFinal)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
