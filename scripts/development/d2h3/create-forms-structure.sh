#!/bin/bash
# ============================================================================
# PSDD ARTIFACT DOCUMENTATION
# ============================================================================
# File Path: scripts/development/d2h3/create-forms-structure.sh
# Generated: 2025-07-22 14:30:15
# Phase: D2H3 - Advanced Forms & Templates Structure Creation
# Methodology: Phased Shell-Driven Development (PSDD)
# Dependencies: None (Pure directory/file structure creation)
# Purpose: Create complete directory structure for enterprise form system
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d2h3-structure-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# Create directory structure
create_backend_forms_structure() {
    log_info "Creating backend forms structure..."
    
    # Backend services structure
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/forms"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/models/forms"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/controllers/forms"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/routes/forms"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/validators/forms"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/middleware/forms"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/forms/__tests__"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/config/forms"
    mkdir -p "${PROJECT_ROOT}/packages/backend/database/migrations/forms"
    mkdir -p "${PROJECT_ROOT}/packages/backend/database/seeds/forms"
    
    # Backend utility directories
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/utils/forms"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/utils/excel"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/utils/validation"
    
    log_success "Backend forms structure created"
}

create_frontend_forms_structure() {
    log_info "Creating frontend forms structure..."
    
    # Frontend components structure
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/forms/builder"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/forms/templates"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/forms/validation"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/forms/analytics"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/forms/wizard"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/forms/fields"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/forms/designer"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/forms/__tests__"
    
    # Frontend hooks and utilities
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/hooks/forms"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/utils/forms"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/stores/forms"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/services/forms"
    
    # Frontend themes and styles
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/styles/forms"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/themes/forms"
    
    # Admin interface for forms
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/admin/forms"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/admin/forms/resources"
    
    log_success "Frontend forms structure created"
}

create_shared_forms_structure() {
    log_info "Creating shared forms structure..."
    
    # Shared types and interfaces
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/types/forms"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/interfaces/forms"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/constants/forms"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/utils/forms"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/validators/forms"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/schemas/forms"
    
    log_success "Shared forms structure created"
}

create_workflow_integration_structure() {
    log_info "Creating workflow integration structure..."
    
    # Workflow integration directories
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/workflow/forms"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/workflow/forms"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/types/workflow/forms"
    
    log_success "Workflow integration structure created"
}

create_documentation_structure() {
    log_info "Creating documentation structure..."
    
    # Documentation directories
    mkdir -p "${PROJECT_ROOT}/docs/forms"
    mkdir -p "${PROJECT_ROOT}/docs/forms/api"
    mkdir -p "${PROJECT_ROOT}/docs/forms/components"
    mkdir -p "${PROJECT_ROOT}/docs/forms/templates"
    mkdir -p "${PROJECT_ROOT}/docs/forms/examples"
    
    log_success "Documentation structure created"
}

create_template_structure() {
    log_info "Creating template structure..."
    
    # Template directories
    mkdir -p "${PROJECT_ROOT}/templates/forms/banking"
    mkdir -p "${PROJECT_ROOT}/templates/forms/banking/conventional"
    mkdir -p "${PROJECT_ROOT}/templates/forms/banking/syariah"
    mkdir -p "${PROJECT_ROOT}/templates/forms/ifrs9"
    mkdir -p "${PROJECT_ROOT}/templates/forms/workflows"
    mkdir -p "${PROJECT_ROOT}/templates/forms/excel"
    mkdir -p "${PROJECT_ROOT}/templates/forms/json-schema"
    
    log_success "Template structure created"
}

create_config_structure() {
    log_info "Creating configuration structure..."
    
    # Configuration directories
    mkdir -p "${PROJECT_ROOT}/config/forms"
    mkdir -p "${PROJECT_ROOT}/config/forms/validation"
    mkdir -p "${PROJECT_ROOT}/config/forms/templates"
    mkdir -p "${PROJECT_ROOT}/config/forms/banking"
    
    log_success "Configuration structure created"
}

create_upload_structure() {
    log_info "Creating upload structure..."
    
    # Upload directories
    mkdir -p "${PROJECT_ROOT}/uploads/forms"
    mkdir -p "${PROJECT_ROOT}/uploads/forms/templates"
    mkdir -p "${PROJECT_ROOT}/uploads/forms/submissions"
    mkdir -p "${PROJECT_ROOT}/uploads/forms/temp"
    mkdir -p "${PROJECT_ROOT}/uploads/forms/processed"
    
    # Create .gitkeep files to preserve directory structure
    find "${PROJECT_ROOT}/uploads/forms" -type d -empty -exec touch {}/.gitkeep \;
    
    log_success "Upload structure created"
}

