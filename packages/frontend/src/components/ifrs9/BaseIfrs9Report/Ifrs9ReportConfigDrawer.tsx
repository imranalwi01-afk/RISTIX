// Ifrs9ReportConfigDrawer.tsx – Side drawer showing analysis configuration details
'use client';
import React from 'react';
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import { alpha } from '@mui/material/styles'
import ClearIcon from '@mui/icons-material/ClearAll'
import type { ReportFilters, ThemeStyles } from './types'

interface Ifrs9ReportConfigDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: ReportFilters;
  themeStyles: ThemeStyles;
}

const Ifrs9ReportConfigDrawer: React.FC<Ifrs9ReportConfigDrawerProps> = ({
  open,
  onClose,
  filters,
  themeStyles,
}) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={onClose}
    PaperProps={{ sx: { width: 400, p: 3 } }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6" fontWeight={800} sx={{ flexGrow: 1 }}>
        Analysis Configuration
      </Typography>
      <IconButton onClick={onClose}>
        <ClearIcon />
      </IconButton>
    </Box>
    <Divider sx={{ mb: 3 }} />

    <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom>
      EXECUTION PARAMETERS
    </Typography>
    <List dense>
      <ListItem>
        <ListItemText
          primary="LGD Method"
          secondary={filters.lgd_method === 1 ? 'Workout (Recovery Curve)' : filters.lgd_method === 2 ? 'Collateral/Model-Based' : 'Hybrid/Selected'}
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary="Processing Date"
          secondary={filters.prc_date?.toLocaleDateString() || 'N/A'}
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary="Model Version"
          secondary={`LGD Model v1.2 (ID: ${filters.model_id || 'DEFAULT'})`}
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary="Forward Looking"
          secondary={filters.fl_flag ? 'ENABLED' : 'DISABLED'}
        />
      </ListItem>
    </List>

    <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mt: 3 }} gutterBottom>
      RECOVERY ASSUMPTIONS
    </Typography>
    <List dense>
      <ListItem>
        <ListItemText primary="Discount Horizon" secondary="Lifetime (to legal maturity)" />
      </ListItem>
      <ListItem>
        <ListItemText primary="Indirect Costs" secondary="3.5% of Recovery PV" />
      </ListItem>
      <ListItem>
        <ListItemText primary="Cure Rate Assumption" secondary="Model-derived (24 months)" />
      </ListItem>
    </List>

    <Box sx={{ mt: 'auto', p: 2, bgcolor: alpha(themeStyles.primary, 0.05), borderRadius: 2 }}>
      <Typography variant="caption" color="text.secondary">
        Configurations are read-only in this view. To modify global parameters, please go to <b>LGD Setup</b>.
      </Typography>
    </Box>
  </Drawer>
);

export default React.memo(Ifrs9ReportConfigDrawer);
