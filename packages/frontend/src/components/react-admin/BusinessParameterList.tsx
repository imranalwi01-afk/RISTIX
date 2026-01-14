// packages/frontend/src/components/react-admin/BusinessParameterList.tsx
// ============================================================================
// 🔧 BUSI-004: BUSINESS PARAMETER LIST - MASTER-DETAIL PATTERN
// ============================================================================
// ✅ IMPLEMENTS: React Admin List component for Business Parameters
// ✅ PATTERN: Master-Detail Pattern with expandable rows and modal
// ✅ FEATURES: Professional UI, filtering, pagination, master-detail view
// ✅ API: /api/v1/business/headers (Master-Detail Pattern)
// ============================================================================

import React, { useState, useCallback } from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  TopToolbar,
  CreateButton,
  ExportButton,
  FilterButton,
  SearchInput,
  TextInput,
  useListContext,
  useNotify,
  useDataProvider,
  Button,
  useRefresh,
  Loading,
  Error
} from 'react-admin';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Alert,
  Grid,
  Card,
  CardContent,
  Collapse,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { BusinessParameterDetailModal } from './BusinessParameterDetailModal';

// ==========================================
// INTERFACE DEFINITIONS
// ==========================================

interface BusinessParameterRecord {
  pkid: number;
  id: number;
  param_code: string;
  param_name: string;
  param_usage: string;
  param_type: string;
  createdby: string;
  createddate: string;
  updatedby?: string;
  updateddate?: string;
  details: BusinessParameterDetail[];
}

interface BusinessParameterDetail {
  pkid: number;
  id: number;
  param_code: string;
  param_seq: number;
  value1: string;
  value2: string;
  value3: string;
  paramdesc: string;
  createdby: string;
  createddate: string;
  updatedby?: string;
  updateddate?: string;
}

// ==========================================
// EXPANDABLE ROW COMPONENT
// ==========================================

