'use client';

import React from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { Download as DownloadIcon, UploadFile as UploadIcon } from '@mui/icons-material';
import { ParsedDcfRow } from './types';
import { formatAmount, formatDisplayDate } from './utils';

interface DcfUploadPreviewPanelProps {
  onDcfFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
  selectedDcfFile: File | null;
  parsedDcfRows: ParsedDcfRow[];
  onSubmitDcf: () => void | Promise<void | boolean>;
  onCancelDcf: () => void;
  uploadingDcf: boolean;
}

export function DcfUploadPreviewPanel({
  onDcfFileChange,
  onDownloadTemplate,
  selectedDcfFile,
  parsedDcfRows,
  onSubmitDcf,
  onCancelDcf,
  uploadingDcf
}: DcfUploadPreviewPanelProps) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Upload DCF</Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
        <Typography color="text.secondary">File name</Typography>
        <Button variant="contained" component="label" startIcon={<UploadIcon />}>
          Browse
          <input
            type="file"
            hidden
            accept=".xlsx,.xls"
            onChange={onDcfFileChange}
          />
        </Button>
        <Button variant="contained" color="inherit" onClick={onDownloadTemplate} startIcon={<DownloadIcon />}>
          Download Template
        </Button>
        {selectedDcfFile ? (
          <Chip label={`${selectedDcfFile.name} • ${parsedDcfRows.length} rows`} variant="outlined" />
        ) : null}
      </Stack>

      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 320, overflowX: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Account Number</TableCell>
              <TableCell>Periode</TableCell>
              <TableCell align="right">Principal</TableCell>
              <TableCell align="right">Interest</TableCell>
              <TableCell align="right">Collateral</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parsedDcfRows.length > 0 ? parsedDcfRows.map((row, index) => (
              <TableRow key={`${row.accountNumber}-${row.periode}-${index}`}>
                <TableCell>{row.accountNumber}</TableCell>
                <TableCell>{formatDisplayDate(row.periode)}</TableCell>
                <TableCell align="right">{formatAmount(row.principal)}</TableCell>
                <TableCell align="right">{formatAmount(row.interest)}</TableCell>
                <TableCell align="right">{formatAmount(row.collateral)}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No DCF upload file selected.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button variant="contained" onClick={onSubmitDcf} disabled={uploadingDcf || parsedDcfRows.length === 0}>
          {uploadingDcf ? 'Processing...' : 'Submit DCF & Build IA Detail'}
        </Button>
        <Button
          variant="outlined"
          onClick={onCancelDcf}
          disabled={uploadingDcf}
        >
          Cancel
        </Button>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
        Submit will persist the current DCF scenario, replace previous DCF upload for this account, and rebuild legacy IA detail rows.
      </Typography>
    </Box>
  );
}
