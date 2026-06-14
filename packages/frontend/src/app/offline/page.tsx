'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function OfflinePage() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <WifiOffIcon sx={{ fontSize: 80, color: 'text.secondary' }} />

        <Typography variant="h4" component="h1" fontWeight={700}>
          You are offline
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Some features may be limited while you are disconnected.
          Please check your internet connection and try again.
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<RefreshIcon />}
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    </Container>
  );
}
