'use client';

// packages/frontend/src/components/ifrs9/LifetimeLGDReport.tsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  alpha
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';
import BaseIfrs9Report from './BaseIfrs9Report';

interface LGDDistributionItem {
  range: string;
  min: number;
  max: number;
  count: number;
  color: string;
}

interface SummaryStats {
  totalAccounts: number;
  averageLGD: number;
  totalRecoveryAmount: number;
  avgRecoveryRate: number;
  lgdDistribution: LGDDistributionItem[];
}

const SummaryCards: React.FC<{ stats: SummaryStats }> = ({ stats }) => {
  const items = [
    {
      title: 'Total Accounts',
      value: stats.totalAccounts.toLocaleString('id-ID'),
      format: 'raw',
      icon: <BankIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
      mainColor: '#1976D2'
    },
    {
      title: 'Total Recovery',
      value: stats.totalRecoveryAmount,
      format: 'currency',
      icon: <AssessmentIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      mainColor: '#4facfe'
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 5 }}>
      {items.map((item, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card sx={{
            height: '100%',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            background: 'white',
            boxShadow: `0 4px 12px ${alpha(item.mainColor, 0.12)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: `1px solid ${alpha(item.mainColor, 0.1)}`,
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: `0 12px 32px ${alpha(item.mainColor, 0.25)}`,
              '& .card-icon-container': {
                transform: 'rotate(10deg) scale(1.1)'
              }
            }
          }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: 'text.secondary',
                    opacity: 0.8
                  }}
                >
                  {item.title}
                </Typography>
                <Box
                  className="card-icon-container"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: item.gradient,
                    color: 'white',
                    display: 'flex',
                    transition: 'transform 0.3s ease',
                    boxShadow: `0 4px 12px ${alpha(item.mainColor, 0.4)}`
                  }}
                >
                  {item.icon}
                </Box>
              </Box>

              <Box sx={{ mt: 'auto' }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: item.mainColor, // Fallback
                    background: item.gradient,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5
                  }}
                >
                  {item.format === 'currency'
                    ? new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      notation: 'compact',
                      maximumFractionDigits: 1
                    }).format(item.value as number)
                    : item.format === 'percentage'
                      ? `${((item.value as number) * 100).toFixed(2)}%`
                      : item.value
                  }
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.7, mb: 1 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 600, color: 'text.secondary' }}>
                    {item.title === 'Average LGD Rate' ? 'EAD-WEIGHTED' : item.title === 'Total Recovery' ? 'PRESENT VALUE' : 'REPORTED'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                  <Chip
                    size="small"
                    label="LGD METRIC"
                    variant="outlined"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      borderColor: alpha(item.mainColor, 0.3),
                      color: item.mainColor
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

const LifetimeLGDReport: React.FC = () => {
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalAccounts: 0,
    averageLGD: 0,
    totalRecoveryAmount: 0,
    avgRecoveryRate: 0,
    lgdDistribution: []
  });

  const handleDataLoaded = React.useCallback((data: any[], summary?: Record<string, unknown> | null) => {
    const detailRows: any[] = Array.isArray((summary as any)?.detailRows) ? (summary as any).detailRows : data;
    if (detailRows && detailRows.length > 0) {
      let totalEad = 0;
      let weightedLgsSum = 0;
      let totalRecoveryPv = 0;

      const stats = detailRows.reduce<{
        totalAccounts: number;
        averageLGD: number;
        totalRecoveryAmount: number;
        avgRecoveryRate: number;
        lgdDistribution: LGDDistributionItem[];
      }>((acc, row) => {
        const ead = parseFloat(row.ead_amount as string) || parseFloat(row.total_ead as string) || parseFloat(row.ead as string) || parseFloat(row.os_at_default as string) || parseFloat(row.outstanding as string) || 0;
        const lgd = parseFloat(row.lgd_rate as string) || parseFloat(row.final_lgd as string) || parseFloat(row.lgd as string) || 0;
        const recoveryPv = parseFloat(row.recovery_amount_pv as string) || parseFloat(row.total_pv_recovery as string) || parseFloat(row.recovery_amount as string) || parseFloat(row.total_recovery as string) || parseFloat(row.total_recovery_pv as string) || 0;

        acc.totalAccounts += 1;
        totalEad += ead;
        weightedLgsSum += (lgd * ead);
        totalRecoveryPv += recoveryPv;

        return acc;
      }, {
        totalAccounts: 0,
        averageLGD: 0,
        totalRecoveryAmount: 0,
        avgRecoveryRate: 0,
        lgdDistribution: [] as LGDDistributionItem[]
      });

      const averageLGD = totalEad > 0 ? weightedLgsSum / totalEad : 0;

      const lgdRanges = [
        { range: '0-20%', min: 0, max: 0.2, count: 0, color: '#42E695' },
        { range: '21-40%', min: 0.2, max: 0.4, count: 0, color: '#A0E642' },
        { range: '41-60%', min: 0.4, max: 0.6, count: 0, color: '#FAD961' },
        { range: '61-80%', min: 0.6, max: 0.8, count: 0, color: '#F76B1C' },
        { range: '81-100%', min: 0.8, max: 1.1, count: 0, color: '#F44336' }
      ];

      detailRows.forEach(row => {
        const lgd = parseFloat(row.lgd_rate as string) || 0;
        lgdRanges.forEach(range => {
          if (lgd >= range.min && lgd < range.max) {
            range.count += 1;
          }
        });
      });

      setSummaryStats({
        ...stats,
        averageLGD,
        totalRecoveryAmount: totalRecoveryPv,
        lgdDistribution: lgdRanges.filter(range => range.count > 0)
      });
      return;
    }

    setSummaryStats({
      totalAccounts: 0,
      averageLGD: 0,
      totalRecoveryAmount: 0,
      avgRecoveryRate: 0,
      lgdDistribution: []
    });
  }, []);



  const requiredParams = useMemo(() => ['prc_date'], []);
  const optionalParams = useMemo(() => ['lgd_config_id', 'segment_id', 'fl_flag'], []);

  return (
    <BaseIfrs9Report
      title="Lifetime LGD Report"
      description="Loss Given Default data with recovery information and account-level LGD calculations"
      reportType="lifetime-lgd"
      requiredParams={requiredParams}
      optionalParams={optionalParams}
      supportsPagination={true}
      supportsCharts={true}
      onDataLoaded={handleDataLoaded}
    >
      <SummaryCards stats={summaryStats} />
    </BaseIfrs9Report>
  );
};

export default LifetimeLGDReport;
