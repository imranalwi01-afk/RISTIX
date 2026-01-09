'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, CircularProgress, Alert, Snackbar } from '@mui/material';
import { DataGridVirtualized } from '@/components/common/data-display/DataGridVirtualized';
import { GridColDef, GridRowParams } from '@mui/x-data-grid';
import { api } from '@/services/api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';

export default function BucketPageV2() {
    // 1. State Definitions
    const [loadingHeaders, setLoadingHeaders] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [masterRows, setMasterRows] = useState<any[]>([]);
    const [detailRows, setDetailRows] = useState<any[]>([]);
    const [selectedHeaderId, setSelectedHeaderId] = useState<number | null>(null);
    const [selectedHeaderName, setSelectedHeaderName] = useState<string>('');
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success'
    });

    // 2. Fetch Logic
    const fetchHeaders = async () => {
        setLoadingHeaders(true);
        try {
            const response = await api.banking.bucket.getAll();
            const data = Array.isArray(response.data) ? response.data : [];
            setMasterRows(data.map((item: any) => ({
                id: item.id,
                schemeName: item.bucket_group,
                description: item.bucket_group_desc,
                basis: item.basis,
                totalBuckets: 'N/A' // Need extra call or count from details usually
            })));
        } catch (error) {
            console.error('Failed to fetch bucket headers:', error);
            setSnackbar({ open: true, message: 'Failed to load schemes', severity: 'error' });
        } finally {
            setLoadingHeaders(false);
        }
    };

    const fetchDetails = async (headerId: number) => {
        setLoadingDetails(true);
        try {
            const response = await api.banking.bucket.getDetails(headerId);
            const data = Array.isArray(response.data) ? response.data : [];
            setDetailRows(data.map((item: any) => ({
                id: item.id,
                bucketId: item.seq, // Using seq/bucketId for display
                bucketName: item.bucket_name,
                minDays: item.range_start,
                maxDays: item.range_end
            })));
        } catch (error) {
            console.error('Failed to fetch bucket details:', error);
            setSnackbar({ open: true, message: 'Failed to load details', severity: 'error' });
        } finally {
            setLoadingDetails(false);
        }
    };

    // 3. Effects
    useEffect(() => {
        fetchHeaders();
    }, []);

    // 4. Handlers
    const handleMasterRowClick = (params: GridRowParams) => {
        setSelectedHeaderId(Number(params.id));
        setSelectedHeaderName(params.row.schemeName);
        fetchDetails(Number(params.id));
    };

    const processDetailUpdate = async (newRow: any) => {
        try {
            await api.banking.bucket.updateDetail(newRow.id, {
                bucket_name: newRow.bucketName,
                range_start: newRow.minDays,
                range_end: newRow.maxDays,
                seq: Number(newRow.bucketId)
            });
            setSnackbar({ open: true, message: 'Range updated', severity: 'success' });
            return newRow;
        } catch (error) {
            setSnackbar({ open: true, message: 'Update failed', severity: 'error' });
            throw error;
        }
    };

    // 5. Column Definitions
    const masterColumns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'schemeName', headerName: 'Bucket Scheme Name', width: 250 },
        { field: 'description', headerName: 'Description', width: 300 },
        { field: 'basis', headerName: 'Basis', width: 100 },
    ];

    const detailColumns: GridColDef[] = [
        { field: 'bucketId', headerName: 'Seq', width: 100 },
        { field: 'bucketName', headerName: 'Name', width: 200, editable: true },
        { field: 'minDays', headerName: 'Min DPD', width: 120, type: 'number', editable: true },
        { field: 'maxDays', headerName: 'Max DPD', width: 120, type: 'number', editable: true },
    ];

    // 6. Render
    return (
        <Box sx={{ p: 3, position: 'relative' }}>
            <FullstackIndicator />
            <Typography variant="h4" gutterBottom>Bucket Management (v2)</Typography>

            <Grid container spacing={3}>
                {/* Top: Scheme Master */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">Bucket Schemes</Typography>
                            <Button variant="contained" size="small">New Scheme</Button>
                        </Box>
                        {loadingHeaders ? (
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} /></Box>
                        ) : (
                            <DataGridVirtualized 
                                rows={masterRows} 
                                columns={masterColumns} 
                                height={250} 
                                onRowClick={handleMasterRowClick}
                            />
                        )}
                    </Paper>
                </Grid>

                {/* Bottom: Bucket Ranges Detail */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">
                                {selectedHeaderId ? `Ranges for: ${selectedHeaderName}` : 'Select a scheme to view ranges'}
                            </Typography>
                            <Button variant="outlined" size="small" disabled={!selectedHeaderId}>Add Range Row</Button>
                        </Box>
                        
                        {loadingDetails ? (
                             <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} /></Box>
                        ) : (
                            <DataGridVirtualized 
                                rows={detailRows} 
                                columns={detailColumns} 
                                height={300} 
                                processRowUpdate={processDetailUpdate}
                            />
                        )}
                        
                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <Typography variant="caption" color="warning.main">
                                * Ensure Ranges do not overlap. Max DPD of one must be less than Min DPD of next.
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}
