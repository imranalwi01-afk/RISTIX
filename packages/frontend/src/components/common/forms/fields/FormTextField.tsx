// ============================================================================
// File Path: packages/frontend/src/components/common/forms/fields/FormTextField.tsx
// Generated: $(date)
// Phase: D2H3-P05 - React Form Components
// Purpose: Reusable text field component for forms
// ============================================================================

import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

interface FormTextFieldProps extends Omit<TextFieldProps, 'name'> {
  name: string;
}

export const FormTextField: React.FC<FormTextFieldProps> = ({ name, ...props }) => {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          {...props}
          error={!!error}
          helperText={error?.message as string}
          variant="outlined"
        />
      )}
    />
  );
};

export default FormTextField;
