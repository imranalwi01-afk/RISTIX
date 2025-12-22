// packages/frontend/src/components/react-admin/ApplicationParameterList.tsx
// ============================================================================
// 🔧 APPL-004: APPLICATION PARAMETER LIST - REACT ADMIN MASTER-DETAIL PATTERN
// ============================================================================
// ✅ IMPLEMENTS: React Admin List component for Application Parameters
// ✅ PATTERN: Master-Detail Pattern with expandable detail rows
// ✅ API: Integrates with new /api/v1/application/headers endpoints
// ✅ FEATURES: Advanced filtering, sorting, bulk operations, detail management
// ============================================================================

import React, { useState } from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  ChipField,
  EditButton,
  DeleteButton,
  ShowButton,
  CreateButton,
  TopToolbar,
  FilterButton,
  ExportButton,
  BulkDeleteButton,
  BulkExportButton,
  useListContext,
  useRecordContext,
  RecordContextProvider,
  useRefresh,
  useNotify,
  Button,
  useDataProvider,
  Loading,
  Error
} from 'react-admin';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Collapse
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

import { ApplicationParameterDetailModal } from './ApplicationParameterDetail';

// =====================================================
// INTERFACES & TYPES
// =====================================================

interface ApplicationParameterHeader {
  pkid: number;
  param_code: string;
  param_name: string;
  param_usage: string;
  param_type: string;
  createdby: string;
  createddate: string;
  updatedby?: string;
  updateddate?: string;
  details?: ApplicationParameterDetail[];
}

interface ApplicationParameterDetail {
  pkid: number;
  param_code: string;
  param_seq: number;
  value1: string;
  value2?: string;
  value3?: string;
  paramdesc?: string;
  createdby: string;
  createddate: string;
  updatedby?: string;
  updateddate?: string;
}

// =====================================================
// EXPANDABLE ROW COMPONENT
// =====================================================

