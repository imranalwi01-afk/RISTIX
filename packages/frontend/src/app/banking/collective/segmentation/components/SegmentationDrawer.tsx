
import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Button,
  Stack,
  Divider,
  Chip
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon, Drafts as DraftIcon } from '@mui/icons-material';

import OverviewTab from './OverviewTab';
import RulesTab from './RulesTab';
import ApprovalHistoryTab from './ApprovalHistoryTab';

interface SegmentationDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: 'add' | 'edit' | 'view';
  initialData?: any;
  
  // Data & Acts
  formData: any;
  setFormData: (data: any) => void;
  rules: any[];
  onRulesChange: (rules: any[]) => void;
  
  onSaveHeader: (isDraft: boolean) => void;
  
  history: any[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`segmentation-tabpanel-${index}`}
      aria-labelledby={`segmentation-tab-${index}`}
      {...other}
      style={{ height: '100%', overflowY: 'auto' }}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function SegmentationDrawer({ 
  open, 
  onClose, 
  mode, 
  initialData,
  formData,
  setFormData,
  rules,
  onRulesChange,
  onSaveHeader,
  history
}: SegmentationDrawerProps) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getDrawerTitle = () => {
    switch (mode) {
      case 'add': return 'Add New Segmentation';
      case 'edit': return 'Edit Segmentation';
      case 'view': return 'View Segmentation Details';
      default: return 'Segmentation';
    }
  };

  const readOnly = mode === 'view';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 100 }} // Ensure it's on top of everything
      PaperProps={{
        sx: { 
            width: { xs: '100%', md: 840 },
            display: 'flex',
            flexDirection: 'column'
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            bgcolor: 'background.paper', // Ensure solid background
            position: 'sticky',
            top: 0,
            zIndex: 1
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              {getDrawerTitle()}
            </Typography>
            {mode === 'view' && initialData?.status && (
               <Chip label={initialData.status} size="small" color={initialData.status === 'Active' ? 'success' : 'default'} />
            )}
          </Stack>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="segmentation tabs">
            <Tab label="Overview" />
            <Tab label="Rules" />
            <Tab label="Approval History" />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <CustomTabPanel value={tabValue} index={0}>
             <OverviewTab 
                formData={formData} 
                setFormData={setFormData} 
                readOnly={readOnly} 
             />
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={1}>
             <RulesTab 
                rules={rules} 
                onChangeRules={onRulesChange}
                readOnly={readOnly}
             />
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={2}>
             <ApprovalHistoryTab history={history} />
          </CustomTabPanel>
        </Box>

        {/* Footer Actions */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          {!readOnly && (
             <>
                <Button variant="outlined" startIcon={<DraftIcon />} onClick={() => onSaveHeader(true)}>
                  Save Draft
                </Button>
                <Button variant="contained" startIcon={<SaveIcon />} color="primary" onClick={() => onSaveHeader(false)}>
                  Submit
                </Button>
             </>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
