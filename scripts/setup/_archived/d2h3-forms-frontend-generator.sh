#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - Day 2 Hour 3+ FRONTEND FORMS GENERATOR
# ============================================================================
# File Path: ./scripts/setup/d2h3-forms-frontend-generator.sh
# Generated: $(date)
# Phase: D2H3 - Advanced Forms & Templates Frontend Components
# Methodology: Phased Shell-Driven Development (PSDD)
# Purpose: Generate React components for advanced forms and templates
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h3-frontend-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H3_FRONTEND"
PHASE_NAME="Advanced Forms & Templates Frontend"
PHASE_OBJECTIVE="React components for dynamic form builder and template management"

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

# MANDATORY: Progress tracking
track_progress() {
    local phase="$1"
    local status="$2"
    local progress_file="${PROJECT_ROOT}/.psdd-progress"
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') | ${phase} | ${status}" >> "${progress_file}"
    log_info "Progress tracked: ${phase} - ${status}"
}

# MANDATORY: Generate Dynamic Form Builder Component
generate_form_builder() {
    log_info "Generating Dynamic Form Builder component..."
    
    cat > "${PROJECT_ROOT}/packages/frontend/src/components/form-builder/DynamicFormBuilder.tsx" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/components/form-builder/DynamicFormBuilder.tsx
// Generated: $(date)
// Phase: D2H3 - Advanced Forms & Templates Frontend
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React, Material-UI, React-DnD, React-Hook-Form
// Purpose: Drag-and-drop form builder for enterprise forms
// ============================================================================

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert
} from '@mui/material';
import {
  DragIndicator,
  Add,
  Delete,
  Edit,
  Preview,
  Save,
  Settings,
  TextFields,
  Email,
  Numbers,
  CalendarToday,
  CheckBox,
  RadioButtonChecked,
  Subject,
  AttachFile
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: string;
  };
  sortOrder: number;
}

export interface FormDefinition {
  id?: string;
  name: string;
  description?: string;
  fields: FormField[];
  schema: {
    title: string;
    description?: string;
    layout: 'single-column' | 'two-column' | 'grid';
  };
  validationRules: {
    required?: string[];
    conditional?: Array<{
      field: string;
      condition: string;
      value: any;
      action: 'show' | 'hide' | 'require' | 'disable';
    }>;
  };
}

const fieldTypes = [
  { type: 'text', label: 'Text Input', icon: TextFields },
  { type: 'email', label: 'Email', icon: Email },
  { type: 'number', label: 'Number', icon: Numbers },
  { type: 'date', label: 'Date', icon: CalendarToday },
  { type: 'select', label: 'Dropdown', icon: Subject },
  { type: 'checkbox', label: 'Checkbox', icon: CheckBox },
  { type: 'radio', label: 'Radio Button', icon: RadioButtonChecked },
  { type: 'textarea', label: 'Text Area', icon: Subject },
  { type: 'file', label: 'File Upload', icon: AttachFile }
];

const formDefinitionSchema = z.object({
  name: z.string().min(1, 'Form name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  schema: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    layout: z.enum(['single-column', 'two-column', 'grid'])
  })
});

interface DynamicFormBuilderProps {
  initialForm?: FormDefinition;
  onSave: (form: FormDefinition) => Promise<void>;
  onPreview?: (form: FormDefinition) => void;
  isLoading?: boolean;
}

const DragItem = 'FORM_FIELD';

