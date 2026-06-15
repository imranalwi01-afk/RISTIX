'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, Skeleton, Fade } from '@mui/material';
import {
  AccountBalance as TotalIcon,
  Warning as ImpairedIcon,
  HourglassEmpty as PendingIcon,
  MonetizationOn as ProvisionIcon
} from '@mui/icons-material';
import { IndividualImpairmentWatchlistItem } from '@/services/api.individual-impairment';
import { formatCurrency } from './utils';

interface AssessmentKPIProps {
  watchlist: IndividualImpairmentWatchlistItem[];
  loading: boolean;
  summary?: {
    totalAccounts: number;
    impairedAccounts: number;
    pendingAssessments: number;
    totalProvisions: number;
    dataDate?: string;
  };
}

interface KPICardProps {
  title: string;
  value: React.ReactNode;
  gradient: string;
  icon: React.ReactNode;
  loading: boolean;
  delay?: number;
}

// KPICard component declared outside to avoid React re-creation on each render
const KPICard: React.FC<KPICardProps> = ({ title, value, gradient, icon, loading, delay = 0 }) => (
  <Fade in={!loading} timeout={500} style={{ transitionDelay: `${delay}ms` }}>
    <Card
      sx={{
        minWidth: 180,
        flex: 1,
        background: gradient,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '80px',
          height: '80px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          transform: 'translate(25%, -25%)'
        }
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1, py: 1.5, px: 2 }}>
        {loading ? (
          <>
            <Skeleton
              variant="rectangular"
              height={36}
              width="70%"
              sx={{ mx: 'auto', mb: 0.75, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 1 }}
            />
            <Skeleton
              variant="text"
              width="50%"
              sx={{ mx: 'auto', bgcolor: 'rgba(255,255,255,0.2)' }}
            />
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
              <Box sx={{
                mr: 1,
                opacity: 0.9,
                display: 'flex',
                alignItems: 'center'
              }}>
                {icon}
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  letterSpacing: '-0.5px'
                }}
              >
                {value}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{
                textAlign: 'center',
                opacity: 0.95,
                fontWeight: 500,
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                display: 'block'
              }}
            >
              {title}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  </Fade>
);

// Main AssessmentKPI component
export const AssessmentKPI: React.FC<AssessmentKPIProps> = ({ watchlist, loading, summary }) => {
  // Use summary data if available, otherwise fallback to watchlist aggregation (which is inaccurate for paginated data)
  // Fallback is only for initial load or if summary API fails

  const totalAccounts = summary ? summary.totalAccounts : watchlist.length;
  const impairedAccounts = summary ? summary.impairedAccounts : watchlist.filter(a => a.impaired_flag === 'I').length;
  const pendingAssessments = summary ? summary.pendingAssessments : watchlist.filter(a => a.assessment_status === 'PENDING').length;
  const totalProvisions = summary ? summary.totalProvisions : watchlist.reduce((sum, a) => sum + (a.provision_amount || 0), 0);

  return (
    <Box
      sx={{
        mb: 2,
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',                    // Mobile: 1 column
          sm: '1fr 1fr',                // Tablet: 2 columns
          md: 'repeat(4, 1fr)'          // Desktop: 4 columns
        },
        gap: 1.5
      }}
    >
      <KPICard
        title="Total Accounts"
        value={totalAccounts}
        gradient="linear-gradient(135deg, #1976d2 0%, #1565c0 100%)"
        icon={<TotalIcon sx={{ fontSize: 28 }} />}
        loading={loading && !summary}
        delay={0}
      />
      <KPICard
        title="Impaired Accounts"
        value={impairedAccounts}
        gradient="linear-gradient(135deg, #d32f2f 0%, #c62828 100%)"
        icon={<ImpairedIcon sx={{ fontSize: 28 }} />}
        loading={loading && !summary}
        delay={100}
      />
      <KPICard
        title="Pending Assessments"
        value={pendingAssessments}
        gradient="linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)"
        icon={<PendingIcon sx={{ fontSize: 28 }} />}
        loading={loading && !summary}
        delay={200}
      />
      <KPICard
        title="Total Provisions"
        value={formatCurrency(totalProvisions)}
        gradient="linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)"
        icon={<ProvisionIcon sx={{ fontSize: 28 }} />}
        loading={loading && !summary}
        delay={300}
      />

      {summary?.dataDate && (
        <Box sx={{ gridColumn: '1 / -1', mt: 1, textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
                Data as of: <strong>{new Date(summary.dataDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </Typography>
        </Box>
      )}
    </Box>
  );
};
