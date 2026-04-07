import React, { memo } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Timeline as TimelineIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { DialogState, FLScalarDetail, FLScalarHeader, FLScalarWithDetails, TabPanelProps } from '../types';

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children as any}</Box>}
    </div>
  );
}

interface FLScalarDialogProps {
  dialogState: DialogState;
  loading: boolean;
  canManage: boolean;
  formData: Partial<FLScalarWithDetails>;
  formErrors: Record<string, string>;
  scalarDetails: FLScalarDetail[];
  tabValue: number;
  onClose: () => void;
  onSave: () => void;
  onTabChange: (value: number) => void;
  onFormChange: (field: keyof FLScalarHeader, value: any) => void;
  onAddPeriod: () => void;
  onUpdateDetail: (index: number, field: keyof FLScalarDetail, value: any) => void;
  onRemoveDetail: (index: number) => void;
}

export const FLScalarDialog = memo(function FLScalarDialog({
  dialogState,
  loading,
  canManage,
  formData,
  formErrors,
  scalarDetails,
  tabValue,
  onClose,
  onSave,
  onTabChange,
  onFormChange,
  onAddPeriod,
  onUpdateDetail,
  onRemoveDetail,
}: FLScalarDialogProps) {
  const isReadOnly = dialogState.mode === 'view' || !canManage;

  return (
    <Dialog
      open={dialogState.open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: 600 } }}
      data-testid="fl-scalar-dialog"
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon color="primary" />
          {dialogState.mode === 'create' && 'Create FL Scalar Configuration'}
          {dialogState.mode === 'edit' && 'Edit FL Scalar Configuration'}
          {dialogState.mode === 'view' && 'View FL Scalar Configuration'}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box>
          <Tabs value={tabValue} onChange={(_, newValue) => onTabChange(newValue)}>
            <Tab label="Basic Information" />
            <Tab label={`Scalar Periods (${scalarDetails?.length || 0})`} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
              <Box sx={{ gridColumn: 'span 2' }}>
                <TextField
                  fullWidth
                  label="Scalar Name"
                  value={formData.scalar_name || ''}
                  onChange={(e) => onFormChange('scalar_name', e.target.value)}
                  disabled={isReadOnly}
                  error={!!formErrors.scalar_name}
                  helperText={formErrors.scalar_name}
                  required
                  slotProps={{ htmlInput: { 'data-testid': 'fl-scalar-name-input' } }}
                />
              </Box>

              <Box sx={{ gridColumn: 'span 2' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active_flag !== false}
                      onChange={(e) => onFormChange('active_flag', e.target.checked)}
                      disabled={isReadOnly}
                    />
                  }
                  label="Active"
                />
              </Box>

              {dialogState.mode !== 'create' && (
                <>
                  <Box sx={{ gridColumn: 'span 2' }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Audit Information
                    </Typography>
                  </Box>

                  <TextField fullWidth label="Created By" value={formData.created_by || ''} disabled />

                  <TextField
                    fullWidth
                    label="Created Date"
                    value={formData.created_date ? new Date(formData.created_date).toLocaleString() : ''}
                    disabled
                  />

                  {formData.updated_by && (
                    <>
                      <TextField fullWidth label="Updated By" value={formData.updated_by || ''} disabled />

                      <TextField
                        fullWidth
                        label="Updated Date"
                        value={formData.updated_date ? new Date(formData.updated_date).toLocaleString() : ''}
                        disabled
                      />
                    </>
                  )}
                </>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimelineIcon color="primary" />
                Period-based Scalar Values
              </Typography>
              {!isReadOnly && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={onAddPeriod}
                  data-testid="fl-scalar-add-period-button"
                >
                  Add Period
                </Button>
              )}
            </Box>

            {formErrors.details && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formErrors.details}
              </Alert>
            )}

            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Period</TableCell>
                    <TableCell>Weighted Scalar</TableCell>
                    {!isReadOnly && <TableCell width="100">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scalarDetails?.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={detail.period}
                          onChange={(e) => onUpdateDetail(index, 'period', Number(e.target.value))}
                          disabled={isReadOnly}
                          inputProps={{ min: 1, max: 100 }}
                          slotProps={{ htmlInput: { 'data-testid': `fl-scalar-period-input-${index}` } }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={detail.weighted_scalar}
                          onChange={(e) => onUpdateDetail(index, 'weighted_scalar', Number(e.target.value))}
                          disabled={isReadOnly}
                          inputProps={{ min: 0, step: 0.001 }}
                          slotProps={{ htmlInput: { 'data-testid': `fl-scalar-weighted-scalar-input-${index}` } }}
                        />
                      </TableCell>
                      {!isReadOnly && (
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onRemoveDetail(index)}
                            data-testid={`fl-scalar-remove-period-button-${index}`}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {(!scalarDetails || scalarDetails.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={isReadOnly ? 2 : 3} align="center">
                        <Typography color="text.secondary">No scalar periods defined</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {dialogState.mode !== 'view' && (
          <Button variant="contained" onClick={onSave} disabled={loading} data-testid="fl-scalar-save-button">
            {dialogState.mode === 'edit' ? 'Update' : 'Create'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
});
