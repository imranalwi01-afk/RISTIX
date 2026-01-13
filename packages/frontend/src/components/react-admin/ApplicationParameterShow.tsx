// packages/frontend/src/components/react-admin/ApplicationParameterShow.tsx
// ============================================================================
// 🔧 APPL-005: APPLICATION PARAMETER SHOW - REACT ADMIN SHOW VIEW
// ============================================================================
// ✅ IMPLEMENTS: React Admin Show component for Application Parameters
// ✅ PATTERN: Master-Detail Pattern with detailed view
// ✅ FEATURES: Complete parameter information display with details
// ✅ INTEGRATION: Works with React Admin show operations
// ============================================================================

import React, { useState } from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  ChipField,
  ReferenceManyField,
  Datagrid,
  TopToolbar,
  EditButton,
  DeleteButton,
  ListButton,
  useRecordContext,
  useShowContext,
  Loading,
  Error,
  Button,
  useDataProvider,
  useNotify
} from 'react-admin';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import { ApplicationParameterDetailModal } from './ApplicationParameterDetail';

// =====================================================
// INTERFACES
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
// CUSTOM ACTIONS TOOLBAR
// =====================================================

const ApplicationParameterShowActions = () => {
  const record = useRecordContext<ApplicationParameterHeader>();

  if (!record) return null;

  return (
    <TopToolbar>
      <ListButton />
      <EditButton />
      <DeleteButton
        confirmTitle={`Delete Application Parameter "${record.param_code}"`}
        confirmContent="Are you sure? This will also delete all related parameter details."
      />
    </TopToolbar>
  );
};

// =====================================================
// PARAMETER DETAILS SECTION
// =====================================================

const ParameterDetailsSection: React.FC<{ parameter: ApplicationParameterHeader }> = ({ parameter }) => {
  const [details, setDetails] = useState<ApplicationParameterDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<ApplicationParameterDetail | null>(null);

  const dataProvider = useDataProvider();
  const notify = useNotify();

  React.useEffect(() => {
    loadDetails();
  }, [parameter.pkid]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      console.log(`🔍 [APPL-005] Loading details for parameter ${parameter.param_code}`);

      const response = await dataProvider.getList(`application/headers/${parameter.pkid}/details`, {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'param_seq', order: 'ASC' },
        filter: {}
      });

      if (response.data) {
        setDetails(response.data);
        console.log(`✅ [APPL-005] Loaded ${response.data.length} details`);
      }

    } catch (error) {
      console.error('❌ [APPL-005] Failed to load details:', error);
      notify('Failed to load parameter details', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (detail: ApplicationParameterDetail) => {
    setSelectedDetail(detail);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Loading />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon color="primary" />
                <Typography variant="h6">Parameter Details</Typography>
                <Chip
                  label={`${details.length} details`}
                  size="small"
                  color={details.length > 0 ? 'primary' : 'default'}
                />
              </Box>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                size="small"
                onClick={() => {
                  notify('Create detail functionality available in list view', { type: 'info' });
                }}
                label="Manage Details"
              />
            </Box>
          }
        />
        <CardContent>
          {details.length === 0 ? (
            <Alert severity="info" sx={{ textAlign: 'center' }}>
              <Typography variant="body1" gutterBottom>
                No details configured for this parameter
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Parameter details define specific configuration values and behaviors.
                Use the list view to add and manage parameter details.
              </Typography>
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.light' }}>
                    <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Sequence</TableCell>
                    <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Value 1</TableCell>
                    <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Value 2</TableCell>
                    <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Value 3</TableCell>
                    <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Created By</TableCell>
                    <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Actions</TableCell>
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
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            maxWidth: 150,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={detail.value1}
                        >
                          {detail.value1 || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            maxWidth: 150,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={detail.value2}
                        >
                          {detail.value2 || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            maxWidth: 100,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={detail.value3}
                        >
                          {detail.value3 || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={detail.paramdesc}
                        >
                          {detail.paramdesc ?
                            (detail.paramdesc.length > 60 ?
                              `${detail.paramdesc.substring(0, 60)}...` :
                              detail.paramdesc
                            ) : '-'
                          }
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {detail.createdby}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(detail.createddate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Detail">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetail(detail)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {modalOpen && selectedDetail && (
        <ApplicationParameterDetailModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedDetail(null);
          }}
          header={parameter}
          mode="view"
          selectedDetail={selectedDetail}
        />
      )}
    </>
  );
};

// =====================================================
// AUDIT INFORMATION SECTION
// =====================================================

const AuditInformationSection: React.FC<{ parameter: ApplicationParameterHeader }> = ({ parameter }) => {
  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color="primary" />
            <Typography variant="h6">Audit Information</Typography>
          </Box>
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Created Information
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`By: ${parameter.createdby}`}
                  size="small"
                  icon={<InfoIcon />}
                  variant="outlined"
                  color="primary"
                />
                <Chip
                  label={`Date: ${new Date(parameter.createddate).toLocaleString()}`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              </Box>
            </Box>
          </Grid>

          {parameter.updatedby && (
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Last Updated Information
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={`By: ${parameter.updatedby}`}
                    size="small"
                    icon={<InfoIcon />}
                    variant="outlined"
                    color="secondary"
                  />
                  {parameter.updateddate && (
                    <Chip
                      label={`Date: ${new Date(parameter.updateddate).toLocaleString()}`}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  )}
                </Box>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <SecurityIcon color="action" fontSize="small" />
              <Typography variant="caption" color="text.secondary">
                Parameter ID: {parameter.pkid} |
                Type: {parameter.param_type} |
                Code: {parameter.param_code}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// =====================================================
// MAIN SHOW COMPONENT
// =====================================================

export const ApplicationParameterShow: React.FC = () => {
  const { record, isLoading, error } = useShowContext();

  console.log('🎯 [APPL-005] Rendering ApplicationParameterShow');

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} resetErrorBoundary={() => { }} />;
  if (!record) return null;

  return (
    <Show
      actions={<ApplicationParameterShowActions />}
      title={`Application Parameter: ${record.param_code}`}
    >
      <Box sx={{ p: 2 }}>
        {/* Main Parameter Information */}
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SettingsIcon color="primary" sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {record.param_name}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Parameter Code: {record.param_code}
                  </Typography>
                </Box>
              </Box>
            }
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={`Type: ${record.param_type}`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Usage Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {record.param_usage}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Parameter Summary
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip
                    label={`Code: ${record.param_code}`}
                    size="small"
                    variant="outlined"
                    sx={{ alignSelf: 'flex-start' }}
                  />
                  <Chip
                    label={`Type: ${record.param_type}`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                    sx={{ alignSelf: 'flex-start' }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Parameter Details Section */}
        <Box sx={{ mb: 3 }}>
          <ParameterDetailsSection parameter={record} />
        </Box>

        {/* Audit Information Section */}
        <AuditInformationSection parameter={record} />
      </Box>
    </Show>
  );
};

console.log('✅ [APPL-005] ApplicationParameterShow component loaded - Comprehensive show view with master-detail display');

export default ApplicationParameterShow;