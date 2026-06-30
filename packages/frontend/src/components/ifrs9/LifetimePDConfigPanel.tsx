'use client';

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
import { productSegmentsApi, type ProductSegment } from '../../services/api/product-segments.api';
import { pdConfigurationsApi } from '../../services/api/pd-configurations.api';

interface LifetimePDConfigPanelProps {
  open: boolean;
  onClose: () => void;
  onRun: (config: any) => void;
}

export default function LifetimePDConfigPanel({ open, onClose, onRun }: LifetimePDConfigPanelProps) {
  const getSegmentLabel = (segment: ProductSegment) =>
    segment.segment || segment.subSegment || segment.groupSegment || String(segment.id);

  // Local state for form fields
  const [procDate, setProcDate] = useState<Date | null>(new Date('2022-10-31'));
  const [selectedSegments, setSelectedSegments] = useState<ProductSegment[]>([]);
  const [segmentTypeFilter, setSegmentTypeFilter] = useState<string>(''); // empty = all
  const [showInactiveSegments, setShowInactiveSegments] = useState(true);
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
  const [segments, setSegments] = useState<ProductSegment[]>([]);
  const [pdConfigs, setPdConfigs] = useState<any[]>([]);
  const [scalars, setScalars] = useState<any[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      setLoadingMetadata(true);
      try {
        const [segData, pdData] = await Promise.all([
          productSegmentsApi.getAll(),
          pdConfigurationsApi.getAll({ is_active: true }),
            ]);
        const normalizedSegments = Array.isArray(segData) ? segData : [];
        normalizedSegments.sort((a, b) => (Number(a.displayOrder || 0) - Number(b.displayOrder || 0)) || String(a.id).localeCompare(String(b.id)));
        setSegments(normalizedSegments);
        setPdConfigs(pdData);
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

  const filteredSegments = segments.filter((segment) => {
    if (!showInactiveSegments && segment.isActive === false) return false;
    if (!segmentTypeFilter) return true;
    return String(segment.segmentType || '').toLowerCase() === String(segmentTypeFilter).toLowerCase();
  });

  const handleRun = () => {
    onRun({
      procDate,
      selectedSegments,
      selectedSegmentIds: selectedSegments.map((segment) => Number(segment.id)),
      selectedSegmentLabels: selectedSegments.map((segment) => getSegmentLabel(segment)),
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
        <IconButton onClick={onClose} aria-label="Close configuration panel">
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

        <FormControl fullWidth size="small">
          <InputLabel>Segment Type</InputLabel>
          <Select
            value={segmentTypeFilter}
            label="Segment Type"
            onChange={(e: any) => setSegmentTypeFilter(String(e.target.value || ''))}
            disabled={loadingMetadata}
          >
            <MenuItem value="">All Segment Types</MenuItem>
            <MenuItem value="PD Segment">PD Segment</MenuItem>
            <MenuItem value="LGD Segment">LGD Segment</MenuItem>
            <MenuItem value="EAD Segment">EAD Segment</MenuItem>
            <MenuItem value="Portfolio Segment">Portfolio Segment</MenuItem>
          </Select>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Jika dropdown Segment ID hanya terlihat “PD”, ubah Segment Type ke All.
          </Typography>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={showInactiveSegments}
              onChange={(e) => setShowInactiveSegments(e.target.checked)}
            />
          }
          label={<Typography variant="body2" fontWeight={600}>Show inactive segments</Typography>}
        />

        {/* Segment ID */}
        <Autocomplete
          multiple
          options={filteredSegments}
          loading={loadingMetadata}
          getOptionLabel={(option) => `${getSegmentLabel(option)}${option.segmentType ? ` — ${option.segmentType}` : ''} (ID: ${option.id})`}
          isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
          value={selectedSegments}
          onChange={(_: any, newValue: ProductSegment[]) => setSelectedSegments(newValue)}
          renderOption={(props, option) => (
            <li {...props} key={String(option.id)}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, width: '100%' }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {getSegmentLabel(option)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    ID: {option.id}{option.groupSegment ? ` • ${option.groupSegment}` : ''}{option.subSegment ? ` • ${option.subSegment}` : ''}
                  </Typography>
                </Box>
                {option.segmentType ? (
                  <Chip size="small" label={option.segmentType} variant="outlined" />
                ) : null}
                {option.isActive === false ? (
                  <Chip size="small" label="Inactive" color="warning" variant="outlined" />
                ) : null}
              </Box>
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Segment ID"
              placeholder="Select segments (optional)"
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
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: alpha('#1976D2', 0.03) }}>
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
                bgcolor: alpha('#1976D2', 0.05),
                border: '1px dashed',
                borderColor: alpha('#1976D2', 0.2)
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
                    <Typography variant="body2" fontWeight={700} color="#1976D2">
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
