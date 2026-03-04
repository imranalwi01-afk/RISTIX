import React, { useState, useEffect, Fragment } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Drawer,
  Autocomplete,
  Divider,
  Stack,
  Tooltip,
  IconButton,
  CircularProgress,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Info as InfoIcon, Close as CloseIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { productSegmentsApi } from '../../services/api/product-segments.api';
import { pdConfigurationsApi } from '../../services/api/pd-configurations.api';
import { flScalarAPI } from '../../services/api/fl-scalar.api';

interface LifetimePDConfigPanelProps {
  open: boolean;
  onClose: () => void;
  onRun: (config: any) => void;
}

export default function LifetimePDConfigPanel({ open, onClose, onRun }: LifetimePDConfigPanelProps) {
  // Local state for form fields
  const [procDate, setProcDate] = useState<Date | null>(new Date('2022-10-31'));
  const [selectedSegments, setSelectedSegments] = useState<any[]>([]);
  const [pdConfigId, setPdConfigId] = useState('');
  const [pdMethod, setPdMethod] = useState('TTC');
  const [isForwardLooking, setIsForwardLooking] = useState(false);
  const [scalarId, setScalarId] = useState('');

  // Comparison State
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [pdConfigIdB, setPdConfigIdB] = useState('');
  const [pdMethodB, setPdMethodB] = useState('PIT');
  const [scalarIdB, setScalarIdB] = useState('');

  // Metadata states
  const [segments, setSegments] = useState<any[]>([]);
  const [pdConfigs, setPdConfigs] = useState<any[]>([]);
  const [scalars, setScalars] = useState<any[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      setLoadingMetadata(true);
      try {
        const [segData, pdData, scData] = await Promise.all([
          productSegmentsApi.getAll(),
          pdConfigurationsApi.getAll({ is_active: true }),
          flScalarAPI.getAll()
        ]);
        setSegments(segData);
        setPdConfigs(pdData);
        setScalars(scData);
      } catch (err) {
        console.error('Failed to fetch config metadata:', err);
      } finally {
        setLoadingMetadata(false);
      }
    };
    if (open) {
      fetchMetadata();
    }
  }, [open]);

  // Auto-select the first PD Config ID when metadata is loaded and none is selected
  useEffect(() => {
    if (pdConfigs.length > 0 && !pdConfigId) {
      setPdConfigId(pdConfigs[0].id.toString());
    }
  }, [pdConfigs, pdConfigId]);

  const handleRun = () => {
    onRun({
      procDate,
      selectedSegments,
      pdConfigId,
      pdMethod,
      isForwardLooking,
      scalarId,
      // Comparison Data
      isCompareMode,
      pdConfigIdB: isCompareMode ? pdConfigIdB : undefined,
      pdMethodB: isCompareMode ? pdMethodB : undefined,
      scalarIdB: isCompareMode ? scalarIdB : undefined
    });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 400, p: 3 } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          Analysis Configuration
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Stack spacing={3}>
        {/* Processing Date */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Processing Date"
            value={procDate}
            onChange={(newValue: any) => setProcDate(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                helperText: "Tanggal referensi data & kalibrasi",
                required: true,
                error: !procDate
              } as any
            }}
            {...({} as any)}
          />
        </LocalizationProvider>

        {/* Segment ID */}
        <Autocomplete
          multiple
          options={segments.map(s => s.segment || s.groupSegment || s.id?.toString() || '')}
          loading={loadingMetadata}
          value={selectedSegments}
          onChange={(_: any, newValue: any) => setSelectedSegments(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Segment ID"
              placeholder="Select segments"
              helperText="Kosong = semua segmen"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <Fragment>
                    {loadingMetadata ? <CircularProgress color="inherit" size={20} /> : null}
                    {(params.InputProps as any).endAdornment}
                  </Fragment>
                )
              } as any}
            />
          )}
          {...({} as any)}
        />

        <Divider>
          <Chip label="Model Configuration" size="small" />
        </Divider>

        {/* PD Config ID */}
        <Box>
          <FormControl fullWidth required error={!pdConfigId}>
            <InputLabel>PD Config ID</InputLabel>
            <Select
              value={pdConfigId}
              label="PD Config ID"
              onChange={(e: any) => setPdConfigId(e.target.value)}
              disabled={loadingMetadata}
            >
              {pdConfigs.map(cfg => (
                <MenuItem key={cfg.id} value={cfg.id}>
                  {cfg.model_name} (ID: {cfg.id})
                </MenuItem>
              ))}
              {pdConfigs.length === 0 && !loadingMetadata && (
                <MenuItem disabled>No configurations found</MenuItem>
              )}
            </Select>
          </FormControl>
          <Button size="small" sx={{ mt: 0.5, textTransform: 'none' }} disabled={!pdConfigId}>
            View Configuration
          </Button>
        </Box>

        {/* PD Method */}
        <FormControl fullWidth required>
          <InputLabel>PD Method</InputLabel>
          <Select
            value={pdMethod}
            label="PD Method"
            onChange={(e: any) => setPdMethod(e.target.value)}
          >
            <MenuItem value="PIT">PIT (Point-in-Time)</MenuItem>
            <MenuItem value="TTC">TTC (Through-the-Cycle)</MenuItem>
            <MenuItem value="Hybrid">Hybrid</MenuItem>
          </Select>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            PIT: Sensitif siklus, TTC: Stabil
          </Typography>
        </FormControl>

        <Accordion elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: alpha('#667eea', 0.03) }}>
            <Typography fontWeight={700} color="primary">Advanced Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              {/* Forward Looking */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isForwardLooking}
                        onChange={(e) => setIsForwardLooking(e.target.checked)}
                      />
                    }
                    label={
                      <Typography fontWeight={600} variant="body2">Forward Looking (Macro Scenarios)</Typography>
                    }
                  />
                  <Tooltip title="Mengaktifkan skenario makro">
                    <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                  </Tooltip>
                </Box>
                
                {isForwardLooking && (
                  <Autocomplete
                    options={scalars.map(s => s.scalar_name || s.pkid?.toString() || '')}
                    loading={loadingMetadata}
                    value={scalarId}
                    onChange={(_: any, newValue: any) => setScalarId(newValue || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Scalar ID"
                        required
                        size="small"
                        helperText="Wajib saat FL ON"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <Fragment>
                              {loadingMetadata ? <CircularProgress color="inherit" size={20} /> : null}
                              {(params.InputProps as any).endAdornment}
                            </Fragment>
                          )
                        } as any}
                      />
                    )}
                    {...({} as any)}
                  />
                )}
              </Box>

              <Divider />

              {/* Comparison Mode Toggle */}
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: alpha('#667eea', 0.05),
                border: '1px dashed',
                borderColor: alpha('#667eea', 0.2)
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={isCompareMode}
                      onChange={(e) => setIsCompareMode(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={700} color="#667eea">
                      Activate Comparison Mode
                    </Typography>
                  }
                />
              </Box>

              {/* Comparison Model B Section */}
              {isCompareMode && (
                <Fragment>
                  <Divider>
                    <Chip label="Model B (Challenger)" size="small" color="secondary" />
                  </Divider>
                  
                  <Box>
                    <FormControl fullWidth required error={!pdConfigIdB} size="small">
                      <InputLabel>PD Config ID (B)</InputLabel>
                      <Select
                        value={pdConfigIdB}
                        label="PD Config ID (B)"
                        onChange={(e: any) => setPdConfigIdB(e.target.value)}
                        disabled={loadingMetadata}
                      >
                        {pdConfigs.map(cfg => (
                          <MenuItem key={cfg.id} value={cfg.id}>
                            {cfg.model_name} (ID: {cfg.id})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <FormControl fullWidth required size="small">
                    <InputLabel>PD Method (B)</InputLabel>
                    <Select
                      value={pdMethodB}
                      label="PD Method (B)"
                      onChange={(e: any) => setPdMethodB(e.target.value)}
                    >
                      <MenuItem value="PIT">PIT (Point-in-Time)</MenuItem>
                      <MenuItem value="TTC">TTC (Through-the-Cycle)</MenuItem>
                      <MenuItem value="Hybrid">Hybrid</MenuItem>
                    </Select>
                  </FormControl>

                  {isForwardLooking && (
                     <Autocomplete
                      options={scalars.map(s => s.scalar_name || s.pkid?.toString() || '')}
                      loading={loadingMetadata}
                      value={scalarIdB}
                      onChange={(_: any, newValue: any) => setScalarIdB(newValue || '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Scalar ID (B)"
                          required
                          size="small"
                          helperText="Scenario selection for Model B"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <Fragment>
                                {loadingMetadata ? <CircularProgress color="inherit" size={20} /> : null}
                                {(params.InputProps as any).endAdornment}
                              </Fragment>
                            )
                          } as any}
                        />
                      )}
                      {...({} as any)}
                    />
                  )}
                </Fragment>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Actions */}
        <Box sx={{ pt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleRun}
            disabled={isForwardLooking && !scalarId}
          >
            Run Analysis
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => {
              setProcDate(new Date('2022-10-31'));
              setSelectedSegments([]);
              if (pdConfigs.length > 0) setPdConfigId(pdConfigs[0].id.toString());
              setPdMethod('TTC');
              setIsForwardLooking(false);
              setScalarId('');
              setIsCompareMode(false);
              setPdConfigIdB('');
              setPdMethodB('PIT');
              setScalarIdB('');
            }}
          >
            Clear
          </Button>
        </Box>
      </Stack>
    </Drawer>
  );
}
