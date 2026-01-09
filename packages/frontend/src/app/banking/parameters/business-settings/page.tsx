'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Button, Snackbar, Alert, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { LookupSelect } from '@/components/common/forms/LookupSelect';
import { api } from '@/services/api';
import { GridColDef, GridRowModel } from '@mui/x-data-grid';
import { DataGridVirtualized } from '@/components/common/data-display/DataGridVirtualized';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';

// Mapping form keys to their Parameter Codes
const PARAM_MAPPING: Record<string, string> = {
  businessModel: 'B0001',
  productType: 'B0002',
  currency: 'B0003',
  segment: 'B0004'
};

const PARAM_NAMES: Record<string, string> = {
  businessModel: 'Business Model',
  productType: 'Product Type',
  currency: 'Currency',
  segment: 'Region / Segment'
};

export default function BusinessParametersPageV2() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success'
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      businessModel: '',
      productType: '',
      currency: '',
      segment: ''
    }
  });

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const promises = Object.keys(data).map(async (key) => {
        const paramCode = PARAM_MAPPING[key];
        const value = data[key];
        const paramName = PARAM_NAMES[key] || key;
        
        if (paramCode && value) {
          // UPSERT LOGIC: Try to update, if 404 then create
          try {
            // Using 'paramUsage' to store the value as per legacy schema constraints
            await api.banking.businessSetup.update(paramCode, {
              paramUsage: value, 
              paramName: paramName
            });
          } catch (error: any) {
            // If not found (404), create it
            if (error.response?.status === 404 || error.message?.includes('404')) {
               await api.banking.businessSetup.create({
                 paramCode,
                 paramName,
                 paramUsage: value,
                 paramType: 'B'
               });
            } else {
              throw error; // Re-throw other errors
            }
          }
        }
      });

      await Promise.all(promises);
      
      setFeedback({ open: true, message: 'Configuration saved successfully!', severity: 'success' });
      setRefreshTrigger(prev => prev + 1); // Refresh the grid
    } catch (error) {
      console.error('Save error:', error);
      setFeedback({ open: true, message: 'Failed to save configuration. Please try again.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3, position: 'relative' }}>
      <FullstackIndicator />
      <Snackbar 
        open={feedback.open} 
        autoHideDuration={6000} 
        onClose={() => setFeedback({ ...feedback, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={feedback.severity} onClose={() => setFeedback({ ...feedback, open: false })}>
          {feedback.message}
        </Alert>
      </Snackbar>

      <Typography variant="h4" gutterBottom>
        Business Parameters Configuration (v2)
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Configure global business settings using the standardized lookup system.
      </Typography>

      <Paper sx={{ p: 4, mt: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <LookupSelect
                name="businessModel"
                control={control}
                label="Business Model (B0001)"
                categoryCode="B0001"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LookupSelect
                name="productType"
                control={control}
                label="Product Type (B0002)"
                categoryCode="B0002"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LookupSelect
                name="currency"
                control={control}
                label="Currency (B0003)"
                categoryCode="B0003"
              />
            </Grid>
             <Grid item xs={12} md={6}>
              <LookupSelect
                name="segment"
                control={control}
                label="Region / Segment (B0004)"
                categoryCode="B0004"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button variant="outlined" color="secondary">
                  Reset Defaults
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Configuration'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper sx={{ p: 4, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Detailed Business Settings (Grid)</Typography>
        <BusinessSettingGrid refreshTrigger={refreshTrigger} />
      </Paper>
    </Box>
  );
}

function BusinessSettingGrid({ refreshTrigger }: { refreshTrigger: number }) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
      open: false, message: '', severity: 'success'
  });

  const fetchData = async () => {
      setLoading(true);
      try {
          const response = await api.banking.businessSetup.getAll();
          const data = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
          
          console.log('✅ Grid Data Received:', data);

          setRows(data.map((item: any, index: number) => ({
             id: item.pkid || item.id || index,
             // Fix: Map from backend properties (camelCase or whatever Drizzle returns)
             code: item.paramCode || item.param_code, 
             category: item.paramName || item.param_name, 
             // Fix: Map value from paramUsage (or fallback)
             value: item.paramUsage || item.param_usage || item.paramValue || item.param_value || '',
             validFrom: item.createddate || item.createdDate || item.created_date
          })));
      } catch (err: any) {
          setError('Failed to load business settings');
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  React.useEffect(() => {
      fetchData();
  }, [refreshTrigger]);

  const processRowUpdate = async (newRow: GridRowModel) => {
    try {
        await api.banking.businessSetup.update(newRow.code, {
            paramUsage: newRow.value, // Update usage as value
        });
        setSnackbar({ open: true, message: `Updated ${newRow.code}`, severity: 'success' });
        return newRow;
    } catch (error) {
        setSnackbar({ open: true, message: 'Failed to update setting', severity: 'error' });
        throw error;
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'code', headerName: 'Code', width: 150 },
    { field: 'category', headerName: 'Parameter Name', width: 250 },
    { field: 'value', headerName: 'Current Value', width: 250, editable: true },
    { field: 'validFrom', headerName: 'Created Date', width: 180 },
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
        <DataGridVirtualized
          rows={rows}
          columns={columns}
          height={300}
          processRowUpdate={processRowUpdate}
        />
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
    </>
  );
}
