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
import type { Role, Permission } from './access-management.types';

interface AccessReviewTabProps {
  roles: Role[];
  permissions: Permission[];
}

export const AccessReviewTab: React.FC<AccessReviewTabProps> = ({ roles, permissions }) => (
  <>
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Access Review</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Review effective access, high-risk grants, and assignment coverage.
        </Typography>
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