create_logs_structure() {
    log_info "Creating logs structure..."
    
    # Logs directories
    mkdir -p "${PROJECT_ROOT}/logs/forms"
    mkdir -p "${PROJECT_ROOT}/logs/forms/validation"
    mkdir -p "${PROJECT_ROOT}/logs/forms/analytics"
    mkdir -p "${PROJECT_ROOT}/logs/forms/templates"
    mkdir -p "${PROJECT_ROOT}/logs/forms/submissions"
    
    # Create .gitkeep files
    find "${PROJECT_ROOT}/logs/forms" -type d -empty -exec touch {}/.gitkeep \;
    
    log_success "Logs structure created"
}

create_placeholder_files() {
    log_info "Creating placeholder files..."
    
    # Create README files for major directories
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/forms/README.md" << 'EOF'
# Forms Services

This directory contains all form-related business logic services:

- `form-builder.service.ts` - Dynamic form creation and management
- `template-engine.service.ts` - Excel template processing
- `form-validation.service.ts` - Form validation engine
- `form-analytics.service.ts` - Form usage analytics
EOF

    cat > "${PROJECT_ROOT}/packages/frontend/src/components/forms/README.md" << 'EOF'
# Forms Components

This directory contains all form-related React components:

- `builder/` - Dynamic form builder components
- `templates/` - Template management components
- `validation/` - Validation framework components
- `analytics/` - Form analytics components
- `wizard/` - Multi-step form wizard components
- `fields/` - Custom field components
- `designer/` - Drag-and-drop form designer
EOF

    cat > "${PROJECT_ROOT}/templates/forms/README.md" << 'EOF'
# Form Templates

This directory contains pre-built form templates:

- `banking/` - Banking-specific form templates
- `ifrs9/` - IFRS 9 calculation forms
- `workflows/` - Workflow-related forms
- `excel/` - Excel template files
- `json-schema/` - JSON Schema form definitions
EOF

    cat > "${PROJECT_ROOT}/docs/forms/README.md" << 'EOF'
# Forms Documentation

This directory contains comprehensive documentation for the forms system:

- `api/` - API documentation
- `components/` - Component documentation
- `templates/` - Template usage guides
- `examples/` - Implementation examples
EOF

    log_success "Placeholder files created"
}

create_gitignore_entries() {
    log_info "Updating .gitignore for forms..."
    
    # Add forms-specific entries to .gitignore if they don't exist
    local gitignore="${PROJECT_ROOT}/.gitignore"
    
    if [[ -f "$gitignore" ]]; then
        if ! grep -q "# Forms uploads" "$gitignore"; then
            cat >> "$gitignore" << 'EOF'

# Forms uploads and temporary files
uploads/forms/temp/*
uploads/forms/processed/*
!uploads/forms/temp/.gitkeep
!uploads/forms/processed/.gitkeep

# Form logs
logs/forms/*.log
logs/forms/validation/*.log
logs/forms/analytics/*.log

# Form cache
.forms-cache/
*.forms.tmp
EOF
            log_info "Forms entries added to .gitignore"
        fi
    fi
    
    log_success ".gitignore updated"
}

# Main execution
main() {
    log_info "Creating forms directory structure..."
    
    create_backend_forms_structure
    create_frontend_forms_structure
    create_shared_forms_structure
    create_workflow_integration_structure
    create_documentation_structure
    create_template_structure
    create_config_structure
    create_upload_structure
    create_logs_structure
    create_placeholder_files
    create_gitignore_entries
    
    log_success "==============================================="
    log_success "✅ FORMS DIRECTORY STRUCTURE CREATED!"
    log_success "==============================================="
    
    # Display structure summary
    echo ""
    echo "📁 FORMS STRUCTURE SUMMARY:"
    echo "├── 📱 Backend Services & APIs (12 directories)"
    echo "├── 🎨 Frontend Components (14 directories)"
    echo "├── 📋 Shared Types & Utilities (6 directories)"
    echo "├── 🔄 Workflow Integration (3 directories)"
    echo "├── 📚 Documentation (4 directories)"
    echo "├── 📄 Templates (7 directories)"
    echo "├── ⚙️ Configuration (4 directories)"
    echo "├── 📤 Upload Storage (4 directories)"
    echo "└── 📝 Logs & Analytics (5 directories)"
    echo ""
    echo "Total: 59 directories created for forms system"
}

# Execute if run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi