// packages/frontend/src/components/banking/shared/BankingModeSelector.tsx
// ============================================================================
// BANKING MODE SELECTOR - DUAL BANKING SUPPORT
// ============================================================================
// File Path: packages/frontend/src/components/banking/shared/BankingModeSelector.tsx
// Purpose: Toggle between Conventional and Syariah banking modes
// Dependencies: Material-UI v6, Redux Toolkit, Configuration Provider
// Features: Theme switching, compliance validation, mode persistence
// ============================================================================

'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  AccountBalance,
  Security,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useBankingTheme } from '../../../providers/BankingThemeProvider';
import { setBankingMode } from '../../../store/slices/bankingSlice';
import { BankingMode } from '../types';

interface BankingModeSelectorProps {
  currentMode?: BankingMode;
  onModeChange?: (mode: BankingMode) => void;
  disabled?: boolean;
  showComplianceInfo?: boolean;
}

const BankingModeSelector: React.FC<BankingModeSelectorProps> = ({
  currentMode,
  onModeChange,
  disabled = false,
  showComplianceInfo = true,
}) => {
  const dispatch = useDispatch();
  const { setTheme, isConventionalTheme, isSyariahTheme } = useBankingTheme();
  
  // ✅ Get current banking mode from Redux store
  const selectedMode = useSelector((state: any) => state.banking?.bankingMode) || currentMode || 'conventional';
  const tenantConfig = useSelector((state: any) => state.configuration?.tenant);
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingMode, setPendingMode] = useState<BankingMode | null>(null);

  // ✅ Handle mode change with confirmation
  const handleModeChange = useCallback((event: React.MouseEvent<HTMLElement>, newMode: BankingMode | null) => {
    if (!newMode || newMode === selectedMode || disabled) return;

    // Show confirmation dialog for mode switch
    setPendingMode(newMode);
    setShowConfirmDialog(true);
  }, [selectedMode, disabled]);

  // ✅ Confirm mode change
  const confirmModeChange = useCallback(() => {
    if (!pendingMode) return;

    // Update Redux store
    dispatch(setBankingMode(pendingMode));
    
    // Update theme
    setTheme(pendingMode);
    
    // Call parent callback
    onModeChange?.(pendingMode);
    
    // Close dialog
    setShowConfirmDialog(false);
    setPendingMode(null);
  }, [pendingMode, dispatch, setTheme, onModeChange]);

  // ✅ Cancel mode change
  const cancelModeChange = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingMode(null);
  }, []);

  // ✅ Mode configurations
  const modeConfigs = {
    conventional: {
      label: 'Conventional Banking',
      icon: <AccountBalance />,
      color: '#1976d2',
      description: 'Traditional banking with interest-based products',
      features: [
        'Interest-based calculations',
        'Traditional loan products',
        'Conventional investments',
        'Standard regulatory compliance'
      ],
      compliance: 'Basel III, IFRS 9, Local Banking Regulations'
    },
    syariah: {
      label: 'Syariah Banking',
      icon: <Security />,
      color: '#2e7d32',
      description: 'Islamic banking compliant with Syariah principles',
      features: [
        'Profit-sharing arrangements',
        'Halal investment screening',
        'Islamic contract structures',
        'DPS board approval workflows'
      ],
      compliance: 'AAOIFI Standards, OJK Islamic Banking, IFRS 9 Syariah'
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalance />
            Banking Mode Selection
          </Typography>

          {/* Mode Toggle */}
          <ToggleButtonGroup
            value={selectedMode}
            exclusive
            onChange={handleModeChange}
            aria-label="banking mode"
            disabled={disabled}
            sx={{ mb: 3, width: '100%' }}
          >
            <ToggleButton 
              value="conventional" 
              aria-label="conventional banking"
              sx={{ 
                flex: 1, 
                py: 2,
                '&.Mui-selected': {
                  backgroundColor: modeConfigs.conventional.color + '20',
                  color: modeConfigs.conventional.color,
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                {modeConfigs.conventional.icon}
                <Typography variant="body2">{modeConfigs.conventional.label}</Typography>
              </Box>
            </ToggleButton>
            
            <ToggleButton 
              value="syariah" 
              aria-label="syariah banking"
              sx={{ 
                flex: 1, 
                py: 2,
                '&.Mui-selected': {
                  backgroundColor: modeConfigs.syariah.color + '20',
                  color: modeConfigs.syariah.color,
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                {modeConfigs.syariah.icon}
                <Typography variant="body2">{modeConfigs.syariah.label}</Typography>
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Current Mode Info */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Current Mode: <strong>{modeConfigs[selectedMode as keyof typeof modeConfigs].label}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {modeConfigs[selectedMode as keyof typeof modeConfigs].description}
            </Typography>
          </Box>

          {/* Compliance Status */}
          {showComplianceInfo && (
            <Box sx={{ mb: 2 }}>
              <Chip
                icon={<CheckCircle />}
                label="Compliance Active"
                color="success"
                variant="outlined"
                size="small"
                sx={{ mr: 1 }}
              />
              {selectedMode === 'syariah' && (
                <Chip
                  icon={<Security />}
                  label="Halal Certified"
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          )}

          {/* Tenant Configuration Status */}
          {tenantConfig && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Tenant supports: {tenantConfig.features?.dual_banking ? 'Dual Banking' : selectedMode === 'syariah' ? 'Syariah Banking Only' : 'Conventional Banking Only'}
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={cancelModeChange}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            Confirm Banking Mode Change
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {pendingMode && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                You are about to switch to <strong>{modeConfigs[pendingMode].label}</strong>. 
                This will change the interface theme and available features.
              </Typography>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>New Mode Features:</strong>
                </Typography>
              </Alert>

              <List dense>
                {modeConfigs[pendingMode].features.map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>

              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Important:</strong> Changing banking mode will update compliance requirements 
                  and may affect ongoing calculations. Ensure all pending processes are completed.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={cancelModeChange} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={confirmModeChange} 
            variant="contained"
            color="primary"
          >
            Confirm Change
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BankingModeSelector;