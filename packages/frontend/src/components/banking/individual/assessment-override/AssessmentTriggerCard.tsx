'use client';

import React from 'react';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Download as DownloadIcon, UploadFile as UploadIcon } from '@mui/icons-material';
import { formatAmount, formatDisplayDate } from './utils';

interface AssessmentTriggerCardProps {
  assessmentData: any;
  remarksDraft: string;
  onRemarksChange: (value: string) => void;
  onReferenceSelect: (file: File | null) => void | Promise<void>;
  existingDocumentName: string;
  onDownloadExisting: () => void;
  onOpenOverrideDialog: () => void;
  onBack: () => void;
}

export function AssessmentTriggerCard({
  assessmentData,
  remarksDraft,
  onRemarksChange,
  onReferenceSelect,
  existingDocumentName,
  onDownloadExisting,
  onOpenOverrideDialog,
  onBack
}: AssessmentTriggerCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Impairment Assessment Trigger
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Customer Details</Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" gap={2}>
                <Typography color="text.secondary">Download Date</Typography>
                <Typography fontWeight={600}>{formatDisplayDate(assessmentData.prc_date || assessmentData.prcDate)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" gap={2}>
                <Typography color="text.secondary">Customer Number</Typography>
                <Typography fontWeight={600}>{assessmentData.cif_number || assessmentData.cifNumber || '-'}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" gap={2}>
                <Typography color="text.secondary">Customer Name</Typography>
                <Typography fontWeight={600}>{assessmentData.cif_name || assessmentData.cifName || '-'}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" gap={2}>
                <Typography color="text.secondary">Account Number</Typography>
                <Typography fontWeight={600}>{assessmentData.account_number || assessmentData.accountNumber || '-'}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" gap={2}>
                <Typography color="text.secondary">Currency</Typography>
                <Typography fontWeight={600}>{assessmentData.currency || '-'}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" gap={2}>
                <Typography color="text.secondary">Outstanding</Typography>
                <Typography fontWeight={600}>{formatAmount(assessmentData.outstanding_balance || assessmentData.outstanding || 0)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" gap={2}>
                <Typography color="text.secondary">Day Past Due</Typography>
                <Typography fontWeight={600}>{assessmentData.dpd ?? '-'}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" gap={2}>
                <Typography color="text.secondary">Collectability</Typography>
                <Typography fontWeight={600}>{assessmentData.collectability ?? '-'}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" gap={2}>
                <Typography color="text.secondary">Rating</Typography>
                <Typography fontWeight={600}>{assessmentData.rating_code || assessmentData.ratingCode || '-'}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" gap={2} alignItems="center">
                <Typography color="text.secondary">Impaired Flag</Typography>
                <Chip
                  label={String(assessmentData.impaired_flag || 'N').toUpperCase() === 'I' ? 'Individual' : 'Non-Impaired'}
                  color={String(assessmentData.impaired_flag || 'N').toUpperCase() === 'I' ? 'warning' : 'default'}
                  variant="outlined"
                />
              </Stack>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Early Warning Remarks</Typography>
            <TextField
              fullWidth
              multiline
              minRows={10}
              value={remarksDraft}
              onChange={(event) => onRemarksChange(event.target.value)}
              placeholder="Input early warning remarks or use existing impairment reason"
            />
            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
              <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                Reference
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    void onReferenceSelect(file);
                  }}
                />
              </Button>
              {existingDocumentName ? (
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={onDownloadExisting}>
                  Download Existing
                </Button>
              ) : null}
              <Button variant="contained" onClick={onOpenOverrideDialog}>
                Review & Submit Override
              </Button>
              <Button variant="outlined" onClick={onBack}>
                Back
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
