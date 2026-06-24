'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PageHeader from '@/components/banking/shared/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
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
  const error = resultsQuery.data && !resultsQuery.data.success ? (resultsQuery.data.message || 'Failed to load amortization results') : null;

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
    () => (detailQuery.data && !detailQuery.data.success ? (detailQuery.data.message || 'Failed to load amortization details') : null),
    [detailQuery.data],
  );

  const handleRefresh = useCallback(() => {
    void resultsQuery.refetch();
    if (selectedPkid) void detailQuery.refetch();
  }, [resultsQuery, detailQuery, selectedPkid]);

  return (
    <Container maxWidth="xl" sx={{ py: 3, minWidth: 0, overflowX: 'hidden' }}>
      <PageHeader
        title="Amortization Module"
        subtitle="Tech-spec aligned contract list with detail tabs for contract, fee/cost, amortization/event, and journal views."
        onRefresh={handleRefresh}
        loading={loading}
        extraActions={
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
            Effective PRC date: {effectivePrcDate || '-'}
          </Typography>
        }
      />

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
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ width: { xs: '100%', sm: 220 }, minWidth: 0, flexShrink: 0 }}
              />
              <SearchBar
                value={search}
                onChange={(value) => {
                  setSearch(value);
                  setCursor(undefined);
                  setCursorStack([]);
                }}
                placeholder="Account / Facility / CIF / Name"
                label="Search contract"
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
