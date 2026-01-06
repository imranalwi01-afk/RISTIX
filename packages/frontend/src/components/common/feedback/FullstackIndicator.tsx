import React from 'react';
import { Chip, Tooltip, Zoom } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import CloudDoneIcon from '@mui/icons-material/CloudDone';

interface FullstackIndicatorProps {
  status?: 'active' | 'offline' | 'loading';
  message?: string;
}

export const FullstackIndicator: React.FC<FullstackIndicatorProps> = ({ 
  status = 'active', 
  message = 'Fullstack Wired: Data is synced with PostgreSQL Database' 
}) => {
  return (
    <Tooltip title={message} arrow TransitionComponent={Zoom}>
      <Chip
        icon={<CloudDoneIcon />}
        label="Database Active"
        color="success"
        variant="filled"
        size="small"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          fontWeight: 'bold',
          boxShadow: 3,
          zIndex: 1300,
          opacity: 0.85,
          transition: 'opacity 0.2s',
          '&:hover': {
            opacity: 1
          },
          '& .MuiChip-icon': {
             color: 'white'
          }
        }}
      />
    </Tooltip>
  );
};
