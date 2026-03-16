// packages/frontend/src/components/ifrs9/ReportPageLayout.tsx
'use client';

import React from 'react';
import {
  Box,
  Container,
  Breadcrumbs,
  Link,
  Typography,
  Button as MuiButton
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export interface ReportPageLayoutProps {
  /** Page title displayed in header and breadcrumb */
  title: string;
  /** Subtitle / description below the title */
  description?: string;
  /** Icon element shown in breadcrumb and page header (e.g. <BarChartIcon />) */
  icon?: React.ReactNode;
  /** Label shown in the breadcrumb leaf. Defaults to `title`. */
  breadcrumbLabel?: string;
  /** Optional action buttons rendered aligned right in the header */
  actionButtons?: React.ReactNode | Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void | Promise<void>;
    variant?: 'text' | 'outlined' | 'contained';
    color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
    disabled?: boolean;
    dataTestId?: string;
  }>;
  children: React.ReactNode;
}

/**
 * Standard page wrapper for all IFRS 9 report pages.
 * Provides consistent Breadcrumb + Page Header layout so individual
 * page.tsx files stay minimal.
 */
const ReportPageLayout: React.FC<ReportPageLayoutProps> = ({
  title,
  description,
  icon,
  breadcrumbLabel,
  actionButtons,
  children
}) => {
  const router = useRouter();

  return (
    <Container maxWidth="xl">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/banking/dashboard"
          onClick={(e) => {
            e.preventDefault();
            router.push('/banking/dashboard');
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Dashboard
        </Link>
        <Typography
          component="span"
          color="text.primary"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          {icon && (
            <Box component="span" sx={{ display: 'inline-flex', fontSize: 16, '& svg': { fontSize: 16 } }}>
              {icon}
            </Box>
          )}
          {breadcrumbLabel ?? title}
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {icon && (
              <Box sx={{ mr: 2, display: 'flex', color: 'primary.main', '& svg': { fontSize: 32 } }}>
                {icon}
              </Box>
            )}
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              {title}
            </Typography>
          </Box>
          {description && (
            <Typography variant="subtitle1" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
        {actionButtons && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {Array.isArray(actionButtons) 
              ? actionButtons.map((btn, idx) => (
                  <MuiButton key={idx} variant={btn.variant || 'outlined'} color={btn.color || 'inherit'} startIcon={btn.icon} onClick={btn.onClick} disabled={btn.disabled} data-testid={btn.dataTestId}>
                    {btn.label}
                  </MuiButton>
                ))
              : actionButtons}
          </Box>
        )}
      </Box>

      {/* Main Content */}
      {children}
    </Container>
  );
};

export default ReportPageLayout;
