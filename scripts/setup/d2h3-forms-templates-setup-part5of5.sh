#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - PHASE 1E SETUP SCRIPT (PART 5 OF 5)
# ============================================================================
# File Path: ./scripts/setup/d2h3-forms-templates-setup-part5of5.sh
# Generated: $(date '+%Y-%m-%d %H:%M:%S')
# Phase: D2H3 - Advanced Forms & Templates API Routes & Validation
# Methodology: Phased Shell-Driven Development (PSDD) v2.0
# Objective: Generate API routes, controllers, and validation system
# Dependencies: Express, Zod, d2h3-forms-templates-setup-part4of5.sh
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d2h3-forms-templates-part5-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H3P5"
PHASE_NAME="Advanced Forms & Templates API Routes & Validation - Part 5"
PHASE_OBJECTIVE="Generate API routes, controllers, and validation"

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

# MANDATORY: Load configuration
load_configuration() {
    log_info "Loading configuration for ${PHASE_ID}..."
    
    if [[ -f "${PROJECT_ROOT}/.env" ]]; then
        source "${PROJECT_ROOT}/.env"
        log_info "Environment configuration loaded"
    else
        log_error "Environment configuration file not found"
        exit 1
    fi
}

# MANDATORY: Generate forms controller
generate_forms_controller() {
    log_info "Generating forms controller..."
    
    local controller_file="${PROJECT_ROOT}/packages/backend/src/modules/forms/controllers/forms.controller.ts"
    
    cat > "${controller_file}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/modules/forms/controllers/forms.controller.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H3P5 - Advanced Forms & Templates API Routes & Validation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Express, Zod, FormsService
// Purpose: RESTful API controller for forms management
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { FormsService } from '../services/forms.service';
import { Logger } from '../../../core/utils/logger';

// Request validation schemas
const createFormDefinitionRequestSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    title: z.string().min(1).max(500),
    description: z.string().optional(),
    schemaDefinition: z.record(z.any()),
    uiSchema: z.record(z.any()).optional(),
    validationRules: z.record(z.any()).optional(),
    formType: z.string().min(1).max(100),
    category: z.string().max(100).optional(),
    tags: z.array(z.string()).optional(),
    isTemplate: z.boolean().default(false)
  })
});

const updateFormDefinitionRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    title: z.string().min(1).max(500).optional(),
    description: z.string().optional(),
    schemaDefinition: z.record(z.any()).optional(),
    uiSchema: z.record(z.any()).optional(),
    validationRules: z.record(z.any()).optional(),
    formType: z.string().min(1).max(100).optional(),
    category: z.string().max(100).optional(),
    tags: z.array(z.string()).optional()
  })
});

const getFormDefinitionRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});

const submitFormRequestSchema = z.object({
  body: z.object({
    formDefinitionId: z.string().uuid(),
    submissionData: z.record(z.any()),
    metadata: z.record(z.any()).optional()
  })
});

const listFor