const DraggableFieldType: React.FC<{
  fieldType: typeof fieldTypes[0];
  onAdd: (type: string) => void;
}> = ({ fieldType, onAdd }) => {
  const [{ isDragging }, drag] = useDrag({
    type: DragItem,
    item: { fieldType: fieldType.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const IconComponent = fieldType.icon;

  return (
    <Card
      ref={drag}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        mb: 1,
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}
      onClick={() => onAdd(fieldType.type)}
    >
      <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconComponent fontSize="small" />
          <Typography variant="body2">{fieldType.label}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const FormFieldItem: React.FC<{
  field: FormField;
  index: number;
  onEdit: (field: FormField) => void;
  onDelete: (fieldId: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}> = ({ field, index, onEdit, onDelete, onMove }) => {
  const theme = useTheme();

  const [{ isDragging }, drag] = useDrag({
    type: DragItem,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: DragItem,
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    }
  });

  return (
    <Card
      ref={(node) => drag(drop(node))}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        mb: 1,
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          borderColor: theme.palette.primary.main
        }
      }}
    >
      <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <DragIndicator sx={{ cursor: 'move' }} />
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {field.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {field.type} {field.required && '(Required)'}
              </Typography>
            </Box>
          </Box>
          <Box>
            <IconButton size="small" onClick={() => onEdit(field)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(field.id)}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const DynamicFormBuilder: React.FC<DynamicFormBuilderProps> = ({
  initialForm,
  onSave,
  onPreview,
  isLoading = false
}) => {
  const theme = useTheme();
  const [formDefinition, setFormDefinition] = useState<FormDefinition>(
    initialForm || {
      name: '',
      description: '',
      fields: [],
      schema: {
        title: '',
        description: '',
        layout: 'single-column'
      },
      validationRules: {}
    }
  );

  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formDefinitionSchema),
    defaultValues: {
      name: formDefinition.name,
      description: formDefinition.description,
      schema: formDefinition.schema
    }
  });

  const [, drop] = useDrop({
    accept: DragItem,
    drop: (item: { fieldType?: string }) => {
      if (item.fieldType) {
        addField(item.fieldType);
      }
    }
  });

  const addField = useCallback((fieldType: string) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: `field_${formDefinition.fields.length + 1}`,
      type: fieldType as FormField['type'],
      label: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
      placeholder: '',
      required: false,
      sortOrder: formDefinition.fields.length,
      options: fieldType === 'select' || fieldType === 'radio' ? ['Option 1', 'Option 2'] : undefined
    };

    setEditingField(newField);
    setFieldDialogOpen(true);
  }, [formDefinition.fields.length]);

  const saveField = useCallback((field: FormField) => {
    setFormDefinition(prev => {
      const existingIndex = prev.fields.findIndex(f => f.id === field.id);
      
      if (existingIndex >= 0) {
        // Update existing field
        const updatedFields = [...prev.fields];
        updatedFields[existingIndex] = field;
        return { ...prev, fields: updatedFields };
      } else {
        // Add new field
        return { ...prev, fields: [...prev.fields, field] };
      }
    });
    
    setEditingField(null);
    setFieldDialogOpen(false);
  }, []);

  const deleteField = useCallback((fieldId: string) => {
    setFormDefinition(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId)
    }));
  }, []);

  const moveField = useCallback((dragIndex: number, hoverIndex: number) => {
    setFormDefinition(prev => {
      const draggedField = prev.fields[dragIndex];
      const updatedFields = [...prev.fields];
      updatedFields.splice(dragIndex, 1);
      updatedFields.splice(hoverIndex, 0, draggedField);
      
      // Update sort orders
      updatedFields.forEach((field, index) => {
        field.sortOrder = index;
      });

      return { ...prev, fields: updatedFields };
    });
  }, []);

  const handleFormSave = useCallback(async (data: any) => {
    const updatedForm: FormDefinition = {
      ...formDefinition,
      name: data.name,
      description: data.description,
      schema: data.schema
    };

    await onSave(updatedForm);
  }, [formDefinition, onSave]);

  const handlePreview = useCallback(() => {
    if (onPreview) {
      onPreview(formDefinition);
    }
    setPreviewMode(true);
  }, [formDefinition, onPreview]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ height: '100vh', display: 'flex' }}>
        {/* Left Panel - Field Types */}
        <Box sx={{ width: 250, borderRight: 1, borderColor: 'divider', p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Form Fields
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Drag fields to the canvas or click to add
          </Typography>
          
          {fieldTypes.map((fieldType) => (
            <DraggableFieldType
              key={fieldType.type}
              fieldType={fieldType}
              onAdd={addField}
            />
          ))}
        </Box>

        {/* Main Canvas */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Toolbar */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box display="flex" justifyContent="between" alignItems="center">
              <Typography variant="h6">Form Builder</Typography>
              <Box display="flex" gap={1}>
                <Button
                  startIcon={<Preview />}
                  onClick={handlePreview}
                  disabled={formDefinition.fields.length === 0}
                >
                  Preview
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSubmit(handleFormSave)}
                  disabled={isLoading || formDefinition.fields.length === 0}
                >
                  Save Form
                </Button>
              </Box>
            </Box>
          </Box>

          <Box sx={{ flex: 1, display: 'flex' }}>
            {/* Form Properties */}
            <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Form Properties
              </Typography>

              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Form Name"
                    fullWidth
                    margin="normal"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    onChange={(e) => {
                      field.onChange(e);
                      setFormDefinition(prev => ({ ...prev, name: e.target.value }));
                    }}
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={3}
                    onChange={(e) => {
                      field.onChange(e);
                      setFormDefinition(prev => ({ ...prev, description: e.target.value }));
                    }}
                  />
                )}
              />

              <Controller
                name="schema.title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Form Title"
                    fullWidth
                    margin="normal"
                    error={!!errors.schema?.title}
                    helperText={errors.schema?.title?.message}
                    onChange={(e) => {
                      field.onChange(e);
                      setFormDefinition(prev => ({
                        ...prev,
                        schema: { ...prev.schema, title: e.target.value }
                      }));
                    }}
                  />
                )}
              />

              <Controller
                name="schema.layout"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Layout</InputLabel>
                    <Select
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setFormDefinition(prev => ({
                          ...prev,
                          schema: { ...prev.schema, layout: e.target.value as any }
                        }));
                      }}
                    >
                      <MenuItem value="single-column">Single Column</MenuItem>
                      <MenuItem value="two-column">Two Column</MenuItem>
                      <MenuItem value="grid">Grid Layout</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Form Statistics
              </Typography>
              <Chip
                label={`${formDefinition.fields.length} Fields`}
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
              <Chip
                label={`${formDefinition.fields.filter(f => f.required).length} Required`}
                size="small"
                color="primary"
                sx={{ mr: 1, mb: 1 }}
              />
            </Box>

            {/* Canvas Area */}
            <Box
              ref={drop}
              sx={{
                flex: 1,
                p: 2,
                minHeight: 400,
                backgroundColor: 'grey.50'
              }}
            >
              {formDefinition.fields.length === 0 ? (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    borderRadius: 1,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <Box textAlign="center">
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Start Building Your Form
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Drag fields from the left panel or click to add them
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {formDefinition.schema.title || 'Untitled Form'}
                  </Typography>
                  {formDefinition.schema.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {formDefinition.schema.description}
                    </Typography>
                  )}

                  {formDefinition.fields.map((field, index) => (
                    <FormFieldItem
                      key={field.id}
                      field={field}
                      index={index}
                      onEdit={(field) => {
                        setEditingField(field);
                        setFieldDialogOpen(true);
                      }}
                      onDelete={deleteField}
                      onMove={moveField}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Field Edit Dialog */}
      <FieldEditDialog
        field={editingField}
        open={fieldDialogOpen}
        onClose={() => {
          setFieldDialogOpen(false);
          setEditingField(null);
        }}
        onSave={saveField}
      />

      {/* Form Preview Dialog */}
      <FormPreviewDialog
        form={formDefinition}
        open={previewMode}
        onClose={() => setPreviewMode(false)}
      />
    </DndProvider>
  );
};

// Field Edit Dialog Component
const FieldEditDialog: React.FC<{
  field: FormField | null;
  open: boolean;
  onClose: () => void;
  onSave: (field: FormField) => void;
}> = ({ field, open, onClose, onSave }) => {
  const [editedField, setEditedField] = useState<FormField | null>(null);

  useEffect(() => {
    if (field) {
      setEditedField({ ...field });
    }
  }, [field]);

  const handleSave = () => {
    if (editedField) {
      onSave(editedField);
    }
  };

  if (!editedField) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit {editedField.type.charAt(0).toUpperCase() + editedField.type.slice(1)} Field
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Field Name"
              fullWidth
              value={editedField.name}
              onChange={(e) =>
                setEditedField(prev => prev ? { ...prev, name: e.target.value } : null)
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Label"
              fullWidth
              value={editedField.label}
              onChange={(e) =>
                setEditedField(prev => prev ? { ...prev, label: e.target.value } : null)
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Placeholder"
              fullWidth
              value={editedField.placeholder || ''}
              onChange={(e) =>
                setEditedField(prev => prev ? { ...prev, placeholder: e.target.value } : null)
              }
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={editedField.required}
                  onChange={(e) =>
                    setEditedField(prev => prev ? { ...prev, required: e.target.checked } : null)
                  }
                />
              }
              label="Required Field"
            />
          </Grid>

          {(editedField.type === 'select' || editedField.type === 'radio') && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Options
              </Typography>
              {editedField.options?.map((option, index) => (
                <Box key={index} display="flex" gap={1} mb={1}>
                  <TextField
                    size="small"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(editedField.options || [])];
                      newOptions[index] = e.target.value;
                      setEditedField(prev => prev ? { ...prev, options: newOptions } : null);
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newOptions = editedField.options?.filter((_, i) => i !== index);
                      setEditedField(prev => prev ? { ...prev, options: newOptions } : null);
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<Add />}
                onClick={() => {
                  const newOptions = [...(editedField.options || []), `Option ${(editedField.options?.length || 0) + 1}`];
                  setEditedField(prev => prev ? { ...prev, options: newOptions } : null);
                }}
              >
                Add Option
              </Button>
            </Grid>
          )}

          {/* Validation Rules */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Validation Rules
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Min Length"
                  type="number"
                  size="small"
                  value={editedField.validation?.minLength || ''}
                  onChange={(e) =>
                    setEditedField(prev => prev ? {
                      ...prev,
                      validation: {
                        ...prev.validation,
                        minLength: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    } : null)
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Max Length"
                  type="number"
                  size="small"
                  value={editedField.validation?.maxLength || ''}
                  onChange={(e) =>
                    setEditedField(prev => prev ? {
                      ...prev,
                      validation: {
                        ...prev.validation,
                        maxLength: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    } : null)
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Field
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Form Preview Dialog Component
const FormPreviewDialog: React.FC<{
  form: FormDefinition;
  open: boolean;
  onClose: () => void;
}> = ({ form, open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Form Preview</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            {form.schema.title}
          </Typography>
          {form.schema.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {form.schema.description}
            </Typography>
          )}

          <Grid container spacing={2}>
            {form.fields.map((field) => (
              <Grid
                key={field.id}
                item
                xs={form.schema.layout === 'two-column' ? 6 : 12}
              >
                <FormFieldPreview field={field} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close Preview</Button>
      </DialogActions>
    </Dialog>
  );
};

// Form Field Preview Component
const FormFieldPreview: React.FC<{ field: FormField }> = ({ field }) => {
  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            type={field.type}
            required={field.required}
            fullWidth
            disabled
          />
        );

      case 'date':
        return (
          <TextField
            label={field.label}
            type="date"
            required={field.required}
            fullWidth
            disabled
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'textarea':
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            multiline
            rows={3}
            fullWidth
            disabled
          />
        );

      case 'select':
        return (
          <FormControl fullWidth disabled>
            <InputLabel required={field.required}>{field.label}</InputLabel>
            <Select value="">
              {field.options?.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            control={<CheckBox disabled />}
            label={field.label}
            required={field.required}
          />
        );

      case 'file':
        return (
          <Box>
            <Typography variant="body2" gutterBottom>
              {field.label} {field.required && '*'}
            </Typography>
            <Button variant="outlined" component="label" disabled>
              Choose File
              <input type="file" hidden />
            </Button>
          </Box>
        );

      default:
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            fullWidth
            disabled
          />
        );
    }
  };

  return <Box sx={{ mb: 2 }}>{renderField()}</Box>;
};

export default DynamicFormBuilder;
EOF

    log_success "Dynamic Form Builder component generated"
}

# MANDATORY: Generate Form Renderer Component
generate_form_renderer() {
    log_info "Generating Form Renderer component..."
    
    cat > "${PROJECT_ROOT}/packages/frontend/src/components/forms/FormRenderer.tsx" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/components/forms/FormRenderer.tsx
// Generated: $(date)
// Phase: D2H3 - Advanced Forms & Templates Frontend
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React, Material-UI, React-Hook-Form, Zod
// Purpose: Dynamic form renderer for enterprise forms
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormDefinition, FormField } from './DynamicFormBuilder';

interface FormRendererProps {
  form: FormDefinition;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  isLoading?: boolean;
  readOnly?: boolean;
  showSubmitButton?: boolean;
  submitButtonText?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  form,
  initialData = {},
  onSubmit,
  onValidationChange,
  isLoading = false,
  readOnly = false,
  showSubmitButton = true,
  submitButtonText = 'Submit'
}) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build dynamic Zod schema based on form definition
  const buildValidationSchema = useCallback(() => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    form.fields.forEach((field) => {
      let fieldSchema: z.ZodTypeAny;

      switch (field.type) {
        case 'email':
          fieldSchema = z.string().email('Invalid email format');
          break;
        case 'number':
          fieldSchema = z.coerce.number();
          break;
        case 'date':
          fieldSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid date format'
          });
          break;
        default:
          fieldSchema = z.string();
      }

      // Apply field-specific validation
      if (field.validation) {
        if (field.validation.minLength) {
          fieldSchema = (fieldSchema as z.ZodString).min(
            field.validation.minLength,
            `Minimum ${field.validation.minLength} characters required`
          );
        }
        if (field.validation.maxLength) {
          fieldSchema = (fieldSchema as z.ZodString).max(
            field.validation.maxLength,
            `Maximum ${field.validation.maxLength} characters allowed`
          );
        }
        if (field.validation.pattern) {
          fieldSchema = (fieldSchema as z.ZodString).regex(
            new RegExp(field.validation.pattern),
            'Invalid format'
          );
        }
      }

      // Handle required fields
      if (field.required) {
        if (field.type === 'checkbox') {
          fieldSchema = z.boolean().refine((val) => val === true, {
            message: `${field.label} is required`
          });
        } else {
          fieldSchema = fieldSchema.min(1, `${field.label} is required`);
        }
      } else {
        fieldSchema = fieldSchema.optional();
      }

      schemaFields[field.name] = fieldSchema;
    });

    return z.object(schemaFields);
  }, [form.fields]);

  const validationSchema = buildValidationSchema();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: initialData,
    mode: 'onChange'
  });

  // Watch all form values for conditional logic
  const watchedValues = watch();

  // Apply conditional logic
  useEffect(() => {
    if (form.validationRules.conditional) {
      form.validationRules.conditional.forEach((rule) => {
        const fieldValue = watchedValues[rule.field];
        const conditionMet = evaluateCondition(fieldValue, rule.condition, rule.value);

        // Apply the action based on condition
        switch (rule.action) {
          case 'show':
          case 'hide':
            // This would typically control field visibility
            // Implementation depends on your specific requirements
            break;
          case 'require':
            // This would typically update field validation
            break;
          case 'disable':
            // This would typically control field enabled state
            break;
        }
      });
    }
  }, [watchedValues, form.validationRules.conditional]);

  // Update validation state
  useEffect(() => {
    const currentErrors = Object.values(errors).map((error) => error.message || 'Validation error');
    setValidationErrors(currentErrors);
    
    if (onValidationChange) {
      onValidationChange(isValid && currentErrors.length === 0, currentErrors);
    }
  }, [errors, isValid, onValidationChange]);

  // Reset form when initial data changes
  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const evaluateCondition = (fieldValue: any, condition: string, expectedValue: any): boolean => {
    switch (condition) {
      case 'equals':
        return fieldValue === expectedValue;
      case 'not_equals':
        return fieldValue !== expectedValue;
      case 'contains':
        return String(fieldValue).includes(String(expectedValue));
      case 'greater_than':
        return Number(fieldValue) > Number(expectedValue);
      case 'less_than':
        return Number(fieldValue) < Number(expectedValue);
      case 'is_empty':
        return !fieldValue || fieldValue === '';
      case 'is_not_empty':
        return fieldValue && fieldValue !== '';
      default:
        return false;
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const fieldError = errors[field.name];
    const isFieldDisabled = readOnly || isLoading;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <TextField
                {...formField}
                label={field.label}
                placeholder={field.placeholder}
                type={field.type}
                required={field.required}
                disabled={isFieldDisabled}
                fullWidth
                error={!!fieldError}
                helperText={fieldError?.message}
                margin="normal"
              />
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <TextField
                {...formField}
                label={field.label}
                type="date"
                required={field.required}
                disabled={isFieldDisabled}
                fullWidth
                error={!!fieldError}
                helperText={fieldError?.message}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <TextField
                {...formField}
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                disabled={isFieldDisabled}
                multiline
                rows={4}
                fullWidth
                error={!!fieldError}
                helperText={fieldError?.message}
                margin="normal"
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <FormControl
                fullWidth
                margin="normal"
                error={!!fieldError}
                disabled={isFieldDisabled}
              >
                <InputLabel required={field.required}>{field.label}</InputLabel>
                <Select {...formField} value={formField.value || ''}>
                  {field.options?.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {fieldError && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                    {fieldError.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        );

      case 'radio':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <FormControl component="fieldset" margin="normal" error={!!fieldError}>
                <Typography variant="body2" gutterBottom>
                  {field.label} {field.required && '*'}
                </Typography>
                <RadioGroup {...formField} value={formField.value || ''}>
                  {field.options?.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={option}
                      control={<Radio />}
                      label={option}
                      disabled={isFieldDisabled}
                    />
                  ))}
                </RadioGroup>
                {fieldError && (
<Typography variant="caption" color="error">
                    {fieldError.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    {...formField}
                    checked={!!formField.value}
                    onChange={(e) => formField.onChange(e.target.checked)}
                    disabled={isFieldDisabled}
                  />
                }
                label={field.label}
                sx={{ mt: 1, mb: 1 }}
              />
            )}
          />
        );

      case 'file':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <Box sx={{ mt: 2, mb: 1 }}>
                <Typography variant="body2" gutterBottom>
                  {field.label} {field.required && '*'}
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  disabled={isFieldDisabled}
                  fullWidth
                >
                  Choose File
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      formField.onChange(file);
                    }}
                  />
                </Button>
                {formField.value && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Selected: {formField.value.name}
                  </Typography>
                )}
                {fieldError && (
                  <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                    {fieldError.message}
                  </Typography>
                )}
              </Box>
            )}
          />
        );

      default:
        return (
          <Alert severity="warning" sx={{ mt: 1, mb: 1 }}>
            Unsupported field type: {field.type}
          </Alert>
        );
    }
  };

  const getGridSize = (): { xs: number; sm?: number; md?: number } => {
    switch (form.schema.layout) {
      case 'two-column':
        return { xs: 12, sm: 6 };
      case 'grid':
        return { xs: 12, sm: 6, md: 4 };
      default:
        return { xs: 12 };
    }
  };

  return (
    <Card>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Form Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {form.schema.title}
            </Typography>
            {form.schema.description && (
              <Typography variant="body2" color="text.secondary">
                {form.schema.description}
              </Typography>
            )}
          </Box>

          {/* Validation Errors Summary */}
          {validationErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Please correct the following errors:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Form Fields */}
          <Grid container spacing={2}>
            {form.fields
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((field) => (
                <Grid key={field.id} item {...getGridSize()}>
                  {renderField(field)}
                </Grid>
              ))}
          </Grid>

          {/* Submit Button */}
          {showSubmitButton && !readOnly && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading || isSubmitting || !isValid}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
                sx={{ minWidth: 120 }}
              >
                {isSubmitting ? 'Submitting...' : submitButtonText}
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default FormRenderer;
EOF

    log_success "Form Renderer component generated"
}

