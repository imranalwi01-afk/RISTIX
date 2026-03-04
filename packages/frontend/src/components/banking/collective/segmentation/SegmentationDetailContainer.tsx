import React from 'react';
import { Dialog, Drawer } from '@mui/material';

type SegmentationDetailContainerVariant = 'modal' | 'drawer';

interface SegmentationDetailContainerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: SegmentationDetailContainerVariant;
  topOffset?: number;
}

export const SegmentationDetailContainer: React.FC<SegmentationDetailContainerProps> = ({
  open,
  onClose,
  children,
  variant = 'modal',
  topOffset = 74
}) => {
  if (variant === 'drawer') {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', md: '80%', lg: '70%' },
            top: `${topOffset}px`,
            height: `calc(100% - ${topOffset}px)`,
          }
        }}
      >
        {children}
      </Drawer>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: '80%', lg: '70%' },
          maxWidth: 'none',
          height: { xs: '100%', md: 'calc(100vh - 64px)' },
          m: { xs: 0, md: 4 },
          borderRadius: { xs: 0, md: 2 },
          overflow: 'hidden',
        }
      }}
    >
      {children}
    </Dialog>
  );
};

