'use client';

import React from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { LookupSelect } from '@/components/common/forms/LookupSelect';
import { FileUploadWithValidation } from '@/components/common/forms/FileUploadWithValidation';
import { DataGridVirtualized } from '@/components/common/data-display/DataGridVirtualized';
import { ConfirmModal } from '@/components/common/feedback/ConfirmModal';

export default function ComponentShowcasePage() {
  const { control } = useForm();
  const [modalOpen, setModalOpen] = React.useState(false);

  // Mock Data for Grid
  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'firstName', headerName: 'First name', width: 150 },
    { field: 'lastName', headerName: 'Last name', width: 150 },
    { field: 'age', headerName: 'Age', type: 'number', width: 110 },
  ];

  const rows = [
    { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
    { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
    { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
    { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
    { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  ];

  const handleConfirm = () => {
    alert('Confirmed action!');
    setModalOpen(false);
  };

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Typography variant="h4" gutterBottom>
        Design System Components Showcase
      </Typography>

      {/* 1. Lookup Select Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          1. Lookup Select (Mock Data)
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <LookupSelect
              name="businessModel"
              control={control}
              label="Business Model (B0001)"
              categoryCode="B0001"
            />
          </Grid>
          <Grid item xs={12} md={4}>
             <LookupSelect
              name="productType"
              control={control}
              label="Product Type (B0002)"
              categoryCode="B0002"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 2. File Upload Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          2. File Upload With Validation
        </Typography>
        <Box sx={{ maxWidth: 600 }}>
          <FileUploadWithValidation
            onFileSelect={(file) => console.log('Selected:', file)}
            maxSizeMB={2}
            accept=".csv, .xlsx"
          />
        </Box>
      </Paper>

      {/* 3. Modal Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          3. Confirm Modal
        </Typography>
        <Button variant="contained" color="error" onClick={() => setModalOpen(true)}>
          Trigger Delete Action
        </Button>
        <ConfirmModal
          open={modalOpen}
          title="Delete Record?"
          message="Are you sure you want to delete this record? This action cannot be undone."
          severity="danger"
          onConfirm={handleConfirm}
          onCancel={() => setModalOpen(false)}
        />
      </Paper>

       {/* 4. Data Grid Section */}
       <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          4. Data Grid Virtualized
        </Typography>
        <DataGridVirtualized
          rows={rows}
          columns={columns}
          height={400}
        />
      </Paper>
    </Box>
  );
}
