#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - DAY 2 HOUR 6 CONFIGURATION SETUP SCRIPT
# ============================================================================
# File Path: scripts/setup/d2h6-configuration-setup.sh
# Phase: D2H6 - Dual Banking Admin Themes Configuration
# Objective: Setup environment-based theme configuration management
# Generated: $(date)
# Methodology: Phased Shell-Driven Development (PSDD)
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h6-config-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H6-CONFIG"
PHASE_NAME="Dual Banking Themes Configuration Setup"

# MANDATORY: Create logs directory
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

log_warning() {
    echo "[WARNING] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    local line_number=$1
    log_error "Script failed at line ${line_number} with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap 'handle_error ${LINENO}' ERR

# Create theme environment configuration
create_theme_env_config() {
    log_info "Creating theme environment configurations..."
    
    # Development environment configuration
    cat > "${PROJECT_ROOT}/.env.theme.development" << 'EOF'
# ============================================================================
# DUAL BANKING THEME CONFIGURATION - DEVELOPMENT
# ============================================================================
# File Path: .env.theme.development
# Generated: $(date)
# Environment: Development
# Purpose: Development-specific dual banking theme configuration
# ============================================================================

# Banking Mode Configuration
NEXT_PUBLIC_BANKING_CONVENTIONAL=true
NEXT_PUBLIC_BANKING_SYARIAH=true
NEXT_PUBLIC_BANKING_DUAL_MODE=true
NEXT_PUBLIC_BANKING_DEFAULT_TYPE=conventional
NEXT_PUBLIC_ALLOW_BANKING_SWITCHING=true

# Conventional Banking Theme Colors
NEXT_PUBLIC_CONVENTIONAL_PRIMARY_COLOR=#1976D2
NEXT_PUBLIC_CONVENTIONAL_SECONDARY_COLOR=#424242
NEXT_PUBLIC_CONVENTIONAL_BACKGROUND_DEFAULT=#F5F5F5
NEXT_PUBLIC_CONVENTIONAL_BACKGROUND_PAPER=#FFFFFF

# Syariah Banking Theme Colors
NEXT_PUBLIC_SYARIAH_PRIMARY_COLOR=#2E7D32
NEXT_PUBLIC_SYARIAH_SECONDARY_COLOR=#FF8F00
NEXT_PUBLIC_SYARIAH_BACKGROUND_DEFAULT=#FFF8E1
NEXT_PUBLIC_SYARIAH_BACKGROUND_PAPER=#FFFFFF

# Feature Flags
NEXT_PUBLIC_FEATURE_CONVENTIONAL_BANKING=true
NEXT_PUBLIC_FEATURE_SYARIAH_BANKING=true
NEXT_PUBLIC_FEATURE_DUAL_BANKING=true
NEXT_PUBLIC_FEATURE_THEME_SWITCHING=true
NEXT_PUBLIC_FEATURE_TENANT_CUSTOMIZATION=true
NEXT_PUBLIC_FEATURE_MULTI_LANGUAGE=true
NEXT_PUBLIC_FEATURE_SYARIAH_COMPLIANCE=true
NEXT_PUBLIC_FEATURE_CULTURAL_ELEMENTS=true

# Localization Configuration
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,id,ar
NEXT_PUBLIC_DEFAULT_DIRECTION=ltr
NEXT_PUBLIC_RTL_SUPPORT=true

# Typography Configuration
NEXT_PUBLIC_CONVENTIONAL_FONT_FAMILY="Roboto, Helvetica, Arial, sans-serif"
NEXT_PUBLIC_SYARIAH_FONT_FAMILY="Noto Sans Arabic, Roboto, Helvetica, Arial, sans-serif"
NEXT_PUBLIC_ARABIC_FONT_FAMILY="Amiri, Noto Serif Arabic, serif"

# Development Specific
NEXT_PUBLIC_THEME_DEBUG=true
NEXT_PUBLIC_THEME_ANALYTICS=true
NEXT_PUBLIC_THEME_HOT_RELOAD=true
EOF

    # Staging environment configuration
    cat > "${PROJECT_ROOT}/.env.theme.staging" << 'EOF'
# ============================================================================
# DUAL BANKING THEME CONFIGURATION - STAGING
# ============================================================================
# File Path: .env.theme.staging
# Generated: $(date)
# Environment: Staging
# Purpose: Staging-specific dual banking theme configuration
# ============================================================================

# Banking Mode Configuration
NEXT_PUBLIC_BANKING_CONVENTIONAL=true
NEXT_PUBLIC_BANKING_SYARIAH=true
NEXT_PUBLIC_BANKING_DUAL_MODE=true
NEXT_PUBLIC_BANKING_DEFAULT_TYPE=conventional
NEXT_PUBLIC_ALLOW_BANKING_SWITCHING=true

# Conventional Banking Theme Colors
NEXT_PUBLIC_CONVENTIONAL_PRIMARY_COLOR=#1976D2
NEXT_PUBLIC_CONVENTIONAL_SECONDARY_COLOR=#424242
NEXT_PUBLIC_CONVENTIONAL_BACKGROUND_DEFAULT=#F5F5F5
NEXT_PUBLIC_CONVENTIONAL_BACKGROUND_PAPER=#FFFFFF

# Syariah Banking Theme Colors
NEXT_PUBLIC_SYARIAH_PRIMARY_COLOR=#2E7D32
NEXT_PUBLIC_SYARIAH_SECONDARY_COLOR=#FF8F00
NEXT_PUBLIC_SYARIAH_BACKGROUND_DEFAULT=#FFF8E1
NEXT_PUBLIC_SYARIAH_BACKGROUND_PAPER=#FFFFFF

# Feature Flags
NEXT_PUBLIC_FEATURE_CONVENTIONAL_BANKING=true
NEXT_PUBLIC_FEATURE_SYARIAH_BANKING=true
NEXT_PUBLIC_FEATURE_DUAL_BANKING=true
NEXT_PUBLIC_FEATURE_THEME_SWITCHING=true
NEXT_PUBLIC_FEATURE_TENANT_CUSTOMIZATION=true
NEXT_PUBLIC_FEATURE_MULTI_LANGUAGE=true
NEXT_PUBLIC_FEATURE_SYARIAH_COMPLIANCE=true
NEXT_PUBLIC_FEATURE_CULTURAL_ELEMENTS=true

# Localization Configuration
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,id,ar
NEXT_PUBLIC_DEFAULT_DIRECTION=ltr
NEXT_PUBLIC_RTL_SUPPORT=true

# Typography Configuration
NEXT_PUBLIC_CONVENTIONAL_FONT_FAMILY="Roboto, Helvetica, Arial, sans-serif"
NEXT_PUBLIC_SYARIAH_FONT_FAMILY="Noto Sans Arabic, Roboto, Helvetica, Arial, sans-serif"
NEXT_PUBLIC_ARABIC_FONT_FAMILY="Amiri, Noto Serif Arabic, serif"

# Staging Specific
NEXT_PUBLIC_THEME_DEBUG=false
NEXT_PUBLIC_THEME_ANALYTICS=true
NEXT_PUBLIC_THEME_HOT_RELOAD=false
EOF

    # Production environment configuration
    cat > "${PROJECT_ROOT}/.env.theme.production" << 'EOF'
# ============================================================================
# DUAL BANKING THEME CONFIGURATION - PRODUCTION
# ============================================================================
# File Path: .env.theme.production
# Generated: $(date)
# Environment: Production
# Purpose: Production-specific dual banking theme configuration
# ============================================================================

# Banking Mode Configuration
NEXT_PUBLIC_BANKING_CONVENTIONAL=true
NEXT_PUBLIC_BANKING_SYARIAH=true
NEXT_PUBLIC_BANKING_DUAL_MODE=true
NEXT_PUBLIC_BANKING_DEFAULT_TYPE=conventional
NEXT_PUBLIC_ALLOW_BANKING_SWITCHING=false

# Conventional Banking Theme Colors
NEXT_PUBLIC_CONVENTIONAL_PRIMARY_COLOR=#1976D2
NEXT_PUBLIC_CONVENTIONAL_SECONDARY_COLOR=#424242
NEXT_PUBLIC_CONVENTIONAL_BACKGROUND_DEFAULT=#F5F5F5
NEXT_PUBLIC_CONVENTIONAL_BACKGROUND_PAPER=#FFFFFF

# Syariah Banking Theme Colors  
NEXT_PUBLIC_SYARIAH_PRIMARY_COLOR=#2E7D32
NEXT_PUBLIC_SYARIAH_SECONDARY_COLOR=#FF8F00
NEXT_PUBLIC_SYARIAH_BACKGROUND_DEFAULT=#FFF8E1
NEXT_PUBLIC_SYARIAH_BACKGROUND_PAPER=#FFFFFF

# Feature Flags
NEXT_PUBLIC_FEATURE_CONVENTIONAL_BANKING=true
NEXT_PUBLIC_FEATURE_SYARIAH_BANKING=true
NEXT_PUBLIC_FEATURE_DUAL_BANKING=true
NEXT_PUBLIC_FEATURE_THEME_SWITCHING=false
NEXT_PUBLIC_FEATURE_TENANT_CUSTOMIZATION=true
NEXT_PUBLIC_FEATURE_MULTI_LANGUAGE=true
NEXT_PUBLIC_FEATURE_SYARIAH_COMPLIANCE=true
NEXT_PUBLIC_FEATURE_CULTURAL_ELEMENTS=true

# Localization Configuration
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,id,ar
NEXT_PUBLIC_DEFAULT_DIRECTION=ltr
NEXT_PUBLIC_RTL_SUPPORT=true

# Typography Configuration
NEXT_PUBLIC_CONVENTIONAL_FONT_FAMILY="Roboto, Helvetica, Arial, sans-serif"
NEXT_PUBLIC_SYARIAH_FONT_FAMILY="Noto Sans Arabic, Roboto, Helvetica, Arial, sans-serif"
NEXT_PUBLIC_ARABIC_FONT_FAMILY="Amiri, Noto Serif Arabic, serif"

# Production Specific
NEXT_PUBLIC_THEME_DEBUG=false
NEXT_PUBLIC_THEME_ANALYTICS=false
NEXT_PUBLIC_THEME_HOT_RELOAD=false
EOF

    log_success "Theme environment configurations created"
}

# Create localization files
create_localization_files() {
    log_info "Creating localization files for dual banking themes..."
    
    local frontend_root="${PROJECT_ROOT}/packages/frontend"
    
    # English localization
    cat > "${frontend_root}/public/locales/en/banking.json" << 'EOF'
{
  "banking": {
    "conventional": {
      "name": "Conventional Banking",
      "description": "Professional corporate banking interface",
      "features": {
        "interest_calculations": "Interest-based Calculations",
        "corporate_reports": "Corporate Reporting",
        "traditional_products": "Traditional Banking Products",
        "risk_management": "Standard Risk Management",
        "compliance_reporting": "Conventional Compliance Reporting"
      }
    },
    "syariah": {
      "name": "Syariah Banking",
      "description": "Islamic banking interface with cultural elements",
      "features": {
        "profit_sharing": "Profit-sharing Calculations",
        "islamic_products": "Islamic Product Management",
        "syariah_reports": "Syariah-compliant Reporting",
        "halal_indicators": "Halal/Haram Indicators",
        "cultural_elements": "Cultural Design Elements"
      },
      "compliance": {
        "aaoifi": "AAOIFI Standards Compliance",
        "syariah_board": "Syariah Board Approval Tracking",
        "prohibited_sectors": "Prohibited Sector Screening",
        "islamic_calendar": "Islamic Calendar Support",
        "arabic_language": "Arabic Language Support",
        "zakat_calculation": "Zakat Calculation Support"
      }
    },
    "themes": {
      "switch_to_conventional": "Switch to Conventional Banking",
      "switch_to_syariah": "Switch to Syariah Banking",
      "theme_switching": "Banking Theme",
      "current_theme": "Current Theme",
      "theme_applied": "Theme Applied Successfully",
      "theme_error": "Error Applying Theme"
    },
    "common": {
      "dashboard": "Dashboard",
      "reports": "Reports",
      "calculations": "Calculations",
      "settings": "Settings",
      "help": "Help",
      "logout": "Logout"
    }
  }
}
EOF

    # Indonesian localization
    cat > "${frontend_root}/public/locales/id/banking.json" << 'EOF'
{
  "banking": {
    "conventional": {
      "name": "Perbankan Konvensional",
      "description": "Antarmuka perbankan korporat profesional",
      "features": {
        "interest_calculations": "Perhitungan Berbasis Bunga",
        "corporate_reports": "Laporan Korporat",
        "traditional_products": "Produk Perbankan Tradisional",
        "risk_management": "Manajemen Risiko Standar",
        "compliance_reporting": "Pelaporan Kepatuhan Konvensional"
      }
    },
    "syariah": {
      "name": "Perbankan Syariah",
      "description": "Antarmuka perbankan Islam dengan elemen budaya",
      "features": {
        "profit_sharing": "Perhitungan Bagi Hasil",
        "islamic_products": "Manajemen Produk Islam",
        "syariah_reports": "Pelaporan Sesuai Syariah",
        "halal_indicators": "Indikator Halal/Haram",
        "cultural_elements": "Elemen Desain Budaya"
      },
      "compliance": {
        "aaoifi": "Kepatuhan Standar AAOIFI",
        "syariah_board": "Pelacakan Persetujuan Dewan Syariah",
        "prohibited_sectors": "Penyaringan Sektor Terlarang",
        "islamic_calendar": "Dukungan Kalender Islam",
        "arabic_language": "Dukungan Bahasa Arab",
        "zakat_calculation": "Dukungan Perhitungan Zakat"
      }
    },
    "themes": {
      "switch_to_conventional": "Beralih ke Perbankan Konvensional",
      "switch_to_syariah": "Beralih ke Perbankan Syariah",
      "theme_switching": "Tema Perbankan",
      "current_theme": "Tema Saat Ini",
      "theme_applied": "Tema Berhasil Diterapkan",
      "theme_error": "Kesalahan Menerapkan Tema"
    },
    "common": {
      "dashboard": "Dasbor",
      "reports": "Laporan",
      "calculations": "Perhitungan",
      "settings": "Pengaturan",
      "help": "Bantuan",
      "logout": "Keluar"
    }
  }
}
EOF

    # Arabic localization
    cat > "${frontend_root}/public/locales/ar/banking.json" << 'EOF'
{
  "banking": {
    "conventional": {
      "name": "الخدمات المصرفية التقليدية",
      "description": "واجهة مصرفية احترافية للشركات",
      "features": {
        "interest_calculations": "الحسابات القائمة على الفوائد",
        "corporate_reports": "التقارير المؤسسية",
        "traditional_products": "المنتجات المصرفية التقليدية",
        "risk_management": "إدارة المخاطر المعيارية",
        "compliance_reporting": "تقارير الامتثال التقليدية"
      }
    },
    "syariah": {
      "name": "المصرفية الإسلامية",
      "description": "واجهة مصرفية إسلامية مع عناصر ثقافية",
      "features": {
        "profit_sharing": "حسابات المشاركة في الأرباح",
        "islamic_products": "إدارة المنتجات الإسلامية",
        "syariah_reports": "التقارير المتوافقة مع الشريعة",
        "halal_indicators": "مؤشرات الحلال/الحرام",
        "cultural_elements": "عناصر التصميم الثقافي"
      },
      "compliance": {
        "aaoifi": "الامتثال لمعايير هيئة المحاسبة والمراجعة",
        "syariah_board": "تتبع موافقة مجلس الشريعة",
        "prohibited_sectors": "فحص القطاعات المحظورة",
        "islamic_calendar": "دعم التقويم الإسلامي",
        "arabic_language": "دعم اللغة العربية",
        "zakat_calculation": "دعم حساب الزكاة"
      }
    },
    "themes": {
      "switch_to_conventional": "التبديل إلى المصرفية التقليدية",
      "switch_to_syariah": "التبديل إلى المصرفية الإسلامية",
      "theme_switching": "موضوع المصرفية",
      "current_theme": "الموضوع الحالي",
      "theme_applied": "تم تطبيق الموضوع بنجاح",
      "theme_error": "خطأ في تطبيق الموضوع"
    },
    "common": {
      "dashboard": "لوحة التحكم",
      "reports": "التقارير",
      "calculations": "الحسابات",
      "settings": "الإعدادات",
      "help": "المساعدة",
      "logout": "تسجيل الخروج"
    }
  }
}
EOF

    log_success "Localization files created"
}

# Create theme assets
create_theme_assets() {
    log_info "Creating theme assets and resources..."
    
    local frontend_root="${PROJECT_ROOT}/packages/frontend"
    
    # Create placeholder logo files
    mkdir -p "${frontend_root}/public/assets/logos/conventional"
    mkdir -p "${frontend_root}/public/assets/logos/syariah"
    
    # Create CSS files for additional styling
    cat > "${frontend_root}/public/assets/themes/conventional/custom.css" << 'EOF'
/* ============================================================================
   CONVENTIONAL BANKING CUSTOM STYLES
   File Path: public/assets/themes/conventional/custom.css
   Generated: $(date)
   Purpose: Additional CSS for conventional banking theme
   ============================================================================ */

/* Professional Banking Layout */
.banking-conventional {
  --banking-primary: #1976D2;
  --banking-secondary: #424242;
  --banking-background: #F5F5F5;
  --banking-paper: #FFFFFF;
  --banking-text-primary: #212121;
  --banking-text-secondary: #424242;
}

/* Corporate Header Styling */
.banking-conventional .ra-layout-header {
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(25,118,210,0.2);
}

/* Professional Sidebar */
.banking-conventional .ra-layout-sidebar {
  background: var(--banking-background);
  border-right: 1px solid #E0E0E0;
}

/* Corporate Cards */
.banking-conventional .MuiCard-root {
  border-left: 4px solid var(--banking-primary);
  transition: all 0.3s ease;
}

.banking-conventional .MuiCard-root:hover {
  border-left-width: 6px;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(25,118,210,0.15);
}

/* Professional Buttons */
.banking-conventional .MuiButton-containedPrimary {
  background: linear-gradient(45deg, #1976D2 30%, #42A5F5 90%);
  box-shadow: 0 3px 5px 2px rgba(25,118,210,0.3);
}

/* Data Grid Styling */
.banking-conventional .MuiDataGrid-root {
  border: 1px solid #E0E0E0;
  border-radius: 4px;
}

.banking-conventional .MuiDataGrid-columnHeaders {
  background-color: var(--banking-primary);
  color: white;
}
EOF

    cat > "${frontend_root}/public/assets/themes/syariah/custom.css" << 'EOF'
/* ============================================================================
   SYARIAH BANKING CUSTOM STYLES
   File Path: public/assets/themes/syariah/custom.css
   Generated: $(date)
   Purpose: Additional CSS for syariah banking theme
   ============================================================================ */

/* Islamic Banking Layout */
.banking-syariah {
  --banking-primary: #2E7D32;
  --banking-secondary: #FF8F00;
  --banking-background: #FFF8E1;
  --banking-paper: #FFFFFF;
  --banking-text-primary: #212121;
  --banking-text-secondary: #424242;
  --banking-halal: #4CAF50;
  --banking-haram: #D32F2F;
}

/* Islamic Header with Pattern */
.banking-syariah .ra-layout-header {
  background: linear-gradient(135deg, #2E7D32 0%, #388E3C 100%);
  color: white;
  position: relative;
  box-shadow: 0 2px 8px rgba(46,125,50,0.2);
}

.banking-syariah .ra-layout-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px);
  background-size: 20px 20px;
  pointer-events: none;
}

/* Islamic Sidebar */
.banking-syariah .ra-layout-sidebar {
  background: linear-gradient(180deg, #FFF8E1 0%, #F1F8E9 100%);
  border-right: 1px solid rgba(46,125,50,0.2);
}

/* Islamic Cards with Golden Border */
.banking-syariah .MuiCard-root {
  border-radius: 16px;
  border: 1px solid rgba(46,125,50,0.1);
  background: linear-gradient(145deg, #FFFFFF 0%, #FFF8E1 100%);
  position: relative;
  overflow: hidden;
}

.banking-syariah .MuiCard-root::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2E7D32 0%, #FF8F00 100%);
}

.banking-syariah .MuiCard-root:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(46,125,50,0.2);
}

/* Islamic Buttons */
.banking-syariah .MuiButton-containedPrimary {
  background: linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%);
  border-radius: 12px;
  box-shadow: 0 3px 5px 2px rgba(46,125,50,0.3);
}

/* Halal/Haram Indicators */
.halal-indicator {
  background-color: var(--banking-halal) !important;
  color: white !important;
  border-radius: 16px !important;
  font-weight: 600 !important;
}

.halal-indicator::before {
  content: '✓ ';
  font-weight: bold;
}

.haram-indicator {
  background-color: var(--banking-haram) !important;
  color: white !important;
  border-radius: 16px !important;
  font-weight: 600 !important;
}

.haram-indicator::before {
  content: '✗ ';
  font-weight: bold;
}

/* Data Grid with Islamic Styling */
.banking-syariah .MuiDataGrid-root {
  border: 1px solid rgba(46,125,50,0.2);
  border-radius: 12px;
  overflow: hidden;
}

.banking-syariah .MuiDataGrid-columnHeaders {
  background: linear-gradient(90deg, #2E7D32 0%, #FF8F00 100%);
  color: white;
}

/* Islamic Typography */
.banking-syariah .arabic-text {
  font-family: 'Amiri', 'Noto Serif Arabic', serif;
  direction: rtl;
  text-align: right;
}

/* Islamic Geometric Patterns */
.islamic-pattern {
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(46,125,50,0.05) 10px, rgba(46,125,50,0.05) 20px),
    repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,143,0,0.05) 10px, rgba(255,143,0,0.05) 20px);
}

