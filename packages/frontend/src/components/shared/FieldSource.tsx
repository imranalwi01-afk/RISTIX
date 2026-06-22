'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

interface FieldSourceProps {
  table?: string;
  query?: string;
  filter?: string;
  description?: string;
  children: React.ReactElement;
}

const labelStyle = {
  fontFamily: '"Fira Code", "JetBrains Mono", monospace',
  fontSize: '0.75rem',
  lineHeight: 1.5,
};

export function FieldSource({ table, query, filter, description, children }: FieldSourceProps) {
  const titleContent = (
    <Box sx={{ py: 0.5 }}>
      {description ? (
        <Typography variant="caption" sx={{ ...labelStyle, color: '#e2e8f0', mb: 0.5, display: 'block', whiteSpace: 'pre-wrap' }}>
          {description}
        </Typography>
      ) : null}
      {query ? (
        <Box sx={{ mt: description ? 0.5 : 0 }}>
          <Typography variant="caption" sx={{ ...labelStyle, color: '#94a3b8', whiteSpace: 'pre-wrap' }}>
            {query}
          </Typography>
        </Box>
      ) : null}
      {table ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mt: (description || query) ? 1 : 0 }}>
          <Typography variant="caption" sx={{ ...labelStyle, color: '#94a3b8' }}>
            Table: <Box component="span" sx={{ color: '#38bdf8' }}>{table}</Box>
          </Typography>
          {filter ? (
            <Typography variant="caption" sx={{ ...labelStyle, color: '#94a3b8' }}>
              Filter: <Box component="span" sx={{ color: '#a78bfa' }}>{filter}</Box>
            </Typography>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
  return (
    <Tooltip title={titleContent} placement="right" arrow
      slotProps={{
        tooltip: { sx: { bgcolor: '#1e293b', maxWidth: 440, borderRadius: 1.5, border: '1px solid', borderColor: '#334155' } },
        arrow: { sx: { color: '#1e293b' } },
      }}
    >
      {children}
    </Tooltip>
  );
}
