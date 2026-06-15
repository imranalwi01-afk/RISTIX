'use client';


import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Send as SubmitIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { ApprovalStatusBadge } from '@/components/approval/ApprovalStatusBadge';

// Import Functional Tabs
import { SegmentationDetailsTab } from './SegmentationDetailsTab';
import { SegmentationConditionsTab } from './SegmentationConditionsTab';
import { SegmentationApprovalsTab } from './SegmentationApprovalsTab';

interface Rule {
  id?: string | number;
  query_group: number;
  seq: number;
  table_name: string;
  column_name: string;
  data_type: string;
  operator: string;
  value1: string;
  value2?: string;
  condition: 'AND' | 'OR';
}

interface SegmentationDetailProps {
  mode: 'add' | 'edit' | 'view';
  initialData: any;
  onSubmit: (data: any, isDraft: boolean) => void;
  onClose: () => void;
  history?: any[];
}

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
      id={`segment-tabpanel-${index}`}
      aria-labelledby={`segment-tab-${index}`}
      {...other}
      style={{ height: 'calc(100% - 48px)' }}
    >
      {value === index && (
        <Box sx={{ py: 4, height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const SegmentationDetail: React.FC<SegmentationDetailProps> = ({
  mode,
  initialData,
  onSubmit,
  onClose,
  history = []
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    group_segment: '',
    segment: '',
    sub_segment: '',
    segment_type: 'PD',
    seq: 1,
    active_flag: true,
    description: '',
    ...initialData
  });
  const [rules, setRules] = useState<Rule[]>(initialData?.rules || []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const setFormDataUpdate = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = (isDraft: boolean) => {
    const finalData = {
      ...formData,
      rules: rules
    };
    onSubmit(finalData, isDraft);
  };

  const title = mode === 'add' ? 'New Segmentation' : mode === 'edit' ? 'Edit Segmentation' : 'Segmentation Details';
  const isReadOnly = mode === 'view';

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f1f5f9' }}>
      {/* Detail Header */}
      <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: '1px solid', borderColor: 'divider', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title="Back to List">
                <IconButton onClick={onClose} size="small" sx={{ bgcolor: '#f8fafc', '&:hover': { bgcolor: '#e2e8f0' } }}>
                    <BackIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Box>
                <Typography variant="h5" fontWeight="800" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {title}
                    {formData?.status && (
                        <ApprovalStatusBadge status={formData.status.toLowerCase()} />
                    )}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {formData?.group_segment ? `Binding Authority: ${formData.group_segment}` : 'Master Data Configuration'}
                </Typography>
            </Box>
          </Stack>

          {!isReadOnly && (
            <Stack direction="row" spacing={1.5}>
                <Button 
                    variant="outlined" 
                    startIcon={<SaveIcon />} 
                    onClick={() => handleSubmit(true)}
                    data-testid="save-segmentation-btn"
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3, fontWeight: 'bold' }}
                >
                Save Draft
                </Button>
                <Button 
                    variant="contained" 
                    startIcon={<SubmitIcon />} 
                    onClick={() => handleSubmit(false)}
                    data-testid="submit-segmentation-btn"
                    sx={{ borderRadius: 2, textTransform: 'none', px: 4, fontWeight: 'bold', boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)' }}
                >
                Submit for Approval
                </Button>
            </Stack>
          )}

          {isReadOnly && (
             <IconButton onClick={onClose} size="small">
                <CloseIcon />
             </IconButton>
          )}
        </Stack>
      </Box>

      {/* Tabs Menu */}
      <Box sx={{ px: 3, bgcolor: '#fff', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            sx={{ 
                '& .MuiTab-root': { 
                    textTransform: 'none', 
                    fontWeight: 700, 
                    fontSize: '0.9rem',
                    minWidth: 120,
                    py: 2
                }
            }}
        >
          <Tab label="Header Details" />
          <Tab label="Conditions & Rules" />
          <Tab label="Review & History" />
        </Tabs>
      </Box>

      {/* Scrollable Tab Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: { xs: 2, md: 5 } }}>
        <TabPanel value={tabValue} index={0}>
          <SegmentationDetailsTab 
            formData={formData} 
            setFormData={setFormDataUpdate} 
            readOnly={isReadOnly} 
          />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <SegmentationConditionsTab 
            rules={rules} 
            onRulesChange={setRules} 
            readOnly={isReadOnly} 
          />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <SegmentationApprovalsTab 
            history={history} 
            currentStatus={formData.status || 'Draft'} 
          />
        </TabPanel>
      </Box>
    </Box>
  );
};
