'use client';

import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

export default function FLScalarPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Forward Looking (FL) Scalar
      </Typography>
      
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            🚧 Halaman Sedang Dalam Pengembangan 🚧
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Modul perhitungan FL Scalar untuk IFRS 9 sedang disiapkan.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
