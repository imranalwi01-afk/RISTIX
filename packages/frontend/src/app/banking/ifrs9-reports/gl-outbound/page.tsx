'use client';

import React from 'react';
import { Box, Alert } from '@mui/material';
import BaseIfrs9Report from '@/components/ifrs9/BaseIfrs9Report';
import { useAuth } from '@/providers/AuthProvider';

export default function GlOutboundPage() {
  const { user } = useAuth();
  const hasAccess = user?.permissions?.includes('banking.reports.ifrs9.nominative.view') || user?.permissions?.includes('banking.reports.ifrs9.nominative');

  if (hasAccess === false) {
    return (
      <Box p={3}>
        <Alert severity="error">You do not have permission to access GL Outbound Report.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <BaseIfrs9Report
        title="GL Outbound"
        description="General Ledger Outbound Report"
        reportType="gl-outbound"
        requiredParams={['prc_date']}
        supportsPagination={true}
      />
    </Box>
  );
}
