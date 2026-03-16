'use client';

import React, { useMemo, useState, useEffect } from 'react';
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
  CardContent
} from '@mui/material';
import PageHeader from '@/components/banking/shared/PageHeader';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import { AssessmentWorkspaceEmbeddedProvider } from './embedded-context';
import { AssessmentKPI } from '@/components/banking/individual/assessment/AssessmentKPI';
import { AssessmentWatchlist } from '@/components/banking/individual/assessment/AssessmentWatchlist';
import { AssessmentFilters } from '@/components/banking/individual/assessment/AssessmentFilters';
import { FILTER_DEFAULTS } from './constants';
import { individualImpairmentAPI, IndividualImpairmentWatchlistItem } from '@/services/api.individual-impairment';

const WatchlistSection = dynamic(() => import('../watchlist/page'));
const ReportsSection = dynamic(() => import('../reports/page'));
const OverrideTriggerSection = dynamic(() => import('../override-trigger/page'));
const ScenarioDetailsSection = dynamic(() => import('../review/scenario/page'));
const UploadDcfSection = dynamic(() => import('../dcf-uploads/page'));
const DcfUploadReportSection = dynamic(() => import('../review/dcf-upload-report/page'));
const IaDcfDetailSection = dynamic(() => import('../review/ia-dcf-detail/page'));
const HistoryCustomerSection = dynamic(() => import('../history/customer/page'));
const HistoryDcfSection = dynamic(() => import('../history/dcf-upload/page'));

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
  const mode = searchParams.get('mode') || 'conventional';

  // Dashboard State
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState<IndividualImpairmentWatchlistItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0
  });
  const [filters, setFilters] = useState(FILTER_DEFAULTS);

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    if (accountId) return;

    setLoading(true);
    try {
      const [watchlistRes, summaryRes] = await Promise.all([
        individualImpairmentAPI.watchlist.getAll({
          page: pagination.page + 1,
          limit: pagination.limit,
          search: filters.search,
          filter: {
            stage: filters.stage ? Number(filters.stage) : undefined,
            impaired_flag: filters.impairedFlag as any,
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
        setSummary(summaryRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accountId) {
      fetchDashboardData();
    }
  }, [accountId, pagination.page, pagination.limit, filters]);

  const sections = useMemo<SectionDef[]>(
    () => [
      {
        key: 'watchlist',
        label: 'Watchlist',
        section: '16',
        helper: 'FRS9_MASTER_ACCOUNT - Download date, CIF, account, currency, outstanding, DPD, collectability, rating.',
        render: () => <WatchlistSection />
      },
      {
        key: 'reports',
        label: 'List Report',
        section: '17',
        helper: 'FRS9_IMP_IA_HEADER - IA reporting list and status flow.',
        render: () => <ReportsSection />
      },
      {
        key: 'override-trigger',
        label: 'Override Trigger',
        section: '18',
        helper: 'Review override trigger with impaired flag, remarks, and reference before submit.',
        render: () => <OverrideTriggerSection />
      },
      {
        key: 'scenario',
        label: 'Scenario Details',
        section: '19',
        helper: 'Scenario method, number of scenarios, PO/RR setup, and repayment periods.',
        render: () => <ScenarioDetailsSection />
      },
      {
        key: 'upload-dcf',
        label: 'Upload DCF',
        section: '20',
        helper: 'FRS9_IMP_IA_DCF upload and validation for account cashflow projection.',
        render: () => <UploadDcfSection />
      },
      {
        key: 'dcf-upload-report',
        label: 'DCF Upload Report',
        section: '21',
        helper: 'Review uploaded DCF detail rows (account, periode, principal, interest, collateral).',
        render: () => <DcfUploadReportSection />
      },
      {
        key: 'ia-dcf-detail',
        label: 'IA DCF Detail',
        section: '22',
        helper: 'IA discounted cashflow detail for effective date and ECL breakdown.',
        render: () => <IaDcfDetailSection />
      },
      {
        key: 'history-customer',
        label: 'History Customer',
        section: '23',
        helper: 'Customer review history sourced from approved/rejected history records.',
        render: () => <HistoryCustomerSection />
      },
      {
        key: 'history-dcf',
        label: 'History DCF',
        section: '24',
        helper: 'DCF upload history and processing audit trail.',
        render: () => <HistoryDcfSection />
      }
    ],
    []
  );

  useEffect(() => {
    if (accountId) {
      const tabParam = searchParams.get('tab');
      if (tabParam) {
        const tabIndex = sections.findIndex(s => s.key === tabParam);
        if (tabIndex !== -1) {
          setActiveTab(tabIndex);
          return;
        }
      }
      // Default to Override Trigger (index 2) if no tab specified
      setActiveTab(2);
    }
  }, [accountId, searchParams, sections]);

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
    setFilters(FILTER_DEFAULTS);
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleAccountSelect = (account: IndividualImpairmentWatchlistItem) => {
    router.push(`/banking/individual/assessment?accountId=${account.account_number}&mode=${mode}`);
  };

  const handleViewDetails = (account: IndividualImpairmentWatchlistItem) => {
    // Navigate to the "IA DCF Detail" tab (Tabulation) for the selected account
    router.push(`/banking/individual/assessment?accountId=${account.account_number}&mode=${mode}&tab=ia-dcf-detail`);
  };

  if (!accountId) {
    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <FullstackIndicator />
        
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

            <AssessmentWatchlist 
              watchlist={watchlist}
              loading={loading}
              pagination={pagination}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onAccountSelect={handleAccountSelect}
              onEditAssessment={handleAccountSelect}
              onViewDetails={handleViewDetails}
              mode={mode}
            />
          </CardContent>
        </Card>
      </Container>
    );
  }

  const activeSection = sections[activeTab] ?? sections[0];

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <FullstackIndicator />
      <PageHeader
        title="Assessment Workspace"
        subtitle={`Wizard for IFRS9 Individual Impairment sections 16-24 (single menu entry) - ${mode.toUpperCase()} Mode`}
      />

      <Alert severity="info" sx={{ mb: 2 }}>
        This workspace keeps one sidebar menu while covering all required Individual Impairment spec sections 16-24.
      </Alert>

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
    </Container>
  );
}
