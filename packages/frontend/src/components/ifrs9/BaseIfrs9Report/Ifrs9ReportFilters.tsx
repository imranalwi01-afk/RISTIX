// Ifrs9ReportFilters.tsx – Filter configuration card with all parameter controls
'use client';
import React from 'react';
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Autocomplete from '@mui/material/Autocomplete'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'
import { alpha } from '@mui/material/styles'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import LaunchIcon from '@mui/icons-material/Launch'
import SettingsIcon from '@mui/icons-material/SettingsSuggest'
import RefreshIcon from '@mui/icons-material/Refresh'
import FilterIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/ClearAll'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import TuneIcon from '@mui/icons-material/Tune'
import {
  DatePicker,
} from '@mui/x-date-pickers';
import type {
  ReportFilters,
  SegmentOption,
  LgdConfigOption,
  LgdMethodOption,
  EadConfigOption,
  BaseIfrs9ReportProps,
  ThemeStyles,
} from './types'

interface Ifrs9ReportFiltersProps {
  filters: ReportFilters;
  reportType: BaseIfrs9ReportProps['reportType'];
  optionalParams: string[];
  segmentOptions: SegmentOption[];
  groupSegmentOptions: string[];
  lgdConfigs: LgdConfigOption[];
  lgdMethods: LgdMethodOption[];
  eadConfigs: EadConfigOption[];
  loading: boolean;
  onFilterChange: <K extends keyof ReportFilters>(field: K, value: ReportFilters[K]) => void;
  onClear: () => void;
  onRun: () => void;
  onOpenConfigDrawer: () => void;
  themeStyles: ThemeStyles;
}

