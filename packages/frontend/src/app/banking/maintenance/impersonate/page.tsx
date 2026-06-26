'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Typography, Container, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, CircularProgress, Alert,
  TextField, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions,
} from '@mui/material';
import PageHeader from '@/components/banking/shared/PageHeader';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { api } from '@/services/api';
import { apiClient } from '@/services/api-client';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import Cookies from 'js-cookie';

interface BankUser {
  id: string;
  email: string;
  fullName: string;
  username: string;
  isActive: boolean;
}

export default function ImpersonatePage() {
  const [users, setUsers] = useState<BankUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const auth = useSelector((state: RootState) => state.auth);
  const [confirmUser, setConfirmUser] = useState<BankUser | null>(null);
  const [impersonating, setImpersonating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.client.get('/users', { params: { limit: 200 } });
        const body = res.data?.data || res.data || {};
        const data = Array.isArray(body) ? body : body.users || body.data || [];
        setUsers(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const doImpersonate = useCallback(async (user: BankUser) => {
    setImpersonating(true);
    try {
      const res = await apiClient.post('/auth/impersonate', { userId: user.id });
      const { accessToken, refreshToken } = res.data?.data?.tokens || res.data?.tokens || {};
      if (!accessToken) throw new Error('No token returned');

      // Verify the new token is for the target user, not superadmin
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      if (payload.sub === auth?.user?.id) {
        throw new Error('Impersonation returned the same user token - not switching');
      }

      const original = localStorage.getItem('auth_token');
      if (original) localStorage.setItem('auth_token_original', original);

      localStorage.setItem('auth_token', accessToken);
      Cookies.set('auth_token', accessToken, { path: '/' });
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken);

      setTimeout(() => {
        window.location.replace(`/banking/dashboard?t=${Date.now()}&impersonated=1`);
      }, 100);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Impersonation failed');
      setImpersonating(false);
      setConfirmUser(null);
    }
  }, [auth?.user?.id]);

  const filtered = search
    ? users.filter(u =>
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader title="Impersonate User" subtitle="Log in as another user to troubleshoot issues." />

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <PersonSearchIcon color="action" />
        <TextField
          size="small"
          placeholder="Search by name, email, or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 350 }}
        />
        <Typography variant="caption" color="text.secondary">
          {filtered.length} users
        </Typography>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.fullName || '-'}</TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>{user.username || '-'}</TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        px: 1, py: 0.25, borderRadius: 1, fontSize: '0.75rem', fontWeight: 600,
                        bgcolor: user.isActive ? 'success.100' : 'grey.200',
                        color: user.isActive ? 'success.800' : 'grey.600',
                      }}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      disabled={!user.isActive || user.id === auth?.user?.id}
                      onClick={() => setConfirmUser(user)}
                    >
                      Impersonate
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!confirmUser} onClose={() => !impersonating && setConfirmUser(null)}>
        <DialogTitle>Confirm Impersonation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to impersonate <strong>{confirmUser?.fullName || confirmUser?.email}</strong>.
            Your current session will be saved and you will be logged in as this user.
            To return, click the orange banner at the top of the page.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmUser(null)} disabled={impersonating}>Cancel</Button>
          <Button
            onClick={() => confirmUser && doImpersonate(confirmUser)}
            color="warning"
            variant="contained"
            disabled={impersonating}
          >
            {impersonating ? <CircularProgress size={20} /> : 'Impersonate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
