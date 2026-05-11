// @ts-nocheck
'use client';

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import dayjs from 'dayjs';
import { useSearchParams, useRouter } from 'next/navigation';
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
  Stack,
  Grid,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Backdrop,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  TextField
} from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  ContentCopy as CopyIcon,
  FileDownload as DownloadIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Calculate as CalculateIcon,
  MonetizationOn as MonetizationOnIcon,
  History as HistoryIcon,
  Folder as FolderIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import PageHeader from '@/components/banking/shared/PageHeader';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import { AssessmentWorkspaceEmbeddedProvider } from './embedded-context';
import { AssessmentKPI } from '@/components/banking/individual/assessment/AssessmentKPI';
import { AssessmentWatchlist } from '@/components/banking/individual/assessment/AssessmentWatchlist';
import { AssessmentFilters } from '@/components/banking/individual/assessment/AssessmentFilters';
import { AssessmentDetailsTab } from '@/components/banking/individual/assessment/AssessmentDetailsTab';
import { FILTER_DEFAULTS } from './constants';
import { individualImpairmentAPI, IndividualImpairmentWatchlistItem } from '@/services/api.individual-impairment';
import { Send as SendIcon, CheckCircle as ApproveIcon, Cancel as RejectIcon } from '@mui/icons-material';
import { DCFAnalysisTab } from '@/components/banking/individual/assessment/DCFAnalysisTab';
import { ProvisionCalculationTab } from '@/components/banking/individual/assessment/ProvisionCalculationTab';
import { AssessmentHistoryTab } from '@/components/banking/individual/assessment/AssessmentHistoryTab';
import { AssessmentDocumentsTab } from '@/components/banking/individual/assessment/AssessmentDocumentsTab';
import { AssessmentReportsTab } from '@/components/banking/individual/assessment/AssessmentReportsTab';
import LoadingButton from '@mui/lab/LoadingButton';
import { approvalAPI } from '@/services/api/approval.api';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifications } from '@/providers/NotificationProvider';
import { keyframes, useTheme, alpha } from '@mui/material/styles';

interface SectionDef {
  key: string;
  label: string;
  section: string;
  helper: string;
  icon: React.ElementType;
  render: () => React.ReactNode;
}

const livePulse = keyframes`
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
`;

