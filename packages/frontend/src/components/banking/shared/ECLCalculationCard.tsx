// packages/frontend/src/components/banking/shared/ECLCalculationCard.tsx
// ============================================================================
// ECL CALCULATION CARD - IFRS9 EXPECTED CREDIT LOSS DISPLAY
// ============================================================================
// File Path: packages/frontend/src/components/banking/shared/ECLCalculationCard.tsx
// Purpose: Display ECL calculations with stage classification and trends
// Features: Real-time updates, drill-down capabilities, export functions
// Dependencies: Material-UI v6, Recharts, Redux Toolkit
// ============================================================================

'use client';

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Calculate,
  TrendingUp,
  TrendingDown,
  MoreVert,
  Download,
  Refresh,
  Visibility,
  Assessment,
  Warning,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { LineChart, Line, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ECLCalculationData, IFRS9Stage, CurrencyCode } from '../types';

interface ECLCalculationCardProps {
  accountId: string;
  calculationData: ECLCalculationData;
  showTrend?: boolean;
  showActions?: boolean;
  variant?: 'summary' | 'detailed';
  onViewDetails?: (accountId: string) => void;
  onRecalculate?: (accountId: string) => void;
  onExport?: (accountId: string) => void;
}

// Sample trend data
const sampleTrendData = [
  { month: 'Jan', ecl: 12000 },
  { month: 'Feb', ecl: 11500 },
  { month: 'Mar', ecl: 13200 },
  { month: 'Apr', ecl: 12800 },
  { month: 'May', ecl: 14100 },
  { month: 'Jun', ecl: 13600 },
];

const ECLCalculationCard: React.FC<ECLCalculationCardProps> = ({
  accountId,
  calculationData,
  showTrend = true,
  showActions = true,
  variant = 'summary',
  onViewDetails,
  onRecalculate,
  onExport,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // ✅ Handle menu operations
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // ✅ Handle recalculation
  const handleRecalculate = useCallback(async () => {
    setIsCalculating(true);
    setMenuAnchor(null);
    
    try {
      // Simulate recalculation
      await new Promise(resolve => setTimeout(resolve, 3000));
      onRecalculate?.(accountId);
    } finally {
      setIsCalculating(false);
    }
  }, [accountId, onRecalculate]);

  // ✅ Get stage information
  const getStageInfo = (stage: IFRS9Stage) => {
    switch (stage) {
      case 1:
        return {
          label: 'Stage 1',
          color: 'success' as const,
          description: '12-month ECL',
          icon: <CheckCircle />,
        };
      case 2:
        return {
          label: 'Stage 2',
          color: 'warning' as const,
          description: 'Lifetime ECL',
          icon: <Warning />,
        };
      case 3:
        return {
          label: 'Stage 3',
          color: 'error' as const,
          description: 'Credit-impaired',
          icon: <Warning />,
        };
      default:
        return {
          label: 'Unknown',
          color: 'default' as const,
          description: 'Unknown stage',
          icon: <Schedule />,
        };
    }
  };

  // ✅ Format currency
  const formatCurrency = (amount: number, currency: CurrencyCode) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // ✅ Calculate trend direction
  const calculateTrend = () => {
    if (sampleTrendData.length < 2) return 0;
    const current = sampleTrendData[sampleTrendData.length - 1].ecl;
    const previous = sampleTrendData[sampleTrendData.length - 2].ecl;
    return ((current - previous) / previous) * 100;
  };

  const trendPercent = calculateTrend();
  const stageInfo = getStageInfo(calculationData.stage);

  return (
    <Card sx={{ height: 'auto', minHeight: '320px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {isCalculating && (
        <LinearProgress 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            zIndex: 1 
          }} 
        />
      )}
      
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Calculate color="primary" />
              ECL Calculation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Account: {calculationData.accountId}
            </Typography>
          </Box>
          
          {showActions && (
            <Box>
              <IconButton 
                size="small" 
                onClick={handleMenuClick}
                disabled={isCalculating}
              >
                <MoreVert />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* ECL Amount */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
            {formatCurrency(calculationData.eclAmount, calculationData.currency)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Expected Credit Loss
          </Typography>
        </Box>

        {/* Stage Classification */}
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={stageInfo.icon}
            label={stageInfo.label}
            color={stageInfo.color}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            {stageInfo.description}
          </Typography>
        </Box>

        {/* Banking Mode Indicator */}
        {calculationData.bankingMode === 'syariah' && calculationData.syariahCompliant && (
          <Alert severity="success" sx={{ mb: 2, py: 0 }}>
            <Typography variant="caption">
              ✅ Syariah Compliant Calculation
            </Typography>
          </Alert>
        )}

        {variant === 'detailed' && (
          <>
            <Divider sx={{ my: 2 }} />
            
            {/* Detailed Metrics */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  PD Rate
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {(calculationData.pdRate * 100).toFixed(2)}%
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  LGD Rate
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {(calculationData.lgdRate * 100).toFixed(2)}%
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  EAD Amount
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatCurrency(calculationData.eadAmount, calculationData.currency)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Calculation Date
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {calculationData.calculationDate.toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </>
        )}

        {/* Trend Chart */}
        {showTrend && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  ECL Trend (6 months)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {trendPercent > 0 ? (
                    <TrendingUp color="error" fontSize="small" />
                  ) : (
                    <TrendingDown color="success" fontSize="small" />
                  )}
                  <Typography 
                    variant="caption" 
                    color={trendPercent > 0 ? 'error.main' : 'success.main'}
                    fontWeight="medium"
                  >
                    {Math.abs(trendPercent).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
              
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={sampleTrendData}>
                  <Line 
                    type="monotone" 
                    dataKey="ecl" 
                    stroke="#1976d2" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <RechartsTooltip 
                    formatter={(value: any) => [formatCurrency(value, calculationData.currency), 'ECL']}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </>
        )}

        {/* Quick Actions */}
        {variant === 'summary' && showActions && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => onViewDetails?.(accountId)}
              disabled={isCalculating}
            >
              Details
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRecalculate}
              disabled={isCalculating}
            >
              {isCalculating ? 'Calculating...' : 'Recalculate'}
            </Button>
          </Box>
        )}
      </CardContent>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => { onViewDetails?.(accountId); handleMenuClose(); }}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleRecalculate} disabled={isCalculating}>
          <ListItemIcon>
            <Refresh fontSize="small" />
          </ListItemIcon>
          <ListItemText>Recalculate ECL</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => { onExport?.(accountId); handleMenuClose(); }}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export Data</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Assessment fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Analytics</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default ECLCalculationCard;