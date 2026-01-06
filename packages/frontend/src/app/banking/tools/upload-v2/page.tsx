'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import { FileUploadWithValidation } from '@/components/common/forms/FileUploadWithValidation';
import { ConfirmModal } from '@/components/common/feedback/ConfirmModal';

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
      id={`upload-tabpanel-${index}`}
      aria-labelledby={`upload-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function DataUploadPageV2() {
  const [value, setValue] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleFileSelect = (file: File) => {
    setPendingFile(file);
    setConfirmOpen(true);
  };

  const processUpload = () => {
    // Mock upload process
    alert(`Processing file: ${pendingFile?.name}. Sending to backend...`);
    setConfirmOpen(false);
    setPendingFile(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Data Upload Tools (v2)
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Secure upload portal for DCF (Discounted Cash Flow) and manual data adjustments.
      </Typography>

      <Paper sx={{ width: '100%', mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="upload tabs">
            <Tab label="DCF Data Upload" />
            <Tab label="Manual Override Upload" />
            <Tab label="Master Data Update" />
          </Tabs>
        </Box>
        
        {/* DCF Upload Panel */}
        <CustomTabPanel value={value} index={0}>
          <Typography variant="h6" gutterBottom>Discounted Cash Flow (DCF)</Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Upload the latest cash flow projections. Supported formats: .xlsx, .csv. Max size: 10MB.
          </Typography>
          <Box sx={{ maxWidth: 800 }}>
            <FileUploadWithValidation 
                onFileSelect={handleFileSelect}
                accept=".xlsx,.csv"
                maxSizeMB={10}
            />
          </Box>
        </CustomTabPanel>

        {/* Manual Override Panel */}
        <CustomTabPanel value={value} index={1}>
           <Typography variant="h6" gutterBottom>Manual Data Overrides</Typography>
           <Typography variant="body2" sx={{ mb: 3 }}>
            Upload manual adjustments for specific accounts. Ensure the template version is correct.
           </Typography>
           <Box sx={{ maxWidth: 800 }}>
            <FileUploadWithValidation 
                onFileSelect={handleFileSelect}
                accept=".xlsx"
                maxSizeMB={5}
                label="Drop override file here"
            />
          </Box>
        </CustomTabPanel>

         {/* Master Data Panel */}
         <CustomTabPanel value={value} index={2}>
           <Typography variant="h6" gutterBottom>Master Data Sync</Typography>
           <Typography variant="body2" sx={{ mb: 3 }}>
            Bulk update for customer segments and parameters.
           </Typography>
           <Box sx={{ maxWidth: 800 }}>
            <FileUploadWithValidation 
                onFileSelect={handleFileSelect}
                accept=".csv"
                maxSizeMB={20}
                label="Drop master data CSV"
            />
          </Box>
        </CustomTabPanel>
      </Paper>

      <ConfirmModal
        open={confirmOpen}
        title="Confirm Upload"
        message={`Are you sure you want to upload "${pendingFile?.name}"? This will update the system data.`}
        onConfirm={processUpload}
        onCancel={() => setConfirmOpen(false)}
        confirmLabel="Upload & Process"
      />
    </Box>
  );
}
