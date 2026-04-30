'use client';

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  FileDownload as DownloadIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Calculate as CalculateIcon,
  MonetizationOn as MoneyIcon,
  History as HistoryIcon,
  Description as DescriptionIcon,
  Summarize as SummarizeIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import PageHeader from '@/components/banking/shared/PageHeader';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import { AssessmentWorkspaceEmbeddedProvider } from '@/components/banking/individual/assessment-v2/embedded-context';
import { AssessmentKPI } from '@/components/banking/individual/assessment-v2/AssessmentKPI';
import { AssessmentWatchlist } from '@/components/banking/individual/assessment-v2/AssessmentWatchlist';
import { AssessmentFilters } from '@/components/banking/individual/assessment-v2/AssessmentFilters';
import { FILTER_DEFAULTS } from '@/components/banking/individual/assessment-v2/constants';
import { individualImpairmentAPI, IndividualImpairmentWatchlistItem } from '@/services/api.individual-impairment';
import { INDIVIDUAL_IMPAIRMENT_V2_API_BASE } from '@/services/api/individual-impairment-v2-client';
import { DCFAnalysisTab } from '@/components/banking/individual/assessment-v2/DCFAnalysisTab';
import { ProvisionCalculationTab } from '@/components/banking/individual/assessment-v2/ProvisionCalculationTab';
import { AssessmentHistoryTab } from '@/components/banking/individual/assessment-v2/AssessmentHistoryTab';
import { AssessmentDocumentsTab } from '@/components/banking/individual/assessment-v2/AssessmentDocumentsTab';
import { AssessmentOverrideSection } from '@/components/banking/individual/assessment-v2/AssessmentOverrideSection';
import { IndividualReportsSection } from '@/components/banking/individual/assessment-v2/IndividualReportsSection';
import {
  useAssessmentAccountLookupQuery,
  useAssessmentSummaryQuery,
  useAssessmentWatchlistQuery,
} from '@/features/individual-impairment/hooks/useAssessmentDashboardQuery';
import {
  buildIndividualAssessmentUrl,
  INDIVIDUAL_ASSESSMENT_ROUTE,
  INDIVIDUAL_ASSESSMENT_V2_ROUTE,
} from '@/features/individual-impairment/routing';
import { useNotifications } from '@/providers/NotificationProvider';

interface SectionDef {
  key: string;
  label: string;
  section: string;
  helper: string;
  icon: React.ReactElement;
  render: () => React.ReactNode;
}

type QueryDebugMetadata = {
  endpoint?: string;
  selectedSource?: string;
  sourceTables?: string[];
  filtersApplied?: Record<string, unknown>;
  sqlPreview?: string;
  notes?: string[];
};

const SECTION_KEYS = [
  'watchlist',
  'individual-reports',
  'assessment-details',
  'dcf-analysis',
  'provision-calculation',
  'history',
  'documents',
] as const;

const ACCOUNT_OPTIONAL_SECTIONS = new Set<string>(['watchlist', 'individual-reports']);

