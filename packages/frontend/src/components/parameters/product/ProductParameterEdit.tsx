// packages/frontend/src/components/parameters/product/ProductParameterEdit.tsx
// ============================================================================
// 🔧 PROD-005B: PRODUCT PARAMETER EDIT - REACT ADMIN COMPONENT
// ============================================================================
// ✅ IMPLEMENTS: React Admin Edit form for Product Parameters
// ✅ PATTERN: React Admin v4 Edit with Material-UI v6 integration
// ✅ FEATURES: Form validation, read-only product code, audit information
// ✅ INTEGRATION: Product Parameter standalone CRUD API
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  NumberInput,
  BooleanInput,
  DateField,
  TextField,
  required,
  minValue,
  maxValue,
  SaveButton,
  Toolbar,
  useRecordContext,
  Loading,
  useNotify
} from 'react-admin';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Divider,
  Alert,
  Stack,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  Lock as LockIcon
} from '@mui/icons-material';

// ==========================================
// VALIDATION RULES
// ==========================================

const validateRate = [
  minValue(0, 'Rate must be positive'),
  maxValue(100, 'Rate cannot exceed 100%')
];

const validateExpectedLife = [
  minValue(1, 'Expected life must be at least 1 month'),
  maxValue(600, 'Expected life cannot exceed 600 months (50 years)')
];

// ==========================================
// CUSTOM TOOLBAR
// ==========================================

const ProductParameterEditToolbar = () => (
  <Toolbar sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
    <SaveButton 
      label="Save Changes"
      icon={<SaveIcon />}
      variant="contained"
    />
  </Toolbar>
);

// ==========================================
// AUDIT INFORMATION SECTION
// ==========================================

