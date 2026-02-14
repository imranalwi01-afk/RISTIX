
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Alert,
  Stack,
  Divider
} from '@mui/material';
import { 
    Add as AddIcon, 
    Edit as EditIcon, 
    Delete as DeleteIcon,
    Storage as TableIcon,
    ViewColumn as ColumnIcon,
    SettingsEthernet as OperatorIcon,
    Code as LogicIcon
} from '@mui/icons-material';

import SegmentationRuleDialog from './SegmentationRuleDialog';

interface RulesTabProps {
  rules: any[];
  onChangeRules: (rules: any[]) => void;
  readOnly?: boolean;
}

export default function RulesTab({ rules, onChangeRules, readOnly = false }: RulesTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddNew = () => {
    setEditingIndex(null);
    setDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    onChangeRules(rules.filter((_, i) => i !== index));
  };

  const handleSaveRule = (rule: any) => {
    if (editingIndex !== null) {
      const newRules = [...rules];
      newRules[editingIndex] = rule;
      onChangeRules(newRules);
    } else {
      onChangeRules([...rules, rule]);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
            <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                <LogicIcon sx={{ mr: 1 }} /> Segmentation Rules
            </Typography>
            <Typography variant="caption" color="text.secondary">
                Define the criteria for portfolio classification
            </Typography>
        </Box>
        {!readOnly && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Add New Rule
          </Button>
        )}
      </Box>

      {rules.length > 0 ? (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell width={60} sx={{ fontWeight: 'bold' }}>Seq</TableCell>
                <TableCell width={80} sx={{ fontWeight: 'bold' }}>Group</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <TableIcon fontSize="inherit" />
                        <span>Source Table</span>
                    </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                     <Stack direction="row" spacing={0.5} alignItems="center">
                        <ColumnIcon fontSize="inherit" />
                        <span>Column</span>
                    </Stack>
                </TableCell>
                <TableCell width={120} sx={{ fontWeight: 'bold' }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <OperatorIcon fontSize="inherit" />
                        <span>Operator</span>
                    </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Comparison Value</TableCell>
                <TableCell width={60} sx={{ fontWeight: 'bold' }}>Logic</TableCell>
                {!readOnly && <TableCell align="center" width={100} sx={{ fontWeight: 'bold' }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.map((rule, index) => (
                <TableRow key={rule.id || index} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{rule.seq}</TableCell>
                  <TableCell>
                      <Chip label={`G${rule.query_group || 1}`} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                      <Typography variant="body2" fontWeight={500}>{rule.table_name}</Typography>
                  </TableCell>
                  <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#1a237e' }}>{rule.column_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{rule.data_type}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                        label={rule.operator} 
                        size="small" 
                        color="secondary" 
                        variant="soft" 
                        sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>
                    {rule.operator === 'BETWEEN' ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label={rule.value1} size="small" variant="outlined" />
                            <Typography variant="caption">AND</Typography>
                            <Chip label={rule.value2} size="small" variant="outlined" />
                        </Stack>
                    ) : (
                        <Tooltip title={rule.value1 || ''}>
                           <Typography variant="body2" sx={{ maxWidth: 200, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                             {rule.value1}
                           </Typography>
                        </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                     <Chip 
                       label={rule.condition || 'AND'} 
                       size="small" 
                       color={rule.condition === 'OR' ? 'info' : 'primary'}
                       sx={{ fontWeight: 'bold', minWidth: 45 }}
                     />
                  </TableCell>
                  {!readOnly && (
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <IconButton size="small" onClick={() => handleEdit(index)} color="primary">
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(index)} color="error">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert 
            severity="info" 
            sx={{ 
                borderRadius: 2, 
                border: '1px dashed #2196f3',
                bgcolor: '#e3f2fd'
            }}
        >
          No rules defined. Please add at least one criteria to segment the portfolio.
        </Alert>
      )}

      {/* Rule Builder Dialog */}
      <SegmentationRuleDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveRule}
        initialRule={editingIndex !== null ? rules[editingIndex] : undefined}
      />
    </Box>
  );
}