/* Prayer Time Indicator (if needed) */
.prayer-time-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--banking-primary);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 1000;
}
EOF

    log_success "Theme assets created"
}

# Setup tenant configuration templates
create_tenant_config_templates() {
    log_info "Creating tenant configuration templates..."
    
    local frontend_root="${PROJECT_ROOT}/packages/frontend"
    
    # Demo conventional tenant configuration
    cat > "${frontend_root}/src/config/tenants/demo-conventional.json" << 'EOF'
{
  "tenantId": "demo-conventional",
  "tenantName": "Demo Conventional Bank",
  "bankingType": "conventional",
  "allowThemeSwitching": true,
  "defaultLanguage": "en",
  "defaultDirection": "ltr",
  "customizations": {
    "logoUrl": "/assets/logos/conventional/demo-bank-logo.svg",
    "brandName": "Demo Conventional Bank",
    "faviconUrl": "/assets/logos/conventional/favicon.ico",
    "primaryColor": "#1976D2",
    "secondaryColor": "#424242",
    "accentColor": "#42A5F5",
    "successColor": "#4CAF50",
    "warningColor": "#FF9800",
    "errorColor": "#F44336",
    "primaryFont": "Roboto, Helvetica, Arial, sans-serif",
    "headerHeight": 64,
    "sidebarWidth": 240
  },
  "features": {
    "interestCalculations": true,
    "corporateReporting": true,
    "traditionalProducts": true,
    "riskManagement": true,
    "complianceReporting": true
  },
  "compliance": {
    "ifrs": true,
    "basel": true,
    "localRegulations": ["OJK", "BI"]
  },
  "createdAt": "2025-07-22T10:00:00Z",
  "updatedAt": "2025-07-22T10:00:00Z"
}
EOF

    # Demo syariah tenant configuration
    cat > "${frontend_root}/src/config/tenants/demo-syariah.json" << 'EOF'
{
  "tenantId": "demo-syariah",
  "tenantName": "Demo Syariah Bank",
  "bankingType": "syariah",
  "allowThemeSwitching": true,
  "defaultLanguage": "en",
  "defaultDirection": "ltr",
  "customizations": {
    "logoUrl": "/assets/logos/syariah/demo-syariah-logo.svg",
    "brandName": "Demo Syariah Bank",
    "faviconUrl": "/assets/logos/syariah/favicon.ico",
    "primaryColor": "#2E7D32",
    "secondaryColor": "#FF8F00",
    "accentColor": "#4CAF50",
    "successColor": "#4CAF50",
    "warningColor": "#FF9800",
    "errorColor": "#D32F2F",
    "primaryFont": "Noto Sans Arabic, Roboto, Helvetica, Arial, sans-serif",
    "secondaryFont": "Amiri, Noto Serif Arabic, serif",
    "headerHeight": 64,
    "sidebarWidth": 240
  },
  "features": {
    "profitSharing": true,
    "islamicProducts": true,
    "syariahReporting": true,
    "halalIndicators": true,
    "culturalElements": true
  },
  "compliance": {
    "aaoifi": true,
    "ifrs": true,
    "syariahBoard": true,
    "localRegulations": ["OJK", "DSN-MUI"]
  },
  "islamicElements": {
    "geometricPatterns": true,
    "arabicCalligraphy": false,
    "islamicColors": true,
    "halalIndicators": true,
    "haramIndicators": true,
    "qiblaDirection": false,
    "islamicCalendar": true,
    "zakatCalculator": true
  },
  "createdAt": "2025-07-22T10:00:00Z",
  "updatedAt": "2025-07-22T10:00:00Z"
}
EOF

    log_success "Tenant configuration templates created"
}

