// packages/frontend/src/components/ifrs9/SavedFiltersDialog.tsx
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Typography,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  FileDownload as LoadIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { SavedFilter } from '../../hooks/useSavedFilters';

interface SavedFiltersDialogProps {
  open: boolean;
  onClose: () => void;
  savedFilters: SavedFilter[];
  onSave: (name: string, filterData: Record<string, any>) => void;
  onLoad: (filter: SavedFilter) => void;
  onDelete: (id: string) => void;
  currentFilters: Record<string, any>;
}

const SavedFiltersDialog: React.FC<SavedFiltersDialogProps> = ({
  open,
  onClose,
  savedFilters,
  onSave,
  onLoad,
  onDelete,
  currentFilters
}) => {
  const [filterName, setFilterName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  const handleSave = () => {
    if (!filterName.trim()) {
      alert('Please enter a filter name');
      return;
    }

    onSave(filterName.trim(), currentFilters);
    setFilterName('');
    setShowSaveForm(false);
  };

  const handleLoad = (filter: SavedFilter) => {
    onLoad(filter);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilterSummary = (filters: Record<string, any>) => {
    const parts: string[] = [];
    
    if (filters.asOfDate) parts.push(`As-of: ${filters.asOfDate}`);
    if (filters.profitCenters?.length) parts.push(`PC: ${filters.profitCenters.length}`);
    if (filters.branches?.length) parts.push(`Branches: ${filters.branches.length}`);
    if (filters.stages?.length) parts.push(`Stages: ${filters.stages.join(',')}`);
    
    return parts.join(' | ');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StarIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Saved Filters</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {/* Save Current Filter Section */}
        <Box sx={{ mb: 3 }}>
          {!showSaveForm ? (
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={() => setShowSaveForm(true)}
              fullWidth
            >
              Save Current Filters
            </Button>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Save current filter configuration:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Enter filter name (e.g., 'Q1 Corporate Loans')"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                  autoFocus
                />
                <Button variant="contained" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="text" onClick={() => setShowSaveForm(false)}>
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Saved Filters List */}
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Your Saved Filters ({savedFilters.length})
        </Typography>

        {savedFilters.length === 0 ? (
          <Alert severity="info">
            No saved filters yet. Save your current filter configuration to quickly reuse it later.
          </Alert>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {savedFilters.map((filter, index) => (
              <React.Fragment key={filter.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {filter.name}
                        </Typography>
                        <Chip 
                          label="Saved" 
                          size="small" 
                          color="primary"
                          variant="outlined"
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {getFilterSummary(filter.filters)}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Updated: {formatDate(filter.updatedAt)}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleLoad(filter)}
                      sx={{ mr: 1 }}
                    >
                      <LoadIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      size="small"
                      color="error"
                      onClick={() => {
                        if (confirm(`Delete filter "${filter.name}"?`)) {
                          onDelete(filter.id);
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>

      <Divider />

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SavedFiltersDialog;
