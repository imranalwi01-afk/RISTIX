import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';

// 🎨 Animations
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { opacity: 0.6; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0.6; transform: scale(0.95); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

interface ModernLoaderProps {
  open: boolean;
  message?: string;
  subMessage?: string;
}

const ModernLoader: React.FC<ModernLoaderProps> = ({ 
  open, 
  message = "Processing Securely",
  subMessage = "Please wait while we verify your credentials..."
}) => {
  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'absolute', // Absolute relative to the container (e.g., login form)
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(255, 255, 255, 0.6)', // Light glass base
        transition: 'all 0.3s ease-in-out',
        borderRadius: 2
      }}
    >
      {/* 🔮 Animated Ring Container */}
      <Box sx={{ position: 'relative', width: 80, height: 80, mb: 4 }}>
        
        {/* Outer Highlight Ring */}
        <Box 
          sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#1976d2', // Primary Blue
            borderLeftColor: '#64B5F6', // Lighter Blue
            animation: `${spin} 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite`
          }}
        />

        {/* Inner Counter-Spin Ring */}
        <Box 
          sx={{
            position: 'absolute',
            top: 6, left: 6, right: 6, bottom: 6,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderBottomColor: '#0D47A1', // Dark Blue
            borderRightColor: '#42A5F5',
            animation: `${spin} 2s linear infinite reverse`,
            opacity: 0.8
          }}
        />

        {/* Pulsing Core */}
        <Box
          sx={{
            position: 'absolute',
            top: '25%', left: '25%', right: '25%', bottom: '25%',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1976d2 0%, #0D47A1 100%)',
            boxShadow: '0 0 20px rgba(25, 118, 210, 0.4)',
            animation: `${pulse} 2s ease-in-out infinite`
          }}
        />
      </Box>

      {/* 📝 Loading Text */}
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 700, 
          color: '#1A2027',
          mb: 1,
          letterSpacing: 0.5
        }}
      >
        {message}
      </Typography>

      <Typography 
        variant="body2" 
        sx={{ 
          color: '#64748B',
          textAlign: 'center',
          maxWidth: '80%',
          fontWeight: 500,
          background: 'linear-gradient(90deg, #64748B 0%, #94A3B8 50%, #64748B 100%)',
          backgroundSize: '200% auto',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          animation: `${shimmer} 3s linear infinite`,
          WebkitBackgroundClip: 'text', // Essential for text gradient
          WebkitTextFillColor: 'transparent',
        }}
      >
        {subMessage}
      </Typography>
    </Box>
  );
};

export default ModernLoader;