# Update main environment file with theme variables
update_main_env_file() {
    log_info "Updating main environment file with theme configuration..."
    
    # Check if theme variables already exist in .env
    if ! grep -q "NEXT_PUBLIC_BANKING_CONVENTIONAL" "${PROJECT_ROOT}/.env" 2>/dev/null; then
        log_info "Adding theme configuration to main .env file..."
        
        cat >> "${PROJECT_ROOT}/.env" << 'EOF'

# ============================================================================
# DUAL BANKING THEME CONFIGURATION
# ============================================================================

# Banking Mode Configuration
NEXT_PUBLIC_BANKING_CONVENTIONAL=true
NEXT_PUBLIC_BANKING_SYARIAH=true
NEXT_PUBLIC_BANKING_DUAL_MODE=true
NEXT_PUBLIC_BANKING_DEFAULT_TYPE=conventional
NEXT_PUBLIC_ALLOW_BANKING_SWITCHING=true

# Conventional Banking Theme Colors
NEXT_PUBLIC_CONVENTIONAL_PRIMARY_COLOR=#1976D2
NEXT_PUBLIC_CONVENTIONAL_SECONDARY_COLOR=#424242

# Syariah Banking Theme Colors
NEXT_PUBLIC_SYARIAH_PRIMARY_COLOR=#2E7D32
NEXT_PUBLIC_SYARIAH_SECONDARY_COLOR=#FF8F00

# Feature Flags
NEXT_PUBLIC_FEATURE_THEME_SWITCHING=true
NEXT_PUBLIC_FEATURE_TENANT_CUSTOMIZATION=true
NEXT_PUBLIC_FEATURE_MULTI_LANGUAGE=true
NEXT_PUBLIC_FEATURE_SYARIAH_COMPLIANCE=true

# Localization Configuration
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,id,ar
NEXT_PUBLIC_RTL_SUPPORT=true
EOF
    else
        log_info "Theme configuration already exists in .env file"
    fi
    
    log_success "Main environment file updated"
}

