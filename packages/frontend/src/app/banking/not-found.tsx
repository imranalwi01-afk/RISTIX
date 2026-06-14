'use client'

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
        p: 4,
        textAlign: 'center',
      }}
    >
      <Typography variant="h3" fontWeight={700} color="text.secondary">
        404
      </Typography>
      <Typography variant="h5" fontWeight={600}>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
        The page you are looking for doesn&apos;t exist in the Banking section.
      </Typography>
      <Button
        component={Link}
        href="/banking/dashboard"
        variant="contained"
        sx={{ mt: 2 }}
      >
        Back to Dashboard
      </Button>
    </Box>
  );
}
