// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/components/common/forms/DynamicFormRenderer.tsx
// Generated: $(date)
// Phase: D2H3-P05 - React Form Components
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React, Material-UI, react-hook-form, Zod
// Purpose: Dynamic form renderer for banking form components
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Alert,
  CircularProgress,
  LinearProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  FormHelperText
} from '@mui/material';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export interface FormField {
  id: string;
  name: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  validation?: Record<string, any>;
  options?: Array<{ label: string; value: string }>;
  conditional_logic?: Record<string, any>;
  banking_specific?: Record<string, any>;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  conditional?: boolean;
}

export interface FormConfiguration {
  id: string;
  form_name: string;
  form_type: string;
  banking_type: 'conventional' | 'dual';
  form_schema: {
    title: string;
    description?: string;
    fields: FormField[];
    sections?: FormSection[];
  };
  validation_rules: Record<string, any>;
  ui_configuration: {
    theme: string;
    layout: string;
    show_progress: boolean;
    allow_save_draft: boolean;
    submit_button_text: string;
    cancel_button_text: string;
    branding?: Record<string, any>;
  };
  conditional_logic?: Record<string, any>;
  business_rules?: Record<string, any>;
}

export interface DynamicFormRendererProps {
  formConfiguration: FormConfiguration;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>, isDraft: boolean) => Promise<void>;
  onCancel?: () => void;
  readOnly?: boolean;
  showValidation?: boolean;
  className?: string;
}

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  formConfiguration,
  initialData = {},
  onSubmit,
  onCancel,
  readOnly = false,
  showValidation = true,
  className
}) => {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());

  // Create dynamic validation schema
  const validationSchema = React.useMemo(() => {
    const schemaFields: Record<string, any> = {};

    formConfiguration.form_schema.fields.forEach((field) => {
      let fieldSchema: z.ZodTypeAny = z.any();

      if (field.required && visibleFields.has(field.name)) {
        switch (field.type) {
          case 'email':
            fieldSchema = z.string().email('Invalid email format');
            break;
          case 'number':
            fieldSchema = z.number({ invalid_type_error: 'Must be a number' });
            break;
          case 'currency':
            fieldSchema = z.number().min(0, 'Must be positive');
            break;
          case 'text':
          case 'textarea':
            fieldSchema = z.string().min(1, 'This field is required');
            break;
          case 'select':
            fieldSchema = z.string().min(1, 'Please select an option');
            break;
          case 'checkbox':
            if (field.required) {
              fieldSchema = z.boolean().refine(val => val === true, 'This field is required');
            }
            break;
          default:
            if (field.required) {
              fieldSchema = z.string().min(1, 'This field is required');
            }
        }
      }

      // Apply additional validation rules
      if (field.validation) {
        if (field.validation.min && fieldSchema instanceof z.ZodNumber) {
          fieldSchema = fieldSchema.min(field.validation.min);
        }
        if (field.validation.max && fieldSchema instanceof z.ZodNumber) {
          fieldSchema = fieldSchema.max(field.validation.max);
        }
        if (field.validation.minLength && fieldSchema instanceof z.ZodString) {
          fieldSchema = fieldSchema.min(field.validation.minLength);
        }
        if (field.validation.maxLength && fieldSchema instanceof z.ZodString) {
          fieldSchema = fieldSchema.max(field.validation.maxLength);
        }
      }

      schemaFields[field.name] = fieldSchema;
    });

    return z.object(schemaFields);
  }, [formConfiguration.form_schema.fields, visibleFields]);

  // Initialize form
  const methods = useForm({
    resolver: zodResolver(validationSchema as any),
    defaultValues: initialData,
    mode: 'onChange'
  });

  const { handleSubmit, watch, setValue, control, formState: { errors, isValid, isDirty } } = methods;

  // Watch form values for conditional logic
  const watchedValues = watch();

  // Initialize visible fields
  useEffect(() => {
    const initialVisible = new Set(
      formConfiguration.form_schema.fields.map(field => field.name)
    );
    setVisibleFields(initialVisible);
  }, [formConfiguration]);

  // Handle conditional logic
  useEffect(() => {
    const newVisibleFields = new Set<string>();

    formConfiguration.form_schema.fields.forEach((field) => {
      let shouldShow = true;

      // Check conditional logic
      if (field.conditional_logic?.show_if) {
        shouldShow = field.conditional_logic.show_if.every((condition: any) => {
          const fieldValue = watchedValues[condition.field];
          switch (condition.operator) {
            case 'equals':
              return fieldValue === condition.value;
            case 'not_equals':
              return fieldValue !== condition.value;
            case 'contains':
              return String(fieldValue).includes(condition.value);
            case 'greater_than':
              return Number(fieldValue) > condition.value;
            case 'less_than':
              return Number(fieldValue) < condition.value;
            default:
              return true;
          }
        });
      }

      // Check banking type specific logic
      if (field.banking_specific?.banking_type) {
        const bankingTypes = Array.isArray(field.banking_specific.banking_type)
          ? field.banking_specific.banking_type
          : [field.banking_specific.banking_type];

        if (!bankingTypes.includes(formConfiguration.banking_type) &&
          !bankingTypes.includes('dual')) {
          shouldShow = false;
        }
      }

      if (shouldShow) {
        newVisibleFields.add(field.name);
      }
    });

    setVisibleFields(newVisibleFields);
  }, [watchedValues, formConfiguration.banking_type]);

  // Render form field
  const renderField = useCallback((field: FormField) => {
    if (!visibleFields.has(field.name)) {
      return null;
    }

    const error = errors[field.name];
    const errorMessage = error?.message as string;

    switch (field.type) {
      case 'text':
      case 'textarea':
        return (
          <Controller
            key={field.id}
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <TextField
                {...controllerField}
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                disabled={readOnly}
                fullWidth
                multiline={field.type === 'textarea'}
                rows={field.type === 'textarea' ? 4 : 1}
                error={!!error}
                helperText={errorMessage}
                variant="outlined"
              />
            )}
          />
        );

      case 'email':
        return (
          <Controller
            key={field.id}
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <TextField
                {...controllerField}
                type="email"
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                disabled={readOnly}
                fullWidth
                error={!!error}
                helperText={errorMessage}
                variant="outlined"
              />
            )}
          />
        );

      case 'number':
        return (
          <Controller
            key={field.id}
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <TextField
                {...controllerField}
                type="number"
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                disabled={readOnly}
                fullWidth
                error={!!error}
                helperText={errorMessage}
                variant="outlined"
                onChange={(e) => controllerField.onChange(Number(e.target.value))}
              />
            )}
          />
        );

      case 'currency':
        return (
          <Controller
            key={field.id}
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <TextField
                {...controllerField}
                type="number"
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                disabled={readOnly}
                fullWidth
                error={!!error}
                helperText={errorMessage}
                variant="outlined"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>IDR</Typography>
                }}
                onChange={(e) => controllerField.onChange(Number(e.target.value))}
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            key={field.id}
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <FormControl fullWidth error={!!error} variant="outlined">
                <InputLabel required={field.required}>{field.label}</InputLabel>
                <Select
                  {...controllerField}
                  label={field.label}
                  disabled={readOnly}
                >
                  {field.options?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
              </FormControl>
            )}
          />
        );

      case 'multiselect':
        return (
          <Controller
            key={field.id}
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <FormControl fullWidth error={!!error} variant="outlined">
                <InputLabel required={field.required}>{field.label}</InputLabel>
                <Select
                  {...controllerField}
                  label={field.label}
                  disabled={readOnly}
                  multiple
                  value={controllerField.value || []}
                >
                  {field.options?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
              </FormControl>
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            key={field.id}
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <FormControl error={!!error}>
                <FormControlLabel
                  control={
                    <Checkbox
                      {...controllerField}
                      checked={controllerField.value || false}
                      disabled={readOnly}
                    />
                  }
                  label={field.label}
                  required={field.required}
                />
                {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
              </FormControl>
            )}
          />
        );

      case 'date':
        return (
          <Controller
            key={field.id}
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  {...controllerField}
                  label={field.label}
                  disabled={readOnly}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: field.required,
                      error: !!error,
                      helperText: errorMessage,
                      variant: 'outlined'
                    }
                  }}
                />
              </LocalizationProvider>
            )}
          />
        );

      case 'file':
        return (
          <Controller
            key={field.id}
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <Box>
                <TextField
                  type="file"
                  label={field.label}
                  required={field.required}
                  disabled={readOnly}
                  fullWidth
                  error={!!error}
                  helperText={errorMessage}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    accept: field.validation?.file_types?.map((type: string) => `.${type}`).join(','),
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      controllerField.onChange(file);
                    }
                  }}
                />
                {field.validation?.max_size && (
                  <Typography variant="caption" color="text.secondary">
                    Max file size: {Math.round(field.validation.max_size / 1024 / 1024)}MB
                  </Typography>
                )}
              </Box>
            )}
          />
        );

      default:
        return (
          <Controller
            key={field.id}
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <TextField
                {...controllerField}
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                disabled={readOnly}
                fullWidth
                error={!!error}
                helperText={errorMessage}
                variant="outlined"
              />
            )}
          />
        );
    }
  }, [visibleFields, readOnly, control, errors]);

  // Handle form submission
  const handleFormSubmit = useCallback(async (data: Record<string, any>, isDraft = false) => {
    try {
      if (isDraft) {
        setIsDraftSaving(true);
      } else {
        setIsSubmitting(true);
      }

      await onSubmit(data, isDraft);
      setValidationErrors([]);

    } catch (error: any) {
      setValidationErrors([error.message || 'Submission failed']);
    } finally {
      setIsSubmitting(false);
      setIsDraftSaving(false);
    }
  }, [onSubmit]);

  // Save as draft
  const handleSaveDraft = useCallback(() => {
    handleFormSubmit(watchedValues, true);
  }, [handleFormSubmit, watchedValues]);

  // Render sections or fields
  const renderFormContent = () => {
    if (formConfiguration.form_schema.sections) {
      // Render with sections
      return formConfiguration.form_schema.sections.map((section, index) => (
        <Card key={section.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {section.title}
            </Typography>
            {section.description && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {section.description}
              </Typography>
            )}
            <Grid container spacing={2}>
              {section.fields.map((fieldName) => {
                const field = formConfiguration.form_schema.fields.find(f => f.name === fieldName);
                return field ? (
                  <Grid size={{ xs: 12, sm: 6 }} key={fieldName}>
                    {renderField(field)}
                  </Grid>
                ) : null;
              })}
            </Grid>
          </CardContent>
        </Card>
      ));
    } else {
      // Render without sections
      return (
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              {formConfiguration.form_schema.fields.map((field) => (
                <Grid size={{ xs: 12, sm: 6 }} key={field.id}>
                  {renderField(field)}
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      );
    }
  };

  // Apply theme customizations
  const getThemeStyles = () => {
    const baseStyles: any = {};

    if (formConfiguration.ui_configuration.branding) {
      const { primary_color, secondary_color } = formConfiguration.ui_configuration.branding;
      if (primary_color) {
        baseStyles.primaryColor = primary_color;
      }
      if (secondary_color) {
        baseStyles.secondaryColor = secondary_color;
      }
    }

    return baseStyles;
  };

  return (
    <FormProvider {...methods}>
      <Box className={className} sx={{ ...getThemeStyles() }}>
        {/* Form Header */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {formConfiguration.form_schema.title}
            </Typography>
            {formConfiguration.form_schema.description && (
              <Typography variant="body2" color="text.secondary">
                {formConfiguration.form_schema.description}
              </Typography>
            )}

            {/* Progress indicator */}
            {formConfiguration.ui_configuration.show_progress && formConfiguration.form_schema.sections && (
              <Box sx={{ mt: 2 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {formConfiguration.form_schema.sections.map((section) => (
                    <Step key={section.id}>
                      <StepLabel>{section.title}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Validation Errors */}
        {showValidation && validationErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Please fix the following errors:
            </Typography>
            {validationErrors.map((error, index) => (
              <Typography key={index} variant="body2">
                • {error}
              </Typography>
            ))}
          </Alert>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit((data) => handleFormSubmit(data, false))}>
          {renderFormContent()}

          {/* Form Actions */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {onCancel && (
                  <Button
                    variant="outlined"
                    onClick={onCancel}
                    disabled={isSubmitting || isDraftSaving}
                  >
                    {formConfiguration.ui_configuration.cancel_button_text}
                  </Button>
                )}

                {formConfiguration.ui_configuration.allow_save_draft && !readOnly && (
                  <Button
                    variant="outlined"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting || isDraftSaving || !isDirty}
                    startIcon={isDraftSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                  >
                    {isDraftSaving ? 'Saving...' : 'Save Draft'}
                  </Button>
                )}

                {!readOnly && (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || isDraftSaving}
                    startIcon={isSubmitting ? <CircularProgress size={16} /> : <SendIcon />}
                    sx={{
                      backgroundColor: getThemeStyles().primaryColor,
                      '&:hover': {
                        backgroundColor: getThemeStyles().primaryColor,
                        opacity: 0.8
                      }
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : formConfiguration.ui_configuration.submit_button_text}
                  </Button>
                )}
              </Box>

              {/* Loading indicator */}
              {(isSubmitting || isDraftSaving) && (
                <LinearProgress sx={{ mt: 1 }} />
              )}
            </CardContent>
          </Card>
        </form>

        {/* Banking Type Indicator */}
        {formConfiguration.banking_type !== 'dual' && (
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              🏛️ Conventional Banking
            </Typography>
          </Box>
        )}
      </Box>
    </FormProvider>
  );
};

export default DynamicFormRenderer;
