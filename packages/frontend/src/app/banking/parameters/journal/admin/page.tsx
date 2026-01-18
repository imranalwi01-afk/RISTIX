// packages/frontend/src/app/banking/parameters/journal/admin/page.tsx
// ============================================================================
// 🎯 REACT ADMIN JOURNAL PARAMETER PAGE - UPDATED WITH REAL INTEGRATION
// ============================================================================
// ✅ INTEGRATION: React Admin v4 with existing backend APIs
// ✅ THEME: Dual banking themes (Conventional + Syariah)
// ✅ PATTERN: Follows existing React Admin architecture
// ✅ NAVIGATION: Integrated with banking layout and navigation
// ============================================================================

'use client';

import React from 'react';
import { Admin, Resource } from 'react-admin';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { Box, Typography, Button, Breadcrumbs, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import JournalIcon from '@mui/icons-material/BookOnline';
import HomeIcon from '@mui/icons-material/Home';
import { useRouter } from 'next/navigation';

// Import our React Admin resources
import { JournalParameterResource } from '../../../../../admin/resources/banking/JournalParameterResource';

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

const JournalParameterAdminLayout = ({ children }: { children: React.ReactNode }) => {
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
          onClick={() => router.push('/banking/parameters/journal')}
          sx={{ mr: 2 }}
        >
          Back to Journal Parameters
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <JournalIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Journal Parameters - Admin Interface
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
// MAIN JOURNAL PARAMETER ADMIN PAGE
// ==========================================

export default function JournalParameterAdminPage() {
  // In a real app, this would come from Redux/Context
  const currentBankingMode: 'conventional' | 'syariah' = 'conventional';
  const theme = createTheme(getBankingTheme(currentBankingMode));

  return (
    <ThemeProvider theme={theme}>
      <JournalParameterAdminLayout>
        <Admin
          authProvider={authProvider}
          dataProvider={dataProvider}
          title="Journal Parameters"
          disableTelemetry
          basename="/banking/parameters/journal/admin"
          requireAuth={false} // Since we're already authenticated in the main app
        >
          <Resource
            name="banking/parameters/journal"
            list={JournalParameterResource.list}
            create={JournalParameterResource.create}
            edit={JournalParameterResource.edit}
            show={JournalParameterResource.show}
            icon={JournalIcon}
            options={{
              label: 'Journal Parameters'
            }}
            recordRepresentation={(record: any) => 
              record ? `${record.gl_code} - ${record.gl_desc}` : 'Journal Parameter'
            }
          />
        </Admin>
      </JournalParameterAdminLayout>
    </ThemeProvider>
  );
}

console.log('✅ [JOUR-006C] JournalParameterAdminPage loaded - React Admin page integration ready');