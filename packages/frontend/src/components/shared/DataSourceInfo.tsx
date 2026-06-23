'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Close from '@mui/icons-material/Close';

interface DataSourceInfoProps {
  debug?: Record<string, unknown> | null;
  title: string;
}

export function DataSourceInfo({ debug, title }: DataSourceInfoProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (!debug) return null;

  const endpoint = String(debug?.endpoint ?? debug?.reportKey ?? '');
  const requestUrl = String(debug?.requestUrl ?? '');
  const selectedSource = String(debug?.selectedSource ?? debug?.sourceTables?.[0] ?? '');
  const sourceTables = (Array.isArray(debug?.sourceTables) ? debug.sourceTables : selectedSource ? [selectedSource] : []) as string[];
  const filtersApplied = debug?.filtersApplied as Record<string, unknown> | undefined;
  const sqlPreview = debug?.sqlPreview ? String(debug.sqlPreview) : undefined;
  const notes = Array.isArray(debug?.notes) ? debug.notes as string[] : undefined;

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton size="small" onClick={handleOpen} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
        <InfoOutlined fontSize="small" />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { sx: { borderRadius: 3, width: 380, p: 2.5, maxHeight: 500 } }
        }}
      >
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
            <IconButton size="small" onClick={handleClose}><Close fontSize="small" /></IconButton>
          </Box>

          {endpoint && (
            <Box>
              <Typography variant="caption" color="text.secondary">Endpoint</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                {endpoint || requestUrl || '-'}
              </Typography>
            </Box>
          )}

          <Box>
            <Typography variant="caption" color="text.secondary">Source Table</Typography>
            <Box sx={{ mt: 0.5 }}>
              {sourceTables.length ? sourceTables.map(t => (
                <Chip key={t} label={t} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5, fontFamily: 'monospace', fontSize: '0.75rem' }} />
              )) : (
                <Chip label={selectedSource || '-'} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }} />
              )}
            </Box>
          </Box>

          {filtersApplied && Object.keys(filtersApplied).length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">Filters</Typography>
              <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                {Object.entries(filtersApplied).map(([key, value]) => (
                  <Box key={key} sx={{ display: 'flex', gap: 1, px: 1, py: 0.5, borderRadius: 1, bgcolor: alpha('#000', 0.03), fontSize: '0.8rem' }}>
                    <Typography variant="caption" fontWeight={600} sx={{ minWidth: 80 }}>{key}</Typography>
                    <Typography variant="caption" color="text.secondary">{Array.isArray(value) ? value.join(', ') : String(value)}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {notes?.length ? (
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#1976d2', 0.06) }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {notes.join(' ')}
              </Typography>
            </Box>
          ) : null}

          {sqlPreview && (
            <Box>
              <Typography variant="caption" color="text.secondary">Query Preview</Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  mt: 0.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha('#000', 0.03),
                  fontSize: '0.7rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: 200,
                  overflow: 'auto',
                  lineHeight: 1.5,
                }}
              >
                {sqlPreview}
              </Box>
            </Box>
          )}
        </Stack>
      </Popover>
    </>
  );
}
