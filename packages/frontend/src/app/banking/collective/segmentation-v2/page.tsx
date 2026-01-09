'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Divider } from '@mui/material';
import { DataGridVirtualized } from '@/components/common/data-display/DataGridVirtualized';
import { ConditionBuilder, ConditionRow } from '@/components/common/forms/ConditionBuilder';
import { GridColDef } from '@mui/x-data-grid';

export default function SegmentationPageV2() {
    const [conditions, setConditions] = useState<ConditionRow[]>([]);
    const [segmentName, setSegmentName] = useState('');

    const handleSave = () => {
        alert(`Saved Segment: ${segmentName} with ${conditions.length} conditions.`);
    };

    // Mock Existing Segments
    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Segment Name', width: 200 },
        { field: 'description', headerName: 'Description', width: 300 },
        { field: 'conditions', headerName: 'Criteria Count', width: 150 },
    ];
    const rows = [
        { id: 1, name: 'Retail - Micro', description: 'Small loan amounts < 100M', conditions: 2 },
        { id: 2, name: 'Corporate - Mining', description: 'Mining sector high risk', conditions: 1 },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Segmentation Management (v2)</Typography>
            
            <Grid container spacing={3}>
                {/* Left Panel: List */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>Defined Segments</Typography>
                        <DataGridVirtualized rows={rows} columns={columns} height={500} />
                    </Paper>
                </Grid>

                {/* Right Panel: Editor */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                         <Typography variant="h6" gutterBottom>Segment Editor</Typography>
                         <Divider sx={{ mb: 3 }} />
                         
                         <Grid container spacing={2} sx={{ mb: 3 }}>
                             <Grid item xs={12}>
                                 <TextField 
                                    fullWidth label="Segment Name" 
                                    value={segmentName} onChange={(e) => setSegmentName(e.target.value)}
                                 />
                             </Grid>
                             <Grid item xs={12}>
                                 <TextField fullWidth label="Description" multiline rows={2} />
                             </Grid>
                         </Grid>

                         <Typography variant="subtitle1" gutterBottom>Criteria Builder</Typography>
                         <ConditionBuilder 
                            value={conditions} 
                            onChange={setConditions} 
                         />

                         <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                             <Button variant="outlined">Clear</Button>
                             <Button variant="contained" onClick={handleSave}>Save Segment</Button>
                         </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
