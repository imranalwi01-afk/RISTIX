import React from 'react';
import { Box, Card, CardContent, Typography, Skeleton, Fade } from '@mui/material';
import {
  AccountBalance as TotalIcon,
  Warning as ImpairedIcon,
  HourglassEmpty as PendingIcon,
  MonetizationOn as ProvisionIcon
} from '@mui/icons-material';
import { IndividualImpairmentWatchlistItem } from '@/services/api.individual-impairment';
import { formatCurrency } from '@/app/banking/individual/assessment/utils';

interface AssessmentKPIProps {
  watchlist: IndividualImpairmentWatchlistItem[];
  loading: boolean;
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
export const AssessmentKPI: React.FC<AssessmentKPIProps> = ({ watchlist, loading }) => {
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
        value={watchlist.length}
        gradient="linear-gradient(135deg, #1976d2 0%, #1565c0 100%)"
        icon={<TotalIcon sx={{ fontSize: 28 }} />}
        loading={loading}
        delay={0}
      />
      <KPICard
        title="Impaired Accounts"
        value={watchlist.filter(a => a.impaired_flag === 'I').length}
        gradient="linear-gradient(135deg, #d32f2f 0%, #c62828 100%)"
        icon={<ImpairedIcon sx={{ fontSize: 28 }} />}
        loading={loading}
        delay={100}
      />
      <KPICard
        title="Pending Assessments"
        value={watchlist.filter(a => a.assessment_status === 'PENDING' || a.assessment_status === '2').length}
        gradient="linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)"
        icon={<PendingIcon sx={{ fontSize: 28 }} />}
        loading={loading}
        delay={200}
      />
      <KPICard
        title="Total Provisions"
        value={formatCurrency(watchlist.reduce((sum, a) => sum + (a.provision_amount || 0), 0))}
        gradient="linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)"
        icon={<ProvisionIcon sx={{ fontSize: 28 }} />}
        loading={loading}
        delay={300}
      />
    </Box>
  );
};
