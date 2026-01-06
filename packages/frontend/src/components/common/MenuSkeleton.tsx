import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Skeleton } from '@mui/material';

export const MenuSkeleton = () => {
  // Create an array of 5 items to mimic the menu structure
  const items = Array.from(new Array(6));

  return (
    <List sx={{ p: 1 }}>
      {items.map((_, index) => (
        <ListItem key={index} disablePadding sx={{ mb: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%', 
            px: 2, 
            py: 1 
          }}>
            {/* Icon Skeleton */}
            <Skeleton 
              variant="circular" 
              width={24} 
              height={24} 
              sx={{ mr: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }} 
            />
            
            {/* Text Skeleton */}
            <Box sx={{ flex: 1 }}>
              <Skeleton 
                variant="text" 
                width="60%" 
                height={20} 
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} 
              />
              {index % 2 === 0 && (
                <Skeleton 
                  variant="text" 
                  width="40%" 
                  height={12} 
                  sx={{ mt: 0.5, bgcolor: 'rgba(255, 255, 255, 0.05)' }} 
                />
              )}
            </Box>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};
