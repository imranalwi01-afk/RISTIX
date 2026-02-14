'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Button,
  Stack,
  Chip
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon, Drafts as DraftIcon } from '@mui/icons-material';

import OverviewTab from './OverviewTab';
import RulesTab from './RulesTab';
import ApprovalHistoryTab from './ApprovalHistoryTab';

interface SegmentationDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'add' | 'edit' | 'view';
  initialData?: any;
  
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
      style={{ height: '500px', overflowY: 'auto' }}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function SegmentationDialog({ 
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
}: SegmentationDialogProps) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getTitle = () => {
    switch (mode) {
      case 'add': return 'Add New Segmentation';
      case 'edit': return 'Edit Segmentation';
      case 'view': return 'View Segmentation Details';
      default: return 'Segmentation';
    }
  };

  const readOnly = mode === 'view';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
          sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6" fontWeight="bold">
                {getTitle()}
            </Typography>
            {initialData?.status && (
                <Chip label={initialData.status} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }} />
            )}
        </Stack>
        <IconButton onClick={onClose} sx={{ color: 'primary.contrastText' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8f9fa' }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 2 }}>
          <Tab label="1. General Overview" />
          <Tab label="2. Segmentation Rules" />
          <Tab label="3. History" />
        </Tabs>
      </Box>

      <DialogContent dividers sx={{ p: 0 }}>
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
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa' }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        {!readOnly && (
           <>
              <Button variant="outlined" startIcon={<DraftIcon />} onClick={() => onSaveHeader(true)}>
                Save Draft
              </Button>
              <Button variant="contained" startIcon={<SaveIcon />} color="primary" onClick={() => onSaveHeader(false)} sx={{ px: 3 }}>
                {mode === 'add' ? 'Create' : 'Submit Changes'}
              </Button>
           </>
        )}
      </DialogActions>
    </Dialog>
  );
}