const ExpandableRow: React.FC<{ record: BusinessParameterRecord }> = ({ record }) => {
  const [expanded, setExpanded] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [details, setDetails] = useState<BusinessParameterDetail[]>(record.details || []);
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const toggleExpanded = useCallback(async () => {
    if (!expanded && (!details || details.length === 0)) {
      setDetailsLoading(true);
      try {
        const response = await dataProvider.getOne('business/headers', {
          id: record.pkid,
          meta: { endpoint: `business/headers/${record.pkid}/details` }
        });
        setDetails(response.data || []);
      } catch (error) {
        console.error('Failed to load business parameter details:', error);
        notify('Failed to load business parameter details', { type: 'error' });
      } finally {
        setDetailsLoading(false);
      }
    }
    setExpanded(!expanded);
  }, [expanded, details, dataProvider, record.pkid, notify]);

  return (
    <Box>
      {/* Master Row */}
      <Box
        display="flex"
        alignItems="center"
        sx={{
          p: 1,
          '&:hover': { backgroundColor: 'action.hover' },
          cursor: 'pointer'
        }}
        onClick={toggleExpanded}
      >
        <IconButton size="small" sx={{ mr: 1 }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={2}>
            <Box display="flex" alignItems="center">
              <BusinessIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2" fontWeight="bold" color="primary">
                {record.param_code}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={3}>
            <Typography variant="body2">{record.param_name}</Typography>
          </Grid>

          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">
              {record.param_usage}
            </Typography>
          </Grid>

          <Grid item xs={2}>
            <Chip
              label="BUSINESS"
              size="small"
              color="success"
              variant="outlined"
              icon={<SettingsIcon />}
            />
          </Grid>

          <Grid item xs={2}>
            <Typography variant="caption" color="text.secondary">
              {details?.length || 0} details
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Detail Rows */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ pl: 6, pr: 2, pb: 2 }}>
          {detailsLoading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <Loading />
            </Box>
          ) : details && details.length > 0 ? (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  📋 Business Parameter Details ({details.length})
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Seq</strong></TableCell>
                        <TableCell><strong>Value 1</strong></TableCell>
                        <TableCell><strong>Value 2</strong></TableCell>
                        <TableCell><strong>Value 3</strong></TableCell>
                        <TableCell><strong>Description</strong></TableCell>
                        <TableCell><strong>Created By</strong></TableCell>
                        <TableCell><strong>Created Date</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {details.map((detail) => (
                        <TableRow key={detail.pkid} hover>
                          <TableCell>
                            <Chip
                              label={detail.param_seq}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {detail.value1}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {detail.value2 || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {detail.value3 || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {detail.paramdesc || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {detail.createdby}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(detail.createddate).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="body2">
                No details found for this business parameter. Click "View Details" to add some.
              </Typography>
            </Alert>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

// ==========================================
// LIST ACTIONS TOOLBAR
// ==========================================

const BusinessParameterListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton label="Add Business Parameter" />
    <ExportButton />
  </TopToolbar>
);

// ==========================================
// LIST FILTERS
// ==========================================

const businessParameterFilters = [
  <SearchInput source="q" placeholder="Search business parameters..." alwaysOn />,
  <TextInput label="Parameter Code" source="param_code" />,
  <TextInput label="Parameter Name" source="param_name" />,
  <TextInput label="Created By" source="createdby" />
];

// ==========================================
// MAIN LIST COMPONENT
// ==========================================

export const BusinessParameterList: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BusinessParameterRecord | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<BusinessParameterDetail | null>(null);
  const notify = useNotify();
  const refresh = useRefresh();

  // Handle view details
  const handleViewDetails = useCallback((record: BusinessParameterRecord) => {
    console.log('🔍 [BUSI-004] Opening business parameter details for:', record.param_code);
    setSelectedRecord(record);
    setSelectedDetail(null);
    setModalOpen(true);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedRecord(null);
    setSelectedDetail(null);
  }, []);

  // Handle detail save
  const handleDetailSave = useCallback((savedDetail: BusinessParameterDetail) => {
    console.log('✅ [BUSI-004] Business parameter detail saved:', savedDetail);
    notify('Business parameter detail saved successfully', { type: 'success' });
    refresh();
    setModalOpen(false);
  }, [notify, refresh]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🔧 Business Parameter Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage business configuration parameters with master-detail relationships.
          These parameters control business logic and operational rules.
        </Typography>
      </Box>

      {/* List Component */}
      <List
        resource="business/headers"
        title="Business Parameters"
        actions={<BusinessParameterListActions />}
        filters={businessParameterFilters}
        perPage={25}
        sort={{ field: 'param_code', order: 'ASC' }}
        sx={{
          '& .RaList-content': {
            backgroundColor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1
          }
        }}
      >
        <BusinessParameterDatagrid onViewDetails={handleViewDetails} />
      </List>

      {/* Detail Modal */}
      {modalOpen && selectedRecord && (
        <BusinessParameterDetailModal
          open={modalOpen}
          onClose={handleModalClose}
          header={selectedRecord}
          mode="view"
          selectedDetail={selectedDetail}
          onSave={handleDetailSave}
        />
      )}
    </Box>
  );
};

// ==========================================
// CUSTOM DATAGRID COMPONENT
// ==========================================

interface BusinessParameterDatagridProps {
  onViewDetails: (record: BusinessParameterRecord) => void;
}

const BusinessParameterDatagrid: React.FC<BusinessParameterDatagridProps> = ({ onViewDetails }) => {
  const { data, isLoading, error } = useListContext<BusinessParameterRecord>();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error error={error} resetErrorBoundary={() => { }} />;
  }

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No Business Parameters Found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Start by creating your first business parameter to configure business logic.
        </Typography>
        <CreateButton label="Create First Business Parameter" />
      </Paper>
    );
  }

  return (
    <Paper>
      {/* Header Row */}
      <Box sx={{ p: 2, backgroundColor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={1}>
            <Typography variant="subtitle2" fontWeight="bold">
              Action
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="subtitle2" fontWeight="bold">
              Parameter Code
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="subtitle2" fontWeight="bold">
              Parameter Name
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="subtitle2" fontWeight="bold">
              Usage
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="subtitle2" fontWeight="bold">
              Type
            </Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography variant="subtitle2" fontWeight="bold">
              Details
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Data Rows */}
      <Box>
        {data.map((record) => (
          <Box key={record.pkid}>
            <ExpandableRow record={record} />

            {/* Action Row */}
            <Box
              sx={{
                pl: 8,
                pr: 2,
                py: 1,
                backgroundColor: 'grey.25',
                borderBottom: 1,
                borderColor: 'divider'
              }}
            >
              <Box display="flex" gap={1}>
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onViewDetails(record)}
                  >
                    <ViewIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Edit Parameter">
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => {
                      // TODO: Implement edit functionality
                      console.log('Edit business parameter:', record.param_code);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>

                <Box ml="auto">
                  <Typography variant="caption" color="text.secondary">
                    Created by {record.createdby} on {new Date(record.createddate).toLocaleDateString()}
                    {record.updatedby && record.updateddate && (
                      <span> • Updated by {record.updatedby} on {new Date(record.updateddate).toLocaleDateString()}</span>
                    )}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

console.log('✅ [BUSI-004] BusinessParameterList component loaded - Master-Detail Pattern with React Admin');