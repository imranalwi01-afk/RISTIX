'use client';

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { DataGridVirtualized } from '@/components/common/data-display/DataGridVirtualized';

export default function ECLResultPageV2() {
  // 1. Define Columns
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'accountNo', headerName: 'Account No', width: 150 },
    { field: 'customerName', headerName: 'Customer Name', width: 200 },
    { field: 'segment', headerName: 'Segment', width: 130 },
    { field: 'stage', headerName: 'Stage', width: 100, 
      renderCell: (params) => {
        const color = params.value === 'Stage 3' ? 'red' : params.value === 'Stage 2' ? 'orange' : 'green';
        return <span style={{ color, fontWeight: 'bold' }}>{params.value}</span>;
      }
    },
    { field: 'pd', headerName: 'PD (%)', type: 'number', width: 110, valueFormatter: (params) => `${(params.value * 100).toFixed(2)}%` as any },
    { field: 'lgd', headerName: 'LGD (%)', type: 'number', width: 110, valueFormatter: (params) => `${(params.value * 100).toFixed(2)}%` as any },
    { field: 'ead', headerName: 'EAD', type: 'number', width: 150, valueFormatter: (params) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(params.value as any) as any },
    { field: 'ecl', headerName: 'ECL Amount', type: 'number', width: 150, valueFormatter: (params) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(params.value as any) as any },
  ];

  // 2. Generate Mock Data (Large Dataset)
  const rows = useMemo(() => {
    const data = [];
    for (let i = 1; i <= 500; i++) {
        const stageRandom = Math.random();
        let stage = 'Stage 1';
        if (stageRandom > 0.8) stage = 'Stage 2';
        if (stageRandom > 0.95) stage = 'Stage 3';

        const ead = Math.floor(Math.random() * 1000000) + 10000;
        const pd = Math.random() * 0.1; // 0-10%
        const lgd = 0.45;
        const ecl = ead * pd * lgd;

        data.push({
            id: i,
            accountNo: `ACCT-${10000 + i}`,
            customerName: `Customer ${i} Ltd`,
            segment: i % 2 === 0 ? 'Corporate' : 'Retail',
            stage,
            pd,
            lgd,
            ead,
            ecl
        });
    }
    return data;
  }, []);

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 100px)' }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <Typography variant="h4">ECL Calculation Results (v2)</Typography>
                <Typography variant="body2" color="text.secondary">
                    Virtualized Data Grid showing {rows.length} records.
                </Typography>
            </div>
        </Box>
        
        <DataGridVirtualized
            rows={rows}
            columns={columns}
            height="100%"
            loading={false}
        />
    </Box>
  );
}
