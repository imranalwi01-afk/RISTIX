// packages/frontend/src/components/banking/shared/PageHeader.tsx
// ============================================================================
// 🧹 CLEANUP: Shared Page Header Component
// ============================================================================
// Purpose: Eliminates duplicate page header components across banking setup pages
// Replaces: 4 separate header implementations with breadcrumbs
// ============================================================================

import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Home as HomeIcon,
  SettingsApplications as PageIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  chip?: string;
  chipColor?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  onRefresh?: () => void;
  loading?: boolean;
  extraActions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  chip,
  chipColor = 'primary',
  onRefresh,
  loading = false,
  extraActions
}) => {
  const router = useRouter();

  return (
    <>
      {/* Breadcrumbs */}
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
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <PageIcon sx={{ mr: 0.5, fontSize: 16 }} />
          {title}
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, minWidth: 0 }}>
        <Box sx={{ minWidth: 0, flex: '1 1 320px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', rowGap: 1, minWidth: 0, mb: 1 }}>
            <PageIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', minWidth: 0 }}>
              {title}
            </Typography>
            {chip && (
              <Chip
                label={chip}
                color={chipColor}
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </Box>
          {subtitle && (
            <Typography variant="subtitle1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' }, minWidth: 0 }}>
          {onRefresh && (
            <Tooltip title="Refresh Data">
              <IconButton onClick={onRefresh} color="primary" disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
          {extraActions as any}
        </Box>
      </Box>
    </>
  );
};

export default PageHeader;
