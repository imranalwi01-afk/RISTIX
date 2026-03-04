'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Alert,
  Box,
  Chip,
  Container,
  Divider,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import PageHeader from '@/components/banking/shared/PageHeader';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import { AssessmentWorkspaceEmbeddedProvider } from './embedded-context';

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

  const activeSection = sections[activeTab] ?? sections[0];

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <FullstackIndicator />
      <PageHeader
        title="Assessment Workspace"
        subtitle="Wizard for IFRS9 Individual Impairment sections 16-24 (single menu entry)."
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
