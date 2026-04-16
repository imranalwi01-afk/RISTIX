'use client';

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Alert,
  Box,
  Chip,
  Container,
  Divider,
  Tab,
  Tabs,
  Typography,
  Card,
  CardContent,
  Button,
  Snackbar,
  Tooltip,
  Stack
} from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  ContentCopy as CopyIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';
import PageHeader from '@/components/banking/shared/PageHeader';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import { AssessmentWorkspaceEmbeddedProvider } from './embedded-context';
import { AssessmentKPI } from '@/components/banking/individual/assessment/AssessmentKPI';
import { AssessmentWatchlist } from '@/components/banking/individual/assessment/AssessmentWatchlist';
import { AssessmentFilters } from '@/components/banking/individual/assessment/AssessmentFilters';
import { FILTER_DEFAULTS } from './constants';
import { individualImpairmentAPI, IndividualImpairmentWatchlistItem } from '@/services/api.individual-impairment';
import { DCFAnalysisTab } from '@/components/banking/individual/assessment/DCFAnalysisTab';
import { ProvisionCalculationTab } from '@/components/banking/individual/assessment/ProvisionCalculationTab';

const OverrideTriggerSection = dynamic(() => import('../override-trigger/page'));

interface SectionDef {
  key: string;
  label: string;
  section: string;
  helper: string;
  render: () => React.ReactNode;
}

