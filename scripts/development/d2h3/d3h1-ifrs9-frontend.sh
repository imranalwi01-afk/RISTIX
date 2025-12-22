#!/bin/bash
# ============================================================================
# PSDD ARTIFACT DOCUMENTATION
# ============================================================================
# File Path: ./scripts/codegen/d3h1-ifrs9-frontend.sh
# Generated: 2025-07-22 15:30:00
# Phase: D3H1 - Basic IFRS 9 Data Models
# Methodology: Phased Shell-Driven Development (PSDD)
# Purpose: Frontend components generation for IFRS 9 dashboard and interface
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d3h1-frontend-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D3H1"
PHASE_NAME="Basic IFRS 9 Data Models - Frontend"
CURRENT_PHASE="${PHASE_ID}"

# Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"

# MANDATORY: Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    log_error "Code generation failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# MANDATORY: Code generation function
generate_code_file() {
    local file_path="$1"
    local file_type="$2"
    local description="$3"
    local template_content="$4"
    
    log_info "Generating ${file_type}: ${file_path}"
    
    # Create directory if it doesn't exist
    mkdir -p "$(dirname "${file_path}")"
    
    # Generate file with MANDATORY path documentation
    cat > "${file_path}" << EOF
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: ${file_path}
// Generated: $(date)
// Phase: ${CURRENT_PHASE} - ${PHASE_NAME}
// Methodology: Phased Shell-Driven Development (PSDD)
// Purpose: ${description}
// ============================================================================

${template_content}
EOF
    
    log_success "Generated: ${file_path}"
}