export default function IndividualAssessmentWizardPage() {
  const [activeTab, setActiveTab] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchKey = searchParams.toString();
  const accountId = searchParams.get('accountId');
  const accountNumber = searchParams.get('accountNumber');
  const tabParam = searchParams.get('tab');
  const mode = searchParams.get('mode') || 'conventional';
  const isV2Workspace = true;
  const workspaceVersion = 'V2';
  const workspaceApiBase = INDIVIDUAL_IMPAIRMENT_V2_API_BASE;
  const switchWorkspaceUrl = useMemo(() => {
    const params = new URLSearchParams(searchKey);
    if (!params.get('mode')) params.set('mode', mode);
    const route = isV2Workspace ? INDIVIDUAL_ASSESSMENT_ROUTE : INDIVIDUAL_ASSESSMENT_V2_ROUTE;
    return `${route}?${params.toString()}`;
  }, [isV2Workspace, mode, searchKey]);
  const skipTabUrlSyncRef = useRef(false);
  const watchlistUrlInitializedRef = useRef(false);
  const skipNextWatchlistUrlSyncRef = useRef(false);
  const { notifications, unreadCount } = useNotifications();
  const individualNotificationCount = useMemo(() => {
    return notifications.filter((notification) => {
      if (notification.readAt) return false;
      const haystack = [
        notification.title,
        notification.message,
        notification.actionUrl,
        String(notification.data?.module ?? ''),
        String(notification.data?.entityType ?? ''),
      ].join(' ').toLowerCase();
      return notification.category === 'approval'
        && (haystack.includes('individual') || haystack.includes('impairment') || haystack.includes('override'));
    }).length;
  }, [notifications]);
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
    return buildIndividualAssessmentUrl(params, pathname);
  }, [mode, pathname]);

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

    return buildIndividualAssessmentUrl(params, pathname);
  }, [filters.downloadDate, filters.impairedFlag, filters.priorityLevel, filters.search, filters.stage, mode, pagination.limit, pagination.page, pathname]);

  const [selectedAccount, setSelectedAccount] = useState<IndividualImpairmentWatchlistItem | null>(null);
  const [dcfLoading, setDcfLoading] = useState(false);
  const [dcfCalculation, setDcfCalculation] = useState<any>(null);
  const watchlistEnabled = !accountId || activeTab === 0;
  const watchlistQuery = useAssessmentWatchlistQuery({
    page: pagination.page + 1,
    limit: pagination.limit,
    search: filters.search,
    stage: filters.stage,
    impairedFlag: filters.impairedFlag,
    priorityLevel: filters.priorityLevel,
    downloadDate: filters.downloadDate,
    mode,
  }, watchlistEnabled);
  const summaryQuery = useAssessmentSummaryQuery(filters.downloadDate || undefined, mode, watchlistEnabled);
  const accountLookupQuery = useAssessmentAccountLookupQuery(
    accountId,
    accountNumber,
    mode,
    Boolean(accountId && accountNumber),
  );

  const watchlist = useMemo(
    () => watchlistQuery.data?.rows ?? [],
    [watchlistQuery.data],
  );
  const watchlistDebug = watchlistQuery.data?.debug as QueryDebugMetadata | undefined;
  const summary = useMemo(
    () => summaryQuery.data ?? undefined,
    [summaryQuery.data],
  );
  const loading = watchlistQuery.isLoading || watchlistQuery.isFetching || summaryQuery.isLoading || summaryQuery.isFetching;
  const dashboardError =
    (watchlistQuery.error instanceof Error ? watchlistQuery.error.message : null)
    || (summaryQuery.error instanceof Error ? summaryQuery.error.message : null);

  useEffect(() => {
    if (typeof watchlistQuery.data?.total === 'number') {
      setPagination((prev) => ({ ...prev, total: watchlistQuery.data?.total ?? 0 }));
    }
  }, [watchlistQuery.data?.total]);

  useEffect(() => {
    if (watchlistUrlInitializedRef.current) return;
    if (accountId) return;

    const params = new URLSearchParams(searchKey);
    const initialTab = params.get('tab');
    if (initialTab && initialTab !== 'watchlist') return;

    const nextFilters = { ...FILTER_DEFAULTS };

    const qSearch = params.get('search');
    const qDownloadDate = params.get('downloadDate');
    const qStage = params.get('stage');
    const qImpairedFlag = params.get('impairedFlag');
    const qPriorityLevel = params.get('priorityLevel');
    const qPage = params.get('page');
    const qLimit = params.get('limit');

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
  }, [accountId, searchKey]);

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
      if (!ACCOUNT_OPTIONAL_SECTIONS.has(SECTION_KEYS[activeTab] ?? '')) {
        skipTabUrlSyncRef.current = true;
        setActiveTab(0);
      }
      return;
    }

    const id = Number(accountId);
    if (Number.isFinite(id)) {
      const match = watchlist.find((w) => w.account_id === id);
      if (match) setSelectedAccount(match);
    }
  }, [accountId, activeTab, watchlist]);

  useEffect(() => {
    if (!accountId) return;
    if (selectedAccount && String(selectedAccount.account_id) === String(accountId)) return;
    if (accountLookupQuery.data) {
      setSelectedAccount(accountLookupQuery.data);
    }
  }, [accountId, accountLookupQuery.data, selectedAccount]);

  const handleRefreshDashboard = useCallback(async () => {
    await Promise.all([
      watchlistQuery.refetch(),
      summaryQuery.refetch(),
    ]);
  }, [summaryQuery, watchlistQuery]);

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
        await handleRefreshDashboard();
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

  const watchlistContent = (
    <>
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
            <Chip
              label="Source: FRS9_MASTER_ACCOUNT"
              variant="outlined"
              size="small"
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

          {watchlistDebug ? (
            <Accordion disableGutters sx={{ mb: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Watchlist Debug Query
                  </Typography>
                  <Chip label={watchlistDebug.selectedSource || 'FRS9_MASTER_ACCOUNT'} size="small" variant="outlined" />
                  <Chip label={watchlistDebug.endpoint || '/watchlist'} size="small" variant="outlined" />
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'grey.100',
                    overflow: 'auto',
                    fontSize: '0.75rem',
                    whiteSpace: 'pre-wrap',
                  }}
                >
{JSON.stringify({
  sourceTables: watchlistDebug.sourceTables,
  filtersApplied: watchlistDebug.filtersApplied,
  sqlPreview: watchlistDebug.sqlPreview,
  notes: watchlistDebug.notes,
}, null, 2)}
                </Box>
              </AccordionDetails>
            </Accordion>
          ) : null}

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
    </>
  );

  const sections = useMemo<SectionDef[]>(
    () => [
      {
        key: 'watchlist',
        label: 'Watchlist',
        section: '16',
        icon: <AssignmentIcon />,
        helper: 'Melihat daftar debitur yang memerlukan penilaian individu, termasuk filter dan pencarian.',
        render: () => watchlistContent
      },
      {
        key: 'individual-reports',
        label: 'Individual Reports',
        section: '17',
        icon: <SummarizeIcon />,
        helper: 'Melihat hasil individual impairment yang sudah masuk ke FRS9_IMP_IA_HEADER, termasuk Review, History, dan DCF.',
        render: () => <IndividualReportsSection />
      },
      {
        key: 'assessment-details',
        label: 'Assessment Details',
        section: '18',
        icon: <AssessmentIcon />,
        helper: 'Melihat status detail dan melakukan override penilaian manual jika diperlukan.',
        render: () => <AssessmentOverrideSection />
      },
      {
        key: 'dcf-analysis',
        label: 'DCF Analysis',
        section: '20',
        icon: <CalculateIcon />,
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
        icon: <MoneyIcon />,
        helper: 'Menghitung CKPN/Provision berdasarkan hasil DCF dan Outstanding Balance.',
        render: () => (
          <ProvisionCalculationTab
            account={selectedAccount}
            assessment={null}
            calculation={dcfCalculation}
            loading={dcfLoading}
          />
        )
      },
      {
        key: 'history',
        label: 'History',
        section: '22',
        icon: <HistoryIcon />,
        helper: 'Melihat audit trail dan riwayat perubahan assessment untuk debitur terpilih.',
        render: () => <AssessmentHistoryTab account={selectedAccount} />
      },
      {
        key: 'documents',
        label: 'Documents',
        section: '23',
        icon: <DescriptionIcon />,
        helper: 'Mengelola dokumen pendukung assessment individual untuk debitur terpilih.',
        render: () => <AssessmentDocumentsTab account={selectedAccount} />
      }
    ],
    [dcfCalculation, dcfLoading, handleCalculateDcf, selectedAccount, watchlistContent]
  );

  useEffect(() => {
    if (accountId || !tabParam || !ACCOUNT_OPTIONAL_SECTIONS.has(tabParam)) return;

    const tabIndex = SECTION_KEYS.indexOf(tabParam as typeof SECTION_KEYS[number]);
    if (tabIndex !== -1) {
      setActiveTab((current) => current === tabIndex ? current : tabIndex);
    }
  }, [accountId, tabParam]);

  useEffect(() => {
    if (!accountId) return;

    if (tabParam) {
      const tabIndex = SECTION_KEYS.indexOf(tabParam as typeof SECTION_KEYS[number]);
      if (tabIndex !== -1) {
        skipTabUrlSyncRef.current = true;
        setActiveTab((current) => current === tabIndex ? current : tabIndex);
        return;
      }
    }

    const assessmentDetailsIndex = SECTION_KEYS.indexOf('assessment-details');

    // Default to Assessment Details when an account is opened from the watchlist.
    skipTabUrlSyncRef.current = true;
    setActiveTab((current) => current === assessmentDetailsIndex ? current : assessmentDetailsIndex);
  }, [accountId, tabParam]);

  useEffect(() => {
    if (!accountId) return;
    if (skipTabUrlSyncRef.current) {
      skipTabUrlSyncRef.current = false;
      return;
    }

    const key = SECTION_KEYS[activeTab];
    if (!key) return;

    if (tabParam === key) return;

    router.replace(buildAssessmentUrl({ accountId, tab: key, accountNumber: accountNumber || undefined }));
  }, [accountId, accountNumber, activeTab, buildAssessmentUrl, router, tabParam]);

  const activeSection = sections[activeTab] ?? sections[0];

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <FullstackIndicator />
      <PageHeader
        title={`Assessment Workspace ${workspaceVersion}`}
        subtitle={`Individual Impairment workflow (SOP) - ${mode.toUpperCase()} Mode`}
        onRefresh={activeSection.key === 'watchlist' ? handleRefreshDashboard : undefined}
        loading={activeSection.key === 'watchlist' ? loading : false}
        extraActions={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Tooltip title={`Active API: ${workspaceApiBase}`}>
              <Chip
                label={`${workspaceVersion} API`}
                color={isV2Workspace ? 'success' : 'default'}
                variant={isV2Workspace ? 'filled' : 'outlined'}
                size="small"
              />
            </Tooltip>
            {individualNotificationCount > 0 ? (
              <Tooltip title={`${individualNotificationCount} unread individual impairment approval notification(s)`}>
                <Chip
                  label={`${individualNotificationCount} IA notif`}
                  color="warning"
                  size="small"
                />
              </Tooltip>
            ) : unreadCount > 0 ? (
              <Tooltip title={`${unreadCount} unread notification(s) across modules`}>
                <Chip
                  label={`${unreadCount} notif`}
                  color="info"
                  size="small"
                  variant="outlined"
                />
              </Tooltip>
            ) : null}
            <Button
              variant="outlined"
              size="small"
              onClick={() => router.push(switchWorkspaceUrl)}
            >
              {isV2Workspace ? 'Open V1' : 'Open V2'}
            </Button>
            {accountId && activeSection.key !== 'watchlist' ? (
              <Button
                variant="outlined"
                onClick={() => router.push(buildAssessmentUrl({}))}
              >
                Back to Watchlist
              </Button>
            ) : null}
            <Tooltip title="Copy current workspace link">
              <span>
                <Button
                  variant="outlined"
                  startIcon={<CopyIcon />}
                  onClick={() => copyToClipboard(window.location.href, 'Workspace link copied')}
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
                >
                  Open
                </Button>
              </span>
            </Tooltip>
          </Box>
        }
      />

      <Alert severity={isV2Workspace ? 'success' : 'info'} sx={{ mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Typography variant="body2">
            {isV2Workspace
              ? 'V2 workspace aktif. Flow ini terisolasi dari API legacy dan memakai endpoint V2 untuk fitur assessment baru.'
              : 'V1 legacy workspace aktif. Flow ini tetap memakai API legacy supaya perubahan Imran/legacy bisa hidup berdampingan.'}
          </Typography>
          <Chip label={workspaceApiBase} size="small" variant="outlined" />
        </Stack>
      </Alert>

      {accountId && !selectedAccount && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Memuat detail debitur terpilih. Jika data tidak muncul, kembali ke Watchlist lalu buka ulang dari ikon Mata (View Details).
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
              label={section.label}
              icon={section.icon}
              iconPosition="start"
              disabled={
                (!accountId && !ACCOUNT_OPTIONAL_SECTIONS.has(section.key))
              }
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
