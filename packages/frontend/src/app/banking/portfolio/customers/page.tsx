// packages/frontend/src/app/banking/portfolio/customers/page.tsx
// ============================================================================
// 🏦 CUSTOMER MANAGEMENT - TEMPORARY SIMPLIFIED VERSION
// ============================================================================
// Temporarily simplified to fix compilation errors

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  People as PageIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Link from 'next/link';

interface Customer {
  id: string;
  customerName: string;
  customerId: string;
  customerType: string;
  totalExposure: number;
}

export default function CustomerManagementPage() {
  const router = useRouter();

  // State management
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load customers data
  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock data for now - replace with actual API call
      const mockCustomers: Customer[] = [
        {
          id: '1',
          customerName: 'PT Test Company',
          customerId: 'CUST001',
          customerType: 'CORPORATE',
          totalExposure: 5000000000
        }
      ];
      setCustomers(mockCustomers);
    } catch (err: any) {
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Loading state
  if (loading && customers.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="xl">
      {/* Breadcrumb Navigation */}
      <Box sx={{ mb: 2 }}>
        <Link
          href="/banking/dashboard"
          onClick={(e) => {
            e.preventDefault();
            router.push('/banking/dashboard');
          }}
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', textDecoration: 'none' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Dashboard
        </Link>
        <Typography variant="body2" sx={{ ml: 1 }}>
          Customer Management
        </Typography>
      </Box>

      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PageIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Customer Management
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            Complete customer relationship management with IFRS9 exposure tracking
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadCustomers}
            disabled={loading}
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Customer Data */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Customer List
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {customers.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No customers found
            </Typography>
          ) : (
            <Box>
              {customers.map((customer) => (
                <Box key={customer.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="h6">{customer.customerName}</Typography>
                  <Typography variant="body2">ID: {customer.customerId}</Typography>
                  <Typography variant="body2">Type: {customer.customerType}</Typography>
                  <Typography variant="body2">Exposure: {customer.totalExposure.toLocaleString()}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}