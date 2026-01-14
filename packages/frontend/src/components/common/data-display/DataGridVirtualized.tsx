import React from 'react';
import {
  DataGrid,
  DataGridProps,
  GridToolbar,
  GridColDef
} from '@mui/x-data-grid';
import { Box, LinearProgress, Paper } from '@mui/material';

interface DataGridVirtualizedProps extends Omit<DataGridProps, 'rows' | 'columns'> {
  rows: any[];
  columns: GridColDef[];
  loading?: boolean;
  height?: number | string;
  enableExport?: boolean;
}

export const DataGridVirtualized: React.FC<DataGridVirtualizedProps> = ({
  rows,
  columns,
  loading = false,
  height = 600,
  enableExport = true,
  ...props
}) => {
  return (
    <Paper
      elevation={2}
      sx={{
        height: height,
        width: '100%',
        '& .MuiDataGrid-cell:focus': {
          outline: 'none',
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        slots={{
          toolbar: enableExport ? GridToolbar : undefined,
          loadingOverlay: () => (
            <Box sx={{ position: 'absolute', top: 0, width: '100%' }}>
              <LinearProgress />
            </Box>
          ),
        }}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 25 },
          },
        }}
        pageSizeOptions={[25, 50, 100]}
        disableRowSelectionOnClick
        density="compact"
        {...props}
      />
    </Paper>
  );
};
