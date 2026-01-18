// packages/frontend/src/app/banking/portfolio/products/page.tsx
// ============================================================================
// 🏦 IFRS9 BANKING PRODUCTS MANAGEMENT PAGE - COMPREHENSIVE INTERFACE
// ============================================================================
// Purpose: Complete banking product portfolio and configuration management
// Features: Product CRUD, filtering, analytics, dual banking support
// Database Integration: Real PostgreSQL with FRS9 parameters
// IFRS9 Compliance: Product parameter management and validation
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Divider,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import {
  Inventory as ProductIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as ExportIcon,
  FilterList as FilterIcon,
  TrendingUp as AnalyticsIcon,
  TrendingUp,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Business as ConventionalIcon,
  AccountBalance as SyariahIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  BankingProduct // Use the type from our new API definition
} from '../../../../store/api/portfolioApi';

// Types are now imported from portfolioApi, so we can remove the local interface if they match
// But for now, let's keep the local ProductFilters
// BankingProduct is imported above

interface ProductFilters {
  search: string;
  banking_type: string;
  product_category: string;
  is_active: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ProductManagementPage() {
  const router = useRouter();
  // const [loading, setLoading] = useState(true); // Removed to avoid conflict with derived loading

  const [products, setProducts] = useState<BankingProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<BankingProduct[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 25,
    total: 0
  });
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    banking_type: '',
    product_category: '',
    is_active: ''
  });
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<BankingProduct | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState<null | HTMLElement>(null);

  // Product statistics
  const [stats, setStats] = useState({
    total_products: 0,
    active_products: 0,
    conventional_products: 0,
    syariah_products: 0,
    avg_interest_rate: 0
  });



  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  // ✅ RTK Query Hooks
  const { data: queryData, isLoading, error } = useGetProductsQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  // const [createProduct] = useCreateProductMutation(); // Will be used in Add/Edit implementation
  // const [updateProduct] = useUpdateProductMutation(); // Will be used in Add/Edit implementation

  // Sync RTK Query data to local state
  useEffect(() => {
    if (queryData?.success && queryData.data) {
      const apiProducts = queryData.data;
      setProducts(apiProducts);
      setPagination(prev => ({
        ...prev,
        total: apiProducts.length // Client-side pagination for now as API returns all
      }));

      // Calculate statistics
      const activeProducts = apiProducts.filter((p: BankingProduct) => p.is_active);
      const conventionalProducts = apiProducts.filter((p: BankingProduct) => p.banking_type === 'conventional');
      const syariahProducts = apiProducts.filter((p: BankingProduct) => p.banking_type === 'syariah');

      let avgRate = 0;
      const productsWithRates = apiProducts.filter((p: BankingProduct) =>
        (p.interest_rate_min !== undefined && p.interest_rate_max !== undefined) ||
        (p.profit_rate_min !== undefined && p.profit_rate_max !== undefined)
      );

      if (productsWithRates.length > 0) {
        const totalRate = productsWithRates.reduce((sum: number, p: BankingProduct) => {
          const minRate = p.interest_rate_min || p.profit_rate_min || 0;
          const maxRate = p.interest_rate_max || p.profit_rate_max || 0;
          return sum + (minRate + maxRate) / 2;
        }, 0);
        avgRate = totalRate / productsWithRates.length;
      }

      setStats({
        total_products: apiProducts.length,
        active_products: activeProducts.length,
        conventional_products: conventionalProducts.length,
        syariah_products: syariahProducts.length,
        avg_interest_rate: avgRate * 100 // Convert to percentage
      });
    }
  }, [queryData]);

  // Derived loading state
  const loading = isLoading;

  const applyFilters = () => {
    let filtered = [...products];

    if (filters.search) {
      filtered = filtered.filter(product =>
        product.product_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.product_code.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.product_type.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.banking_type) {
      filtered = filtered.filter(product => product.banking_type === filters.banking_type);
    }

    if (filters.product_category) {
      filtered = filtered.filter(product => product.product_category === filters.product_category);
    }

    if (filters.is_active !== '') {
      const isActive = filters.is_active === 'true';
      filtered = filtered.filter(product => product.is_active === isActive);
    }

    setFilteredProducts(filtered);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination(prev => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0
    }));
  };


  const handleExport = async (format: 'excel' | 'csv') => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/v1/banking/portfolio/products/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      const result = await deleteProduct(selectedProduct.id).unwrap();
      if (result.success) {
        // Tag invalidation handles the refresh automatically!
        setDeleteDialogOpen(false);
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination(prev => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            router.push('/dashboard');
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Dashboard
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/banking/portfolio"
          onClick={(e) => {
            e.preventDefault();
            router.push('/banking/portfolio');
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          Portfolio Management
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <ProductIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Banking Products
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ProductIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Banking Products
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={(e) => setExportMenuOpen(e.currentTarget)}
            >
              Export
            </Button>
            <Menu
              anchorEl={exportMenuOpen}
              open={Boolean(exportMenuOpen)}
              onClose={() => setExportMenuOpen(null)}
            >
              <MenuItem onClick={() => { handleExport('excel'); setExportMenuOpen(null); }}>
                Export as Excel
              </MenuItem>
              <MenuItem onClick={() => { handleExport('csv'); setExportMenuOpen(null); }}>
                Export as CSV
              </MenuItem>
            </Menu>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Add Product
            </Button>
          </Box>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Complete banking product portfolio and configuration management
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ProductIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.total_products}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">Total Products</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AnalyticsIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.active_products}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">Active Products</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ConventionalIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.conventional_products}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">Conventional</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SyariahIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.syariah_products}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">Syariah</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.avg_interest_rate.toFixed(1)}%</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">Avg Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Product List" />
            <Tab label="Analytics" />
            <Tab label="Configuration" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Search and Filters */}
          <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Banking Type</InputLabel>
                  <Select
                    value={filters.banking_type}
                    label="Banking Type"
                    onChange={(e) => setFilters({ ...filters, banking_type: e.target.value })}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="conventional">Conventional</MenuItem>
                    <MenuItem value="syariah">Syariah</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.is_active}
                    label="Status"
                    onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={() => setFilters({ search: '', banking_type: '', product_category: '', is_active: '' })}
                  >
                    Clear Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Products Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Code</TableCell>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Banking Type</TableCell>
                  <TableCell>Rate Range</TableCell>
                  <TableCell>Tenor</TableCell>
                  <TableCell>Amount Range</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts
                  .slice(pagination.page * pagination.rowsPerPage, (pagination.page + 1) * pagination.rowsPerPage)
                  .map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Typography variant="body2" color="primary" fontWeight="bold">
                          {product.profit_rate_min ? `${product.profit_rate_min}%` : '0%'} - {product.profit_rate_max ? `${product.profit_rate_max}%` : '0%'}
                        </Typography>
                      </TableCell>
                      <TableCell>{product.product_name}</TableCell>
                      <TableCell>
                        <Chip
                          label={product.product_type}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {product.banking_type === 'conventional' ? (
                            <ConventionalIcon sx={{ mr: 1, color: 'info.main', fontSize: 16 }} />
                          ) : (
                            <SyariahIcon sx={{ mr: 1, color: 'warning.main', fontSize: 16 }} />
                          )}
                          <Typography variant="body2">
                            {product.banking_type === 'conventional' ? 'Conventional' : 'Syariah'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {product.interest_rate_min !== undefined ? (
                            `${(product.interest_rate_min * 100).toFixed(1)}% - ${((product.interest_rate_max || 0) * 100).toFixed(1)}%`
                          ) : (
                            `${(product.profit_rate_min! * 100).toFixed(1)}% - ${(product.profit_rate_max! * 100).toFixed(1)}%`
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {product.tenor_min} - {product.tenor_max} months
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {product.loan_amount_min.toLocaleString('id-ID')} - {product.loan_amount_max.toLocaleString('id-ID')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.is_active ? 'Active' : 'Inactive'}
                          color={product.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setSelectedProduct(product);
                            setAnchorEl(e.currentTarget);
                          }}
                        >
                          <MoreIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredProducts.length}
            rowsPerPage={pagination.rowsPerPage}
            page={pagination.page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Product Analytics
          </Typography>
          <Alert severity="info">
            Advanced analytics dashboard will be implemented here with product performance metrics,
            profitability analysis, and market trends.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Product Configuration
          </Typography>
          <Alert severity="info">
            Product configuration settings and parameter management will be implemented here.
          </Alert>
        </TabPanel>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
          setSelectedProduct(null);
        }}
      >
        <MenuItem onClick={() => {
          setAnchorEl(null);
          // Handle view
        }}>
          <ViewIcon sx={{ mr: 2 }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => {
          setAnchorEl(null);
          // Handle edit
          setDialogOpen(true);
        }}>
          <EditIcon sx={{ mr: 2 }} /> Edit Product
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setDeleteDialogOpen(true);
          }}
          
        >
          <DeleteIcon sx={{ mr: 2 }} /> Delete Product
        </MenuItem>
      </Menu>

      {/* Add/Edit Product Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Product creation and editing functionality will be implemented here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the product "{selectedProduct?.product_name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteProduct}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}