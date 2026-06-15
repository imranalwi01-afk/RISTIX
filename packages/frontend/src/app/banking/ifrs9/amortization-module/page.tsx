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
import RefreshIcon from '@mui/icons-material/Refresh';
import { AmortizationModuleDetailsPanel } from '@/features/ifrs9-modules/components/AmortizationModuleDetailsPanel';
import { AmortizationModuleTable } from '@/features/ifrs9-modules/components/AmortizationModuleTable';
import { useAmortizationModuleDetailQuery, useAmortizationModuleResultsQuery } from '@/features/ifrs9-modules/hooks/useIfrs9ModuleQueries';

export default function AmortizationModulePage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [prcDate, setPrcDate] = useState('');
  const [selectedPkid, setSelectedPkid] = useState<string | null>(null);

  const resultsQuery = useAmortizationModuleResultsQuery({
    page: cursor ? undefined : (page + 1),
    limit: rowsPerPage,
    cursor,
    prcDate: prcDate || undefined,
    search: search.trim() || undefined,
  });

  const results = useMemo(() => resultsQuery.data?.rows ?? [], [resultsQuery.data]);
  const totalCount = resultsQuery.data?.total ?? 0;
  const nextCursor = resultsQuery.data?.nextCursor ?? null;
  const hasMore = resultsQuery.data?.hasMore ?? false;
  const effectivePrcDate = resultsQuery.data?.effectivePrcDate ?? null;
  const detailSupported = resultsQuery.data?.detailSupported ?? false;
  const compatibilityMessage = resultsQuery.data?.compatibilityMessage ?? null;
  const loading = resultsQuery.isLoading || resultsQuery.isFetching;
  const error = !resultsQuery.data?.success ? resultsQuery.data?.message || 'Failed to load amortization results' : null;

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

  const detailQuery = useAmortizationModuleDetailQuery(selectedPkid);
  const detailData = useMemo(() => detailQuery.data?.data ?? null, [detailQuery.data]);
  const detailLoading = detailSupported && (detailQuery.isLoading || detailQuery.isFetching);
  const detailError = useMemo(
    () => (!detailQuery.data?.success ? detailQuery.data?.message || 'Failed to load amortization details' : null),
    [detailQuery.data],
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3, minWidth: 0, overflowX: 'hidden' }}>
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link color="inherit" href="/banking">Banking Dashboard</Link>
          <Link color="inherit" href="/banking/ifrs9">IFRS 9</Link>
          <Typography color="text.primary">Amortization Module</Typography>
        </Breadcrumbs>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          spacing={2}
          useFlexGap
          sx={{ flexWrap: 'wrap' }}
        >
          <Box sx={{ minWidth: 0, flex: '1 1 560px' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Amortization Module
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Tech-spec aligned contract list with detail tabs for contract, fee/cost, amortization/event, and journal views.
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
            sx={{ alignSelf: { xs: 'stretch', md: 'center' }, flexShrink: 0 }}
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

      <Stack spacing={3} sx={{ minWidth: 0 }}>
        <Card sx={{ minWidth: 0, overflowX: 'hidden' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 }, minWidth: 0, overflowX: 'hidden' }}>
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', lg: 'center' }}
              useFlexGap
              sx={{ mb: 2, flexWrap: 'wrap' }}
            >
              <Box sx={{ minWidth: 0, flex: '1 1 420px' }}>
                <Typography variant="h6">Amortization Contract List</Typography>
                <Typography variant="body2" color="text.secondary">
                  Query source follows the workbook contract query from `FRS9_MASTER_ACCOUNT`.
                </Typography>
              </Box>
              <TextField
                size="small"
                type="date"
                label="Processing Date"
                value={prcDate}
                onChange={(event) => {
                  setPrcDate(event.target.value);
                  setCursor(undefined);
                  setCursorStack([]);
                }}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
                sx={{ width: { xs: '100%', sm: 220 }, minWidth: 0, flexShrink: 0 }}
              />
              <TextField
                size="small"
                label="Search contract"
                placeholder="Account / Facility / CIF / Name"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCursor(undefined);
                  setCursorStack([]);
                }}
                sx={{ width: { xs: '100%', lg: 360 }, minWidth: 0, flexShrink: 0 }}
              />
            </Stack>

            <AmortizationModuleTable
              rows={results}
              totalCount={results.length}
              page={0}
              rowsPerPage={rowsPerPage}
              loading={loading}
              selectedPkid={selectedPkid}
              onSelectRow={setSelectedPkid}
              detailSupported={detailSupported}
              hidePagination={true}
              onPageChange={() => {}}
              onRowsPerPageChange={(nextRowsPerPage) => {
                setRowsPerPage(nextRowsPerPage);
                setCursor(undefined);
                setCursorStack([]);
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                size="small"
                variant="outlined"
                disabled={cursorStack.length === 0}
                onClick={() => {
                  const prev = cursorStack.slice(0, -1);
                  setCursor(prev[prev.length - 1] || undefined);
                  setCursorStack(prev);
                }}
              >
                Previous
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={!hasMore}
                onClick={() => {
                  if (nextCursor) {
                    setCursorStack(prev => [...prev, cursor || '']);
                    setCursor(nextCursor);
                  }
                }}
              >
                Next
              </Button>
            </Box>
          </CardContent>
        </Card>

        <AmortizationModuleDetailsPanel
          selectedRow={selectedRow}
          loading={detailLoading}
          error={detailError}
          detail={detailData}
          detailSupported={detailSupported}
          compatibilityMessage={compatibilityMessage}
        />
      </Stack>
    </Container>
  );
}