# Validate configuration setup
validate_configuration_setup() {
    log_info "Validating configuration setup..."
    
    local validation_passed=true
    local frontend_root="${PROJECT_ROOT}/packages/frontend"
    
    # Check if environment files exist
    local env_files=(
        ".env.theme.development"
        ".env.theme.staging"
        ".env.theme.production"
    )
    
    for env_file in "${env_files[@]}"; do
        if [[ ! -f "${PROJECT_ROOT}/${env_file}" ]]; then
            log_error "Environment file missing: ${env_file}"
            validation_passed=false
        fi
    done
    
    # Check if localization files exist
    local locale_files=(
        "public/locales/en/banking.json"
        "public/locales/id/banking.json"
        "public/locales/ar/banking.json"
    )
    
    for locale_file in "${locale_files[@]}"; do
        if [[ ! -f "${frontend_root}/${locale_file}" ]]; then
            log_error "Localization file missing: ${locale_file}"
            validation_passed=false
        fi
    done
    
    # Check if CSS files exist
    local css_files=(
        "public/assets/themes/conventional/custom.css"
        "public/assets/themes/syariah/custom.css"
    )
    
    for css_file in "${css_files[@]}"; do
        if [[ ! -f "${frontend_root}/${css_file}" ]]; then
            log_error "CSS file missing: ${css_file}"
            validation_passed=false
        fi
    done
    
    # Check if tenant configuration templates exist
    local tenant_configs=(
        "src/config/tenants/demo-conventional.json"
        "src/config/tenants/demo-syariah.json"
    )
    
    for tenant_config in "${tenant_configs[@]}"; do
        if [[ ! -f "${frontend_root}/${tenant_config}" ]]; then
            log_error "Tenant configuration missing: ${tenant_config}"
            validation_passed=false
        fi
    done
    
    if [[ "$validation_passed" == "true" ]]; then
        log_success "Configuration setup validation passed"
        return 0
    else
        log_error "Configuration setup validation failed"
        return 1
    fi
}

# Main execution function
main() {
    log_info "Starting ${PHASE_NAME} (${PHASE_ID})..."
    
    # Execute configuration setup steps
    create_theme_env_config
    create_localization_files
    create_theme_assets
    create_tenant_config_templates
    update_main_env_file
    validate_configuration_setup
    
    log_success "=== ${PHASE_NAME} completed successfully! ==="
    log_info "Configuration files created:"
    log_info "- Environment-specific theme configurations"
    log_info "- Multi-language localization files"
    log_info "- Theme-specific CSS assets"
    log_info "- Tenant configuration templates"
    log_info "- Updated main environment file"
}

# Execute main function
main "$@"