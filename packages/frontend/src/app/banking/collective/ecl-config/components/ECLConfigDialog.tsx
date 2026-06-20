'use client';

import React, { memo } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Calculate as EclIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { ECLConfigDetail, ECLConfigHeader, LookupOption } from '../types';

interface ECLConfigDialogProps {
  open: boolean;
  loading: boolean;
  isViewOnly: boolean;
  isEditing: boolean;
  currentTab: number;
  headerFormData: Partial<ECLConfigHeader>;
  detailFormData: Partial<ECLConfigDetail>;
  formErrors: Record<string, string>;
  moduleOptions: LookupOption[];
  segmentOptions: LookupOption[];
  stageRuleOptions: LookupOption[];
  pdModelOptions: LookupOption[];
  lgdModelOptions: LookupOption[];
  eadModelOptions: LookupOption[];
  periodTypeOptions: LookupOption[];
  onClose: () => void;
  onSave: () => void;
  onTabChange: (tab: number) => void;
  onHeaderFieldChange: (field: string, value: any) => void;
  onDetailFieldChange: (field: string, value: any) => void;
  onAddDetail: () => void;
  onRemoveDetail: (detailPkid: number) => void;
}

const getModelOptionsForSegment = (options: LookupOption[], selectedSegmentId?: string | number): LookupOption[] => {
  const segmentId = String(selectedSegmentId ?? '').trim();
  if (!segmentId) return options;

  const matching = options.filter((option) => !option.segmentId || option.segmentId === segmentId);
  return matching.length > 0 ? matching : options;
};

