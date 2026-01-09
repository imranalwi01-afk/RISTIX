'use client';

import React from 'react';
import { Box, Typography, Paper, Grid, Button, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { LookupSelect } from '@/components/common/forms/LookupSelect';

export default function JournalParameterPageV2() {
  const { control, handleSubmit, register } = useForm();

  const onSubmit = (data: any) => {
    alert('Journal Parameter Saved: ' + JSON.stringify(data));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Journal Parameter Setup (v2)</Typography>
      <Paper sx={{ p: 4, mt: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
             {/* 1. Basic Info */}
             <Grid item xs={12} md={6}>
               <TextField 
                  fullWidth size="small" label="Rule Name" 
                  {...register('ruleName', { required: true })} 
               />
            </Grid>
             <Grid item xs={12} md={6}>
               <TextField 
                  fullWidth size="small" label="description" 
                  {...register('description')} 
               />
            </Grid>

            {/* 2. Journal Lookups (B0005, B0006, B0007) */}
            <Grid item xs={12} md={4}>
               <LookupSelect 
                  name="journalType" control={control} categoryCode="B0005" label="Journal Type (B0005)" 
               />
            </Grid>
            <Grid item xs={12} md={4}>
               <LookupSelect 
                  name="journalCode" control={control} categoryCode="B0006" label="Journal Code (B0006)" 
               />
            </Grid>
            <Grid item xs={12} md={4}>
               <LookupSelect 
                  name="dbCrFlag" control={control} categoryCode="B0007" label="DB/CR Flag (B0007)" 
               />
            </Grid>

            {/* 3. COA (Text Input) */}
            <Grid item xs={12} md={12}>
               <TextField 
                  fullWidth size="small" label="Chart of Account (COA)" placeholder="e.g. 10-001-999"
                  {...register('coa', { required: true })} 
               />
               <Typography variant="caption" color="text.secondary">Enter the GL account code for this journal rule.</Typography>
            </Grid>

            <Grid item xs={12}>
               <Button type="submit" variant="contained" size="large" sx={{ mt: 2 }}>Save Journal Rule</Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
