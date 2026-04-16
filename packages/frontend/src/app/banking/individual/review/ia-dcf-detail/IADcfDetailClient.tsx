'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Box, Card, CardContent, CircularProgress, Container, Grid, Typography } from '@mui/material';
import PageHeader from '@/components/banking/shared/PageHeader';
import { GridColDef } from '@mui/x-data-grid';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import { api } from '@/services/api';

const columns: GridColDef[] = [
  { field: 'mob', headerName: 'No.', width: 90 },
  {
    field: 'periode',
    headerName: 'Estimated Date',
    width: 150,
    valueFormatter: (value: unknown) => (value ? new Date(String(value)).toLocaleDateString('en-GB') : '-')
  },
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

type ResultHeader = {
  accountNumber?: string;
  cifName?: string;
  effectiveDate?: string | null;
  outstanding?: number;
  pvDcfAmt?: number;
  eclIaAmt?: number;
};

type DcfRow = { pkid: number } & Record<string, unknown>;

export function IADcfDetailClient({
  accountId,
  accountNumber,
}: {
  accountId?: string | null;
  accountNumber?: string | null;
}) {
  const [rows, setRows] = useState<DcfRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultHeader, setResultHeader] = useState<ResultHeader | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
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
      } catch (fetchError: unknown) {
        const message = fetchError instanceof Error ? fetchError.message : 'Failed to fetch IA result detail';
        setError(message);
        setResultHeader(null);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId, accountNumber]);

  return (
    <Container maxWidth="xl">
      <FullstackIndicator />
      <PageHeader
        title="IA Discounted Cash Flow Detail"
        subtitle="Detailed view of individual impairment tabulation result"
      />
      <Card>
        <CardContent>
          <Box mb={2}>
            {!accountId && !accountNumber ? (
              <Alert severity="info">Pilih account dari List Report untuk melihat detail DCF.</Alert>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : !resultHeader ? (
              <Alert severity="warning">Tidak ada hasil individual impairment untuk account terpilih.</Alert>
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
                    <Typography variant="h6">
                      {resultHeader.effectiveDate ? new Date(resultHeader.effectiveDate).toLocaleDateString('en-GB') : '-'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Outstanding</Typography>
                    <Typography variant="h6">{formatCurrency(Number(resultHeader.outstanding || 0))}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">PV Cashflow</Typography>
                    <Typography variant="h6">{formatCurrency(Number(resultHeader.pvDcfAmt || 0))}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">IA Provision</Typography>
                    <Typography variant="h6">{formatCurrency(Number(resultHeader.eclIaAmt || 0))}</Typography>
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