const Ifrs9ReportFilters: React.FC<Ifrs9ReportFiltersProps> = ({
  filters,
  reportType,
  optionalParams,
  segmentOptions,
  groupSegmentOptions,
  lgdConfigs,
  lgdMethods,
  eadConfigs,
  loading,
  onFilterChange,
  onClear,
  onRun,
  onOpenConfigDrawer,
  themeStyles,
}) => (
  <Card sx={{
    mb: 4,
    borderRadius: 3,
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 0, 0, 0.05)'
  }}>
    <Box sx={{
      p: 2,
      display: 'flex',
      alignItems: 'center',
      bgcolor: alpha(themeStyles.primary, 0.03),
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
    }}>
      <FilterIcon sx={{ mr: 1, color: themeStyles.primary, fontSize: 20 }} />
      <Typography variant="subtitle1" fontWeight={700} sx={{ color: themeStyles.primary }}>
        Analysis Configuration
      </Typography>
    </Box>
    <CardContent sx={{ p: 3 }}>
      <Grid container spacing={2.5}>
        {/* Processing Date (Required) */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DatePicker
            label="Processing Date"
            value={filters.prc_date}
            onChange={(date: unknown) => {
              const finalDate = date && (date as { toDate?: () => Date }).toDate
                ? (date as { toDate: () => Date }).toDate()
                : (date as Date | null);
              onFilterChange('prc_date', finalDate);
            }}
            enableAccessibleFieldDOMStructure={false}
            slots={{
              textField: TextField
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
                size: 'small',
                sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
              }
            }}
          />
        </Grid>

        {/* Optional parameters wrapped in Accordion */}
        {optionalParams.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Accordion 
              variant="outlined" 
              sx={{ 
                mt: 2, 
                borderRadius: '12px !important', 
                borderColor: alpha(themeStyles.primary, 0.1),
                '&:before': { display: 'none' },
                boxShadow: 'none',
                bgcolor: alpha(themeStyles.primary, 0.005)
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ px: 2, minHeight: 48, '& .MuiAccordionSummary-content': { my: 1 } }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TuneIcon sx={{ mr: 1, fontSize: 20, color: themeStyles.primary }} />
                  <Typography variant="subtitle2" fontWeight={700} color={themeStyles.primary}>
                    Advanced Parameters
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pb: 3, pt: 1 }}>
                <Grid container spacing={2.5}>
                  {optionalParams.includes('segment_id') && (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Autocomplete
                        size="small"
                        options={segmentOptions}
                        getOptionLabel={(option) => option.segment_name || String(option.id)}
                        value={segmentOptions.find((s) => Number(s.id) === Number(filters.segment_id)) || null}
                        onChange={(_, newValue) => {
                          const raw = newValue ? (newValue as any).id : undefined;
                          const parsed = raw === null || raw === undefined ? NaN : Number(raw);
                          const selectedSegmentId = Number.isFinite(parsed) ? parsed : undefined;
                          onFilterChange('segment_id', selectedSegmentId);
                          onFilterChange('segment_ids', selectedSegmentId ? [selectedSegmentId] : []);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={reportType === 'lifetime-lgd' ? 'Population Segment' : 'Segment ID'}
                            placeholder={reportType === 'lifetime-lgd' ? 'All Population Segments' : 'All Segments'}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        )}
                      />
                    </Grid>
                  )}

                  {optionalParams.includes('group_segment') && (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Group Segment</InputLabel>
                        <Select
                          value={filters.group_segment || ''}
                          onChange={(e) => onFilterChange('group_segment', e.target.value ? String(e.target.value) : undefined)}
                          label="Group Segment"
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="">ALL</MenuItem>
                          {groupSegmentOptions.map((value) => (
                            <MenuItem key={value} value={value}>
                              {value}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {optionalParams.includes('pd_config_id') && (
                    <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                      <TextField
                        label="PD Config ID"
                        type="number"
                        size="small"
                        value={filters.pd_config_id || ''}
                        onChange={(e) => onFilterChange('pd_config_id', parseInt(e.target.value) || undefined)}
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                  )}

                  {optionalParams.includes('pd_method') && (
                    <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>PD Method</InputLabel>
                        <Select
                          value={filters.pd_method || ''}
                          onChange={(e) => onFilterChange('pd_method', e.target.value ? Number(e.target.value) : undefined)}
                          label="PD Method"
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="">All Methods</MenuItem>
                          <MenuItem value={1}>TTC (Through-the-Cycle)</MenuItem>
                          <MenuItem value={2}>PIT (Point-in-Time)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {optionalParams.includes('ead_config_id') && (
                    <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>EAD Model</InputLabel>
                        <Select
                          value={filters.ead_config_id || ''}
                          onChange={(e) => {
                            const selectedConfigId = e.target.value ? Number(e.target.value) : undefined;
                            onFilterChange('ead_config_id', selectedConfigId);
                          }}
                          label="EAD Model"
                          sx={{ borderRadius: 2 }}
                        >
                          {eadConfigs.length > 0 ? (
                            eadConfigs.map((config) => (
                              <MenuItem key={String(config.id)} value={Number(config.id)}>
                                {config.segment_id ? `${config.model_name} (Segment ${config.segment_id})` : config.model_name}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem value="" disabled>
                              No configurations
                            </MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {optionalParams.includes('lgd_config_id') && (
                    <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>LGD Model</InputLabel>
                        <Select
                          value={filters.lgd_config_id || ''}
                          onChange={(e) => {
                            const selectedConfigId = e.target.value ? Number(e.target.value) : undefined;
                            const selectedConfig = lgdConfigs.find((config) => Number(config.id) === selectedConfigId);
                            onFilterChange('lgd_config_id', selectedConfigId);
                            onFilterChange('segment_id', selectedConfig?.segment_id);
                            onFilterChange('segment_ids', selectedConfig?.segment_id ? [selectedConfig.segment_id] : []);
                          }}
                          label="LGD Model"
                          sx={{ borderRadius: 2 }}
                          endAdornment={
                            <InputAdornment position="end" sx={{ mr: 4 }}>
                              <Tooltip title="View Calculation Config Detailed Summary">
                                <IconButton
                                  size="small"
                                  onClick={() => onOpenConfigDrawer()}
                                  sx={{
                                    color: themeStyles.primary,
                                    bgcolor: alpha(themeStyles.primary, 0.05),
                                    '&:hover': { bgcolor: alpha(themeStyles.primary, 0.1) }
                                  }}
                                >
                                  <LaunchIcon sx={{ fontSize: '1.2rem' }} />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="">All LGD Models</MenuItem>
                          {lgdConfigs.map((config) => (
                            <MenuItem key={config.id} value={config.id}>
                              {config.segment_id ? `${config.model_name} (Segment ${config.segment_id})` : (config.model_name || `Config ${config.id}`)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {optionalParams.includes('lgd_method') && (
                    <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>LGD Method</InputLabel>
                        <Select
                          value={filters.lgd_method || ''}
                          onChange={(e) => onFilterChange('lgd_method', e.target.value ? Number(e.target.value) : undefined)}
                          label="LGD Method"
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="">All Methods</MenuItem>
                          {lgdMethods.length > 0 ? (
                            lgdMethods.map(m => (
                              <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                            ))
                          ) : [
                            <MenuItem key={1} value={1}>Workout</MenuItem>,
                            <MenuItem key={2} value={2}>Collateral</MenuItem>,
                            <MenuItem key={3} value={3}>Hybrid</MenuItem>
                          ]}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {optionalParams.includes('stage') && (
                    <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                      <Autocomplete
                        multiple
                        size="small"
                        options={['1', '2', '3']}
                        getOptionLabel={(option) => `Stage ${option}`}
                        value={Array.isArray(filters.stage) ? filters.stage as string[] : (filters.stage ? [filters.stage as string] : [])}
                        onChange={(_, newValue) => onFilterChange('stage', newValue)}
                        disableCloseOnSelect
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Stage" 
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        )}
                      />
                    </Grid>
                  )}

                  {optionalParams.includes('model_id') && (
                    <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                      <TextField
                        label="Model ID"
                        type="number"
                        size="small"
                        value={filters.model_id || ''}
                        onChange={(e) => onFilterChange('model_id', parseInt(e.target.value) || undefined)}
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <Tooltip title="View Model Development Details">
                                  <IconButton
                                    size="small"
                                    sx={{
                                      color: themeStyles.primary,
                                      bgcolor: alpha(themeStyles.primary, 0.05),
                                      '&:hover': { bgcolor: alpha(themeStyles.primary, 0.1) }
                                    }}
                                  >
                                    <SettingsIcon sx={{ fontSize: '1.2rem' }} />
                                  </IconButton>
                                </Tooltip>
                              </InputAdornment>
                            )
                          }
                        }}
                      />
                    </Grid>
                  )}

                  {optionalParams.includes('fl_flag') && (
                    <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={filters.fl_flag || false}
                            onChange={(e) => onFilterChange('fl_flag', e.target.checked)}
                            color="primary"
                          />
                        }
                        label={<Typography variant="body2" fontWeight={600}>Forward Looking</Typography>}
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}

        {/* Filter Actions */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={onClear}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Reset Filter
            </Button>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={onRun}
              disabled={loading}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none', 
                fontWeight: 700,
                background: themeStyles.gradient,
                boxShadow: `0 4px 12px ${alpha(themeStyles.primary, 0.4)}`
              }}
            >
              Run Analysis
            </Button>
          </Box>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

export default React.memo(Ifrs9ReportFilters);
