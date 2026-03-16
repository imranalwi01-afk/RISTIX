'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, CircularProgress, Alert, Grid } from '@mui/material';
import PageHeader from '@/components/banking/shared/PageHeader';
import { GridColDef } from '@mui/x-data-grid';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import { api } from '@/services/api';
import { useAssessmentWorkspaceEmbedded } from '../../assessment/embedded-context';
import { useSearchParams } from 'next/navigation';

const columns: GridColDef[] = [
  { field: 'mob', headerName: 'No.', width: 90 },
  { field: 'periode', headerName: 'Estimated Date', width: 150, valueFormatter: (value: any) => value ? new Date(value).toLocaleDateString('en-GB') : '-' },
  { field: 'principal', headerName: 'Principal', width: 150, type: 'number' },
  { field: 'interest', headerName: 'Interest', width: 140, type: 'number' },
  { field: 'installment', headerName: 'Installment', width: 150, type: 'number' },
  { field: 'collateral', headerName: 'Collateral', width: 150, type: 'number' },
  { field: 'poRate1', headerName: 'PO Rate 1', width: 120, type: 'number' },
  { field: 'rrRate1', headerName: 'RR Rate 1', width: 120, type: 'number' },
  { field: 'default1', headerName: 'Default 1', width: 130, type: 'number' },
  { field: 'poRate2', headerName: 'PO Rate 2', width: 120, type: 'number' },
  { field: 'rrRate2', headerName: 'RR Rate 2', width: 120, type: 'number' },
  { field: 'default2', headerName: 'Default 2', width: 130, type: 'number' },
  { field: 'poRate3', headerName: 'PO Rate 3', width: 120, type: 'number' },
  { field: 'rrRate3', headerName: 'RR Rate 3', width: 120, type: 'number' },
  { field: 'default3', headerName: 'Default 3', width: 130, type: 'number' },
  { field: 'pwAmt', headerName: 'Probability Weighted', width: 170, type: 'number' },
  { field: 'discountFactor', headerName: 'Discount Factor', width: 150, type: 'number' },
  { field: 'pvAmt', headerName: 'PV Cashflow', width: 150, type: 'number' },
  { field: 'beginningBalance', headerName: 'Beginning Balance', width: 170, type: 'number' },
  { field: 'eirAmt', headerName: 'Unwinding', width: 130, type: 'number' },
  { field: 'endingBalance', headerName: 'Ending Balance', width: 160, type: 'number' },
];

export default function IADCFDetailPage() {
  const embedded = useAssessmentWorkspaceEmbedded();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultHeader, setResultHeader] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const accountId = searchParams.get('accountId');
  const accountNumber = searchParams.get('accountNumber');

  const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0);

  useEffect(() => {
    const fetchData = async () => {
      if (!accountId && !accountNumber) {
        setRows([]);
        setResultHeader(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const resultRes = await api.individualImpairment.getIaResultDetail({
          accountId: accountId || undefined,
          accountNumber: accountNumber || undefined
        });

        if (resultRes.success && resultRes.data) {
          setResultHeader(resultRes.data.header);
          setRows(resultRes.data.details || []);
        } else {
          setResultHeader(null);
          setRows([]);
        }
      } catch (fetchError: any) {
        console.error('Failed to fetch IA result detail:', fetchError);
        setError(fetchError.message || 'Failed to fetch IA result detail');
        setResultHeader(null);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accountId, accountNumber]);

  return (
    <Container maxWidth="xl" sx={embedded ? { px: '0 !important' } : undefined}>
      {!embedded && <FullstackIndicator />}
      {!embedded && (
        <PageHeader
          title="IA Discounted Cash Flow Detail"
          subtitle="Detailed view of individual impairment tabulation result"
        />
      )}
      <Card>
        <CardContent>
          <Box mb={2}>
            {!accountId && !accountNumber ? (
              <Alert severity="info">Select an account from Assessment Watchlist to view IA DCF detail.</Alert>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : !resultHeader ? (
              <Alert severity="warning">No individual impairment result found for the selected account.</Alert>
            ) : (
              <Alert severity="info">
                Showing latest IA result for <strong>{resultHeader.accountNumber}</strong> / {resultHeader.cifName}
              </Alert>
            )}
          </Box>

          {resultHeader && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Effective Date</Typography>
                    <Typography variant="h6">{resultHeader.effectiveDate ? new Date(resultHeader.effectiveDate).toLocaleDateString('en-GB') : '-'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Outstanding</Typography>
                    <Typography variant="h6">{formatCurrency(resultHeader.outstanding)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">PV Cashflow</Typography>
                    <Typography variant="h6">{formatCurrency(resultHeader.pvDcfAmt)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">IA Provision</Typography>
                    <Typography variant="h6">{formatCurrency(resultHeader.eclIaAmt)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          <Box sx={{ height: 500, width: '100%' }}>
            {loading ? (
               <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                 <CircularProgress />
               </Box>
            ) : (
                <SafeDataGrid
                  getRowId={(row) => row.pkid}
                  rows={rows}
                  columns={columns}
                />
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
