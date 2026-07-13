// packages/frontend/src/app/banking/ifrs9-reports/page.tsx
'use client';

import React, { useState } from 'react';
import {
  Alert,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Divider
} from '@mui/material';
import {
  Assessment as ReportIcon,
  Timeline as TimelineIcon,
  TrendingDown as LossIcon,
  AccountBalance as BalanceIcon,
  SwapHoriz as MovementIcon,
  BarChart as ChartIcon,
  Launch as LaunchIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Can } from '@/components/rbac/Can';

// Import all IFRS 9 report components
import NominativeReport from '../../../components/ifrs9/NominativeReport';
import LifetimePDReport from '../../../components/ifrs9/LifetimePDReport';
import LifetimeLGDReport from '../../../components/ifrs9/LifetimeLGDReport';
import EADModelReport from '../../../components/ifrs9/EADModelReport';
import ECLResultReport from '../../../components/ifrs9/ECLResultReport';
import ECLMovementReport from '../../../components/ifrs9/ECLMovementReport';
import GCAMovementReport from '../../../components/ifrs9/GCAMovementReport';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ifrs9-tabpanel-${index}`}
      aria-labelledby={`ifrs9-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const IFRS9ReportsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const reportCategories = [
    {
      category: 'Account Level Reports',
      description: 'Detailed account-level analysis and portfolio insights',
      reports: [
        {
          id: 'nominative-report',
          title: 'Nominative Report',
          description: 'Detailed account-level IFRS 9 data with comprehensive account information',
          icon: <ReportIcon />,
          color: 'primary',
          features: ['Account Details', 'ECL Calculations', 'Stage Classification', 'Pagination Support'],
          tabIndex: 0
        }
      ]
    },
    {
      category: 'Risk Parameter Reports',
      description: 'PD, LGD, and EAD model outputs and analysis',
      reports: [
        {
          id: 'lifetime-pd',
          title: 'Lifetime PD Reports',
          description: 'Probability of Default with yearly and monthly marginal analysis',
          icon: <TimelineIcon />,
          color: 'primary',
          features: ['Yearly/Monthly PD', 'Pivot Tables', 'Dynamic Columns', 'Trend Analysis'],
          tabIndex: 1
        },
        {
          id: 'lifetime-lgd',
          title: 'Lifetime LGD Report',
          description: 'Loss Given Default with recovery information and risk analysis',
          icon: <LossIcon />,
          color: 'primary',
          features: ['LGD Calculations', 'Recovery Analysis', 'Risk Distribution', 'Charts'],
          tabIndex: 2
        },
        {
          id: 'ead-model',
          title: 'EAD Model Report',
          description: 'Exposure at Default with payment averages and utilization rates',
          icon: <BalanceIcon />,
          color: 'primary',
          features: ['EAD Calculations', 'CCF Analysis', 'Utilization Rates', 'Trend Charts'],
          tabIndex: 3
        }
      ]
    },
    {
      category: 'Portfolio Analysis',
      description: 'Aggregated ECL results and movement analysis',
      reports: [
        {
          id: 'ecl-result',
          title: 'ECL Result Report',
          description: 'Expected Credit Loss results aggregated by segment and stage',
          icon: <ChartIcon />,
          color: 'primary',
          features: ['ECL Aggregation', 'Stage Analysis', 'Segment Breakdown', 'Risk Metrics'],
          tabIndex: 4
        },
        {
          id: 'ecl-movement',
          title: 'ECL Movement Report',
          description: 'ECL movement analysis with provisions, releases, and transfers',
          icon: <MovementIcon />,
          color: 'primary',
          features: ['Movement Analysis', 'Waterfall Charts', 'Provision Tracking', 'Stored Procedures'],
          tabIndex: 5
        },
        {
          id: 'gca-movement',
          title: 'GCA Movement Report',
          description: 'Gross Carrying Amount movement with stage transfer analysis',
          icon: <MovementIcon />,
          color: 'primary',
          features: ['GCA Movement', 'Stage Transfers', 'Risk Migration', 'Growth Analysis'],
          tabIndex: 6
        }
      ]
    }
  ];

  const ReportCard = ({ report }: { report: any }) => (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
      onClick={() => setSelectedTab(report.tabIndex)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              mr: 2,
              width: 48,
              height: 48
            }}
          >
            {report.icon}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              {report.title}
            </Typography>
            <Chip
              size="small"
              label={report.id}
              color="primary"
              variant="outlined"
            />
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTab(report.tabIndex);
            }}
          >
            <LaunchIcon />
          </IconButton>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, minHeight: '40px' }}
        >
          {report.description}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {report.features.map((feature: string, index: number) => (
            <Chip
              key={index}
              size="small"
              label={feature}
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          ))}
        </Box>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTab(report.tabIndex);
          }}
        >
          View Report
        </Button>
        <Can permission={[`banking.reports.ifrs9.${report.id.replace(/-/g, '_')}.export`]}>
          <Button size="small" color="inherit">
            Export
          </Button>
        </Can>
      </CardActions>
    </Card>
  );

  return (
    <Can
      permission={['banking.reports.ifrs9.nominative.view']}
      fallback={<Alert severity="error">You do not have permission to access IFRS 9 Reports.</Alert>}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          IFRS 9 Reports Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Comprehensive IFRS 9 reporting suite with real-time database integration
        </Typography>

        {/* Quick Stats */}
        <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">7</Typography>
                <Typography variant="body2">Report Types</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">Live</Typography>
                <Typography variant="body2">Database Integration</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">Real-time</Typography>
                <Typography variant="body2">Data Processing</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">DS2</Typography>
                <Typography variant="body2">FRS9PRO Database</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Report Categories Overview */}
      {selectedTab === -1 && (
        <Box sx={{ mb: 4 }}>
          {reportCategories.map((category, categoryIndex) => (
            <Box key={categoryIndex} sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                {category.category}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {category.description}
              </Typography>

              <Grid container spacing={3}>
                {category.reports.map((report, reportIndex) => (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={reportIndex}>
                    <ReportCard report={report} />
                  </Grid>
                ))}
              </Grid>

              {categoryIndex < reportCategories.length - 1 && <Divider sx={{ mt: 4 }} />}
            </Box>
          ))}
        </Box>
      )}

      {/* Report Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 'auto',
              textTransform: 'none',
              fontSize: '0.875rem'
            }
          }}
        >
          <Tab label="Nominative Report" icon={<ReportIcon />} iconPosition="start" />
          <Tab label="Lifetime PD" icon={<TimelineIcon />} iconPosition="start" />
          <Tab label="Lifetime LGD" icon={<LossIcon />} iconPosition="start" />
          <Tab label="EAD Model" icon={<BalanceIcon />} iconPosition="start" />
          <Tab label="ECL Result" icon={<ChartIcon />} iconPosition="start" />
          <Tab label="ECL Movement" icon={<MovementIcon />} iconPosition="start" />
          <Tab label="GCA Movement" icon={<MovementIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Report Content */}
      <TabPanel value={selectedTab} index={0}>
        <NominativeReport />
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        <LifetimePDReport />
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        <LifetimeLGDReport />
      </TabPanel>

      <TabPanel value={selectedTab} index={3}>
        <EADModelReport />
      </TabPanel>

      <TabPanel value={selectedTab} index={4}>
        <ECLResultReport />
      </TabPanel>

      <TabPanel value={selectedTab} index={5}>
        <ECLMovementReport />
      </TabPanel>

      <TabPanel value={selectedTab} index={6}>
        <GCAMovementReport />
      </TabPanel>

        {/* Information Panel */}
        <Paper sx={{ mt: 4, p: 3, bgcolor: 'info.light', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InfoIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Database Integration Information</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Database Server:
              </Typography>
              <Typography variant="body2">
                DS2 FRS9PRO (192.168.0.106:5432)
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Data Sources:
              </Typography>
              <Typography variant="body2">
                Live PostgreSQL tables with actual banking data
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Update Frequency:
              </Typography>
              <Typography variant="body2">
                Real-time (no cache, direct database queries)
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Can>
  );
};

export default IFRS9ReportsPage;
