'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, MenuItem, Chip, Divider } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { ConfirmModal } from '@/components/common/feedback/ConfirmModal';

export default function ECLConfigPageV2() {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    
    const handleRunClick = () => {
        setIsConfirmOpen(true);
    };

    const handleConfirmRun = () => {
        setIsConfirmOpen(false);
        alert('ECL Calculation Job Initiated! (ID: JOB-9923)');
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                 <Typography variant="h4">ECL Process Configuration (v2)</Typography>
                 <Chip label="Engine Status: IDLE" color="success" variant="outlined" />
            </Box>
            
            <Grid container spacing={3}>
                {/* Configuration Panel */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Run Configuration</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Run Name" defaultValue="ECL Period Jan 2026" />
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Divider textAlign="left">Model Selection</Divider>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField select fullWidth label="Active PD Model" defaultValue="1">
                                    <MenuItem value="1">Retail Consumer PD 2026</MenuItem>
                                    <MenuItem value="2">Corporate PD V2</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField select fullWidth label="Active LGD Model" defaultValue="1">
                                    <MenuItem value="1">Standard LGD 2026</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField select fullWidth label="Active EAD Model" defaultValue="1">
                                    <MenuItem value="1">CCF Standard 2026</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Status & Action Panel */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box>
                             <Typography variant="h6" gutterBottom>Action Panel</Typography>
                             <Typography variant="body2" paragraph>
                                 The ECL process will calculate expected losses for <strong>5,420</strong> accounts using the selected models.
                             </Typography>
                             <Typography variant="body2" color="warning.main">
                                 Est. Runtime: 15-20 Minutes
                             </Typography>
                        </Box>
                        
                        <Button 
                            variant="contained" 
                            color="error" 
                            size="large" 
                            endIcon={<PlayArrowIcon />}
                            onClick={handleRunClick}
                            sx={{ mt: 3 }}
                        >
                            RUN CALCULATOR
                        </Button>
                    </Paper>
                </Grid>
            </Grid>

            {/* Confirmation Modal */}
            <ConfirmModal
                open={isConfirmOpen}
                title="Start ECL Calculation?"
                message="This will initiate a computationally intensive process. Ensure all model inputs are final. Do you want to proceed?"
                confirmLabel="Yes, Start Process"
                onConfirm={handleConfirmRun}
                onCancel={() => setIsConfirmOpen(false)}
                severity="danger"
            />
        </Box>
    );
}
