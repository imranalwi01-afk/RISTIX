#!/bin/bash
# ============================================================================
# PSDD SCRIPT - DAY 2 HOUR 3: FORMS FRONTEND GENERATION
# ============================================================================
# Script: d2h3-forms-frontend-generation.sh
# Phase: D2H3 - Forms Frontend Components Generation
# Objective: Generate React components for dynamic form builder and templates
# Generated: $(date)
# Following: 001-006-011-phased-shell-driven-development-psdd-methodology.md
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h3-forms-frontend-$(date +%Y%m%d-%H%M%S).log"

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

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    local line_number=$1
    log_error "Script failed at line ${line_number} with exit code: ${exit_code}"
    exit ${exit_code}
}

trap 'handle_error ${LINENO}' ERR

# Generate form builder component
generate_form_builder_component() {
    log_info "Generating form builder component..."
    
    cat > "${PROJECT_ROOT}/packages/frontend/src/components/forms/FormBuilder.tsx" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/components/forms/FormBuilder.tsx
// Generated: $(date)
// Phase: D2H3 - Advanced Forms & Templates
// Methodology: Phased Shell-Driven Development (PSDD)
// Purpose: Dynamic form builder with drag-and-drop interface
// ============================================================================

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import {
  DragIndicator as DragIndicatorIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  ContentCopy as CopyIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useFormik } from 'formik';
import * as yup from 'yup';

// Types
interface FormField {
  id: string;
  type: string;
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: any;
  options?: { label: string; value: string }[];
  conditional?: ConditionalLogic;
  metadata?: any;
}

interface ConditionalLogic {
  condition: string;
  field: string;
  operator: string;
  value: any;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'required';
}

interface FormDefinition {
  id?: string;
  name: string;
  title: string;
  description?: string;
  category?: string;
  fields: FormField[];
  validationRules?: any;
  conditionalLogic?: ConditionalLogic[];
  permissions?: any;
  metadata?: any;
}

interface FormBuilderProps {
  initialForm?: FormDefinition;
  onSave: (formDefinition: FormDefinition) => Promise<void>;
  onPreview: (formDefinition: FormDefinition) => void;
  categories?: string[];
  maxFields?: number;
  readOnly?: boolean;
}

// Field type definitions
const FIELD_TYPES = [
  { value: 'text', label: 'Text Input', icon: '📝' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'select', label: 'Dropdown', icon: '▼' },
  { value: 'multiselect', label: 'Multi-Select', icon: '☑️' },
  { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { value: 'radio', label: 'Radio Button', icon: '🔘' },
  { value: 'textarea', label: 'Text Area', icon: '📄' },
  { value: 'file', label: 'File Upload', icon: '📎' }
];

export const FormBuilder: React.FC<FormBuilderProps> = ({
  initialForm,
  onSave,
  onPreview,
  categories = [],
  maxFields = 100,
  readOnly = false
}) => {
  const [fields, setFields] = useState<FormField[]>(initialForm?.fields || []);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form metadata formik
  const formik = useFormik({
    initialValues: {
      name: initialForm?.name || '',
      title: initialForm?.title || '',
      description: initialForm?.description || '',
      category: initialForm?.category || ''
    },
    validationSchema: yup.object({
      name: yup.string().required('Name is required').matches(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Invalid name format'),
      title: yup.string().required('Title is required'),
      description: yup.string(),
      category: yup.string()
    }),
    onSubmit: async (values) => {
      if (fields.length === 0) {
        alert('Please add at least one field');
        return;
      }

      setSaving(true);
      try {
        const formDefinition: FormDefinition = {
          ...values,
          fields,
          conditionalLogic: extractConditionalLogic(),
          metadata: {
            created: new Date().toISOString(),
            fieldCount: fields.length
          }
        };

        await onSave(formDefinition);
      } catch (error) {
        console.error('Failed to save form:', error);
        alert('Failed to save form. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  });

  // Field editor formik
  const fieldFormik = useFormik({
    initialValues: {
      type: 'text',
      name: '',
      label: '',
      placeholder: '',
      required: false,
      options: [{ label: '', value: '' }]
    },
    validationSchema: yup.object({
      type: yup.string().required('Type is required'),
      name: yup.string()
        .required('Name is required')
        .matches(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Name must start with letter and contain only letters, numbers, and underscores')
        .test('unique-name', 'Field name must be unique', function(value) {
          if (!value) return true;
          const currentId = selectedField?.id;
          return !fields.some(f => f.id !== currentId && f.name === value);
        }),
      label: yup.string().required('Label is required')
    }),
    onSubmit: (values) => {
      const field: FormField = {
        id: selectedField?.id || `field_${Date.now()}`,
        type: values.type,
        name: values.name,
        label: values.label,
        placeholder: values.placeholder || undefined,
        required: values.required,
        options: ['select', 'multiselect', 'radio'].includes(values.type) 
          ? values.options.filter(opt => opt.label && opt.value)
          : undefined
      };

      if (selectedField) {
        // Update existing field
        setFields(prev => prev.map(f => f.id === selectedField.id ? field : f));
      } else {
        // Add new field
        if (fields.length >= maxFields) {
          alert(`Maximum ${maxFields} fields allowed`);
          return;
        }
        setFields(prev => [...prev, field]);
      }

      setFieldDialogOpen(false);
      setSelectedField(null);
      fieldFormik.resetForm();
    }
  });

  // Handle drag and drop
  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFields(items);
  }, [fields]);

  // Add new field
  const handleAddField = (fieldType?: string) => {
    if (fields.length >= maxFields) {
      alert(`Maximum ${maxFields} fields allowed`);
      return;
    }

    setSelectedField(null);
    fieldFormik.resetForm();
    if (fieldType) {
      fieldFormik.setFieldValue('type', fieldType);
    }
    setFieldDialogOpen(true);
  };

  // Edit field
  const handleEditField = (field: FormField) => {
    setSelectedField(field);
    fieldFormik.setValues({
      type: field.type,
      name: field.name,
      label: field.label,
      placeholder: field.placeholder || '',
      required: field.required,
      options: field.options || [{ label: '', value: '' }]
    });
    setFieldDialogOpen(true);
  };

  // Delete field
  const handleDeleteField = (fieldId: string) => {
    if (confirm('Are you sure you want to delete this field?')) {
      setFields(prev => prev.filter(f => f.id !== fieldId));
    }
  };

  // Clone field
  const handleCloneField = (field: FormField) => {
    if (fields.length >= maxFields) {
      alert(`Maximum ${maxFields} fields allowed`);
      return;
    }

    const clonedField: FormField = {
      ...field,
      id: `field_${Date.now()}`,
      name: `${field.name}_copy`,
      label: `${field.label} (Copy)`
    };

    setFields(prev => [...prev, clonedField]);
  };

  // Extract conditional logic from fields
  const extractConditionalLogic = (): ConditionalLogic[] => {
    return fields
      .filter(f => f.conditional)
      .map(f => f.conditional!)
      .filter(Boolean);
  };

  // Handle option management for select fields
  const handleOptionAdd = () => {
    const currentOptions = fieldFormik.values.options;
    fieldFormik.setFieldValue('options', [...currentOptions, { label: '', value: '' }]);
  };

  const handleOptionRemove = (index: number) => {
    const currentOptions = fieldFormik.values.options;
    fieldFormik.setFieldValue('options', currentOptions.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: 'label' | 'value', value: string) => {
    const currentOptions = [...fieldFormik.values.options];
    currentOptions[index][field] = value;
    fieldFormik.setFieldValue('options', currentOptions);
  };

  if (previewMode) {
    return (
      <Box>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Form Preview: {formik.values.title}</Typography>
          <Button
            variant="outlined"
            onClick={() => setPreviewMode(false)}
            startIcon={<EditIcon />}
          >
            Back to Editor
          </Button>
        </Box>
        {/* Preview component would be rendered here */}
        <Alert severity="info">Form preview would be displayed here</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Form Builder
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Create and customize dynamic forms with drag-and-drop interface
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Form Settings Panel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Form Settings
            </Typography>

            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                name="name"
                label="Form Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                margin="normal"
                disabled={readOnly}
              />

              <TextField
                fullWidth
                name="title"
                label="Form Title"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                margin="normal"
                disabled={readOnly}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                name="description"
                label="Description"
                value={formik.values.description}
                onChange={formik.handleChange}
                margin="normal"
                disabled={readOnly}
              />

              {categories.length > 0 && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    disabled={readOnly}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </form>
          </Paper>

          {/* Field Types Panel */}
          {!readOnly && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Field Types
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {FIELD_TYPES.map((fieldType) => (
                  <Chip
                    key={fieldType.value}
                    label={`${fieldType.icon} ${fieldType.label}`}
                    onClick={() => handleAddField(fieldType.value)}
                    clickable
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Paper>
          )}
        </Grid>

        {/* Form Builder Canvas */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, minHeight: 600 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Form Fields ({fields.length}/{maxFields})
              </Typography>
              
              <Box>
                <Button
                  variant="outlined"
                  onClick={() => onPreview({ ...formik.values, fields })}
                  startIcon={<PreviewIcon />}
                  sx={{ mr: 1 }}
                  disabled={fields.length === 0}
                >
                  Preview
                </Button>
                
                {!readOnly && (
                  <>
                    <Button
                      variant="outlined"
                      onClick={() => handleAddField()}
                      startIcon={<AddIcon />}
                      sx={{ mr: 1 }}
                      disabled={fields.length >= maxFields}
                    >
                      Add Field
                    </Button>
                    
                    <Button
                      variant="contained"
                      onClick={() => formik.handleSubmit()}
                      startIcon={<SaveIcon />}
                      disabled={!formik.isValid || fields.length === 0 || saving}
                    >
                      {saving ? 'Saving...' : 'Save Form'}
                    </Button>
                  </>
                )}
              </Box>
            </Box>

            {fields.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 200,
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 3
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No fields added yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Add fields by clicking the field types or the "Add Field" button
                </Typography>
                {!readOnly && (
                  <Button
                    variant="contained"
                    onClick={() => handleAddField()}
                    startIcon={<AddIcon />}
                  >
                    Add Your First Field
                  </Button>
                )}
              </Box>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="form-fields">
                  {(provided) => (
                    <Box
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {fields.map((field, index) => (
                        <Draggable
                          key={field.id}
                          draggableId={field.id}
                          index={index}
                          isDragDisabled={readOnly}
                        >
                          {(provided, snapshot) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{
                                p: 2,
                                mb: 2,
                                border: snapshot.isDragging ? '2px solid #1976d2' : '1px solid #e0e0e0',
                                backgroundColor: snapshot.isDragging ? '#f5f5f5' : 'white'
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                  {!readOnly && (
                                    <Box {...provided.dragHandleProps} sx={{ mr: 2, cursor: 'grab' }}>
                                      <DragIndicatorIcon color="action" />
                                    </Box>
                                  )}
                                  
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                      {field.label}
                                      {field.required && <span style={{ color: 'red' }}> *</span>}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {field.type.toUpperCase()} • {field.name}
                                    </Typography>
                                    {field.placeholder && (
                                      <Typography variant="caption" color="text.secondary">
                                        Placeholder: {field.placeholder}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>

                                {!readOnly && (
                                  <Box>
                                    <Tooltip title="Clone Field">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleCloneField(field)}
                                        disabled={fields.length >= maxFields}
                                      >
                                        <CopyIcon />
                                      </IconButton>
                                    </Tooltip>
                                    
                                    <Tooltip title="Edit Field">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleEditField(field)}
                                      >
                                        <EditIcon />
                                      </IconButton>
                                    </Tooltip>
                                    
                                    <Tooltip title="Delete Field">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleDeleteField(field.id)}
                                        color="error"
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                )}
                              </Box>

                              {/* Field preview */}
                              <Box sx={{ mt: 2, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                                {field.type === 'text' && (
                                  <TextField
                                    fullWidth
                                    label={field.label}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    size="small"
                                    disabled
                                  />
                                )}
                                
                                {field.type === 'select' && field.options && (
                                  <FormControl fullWidth size="small">
                                    <InputLabel>{field.label}</InputLabel>
                                    <Select label={field.label} disabled>
                                      {field.options.map((option, idx) => (
                                        <MenuItem key={idx} value={option.value}>
                                          {option.label}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                )}
                                
                                {/* Add more field type previews as needed */}
                              </Box>
                            </Paper>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Field Editor Dialog */}
      <Dialog
        open={fieldDialogOpen}
        onClose={() => setFieldDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={fieldFormik.handleSubmit}>
          <DialogTitle>
            {selectedField ? 'Edit Field' : 'Add New Field'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Field Type</InputLabel>
                  <Select
                    name="type"
                    value={fieldFormik.values.type}
                    onChange={fieldFormik.handleChange}
                  >
                    {FIELD_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Field Name"
                  value={fieldFormik.values.name}
                  onChange={fieldFormik.handleChange}
                  error={fieldFormik.touched.name && Boolean(fieldFormik.errors.name)}
                  helperText={fieldFormik.touched.name && fieldFormik.errors.name}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="label"
                  label="Field Label"
                  value={fieldFormik.values.label}
                  onChange={fieldFormik.handleChange}
                  error={fieldFormik.touched.label && Boolean(fieldFormik.errors.label)}
                  helperText={fieldFormik.touched.label && fieldFormik.errors.label}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="placeholder"
                  label="Placeholder"
                  value={fieldFormik.values.placeholder}
                  onChange={fieldFormik.handleChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="required"
                      checked={fieldFormik.values.required}
                      onChange={fieldFormik.handleChange}
                    />
                  }
                  label="Required Field"
                />
              </Grid>

              {/* Options for select fields */}
              {['select', 'multiselect', 'radio'].includes(fieldFormik.values.type) && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Options
                  </Typography>
                  
                  {fieldFormik.values.options.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        size="small"
                        label="Label"
                        value={option.label}
                        onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                      />
                      <TextField
                        size="small"
                        label="Value"
                        value={option.value}
                        onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleOptionRemove(index)}
                        disabled={fieldFormik.values.options.length <= 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  
                  <Button
                    size="small"
                    onClick={handleOptionAdd}
                    startIcon={<AddIcon />}
                  >
                    Add Option
                  </Button>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setFieldDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!fieldFormik.isValid}
            >
              {selectedField ? 'Update Field' : 'Add Field'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default FormBuilder;
EOF

    log_success "Form builder component generated"
}

# Generate dynamic form component
generate_dynamic_form_component() {
    log_info "Generating dynamic form component..."
    
    cat > "${PROJECT_ROOT}/packages/frontend/src/components/forms/DynamicForm.tsx" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/components/forms/DynamicForm.tsx
// Generated: $(date)
// Phase: D2H3 - Advanced Forms & Templates
// Methodology: Phased Shell-Driven Development (PSDD)
// Purpose: Dynamic form renderer with validation and conditional logic
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { FormFieldRenderer } from './FormFieldRenderer';
import { ConditionalLogic } from './ConditionalLogic';

// Types
interface FormField {
  id: string;
  type: string;
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: any;
  options?: { label: string; value: string }[];
  conditional?: ConditionalLogicRule;
  metadata?: any;
}

interface ConditionalLogicRule {
  condition: string;
  field: string;
  operator: string;
  value: any;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'required';
}

interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  order: number;
  conditional?: ConditionalLogicRule;
}

interface FormDefinition {
  id: string;
  name: string;
  title: string;
  description?: string;
  fields: FormField[];
  steps?: FormStep[];
  validationRules?: any;
  conditionalLogic?: ConditionalLogicRule[];
}

interface DynamicFormProps {
  formDefinition: FormDefinition;
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  onSaveDraft?: (values: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
  readOnly?: boolean;
  showProgress?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  formDefinition,
  initialValues = {},
  onSubmit,
  onSaveDraft,
  onCancel,
  readOnly = false,
  showProgress = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [conditionalStates, setConditionalStates] = useState<Record<string, any>>({});

  const isMultiStep = formDefinition.steps && formDefinition.steps.length > 1;
  const steps = formDefinition.steps || [];

  // Generate validation schema
  const validationSchema = useMemo(() => {
    const schemaFields: Record<string, any> = {};

    formDefinition.fields.forEach(field => {
      let fieldSchema: any;

      switch (field.type) {
        case 'email':
          fieldSchema = yup.string().email('Invalid email address');
          break;
        case 'number':
          fieldSchema = yup.number().typeError('Must be a number');
          break;
        case 'date':
          fieldSchema = yup.date().typeError('Invalid date');
          break;
        case 'file':
          fieldSchema = yup.mixed();
          break;
        default:
          fieldSchema = yup.string();
      }

      // Apply required validation
      if (field.required) {
        fieldSchema = fieldSchema.required(`${field.label} is required`);
      }

      // Apply custom validation
      if (field.validation) {
        if (field.validation.minLength) {
          fieldSchema = fieldSchema.min(field.validation.minLength, `Minimum ${field.validation.minLength} characters`);
        }
        if (field.validation.maxLength) {
          fieldSchema = fieldSchema.max(field.validation.maxLength, `Maximum ${field.validation.maxLength} characters`);
        }
        if (field.validation.min && field.type === 'number') {
          fieldSchema = fieldSchema.min(field.validation.min, `Minimum value is ${field.validation.min}`);
        }
        if (field.validation.max && field.type === 'number') {
          fieldSchema = fieldSchema.max(field.validation.max, `Maximum value is ${field.validation.max}`);
        }
      }

      schemaFields[field.name] = fieldSchema;
    });

    return yup.object(schemaFields);
  }, [formDefinition.fields]);

  // Initialize form values
  const getInitialValues = () => {
    const values: Record<string, any> = {};
    formDefinition.fields.forEach(field => {
      values[field.name] = initialValues[field.name] || getDefaultValue(field);
    });
    return values;
  };

  const getDefaultValue = (field: FormField) => {
    switch (field.type) {
      case 'checkbox':
        return false;
      case 'multiselect':
        return [];
      case 'number':
        return '';
      default:
        return '';
    }
  };

  // Formik setup
  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Handle draft save
  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;

    setSavingDraft(true);
    try {
      await onSaveDraft(formik.values);
    } catch (error) {
      console.error('Draft save error:', error);
    } finally {
      setSavingDraft(false);
    }
  };

  // Get visible fields based on conditional logic
  const getVisibleFields = (stepIndex?: number) => {
    let fieldsToShow = formDefinition.fields;

    // Filter by step if multi-step
    if (isMultiStep && stepIndex !== undefined && steps[stepIndex]) {
      const stepFieldNames = steps[stepIndex].fields;
      fieldsToShow = formDefinition.fields.filter(field => 
        stepFieldNames.includes(field.name)
      );
    }

    // Apply conditional logic
    return fieldsToShow.filter(field => {
      if (!field.conditional) return true;
      return evaluateConditional(field.conditional, formik.values);
    });
  };

  // Evaluate conditional logic
  const evaluateConditional = (conditional: ConditionalLogicRule, values: Record<string, any>): boolean => {
    const fieldValue = values[conditional.field];
    const conditionValue = conditional.value;

    switch (conditional.operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'not_equals':
        return fieldValue !== conditionValue;
      case 'contains':
        return String(fieldValue).includes(String(conditionValue));
      case 'not_contains':
        return !String(fieldValue).includes(String(conditionValue));
      case 'greater_than':
        return Number(fieldValue) > Number(conditionValue);
      case 'less_than':
        return Number(fieldValue) < Number(conditionValue);
      case 'is_empty':
        return !fieldValue || fieldValue === '';
      case 'is_not_empty':
        return fieldValue && fieldValue !== '';
      default:
        return true;
    }
  };

  // Handle step navigation
  const handleNext = async () => {
    if (isMultiStep) {
      // Validate current step fields
      const currentStepFields = getVisibleFields(currentStep);
      const stepFieldNames = currentStepFields.map(f => f.name);
      
      const stepErrors: Record<string, string> = {};
      for (const fieldName of stepFieldNames) {
        try {
          await validationSchema.validateAt(fieldName, formik.values);
        } catch (error: any) {
          stepErrors[fieldName] = error.message;
        }
      }

      if (Object.keys(stepErrors).length > 0) {
        formik.setErrors(stepErrors);
        return;
      }

      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Calculate form progress
  const getProgress = () => {
    const totalFields = formDefinition.fields.length;
    const filledFields = formDefinition.fields.filter(field => {
      const value = formik.values[field.name];
      return value !== '' && value !== null && value !== undefined;
    }).length;
    return (filledFields / totalFields) * 100;
  };

  const currentStepFields = getVisibleFields(isMultiStep ? currentStep : undefined);
  const isLastStep = !isMultiStep || currentStep === steps.length - 1;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Form Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {formDefinition.title}
        </Typography>
        
        {formDefinition.description && (
          <Typography variant="body1" color="text.secondary" paragraph>
            {formDefinition.description}
          </Typography>
        )}

        {/* Progress indicator */}
        {showProgress && !isMultiStep && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Form completion: {Math.round(getProgress())}%
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 8,
                backgroundColor: '#e0e0e0',
                borderRadius: 4,
                mt: 1
              }}
            >
              <Box
                sx={{
                  width: `${getProgress()}%`,
                  height: '100%',
                  backgroundColor: '#1976d2',
                  borderRadius: 4,
                  transition: 'width 0.3s ease'
                }}
              />
            </Box>
          </Box>
        )}

        {/* Stepper for multi-step forms */}
        {isMultiStep && (
          <Stepper activeStep={currentStep} sx={{ mt: 3 }}>
            {steps.map((step) => (
              <Step key={step.id}>
                <StepLabel>{step.title}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
      </Paper>

      {/* Form Content */}
      <Paper sx={{ p: 3 }}>
        {isMultiStep && steps[currentStep] && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {steps[currentStep].title}
            </Typography>
            {steps[currentStep].description && (
              <Typography variant="body2" color="text.secondary" paragraph>
                {steps[currentStep].description}
              </Typography>
            )}
            <Divider />
          </Box>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {currentStepFields.map(field => (
              <FormFieldRenderer
                key={field.id}
                field={field}
                value={formik.values[field.name]}
                onChange={(value) => formik.setFieldValue(field.name, value)}
                error={formik.touched[field.name] ? formik.errors[field.name] : undefined}
                disabled={readOnly}
              />
            ))}
          </Box>

          {/* Form Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
            <Box>
              {onCancel && (
                <Button onClick={onCancel} disabled={submitting || savingDraft}>
                  Cancel
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {onSaveDraft && !readOnly && (
                <Button
                  variant="outlined"
                  onClick={handleSaveDraft}
                  disabled={submitting || savingDraft}
                >
                  {savingDraft ? (
                    <>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      Saving...
                    </>
                  ) : (
                    'Save Draft'
                  )}
                </Button>
              )}

              {isMultiStep && currentStep > 0 && (
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={submitting}
                >
                  Back
                </Button>
              )}

              {!readOnly && (
                <Button
                  type={isLastStep ? 'submit' : 'button'}
                  variant="contained"
                  onClick={isLastStep ? undefined : handleNext}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      Submitting...
                    </>
                  ) : isLastStep ? (
                    'Submit'
                  ) : (
                    'Next'
                  )}
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default DynamicForm;
EOF

    log_success "Dynamic form component generated"
}

# Generate remaining components function
generate_remaining_components() {
    log_info "Generating remaining form components..."
    
    # Generate FormFieldRenderer component
    cat > "${PROJECT_ROOT}/packages/frontend/src/components/forms/FormFieldRenderer.tsx" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/components/forms/FormFieldRenderer.tsx
// Generated: $(date)
// Phase: D2H3 - Advanced Forms & Templates
// Methodology: Phased Shell-Driven Development (PSDD)
// Purpose: Individual form field renderer with all supported field types
// ============================================================================

import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  FormHelperText,
  Chip,
  Box,
  Button
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useDropzone } from 'react-dropzone';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

// Types remain the same as in previous component
interface FormField {
  id: string;
  type: string;
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: any;
  options?: { label: string; value: string }[];
  metadata?: any;
}

interface FormFieldRendererProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

export const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false
}) => {
  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <TextField
            fullWidth
            type={field.type}
            label={field.label}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            error={Boolean(error)}
            helperText={error}
            disabled={disabled}
          />
        );

      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={field.label}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            error={Boolean(error)}
            helperText={error}
            disabled={disabled}
          />
        );

      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label={field.label}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            error={Boolean(error)}
            helperText={error}
            disabled={disabled}
          />
        );

      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={field.label}
              value={value || null}
              onChange={onChange}
              disabled={disabled}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: field.required,
                  error: Boolean(error),
                  helperText: error
                }
              }}
            />
          </LocalizationProvider>
        );

      case 'select':
        return (
          <FormControl fullWidth required={field.required} error={Boolean(error)} disabled={disabled}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              label={field.label}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(value)}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
              />
            }
            label={field.label}
          />
        );

      case 'radio':
        return (
          <FormControl component="fieldset" required={field.required} error={Boolean(error)} disabled={disabled}>
            <FormLabel component="legend">{field.label}</FormLabel>
            <RadioGroup
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            >
              {field.options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case 'file':
        const { getRootProps, getInputProps, isDragActive } = useDropzone({
          onDrop: (acceptedFiles) => onChange(acceptedFiles[0]),
          multiple: false,
          disabled
        });

        return (
          <Box>
            <FormLabel component="legend">{field.label}</FormLabel>
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: disabled ? 'default' : 'pointer',
                backgroundColor: isDragActive ? '#f5f5f5' : 'transparent',
                '&:hover': !disabled ? { backgroundColor: '#f9f9f9' } : {}
              }}
            >
              <input {...getInputProps()} />
              <UploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
              {value ? (
                <Box>
                  <div>Selected: {value.name}</div>
                  <div>Size: {(value.size / 1024).toFixed(2)} KB</div>
                </Box>
              ) : (
                <div>
                  {isDragActive ? 'Drop the file here...' : 'Drag & drop a file here, or click to select'}
                </div>
              )}
            </Box>
            {error && <FormHelperText error>{error}</FormHelperText>}
          </Box>
        );

      default:
        return (
          <TextField
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            error={Boolean(error)}
            helperText={error || 'Unsupported field type'}
            disabled={disabled}
          />
        );
    }
  };

  return <Box sx={{ mb: 2 }}>{renderField()}</Box>;
};

export default FormFieldRenderer;
EOF

    log_success "FormFieldRenderer component generated"
}

# Main execution function
main() {
    log_info "Starting Day 2 Hour 3: Forms Frontend Generation..."
    
    # Generate components
    generate_form_builder_component
    generate_dynamic_form_component
    generate_remaining_components
    
    log_success "Day 2 Hour 3 frontend generation completed successfully"
    log_info "Next: Run './scripts/validation/d2h3-forms-validation.sh' to validate the generated code"
}

# Execute main function
main "$@".value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case 'multiselect':
        return (
          <FormControl fullWidth required={field.required} error={Boolean(error)} disabled={disabled}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              multiple
              value={value || []}
              onChange={(e) => onChange(e.target.value)}
              label={field.label}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((val: string) => {
                    const option = field.options?.find(opt => opt.value === val);
                    return <Chip key={val} label={option?.label || val} size="small" />;
                  })}
                </Box>
              )}
            >
              {field.options?.map((option) => (
                <MenuItem key={option