# MANDATORY: Generate Template Management Component
generate_template_management() {
    log_info "Generating Template Management component..."
    
    cat > "${PROJECT_ROOT}/packages/frontend/src/components/templates/TemplateManager.tsx" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/components/templates/TemplateManager.tsx
// Generated: $(date)
// Phase: D2H3 - Advanced Forms & Templates Frontend
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React, Material-UI, React-Query
// Purpose: Enterprise template management interface
// ============================================================================

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Alert,
  Divider,
  Tabs,
  Tab,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Download,
  Upload,
  Preview,
  FileCopy,
  Description,
  PictureAsPdf,
  TableChart,
  Email,
  Search,
  FilterList
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export interface Template {
  id: string;
  name: string;
  description?: string;
  type: 'excel' | 'pdf' | 'html' | 'email';
  content: any;
  variables: string[];
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface TemplateManagerProps {
  templates: Template[];
  onCreateTemplate: (template: Partial<Template>) => Promise<void>;
  onUpdateTemplate: (id: string, template: Partial<Template>) => Promise<void>;
  onDeleteTemplate: (id: string) => Promise<void>;
  onProcessTemplate: (id: string, data: any) => Promise<void>;
  isLoading?: boolean;
}

const templateTypes = [
  { value: 'excel', label: 'Excel Report', icon: TableChart, color: '#4CAF50' },
  { value: 'pdf', label: 'PDF Document', icon: PictureAsPdf, color: '#f44336' },
  { value: 'html', label: 'HTML Page', icon: Description, color: '#FF9800' },
  { value: 'email', label: 'Email Template', icon: Email, color: '#2196F3' }
];

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onProcessTemplate,
  isLoading = false
}) => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processingTemplate, setProcessingTemplate] = useState<Template | null>(null);
  const [templateData, setTemplateData] = useState<Record<string, any>>({});

  // Filter templates based on search and type
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    return matchesSearch && matchesType;
  });

  // Group templates by type
  const templatesByType = templateTypes.map(type => ({
    ...type,
    templates: filteredTemplates.filter(t => t.type === type.value),
    count: filteredTemplates.filter(t => t.type === type.value).length
  }));

  const handleCreateTemplate = useCallback(async (templateData: Partial<Template>) => {
    await onCreateTemplate(templateData);
    setEditDialogOpen(false);
    setEditingTemplate(null);
  }, [onCreateTemplate]);

  const handleUpdateTemplate = useCallback(async (templateData: Partial<Template>) => {
    if (editingTemplate) {
      await onUpdateTemplate(editingTemplate.id, templateData);
      setEditDialogOpen(false);
      setEditingTemplate(null);
    }
  }, [editingTemplate, onUpdateTemplate]);

  const handleDeleteTemplate = useCallback(async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await onDeleteTemplate(templateId);
    }
  }, [onDeleteTemplate]);

  const handleProcessTemplate = useCallback(async () => {
    if (processingTemplate) {
      await onProcessTemplate(processingTemplate.id, templateData);
      setProcessDialogOpen(false);
      setProcessingTemplate(null);
      setTemplateData({});
    }
  }, [processingTemplate, templateData, onProcessTemplate]);

  const getTypeIcon = (type: string) => {
    const typeConfig = templateTypes.find(t => t.value === type);
    if (typeConfig) {
      const IconComponent = typeConfig.icon;
      return <IconComponent sx={{ color: typeConfig.color }} />;
    }
    return <Description />;
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
          <Typography variant="h4">Template Manager</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingTemplate(null);
              setEditDialogOpen(true);
            }}
          >
            Create Template
          </Button>
        </Box>

        {/* Search and Filter */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                startAdornment={<FilterList sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="all">All Types</MenuItem>
                {templateTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={5}>
            <Box display="flex" gap={1}>
              {templateTypes.map((type) => (
                <Chip
                  key={type.value}
                  label={`${type.label} (${templatesByType.find(t => t.value === type.value)?.count || 0})`}
                  variant={filterType === type.value ? 'filled' : 'outlined'}
                  onClick={() => setFilterType(filterType === type.value ? 'all' : type.value)}
                  sx={{ 
                    borderColor: type.color,
                    color: filterType === type.value ? 'white' : type.color,
                    backgroundColor: filterType === type.value ? type.color : 'transparent'
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
            <Tab label="All Templates" />
            <Tab label="By Type" />
            <Tab label="Recent" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {selectedTab === 0 && (
            <Grid container spacing={3}>
              {filteredTemplates.map((template) => (
                <Grid key={template.id} item xs={12} sm={6} md={4}>
                  <TemplateCard
                    template={template}
                    onEdit={(template) => {
                      setEditingTemplate(template);
                      setEditDialogOpen(true);
                    }}
                    onDelete={handleDeleteTemplate}
                    onProcess={(template) => {
                      setProcessingTemplate(template);
                      setProcessDialogOpen(true);
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {selectedTab === 1 && (
            <Box>
              {templatesByType.map((typeGroup) => (
                <Box key={typeGroup.value} sx={{ mb: 4 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    {getTypeIcon(typeGroup.value)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {typeGroup.label} ({typeGroup.count})
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {typeGroup.templates.map((template) => (
                      <Grid key={template.id} item xs={12} sm={6} md={4}>
                        <TemplateCard
                          template={template}
                          onEdit={(template) => {
                            setEditingTemplate(template);
                            setEditDialogOpen(true);
                          }}
                          onDelete={handleDeleteTemplate}
                          onProcess={(template) => {
                            setProcessingTemplate(template);
                            setProcessDialogOpen(true);
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  {typeGroup.count === 0 && (
                    <Alert severity="info">
                      No {typeGroup.label.toLowerCase()} templates found.
                    </Alert>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {selectedTab === 2 && (
            <Grid container spacing={3}>
              {filteredTemplates
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 10)
                .map((template) => (
                  <Grid key={template.id} item xs={12} sm={6} md={4}>
                    <TemplateCard
                      template={template}
                      onEdit={(template) => {
                        setEditingTemplate(template);
                        setEditDialogOpen(true);
                      }}
                      onDelete={handleDeleteTemplate}
                      onProcess={(template) => {
                        setProcessingTemplate(template);
                        setProcessDialogOpen(true);
                      }}
                    />
                  </Grid>
                ))}
            </Grid>
          )}

          {filteredTemplates.length === 0 && (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No templates found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                {searchTerm ? 'Try adjusting your search criteria.' : 'Create your first template to get started.'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingTemplate(null);
                  setEditDialogOpen(true);
                }}
              >
                Create Template
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Template Edit Dialog */}
      <TemplateEditDialog
        template={editingTemplate}
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingTemplate(null);
        }}
        onSave={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
        isLoading={isLoading}
      />

      {/* Template Process Dialog */}
      <TemplateProcessDialog
        template={processingTemplate}
        open={processDialogOpen}
        onClose={() => {
          setProcessDialogOpen(false);
          setProcessingTemplate(null);
          setTemplateData({});
        }}
        onProcess={handleProcessTemplate}
        templateData={templateData}
        onDataChange={setTemplateData}
        isLoading={isLoading}
      />
    </Box>
  );
};

// Template Card Component
const TemplateCard: React.FC<{
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  onProcess: (template: Template) => void;
}> = ({ template, onEdit, onDelete, onProcess }) => {
  const theme = useTheme();
  const typeConfig = templateTypes.find(t => t.value === template.type);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Box display="flex" alignItems="center" mb={2}>
          {typeConfig && <typeConfig.icon sx={{ color: typeConfig.color, mr: 1 }} />}
          <Typography variant="h6" noWrap>
            {template.name}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
          {template.description || 'No description provided'}
        </Typography>

        <Box mb={2}>
          <Chip
            label={typeConfig?.label || template.type}
            size="small"
            sx={{
              backgroundColor: typeConfig?.color,
              color: 'white',
              mr: 1,
              mb: 1
            }}
          />
          <Chip
            label={`v${template.version}`}
            size="small"
            variant="outlined"
            sx={{ mr: 1, mb: 1 }}
          />
          {template.isActive && (
            <Chip
              label="Active"
              size="small"
              color="success"
              sx={{ mb: 1 }}
            />
          )}
        </Box>

        <Typography variant="caption" color="text.secondary">
          Variables: {template.variables.length > 0 ? template.variables.join(', ') : 'None'}
        </Typography>
      </CardContent>

      <Divider />

      <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <IconButton size="small" onClick={() => onEdit(template)} title="Edit">
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(template.id)} title="Delete">
            <Delete fontSize="small" />
          </IconButton>
        </Box>
        <Box>
          <IconButton size="small" onClick={() => onProcess(template)} title="Process">
            <Preview fontSize="small" />
          </IconButton>
          <IconButton size="small" title="Download">
            <Download fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
};

// Template Edit Dialog Component
const TemplateEditDialog: React.FC<{
  template: Template | null;
  open: boolean;
  onClose: () => void;
  onSave: (template: Partial<Template>) => Promise<void>;
  isLoading: boolean;
}> = ({ template, open, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'html' as const,
    content: {}
  });

  React.useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        type: template.type,
        content: template.content
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'html',
        content: {}
      });
    }
  }, [template]);

  const handleSave = async () => {
    await onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {template ? 'Edit Template' : 'Create Template'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={8}>
            <TextField
              label="Template Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              >
                {templateTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isLoading || !formData.name}
        >
          {template ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Template Process Dialog Component
const TemplateProcessDialog: React.FC<{
  template: Template | null;
  open: boolean;
  onClose: () => void;
  onProcess: () => Promise<void>;
  templateData: Record<string, any>;
  onDataChange: (data: Record<string, any>) => void;
  isLoading: boolean;
}> = ({ template, open, onClose, onProcess, templateData, onDataChange, isLoading }) => {
  if (!template) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Process Template: {template.name}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Provide values for the template variables:
        </Typography>

        {template.variables.length === 0 ? (
          <Alert severity="info">
            This template has no variables to configure.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {template.variables.map((variable) => (
              <Grid key={variable} item xs={12}>
                <TextField
                  label={variable}
                  fullWidth
                  value={templateData[variable] || ''}
                  onChange={(e) => onDataChange({
                    ...templateData,
                    [variable]: e.target.value
                  })}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onProcess}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {isLoading ? 'Processing...' : 'Process Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateManager;
EOF

    log_success "Template Management component generated"
}

# MANDATORY: Generate database migrations
generate_database_migrations() {
    log_info "Generating database migrations for forms and templates..."
    
    cat > "${PROJECT_ROOT}/database/migrations/forms/001_create_forms_schema.sql" << 'EOF'
-- ============================================================================
-- PSDD ARTIFACT DOCUMENTATION
-- ============================================================================
-- File Path: database/migrations/forms/001_create_forms_schema.sql
-- Generated: $(date)
-- Phase: D2H3 - Advanced Forms & Templates System
-- Methodology: Phased Shell-Driven Development (PSDD)
-- Purpose: Create forms and templates database schema
-- ============================================================================

BEGIN;

-- Create forms schema
CREATE SCHEMA IF NOT EXISTS forms;
CREATE SCHEMA IF NOT EXISTS templates;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Forms definitions table
CREATE TABLE forms.form_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    form_schema JSONB NOT NULL,
    validation_rules JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- Form fields table
CREATE TABLE forms.form_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES forms.form_definitions(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    field_config JSONB NOT NULL DEFAULT '{}',
    validation_rules JSONB DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Form instances (submissions) table
CREATE TABLE forms.form_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_definition_id UUID NOT NULL REFERENCES forms.form_definitions(id),
    tenant_id UUID NOT NULL,
    form_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'submitted',
    submitted_by UUID,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Templates table
CREATE TABLE templates.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('excel', 'pdf', 'html', 'email')),
    content JSONB NOT NULL,
    variables JSONB DEFAULT '[]',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- Template processing log table
CREATE TABLE templates.template_processing_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES templates.templates(id),
    tenant_id UUID NOT NULL,
    input_data JSONB,
    output_filename VARCHAR(255),
    output_size BIGINT,
    processing_time_ms INTEGER,
    status VARCHAR(50) DEFAULT 'processing',
    error_message TEXT,
    processed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_form_definitions_tenant_id ON forms.form_definitions(tenant_id);
CREATE INDEX idx_form_definitions_active ON forms.form_definitions(tenant_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_form_fields_form_id ON forms.form_fields(form_id);
CREATE INDEX idx_form_fields_sort_order ON forms.form_fields(form_id, sort_order);
CREATE INDEX idx_form_instances_tenant_id ON forms.form_instances(tenant_id);
CREATE INDEX idx_form_instances_form_def_id ON forms.form_instances(form_definition_id);
CREATE INDEX idx_form_instances_submitted_at ON forms.form_instances(submitted_at);

CREATE INDEX idx_templates_tenant_id ON templates.templates(tenant_id);
CREATE INDEX idx_templates_type ON templates.templates(tenant_id, type) WHERE deleted_at IS NULL;
CREATE INDEX idx_templates_active ON templates.templates(tenant_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_template_processing_log_template_id ON templates.template_processing_log(template_id);
CREATE INDEX idx_template_processing_log_tenant_id ON templates.template_processing_log(tenant_id);

-- Row Level Security
ALTER TABLE forms.form_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms.form_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates.template_processing_log ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY form_definitions_tenant_isolation ON forms.form_definitions
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY form_fields_tenant_isolation ON forms.form_fields
    USING (EXISTS (#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - Day 2 Hour 3+ FRONTEND FORMS GENERATOR
# ============================================================================
# File Path: ./scripts/setup/d2h3-forms-frontend-generator.sh
# Generated: $(date)
# Phase: D2H3 - Advanced Forms & Templates Frontend Components
# Methodology: Phased Shell-Driven Development (PSDD)
# Purpose: Generate React components for advanced forms and templates
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h3-frontend-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H3_FRONTEND"
PHASE_NAME="Advanced Forms & Templates Frontend"
PHASE_OBJECTIVE="React components for dynamic form builder and template management"

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

# MANDATORY: Progress tracking
track_progress() {
    local phase="$1"
    local status="$2"
    local progress_file="${PROJECT_ROOT}/.psdd-progress"
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') | ${phase} | ${status}" >> "${progress_file}"
    log_info "Progress tracked: ${phase} - ${status}"
}

# MANDATORY: Generate Dynamic Form Builder Component
generate_form_builder() {
    log_info "Generating Dynamic Form Builder component..."
    
    cat > "${PROJECT_ROOT}/packages/frontend/src/components/form-builder/DynamicFormBuilder.tsx" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/components/form-builder/DynamicFormBuilder.tsx
// Generated: $(date)
// Phase: D2H3 - Advanced Forms & Templates Frontend
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React, Material-UI, React-DnD, React-Hook-Form
// Purpose: Drag-and-drop form builder for enterprise forms
// ============================================================================

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert
} from '@mui/material';
import {
  DragIndicator,
  Add,
  Delete,
  Edit,
  Preview,
  Save,
  Settings,
  TextFields,
  Email,
  Numbers,
  CalendarToday,
  CheckBox,
  RadioButtonChecked,
  Subject,
  AttachFile
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: string;
  };
  sortOrder: number;
}

export interface FormDefinition {
  id?: string;
  name: string;
  description?: string;
  fields: FormField[];
  schema: {
    title: string;
    description?: string;
    layout: 'single-column' | 'two-column' | 'grid';
  };
  validationRules: {
    required?: string[];
    conditional?: Array<{
      field: string;
      condition: string;
      value: any;
      action: 'show' | 'hide' | 'require' | 'disable';
    }>;
  };
}

const fieldTypes = [
  { type: 'text', label: 'Text Input', icon: TextFields },
  { type: 'email', label: 'Email', icon: Email },
  { type: 'number', label: 'Number', icon: Numbers },
  { type: 'date', label: 'Date', icon: CalendarToday },
  { type: 'select', label: 'Dropdown', icon: Subject },
  { type: 'checkbox', label: 'Checkbox', icon: CheckBox },
  { type: 'radio', label: 'Radio Button', icon: RadioButtonChecked },
  { type: 'textarea', label: 'Text Area', icon: Subject },
  { type: 'file', label: 'File Upload', icon: AttachFile }
];

const formDefinitionSchema = z.object({
  name: z.string().min(1, 'Form name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  schema: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    layout: z.enum(['single-column', 'two-column', 'grid'])
  })
});

interface DynamicFormBuilderProps {
  initialForm?: FormDefinition;
  onSave: (form: FormDefinition) => Promise<void>;
  onPreview?: (form: FormDefinition) => void;
  isLoading?: boolean;
}

const DragItem = 'FORM_FIELD';

const DraggableFieldType: React.FC<{
  fieldType: typeof fieldTypes[0];
  onAdd: (type: string) => void;
}> = ({ fieldType, onAdd }) => {
  const [{ isDragging }, drag] = useDrag({
    type: DragItem,
    item: { fieldType: fieldType.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const IconComponent = fieldType.icon;

  return (
    <Card
      ref={drag}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        mb: 1,
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}
      onClick={() => onAdd(fieldType.type)}
    >
      <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconComponent fontSize="small" />
          <Typography variant="body2">{fieldType.label}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const FormFieldItem: React.FC<{
  field: FormField;
  index: number;
  onEdit: (field: FormField) => void;
  onDelete: (fieldId: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}> = ({ field, index, onEdit, onDelete, onMove }) => {
  const theme = useTheme();

  const [{ isDragging }, drag] = useDrag({
    type: DragItem,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: DragItem,
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    }
  });

  return (
    <Card
      ref={(node) => drag(drop(node))}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        mb: 1,
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          borderColor: theme.palette.primary.main
        }
      }}
    >
      <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <DragIndicator sx={{ cursor: 'move' }} />
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {field.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {field.type} {field.required && '(Required)'}
              </Typography>
            </Box>
          </Box>
          <Box>
            <IconButton size="small" onClick={() => onEdit(field)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(field.id)}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const DynamicFormBuilder: React.FC<DynamicFormBuilderProps> = ({
  initialForm,
  onSave,
  onPreview,
  isLoading = false
}) => {
  const theme = useTheme();
  const [formDefinition, setFormDefinition] = useState<FormDefinition>(
    initialForm || {
      name: '',
      description: '',
      fields: [],
      schema: {
        title: '',
        description: '',
        layout: 'single-column'
      },
      validationRules: {}
    }
  );

  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formDefinitionSchema),
    defaultValues: {
      name: formDefinition.name,
      description: formDefinition.description,
      schema: formDefinition.schema
    }
  });

  const [, drop] = useDrop({
    accept: DragItem,
    drop: (item: { fieldType?: string }) => {
      if (item.fieldType) {
        addField(item.fieldType);
      }
    }
  });

  const addField = useCallback((fieldType: string) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: `field_${formDefinition.fields.length + 1}`,
      type: fieldType as FormField['type'],
      label: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
      placeholder: '',
      required: false,
      sortOrder: formDefinition.fields.length,
      options: fieldType === 'select' || fieldType === 'radio' ? ['Option 1', 'Option 2'] : undefined
    };

    setEditingField(newField);
    setFieldDialogOpen(true);
  }, [formDefinition.fields.length]);

  const saveField = useCallback((field: FormField) => {
    setFormDefinition(prev => {
      const existingIndex = prev.fields.findIndex(f => f.id === field.id);
      
      if (existingIndex >= 0) {
        // Update existing field
        const updatedFields = [...prev.fields];
        updatedFields[existingIndex] = field;
        return { ...prev, fields: updatedFields };
      } else {
        // Add new field
        return { ...prev, fields: [...prev.fields, field] };
      }
    });
    
    setEditingField(null);
    setFieldDialogOpen(false);
  }, []);

  const deleteField = useCallback((fieldId: string) => {
    setFormDefinition(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId)
    }));
  }, []);

  const moveField = useCallback((dragIndex: number, hoverIndex: number) => {
    setFormDefinition(prev => {
      const draggedField = prev.fields[dragIndex];
      const updatedFields = [...prev.fields];
      updatedFields.splice(dragIndex, 1);
      updatedFields.splice(hoverIndex, 0, draggedField);
      
      // Update sort orders
      updatedFields.forEach((field, index) => {
        field.sortOrder = index;
      });

      return { ...prev, fields: updatedFields };
    });
  }, []);

  const handleFormSave = useCallback(async (data: any) => {
    const updatedForm: FormDefinition = {
      ...formDefinition,
      name: data.name,
      description: data.description,
      schema: data.schema
    };

    await onSave(updatedForm);
  }, [formDefinition, onSave]);

  const handlePreview = useCallback(() => {
    if (onPreview) {
      onPreview(formDefinition);
    }
    setPreviewMode(true);
  }, [formDefinition, onPreview]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ height: '100vh', display: 'flex' }}>
        {/* Left Panel - Field Types */}
        <Box sx={{ width: 250, borderRight: 1, borderColor: 'divider', p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Form Fields
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Drag fields to the canvas or click to add
          </Typography>
          
          {fieldTypes.map((fieldType) => (
            <DraggableFieldType
              key={fieldType.type}
              fieldType={fieldType}
              onAdd={addField}
            />
          ))}
        </Box>

        {/* Main Canvas */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Toolbar */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box display="flex" justifyContent="between" alignItems="center">
              <Typography variant="h6">Form Builder</Typography>
              <Box display="flex" gap={1}>
                <Button
                  startIcon={<Preview />}
                  onClick={handlePreview}
                  disabled={formDefinition.fields.length === 0}
                >
                  Preview
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSubmit(handleFormSave)}
                  disabled={isLoading || formDefinition.fields.length === 0}
                >
                  Save Form
                </Button>
              </Box>
            </Box>
          </Box>

          <Box sx={{ flex: 1, display: 'flex' }}>
            {/* Form Properties */}
            <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Form Properties
              </Typography>

              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Form Name"
                    fullWidth
                    margin="normal"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    onChange={(e) => {
                      field.onChange(e);
                      setFormDefinition(prev => ({ ...prev, name: e.target.value }));
                    }}
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={3}
                    onChange={(e) => {
                      field.onChange(e);
                      setFormDefinition(prev => ({ ...prev, description: e.target.value }));
                    }}
                  />
                )}
              />

              <Controller
                name="schema.title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Form Title"
                    fullWidth
                    margin="normal"
                    error={!!errors.schema?.title}
                    helperText={errors.schema?.title?.message}
                    onChange={(e) => {
                      field.onChange(e);
                      setFormDefinition(prev => ({
                        ...prev,
                        schema: { ...prev.schema, title: e.target.value }
                      }));
                    }}
                  />
                )}
              />

              <Controller
                name="schema.layout"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Layout</InputLabel>
                    <Select
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setFormDefinition(prev => ({
                          ...prev,
                          schema: { ...prev.schema, layout: e.target.value as any }
                        }));
                      }}
                    >
                      <MenuItem value="single-column">Single Column</MenuItem>
                      <MenuItem value="two-column">Two Column</MenuItem>
                      <MenuItem value="grid">Grid Layout</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Form Statistics
              </Typography>
              <Chip
                label={`${formDefinition.fields.length} Fields`}
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
              <Chip
                label={`${formDefinition.fields.filter(f => f.required).length} Required`}
                size="small"
                color="primary"
                sx={{ mr: 1, mb: 1 }}
              />
            </Box>

            {/* Canvas Area */}
            <Box
              ref={drop}
              sx={{
                flex: 1,
                p: 2,
                minHeight: 400,
                backgroundColor: 'grey.50'
              }}
            >
              {formDefinition.fields.length === 0 ? (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    borderRadius: 1,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <Box textAlign="center">
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Start Building Your Form
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Drag fields from the left panel or click to add them
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {formDefinition.schema.title || 'Untitled Form'}
                  </Typography>
                  {formDefinition.schema.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {formDefinition.schema.description}
                    </Typography>
                  )}

                  {formDefinition.fields.map((field, index) => (
                    <FormFieldItem
                      key={field.id}
                      field={field}
                      index={index}
                      onEdit={(field) => {
                        setEditingField(field);
                        setFieldDialogOpen(true);
                      }}
                      onDelete={deleteField}
                      onMove={moveField}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Field Edit Dialog */}
      <FieldEditDialog
        field={editingField}
        open={fieldDialogOpen}
        onClose={() => {
          setFieldDialogOpen(false);
          setEditingField(null);
        }}
        onSave={saveField}
      />

      {/* Form Preview Dialog */}
      <FormPreviewDialog
        form={formDefinition}
        open={previewMode}
        onClose={() => setPreviewMode(false)}
      />
    </DndProvider>
  );
};

// Field Edit Dialog Component
const FieldEditDialog: React.FC<{
  field: FormField | null;
  open: boolean;
  onClose: () => void;
  onSave: (field: FormField) => void;
}> = ({ field, open, onClose, onSave }) => {
  const [editedField, setEditedField] = useState<FormField | null>(null);

  useEffect(() => {
    if (field) {
      setEditedField({ ...field });
    }
  }, [field]);

  const handleSave = () => {
    if (editedField) {
      onSave(editedField);
    }
  };

  if (!editedField) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit {editedField.type.charAt(0).toUpperCase() + editedField.type.slice(1)} Field
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Field Name"
              fullWidth
              value={editedField.name}
              onChange={(e) =>
                setEditedField(prev => prev ? { ...prev, name: e.target.value } : null)
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Label"
              fullWidth
              value={editedField.label}
              onChange={(e) =>
                setEditedField(prev => prev ? { ...prev, label: e.target.value } : null)
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Placeholder"
              fullWidth
              value={editedField.placeholder || ''}
              onChange={(e) =>
                setEditedField(prev => prev ? { ...prev, placeholder: e.target.value } : null)
              }
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={editedField.required}
                  onChange={(e) =>
                    setEditedField(prev => prev ? { ...prev, required: e.target.checked } : null)
                  }
                />
              }
              label="Required Field"
            />
          </Grid>

          {(editedField.type === 'select' || editedField.type === 'radio') && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Options
              </Typography>
              {editedField.options?.map((option, index) => (
                <Box key={index} display="flex" gap={1} mb={1}>
                  <TextField
                    size="small"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(editedField.options || [])];
                      newOptions[index] = e.target.value;
                      setEditedField(prev => prev ? { ...prev, options: newOptions } : null);
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newOptions = editedField.options?.filter((_, i) => i !== index);
                      setEditedField(prev => prev ? { ...prev, options: newOptions } : null);
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<Add />}
                onClick={() => {
                  const newOptions = [...(editedField.options || []), `Option ${(editedField.options?.length || 0) + 1}`];
                  setEditedField(prev => prev ? { ...prev, options: newOptions } : null);
                }}
              >
                Add Option
              </Button>
            </Grid>
          )}

          {/* Validation Rules */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Validation Rules
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Min Length"
                  type="number"
                  size="small"
                  value={editedField.validation?.minLength || ''}
                  onChange={(e) =>
                    setEditedField(prev => prev ? {
                      ...prev,
                      validation: {
                        ...prev.validation,
                        minLength: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    } : null)
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Max Length"
                  type="number"
                  size="small"
                  value={editedField.validation?.maxLength || ''}
                  onChange={(e) =>
                    setEditedField(prev => prev ? {
                      ...prev,
                      validation: {
                        ...prev.validation,
                        maxLength: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    } : null)
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Field
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Form Preview Dialog Component
const FormPreviewDialog: React.FC<{
  form: FormDefinition;
  open: boolean;
  onClose: () => void;
}> = ({ form, open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Form Preview</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            {form.schema.title}
          </Typography>
          {form.schema.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {form.schema.description}
            </Typography>
          )}

          <Grid container spacing={2}>
            {form.fields.map((field) => (
              <Grid
                key={field.id}
                item
                xs={form.schema.layout === 'two-column' ? 6 : 12}
              >
                <FormFieldPreview field={field} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close Preview</Button>
      </DialogActions>
    </Dialog>
  );
};

// Form Field Preview Component
const FormFieldPreview: React.FC<{ field: FormField }> = ({ field }) => {
  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            type={field.type}
            required={field.required}
            fullWidth
            disabled
          />
        );

      case 'date':
        return (
          <TextField
            label={field.label}
            type="date"
            required={field.required}
            fullWidth
            disabled
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'textarea':
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            multiline
            rows={3}
            fullWidth
            disabled
          />
        );

      case 'select':
        return (
          <FormControl fullWidth disabled>
            <InputLabel required={field.required}>{field.label}</InputLabel>
            <Select value="">
              {field.options?.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            control={<CheckBox disabled />}
            label={field.label}
            required={field.required}
          />
        );

      case 'file':
        return (
          <Box>
            <Typography variant="body2" gutterBottom>
              {field.label} {field.required && '*'}
            </Typography>
            <Button variant="outlined" component="label" disabled>
              Choose File
              <input type="file" hidden />
            </Button>
          </Box>
        );

      default:
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            fullWidth
            disabled
          />
        );
    }
  };

  return <Box sx={{ mb: 2 }}>{renderField()}</Box>;
};

export default DynamicFormBuilder;
EOF

    log_success "Dynamic Form Builder component generated"
}

# MANDATORY: Generate Form Renderer Component
generate_form_renderer() {
    log_info "Generating Form Renderer component..."
    
    cat > "${PROJECT_ROOT}/packages/frontend/src/components/forms/FormRenderer.tsx" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/components/forms/FormRenderer.tsx
// Generated: $(date)
// Phase: D2H3 - Advanced Forms & Templates Frontend
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React, Material-UI, React-Hook-Form, Zod
// Purpose: Dynamic form renderer for enterprise forms
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormDefinition, FormField } from './DynamicFormBuilder';

interface FormRendererProps {
  form: FormDefinition;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  isLoading?: boolean;
  readOnly?: boolean;
  showSubmitButton?: boolean;
  submitButtonText?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  form,
  initialData = {},
  onSubmit,
  onValidationChange,
  isLoading = false,
  readOnly = false,
  showSubmitButton = true,
  submitButtonText = 'Submit'
}) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build dynamic Zod schema based on form definition
  const buildValidationSchema = useCallback(() => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    form.fields.forEach((field) => {
      let fieldSchema: z.ZodTypeAny;

      switch (field.type) {
        case 'email':
          fieldSchema = z.string().email('Invalid email format');
          break;
        case 'number':
          fieldSchema = z.coerce.number();
          break;
        case 'date':
          fieldSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid date format'
          });
          break;
        default:
          fieldSchema = z.string();
      }

      // Apply field-specific validation
      if (field.validation) {
        if (field.validation.minLength) {
          fieldSchema = (fieldSchema as z.ZodString).min(
            field.validation.minLength,
            `Minimum ${field.validation.minLength} characters required`
          );
        }
        if (field.validation.maxLength) {
          fieldSchema = (fieldSchema as z.ZodString).max(
            field.validation.maxLength,
            `Maximum ${field.validation.maxLength} characters allowed`
          );
        }
        if (field.validation.pattern) {
          fieldSchema = (fieldSchema as z.ZodString).regex(
            new RegExp(field.validation.pattern),
            'Invalid format'
          );
        }
      }

      // Handle required fields
      if (field.required) {
        if (field.type === 'checkbox') {
          fieldSchema = z.boolean().refine((val) => val === true, {
            message: `${field.label} is required`
          });
        } else {
          fieldSchema = fieldSchema.min(1, `${field.label} is required`);
        }
      } else {
        fieldSchema = fieldSchema.optional();
      }

      schemaFields[field.name] = fieldSchema;
    });

    return z.object(schemaFields);
  }, [form.fields]);

  const validationSchema = buildValidationSchema();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: initialData,
    mode: 'onChange'
  });

  // Watch all form values for conditional logic
  const watchedValues = watch();

  // Apply conditional logic
  useEffect(() => {
    if (form.validationRules.conditional) {
      form.validationRules.conditional.forEach((rule) => {
        const fieldValue = watchedValues[rule.field];
        const conditionMet = evaluateCondition(fieldValue, rule.condition, rule.value);

        // Apply the action based on condition
        switch (rule.action) {
          case 'show':
          case 'hide':
            // This would typically control field visibility
            // Implementation depends on your specific requirements
            break;
          case 'require':
            // This would typically update field validation
            break;
          case 'disable':
            // This would typically control field enabled state
            break;
        }
      });
    }
  }, [watchedValues, form.validationRules.conditional]);

  // Update validation state
  useEffect(() => {
    const currentErrors = Object.values(errors).map((error) => error.message || 'Validation error');
    setValidationErrors(currentErrors);
    
    if (onValidationChange) {
      onValidationChange(isValid && currentErrors.length === 0, currentErrors);
    }
  }, [errors, isValid, onValidationChange]);

  // Reset form when initial data changes
  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const evaluateCondition = (fieldValue: any, condition: string, expectedValue: any): boolean => {
    switch (condition) {
      case 'equals':
        return fieldValue === expectedValue;
      case 'not_equals':
        return fieldValue !== expectedValue;
      case 'contains':
        return String(fieldValue).includes(String(expectedValue));
      case 'greater_than':
        return Number(fieldValue) > Number(expectedValue);
      case 'less_than':
        return Number(fieldValue) < Number(expectedValue);
      case 'is_empty':
        return !fieldValue || fieldValue === '';
      case 'is_not_empty':
        return fieldValue && fieldValue !== '';
      default:
        return false;
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const fieldError = errors[field.name];
    const isFieldDisabled = readOnly || isLoading;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <TextField
                {...formField}
                label={field.label}
                placeholder={field.placeholder}
                type={field.type}
                required={field.required}
                disabled={isFieldDisabled}
                fullWidth
                error={!!fieldError}
                helperText={fieldError?.message}
                margin="normal"
              />
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <TextField
                {...formField}
                label={field.label}
                type="date"
                required={field.required}
                disabled={isFieldDisabled}
                fullWidth
                error={!!fieldError}
                helperText={fieldError?.message}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <TextField
                {...formField}
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                disabled={isFieldDisabled}
                multiline
                rows={4}
                fullWidth
                error={!!fieldError}
                helperText={fieldError?.message}
                margin="normal"
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <FormControl
                fullWidth
                margin="normal"
                error={!!fieldError}
                disabled={isFieldDisabled}
              >
                <InputLabel required={field.required}>{field.label}</InputLabel>
                <Select {...formField} value={formField.value || ''}>
                  {field.options?.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {fieldError && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                    {fieldError.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        );

      case 'radio':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <FormControl component="fieldset" margin="normal" error={!!fieldError}>
                <Typography variant="body2" gutterBottom>
                  {field.label} {field.required && '*'}
                </Typography>
                <RadioGroup {...formField} value={formField.value || ''}>
                  {field.options?.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={option}
                      control={<Radio />}
                      label={option}
                      disabled={isFieldDisabled}
                    />
                  ))}
                </RadioGroup>
                {fieldError && (
<Typography variant="caption" color="error">
                    {fieldError.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    {...formField}
                    checked={!!formField.value}
                    onChange={(e) => formField.onChange(e.target.checked)}
                    disabled={isFieldDisabled}
                  />
                }
                label={field.label}
                sx={{ mt: 1, mb: 1 }}
              />
            )}
          />
        );

      case 'file':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <Box sx={{ mt: 2, mb: 1 }}>
                <Typography variant="body2" gutterBottom>
                  {field.label} {field.required && '*'}
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  disabled={isFieldDisabled}
                  fullWidth
                >
                  Choose File
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      formField.onChange(file);
                    }}
                  />
                </Button>
                {formField.value && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Selected: {formField.value.name}
                  </Typography>
                )}
                {fieldError && (
                  <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                    {fieldError.message}
                  </Typography>
                )}
              </Box>
            )}
          />
        );

      default:
        return (
          <Alert severity="warning" sx={{ mt: 1, mb: 1 }}>
            Unsupported field type: {field.type}
          </Alert>
        );
    }
  };

  const getGridSize = (): { xs: number; sm?: number; md?: number } => {
    switch (form.schema.layout) {
      case 'two-column':
        return { xs: 12, sm: 6 };
      case 'grid':
        return { xs: 12, sm: 6, md: 4 };
      default:
        return { xs: 12 };
    }
  };

  return (
    <Card>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Form Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {form.schema.title}
            </Typography>
            {form.schema.description && (
              <Typography variant="body2" color="text.secondary">
                {form.schema.description}
              </Typography>
            )}
          </Box>

          {/* Validation Errors Summary */}
          {validationErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Please correct the following errors:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Form Fields */}
          <Grid container spacing={2}>
            {form.fields
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((field) => (
                <Grid key={field.id} item {...getGridSize()}>
                  {renderField(field)}
                </Grid>
              ))}
          </Grid>

          {/* Submit Button */}
          {showSubmitButton && !readOnly && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading || isSubmitting || !isValid}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
                sx={{ minWidth: 120 }}
              >
                {isSubmitting ? 'Submitting...' : submitButtonText}
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default FormRenderer;
EOF

    log_success "Form Renderer component generated"
}

# MANDATORY: Generate Template Management Component
generate_template_management() {
    log_info "Generating Template Management component..."
    
    cat > "${PROJECT_ROOT}/packages/frontend/src/components/templates/TemplateManager.tsx" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/components/templates/TemplateManager.tsx
// Generated: $(date)
// Phase: D2H3 - Advanced Forms & Templates Frontend
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React, Material-UI, React-Query
// Purpose: Enterprise template management interface
// ============================================================================

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Alert,
  Divider,
  Tabs,
  Tab,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Download,
  Upload,
  Preview,
  FileCopy,
  Description,
  PictureAsPdf,
  TableChart,
  Email,
  Search,
  FilterList
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export interface Template {
  id: string;
  name: string;
  description?: string;
  type: 'excel' | 'pdf' | 'html' | 'email';
  content: any;
  variables: string[];
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface TemplateManagerProps {
  templates: Template[];
  onCreateTemplate: (template: Partial<Template>) => Promise<void>;
  onUpdateTemplate: (id: string, template: Partial<Template>) => Promise<void>;
  onDeleteTemplate: (id: string) => Promise<void>;
  onProcessTemplate: (id: string, data: any) => Promise<void>;
  isLoading?: boolean;
}

const templateTypes = [
  { value: 'excel', label: 'Excel Report', icon: TableChart, color: '#4CAF50' },
  { value: 'pdf', label: 'PDF Document', icon: PictureAsPdf, color: '#f44336' },
  { value: 'html', label: 'HTML Page', icon: Description, color: '#FF9800' },
  { value: 'email', label: 'Email Template', icon: Email, color: '#2196F3' }
];

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onProcessTemplate,
  isLoading = false
}) => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processingTemplate, setProcessingTemplate] = useState<Template | null>(null);
  const [templateData, setTemplateData] = useState<Record<string, any>>({});

  // Filter templates based on search and type
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    return matchesSearch && matchesType;
  });

  // Group templates by type
  const templatesByType = templateTypes.map(type => ({
    ...type,
    templates: filteredTemplates.filter(t => t.type === type.value),
    count: filteredTemplates.filter(t => t.type === type.value).length
  }));

  const handleCreateTemplate = useCallback(async (templateData: Partial<Template>) => {
    await onCreateTemplate(templateData);
    setEditDialogOpen(false);
    setEditingTemplate(null);
  }, [onCreateTemplate]);

  const handleUpdateTemplate = useCallback(async (templateData: Partial<Template>) => {
    if (editingTemplate) {
      await onUpdateTemplate(editingTemplate.id, templateData);
      setEditDialogOpen(false);
      setEditingTemplate(null);
    }
  }, [editingTemplate, onUpdateTemplate]);

  const handleDeleteTemplate = useCallback(async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await onDeleteTemplate(templateId);
    }
  }, [onDeleteTemplate]);

  const handleProcessTemplate = useCallback(async () => {
    if (processingTemplate) {
      await onProcessTemplate(processingTemplate.id, templateData);
      setProcessDialogOpen(false);
      setProcessingTemplate(null);
      setTemplateData({});
    }
  }, [processingTemplate, templateData, onProcessTemplate]);

  const getTypeIcon = (type: string) => {
    const typeConfig = templateTypes.find(t => t.value === type);
    if (typeConfig) {
      const IconComponent = typeConfig.icon;
      return <IconComponent sx={{ color: typeConfig.color }} />;
    }
    return <Description />;
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
          <Typography variant="h4">Template Manager</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingTemplate(null);
              setEditDialogOpen(true);
            }}
          >
            Create Template
          </Button>
        </Box>

        {/* Search and Filter */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                startAdornment={<FilterList sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="all">All Types</MenuItem>
                {templateTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={5}>
            <Box display="flex" gap={1}>
              {templateTypes.map((type) => (
                <Chip
                  key={type.value}
                  label={`${type.label} (${templatesByType.find(t => t.value === type.value)?.count || 0})`}
                  variant={filterType === type.value ? 'filled' : 'outlined'}
                  onClick={() => setFilterType(filterType === type.value ? 'all' : type.value)}
                  sx={{ 
                    borderColor: type.color,
                    color: filterType === type.value ? 'white' : type.color,
                    backgroundColor: filterType === type.value ? type.color : 'transparent'
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
            <Tab label="All Templates" />
            <Tab label="By Type" />
            <Tab label="Recent" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {selectedTab === 0 && (
            <Grid container spacing={3}>
              {filteredTemplates.map((template) => (
                <Grid key={template.id} item xs={12} sm={6} md={4}>
                  <TemplateCard
                    template={template}
                    onEdit={(template) => {
                      setEditingTemplate(template);
                      setEditDialogOpen(true);
                    }}
                    onDelete={handleDeleteTemplate}
                    onProcess={(template) => {
                      setProcessingTemplate(template);
                      setProcessDialogOpen(true);
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {selectedTab === 1 && (
            <Box>
              {templatesByType.map((typeGroup) => (
                <Box key={typeGroup.value} sx={{ mb: 4 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    {getTypeIcon(typeGroup.value)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {typeGroup.label} ({typeGroup.count})
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {typeGroup.templates.map((template) => (
                      <Grid key={template.id} item xs={12} sm={6} md={4}>
                        <TemplateCard
                          template={template}
                          onEdit={(template) => {
                            setEditingTemplate(template);
                            setEditDialogOpen(true);
                          }}
                          onDelete={handleDeleteTemplate}
                          onProcess={(template) => {
                            setProcessingTemplate(template);
                            setProcessDialogOpen(true);
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  {typeGroup.count === 0 && (
                    <Alert severity="info">
                      No {typeGroup.label.toLowerCase()} templates found.
                    </Alert>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {selectedTab === 2 && (
            <Grid container spacing={3}>
              {filteredTemplates
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 10)
                .map((template) => (
                  <Grid key={template.id} item xs={12} sm={6} md={4}>
                    <TemplateCard
                      template={template}
                      onEdit={(template) => {
                        setEditingTemplate(template);
                        setEditDialogOpen(true);
                      }}
                      onDelete={handleDeleteTemplate}
                      onProcess={(template) => {
                        setProcessingTemplate(template);
                        setProcessDialogOpen(true);
                      }}
                    />
                  </Grid>
                ))}
            </Grid>
          )}

          {filteredTemplates.length === 0 && (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No templates found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                {searchTerm ? 'Try adjusting your search criteria.' : 'Create your first template to get started.'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingTemplate(null);
                  setEditDialogOpen(true);
                }}
              >
                Create Template
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Template Edit Dialog */}
      <TemplateEditDialog
        template={editingTemplate}
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingTemplate(null);
        }}
        onSave={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
        isLoading={isLoading}
      />

      {/* Template Process Dialog */}
      <TemplateProcessDialog
        template={processingTemplate}
        open={processDialogOpen}
        onClose={() => {
          setProcessDialogOpen(false);
          setProcessingTemplate(null);
          setTemplateData({});
        }}
        onProcess={handleProcessTemplate}
        templateData={templateData}
        onDataChange={setTemplateData}
        isLoading={isLoading}
      />
    </Box>
  );
};

// Template Card Component
const TemplateCard: React.FC<{
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  onProcess: (template: Template) => void;
}> = ({ template, onEdit, onDelete, onProcess }) => {
  const theme = useTheme();
  const typeConfig = templateTypes.find(t => t.value === template.type);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Box display="flex" alignItems="center" mb={2}>
          {typeConfig && <typeConfig.icon sx={{ color: typeConfig.color, mr: 1 }} />}
          <Typography variant="h6" noWrap>
            {template.name}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
          {template.description || 'No description provided'}
        </Typography>

        <Box mb={2}>
          <Chip
            label={typeConfig?.label || template.type}
            size="small"
            sx={{
              backgroundColor: typeConfig?.color,
              color: 'white',
              mr: 1,
              mb: 1
            }}
          />
          <Chip
            label={`v${template.version}`}
            size="small"
            variant="outlined"
            sx={{ mr: 1, mb: 1 }}
          />
          {template.isActive && (
            <Chip
              label="Active"
              size="small"
              color="success"
              sx={{ mb: 1 }}
            />
          )}
        </Box>

        <Typography variant="caption" color="text.secondary">
          Variables: {template.variables.length > 0 ? template.variables.join(', ') : 'None'}
        </Typography>
      </CardContent>

      <Divider />

      <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <IconButton size="small" onClick={() => onEdit(template)} title="Edit">
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(template.id)} title="Delete">
            <Delete fontSize="small" />
          </IconButton>
        </Box>
        <Box>
          <IconButton size="small" onClick={() => onProcess(template)} title="Process">
            <Preview fontSize="small" />
          </IconButton>
          <IconButton size="small" title="Download">
            <Download fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
};

// Template Edit Dialog Component
const TemplateEditDialog: React.FC<{
  template: Template | null;
  open: boolean;
  onClose: () => void;
  onSave: (template: Partial<Template>) => Promise<void>;
  isLoading: boolean;
}> = ({ template, open, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'html' as const,
    content: {}
  });

  React.useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        type: template.type,
        content: template.content
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'html',
        content: {}
      });
    }
  }, [template]);

  const handleSave = async () => {
    await onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {template ? 'Edit Template' : 'Create Template'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={8}>
            <TextField
              label="Template Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              >
                {templateTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isLoading || !formData.name}
        >
          {template ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Template Process Dialog Component
const TemplateProcessDialog: React.FC<{
  template: Template | null;
  open: boolean;
  onClose: () => void;
  onProcess: () => Promise<void>;
  templateData: Record<string, any>;
  onDataChange: (data: Record<string, any>) => void;
  isLoading: boolean;
}> = ({ template, open, onClose, onProcess, templateData, onDataChange, isLoading }) => {
  if (!template) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Process Template: {template.name}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Provide values for the template variables:
        </Typography>

        {template.variables.length === 0 ? (
          <Alert severity="info">
            This template has no variables to configure.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {template.variables.map((variable) => (
              <Grid key={variable} item xs={12}>
                <TextField
                  label={variable}
                  fullWidth
                  value={templateData[variable] || ''}
                  onChange={(e) => onDataChange({
                    ...templateData,
                    [variable]: e.target.value
                  })}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onProcess}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {isLoading ? 'Processing...' : 'Process Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateManager;
EOF

    log_success "Template Management component generated"
}

# MANDATORY: Generate database migrations
generate_database_migrations() {
    log_info "Generating database migrations for forms and templates..."
    
    cat > "${PROJECT_ROOT}/database/migrations/forms/001_create_forms_schema.sql" << 'EOF'
-- ============================================================================
-- PSDD ARTIFACT DOCUMENTATION
-- ============================================================================
-- File Path: database/migrations/forms/001_create_forms_schema.sql
-- Generated: $(date)
-- Phase: D2H3 - Advanced Forms & Templates System
-- Methodology: Phased Shell-Driven Development (PSDD)
-- Purpose: Create forms and templates database schema
-- ============================================================================

BEGIN;

-- Create forms schema
CREATE SCHEMA IF NOT EXISTS forms;
CREATE SCHEMA IF NOT EXISTS templates;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Forms definitions table
CREATE TABLE forms.form_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    form_schema JSONB NOT NULL,
    validation_rules JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- Form fields table
CREATE TABLE forms.form_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES forms.form_definitions(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    field_config JSONB NOT NULL DEFAULT '{}',
    validation_rules JSONB DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Form instances (submissions) table
CREATE TABLE forms.form_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_definition_id UUID NOT NULL REFERENCES forms.form_definitions(id),
    tenant_id UUID NOT NULL,
    form_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'submitted',
    submitted_by UUID,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Templates table
CREATE TABLE templates.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('excel', 'pdf', 'html', 'email')),
    content JSONB NOT NULL,
    variables JSONB DEFAULT '[]',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- Template processing log table
CREATE TABLE templates.template_processing_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES templates.templates(id),
    tenant_id UUID NOT NULL,
    input_data JSONB,
    output_filename VARCHAR(255),
    output_size BIGINT,
    processing_time_ms INTEGER,
    status VARCHAR(50) DEFAULT 'processing',
    error_message TEXT,
    processed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_form_definitions_tenant_id ON forms.form_definitions(tenant_id);
CREATE INDEX idx_form_definitions_active ON forms.form_definitions(tenant_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_form_fields_form_id ON forms.form_fields(form_id);
CREATE INDEX idx_form_fields_sort_order ON forms.form_fields(form_id, sort_order);
CREATE INDEX idx_form_instances_tenant_id ON forms.form_instances(tenant_id);
CREATE INDEX idx_form_instances_form_def_id ON forms.form_instances(form_definition_id);
CREATE INDEX idx_form_instances_submitted_at ON forms.form_instances(submitted_at);

CREATE INDEX idx_templates_tenant_id ON templates.templates(tenant_id);
CREATE INDEX idx_templates_type ON templates.templates(tenant_id, type) WHERE deleted_at IS NULL;
CREATE INDEX idx_templates_active ON templates.templates(tenant_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_template_processing_log_template_id ON templates.template_processing_log(template_id);
CREATE INDEX idx_template_processing_log_tenant_id ON templates.template_processing_log(tenant_id);

-- Row Level Security
ALTER TABLE forms.form_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms.form_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates.template_processing_log ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY form_definitions_tenant_isolation ON forms.form_definitions
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY form_fields_tenant_isolation ON forms.form_fields
    USING (EXISTS (#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - Day 2 Hour 3+ FRONTEND FORMS GENERATOR
# ============================================================================
# File Path: ./scripts/setup/d2h3-forms-frontend-generator.sh
# Generated: $(date)
# Phase: D2H3 - Advanced Forms & Templates Frontend Components
# Methodology: Phased Shell-Driven Development (PSDD)
# Purpose: Generate React components for advanced forms and templates
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h3-frontend-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H3_FRONTEND"
PHASE_NAME="Advanced Forms & Templates Frontend"
PHASE_OBJECTIVE="React components for dynamic form builder and template management"

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

# MANDATORY: Progress tracking
track_progress() {
    local phase="$1"
    local status="$2"
    local progress_file="${PROJECT_ROOT}/.psdd-progress"
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') | ${phase} | ${status}" >> "${progress_file}"
    log_info "Progress tracked: ${phase} - ${status}"
}

# MANDATORY: Generate Dynamic Form Builder Component
generate_form_builder() {
    log_info "Generating Dynamic Form Builder component..."
    
    cat > "${PROJECT_ROOT}/packages/frontend/src/components/form-builder/DynamicFormBuilder.tsx" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/components/form-builder/DynamicFormBuilder.tsx
// Generated: $(date)
// Phase: D2H3 - Advanced Forms & Templates Frontend
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React, Material-UI, React-DnD, React-Hook-Form
// Purpose: Drag-and-drop form builder for enterprise forms
// ============================================================================

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert
} from '@mui/material';
import {
  DragIndicator,
  Add,
  Delete,
  Edit,
  Preview,
  Save,
  Settings,
  TextFields,
  Email,
  Numbers,
  CalendarToday,
  CheckBox,
  RadioButtonChecked,
  Subject,
  AttachFile
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: string;
  };
  sortOrder: number;
}

export interface FormDefinition {
  id?: string;
  name: string;
  description?: string;
  fields: FormField[];
  schema: {
    title: string;
    description?: string;
    layout: 'single-column' | 'two-column' | 'grid';
  };
  validationRules: {
    required?: string[];
    conditional?: Array<{
      field: string;
      condition: string;
      value: any;
      action: 'show' | 'hide' | 'require' | 'disable';
    }>;
  };
}

const fieldTypes = [
  { type: 'text', label: 'Text Input', icon: TextFields },
  { type: 'email', label: 'Email', icon: Email },
  { type: 'number', label: 'Number', icon: Numbers },
  { type: 'date', label: 'Date', icon: CalendarToday },
  { type: 'select', label: 'Dropdown', icon: Subject },
  { type: 'checkbox', label: 'Checkbox', icon: CheckBox },
  { type: 'radio', label: 'Radio Button', icon: RadioButtonChecked },
  { type: 'textarea', label: 'Text Area', icon: Subject },
  { type: 'file', label: 'File Upload', icon: AttachFile }
];

const formDefinitionSchema = z.object({
  name: z.string().min(1, 'Form name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  schema: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    layout: z.enum(['single-column', 'two-column', 'grid'])
  })
});

interface DynamicFormBuilderProps {
  initialForm?: FormDefinition;
  onSave: (form: FormDefinition) => Promise<void>;
  onPreview?: (form: FormDefinition) => void;
  isLoading?: boolean;
}

const DragItem = 'FORM_FIELD';

const DraggableFieldType: React.FC<{
  fieldType: typeof fieldTypes[0];
  onAdd: (type: string) => void;
}> = ({ fieldType, onAdd }) => {
  const [{ isDragging }, drag] = useDrag({
    type: DragItem,
    item: { fieldType: fieldType.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const IconComponent = fieldType.icon;

  return (
    <Card
      ref={drag}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        mb: 1,
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}
      onClick={() => onAdd(fieldType.type)}
    >
      <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconComponent fontSize="small" />
          <Typography variant="body2">{fieldType.label}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const FormFieldItem: React.FC<{
  field: FormField;
  index: number;
  onEdit: (field: FormField) => void;
  onDelete: (fieldId: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}> = ({ field, index, onEdit, onDelete, onMove }) => {
  const theme = useTheme();

  const [{ isDragging }, drag] = useDrag({
    type: DragItem,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: DragItem,
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    }
  });

  return (
    <Card
      ref={(node) => drag(drop(node))}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        mb: 1,
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          borderColor: theme.palette.primary.main
        }
      }}
    >
      <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <DragIndicator sx={{ cursor: 'move' }} />
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {field.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {field.type} {field.required && '(Required)'}
              </Typography>
            </Box>
          </Box>
          <Box>
            <IconButton size="small" onClick={() => onEdit(field)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(field.id)}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const DynamicFormBuilder: React.FC<DynamicFormBuilderProps> = ({
  initialForm,
  onSave,
  onPreview,
  isLoading = false
}) => {
  const theme = useTheme();
  const [formDefinition, setFormDefinition] = useState<FormDefinition>(
    initialForm || {
      name: '',
      description: '',
      fields: [],
      schema: {
        title: '',
        description: '',
        layout: 'single-column'
      },
      validationRules: {}
    }
  );

  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formDefinitionSchema),
    defaultValues: {
      name: formDefinition.name,
      description: formDefinition.description,
      schema: formDefinition.schema
    }
  });

  const [, drop] = useDrop({
    accept: DragItem,
    drop: (item: { fieldType?: string }) => {
      if (item.fieldType) {
        addField(item.fieldType);
      }
    }
  });

  const addField = useCallback((fieldType: string) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: `field_${formDefinition.fields.length + 1}`,
      type: fieldType as FormField['type'],
      label: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
      placeholder: '',
      required: false,
      sortOrder: formDefinition.fields.length,
      options: fieldType === 'select' || fieldType === 'radio' ? ['Option 1', 'Option 2'] : undefined
    };

    setEditingField(newField);
    setFieldDialogOpen(true);
  }, [formDefinition.fields.length]);

  const saveField = useCallback((field: FormField) => {
    setFormDefinition(prev => {
      const existingIndex = prev.fields.findIndex(f => f.id === field.id);
      
      if (existingIndex >= 0) {
        // Update existing field
        const updatedFields = [...prev.fields];
        updatedFields[existingIndex] = field;
        return { ...prev, fields: updatedFields };
      } else {
        // Add new field
        return { ...prev, fields: [...prev.fields, field] };
      }
    });
    
    setEditingField(null);
    setFieldDialogOpen(false);
  }, []);

  const deleteField = useCallback((fieldId: string) => {
    setFormDefinition(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId)
    }));
  }, []);

  const moveField = useCallback((dragIndex: number, hoverIndex: number) => {
    setFormDefinition(prev => {
      const draggedField = prev.fields[dragIndex];
      const updatedFields = [...prev.fields];
      updatedFields.splice(dragIndex, 1);
      updatedFields.splice(hoverIndex, 0, draggedField);
      
      // Update sort orders
      updatedFields.forEach((field, index) => {
        field.sortOrder = index;
      });

      return { ...prev, fields: updatedFields };
    });
  }, []);

  const handleFormSave = useCallback(async (data: any) => {
    const updatedForm: FormDefinition = {
      ...formDefinition,
      name: data.name,
      description: data.description,
      schema: data.schema
    };

    await onSave(updatedForm);
  }, [formDefinition, onSave]);

  const handlePreview = useCallback(() => {
    if (onPreview) {
      onPreview(formDefinition);
    }
    setPreviewMode(true);
  }, [formDefinition, onPreview]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ height: '100vh', display: 'flex' }}>
        {/* Left Panel - Field Types */}
        <Box sx={{ width: 250, borderRight: 1, borderColor: 'divider', p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Form Fields
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Drag fields to the canvas or click to add
          </Typography>
          
          {fieldTypes.map((fieldType) => (
            <DraggableFieldType
              key={fieldType.type}
              fieldType={fieldType}
              onAdd={addField}
            />
          ))}
        </Box>

        {/* Main Canvas */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Toolbar */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box display="flex" justifyContent="between" alignItems="center">
              <Typography variant="h6">Form Builder</Typography>
              <Box display="flex" gap={1}>
                <Button
                  startIcon={<Preview />}
                  onClick={handlePreview}
                  disabled={formDefinition.fields.length === 0}
                >
                  Preview
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSubmit(handleFormSave)}
                  disabled={isLoading || formDefinition.fields.length === 0}
                >
                  Save Form
                </Button>
              </Box>
            </Box>
          </Box>

          <Box sx={{ flex: 1, display: 'flex' }}>
            {/* Form Properties */}
            <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Form Properties
              </Typography>

              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Form Name"
                    fullWidth
                    margin="normal"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    onChange={(e) => {
                      field.onChange(e);
                      setFormDefinition(prev => ({ ...prev, name: e.target.value }));
                    }}
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={3}
                    onChange={(e) => {
                      field.onChange(e);
                      setFormDefinition(prev => ({ ...prev, description: e.target.value }));
                    }}
                  />
                )}
              />

              <Controller
                name="schema.title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Form Title"
                    fullWidth
                    margin="normal"
                    error={!!errors.schema?.title}
                    helperText={errors.schema?.title?.message}
                    onChange={(e) => {
                      field.onChange(e);
                      setFormDefinition(prev => ({
                        ...prev,
                        schema: { ...prev.schema, title: e.target.value }
                      }));
                    }}
                  />
                )}
              />

              <Controller
                name="schema.layout"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Layout</InputLabel>
                    <Select
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setFormDefinition(prev => ({
                          ...prev,
                          schema: { ...prev.schema, layout: e.target.value as any }
                        }));
                      }}
                    >
                      <MenuItem value="single-column">Single Column</MenuItem>
                      <MenuItem value="two-column">Two Column</MenuItem>
                      <MenuItem value="grid">Grid Layout</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Form Statistics
              </Typography>
              <Chip
                label={`${formDefinition.fields.length} Fields`}
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
              <Chip
                label={`${formDefinition.fields.filter(f => f.required).length} Required`}
                size="small"
                color="primary"
                sx={{ mr: 1, mb: 1 }}
              />
            </Box>

            {/* Canvas Area */}
            <Box
              ref={drop}
              sx={{
                flex: 1,
                p: 2,
                minHeight: 400,
                backgroundColor: 'grey.50'
              }}
            >
              {formDefinition.fields.length === 0 ? (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    borderRadius: 1,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <Box textAlign="center">
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Start Building Your Form
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Drag fields from the left panel or click to add them
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {formDefinition.schema.title || 'Untitled Form'}
                  </Typography>
                  {formDefinition.schema.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {formDefinition.schema.description}
                    </Typography>
                  )}

                  {formDefinition.fields.map((field, index) => (
                    <FormFieldItem
                      key={field.id}
                      field={field}
                      index={index}
                      onEdit={(field) => {
                        setEditingField(field);
                        setFieldDialogOpen(true);
                      }}
                      onDelete={deleteField}
                      onMove={moveField}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Field Edit Dialog */}
      <FieldEditDialog
        field={editingField}
        open={fieldDialogOpen}
        onClose={() => {
          setFieldDialogOpen(false);
          setEditingField(null);
        }}
        onSave={saveField}
      />

      {/* Form Preview Dialog */}
      <FormPreviewDialog
        form={formDefinition}
        open={previewMode}
        onClose={() => setPreviewMode(false)}
      />
    </DndProvider>
  );
};

// Field Edit Dialog Component
const FieldEditDialog: React.FC<{
  field: FormField | null;
  open: boolean;
  onClose: () => void;
  onSave: (field: FormField) => void;
}> = ({ field, open, onClose, onSave }) => {
  const [editedField, setEditedField] = useState<FormField | null>(null);

  useEffect(() => {
    if (field) {
      setEditedField({ ...field });
    }
  }, [field]);

  const handleSave = () => {
    if (editedField) {
      onSave(editedField);
    }
  };

  if (!editedField) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit {editedField.type.charAt(0).toUpperCase() + editedField.type.slice(1)} Field
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Field Name"
              fullWidth
              value={editedField.name}
              onChange={(e) =>
                setEditedField(prev => prev ? { ...prev, name: e.target.value } : null)
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Label"
              fullWidth
              value={editedField.label}
              onChange={(e) =>
                setEditedField(prev => prev ? { ...prev, label: e.target.value } : null)
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Placeholder"
              fullWidth
              value={editedField.placeholder || ''}
              onChange={(e) =>
                setEditedField(prev => prev ? { ...prev, placeholder: e.target.value } : null)
              }
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={editedField.required}
                  onChange={(e) =>
                    setEditedField(prev => prev ? { ...prev, required: e.target.checked } : null)
                  }
                />
              }
              label="Required Field"
            />
          </Grid>

          {(editedField.type === 'select' || editedField.type === 'radio') && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Options
              </Typography>
              {editedField.options?.map((option, index) => (
                <Box key={index} display="flex" gap={1} mb={1}>
                  <TextField
                    size="small"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(editedField.options || [])];
                      newOptions[index] = e.target.value;
                      setEditedField(prev => prev ? { ...prev, options: newOptions } : null);
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newOptions = editedField.options?.filter((_, i) => i !== index);
                      setEditedField(prev => prev ? { ...prev, options: newOptions } : null);
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<Add />}
                onClick={() => {
                  const newOptions = [...(editedField.options || []), `Option ${(editedField.options?.length || 0) + 1}`];
                  setEditedField(prev => prev ? { ...prev, options: newOptions } : null);
                }}
              >
                Add Option
              </Button>
            </Grid>
          )}

          {/* Validation Rules */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Validation Rules
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Min Length"
                  type="number"
                  size="small"
                  value={editedField.validation?.minLength || ''}
                  onChange={(e) =>
                    setEditedField(prev => prev ? {
                      ...prev,
                      validation: {
                        ...prev.validation,
                        minLength: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    } : null)
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Max Length"
                  type="number"
                  size="small"
                  value={editedField.validation?.maxLength || ''}
                  onChange={(e) =>
                    setEditedField(prev => prev ? {
                      ...prev,
                      validation: {
                        ...prev.validation,
                        maxLength: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    } : null)
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Field
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Form Preview Dialog Component
const FormPreviewDialog: React.FC<{
  form: FormDefinition;
  open: boolean;
  onClose: () => void;
}> = ({ form, open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Form Preview</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            {form.schema.title}
          </Typography>
          {form.schema.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {form.schema.description}
            </Typography>
          )}

          <Grid container spacing={2}>
            {form.fields.map((field) => (
              <Grid
                key={field.id}
                item
                xs={form.schema.layout === 'two-column' ? 6 : 12}
              >
                <FormFieldPreview field={field} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close Preview</Button>
      </DialogActions>
    </Dialog>
  );
};

// Form Field Preview Component
const FormFieldPreview: React.FC<{ field: FormField }> = ({ field }) => {
  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            type={field.type}
            required={field.required}
            fullWidth
            disabled
          />
        );

      case 'date':
        return (
          <TextField
            label={field.label}
            type="date"
            required={field.required}
            fullWidth
            disabled
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'textarea':
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            multiline
            rows={3}
            fullWidth
            disabled
          />
        );

      case 'select':
        return (
          <FormControl fullWidth disabled>
            <InputLabel required={field.required}>{field.label}</InputLabel>
            <Select value="">
              {field.options?.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            control={<CheckBox disabled />}
            label={field.label}
            required={field.required}
          />
        );

      case 'file':
        return (
          <Box>
            <Typography variant="body2" gutterBottom>
              {field.label} {field.required && '*'}
            </Typography>
            <Button variant="outlined" component="label" disabled>
              Choose File
              <input type="file" hidden />
            </Button>
          </Box>
        );

      default:
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            fullWidth
            disabled
          />
        );
    }
  };

  return <Box sx={{ mb: 2 }}>{renderField()}</Box>;
};

export default DynamicFormBuilder;
EOF

    log_success "Dynamic Form Builder component generated"
}

# MANDATORY: Generate Form Renderer Component
generate_form_renderer() {
    log_info "Generating Form Renderer component..."
    
    cat > "${PROJECT_ROOT}/packages/frontend/src/components/forms/FormRenderer.tsx" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/components/forms/FormRenderer.tsx
// Generated: $(date)
// Phase: D2H3 - Advanced Forms & Templates Frontend
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React, Material-UI, React-Hook-Form, Zod
// Purpose: Dynamic form renderer for enterprise forms
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormDefinition, FormField } from './DynamicFormBuilder';

interface FormRendererProps {
  form: FormDefinition;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  isLoading?: boolean;
  readOnly?: boolean;
  showSubmitButton?: boolean;
  submitButtonText?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  form,
  initialData = {},
  onSubmit,
  onValidationChange,
  isLoading = false,
  readOnly = false,
  showSubmitButton = true,
  submitButtonText = 'Submit'
}) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build dynamic Zod schema based on form definition
  const buildValidationSchema = useCallback(() => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    form.fields.forEach((field) => {
      let fieldSchema: z.ZodTypeAny;

      switch (field.type) {
        case 'email':
          fieldSchema = z.string().email('Invalid email format');
          break;
        case 'number':
          fieldSchema = z.coerce.number();
          break;
        case 'date':
          fieldSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid date format'
          });
          break;
        default:
          fieldSchema = z.string();
      }

      // Apply field-specific validation
      if (field.validation) {
        if (field.validation.minLength) {
          fieldSchema = (fieldSchema as z.ZodString).min(
            field.validation.minLength,
            `Minimum ${field.validation.minLength} characters required`
          );
        }
        if (field.validation.maxLength) {
          fieldSchema = (fieldSchema as z.ZodString).max(
            field.validation.maxLength,
            `Maximum ${field.validation.maxLength} characters allowed`
          );
        }
        if (field.validation.pattern) {
          fieldSchema = (fieldSchema as z.ZodString).regex(
            new RegExp(field.validation.pattern),
            'Invalid format'
          );
        }
      }

      // Handle required fields
      if (field.required) {
        if (field.type === 'checkbox') {
          fieldSchema = z.boolean().refine((val) => val === true, {
            message: `${field.label} is required`
          });
        } else {
          fieldSchema = fieldSchema.min(1, `${field.label} is required`);
        }
      } else {
        fieldSchema = fieldSchema.optional();
      }

      schemaFields[field.name] = fieldSchema;
    });

    return z.object(schemaFields);
  }, [form.fields]);

  const validationSchema = buildValidationSchema();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: initialData,
    mode: 'onChange'
  });

  // Watch all form values for conditional logic
  const watchedValues = watch();

  // Apply conditional logic
  useEffect(() => {
    if (form.validationRules.conditional) {
      form.validationRules.conditional.forEach((rule) => {
        const fieldValue = watchedValues[rule.field];
        const conditionMet = evaluateCondition(fieldValue, rule.condition, rule.value);

        // Apply the action based on condition
        switch (rule.action) {
          case 'show':
          case 'hide':
            // This would typically control field visibility
            // Implementation depends on your specific requirements
            break;
          case 'require':
            // This would typically update field validation
            break;
          case 'disable':
            // This would typically control field enabled state
            break;
        }
      });
    }
  }, [watchedValues, form.validationRules.conditional]);

  // Update validation state
  useEffect(() => {
    const currentErrors = Object.values(errors).map((error) => error.message || 'Validation error');
    setValidationErrors(currentErrors);
    
    if (onValidationChange) {
      onValidationChange(isValid && currentErrors.length === 0, currentErrors);
    }
  }, [errors, isValid, onValidationChange]);

  // Reset form when initial data changes
  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const evaluateCondition = (fieldValue: any, condition: string, expectedValue: any): boolean => {
    switch (condition) {
      case 'equals':
        return fieldValue === expectedValue;
      case 'not_equals':
        return fieldValue !== expectedValue;
      case 'contains':
        return String(fieldValue).includes(String(expectedValue));
      case 'greater_than':
        return Number(fieldValue) > Number(expectedValue);
      case 'less_than':
        return Number(fieldValue) < Number(expectedValue);
      case 'is_empty':
        return !fieldValue || fieldValue === '';
      case 'is_not_empty':
        return fieldValue && fieldValue !== '';
      default:
        return false;
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const fieldError = errors[field.name];
    const isFieldDisabled = readOnly || isLoading;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <TextField
                {...formField}
                label={field.label}
                placeholder={field.placeholder}
                type={field.type}
                required={field.required}
                disabled={isFieldDisabled}
                fullWidth
                error={!!fieldError}
                helperText={fieldError?.message}
                margin="normal"
              />
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <TextField
                {...formField}
                label={field.label}
                type="date"
                required={field.required}
                disabled={isFieldDisabled}
                fullWidth
                error={!!fieldError}
                helperText={fieldError?.message}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <TextField
                {...formField}
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                disabled={isFieldDisabled}
                multiline
                rows={4}
                fullWidth
                error={!!fieldError}
                helperText={fieldError?.message}
                margin="normal"
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <FormControl
                fullWidth
                margin="normal"
                error={!!fieldError}
                disabled={isFieldDisabled}
              >
                <InputLabel required={field.required}>{field.label}</InputLabel>
                <Select {...formField} value={formField.value || ''}>
                  {field.options?.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {fieldError && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                    {fieldError.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        );

      case 'radio':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <FormControl component="fieldset" margin="normal" error={!!fieldError}>
                <Typography variant="body2" gutterBottom>
                  {field.label} {field.required && '*'}
                </Typography>
                <RadioGroup {...formField} value={formField.value || ''}>
                  {field.options?.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={option}
                      control={<Radio />}
                      label={option}
                      disabled={isFieldDisabled}
                    />
                  ))}
                </RadioGroup>
                {fieldError && (
                  <Typography variant="caption" color="error">
                    {fieldError.message}