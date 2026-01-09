'use client';
// Force update
import React, { useMemo, useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Alert, Snackbar } from '@mui/material';
import { GridColDef, GridRowModel } from '@mui/x-data-grid';
import { DataGridVirtualized } from '@/components/common/data-display/DataGridVirtualized';
import { useForm } from 'react-hook-form';
import { LookupSelect } from '@/components/common/forms/LookupSelect';
import { api } from '@/services/api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';

export default function ApplicationSettingPageV2() {
  const { control } = useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
      open: false, message: '', severity: 'success'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.banking.applicationSetup.getAll();
      const data = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
      setRows(data.map((item: any, index: number) => ({
        id: item.pkid || item.id || index, 
        paramCode: item.param_code,
        paramName: item.param_name,
        value: item.param_value,
        description: item.description,
        lastUpdated: item.updated_date || item.created_date
      })));
    } catch (error: any) {
      console.error('Failed to fetch application settings:', error);
      setSnackbar({ open: true, message: 'Failed to load settings', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);
  
  // Handle Inline Edit
  const processRowUpdate = async (newRow: GridRowModel) => {
      try {
          // Assuming paramCode is the key for update
          await api.banking.applicationSetup.update(newRow.paramCode, {
              param_value: newRow.value,
              // Add other fields if necessary
          });
          setSnackbar({ open: true, message: `Updated ${newRow.paramName}`, severity: 'success' });
          return newRow;
      } catch (error) {
          setSnackbar({ open: true, message: 'Failed to update setting', severity: 'error' });
          throw error;
      }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'paramCode', headerName: 'Param Code', width: 150 },
    { field: 'paramName', headerName: 'Parameter Name', width: 250 },
    { field: 'value', headerName: 'Value', width: 200, editable: true }, // Editable
    { field: 'description', headerName: 'Description', width: 300 },
    { field: 'lastUpdated', headerName: 'Last Updated', width: 150 },
  ];

  return (
    <Box sx={{ p: 3, position: 'relative' }}>
        <FullstackIndicator />
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <Typography variant="h4">Application Settings (v2)</Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage global system configurations.
                </Typography>
            </div>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={() => setRefreshKey(prev => prev + 1)}>Refresh</Button>
            </Box>
        </Box>

        {/* Global Filter Section - Sprint 1 Requirement (Dropdown) */}
        <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Filter Settings</Typography>
            <Box sx={{ maxWidth: 300 }}>
                 <LookupSelect 
                    name="filterCategory"
                    control={control} 
                    label="Filter by Category"
                    categoryCode="B0001" 
                 />
            </Box>
        </Paper>
        
        <Paper sx={{ height: 400, width: '100%' }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <DataGridVirtualized
                    rows={rows}
                    columns={columns}
                    height={400}
                    processRowUpdate={processRowUpdate}
                    onProcessRowUpdateError={(error) => console.error(error)}
                />
            )}
        </Paper>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
    </Box>
  );
}
