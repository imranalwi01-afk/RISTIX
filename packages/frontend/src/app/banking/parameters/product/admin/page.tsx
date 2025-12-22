// packages/frontend/src/app/banking/parameters/product/admin/page.tsx
// ============================================================================
// 🎯 REACT ADMIN PRODUCT PARAMETER PAGE - UPDATED WITH REAL INTEGRATION
// ============================================================================
// ✅ INTEGRATION: React Admin v4 with existing backend APIs
// ✅ THEME: Dual banking themes (Conventional + Syariah)
// ✅ PATTERN: Follows existing React Admin architecture
// ✅ NAVIGATION: Integrated with banking layout and navigation
// ============================================================================

'use client';

import React from 'react';
import { Admin, Resource } from 'react-admin';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Typography, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Category as ProductIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

// Import our React Admin resources
import { ProductParameterResource } from '../../../../../admin/resources/banking/ProductParameterResource';

// Import providers
import { authProvider } from '../../../../../admin/providers/auth/authProvider';
import { dataProvider } from '../../../../../admin/providers/data/dataProvider';

// Import themes
import { conventionalTheme } from '../../../../../admin/themes/conventionalTheme';
import { syariahTheme } from '../../../../../admin/themes/syariahTheme';

// ==========================================
// THEME CONFIGURATION
// ==========================================

const getBankingTheme = (mode: 'conventional' | 'syariah' = 'conventional') => {
  return mode === 'syariah' ? syariahTheme : conventionalTheme;
};

// ==========================================
// CUSTOM LAYOUT FOR EMBEDDED ADMIN
// ==========================================

const ProductParameterAdminLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: 'background.default',
      p: 2
    }}>
      {/* Header with back button */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        pb: 2,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/banking/parameters/product')}
          sx={{ mr: 2 }}
        >
          Back to Product Parameters
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ProductIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Product Parameters - Admin Interface
          </Typography>
        </Box>
      </Box>

      {/* React Admin Content */}
      <Box sx={{ 
        backgroundColor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 1
      }}>
        {children}
      </Box>
    </Box>
  );
};

// ==========================================
// MAIN PRODUCT PARAMETER ADMIN PAGE
// ==========================================

export default function ProductParameterAdminPage() {
  // In a real app, this would come from Redux/Context
  const currentBankingMode: 'conventional' | 'syariah' = 'conventional';
  const theme = createTheme(getBankingTheme(currentBankingMode));

  return (
    <ThemeProvider theme={theme}>
      <ProductParameterAdminLayout>
        <Admin
          authProvider={authProvider}
          dataProvider={dataProvider}
          title="Product Parameters"
          disableTelemetry
          basename="/banking/parameters/product/admin"
          requireAuth={false} // Since we're already authenticated in the main app
        >
          <Resource
            name="banking/parameters/product"
            list={ProductParameterResource.list}
            create={ProductParameterResource.create}
            edit={ProductParameterResource.edit}
            show={ProductParameterResource.show}
            icon={ProductIcon}
            options={{
              label: 'Product Parameters'
            }}
            recordRepresentation={(record: any) => 
              record ? `${record.prd_code} - ${record.prd_desc}` : 'Product Parameter'
            }
          />
        </Admin>
      </ProductParameterAdminLayout>
    </ThemeProvider>
  );
}

console.log('✅ [PROD-006C] ProductParameterAdminPage loaded - React Admin page integration ready');