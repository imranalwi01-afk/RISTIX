'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Container,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { ImpairmentModuleDetailsPanel } from '@/features/ifrs9-modules/components/ImpairmentModuleDetailsPanel';
import { ImpairmentModuleTable } from '@/features/ifrs9-modules/components/ImpairmentModuleTable';
import {
  useImpairmentModuleDetailQuery,
  useImpairmentModuleResultsQuery,
} from '@/features/ifrs9-modules/hooks/useIfrs9ModuleQueries';

export default function ImpairmentModulePage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedPkid, setSelectedPkid] = useState<string | null>(null);

  const resultsQuery = useImpairmentModuleResultsQuery({
    page: page + 1,
    limit: rowsPerPage,
    search: search.trim() || undefined,
  });

  const results = useMemo(() => resultsQuery.data?.rows ?? [], [resultsQuery.data]);
  const totalCount = resultsQuery.data?.total ?? 0;
  const effectivePrcDate = resultsQuery.data?.effectivePrcDate ?? null;
  const detailSupported = resultsQuery.data?.detailSupported ?? false;
  const compatibilityMessage = resultsQuery.data?.compatibilityMessage ?? null;
  const loading = resultsQuery.isLoading || resultsQuery.isFetching;
  const error = !resultsQuery.data?.success ? resultsQuery.data?.message || 'Failed to load impairment results' : null;

  useEffect(() => {
    if (results.length === 0) {
      if (selectedPkid) setSelectedPkid(null);
      return;
    }

    const selectableRows = results.filter((row) => Boolean(row.pkid));
    if (selectableRows.length === 0) {
      if (selectedPkid) setSelectedPkid(null);
      return;
    }

    const selectedStillExists = selectableRows.some((row) => row.pkid === selectedPkid);
    if (!selectedStillExists) {
      setSelectedPkid(selectableRows[0].pkid ?? null);
    }
  }, [results, selectedPkid, detailSupported]);

  const selectedRow = useMemo(
    () => results.find((row) => row.pkid === selectedPkid) ?? null,
    [results, selectedPkid],
  );

  const detailQuery = useImpairmentModuleDetailQuery(selectedPkid);
  const detailResponse = detailQuery.data;
  const detailPayload = detailResponse && detailResponse.success ? detailResponse.data : null;
  const detailError = detailResponse && !detailResponse.success
    ? detailResponse.message || 'Failed to load impairment details'
    : null;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link color="inherit" href="/banking">Banking Dashboard</Link>
          <Link color="inherit" href="/banking/ifrs9">IFRS 9</Link>
          <Typography color="text.primary">Impairment Module</Typography>
        </Breadcrumbs>

        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Impairment Module
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Tech-spec aligned list sourced from `frs9_master_account`, with detail tabs for contract, collective, individual, and journal views.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Effective PRC date: {effectivePrcDate || '-'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => {
              void resultsQuery.refetch();
              if (selectedPkid) void detailQuery.refetch();
            }}
          >
            Refresh Data
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {compatibilityMessage && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {compatibilityMessage}
        </Alert>
      )}

      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6">Impairment Contract List</Typography>
                <Typography variant="body2" color="text.secondary">
                  Query source follows the tech spec list from `FRS9_MASTER_ACCOUNT`.
                </Typography>
              </Box>
              <TextField
                size="small"
                label="Search contract"
                placeholder="Account / Facility / CIF / Name"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                sx={{ width: { xs: '100%', md: 360 } }}
              />
            </Stack>

            <ImpairmentModuleTable
              rows={results}
              totalCount={totalCount}
              page={page}
              rowsPerPage={rowsPerPage}
              loading={loading}
              selectedPkid={selectedPkid}
              onSelectRow={setSelectedPkid}
              detailSupported={detailSupported}
              onPageChange={setPage}
              onRowsPerPageChange={(nextRowsPerPage) => {
                setRowsPerPage(nextRowsPerPage);
                setPage(0);
              }}
            />
          </CardContent>
        </Card>

        <ImpairmentModuleDetailsPanel
          selectedRow={selectedRow}
          loading={detailSupported && (detailQuery.isLoading || detailQuery.isFetching)}
          error={detailError}
          detail={detailPayload}
          detailSupported={detailSupported}
          compatibilityMessage={compatibilityMessage}
        />
      </Stack>
    </Container>
  );
}