export default function IndividualAssessmentWizardPage() {
  const [activeTab, setActiveTab] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();
  const accountId = searchParams.get('accountId');
  const accountNumber = searchParams.get('accountNumber');
  const mode = searchParams.get('mode') || 'conventional';
  const skipTabUrlSyncRef = useRef(false);
  const watchlistUrlInitializedRef = useRef(false);
  const skipNextWatchlistUrlSyncRef = useRef(false);
  const [headerSnackbar, setHeaderSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const buildAssessmentUrl = useCallback((next: { accountId?: number | string; tab?: string; accountNumber?: string }) => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (next.accountId !== undefined && next.accountId !== null && String(next.accountId).trim()) {
      params.set('accountId', String(next.accountId));
    }
    if (next.accountNumber && next.accountNumber.trim()) {
      params.set('accountNumber', next.accountNumber);
    }
    if (next.tab) params.set('tab', next.tab);
    return `/banking/individual/assessment?${params.toString()}`;
  }, [mode]);

  const copyToClipboard = useCallback(async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setHeaderSnackbar({ open: true, message, severity: 'success' });
    } catch (error) {
      try {
        const el = document.createElement('textarea');
        el.value = text;
        el.setAttribute('readonly', 'true');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setHeaderSnackbar({ open: true, message, severity: 'success' });
      } catch (secondaryError) {
        setHeaderSnackbar({ open: true, message: 'Failed to copy', severity: 'error' });
      }
    }
  }, []);

  const downloadJson = useCallback((fileName: string, data: unknown) => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setHeaderSnackbar({ open: true, message: 'JSON downloaded', severity: 'success' });
    } catch (error) {
      setHeaderSnackbar({ open: true, message: 'Failed to download JSON', severity: 'error' });
    }
  }, []);

  // Dashboard State
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState<IndividualImpairmentWatchlistItem[]>([]);
  const [summary, setSummary] = useState<{
    totalAccounts: number;
    impairedAccounts: number;
    pendingAssessments: number;
    totalProvisions: number;
    dataDate?: string;
  } | undefined>(undefined);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0
  });
  const [filters, setFilters] = useState(FILTER_DEFAULTS);

  const buildWatchlistUrl = useCallback((next?: {
    search?: string
    stage?: string
    impairedFlag?: string
    priorityLevel?: string
    downloadDate?: string
    page?: number
    limit?: number
  }) => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    params.set('tab', 'watchlist');

    const search = (next?.search ?? filters.search) || '';
    const stage = (next?.stage ?? filters.stage) || '';
    const impairedFlag = (next?.impairedFlag ?? filters.impairedFlag) || '';
    const priorityLevel = (next?.priorityLevel ?? filters.priorityLevel) || '';
    const downloadDate = (next?.downloadDate ?? filters.downloadDate) || '';

    const page = Number.isFinite(Number(next?.page)) ? Number(next?.page) : pagination.page;
    const limit = Number.isFinite(Number(next?.limit)) ? Number(next?.limit) : pagination.limit;

    if (search) params.set('search', search);
    if (downloadDate) params.set('downloadDate', downloadDate);
    if (stage) params.set('stage', stage);
    if (impairedFlag) params.set('impairedFlag', impairedFlag);
    if (priorityLevel) params.set('priorityLevel', priorityLevel);
    if (page > 0) params.set('page', String(page + 1));
    if (limit !== 10) params.set('limit', String(limit));

    return `/banking/individual/assessment?${params.toString()}`;
  }, [filters.downloadDate, filters.impairedFlag, filters.priorityLevel, filters.search, filters.stage, mode, pagination.limit, pagination.page]);

  const [selectedAccount, setSelectedAccount] = useState<IndividualImpairmentWatchlistItem | null>(null);
  const [dcfLoading, setDcfLoading] = useState(false);
  const [dcfCalculation, setDcfCalculation] = useState<any>(null);

  // Fetch Dashboard Data
  const fetchDashboardData = useCallback(async () => {
    if (accountId && activeTab !== 0) return;

    setLoading(true);
    setDashboardError(null);
    try {
      const stageValue = Number.parseInt(filters.stage, 10);
      const stage = Number.isFinite(stageValue) ? stageValue : undefined;

      const impairedFlag =
        filters.impairedFlag === 'I' || filters.impairedFlag === 'N'
          ? filters.impairedFlag
          : undefined;

      const [watchlistRes, summaryRes] = await Promise.all([
        individualImpairmentAPI.watchlist.getAll({
          page: pagination.page + 1,
          limit: pagination.limit,
          search: filters.search,
          filter: {
            stage,
            impaired_flag: impairedFlag,
            priority_level: filters.priorityLevel,
            date_range: filters.downloadDate ? { start: filters.downloadDate, end: filters.downloadDate } : undefined,
            mode: mode
          }
        }),
        individualImpairmentAPI.watchlist.getSummary(filters.downloadDate, mode)
      ]);

      if (watchlistRes.success) {
        setWatchlist(watchlistRes.data);
        setPagination(prev => ({ ...prev, total: watchlistRes.meta?.total || 0 }));
      }

      if (summaryRes.success) {
        const s: any = summaryRes.data ?? undefined;
        setSummary(s ? {
          totalAccounts: Number(s.totalAccounts ?? s.total_accounts ?? 0),
          impairedAccounts: Number(s.impairedAccounts ?? s.impaired_accounts ?? 0),
          pendingAssessments: Number(s.pendingAssessments ?? s.pending_assessments ?? 0),
          totalProvisions: Number(s.totalProvisions ?? s.total_provisions ?? 0),
          dataDate: s.dataDate ?? s.data_date ?? undefined,
        } : undefined);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      const message =
        (error as any)?.response?.data?.message ||
        (error instanceof Error ? error.message : null) ||
        'Failed to fetch dashboard data';
      setDashboardError(String(message));
    } finally {
      setLoading(false);
    }
  }, [accountId, activeTab, filters, mode, pagination.limit, pagination.page]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (watchlistUrlInitializedRef.current) return;
    if (accountId) return;

    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== 'watchlist') return;

    const nextFilters = { ...FILTER_DEFAULTS };

    const qSearch = searchParams.get('search');
    const qDownloadDate = searchParams.get('downloadDate');
    const qStage = searchParams.get('stage');
    const qImpairedFlag = searchParams.get('impairedFlag');
    const qPriorityLevel = searchParams.get('priorityLevel');
    const qPage = searchParams.get('page');
    const qLimit = searchParams.get('limit');

    if (qSearch) nextFilters.search = qSearch;
    if (qDownloadDate) nextFilters.downloadDate = qDownloadDate;
    if (qStage) nextFilters.stage = qStage;
    if (qImpairedFlag) nextFilters.impairedFlag = qImpairedFlag;
    if (qPriorityLevel) nextFilters.priorityLevel = qPriorityLevel;

    setFilters(nextFilters);
    setPagination((prev) => ({
      ...prev,
      page: qPage ? Math.max(0, Number(qPage) - 1) : prev.page,
      limit: qLimit ? Math.max(1, Number(qLimit)) : prev.limit,
    }));

    watchlistUrlInitializedRef.current = true;
  }, [accountId, searchParams]);

  useEffect(() => {
    if (accountId) return;
    if (!watchlistUrlInitializedRef.current) return;
    if (skipNextWatchlistUrlSyncRef.current) {
      skipNextWatchlistUrlSyncRef.current = false;
      return;
    }

    const url = buildWatchlistUrl();
    router.replace(url);
  }, [accountId, buildWatchlistUrl, filters.downloadDate, filters.impairedFlag, filters.priorityLevel, filters.search, filters.stage, pagination.limit, pagination.page, router]);

  useEffect(() => {
    if (!accountId) {
      setSelectedAccount(null);
      setDcfCalculation(null);
      return;
    }

    const id = Number(accountId);
    if (Number.isFinite(id)) {
      const match = watchlist.find((w) => w.account_id === id);
      if (match) setSelectedAccount(match);
    }
  }, [accountId, watchlist]);

  useEffect(() => {
    const fetchSelectedAccount = async () => {
      if (!accountId) return;
      if (selectedAccount && String(selectedAccount.account_id) === String(accountId)) return;
      if (!accountNumber) return;

      const res = await individualImpairmentAPI.watchlist.getAll({
        page: 1,
        limit: 1,
        search: accountNumber,
        filter: { mode }
      });

      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const found = res.data.find((w) => String(w.account_id) === String(accountId)) ?? res.data[0];
        setSelectedAccount(found);
      }
    };

    fetchSelectedAccount();
  }, [accountId, accountNumber, mode, selectedAccount]);

  // Handlers for Dashboard
  const handlePageChange = (event: unknown, newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination(prev => ({ ...prev, limit: parseInt(event.target.value, 10), page: 0 }));
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleResetFilters = () => {
    skipNextWatchlistUrlSyncRef.current = true;
    router.replace(buildWatchlistUrl({ ...FILTER_DEFAULTS, page: 0, limit: pagination.limit }));
    setFilters(FILTER_DEFAULTS);
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleAccountSelect = (account: IndividualImpairmentWatchlistItem) => {
    router.push(buildAssessmentUrl({ accountId: account.account_id, tab: 'assessment-details', accountNumber: account.account_number }));
  };

  const handleViewDetails = (account: IndividualImpairmentWatchlistItem) => {
    router.push(buildAssessmentUrl({ accountId: account.account_id, tab: 'assessment-details', accountNumber: account.account_number }));
  };
  const handleEditAssessment = (account: IndividualImpairmentWatchlistItem) => {
    router.push(buildAssessmentUrl({ accountId: account.account_id, tab: 'assessment-details', accountNumber: account.account_number }));
  };

  const handleResetAssessment = async (account: IndividualImpairmentWatchlistItem) => {
    try {
      const response = await (individualImpairmentAPI as any).removeFromWatchlist(String(account.account_id));
      if (response?.success) {
        await fetchDashboardData();
        if (String(accountId) === String(account.account_id)) {
          router.replace(buildAssessmentUrl({}));
        }
        return { success: true, message: 'Reset successful' };
      }
      return { success: false, message: response?.message || 'Reset failed' };
    } catch (error) {
      return { success: false, message: 'Reset failed' };
    }
  };

  const handleCalculateDcf = async (payload: any) => {
    const resolvedAccountId = Number(payload?.accountId ?? accountId);
    if (!Number.isFinite(resolvedAccountId)) return;

    try {
      setDcfLoading(true);
      const response = await individualImpairmentAPI.dcf.calculate(resolvedAccountId, {
        accountId: resolvedAccountId,
        assumptions: payload
      });
      if (response?.success) {
        setDcfCalculation(response.data);
      }
    } finally {
      setDcfLoading(false);
    }
  };

  const watchlistView = (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <FullstackIndicator />
      <PageHeader
        title="Assessment Workspace"
        subtitle={`Individual Impairment workflow (SOP) - ${mode.toUpperCase()} Mode`}
        onRefresh={fetchDashboardData}
        loading={loading}
        extraActions={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Tooltip title="Copy watchlist link (includes current filters)">
              <Button
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={() => copyToClipboard(window.location.href, 'Watchlist link copied')}
              >
                Copy Link
              </Button>
            </Tooltip>
            <Tooltip title="Open watchlist in new tab">
              <Button
                variant="outlined"
                startIcon={<OpenInNewIcon />}
                onClick={() => window.open(window.location.href, '_blank', 'noopener,noreferrer')}
              >
                Open
              </Button>
            </Tooltip>
          </Box>
        }
      />
      {dashboardError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {dashboardError}
        </Alert>
      ) : null}
      <AssessmentKPI
        watchlist={watchlist}
        loading={loading}
        summary={summary}
      />

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <AssessmentFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            mode={mode}
          />

          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={`Showing ${watchlist.length} of ${pagination.total}`}
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600 }}
            />
            {filters.search ? (
              <Chip
                label={`Search: ${filters.search}`}
                size="small"
                onDelete={() => handleFilterChange('search', '')}
              />
            ) : null}
            {filters.downloadDate ? (
              <Chip
                label={`Date: ${filters.downloadDate}`}
                size="small"
                onDelete={() => handleFilterChange('downloadDate', '')}
              />
            ) : null}
            {filters.stage ? (
              <Chip
                label={`Stage: ${filters.stage}`}
                size="small"
                onDelete={() => handleFilterChange('stage', '')}
              />
            ) : null}
            {filters.impairedFlag ? (
              <Chip
                label={`Impaired: ${filters.impairedFlag}`}
                size="small"
                onDelete={() => handleFilterChange('impairedFlag', '')}
              />
            ) : null}
            {filters.priorityLevel ? (
              <Chip
                label={`Priority: ${filters.priorityLevel}`}
                size="small"
                onDelete={() => handleFilterChange('priorityLevel', '')}
              />
            ) : null}
          </Stack>

          <AssessmentWatchlist
            watchlist={watchlist}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onAccountSelect={handleAccountSelect}
            onEditAssessment={handleEditAssessment}
            onViewDetails={handleViewDetails}
            onResetAssessment={handleResetAssessment}
            selectedAccountId={accountId}
            mode={mode}
          />
        </CardContent>
      </Card>
    </Container>
  );

  const sections = useMemo<SectionDef[]>(
    () => [
      {
        key: 'watchlist',
        label: 'Watchlist',
        section: '16',
        helper: 'Melihat daftar debitur yang memerlukan penilaian individu, termasuk filter dan pencarian.',
        render: () => watchlistView
      },
      {
        key: 'assessment-details',
        label: 'Assessment Details',
        section: '18',
        helper: 'Melihat status detail dan melakukan override penilaian manual jika diperlukan.',
        render: () => <OverrideTriggerSection />
      },
      {
        key: 'dcf-analysis',
        label: 'DCF Analysis',
        section: '20',
        helper: 'Melakukan perhitungan Discounted Cash Flow dan menghitung Present Value.',
        render: () => (
          <DCFAnalysisTab
            account={selectedAccount}
            assessment={null}
            onCalculate={handleCalculateDcf}
            calculationResults={dcfCalculation}
            loading={dcfLoading}
          />
        )
      },
      {
        key: 'provision-calculation',
        label: 'Provision Calculation',
        section: '21',
        helper: 'Menghitung CKPN/Provision berdasarkan hasil DCF dan Outstanding Balance.',
        render: () => (
          <ProvisionCalculationTab
            account={selectedAccount}
            assessment={null}
            calculation={dcfCalculation}
            loading={dcfLoading}
          />
        )
      }
    ],
    [dcfCalculation, dcfLoading, handleCalculateDcf, selectedAccount, watchlistView]
  );

  useEffect(() => {
    if (accountId) {
      const tabParam = searchParams.get('tab');
      if (tabParam) {
        const tabIndex = sections.findIndex(s => s.key === tabParam);
        if (tabIndex !== -1) {
          skipTabUrlSyncRef.current = true;
          setActiveTab(tabIndex);
          return;
        }
      }
      // Default to Assessment Details (index 1) if no tab specified
      skipTabUrlSyncRef.current = true;
      setActiveTab(1);
    }
  }, [accountId, searchParams, sections]);

  useEffect(() => {
    if (!accountId) return;
    if (skipTabUrlSyncRef.current) {
      skipTabUrlSyncRef.current = false;
      return;
    }

    const key = sections[activeTab]?.key;
    if (!key) return;

    const current = searchParams.get('tab');
    if (current === key) return;

    router.replace(buildAssessmentUrl({ accountId, tab: key, accountNumber: accountNumber || undefined }));
  }, [accountId, accountNumber, activeTab, buildAssessmentUrl, router, searchParams, sections]);

  if (!accountId) {
    return watchlistView;
  }

  const activeSection = sections[activeTab] ?? sections[0];

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <FullstackIndicator />
      <PageHeader
        title="Assessment Workspace"
        subtitle={`Individual Impairment workflow (SOP) - ${mode.toUpperCase()} Mode`}
        extraActions={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={() => router.push(buildAssessmentUrl({}))}
            >
              Back to Watchlist
            </Button>
            <Tooltip title="Copy current workspace link">
              <span>
                <Button
                  variant="outlined"
                  startIcon={<CopyIcon />}
                  onClick={() => copyToClipboard(window.location.href, 'Workspace link copied')}
                  disabled={!accountId}
                >
                  Copy Link
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="Open current tab in new tab">
              <span>
                <Button
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                  onClick={() => window.open(window.location.href, '_blank', 'noopener,noreferrer')}
                  disabled={!accountId}
                >
                  Open
                </Button>
              </span>
            </Tooltip>
          </Box>
        }
      />

      {!selectedAccount && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Pilih debitur dari Watchlist menggunakan ikon Mata (View Details) untuk membuka tab Assessment, DCF, dan Provision.
        </Alert>
      )}
      {selectedAccount && (
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Selected Account
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {selectedAccount.account_number}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedAccount.cif_name} • {selectedAccount.cif_number}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip label={`Stage ${selectedAccount.stage}`} color={selectedAccount.stage === 1 ? 'success' : selectedAccount.stage === 2 ? 'warning' : 'error'} />
              <Chip label={selectedAccount.impaired_flag === 'I' ? 'Impaired' : 'Not Impaired'} color={selectedAccount.impaired_flag === 'I' ? 'error' : 'default'} variant={selectedAccount.impaired_flag === 'I' ? 'filled' : 'outlined'} />
              <Chip label={selectedAccount.assessment_status} variant="outlined" />
              <Tooltip title="Copy account summary">
                <span>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CopyIcon />}
                    onClick={() => {
                      const summaryText = [
                        `Account: ${selectedAccount.account_number} (${selectedAccount.account_id})`,
                        `CIF: ${selectedAccount.cif_name} (${selectedAccount.cif_number})`,
                        `Stage: ${selectedAccount.stage}`,
                        `Impaired: ${selectedAccount.impaired_flag}`,
                        `Status: ${selectedAccount.assessment_status}`,
                      ].join('\n')
                      void copyToClipboard(summaryText, 'Account summary copied')
                    }}
                  >
                    Copy Summary
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Download selected account JSON">
                <span>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      const safe = String(selectedAccount.account_number || selectedAccount.account_id || 'account').replace(/[^\w.-]+/g, '_')
                      downloadJson(`selected_account_${safe}.json`, selectedAccount)
                    }}
                  >
                    Download JSON
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>
      )}

      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
        <Tabs
          value={activeTab}
          onChange={(_, next) => setActiveTab(next)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, pt: 1 }}
        >
          {sections.map((section) => (
            <Tab
              key={section.key}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{section.label}</span>
                  <Chip label={`S${section.section}`} size="small" variant="outlined" />
                </Box>
              }
              disabled={
                (!accountId && section.key !== 'watchlist')
              }
              sx={{ alignItems: 'flex-start' }}
            />
          ))}
        </Tabs>

        <Divider />

        <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            {activeSection.helper}
          </Typography>
        </Box>

        <Box sx={{ p: 1 }}>
          <AssessmentWorkspaceEmbeddedProvider>
            {activeSection.render()}
          </AssessmentWorkspaceEmbeddedProvider>
        </Box>
      </Box>

      <Snackbar
        open={headerSnackbar.open}
        autoHideDuration={2000}
        onClose={() => setHeaderSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={headerSnackbar.severity}
          variant="filled"
          onClose={() => setHeaderSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {headerSnackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