const ExpandableRow: React.FC<{ record: ApplicationParameterHeader }> = ({ record }) => {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<ApplicationParameterDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const loadDetails = async () => {
    if (!open && details.length === 0) {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`🔍 [APPL-004] Loading details for header ${record.param_code}`);
        
        // Use the new master-detail API endpoint
        const response = await dataProvider.getList('application/headers', {
          target: `application/headers/${record.pkid}/details`,
          pagination: { page: 1, perPage: 100 },
          sort: { field: 'param_seq', order: 'ASC' },
          filter: {}
        });
        
        if (response.data) {
          setDetails(response.data);
          console.log(`✅ [APPL-004] Loaded ${response.data.length} details for ${record.param_code}`);
        }
        
      } catch (error) {
        console.error('❌ [APPL-004] Failed to load details:', error);
        setError('Failed to load parameter details');
        notify('Failed to load parameter details', { type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggle = () => {
    setOpen(!open);
    if (!open) {
      loadDetails();
    }
  };

  const handleDeleteDetail = async (detailId: number) => {
    if (!confirm('Are you sure you want to delete this detail?')) {
      return;
    }

    try {
      await dataProvider.delete('application/details', {
        id: detailId,
        previousData: details.find(d => d.pkid === detailId)
      });
      
      // Refresh details list
      setDetails(details.filter(d => d.pkid !== detailId));
      notify('Detail deleted successfully', { type: 'success' });
      
    } catch (error) {
      console.error('❌ [APPL-004] Failed to delete detail:', error);
      notify('Failed to delete detail', { type: 'error' });
    }
  };

  return (
    <>
      <TableCell>
        <IconButton
          aria-label="expand row"
          size="small"
          onClick={handleToggle}
          color={details.length > 0 ? 'primary' : 'default'}
        >
          {open ? <ArrowUpIcon /> : <ArrowDownIcon />}
        </IconButton>
      </TableCell>
      
      <TableCell>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box sx={{ margin: 1 }}>
            <Typography variant="h6" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center' }}>
              <SettingsIcon sx={{ mr: 1 }} />
              Parameter Details for {record.param_code}
              <Chip 
                label={`${details.length} details`} 
                size="small" 
                color="primary" 
                sx={{ ml: 2 }} 
              />
            </Typography>
            
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Loading />
              </Box>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {!loading && !error && details.length === 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                No details configured for this parameter. 
                <Button 
                  size="small" 
                  startIcon={<AddIcon />}
                  sx={{ ml: 1 }}
                  onClick={() => {
                    // TODO: Open create detail dialog
                    notify('Create detail functionality coming soon', { type: 'info' });
                  }}
                >
                  Add First Detail
                </Button>
              </Alert>
            )}
            
            {!loading && !error && details.length > 0 && (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small" aria-label="parameter details">
                  <TableHead>
                    <TableRow>
                      <TableCell>Seq</TableCell>
                      <TableCell>Value 1</TableCell>
                      <TableCell>Value 2</TableCell>
                      <TableCell>Value 3</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Created By</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {details.map((detail) => (
                      <TableRow key={detail.pkid} hover>
                        <TableCell>
                          <Chip label={detail.param_seq} size="small" color="primary" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                            {detail.value1 || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {detail.value2 || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {detail.value3 || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" title={detail.paramdesc}>
                            {detail.paramdesc ? 
                              (detail.paramdesc.length > 50 ? 
                                `${detail.paramdesc.substring(0, 50)}...` : 
                                detail.paramdesc
                              ) : '-'
                            }
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {detail.createdby}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit Detail">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => {
                                // TODO: Open edit detail dialog
                                notify('Edit detail functionality coming soon', { type: 'info' });
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Detail">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteDetail(detail.pkid)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  variant="outlined"
                  onClick={() => setModalOpen(true)}
                >
                  Manage Details
                </Button>
                <Button
                  size="small"
                  startIcon={<ViewIcon />}
                  variant="outlined"
                  onClick={() => setModalOpen(true)}
                >
                  View All
                </Button>
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                Parameter: {record.param_name} | Usage: {record.param_usage}
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </TableCell>
      
      {/* ApplicationParameterDetailModal Integration */}
      {modalOpen && (
        <ApplicationParameterDetailModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            // Refresh details when modal closes to reflect any changes
            if (open) {
              loadDetails();
            }
          }}
          header={record}
          mode="view"
          selectedDetail={null}
          onSave={(savedDetail) => {
            console.log('✅ [APPL-005] Detail saved:', savedDetail);
            // Refresh the details list
            loadDetails();
            notify('Parameter detail saved successfully', { type: 'success' });
          }}
          onDelete={(deletedDetailId) => {
            console.log('✅ [APPL-005] Detail deleted:', deletedDetailId);
            // Remove from local state
            setDetails(details.filter(d => d.pkid !== deletedDetailId));
            notify('Parameter detail deleted successfully', { type: 'success' });
          }}
        />
      )}
    </>
  );
};

// =====================================================
// CUSTOM ACTIONS TOOLBAR
// =====================================================

const ApplicationParameterActions = () => {
  const refresh = useRefresh();
  
  return (
    <TopToolbar>
      <FilterButton />
      <CreateButton 
        label="Add Parameter"
        variant="contained"
        sx={{ ml: 1 }}
      />
      <ExportButton 
        label="Export"
        variant="outlined"
        sx={{ ml: 1 }}
      />
      <Button
        onClick={() => {
          refresh();
          console.log('🔄 [APPL-004] Refreshing application parameters');
        }}
        label="Refresh"
        variant="outlined"
        sx={{ ml: 1 }}
      />
    </TopToolbar>
  );
};

// =====================================================
// BULK ACTIONS
// =====================================================

const ApplicationParameterBulkActions = () => (
  <>
    <BulkExportButton />
    <BulkDeleteButton 
      confirmTitle="Delete Application Parameters"
      confirmContent="Are you sure you want to delete these parameters? This will also delete all related details."
    />
  </>
);

// =====================================================
// MAIN LIST COMPONENT
// =====================================================

export const ApplicationParameterList: React.FC = () => {
  console.log('🎯 [APPL-004] Rendering ApplicationParameterList with React Admin master-detail pattern');

  return (
    <List
      resource="application/headers"
      title="Application Parameters"
      actions={<ApplicationParameterActions />}
      bulkActionButtons={<ApplicationParameterBulkActions />}
      perPage={25}
      sort={{ field: 'param_code', order: 'ASC' }}
      filter={{ param_type: 'A' }}
      sx={{
        '& .RaList-main': {
          '& .MuiCard-root': {
            boxShadow: 2,
          }
        }
      }}
    >
      <Datagrid
        rowClick={false}
        expand={ExpandableRow}
        sx={{
          '& .RaDatagrid-headerRow': {
            backgroundColor: 'primary.light',
            '& .RaDatagrid-headerCell': {
              color: 'primary.contrastText',
              fontWeight: 'bold'
            }
          },
          '& .RaDatagrid-row:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      >
        {/* Core Parameter Fields */}
        <TextField 
          source="param_code" 
          label="Parameter Code"
          sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
        />
        
        <TextField 
          source="param_name" 
          label="Parameter Name"
          sx={{ fontWeight: 'bold' }}
        />
        
        <TextField 
          source="param_usage" 
          label="Usage Description"
          sx={{ maxWidth: 300 }}
        />
        
        <ChipField 
          source="param_type" 
          label="Type"
          sx={{ 
            '& .MuiChip-root': { 
              backgroundColor: 'secondary.light',
              color: 'secondary.contrastText'
            }
          }}
        />
        
        {/* Audit Fields */}
        <TextField 
          source="createdby" 
          label="Created By"
          sx={{ fontSize: '0.875rem' }}
        />
        
        <DateField 
          source="createddate" 
          label="Created Date"
          showTime
          sx={{ fontSize: '0.875rem' }}
        />
        
        {/* Action Buttons */}
        <Box component="div" sx={{ display: 'flex', gap: 1 }}>
          <ShowButton 
            label="View"
            variant="outlined"
            size="small"
          />
          <EditButton 
            label="Edit"
            variant="contained"
            size="small"
            color="primary"
          />
          <DeleteButton 
            label="Delete"
            variant="outlined"
            size="small"
            color="error"
            confirmTitle="Delete Application Parameter"
            confirmContent="Are you sure? This will also delete all parameter details."
          />
        </Box>
      </Datagrid>
    </List>
  );
};

// =====================================================
// EMPTY COMPONENT FOR WHEN NO DATA
// =====================================================

export const ApplicationParameterEmpty: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 400,
      textAlign: 'center',
      gap: 2
    }}
  >
    <SettingsIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
    <Typography variant="h5" color="text.secondary">
      No Application Parameters Found
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
      Application parameters define core system configuration and behavior. 
      These parameters control various aspects of the banking platform including 
      business rules, validation settings, and system limits.
    </Typography>
    <CreateButton 
      label="Create First Parameter"
      variant="contained"
      sx={{ mt: 2 }}
    />
  </Box>
);

console.log('✅ [APPL-004] ApplicationParameterList component loaded - React Admin master-detail pattern with expandable rows');

export default ApplicationParameterList;