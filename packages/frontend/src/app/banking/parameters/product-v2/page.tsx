'use client';

import React from 'react';
import { Box, Typography, Paper, Grid, Button, TextField, FormControlLabel, Checkbox, Switch } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { LookupSelect } from '@/components/common/forms/LookupSelect';

export default function ProductParameterPageV2() {
  const { control, handleSubmit, register, formState: { errors } } = useForm();

  const onSubmit = (data: any) => {
    alert('Product Parameter Saved: ' + JSON.stringify(data));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Product Parameter Setup (v2)</Typography>
      <Paper sx={{ p: 4, mt: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* 1. Basic Info */}
            <Grid item xs={12} md={6}>
               <TextField 
                  fullWidth size="small" label="Product Code" 
                  {...register('productCode', { required: 'Required' })} 
                  error={!!errors.productCode}
                  helperText={errors.productCode?.message as string}
               />
            </Grid>
            <Grid item xs={12} md={6}>
               <TextField fullWidth size="small" label="Product Name" {...register('productName')} />
            </Grid>

            {/* 2. Dropdowns (B0001, B0002, B0003) */}
            <Grid item xs={12} md={4}>
               <LookupSelect 
                  name="currency" control={control} categoryCode="B0003" label="Currency (B0003)" 
               />
            </Grid>
            <Grid item xs={12} md={4}>
               {/* As per instruction B0002 is Amortization Type for Product context */}
               <LookupSelect 
                  name="amortizationType" control={control} categoryCode="B0002" label="Amortization Type (B0002)" 
               />
            </Grid>
            <Grid item xs={12} md={4}>
               {/* Reusing B0001 or similar for Segment/Class if needed, using B0001 for now as placeholder for 'Instrument Class' if distinct */}
               <LookupSelect 
                  name="instrumentClass" control={control} categoryCode="B0001" label="Instrument Class (e.g. B0001)" 
               />
            </Grid>

            {/* 3. Numeric Fields */}
            <Grid item xs={12} md={6}>
              <TextField 
                type="number" fullWidth size="small" label="Interest Rate (%)" 
                {...register('interestRate')} 
              />
            </Grid>
             <Grid item xs={12} md={6}>
              <TextField 
                type="number" fullWidth size="small" label="Max Tenure (Months)" 
                {...register('maxTenure')} 
              />
            </Grid>

            {/* 4. Flags */}
            <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Configuration Flags</Typography>
                <Grid container>
                    <Grid item xs={4}>
                         <FormControlLabel control={<Switch {...register('isActive')} defaultChecked />} label="Active Product" />
                    </Grid>
                    <Grid item xs={4}>
                         <FormControlLabel control={<Checkbox {...register('allowEarlySettlement')} />} label="Allow Early Settlement" />
                    </Grid>
                    <Grid item xs={4}>
                         <FormControlLabel control={<Checkbox {...register('requiresCollateral')} />} label="Requires Collateral" />
                    </Grid>
                </Grid>
            </Grid>

            <Grid item xs={12}>
               <Button type="submit" variant="contained" size="large" sx={{ mt: 2 }}>Create Product Parameter</Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