function ECLConfigDialogComponent({
  open,
  loading,
  isViewOnly,
  isEditing,
  currentTab,
  headerFormData,
  detailFormData,
  formErrors,
  moduleOptions,
  segmentOptions,
  stageRuleOptions,
  pdModelOptions,
  lgdModelOptions,
  eadModelOptions,
  periodTypeOptions,
  onClose,
  onSave,
  onTabChange,
  onHeaderFieldChange,
  onDetailFieldChange,
  onAddDetail,
  onRemoveDetail,
}: ECLConfigDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EclIcon />
        {isViewOnly ? 'View ECL Configuration' : isEditing ? 'Edit ECL Configuration' : 'Add ECL Configuration'}
      </DialogTitle>
      <DialogContent dividers>
        <Tabs value={currentTab} onChange={(_, newValue) => onTabChange(newValue)}>
          <Tab label="Header Information" data-testid="ecl-header-tab" />
          <Tab label="Segment Configuration" data-testid="ecl-segment-tab" />
        </Tabs>

        {currentTab === 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              ECL Model Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
              <Box sx={{ gridColumn: 'span 2' }}>
                <TextField
                  fullWidth
                  label="ECL Model Name"
                  value={headerFormData.ecl_model_name || ''}
                  onChange={(e) => onHeaderFieldChange('ecl_model_name', e.target.value)}
                  disabled={isViewOnly}
                  error={!!formErrors.ecl_model_name}
                  helperText={formErrors.ecl_model_name}
                  required
                  data-testid="ecl-model-name-input"
                />
              </Box>

              <Box>
                <FormControl fullWidth error={!!formErrors.module} required>
                  <InputLabel>Module</InputLabel>
                  <Select
                    value={headerFormData.module || ''}
                    label="Module"
                    disabled={isViewOnly}
                    onChange={(e) => onHeaderFieldChange('module', e.target.value)}
                    data-testid="ecl-module-select"
                  >
                    {moduleOptions.map((module, idx) => (
                      <MenuItem key={`${module.value}-${idx}`} value={module.value}>
                        {module.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.module && (
                    <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>
                      {formErrors.module}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              <Box>
                <DatePicker
                  label="Effective Date"
                  value={headerFormData.effective_date ? new Date(headerFormData.effective_date as string) : null}
                  onChange={(newValue) => {
                    if (isViewOnly) return;
                    if (newValue) {
                      const dateStr = newValue instanceof Date
                        ? newValue.toISOString().split('T')[0]
                        : (newValue as any).toISOString().split('T')[0];
                      onHeaderFieldChange('effective_date', dateStr);
                    } else {
                      onHeaderFieldChange('effective_date', '');
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      disabled: isViewOnly,
                      error: !!formErrors.effective_date,
                      helperText: formErrors.effective_date,
                      required: true,
                      InputLabelProps: { shrink: true },
                      'data-testid': 'ecl-effective-date-input'
                    } as any
                  }}
                />
              </Box>

              <Box sx={{ gridColumn: 'span 2' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={headerFormData.active_flag || false}
                      disabled={isViewOnly}
                      onChange={(e) => onHeaderFieldChange('active_flag', e.target.checked)}
                      data-testid="ecl-active-flag-checkbox"
                    />
                  }
                  label="Active Configuration"
                />
              </Box>
            </Box>
          </Box>
        )}

        {currentTab === 1 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Add Segment Configuration
            </Typography>

            {(() => {
              const requiresPeriodDate = Number(detailFormData.period_type) === 5;
              return (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, mb: 3 }}>
                  <Box>
                    <FormControl fullWidth required>
                      <InputLabel>Segment</InputLabel>
                      <Select
                        value={detailFormData.pf_segment_id || ''}
                        label="Segment"
                        disabled={isViewOnly}
                        error={!!formErrors.pf_segment_id}
                        onChange={(e) => onDetailFieldChange('pf_segment_id', Number(e.target.value))}
                        data-testid="ecl-segment-select"
                      >
                        {segmentOptions.map((segment, idx) => (
                          <MenuItem key={`${segment.value}-${idx}`} value={segment.value}>
                            {segment.label}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText error={!!formErrors.pf_segment_id}>
                        {formErrors.pf_segment_id || 'Source: Portfolio segment master (PF)'}
                      </FormHelperText>
                    </FormControl>
                  </Box>

                  <Box>
                    <FormControl fullWidth error={!!formErrors.stage_rule_id}>
                      <InputLabel>Stage Rule</InputLabel>
                      <Select
                        value={detailFormData.stage_rule_id || ''}
                        label="Stage Rule"
                        disabled={isViewOnly}
                        onChange={(e) => onDetailFieldChange('stage_rule_id', Number(e.target.value))}
                        data-testid="ecl-stage-rule-select"
                      >
                        {stageRuleOptions.map((rule, idx) => (
                          <MenuItem key={`${rule.value}-${idx}`} value={rule.value}>
                            {rule.label}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText error={!!formErrors.stage_rule_id}>
                        {formErrors.stage_rule_id || 'Source: Rule base header (STAGE)'}
                      </FormHelperText>
                    </FormControl>
                  </Box>

                  <Box>
                    <FormControl fullWidth required error={!!formErrors.pd_model_id}>
                      <InputLabel>PD Model</InputLabel>
                      <Select
                        value={detailFormData.pd_model_id || ''}
                        label="PD Model"
                        disabled={isViewOnly}
                        onChange={(e) => onDetailFieldChange('pd_model_id', Number(e.target.value))}
                        data-testid="ecl-pd-model-select"
                      >
                        {getModelOptionsForSegment(pdModelOptions, detailFormData.pf_segment_id).map((model, idx) => (
                          <MenuItem key={`${model.value}-${idx}`} value={model.value}>
                            {model.label}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText error={!!formErrors.pd_model_id}>
                        {formErrors.pd_model_id || 'Source: PD Output Monthly (frs9_r_pd_output_monthly)'}
                      </FormHelperText>
                    </FormControl>
                  </Box>

                  <Box>
                    <FormControl fullWidth required error={!!formErrors.lgd_model_id}>
                      <InputLabel>LGD Model</InputLabel>
                      <Select
                        value={detailFormData.lgd_model_id || ''}
                        label="LGD Model"
                        disabled={isViewOnly}
                        onChange={(e) => onDetailFieldChange('lgd_model_id', Number(e.target.value))}
                        data-testid="ecl-lgd-model-select"
                      >
                        {getModelOptionsForSegment(lgdModelOptions, detailFormData.pf_segment_id).map((model, idx) => (
                          <MenuItem key={`${model.value}-${idx}`} value={model.value}>
                            {model.label}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText error={!!formErrors.lgd_model_id}>
                        {formErrors.lgd_model_id || 'Source: LGD Config'}
                      </FormHelperText>
                    </FormControl>
                  </Box>

                  <Box>
                    <FormControl fullWidth required error={!!formErrors.ead_model_id}>
                      <InputLabel>EAD Model</InputLabel>
                      <Select
                        value={detailFormData.ead_model_id || ''}
                        label="EAD Model"
                        disabled={isViewOnly}
                        onChange={(e) => onDetailFieldChange('ead_model_id', Number(e.target.value))}
                        data-testid="ecl-ead-model-select"
                      >
                        {getModelOptionsForSegment(eadModelOptions, detailFormData.pf_segment_id).map((model, idx) => (
                          <MenuItem key={`${model.value}-${idx}`} value={model.value}>
                            {model.label}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText error={!!formErrors.ead_model_id}>
                        {formErrors.ead_model_id || 'Source: EAD Config'}
                      </FormHelperText>
                    </FormControl>
                  </Box>

                  <Box>
                    <TextField
                      fullWidth
                      label="Overlay Rate (%)"
                      type="number"
                      value={detailFormData.overlay_rate || ''}
                      disabled={isViewOnly}
                      onChange={(e) => onDetailFieldChange('overlay_rate', Number(e.target.value))}
                      inputProps={{ min: 0, max: 500, step: 1 }}
                      data-testid="ecl-overlay-rate-input"
                    />
                  </Box>

                  <Box>
                    <FormControl fullWidth required error={!!formErrors.period_type}>
                      <InputLabel>Period Type</InputLabel>
                      <Select
                        value={detailFormData.period_type || ''}
                        label="Period Type"
                        disabled={isViewOnly}
                        onChange={(e) => {
                          const nextValue = Number(e.target.value);
                          onDetailFieldChange('period_type', nextValue);
                          if (nextValue !== 5) {
                            onDetailFieldChange('period_date', '');
                          }
                        }}
                        data-testid="ecl-period-type-select"
                      >
                        {periodTypeOptions.map((periodType, idx) => (
                          <MenuItem key={`${periodType.value}-${idx}`} value={periodType.value}>
                            {periodType.label}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText error={!!formErrors.period_type}>
                        {formErrors.period_type || 'Source: Business Setting B0025'}
                      </FormHelperText>
                    </FormControl>
                  </Box>

                  <Box>
                    <DatePicker
                      label="Period Date"
                      value={detailFormData.period_date ? new Date(detailFormData.period_date as string) : null}
                      onChange={(newValue) => {
                        if (isViewOnly || !requiresPeriodDate) return;
                        if (newValue) {
                          const dateStr = newValue instanceof Date
                            ? newValue.toISOString().split('T')[0]
                            : (newValue as any).toISOString().split('T')[0];
                          onDetailFieldChange('period_date', dateStr);
                        } else {
                          onDetailFieldChange('period_date', '');
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          disabled: isViewOnly || !requiresPeriodDate,
                          error: !!formErrors.period_date,
                          helperText: formErrors.period_date || (requiresPeriodDate ? 'Required when Period Type = 5' : 'Enabled when Period Type = 5'),
                          InputLabelProps: { shrink: true },
                          'data-testid': 'ecl-period-date-input'
                        } as any
                      }}
                    />
                  </Box>

                  <Box sx={{ gridColumn: 'span 2' }}>
                    {!isViewOnly && (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={onAddDetail}
                        data-testid="add-ecl-segment-config-btn"
                      >
                        Add Segment Configuration
                      </Button>
                    )}
                  </Box>
                </Box>
              );
            })()}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Current Segment Configurations ({(headerFormData.details || []).length})
            </Typography>

            {formErrors.details && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formErrors.details}
              </Alert>
            )}

            {(headerFormData.details || []).map((detail, index) => (
              <Accordion key={detail.pkid}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={index + 1} size="small" />
                    {detail.pf_segment_name} - PD: {detail.pd_model_name}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2"><strong>Segment:</strong> {detail.pf_segment_name}</Typography>
                      <Typography variant="body2"><strong>Stage Rule:</strong> {detail.stage_rule_name || 'Default'}</Typography>
                      <Typography variant="body2"><strong>PD Model:</strong> {detail.pd_model_name}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2"><strong>LGD Model:</strong> {detail.lgd_model_name}</Typography>
                      <Typography variant="body2"><strong>EAD Model:</strong> {detail.ead_model_name}</Typography>
                      <Typography variant="body2"><strong>Overlay Rate:</strong> {detail.overlay_rate}%</Typography>
                      <Typography variant="body2"><strong>Period Type:</strong> {detail.period_type_name || detail.period_type || '-'}</Typography>
                      <Typography variant="body2"><strong>Period Date:</strong> {detail.period_date || '-'}</Typography>
                    </Box>
                  </Box>
                  {!isViewOnly && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => onRemoveDetail(detail.pkid)}
                      >
                        Remove Segment
                      </Button>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} data-testid="cancel-ecl-config-btn">
          {isViewOnly ? 'Close' : 'Cancel'}
        </Button>
        {!isViewOnly && (
          <Button
            variant="contained"
            onClick={onSave}
            disabled={loading}
            data-testid="save-ecl-config-btn"
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {isEditing
              ? currentTab === 0
                ? 'Update Header'
                : 'Update Segment Configuration'
              : 'Create Configuration'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export const ECLConfigDialog = memo(ECLConfigDialogComponent);
