'use client';

import React from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  Clear as ClearIcon,
  Download as DownloadIcon,
  UploadFile as UploadIcon
} from '@mui/icons-material';
import { OverrideRequestFormData } from './types';

interface OverrideRequestDialogProps {
  open: boolean;
  accountId?: string | null;
  formData: OverrideRequestFormData;
  onFormDataChange: React.Dispatch<React.SetStateAction<OverrideRequestFormData>>;
  existingDocumentName: string;
  onFileSelect: (file: File | null) => void | Promise<void>;
  onDownloadExisting: () => void;
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
}

export function OverrideRequestDialog({
  open,
  accountId,
  formData,
  onFormDataChange,
  existingDocumentName,
  onFileSelect,
  onDownloadExisting,
  onClose,
  onSubmit,
  loading
}: OverrideRequestDialogProps) {
  const hasExistingDoc = Boolean(existingDocumentName);
  const hasNewDoc = Boolean(formData.supportingDocumentName && formData.supportingDocumentContent);
  const submitDisabled = (
    loading
    || !formData.customerName
    || !formData.accountNumber
    || !formData.justification
    || (!hasExistingDoc && !hasNewDoc)
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Review Override Request</DialogTitle>
      <DialogContent dividers>
        <Box component="form" sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Customer Name"
            margin="normal"
            value={formData.customerName}
            onChange={(e) => onFormDataChange((prev) => ({ ...prev, customerName: e.target.value }))}
            disabled={Boolean(accountId)}
          />
          <TextField
            fullWidth
            label="Account Number"
            margin="normal"
            value={formData.accountNumber}
            onChange={(e) => onFormDataChange((prev) => ({ ...prev, accountNumber: e.target.value }))}
            disabled={Boolean(accountId)}
          />

          <Box display="flex" gap={2} mt={2}>
            <TextField
              fullWidth
              label="Current Stage"
              value={`Stage ${formData.currentStage}`}
              disabled
            />
            <FormControl fullWidth>
              <InputLabel>Override Stage</InputLabel>
              <Select
                value={formData.overrideStage}
                label="Override Stage"
                onChange={(e) => onFormDataChange((prev) => ({ ...prev, overrideStage: Number(e.target.value) }))}
              >
                <MenuItem value={1}>Stage 1</MenuItem>
                <MenuItem value={2}>Stage 2</MenuItem>
                <MenuItem value={3}>Stage 3</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            label="Justification"
            margin="normal"
            multiline
            rows={3}
            value={formData.justification}
            onChange={(e) => onFormDataChange((prev) => ({ ...prev, justification: e.target.value }))}
            helperText="Please provide a detailed reason for this override request."
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Supporting Document
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                Upload File
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    void onFileSelect(file);
                  }}
                />
              </Button>
              {existingDocumentName ? (
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={onDownloadExisting}
                >
                  Download Existing
                </Button>
              ) : null}
              {formData.supportingDocumentName ? (
                <Chip
                  label={formData.supportingDocumentName}
                  onDelete={() => onFormDataChange((prev) => ({ ...prev, supportingDocumentName: '', supportingDocumentContent: '' }))}
                  deleteIcon={<ClearIcon />}
                  variant="outlined"
                />
              ) : null}
            </Stack>
            {!(hasExistingDoc || hasNewDoc) ? (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.75 }}>
                File wajib diupload sebagai pendukung justification.
              </Typography>
            ) : null}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={submitDisabled}
        >
          Submit Override Request
        </Button>
      </DialogActions>
    </Dialog>
  );
}