export default function IndividualAssessmentWizardPage() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const accountId = searchParams.get('accountId');
  const accountNumber = searchParams.get('accountNumber');
  const mode = searchParams.get('mode') || 'conventional';
  const watchlistUrlInitializedRef = useRef(false);
  const skipNextWatchlistUrlSyncRef = useRef(false);
  const { user } = useAuth();
  const { unreadCount, notifications, acknowledgeNotification } = useNotifications();

  // Checker specific state
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [checkerComments, setCheckerComments] = useState('');
  const [submittingApproval, setSubmittingApproval] = useState(false);

  const isChecker = useMemo(() => {
    if (!user) return false;
    const roles = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);
    const roleCodes = Array.isArray(user.roleCodes) ? user.roleCodes : [];
    const allRoles = [...roles, ...roleCodes].map(r => String(r).toUpperCase());
    return allRoles.includes('CHECKER') || allRoles.includes('APPROVER') || allRoles.includes('SUPER_ADMIN');
  }, [user]);

  const canApprove = useMemo(() => {
    // Status 0 is PENDING
    return isChecker && assessmentData?.status === 0;
  }, [isChecker, assessmentData]);
  useEffect(() => {
    if (accountId && notifications.length > 0) {
      const relevantNotifs = notifications.filter(n =>
        (n.type === 'APPROVAL_PENDING' || n.type === 'APPROVAL_COMPLETED') &&
        !n.readAt
      );

      if (relevantNotifs.length > 0) {
        relevantNotifs.forEach(n => {
          acknowledgeNotification(n.id);
        });
      }
    }
  }, [accountId, notifications, acknowledgeNotification]);

  // Check if there are live pending approvals for this module
  const hasLiveNotifications = React.useMemo(() => {
    return notifications.some(n =>
        n.type === 'APPROVAL_PENDING' &&
        !n.readAt
    );
  }, [notifications]);

  // Staged Data for Consolidated Approval
  const [stagedOverride, setStagedOverride] = useState<any>(null);
  const [stagedDCF, setStagedDCF] = useState<any>(null);
  const [submittingPackage, setSubmittingPackage] = useState(false);
  const autoSubmitInProgress = useRef(false);
  const calculationInProgress = useRef(false);
  const [headerSnackbar, setHeaderSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [submitSuccessModal, setSubmitSuccessModal] = useState(false);

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
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);



  const buildAssessmentUrl = useCallback((next: {
    accountId?: number | string;
    tab?: string;
    accountNumber?: string;
    extra?: Record<string, string>;
  }) => {
    const params = new URLSearchParams();
    params.set('mode', mode);

    if (next.accountId !== undefined && next.accountId !== null && String(next.accountId).trim()) {
      params.set('accountId', String(next.accountId));
    }
    if (next.accountNumber && next.accountNumber.trim()) {
      params.set('accountNumber', next.accountNumber);
    }
    if (next.tab) params.set('tab', next.tab);

    // Preserve current watchlist state for "Back" navigation
    if (filters.search) params.set('search', filters.search);
    if (filters.downloadDate) params.set('downloadDate', filters.downloadDate);
    if (filters.stage) params.set('stage', filters.stage);
    if (filters.impairedFlag) params.set('impairedFlag', filters.impairedFlag);
    if (filters.priorityLevel) params.set('priorityLevel', filters.priorityLevel);
    if (pagination.page > 0) params.set('page', String(pagination.page + 1));
    if (pagination.limit !== 10) params.set('limit', String(pagination.limit));

    if (next.extra) {
      Object.entries(next.extra).forEach(([k, v]) => params.set(k, v));
    }
    return `/banking/individual/assessment?${params.toString()}`;
  }, [mode, filters, pagination.page, pagination.limit]);

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



  const buildWatchlistUrl = useCallback((next?: {
    search?: string
    stage?: string
    impairedFlag?: string
    priorityLevel?: string
    downloadDate?: string
    page?: number
    limit?: number
    tab?: string
  }) => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    params.set('tab', next?.tab || 'watchlist');

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

  const handleTabChangeByKey = useCallback((key: string) => {
    const nextUrl = accountId
      ? buildAssessmentUrl({ accountId, tab: key, accountNumber: accountNumber || undefined })
      : buildWatchlistUrl({ tab: key });

    router.push(nextUrl);
  }, [accountId, accountNumber, buildAssessmentUrl, buildWatchlistUrl, router]);

  const [selectedAccount, setSelectedAccount] = useState<IndividualImpairmentWatchlistItem | null>(null);
  const [dcfLoading, setDcfLoading] = useState(false);
  const [dcfCalculation, setDcfCalculation] = useState<any>(null);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);

  // Derive active tab from URL instead of local state to prevent sync loops
  const activeTab = useMemo(() => {
    const tabParam = searchParams.get('tab');
    if (!tabParam) return accountId ? 2 : 0;

    // We'll define sections in a bit, but for now we just need the index
    const tabKeys = ['watchlist', 'individual-reports', 'assessment-details', 'dcf-analysis', 'provision-calculation', 'history', 'documents'];
    const index = tabKeys.indexOf(tabParam);
    return index !== -1 ? index : (accountId ? 2 : 0);
  }, [searchParams, accountId]);

  // Fetch Dashboard Data
  const fetchDashboardData = useCallback(async () => {
    // Only fetch watchlist dashboard data if we are on the watchlist tab (activeTab === 0)
    // and not viewing a specific account details.
    if (activeTab !== 0) return;

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
            assessment_status: filters.assessmentStatus || undefined,
            priority_level: filters.priorityLevel,
            dateFrom: filters.downloadDate || undefined,
            dateTo: filters.downloadDate || undefined,
            mode: mode
          }
        }),
        individualImpairmentAPI.watchlist.getSummary(filters.downloadDate, mode)
      ]);

      if (watchlistRes.success && Array.isArray(watchlistRes.data)) {
        setWatchlist(watchlistRes.data);
        setPagination(prev => ({
          ...prev,
          total: watchlistRes.pagination?.total || watchlistRes.data.length || 0
        }));
      } else {
        setWatchlist([]);
        setPagination(prev => ({ ...prev, total: 0 }));
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
  }, [activeTab, accountId, filters, mode, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // URL State Initialization
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
    const p = qPage ? parseInt(qPage, 10) : NaN;
    const l = qLimit ? parseInt(qLimit, 10) : NaN;

    setPagination((prev) => ({
      ...prev,
      page: !isNaN(p) ? Math.max(0, p - 1) : prev.page,
      limit: !isNaN(l) ? Math.max(1, l) : prev.limit,
    }));

    watchlistUrlInitializedRef.current = true;
  }, [accountId, searchParams]);

  // URL Sync Effect
  useEffect(() => {
    if (accountId) return;
    if (!watchlistUrlInitializedRef.current) return;
    if (skipNextWatchlistUrlSyncRef.current) {
      skipNextWatchlistUrlSyncRef.current = false;
      return;
    }

    const currentTab = searchParams.get('tab') || 'watchlist';
    const nextUrl = buildWatchlistUrl({ tab: currentTab });
    const currentSearch = typeof window !== 'undefined' ? window.location.search : '';
    const targetSearch = nextUrl.split('?')[1] ? `?${nextUrl.split('?')[1]}` : '';

    if (currentSearch !== targetSearch && targetSearch !== '') {
        router.replace(nextUrl);
    }
  }, [buildWatchlistUrl, router, searchParams, accountId]);

  // Account Selection Sync
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

  // External Account Fetching (Direct URL Access)
  useEffect(() => {
    const fetchSelectedAccount = async () => {
      if (!accountId) return;
      if (selectedAccount && String(selectedAccount.account_id) === String(accountId)) return;

      const idNum = Number(accountId);
      const match = watchlist.find(w => w.account_id === idNum);
      if (match) {
        setSelectedAccount(match);
        return;
      }

      try {
        setLoading(true);
        let res;
        if (accountNumber) {
          res = await individualImpairmentAPI.watchlist.getAll({
            page: 1, limit: 1, search: accountNumber, filter: { mode }
          });
        } else {
          res = await individualImpairmentAPI.watchlist.getById(idNum);
        }

        if (res?.success) {
          const found = Array.isArray(res.data)
            ? (res.data.find((w: any) => String(w.account_id) === String(accountId)) ?? res.data[0])
            : res.data;
          if (found) setSelectedAccount(found);
        } else if (res && !res.success && res.account_id) {
           setSelectedAccount(res);
        }
      } catch (err) {
        console.error('Failed to sync account for workspace:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedAccount();
  }, [accountId, accountNumber, mode, watchlist, selectedAccount]);

  // Fetch current assessment status for the page
  useEffect(() => {
    const fetchStatus = async () => {
      if (!accountId) {
        setAssessmentData(null);
        setHistoryData([]);
        return;
      }
      try {
        const res = await individualImpairmentAPI.assessment.get(Number(accountId));
        if (res.success) {
          setAssessmentData(res.data.header || res.data);
        }

        // Also fetch history
        const histRes = await individualImpairmentAPI.assessment.getHistory(Number(accountId));
        if (histRes.success) {
          setHistoryData(histRes.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch assessment status in page:', err);
      }
    };
    fetchStatus();
  }, [accountId, stagedOverride, stagedDCF, historyRefreshKey]); // Re-fetch when staging or refresh requested

  const fetchStatus = useCallback(async () => {
    if (!accountId) return;
    try {
      const response = await individualImpairmentAPI.assessment.get(Number(accountId));
      if (response?.success) {
        setAssessmentData(response.data);
      }
      
      const histRes = await individualImpairmentAPI.assessment.getHistory(Number(accountId));
      if (histRes.success) {
        setHistoryData(histRes.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch assessment status in page:', err);
    }
  }, [accountId]);

  const handleApprove = async () => {
    if (!accountId) return;
    try {
      setSubmittingApproval(true);
      const res = await individualImpairmentAPI.assessment.approve(Number(accountId), checkerComments);
      if (res.success) {
        setHeaderSnackbar({ open: true, message: 'Assessment Approved successfully', severity: 'success' });
        setHistoryRefreshKey(prev => prev + 1);
        fetchStatus();
        setApprovalDialogOpen(false);
      }
    } catch (err) {
      setHeaderSnackbar({ open: true, message: 'Failed to approve assessment', severity: 'error' });
    } finally {
      setSubmittingApproval(false);
    }
  };

  const handleReject = async () => {
    if (!accountId) return;
    if (!checkerComments.trim()) {
      setHeaderSnackbar({ open: true, message: 'Please provide a reason for rejection', severity: 'warning' });
      return;
    }
    try {
      setSubmittingApproval(true);
      const res = await individualImpairmentAPI.assessment.reject(Number(accountId), checkerComments);
      if (res.success) {
        setHeaderSnackbar({ open: true, message: 'Assessment Rejected', severity: 'info' });
        setHistoryRefreshKey(prev => prev + 1);
        fetchStatus();
        setRejectionDialogOpen(false);
      }
    } catch (err) {
      setHeaderSnackbar({ open: true, message: 'Failed to reject assessment', severity: 'error' });
    } finally {
      setSubmittingApproval(false);
    }
  };

  // Fetch existing DCF result when account is selected
  useEffect(() => {
    const fetchExistingDcf = async () => {
      if (!selectedAccount?.account_id) {
        setDcfCalculation(null);
        return;
      }

      // If we already have fresh calculation in state, don't overwrite with historical unless it's a new account
      if (dcfCalculation && !dcfCalculation.isHistorical) return;

      try {
        const response = await individualImpairmentAPI.getIaResultDetail({
            accountId: selectedAccount.account_id
        });
        if (response?.success && response.data?.header) {
          const header = response.data.header;
          const standardizedDetails = (response.data.details || []).map((d: any) => ({
            ...d,
            period: d.periode,
            cashflow: Number(d.pwAmt || 0),
            pv: Number(d.pvAmt || 0),
            principal: Number(d.principal || 0),
            interest: Number(d.interest || 0),
            installment: Number(d.installment || 0),
            collateral: Number(d.collateral || 0),
            beginningBalance: Number(d.beginningBalance || 0),
            interestAccrual: Number(d.eirAmt || 0),
            endingBalance: Number(d.endingBalance || 0),
            weightedFlow: Number(d.pwAmt || 0)
          }));

          const historicalCalc = {
            presentValue: Number(header.pvDcfAmt),
            lgd: Number(header.outstanding) - Number(header.pvDcfAmt),
            recommendedProvision: Number(header.eclIaAmt),
            outstanding: Number(header.outstanding),
            isHistorical: true,
            details: standardizedDetails,
            assumptions: {
              discountRate: Number(header.effInterestRate || header.interestRate),
              recoveryRate: 0,
            }
          };
          setDcfCalculation(historicalCalc);

          // Also stage it as historical DCF so it can be used for consolidated submission/revision
          setStagedDCF({
            accountId: selectedAccount.account_id,
            accountNumber: selectedAccount.account_number,
            fileName: 'Historical Report Data',
            totalRows: standardizedDetails.length,
            cashflows: standardizedDetails,
            scenarioType: 'historical',
            scenariosCount: 1,
            uploadedBy: 'system',
            uploadedAt: new Date().toISOString(),
            results: historicalCalc,
            isHistorical: true
          });
        } else {
          setDcfCalculation(null);
        }
      } catch (err) {
        console.error('Failed to fetch existing DCF:', err);
      }
    };

    fetchExistingDcf();
  }, [selectedAccount?.account_id]);

  // Handlers
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
      const response = await individualImpairmentAPI.assessment.reset(Number(account.account_id));
      if (response?.success) {
        // Clear local staged states if resetting current selection
        if (String(accountId) === String(account.account_id)) {
          setStagedOverride(null);
          setStagedDCF(null);
          setDcfCalculation(null);
          autoSubmitInProgress.current = false;
        }

        await fetchDashboardData();
        setHeaderSnackbar({ open: true, message: 'Assessment reset successfully. Pending data and files cleared.', severity: 'success' });
        return { success: true, message: 'Reset successful' };
      }
      return { success: false, message: response?.message || 'Reset failed' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Reset failed' };
    }
  };

  const handleCalculateDcf = async (payload: any) => {
    const resolvedAccountId = Number(payload?.accountId ?? accountId);
    if (!Number.isFinite(resolvedAccountId)) return;

    if (calculationInProgress.current) {
        console.warn('Calculation already in progress, skipping...');
        return;
    }

    try {
      calculationInProgress.current = true;
      setDcfLoading(true);
      const response = await individualImpairmentAPI.dcf.calculate(resolvedAccountId, {
        accountId: resolvedAccountId,
        ...payload
      });
      if (response?.success && response.data) {
        setDcfCalculation(response.data);

        // AUTO-STAGE: Capture this calculation as staged DCF for consolidated submission
        const autoStagedDCF = {
            ...(stagedDCF || {}),
            accountId: resolvedAccountId,
            accountNumber: payload.accountNumber || selectedAccount?.account_number,
            fileName: stagedDCF?.fileName || 'Manual Calculation',
            totalRows: response.data.details?.length || 1,
            cashflows: response.data.details || [],
            scenarioType: response.data.scenario || payload.scenarioType || 'manual',
            scenariosCount: 3,
            uploadedBy: user?.id ?? 'unknown',
            uploadedAt: new Date().toISOString(),
            // Store the full result for reference
            results: response.data
        };
        setStagedDCF(autoStagedDCF);

        // REMOVED: Automatic navigate to Provision. Allow user to upload DCF file first.
        setHeaderSnackbar({ open: true, message: 'Scenario calculated. Please upload the DCF file to complete the package.', severity: 'success' });
      } else {
        setHeaderSnackbar({ open: true, message: response?.message || 'Calculation failed. Please check your parameters.', severity: 'error' });
      }
    } finally {
      setDcfLoading(false);
      calculationInProgress.current = false;
    }
  };

  // REMOVED: AUTOMATIC SUBMISSION LOGIC
  // We now rely on manual submission from the Provision tab to allow for final review.

  const handleFinalPackageSubmit = async () => {
    if (!selectedAccount) return;
    if (!stagedOverride && !stagedDCF) {
        setHeaderSnackbar({ open: true, message: 'Please stage an override or DCF upload first.', severity: 'warning' });
        return;
    }

    if (submittingPackage || calculationInProgress.current) {
        setHeaderSnackbar({ open: true, message: 'Process in progress. Please wait...', severity: 'warning' });
        return;
    }
    setSubmittingPackage(true);

    try {
        const requestedBy = user?.id ?? user?.email ?? 'unknown';
        const titleParts = [];
        if (stagedOverride) titleParts.push('Override');
        if (stagedDCF) titleParts.push('DCF');

        // Capture data before clearing state
        const submissionData = {
            operation: 'update',
            accountId: selectedAccount.account_id,
            accountNumber: selectedAccount.account_number,
            cifNumber: selectedAccount.cif_number,
            cifName: selectedAccount.cif_name,
            ...stagedOverride,
            ...stagedDCF,
            isConsolidated: true,
            justification: stagedOverride?.justification || 'Consolidated Assessment Submission'
        };

        await approvalAPI.createRequest({
            tenantId: user?.tenantId || 'default',
            entityType: 'individual_assessment_consolidated',
            entityId: String(selectedAccount.account_id),
            title: `Assessment Package: ${selectedAccount.account_number} (${titleParts.join(' + ')})`,
            description: `Consolidated assessment for ${selectedAccount.cif_name}. Requested by ${requestedBy}.`,
            requestedBy,
            requestData: submissionData
        });

        setHeaderSnackbar({ open: true, message: 'Assessment package submitted for approval successfully!', severity: 'success' });

        // CLEAR STATE
        setStagedOverride(null);
        setStagedDCF(null);
        autoSubmitInProgress.current = false;

        // Refresh data
        await fetchDashboardData();
        setHistoryRefreshKey(prev => prev + 1);

        // UX: Show success modal → then redirect to history tab
        setSubmitSuccessModal(true);
        handleTabChangeByKey('history');
  } catch (error: any) {
    setHeaderSnackbar({ open: true, message: error.message || 'Failed to submit assessment package', severity: 'error' });
  } finally {
    setSubmittingPackage(false);
  }
};



  const sections = useMemo<SectionDef[]>(
    () => [
      {
        key: 'watchlist',
        label: 'Watchlist',
        section: '16',
        helper: 'Melihat daftar debitur yang memerlukan penilaian individu, termasuk filter dan pencarian.',
        icon: AssignmentIcon,
        render: () => null
      },
      {
        key: 'individual-reports',
        label: 'Reports',
        section: '17',
        helper: 'View the list of processed individual assessment reports.',
        icon: AssessmentIcon,
        render: () => (
          <AssessmentReportsTab
            onNavigate={(id, tab, num, isEdit) => {
              router.push(buildAssessmentUrl({
                accountId: id,
                tab,
                accountNumber: num,
                extra: isEdit ? { edit: 'true' } : undefined
              }));
            }}
          />
        )
      },
      {
        key: 'assessment-details',
        label: 'Details',
        section: '18',
        helper: 'Melihat status detail dan melakukan override penilaian manual jika diperlukan.',
        icon: AssessmentIcon,
        render: () => (
          <AssessmentDetailsTab
            account={selectedAccount}
            assessment={null}
            onUpdateAssessment={async (data) => {
              // Extract the actual override data if it's wrapped
              const actualData = (data as any).stagedOverride || data;
              setStagedOverride(actualData);
              // UX: Automatically navigate to DCF Analysis tab after staging
              handleTabChangeByKey('dcf-analysis');
              return { success: true };
            }}
            onTabChange={handleTabChangeByKey}
            assessmentData={assessmentData}
            historyData={historyData}
          />
        )
      },
      {
        key: 'dcf-analysis',
        label: 'DCF',
        section: '20',
        helper: 'Melakukan perhitungan Discounted Cash Flow dan menghitung Present Value.',
        icon: CalculateIcon,
        render: () => (
          <DCFAnalysisTab
            account={selectedAccount}
            assessment={null}
            onCalculate={handleCalculateDcf}
            calculationResults={dcfCalculation}
            loading={dcfLoading}
            stagedDCF={stagedDCF}
            onStagedDCF={(data) => {
              setStagedDCF(data);
              // Automate the calculation after upload/staging
              if (data.cashflows && data.cashflows.length > 0) {
                handleCalculateDcf(data);
              }
              // UX: Automatically navigate to Provision Calculation tab AFTER UPLOAD/STAGING is complete
              handleTabChangeByKey('provision-calculation');
            }}
          />
        )
      },
      {
        key: 'provision-calculation',
        label: 'Provision',
        section: '21',
        helper: 'Menghitung CKPN/Provision berdasarkan hasil DCF dan Outstanding Balance.',
        icon: MonetizationOnIcon,
        render: () => (
          <ProvisionCalculationTab
            account={selectedAccount}
            assessment={null}
            calculation={dcfCalculation}
            loading={dcfLoading}
            isStagedOverrideReady={!!stagedOverride}
            isStagedDCFReady={!!stagedDCF}
            onFinalSubmit={handleFinalPackageSubmit}
            submitting={submittingPackage}
          />
        )
      },
      {
        key: 'history',
        label: 'Assessment & Approval History',
        section: '22',
        helper: 'Melihat riwayat aktivitas dan audit trail penilaian individu.',
        icon: HistoryIcon,
        render: () => (
          <AssessmentHistoryTab
            key={`history-${accountId}-${historyRefreshKey}`} // Force remount/refetch when account or refreshKey changes
            account={selectedAccount}
          />
        )
      },
      {
        key: 'documents',
        label: 'Documents',
        section: '23',
        helper: 'Mengelola dan melihat dokumen pendukung penilaian.',
        icon: FolderIcon,
        render: () => (
          <AssessmentDocumentsTab
            key={`docs-${accountId}-${stagedOverride ? 'o' : ''}-${stagedDCF ? 'd' : ''}`}
            account={selectedAccount}
            stagedOverride={stagedOverride}
            stagedDCF={stagedDCF}
            assessmentData={assessmentData}
            historyData={historyData}
          />
        )
      }
    ],
    [
      accountId,
      accountNumber,
      assessmentData,
      buildAssessmentUrl,
      dcfCalculation,
      dcfLoading,
      handleCalculateDcf,
      handleFinalPackageSubmit,
      handleTabChangeByKey,
      historyData,
      historyRefreshKey,
      router,
      selectedAccount,
      stagedDCF,
      stagedOverride,
      submittingPackage
    ]
  );

  const handleTabChange = useCallback((nextIndex: number) => {
    const nextSection = sections[nextIndex];
    if (!nextSection) return;

    if (nextIndex > 1 && !accountId) {
      setHeaderSnackbar({
        open: true,
        message: 'Pilih debitur terlebih dahulu untuk mengakses tab Assessment, DCF, dan Provision',
        severity: 'info'
      });
      return;
    }

    handleTabChangeByKey(nextSection.key);
  }, [sections, accountId, handleTabChangeByKey]);

  const activeSection = sections[activeTab] ?? sections[0];

  return (
    <Container maxWidth={false} sx={{ py: 1, px: { xs: 1, md: 1.5 } }}>
      <FullstackIndicator />

      {/* Auto-submission Progress Overlay */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, flexDirection: 'column', gap: 2, backdropFilter: 'blur(4px)', bgcolor: 'rgba(0,0,0,0.7)' }}
        open={submittingPackage}
      >
        <CircularProgress color="inherit" size={60} thickness={4} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Submitting Assessment Package...</Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>Consolidating Adjustment and DCF data for Checker review.</Typography>
        </Box>
      </Backdrop>

      <PageHeader
        title="Assessment Workspace"
        subtitle={`Individual Impairment workflow (SOP) - ${mode.toUpperCase()} Mode`}
        chip={hasLiveNotifications ? "LIVE UPDATES" : undefined}
        chipColor="success"
        extraActions={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {hasLiveNotifications && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '20px',
                        border: '1px solid rgba(76, 175, 80, 0.2)',
                        mr: 1
                    }}
                >
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#4caf50',
                            animation: `${livePulse} 2s infinite ease-in-out`,
                            boxShadow: '0 0 10px #4caf50'
                        }}
                    />
                    <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 700, letterSpacing: '0.5px' }}>
                        NEW REQUESTS
                    </Typography>
                </Box>
            )}
            {accountId && (
              <Button
                variant="outlined"
                onClick={() => router.push(buildAssessmentUrl({}))}
              >
                Back to Watchlist
              </Button>
            )}
            <Tooltip title={accountId ? "Copy current workspace link" : "Watchlist link (filters included)"}>
              <span>
                <Button
                  variant="outlined"
                  startIcon={<CopyIcon />}
                  onClick={() => copyToClipboard(window.location.href, accountId ? 'Workspace link copied' : 'Watchlist link copied')}
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

            {canApprove && (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<RejectIcon />}
                  onClick={() => {
                    setCheckerComments('');
                    setRejectionDialogOpen(true);
                  }}
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ApproveIcon />}
                  onClick={() => {
                    setCheckerComments('');
                    setApprovalDialogOpen(true);
                  }}
                >
                  Approve
                </Button>
              </Stack>
            )}
          </Box>
        }
      />

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onClose={() => !submittingApproval && setApprovalDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Approval</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to approve this impairment assessment for <strong>{selectedAccount?.cif_name}</strong>?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Approval Comments (Optional)"
            placeholder="Add any notes for the Maker..."
            value={checkerComments}
            onChange={(e) => setCheckerComments(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setApprovalDialogOpen(false)} disabled={submittingApproval}>Cancel</Button>
          <LoadingButton
            variant="contained"
            color="success"
            onClick={handleApprove}
            loading={submittingApproval}
          >
            Confirm Approval
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onClose={() => !submittingApproval && setRejectionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>Reject Assessment</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Please provide a reason for rejecting the assessment for <strong>{selectedAccount?.cif_name}</strong>.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            required
            label="Rejection Reason"
            placeholder="Explain why this assessment is being returned to Maker..."
            value={checkerComments}
            onChange={(e) => setCheckerComments(e.target.value)}
            error={rejectionDialogOpen && !checkerComments.trim()}
            helperText={rejectionDialogOpen && !checkerComments.trim() ? "Reason is required for rejection" : ""}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setRejectionDialogOpen(false)} disabled={submittingApproval}>Cancel</Button>
          <LoadingButton
            variant="contained"
            color="error"
            onClick={handleReject}
            loading={submittingApproval}
          >
            Reject Assessment
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {accountId && !selectedAccount && !loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Pilih debitur dari Watchlist menggunakan ikon Mata (View Details) untuk membuka tab Assessment, DCF, dan Provision.
        </Alert>
      )}
      {accountId && selectedAccount && (
        <Card sx={{ mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'visible' }}>
          <CardContent sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    {selectedAccount.cif_name ? selectedAccount.cif_name.charAt(0) : '?'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Selected Debtor</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {selectedAccount.cif_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', gap: 1 }}>
                      <span>Acc: {selectedAccount.account_number}</span>
                      <span>•</span>
                      <span>CIF: {selectedAccount.cif_number}</span>
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ px: { md: 4 } }}>
                   <Stepper activeStep={activeTab >= 2 ? activeTab - 2 : 0} alternativeLabel size="small">
                      {sections.slice(2).map((s, idx) => (
                        <Step
                          key={s.key}
                          completed={
                            s.key === 'assessment-details' ? !!stagedOverride :
                            s.key === 'dcf-analysis' ? !!stagedDCF :
                            s.key === 'provision-calculation' ? (!!stagedDCF) :
                            activeTab > idx + 2
                          }
                        >
                          <StepLabel
                            onClick={() => handleTabChangeByKey(s.key)}
                            sx={{ cursor: 'pointer', '& .MuiStepLabel-label': { fontSize: '0.7rem', fontWeight: 600 } }}
                            StepIconProps={{
                              sx: {
                                '&.Mui-completed': { color: 'success.main' },
                                '&.Mui-active': { color: 'primary.main' }
                              }
                            }}
                          >
                            {s.label}
                          </StepLabel>
                        </Step>
                      ))}
                   </Stepper>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}


      {accountId && (() => {
        const isProcessed = assessmentData?.status === 1 ||
                          assessmentData?.is_pending_approval ||
                          assessmentData?.approval_status === 'APPROVED';

        // Distinguish between data pre-loaded from history and data actively changed by user
        const isStagingOverride = stagedOverride && !stagedOverride.isHistorical;
        const isStagingDCF = stagedDCF && stagedDCF.scenarioType !== 'historical';
        const isActivelyStaging = isStagingOverride || isStagingDCF;

        const isFullyStaged = (stagedOverride || isProcessed) && (stagedDCF || isProcessed);

        // Hide the entire status bar if it's already processed and the user hasn't started a new revision (active staging)
        if (isProcessed && !isActivelyStaging) return null;

        return (
          <Box sx={{ mb: 2 }}>
            {!isFullyStaged ? (
              <Alert
                severity="warning"
                variant="outlined"
                sx={{ borderRadius: 2, bgcolor: '#fff9c4', borderColor: '#fbc02d' }}
                action={
                  <Button color="inherit" size="small" onClick={() => handleTabChangeByKey(!stagedOverride ? 'assessment-details' : 'dcf-analysis')}>
                    COMPLETE NOW
                  </Button>
                }
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Package Incomplete:
                  {!stagedOverride && <Chip size="small" label="Adjustment Missing" sx={{ ml: 1, bgcolor: 'error.light', color: 'white' }} />}
                  {!stagedDCF && <Chip size="small" label="DCF Missing" sx={{ ml: 1, bgcolor: 'error.light', color: 'white' }} />}
                </Typography>
                <Typography variant="caption">
                  Please complete all required components to enable consolidated submission for this customer.
                </Typography>
              </Alert>
            ) : (
              <Alert
                severity="success"
                variant="filled"
                sx={{ borderRadius: 2 }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Ready for Submission!
                </Typography>
                <Typography variant="caption">
                  Both Adjustment and DCF components are staged. The system is ready to finalize the package.
                </Typography>
              </Alert>
            )}
          </Box>
        );
      })()}

      <Box sx={{ 
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, 
        borderRadius: '24px', 
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(16px)',
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden'
      }}>
        <Tabs
          value={activeTab}
          onChange={(_, next) => handleTabChange(next)}
          variant="fullWidth"
          sx={{
            minHeight: 64,
            bgcolor: 'transparent',
            '& .MuiTabs-indicator': { 
              height: 4, 
              bgcolor: theme.palette.primary.main, 
              borderRadius: '4px 4px 0 0',
              boxShadow: `0 -4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
            },
            '& .MuiTab-root': {
              minHeight: 64,
              minWidth: 0,
              p: 0,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: theme.palette.text.secondary,
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                fontWeight: 700,
                bgcolor: alpha(theme.palette.primary.main, 0.03)
              },
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.02)
              }
            }
          }}
        >
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Tab
                key={section.key}
                icon={<Icon sx={{ fontSize: 22, mb: '4px !important' }} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {section.label}
                    {section.key === 'history' && stagedOverride && (
                      <Chip size="small" color="primary" sx={{ height: 8, width: 8, minWidth: 8, borderRadius: '50%', p: 0, '& .MuiChip-label': { display: 'none' }, boxShadow: `0 0 8px ${theme.palette.primary.main}` }} />
                    )}
                    {section.key === 'provision-calculation' && stagedDCF && (
                      <Chip size="small" color="primary" sx={{ height: 8, width: 8, minWidth: 8, borderRadius: '50%', p: 0, '& .MuiChip-label': { display: 'none' }, boxShadow: `0 0 8px ${theme.palette.primary.main}` }} />
                    )}
                  </Box>
                }
                disabled={index > 1 && !accountId}
              />
            );
          })}
        </Tabs>

        <Divider sx={{ opacity: 0.1 }} />

        <Box sx={{ px: 3, py: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.02), borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}` }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontStyle: 'italic', opacity: 0.8 }}>
            {activeSection.helper}
          </Typography>
        </Box>

        <Box sx={{ p: 1.5, width: '100%', boxSizing: 'border-box' }}>
          {activeTab === 0 ? (
            <Box sx={{ width: '100%' }}>
              {dashboardError ? (
                <Alert severity="error" sx={{ mb: 2 }}>{dashboardError}</Alert>
              ) : null}
              <AssessmentKPI
                watchlist={watchlist}
                loading={loading}
                summary={summary}
              />
              <Box sx={{ mt: 3 }}>
                  <AssessmentFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                    mode={mode}
                  />
                  <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                    {/* Active Filter Chips */}
                    {Object.entries(filters).map(([key, value]) => {
                      if (!value || key === 'search') return null;

                      let label = '';
                      if (key === 'downloadDate') label = `Date: ${dayjs(value as string).format('DD MMM YYYY')}`;
                      else if (key === 'stage') label = `Stage ${value}`;
                      else if (key === 'impairedFlag') label = value === 'I' ? 'Impaired' : 'Non-Impaired';
                      else if (key === 'priorityLevel') label = `Priority: ${value}`;
                      else if (key === 'assessmentStatus') label = `Status: ${value}`;

                      return (
                        <Chip
                          key={key}
                          label={label}
                          onDelete={() => handleFilterChange(key, '')}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{
                            borderRadius: 1.5,
                            bgcolor: 'primary.lighter',
                            borderColor: 'primary.light',
                            fontWeight: 600,
                            '& .MuiChip-deleteIcon': {
                              color: 'primary.main',
                              fontSize: 16
                            }
                          }}
                        />
                      )
                    })}

                    {/* Results Count Chip */}
                    <Chip
                      label={`Showing ${pagination.total > 0 ? (pagination.page * pagination.limit + 1) : 0} - ${Math.min((pagination.page + 1) * pagination.limit, pagination.total)} of ${pagination.total.toLocaleString()} records`}
                      variant="soft"
                      size="small"
                      sx={{
                        ml: 'auto !important',
                        height: 28,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        px: 1,
                        bgcolor: 'grey.100',
                        color: 'text.secondary',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    />
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
              </Box>
            </Box>
          ) : (
            <AssessmentWorkspaceEmbeddedProvider>
              <Box sx={{ width: '100%' }}>
                {(accountId || activeTab <= 1) ? activeSection.render() : (
                  <Alert severity="info">Pilih debitur dari Watchlist untuk membuka tab ini</Alert>
                )}
              </Box>
            </AssessmentWorkspaceEmbeddedProvider>
          )}
        </Box>
      </Box>

      <Snackbar
        open={headerSnackbar.open}
        autoHideDuration={2000}
        onClose={() => setHeaderSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={headerSnackbar.severity} variant="filled" onClose={() => setHeaderSnackbar((prev) => ({ ...prev, open: false }))} sx={{ width: '100%' }}>
          {headerSnackbar.message}
        </Alert>
      </Snackbar>

      {/* Submit Success Modal — Maker informed that Checker must review */}
      <Dialog
        open={submitSuccessModal}
        onClose={() => setSubmitSuccessModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)', color: 'white', fontWeight: 800, py: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>✓</Avatar>
            <span>Assessment Berhasil Disubmit!</span>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Paper sx={{ p: 2.5, bgcolor: '#f0f7ff', border: '1px solid #bbdefb', borderRadius: 2, mb: 2 }}>
            <Typography variant="body2" fontWeight={700} color="primary.dark" mb={0.5}>
              📋 Langkah Selanjutnya — Four-Eyes Principle
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Assessment package telah masuk ke antrian persetujuan. Seorang <strong>Checker</strong> perlu mereview dan menyetujuinya sebelum dapat dieksekusi.
            </Typography>
          </Paper>
          <Stack spacing={1}>
            {[
              { step: '1', label: 'Anda (Maker)', desc: 'Sudah submit assessment package ✓', done: true },
              { step: '2', label: 'Checker', desc: 'Mereview dan menyetujui di Approval Inbox', done: false },
              { step: '3', label: 'Eksekusi Sistem', desc: 'Data CKPN diperbarui secara otomatis', done: false },
            ].map(s => (
              <Stack key={s.step} direction="row" spacing={1.5} alignItems="flex-start">
                <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: s.done ? 'success.main' : 'grey.300', color: s.done ? 'white' : 'grey.600', flexShrink: 0 }}>{s.done ? '✓' : s.step}</Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={700}>{s.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.desc}</Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setSubmitSuccessModal(false)} variant="outlined" sx={{ borderRadius: 2 }}>Tutup</Button>
          <Button
            onClick={() => { setSubmitSuccessModal(false); router.push('/banking/workflow/approval'); }}
            variant="contained"
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Buka Approval Inbox
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