# Generate IFRS 9 Main Dashboard Component
generate_ifrs9_dashboard() {
    local template_content='import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Divider
} from "@mui/material";
import {
  Calculate as CalculateIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as BankIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { EclCalculationForm } from "./EclCalculationForm";
import { PortfolioSummaryCard } from "./PortfolioSummaryCard";
import { StagingAnalysisChart } from "./StagingAnalysisChart";
import { EclTrendsChart } from "./EclTrendsChart";

interface DashboardProps {
  tenantId: string;
  bankingType: "conventional" | "syariah" | "dual";
}

interface PortfolioSummary {
  totalAccounts: number;
  totalOutstanding: number;
  stage1Count: number;
  stage2Count: number;
  stage3Count: number;
  totalEcl: number;
  coverageRatio: number;
  syariahOutstanding: number;
  conventionalOutstanding: number;
}

interface CalculationJob {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  progressPercentage: number;
  totalAccounts: number;
  processedAccounts: number;
  startTime?: Date;
  endTime?: Date;
  errorMessage?: string;
}

export const IfrsCalculationDashboard: React.FC<DashboardProps> = ({
  tenantId,
  bankingType
}) => {
  const theme = useTheme();
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [activeJobs, setActiveJobs] = useState<CalculationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCalculationForm, setShowCalculationForm] = useState(false);
  const [lastCalculationDate, setLastCalculationDate] = useState<Date | null>(null);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [tenantId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load portfolio summary
      const summaryResponse = await fetch(`/api/ifrs9/portfolio/summary?tenantId=${tenantId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "X-Tenant-ID": tenantId
        }
      });
      
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setPortfolioSummary(summaryData.data);
      }
      
      // Load active calculation jobs
      const jobsResponse = await fetch(`/api/ifrs9/ecl/jobs/active?tenantId=${tenantId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "X-Tenant-ID": tenantId
        }
      });
      
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setActiveJobs(jobsData.data || []);
      }
      
      setError(null);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCalculation = (calculationParams: any) => {
    fetch("/api/ifrs9/ecl/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "X-Tenant-ID": tenantId
      },
      body: JSON.stringify(calculationParams)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setShowCalculationForm(false);
        loadDashboardData(); // Refresh to show new job
        setLastCalculationDate(new Date());
      } else {
        setError(data.error || "Failed to start calculation");
      }
    })
    .catch(err => {
      setError("Failed to start ECL calculation");
      console.error("Calculation start error:", err);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "success";
      case "running": return "primary";
      case "failed": return "error";
      default: return "default";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: "center" }}>
          Loading IFRS 9 Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            IFRS 9 Dashboard
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Chip 
              icon={<BankIcon />}
              label={bankingType === "dual" ? "Dual Banking" : 
                    bankingType === "syariah" ? "Syariah Banking" : "Conventional Banking"}
              color="primary"
              variant="outlined"
            />
            {lastCalculationDate && (
              <Typography variant="body2" color="text.secondary">
                Last calculated: {lastCalculationDate.toLocaleString()}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={loadDashboardData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Report">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<CalculateIcon />}
            onClick={() => setShowCalculationForm(true)}
            disabled={activeJobs.some(job => job.status === "running")}
          >
            Calculate ECL
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Calculations
            </Typography>
            {activeJobs.map((job) => (
              <Box key={job.id} sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="body2">
                    Job {job.id.slice(-8)} - {job.processedAccounts}/{job.totalAccounts} accounts
                  </Typography>
                  <Chip 
                    label={job.status.toUpperCase()} 
                    color={getStatusColor(job.status) as any}
                    size="small"
                  />
                </Box>
                {job.status === "running" && (
                  <LinearProgress 
                    variant="determinate" 
                    value={job.progressPercentage} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                )}
                {job.status === "failed" && job.errorMessage && (
                  <Alert severity="error" size="small">
                    {job.errorMessage}
                  </Alert>
                )}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Portfolio Summary Cards */}
      {portfolioSummary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <PortfolioSummaryCard
              title="Total Accounts"
              value={portfolioSummary.totalAccounts.toLocaleString()}
              icon={<AssessmentIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <PortfolioSummaryCard
              title="Total Outstanding"
              value={formatCurrency(portfolioSummary.totalOutstanding)}
              icon={<TrendingUpIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <PortfolioSummaryCard
              title="Total ECL"
              value={formatCurrency(portfolioSummary.totalEcl)}
              subtitle={`Coverage: ${formatPercentage(portfolioSummary.coverageRatio)}`}
              icon={<CalculateIcon />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <PortfolioSummaryCard
              title="Default Rate"
              value={formatPercentage((portfolioSummary.stage3Count / portfolioSummary.totalAccounts) * 100)}
              subtitle={`${portfolioSummary.stage3Count} accounts`}
              icon={<AssessmentIcon />}
              color="error"
            />
          </Grid>
        </Grid>
      )}

      {/* IFRS 9 Stage Distribution */}
      {portfolioSummary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Stage 1 - Performing
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="h4" color="success.main">
                    {portfolioSummary.stage1Count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatPercentage((portfolioSummary.stage1Count / portfolioSummary.totalAccounts) * 100)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  12-month ECL applies
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Stage 2 - SICR
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="h4" color="warning.main">
                    {portfolioSummary.stage2Count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatPercentage((portfolioSummary.stage2Count / portfolioSummary.totalAccounts) * 100)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Lifetime ECL applies
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Stage 3 - Default
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="h4" color="error.main">
                    {portfolioSummary.stage3Count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatPercentage((portfolioSummary.stage3Count / portfolioSummary.totalAccounts) * 100)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Credit-impaired
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Banking Type Breakdown (for dual banking) */}
      {bankingType === "dual" && portfolioSummary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Conventional Banking
                </Typography>
                <Typography variant="h4" color="primary.main" gutterBottom>
                  {formatCurrency(portfolioSummary.conventionalOutstanding)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Interest-based products
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Syariah Banking
                </Typography>
                <Typography variant="h4" color="secondary.main" gutterBottom>
                  {formatCurrency(portfolioSummary.syariahOutstanding)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Syariah-compliant products
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Charts Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Staging Analysis
              </Typography>
              <StagingAnalysisChart 
                tenantId={tenantId}
                data={portfolioSummary ? [
                  { stage: "Stage 1", count: portfolioSummary.stage1Count, color: theme.palette.success.main },
                  { stage: "Stage 2", count: portfolioSummary.stage2Count, color: theme.palette.warning.main },
                  { stage: "Stage 3", count: portfolioSummary.stage3Count, color: theme.palette.error.main }
                ] : []}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ECL Trends
              </Typography>
              <EclTrendsChart tenantId={tenantId} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ECL Calculation Form Dialog */}
      {showCalculationForm && (
        <EclCalculationForm
          open={showCalculationForm}
          onClose={() => setShowCalculationForm(false)}
          onSubmit={handleStartCalculation}
          bankingType={bankingType}
          tenantId={tenantId}
        />
      )}
    </Box>
  );
};

export default IfrsCalculationDashboard;'

    generate_code_file \
        "packages/frontend/src/components/ifrs9/dashboard/IfrsCalculationDashboard.tsx" \
        "React Component" \
        "Main IFRS 9 calculation dashboard with comprehensive portfolio overview" \
        "$template_content"
}

# Generate ECL Calculation Form Component
generate_ecl_calculation_form() {
    local template_content='import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  Alert,
  Divider
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Calculate as CalculateIcon,
  Settings as SettingsIcon
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

interface EclCalculationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (params: CalculationParameters) => void;
  bankingType: "conventional" | "syariah" | "dual";
  tenantId: string;
}

interface CalculationParameters {
  calculationDate: Date;
  calculationType: "monthly" | "quarterly" | "annual" | "ad_hoc";
  portfolioFilter: {
    productTypes: string[];
    customerTypes: string[];
    stageFilter: number[];
    dateRange?: {
      from: Date;
      to: Date;
    };
    syariahOnly?: boolean;
    conventionalOnly?: boolean;
  };
  modelParameters: {
    pdMethod: "historical" | "through_the_cycle" | "point_in_time";
    lgdMethod: "historical" | "downturn" | "best_estimate";
    eadMethod: "current" | "credit_conversion_factor" | "behavioral";
    stagingCriteria: {
      stage1_criteria: any;
      stage2_criteria: any;
      stage3_criteria: any;
    };
    macroScenarios: {
      base_scenario: any;
      adverse_scenario?: any;
      severely_adverse_scenario?: any;
    };
  };
}

const PRODUCT_TYPES = [
  "Personal Loan",
  "Mortgage Loan", 
  "Working Capital",
  "Murabaha",
  "Musharaka",
  "Mudharaba",
  "Ijara"
];

const CUSTOMER_TYPES = [
  "Individual",
  "Corporate",
  "SME"
];

export const EclCalculationForm: React.FC<EclCalculationFormProps> = ({
  open,
  onClose,
  onSubmit,
  bankingType,
  tenantId
}) => {
  const [parameters, setParameters] = useState<CalculationParameters>({
    calculationDate: new Date(),
    calculationType: "monthly",
    portfolioFilter: {
      productTypes: [],
      customerTypes: [],
      stageFilter: [1, 2, 3]
    },
    modelParameters: {
      pdMethod: "historical",
      lgdMethod: "historical",
      eadMethod: "current",
      stagingCriteria: {
        stage1_criteria: { max_days_past_due: 30 },
        stage2_criteria: { min_days_past_due: 31, max_days_past_due: 89 },
        stage3_criteria: { min_days_past_due: 90 }
      },
      macroScenarios: {
        base_scenario: {
          gdp_growth: 5.2,
          unemployment_rate: 5.1,
          interest_rate: 6.0
        }
      }
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Filter product types based on banking type
  const getAvailableProductTypes = () => {
    if (bankingType === "conventional") {
      return PRODUCT_TYPES.filter(type => !["Murabaha", "Musharaka", "Mudharaba", "Ijara"].includes(type));
    } else if (bankingType === "syariah") {
      return PRODUCT_TYPES.filter(type => ["Murabaha", "Musharaka", "Mudharaba", "Ijara"].includes(type));
    }
    return PRODUCT_TYPES; // dual banking
  };

  const handleParameterChange = (section: string, field: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof CalculationParameters],
        [field]: value
      }
    }));
  };

  const handlePortfolioFilterChange = (field: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      portfolioFilter: {
        ...prev.portfolioFilter,
        [field]: value
      }
    }));
  };

  const handleModelParameterChange = (field: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      modelParameters: {
        ...prev.modelParameters,
        [field]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!parameters.calculationDate) {
      newErrors.calculationDate = "Calculation date is required";
    }

    if (parameters.portfolioFilter.productTypes.length === 0) {
      newErrors.productTypes = "At least one product type must be selected";
    }

    if (parameters.portfolioFilter.stageFilter.length === 0) {
      newErrors.stageFilter = "At least one IFRS 9 stage must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    // Add banking type specific filters
    const finalParameters = { ...parameters };
    if (bankingType === "syariah") {
      finalParameters.portfolioFilter.syariahOnly = true;
    } else if (bankingType === "conventional") {
      finalParameters.portfolioFilter.conventionalOnly = true;
    }

    onSubmit(finalParameters);
    setLoading(false);
  };

  const handleReset = () => {
    setParameters({
      calculationDate: new Date(),
      calculationType: "monthly",
      portfolioFilter: {
        productTypes: [],
        customerTypes: [],
        stageFilter: [1, 2, 3]
      },
      modelParameters: {
        pdMethod: "historical",
        lgdMethod: "historical",
        eadMethod: "current",
        stagingCriteria: {
          stage1_criteria: { max_days_past_due: 30 },
          stage2_criteria: { min_days_past_due: 31, max_days_past_due: 89 },
          stage3_criteria: { min_days_past_due: 90 }
        },
        macroScenarios: {
          base_scenario: {
            gdp_growth: 5.2,
            unemployment_rate: 5.1,
            interest_rate: 6.0
          }
        }
      }
    });
    setErrors({});
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: "70vh" }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalculateIcon />
          <Typography variant="h6">
            Configure ECL Calculation
          </Typography>
          <Chip 
            label={bankingType === "dual" ? "Dual Banking" : 
                  bankingType === "syariah" ? "Syariah" : "Conventional"}
            size="small"
            color="primary"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={3}>
            
            {/* Basic Parameters */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Parameters
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Calculation Date"
                value={parameters.calculationDate}
                onChange={(date) => setParameters(prev => ({ ...prev, calculationDate: date || new Date() }))}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth
                    error={!!errors.calculationDate}
                    helperText={errors.calculationDate}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Calculation Type</InputLabel>
                <Select
                  value={parameters.calculationType}
                  onChange={(e) => setParameters(prev => ({ ...prev, calculationType: e.target.value as any }))}
                  label="Calculation Type"
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="annual">Annual</MenuItem>
                  <MenuItem value="ad_hoc">Ad Hoc</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Portfolio Filter */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Portfolio Filter
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.productTypes}>
                <InputLabel>Product Types</InputLabel>
                <Select
                  multiple
                  value={parameters.portfolioFilter.productTypes}
                  onChange={(e) => handlePortfolioFilterChange("productTypes", e.target.value)}
                  label="Product Types"
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {getAvailableProductTypes().map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {errors.productTypes && (
                  <Typography variant="caption" color="error">
                    {errors.productTypes}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Customer Types</InputLabel>
                <Select
                  multiple
                  value={parameters.portfolioFilter.customerTypes}
                  onChange={(e) => handlePortfolioFilterChange("customerTypes", e.target.value)}
                  label="Customer Types"
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {CUSTOMER_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                IFRS 9 Stages to Include:
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                {[1, 2, 3].map((stage) => (
                  <FormControlLabel
                    key={stage}
                    control={
                      <Checkbox
                        checked={parameters.portfolioFilter.stageFilter.includes(stage)}
                        onChange={(e) => {
                          const currentStages = parameters.portfolioFilter.stageFilter;
                          const newStages = e.target.checked 
                            ? [...currentStages, stage]
                            : currentStages.filter(s => s !== stage);
                          handlePortfolioFilterChange("stageFilter", newStages);
                        }}
                      />
                    }
                    label={`Stage ${stage}`}
                  />
                ))}
              </Box>
              {errors.stageFilter && (
                <Typography variant="caption" color="error">
                  {errors.stageFilter}
                </Typography>
              )}
            </Grid>

            {/* Advanced Parameters */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SettingsIcon />
                    <Typography variant="h6">Advanced Model Parameters</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>PD Method</InputLabel>
                        <Select
                          value={parameters.modelParameters.pdMethod}
                          onChange={(e) => handleModelParameterChange("pdMethod", e.target.value)}
                          label="PD Method"
                        >
                          <MenuItem value="historical">Historical</MenuItem>
                          <MenuItem value="through_the_cycle">Through-the-Cycle</MenuItem>
                          <MenuItem value="point_in_time">Point-in-Time</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>LGD Method</InputLabel>
                        <Select
                          value={parameters.modelParameters.lgdMethod}
                          onChange={(e) => handleModelParameterChange("lgdMethod", e.target.value)}
                          label="LGD Method"
                        >
                          <MenuItem value="historical">Historical</MenuItem>
                          <MenuItem value="downturn">Downturn</MenuItem>
                          <MenuItem value="best_estimate">Best Estimate</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>EAD Method</InputLabel>
                        <Select
                          value={parameters.modelParameters.eadMethod}
                          onChange={(e) => handleModelParameterChange("eadMethod", e.target.value)}
                          label="EAD Method"
                        >
                          <MenuItem value="current">Current Exposure</MenuItem>
                          <MenuItem value="credit_conversion_factor">Credit Conversion Factor</MenuItem>
                          <MenuItem value="behavioral">Behavioral</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Macroeconomic Scenario */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Base Economic Scenario
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="GDP Growth (%)"
                        type="number"
                        inputProps={{ step: 0.1, min: -10, max: 20 }}
                        value={parameters.modelParameters.macroScenarios.base_scenario.gdp_growth}
                        onChange={(e) => {
                          const newScenarios = { ...parameters.modelParameters.macroScenarios };
                          newScenarios.base_scenario.gdp_growth = parseFloat(e.target.value);
                          handleModelParameterChange("macroScenarios", newScenarios);
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Unemployment Rate (%)"
                        type="number"
                        inputProps={{ step: 0.1, min: 0, max: 30 }}
                        value={parameters.modelParameters.macroScenarios.base_scenario.unemployment_rate}
                        onChange={(e) => {
                          const newScenarios = { ...parameters.modelParameters.macroScenarios };
                          newScenarios.base_scenario.unemployment_rate = parseFloat(e.target.value);
                          handleModelParameterChange("macroScenarios", newScenarios);
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Interest Rate (%)"
                        type="number"
                        inputProps={{ step: 0.1, min: 0, max: 30 }}
                        value={parameters.modelParameters.macroScenarios.base_scenario.interest_rate}
                        onChange={(e) => {
                          const newScenarios = { ...parameters.modelParameters.macroScenarios };
                          newScenarios.base_scenario.interest_rate = parseFloat(e.target.value);
                          handleModelParameterChange("macroScenarios", newScenarios);
                        }}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {bankingType === "syariah" && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Syariah-compliant adjustments will be automatically applied to PD and LGD calculations
                    based on Islamic banking principles and asset-backed nature of products.
                  </Typography>
                </Alert>
              </Grid>
            )}

          </Grid>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleReset} color="secondary">
          Reset
        </Button>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          startIcon={<CalculateIcon />}
          disabled={loading}
        >
          {loading ? "Starting..." : "Start Calculation"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EclCalculationForm;'

    generate_code_file \
        "packages/frontend/src/components/ifrs9/calculations/EclCalculationForm.tsx" \
        "React Component" \
        "ECL calculation configuration form with comprehensive parameter settings" \
        "$template_content"
}

# Generate IFRS 9 Main Page
generate_ifrs9_main_page() {
    local template_content='import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Card,
  Alert,
  CircularProgress
} from "@mui/material";
import {
  Home as HomeIcon,
  Assessment as AssessmentIcon,
  Calculate as CalculateIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon
} from "@mui/icons-material";
import { IfrsCalculationDashboard } from "../components/ifrs9/dashboard/IfrsCalculationDashboard";
import { PortfolioManagement } from "../components/ifrs9/portfolio/PortfolioManagement";
import { EclResultsView } from "../components/ifrs9/results/EclResultsView";
import { IfrsReporting } from "../components/ifrs9/reporting/IfrsReporting";
import { IfrsSettings } from "../components/ifrs9/settings/IfrsSettings";

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
      id={`ifrs9-tabpanel-${index}`}
      aria-labelledby={`ifrs9-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Ifrs9Page: NextPage = () => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(0);
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tenant information
  useEffect(() => {
    loadTenantInfo();
  }, []);

  const loadTenantInfo = async () => {
    try {
      setLoading(true);
      
      const response = await fetch("/api/tenant/info", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTenantInfo(data.data);
      } else {
        setError("Failed to load tenant information");
      }
    } catch (err) {
      setError("Failed to load tenant information");
      console.error("Tenant info load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    
    // Update URL to reflect current tab
    const tabPaths = ["dashboard", "portfolio", "results", "reporting", "settings"];
    const newPath = `/ifrs9?tab=${tabPaths[newValue]}`;
    router.push(newPath, undefined, { shallow: true });
  };

  // Set initial tab from URL parameter
  useEffect(() => {
    const { tab } = router.query;
    if (tab) {
      const tabPaths = ["dashboard", "portfolio", "results", "reporting", "settings"];
      const tabIndex = tabPaths.indexOf(tab as string);
      if (tabIndex >= 0) {
        setCurrentTab(tabIndex);
      }
    }
  }, [router.query]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>
          Loading IFRS 9 Module...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const bankingType = tenantInfo?.bankingType || "conventional";
  const tenantId = tenantInfo?.id;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="/dashboard"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Typography
          color="text.primary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <AssessmentIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          IFRS 9
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          IFRS 9 Expected Credit Loss
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive IFRS 9 implementation with {bankingType === "dual" ? "dual banking" : 
          bankingType === "syariah" ? "Syariah banking" : "conventional banking"} support
        </Typography>
      </Box>

      {/* Feature availability notice */}
      {!tenantInfo?.features?.ifrs9_enabled && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          IFRS 9 module is not enabled for your tenant. Please contact support to enable this feature.
        </Alert>
      )}

      {/* Main Navigation Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="IFRS 9 navigation tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              minHeight: 64,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 500
            }
          }}
        >
          <Tab
            icon={<AssessmentIcon />}
            iconPosition="start"
            label="Dashboard"
            id="ifrs9-tab-0"
            aria-controls="ifrs9-tabpanel-0"
          />
          <Tab
            icon={<TrendingUpIcon />}
            iconPosition="start"
            label="Portfolio"
            id="ifrs9-tab-1"
            aria-controls="ifrs9-tabpanel-1"
          />
          <Tab
            icon={<CalculateIcon />}
            iconPosition="start"
            label="ECL Results"
            id="ifrs9-tab-2"
            aria-controls="ifrs9-tabpanel-2"
          />
          <Tab
            icon={<AssessmentIcon />}
            iconPosition="start"
            label="Reporting"
            id="ifrs9-tab-3"
            aria-controls="ifrs9-tabpanel-3"
          />
          <Tab
            icon={<SettingsIcon />}
            iconPosition="start"
            label="Settings"
            id="ifrs9-tab-4"
            aria-controls="ifrs9-tabpanel-4"
          />
        </Tabs>
      </Card>

      {/* Tab Content */}
      <TabPanel value={currentTab} index={0}>
        <IfrsCalculationDashboard
          tenantId={tenantId}
          bankingType={bankingType}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <PortfolioManagement
          tenantId={tenantId}
          bankingType={bankingType}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <EclResultsView
          tenantId={tenantId}
          bankingType={bankingType}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        <IfrsReporting
          tenantId={tenantId}
          bankingType={bankingType}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={4}>
        <IfrsSettings
          tenantId={tenantId}
          bankingType={bankingType}
        />
      </TabPanel>
    </Container>
  );
};

export default Ifrs9Page;'

    generate_code_file \
        "packages/frontend/src/pages/ifrs9/index.tsx" \
        "Next.js Page" \
        "Main IFRS 9 page with tabbed navigation and comprehensive functionality" \
        "$template_content"
}

# Generate Portfolio Summary Card Component
generate_portfolio_summary_card() {
    local template_content='import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Tooltip,
  useTheme
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from "@mui/icons-material";

interface PortfolioSummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  trend?: {
    direction: "up" | "down";
    percentage: number;
    period: string;
  };
  onClick?: () => void;
}

export const PortfolioSummaryCard: React.FC<PortfolioSummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  onClick
}) => {
  const theme = useTheme();

  const getColorValue = () => {
    switch (color) {
      case "primary": return theme.palette.primary.main;
      case "secondary": return theme.palette.secondary.main;
      case "success": return theme.palette.success.main;
      case "warning": return theme.palette.warning.main;
      case "error": return theme.palette.error.main;
      case "info": return theme.palette.info.main;
      default: return theme.palette.primary.main;
    }
  };

  const formatValue = (val: string | number): string => {
    if (typeof val === "number") {
      if (val >= 1000000000) {
        return `${(val / 1000000000).toFixed(1)}B`;
      } else if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val.toString();
  };

  return (
    <Card
      sx={{
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s ease",
        "&:hover": onClick ? {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[8]
        } : {},
        position: "relative",
        overflow: "visible"
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3, pb: "16px !important" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: "text.secondary",
                fontSize: "0.875rem",
                fontWeight: 500,
                mb: 1,
                textTransform: "uppercase",
                letterSpacing: 0.5
              }}
            >
              {title}
            </Typography>
            
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 700,
                color: getColorValue(),
                mb: subtitle ? 0.5 : 2,
                lineHeight: 1.2
              }}
            >
              {formatValue(value)}
            </Typography>
            
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  mb: 1
                }}
              >
                {subtitle}
              </Typography>
            )}

            {trend && (
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                {trend.direction === "up" ? (
                  <TrendingUpIcon sx={{ color: "success.main", fontSize: 16, mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: "error.main", fontSize: 16, mr: 0.5 }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: trend.direction === "up" ? "success.main" : "error.main",
                    fontWeight: 600,
                    mr: 0.5
                  }}
                >
                  {trend.percentage}%
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {trend.period}
                </Typography>
              </Box>
            )}
          </Box>

          <Avatar
            sx={{
              bgcolor: `${getColorValue()}15`,
              color: getColorValue(),
              width: 56,
              height: 56,
              ml: 2
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PortfolioSummaryCard;'

    generate_code_file \
        "packages/frontend/src/components/ifrs9/dashboard/PortfolioSummaryCard.tsx" \
        "React Component" \
        "Portfolio summary card with metrics display and trend indicators" \
        "$template_content"
}

# Main execution function
main() {
    log_info "Starting IFRS 9 Frontend Code Generation..."
    
    # Generate frontend components
    generate_ifrs9_dashboard
    generate_ecl_calculation_form
    generate_ifrs9_main_page
    generate_portfolio_summary_card
    
    log_success "Frontend code generation completed successfully"
    log_info "Generated files logged in: ${LOG_FILE}"
    
    log_info "Next: Database migrations generation..."
}

# Execute main function
main "$@"