const AuditInformationSection = () => {
  const record = useRecordContext();
  
  if (!record) return null;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary">
          <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Audit Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Created By
              </Typography>
              <Typography variant="body1">
                {record.createdby || 'N/A'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Created Date
              </Typography>
              <DateField 
                source="createddate" 
                record={record}
                showTime
              />
            </Box>
          </Grid>
          {record.updatedby && (
            <>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Updated By
                  </Typography>
                  <Typography variant="body1">
                    {record.updatedby}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Updated Date
                  </Typography>
                  <DateField 
                    source="updateddate" 
                    record={record}
                    showTime
                  />
                </Box>
              </Grid>
            </>
          )}
          <Grid item xs={12}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Product ID
              </Typography>
              <Chip 
                label={`ID: ${record.pkid}`}
                size="small"
                variant="outlined"
                color="primary"
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// ==========================================
// FORM SECTIONS
// ==========================================

const BasicInformationSection = () => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom color="primary">
        Basic Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextInput
            source="prd_code"
            label="Product Code"
            disabled
            helperText="Product code cannot be changed after creation"
            fullWidth
            InputProps={{
              startAdornment: <LockIcon color="action" sx={{ mr: 1 }} />
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextInput
            source="data_source"
            label="Data Source"
            helperText="Source system for product data"
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextInput
            source="prd_desc"
            label="Product Description"
            helperText="Detailed description of the banking product"
            fullWidth
            multiline
            rows={2}
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const ProductClassificationSection = ({ 
  instrumentClassOptions 
}: { 
  instrumentClassOptions: Array<{ id: string; name: string }> 
}) => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom color="primary">
        Product Classification
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <SelectInput
            source="instrument_class"
            label="Instrument Class *"
            choices={instrumentClassOptions}
            validate={[required()]}
            helperText="Asset or Liabilities classification from FRS9PRO (B0003)"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SelectInput
            source="prd_type"
            label="Product Type"
            choices={[
              { id: 'KONSUMTIF', name: 'Konsumtif' },
              { id: 'KOMERSIAL', name: 'Komersial' },
              { id: 'MIKRO', name: 'Mikro' },
              { id: 'MORTGAGE', name: 'Mortgage' },
              { id: 'PERSONAL', name: 'Personal Loan' },
              { id: 'CORPORATE', name: 'Corporate Loan' },
              { id: 'SME', name: 'SME Loan' },
              { id: 'MURABAHA', name: 'Murabaha' },
              { id: 'MUSHARAKA', name: 'Musharaka' },
              { id: 'MUDHARABA', name: 'Mudharaba' },
              { id: 'IJARAH', name: 'Ijarah' }
            ]}
            helperText="Specific product type"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SelectInput
            source="currency"
            label="Currency"
            choices={[
              { id: 'IDR', name: 'IDR - Indonesian Rupiah' },
              { id: 'USD', name: 'USD - US Dollar' },
              { id: 'EUR', name: 'EUR - Euro' },
              { id: 'SGD', name: 'SGD - Singapore Dollar' },
              { id: 'MYR', name: 'MYR - Malaysian Ringgit' },
              { id: 'JPY', name: 'JPY - Japanese Yen' }
            ]}
            helperText="Product currency"
            fullWidth
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const FinancialParametersSection = () => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom color="primary">
        Financial Parameters
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <SelectInput
            source="amortization_type"
            label="Amortization Type"
            choices={[
              { id: 'EFFECTIVE', name: 'Effective Interest Rate' },
              { id: 'STRAIGHT', name: 'Straight Line' },
              { id: 'DECLINING', name: 'Declining Balance' },
              { id: 'ANNUITY', name: 'Annuity' }
            ]}
            helperText="Method for calculating amortization"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <NumberInput
            source="expected_life"
            label="Expected Life (Months)"
            validate={validateExpectedLife}
            helperText="Expected life of the product in months (1-600)"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <NumberInput
            source="borrowing_rate"
            label="Borrowing Rate (%)"
            validate={validateRate}
            helperText="Interest rate for borrowing (0-100%)"
            step={0.01}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <NumberInput
            source="market_rate"
            label="Market Rate (%)"
            validate={validateRate}
            helperText="Market reference rate (0-100%)"
            step={0.01}
            fullWidth
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const ConfigurationFlagsSection = () => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom color="primary">
        Configuration Flags
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={3}>
          <SelectInput
            source="al_flag"
            label="AL Flag"
            choices={[
              { id: 'Y', name: 'Yes' },
              { id: 'N', name: 'No' }
            ]}
            helperText="Allowance Loss flag"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <BooleanInput
            source="impaired_flag"
            label="Impaired Flag"
            helperText="Mark if product is impaired"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <BooleanInput
            source="bm_flag"
            label="BM Flag"
            helperText="Business Model flag"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <BooleanInput
            source="active_flag"
            label="Active Status"
            helperText="Enable/disable this product"
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const EditInformationAlert = () => (
  <Alert severity="warning" sx={{ mb: 3 }}>
    <Typography variant="subtitle2" gutterBottom>
      <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
      Edit Product Parameter
    </Typography>
    <Stack spacing={1}>
      <Typography variant="body2">
        • Product Code cannot be changed after creation to maintain data integrity
      </Typography>
      <Typography variant="body2">
        • Changes to financial parameters may affect existing IFRS 9 calculations
      </Typography>
      <Typography variant="body2">
        • Deactivating a product will exclude it from future calculations
      </Typography>
      <Typography variant="body2">
        • All changes are tracked with audit information including user and timestamp
      </Typography>
    </Stack>
  </Alert>
);

// ==========================================
// TITLE COMPONENT
// ==========================================

const ProductParameterTitle = () => {
  const record = useRecordContext();
  return record ? `Edit Product: ${record.prd_code}` : 'Edit Product Parameter';
};

// ==========================================
// MAIN EDIT COMPONENT
// ==========================================

export const ProductParameterEdit = () => {
  const [instrumentClassOptions, setInstrumentClassOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notify = useNotify();

  // Fetch instrument class options on component mount
  useEffect(() => {
    const fetchInstrumentClassOptions = async () => {
      try {
        console.log('🔍 [PROD-005B] Fetching instrument class options from API');
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/v1/banking/parameters/product/instrument-class-options', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}` || ''
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          console.log('✅ [PROD-005B] Instrument class options loaded:', result.data);
          setInstrumentClassOptions(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch instrument class options');
        }
      } catch (err) {
        console.error('❌ [PROD-005B] Error fetching instrument class options:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        notify(`Error loading instrument class options: ${errorMessage}`, { type: 'error' });
        
        // Fallback to default options if API fails
        setInstrumentClassOptions([
          { id: 'A', name: 'Asset' },
          { id: 'L', name: 'Liabilities' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchInstrumentClassOptions();
  }, [notify]);

  // Show loading state while fetching options
  if (loading) {
    return (
      <Edit title="Edit Product Parameter">
        <Loading />
      </Edit>
    );
  }

  return (
  <Edit
    title={<ProductParameterTitle />}
    redirect="list"
    mutationMode="pessimistic"
    sx={{
      '& .RaEdit-main': {
        '& .RaEdit-card': {
          boxShadow: 'none',
          border: 'none'
        }
      }
    }}
  >
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Edit Product Parameter
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Update banking product parameter settings for IFRS 9 calculations and risk management.
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      <SimpleForm toolbar={<ProductParameterEditToolbar />}>
        <EditInformationAlert />
        <AuditInformationSection />
        <BasicInformationSection />
        <ProductClassificationSection instrumentClassOptions={instrumentClassOptions} />
        <FinancialParametersSection />
        <ConfigurationFlagsSection />
      </SimpleForm>
    </Box>
  </Edit>
  );
};

export default ProductParameterEdit;

console.log('✅ [PROD-005B] ProductParameterEdit component loaded - React Admin Edit form with Material-UI v6');