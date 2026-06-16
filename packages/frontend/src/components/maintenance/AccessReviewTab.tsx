'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import { useSnackbar } from 'notistack';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import type { Role, Permission } from './access-management.types';

interface AccessReviewTabProps {
  roles: Role[];
  permissions: Permission[];
}

export const AccessReviewTab: React.FC<AccessReviewTabProps> = ({ roles, permissions }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      const res = await axios.post('/api/v1/rbac/matrix/import', json);
      if (res.data?.success) {
        const stats = res.data.data;
        enqueueSnackbar(`Matrix imported: ${stats.rolesAdded} roles added, ${stats.permissionsAdded} permissions added, ${stats.mappingsUpdated} mappings updated.`, { variant: 'success' });
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['access-management'] });
        queryClient.invalidateQueries({ queryKey: ['roles'] });
        queryClient.invalidateQueries({ queryKey: ['permissions'] });
      } else {
        enqueueSnackbar(res.data?.message || 'Failed to import matrix', { variant: 'error' });
      }
    } catch (error: any) {
      console.error('Matrix import error:', error);
      enqueueSnackbar(error.response?.data?.message || error.message || 'Failed to import matrix', { variant: 'error' });
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "Menu": "Admin & Maintenance",
        "Sub Menu": "User Management",
        "Permission Code": "users.view",
        "Description": "View user list and user detail",
        "Action": "view",
        "Risk Level": "low",
        "Allowed Role": "Super Admin, Admin"
      },
      {
        "Menu": "Admin & Maintenance",
        "Sub Menu": "User Management",
        "Permission Code": "users.create",
        "Description": "Create new user",
        "Action": "create",
        "Risk Level": "high",
        "Allowed Role": "Super Admin"
      },
      {
        "Menu": "Admin & Maintenance",
        "Sub Menu": "Role Management",
        "Permission Code": "roles.assign",
        "Description": "Assign role to user",
        "Action": "assign",
        "Risk Level": "high",
        "Allowed Role": "Super Admin"
      },
      {
        "Menu": "Admin & Maintenance",
        "Sub Menu": "Job Monitoring",
        "Permission Code": "jobs.run",
        "Description": "Run job manually",
        "Action": "run",
        "Risk Level": "critical",
        "Allowed Role": "Super Admin, Operator"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths for better readability
    const colWidths = [
      { wch: 25 }, // Menu
      { wch: 25 }, // Sub Menu
      { wch: 20 }, // Permission Code
      { wch: 35 }, // Description
      { wch: 10 }, // Action
      { wch: 15 }, // Risk Level
      { wch: 30 }  // Allowed Role
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Role Matrix Template");
    XLSX.writeFile(wb, "role_matrix_template.xlsx");
  };

  return (
    <>
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>Access Review</Typography>
            <Typography variant="body2" color="text.secondary">
              Review effective access, high-risk grants, and assignment coverage.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
            >
              Download Template
            </Button>
            <input
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              style={{ display: 'none' }}
              id="matrix-upload-file"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="matrix-upload-file">
              <Button
                variant="contained"
                color="primary"
                component="span"
                disabled={isUploading}
                startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <UploadFileIcon />}
              >
                {isUploading ? 'Uploading...' : 'Upload Matrix (CSV/Excel)'}
              </Button>
            </label>
          </Box>
        </Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h4" color="primary">{roles.length}</Typography>
                <Typography variant="body2" color="text.secondary">Roles</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h4" color="primary">
                  {roles.filter(r => !r.isBuiltIn).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Custom Roles</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h4" color="error.main">
                  {permissions.filter(p => p.riskLevel === 'CRITICAL').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Critical Permissions</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h4" color="warning.main">
                  {permissions.filter(p => p.requiresApproval).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Approval Required</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>

    {/* High-Risk Permissions List */}
    <Card>
      <CardHeader title="Critical & High-Risk Permissions" />
      <Divider />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Permission</TableCell>
              <TableCell>Risk</TableCell>
              <TableCell>Roles Assigned</TableCell>
              <TableCell>Approval</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permissions.filter(p => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH').map((perm) => {
              const assignedRoles = roles.filter(r =>
                r.permissions?.some((p2: any) => p2.id === perm.id || p2.code === perm.code)
              );
              return (
                <TableRow key={perm.id}>
                  <TableCell>
                    <Typography variant="body2">{perm.displayName}</Typography>
                    <Typography variant="caption" color="text.secondary">{perm.code}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={perm.riskLevel}
                      size="small"
                      color={perm.riskLevel === 'CRITICAL' ? 'error' : 'warning'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {assignedRoles.length > 0 ? (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {assignedRoles.map(r => (
                          <Chip key={r.id} label={r.displayName} size="small" variant="outlined" />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">Not assigned</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {perm.requiresApproval ? (
                      <Chip label={`Level ${perm.requiredApprovalLevel || 1}`} size="small" color="warning" variant="outlined" />
                    ) : (
                      <Typography variant="caption" color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {permissions.filter(p => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH').length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No high-risk permissions found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  </>
  );
};
