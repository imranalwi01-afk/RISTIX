#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - PHASE 1D SETUP SCRIPT (PART 4 OF 5)
# ============================================================================
# File Path: ./scripts/setup/d2h3-forms-templates-setup-part4of5.sh
# Generated: $(date '+%Y-%m-%d %H:%M:%S')
# Phase: D2H3 - Advanced Forms & Templates Frontend Components
# Methodology: Phased Shell-Driven Development (PSDD) v2.0
# Objective: Generate frontend React components for forms and templates
# Dependencies: React, Material-UI, d2h3-forms-templates-setup-part3of5.sh
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d2h3-forms-templates-part4-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H3P4"
PHASE_NAME="Advanced Forms & Templates Frontend Components - Part 4"
PHASE_OBJECTIVE="Generate React components for forms and templates"

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

# MANDATORY: Generate form builder component
generate_form_builder_component() {
    log_info "Generating form builder component..."
    
    local component_file="${PROJECT_ROOT}/packages/frontend/src/components/forms/builder/FormBuilder.tsx"
    
    cat > "${component_file}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/components/forms/builder/FormBuilder.tsx
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H3P4 - Advanced Forms & Templates Frontend Components
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React, Material-UI, React Hook Form, Zod
// Purpose: Advanced drag-and-drop form builder component
// ============================================================================

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  Publish as PublishIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTheme } from '@mui/material/styles';

// Form field types
export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date' | 'file';
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: { label: string; value: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
  conditional?: {
    dependsOn: string;
    value: any;
  };
}

export interface FormDefinition {
  id?: string;
  name: string;
  title: string;
  description?: string;
  fields: FormField[];
  settings: {
    submitButtonText: string;
    confirmationMessage: string;
    allowMultipleSubmissions: boolean;
    requireAuthentication: boolean;
  };
}

// Validation schema
const formDefinitionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().optional(),
  fields: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, 'Field name is required'),
    label: z.string().min(1, 'Field label is required'),
    type: z.enum(['text', 'number', 'email', 'password', 'select', 'checkbox', 'radio', 'textarea', 'date', 'file']),
    required: z.boolean(),
    placeholder: z.string().optional(),
    description: z.string().optional(),
    options: z.array(z.object({
      label: z.string(),
      value: z.string()
    })).optional(),
    validation: z.object({
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional()
    }).optional()
  })).min(1, 'At least one field is required'),
  settings: z.object({
    submitButtonText: z.string().default('Submit'),
    confirmationMessage: z.string().default('Form submitted successfully'),
    allowMultipleSubmissions: z.boolean().default(true),
    requireAuthentication: z.boolean().default(false)
  })
});

export interface FormBuilderProps {
  initialForm?: FormDefinition;
  onSave: (form: FormDefinition) => Promise<void>;
  onPublish: (form: FormDefinition) => Promise<void>;
  onPreview: (form: FormDefinition) => void;
  loading?: boolean;
}

const fieldTypeOptions = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'email', label: 'Email Input' },
  { value: 'password', label: 'Password Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Select Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Button' },
  { value: 'date', label: 'Date Picker' },
  { value: 'file', label: 'File Upload' }
];

export const FormBuilder: React.FC<FormBuilderProps> = ({
  initialForm,
  onSave,
  onPublish,
  onPreview,
  loading = false
}) => {
  const theme = useTheme();
  const [formDefinition, setFormDefinition] = useState<FormDefinition>(
    initialForm || {
      name: '',
      title: '',
      description: '',
      fields: [],
      settings: {
        submitButtonText: 'Submit',
        confirmationMessage: 'Form submitted successfully',
        allowMultipleSubmissions: true,
        requireAuthentication: false
      }
    }
  );

  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { control, handleSubmit, formState: { errors: formErrors } } = useForm<FormDefinition>({
    resolver: zodResolver(formDefinitionSchema),
    defaultValues: formDefinition
  });

  // Generate unique field ID
  const generateFieldId = useCallback(() => {
    return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add new field
  const handleAddField = useCallback(() => {
    const newField: FormField = {
      id: generateFieldId(),
      name: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      description: ''
    };
    setEditingField(newField);
    setFieldDialogOpen(true);
  }, [generateFieldId]);

  // Edit existing field
  const handleEditField =