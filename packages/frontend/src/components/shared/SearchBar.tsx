'use client';

import React, { useState, useDeferredValue, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  label?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  debounceMs?: number;
}

export function SearchBar({
  value: externalValue,
  onChange: onExternalChange,
  onSearch,
  placeholder = 'Search...',
  label = 'Search',
  fullWidth = true,
  size = 'small',
  debounceMs = 300,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(externalValue || '');
  const deferredValue = useDeferredValue(internalValue);

  const isControlled = externalValue !== undefined;
  const currentValue = isControlled ? externalValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    if (!isControlled) setInternalValue(next);
    onExternalChange?.(next);
  };

  useEffect(() => {
    if (!isControlled && deferredValue !== undefined) {
      onSearch?.(deferredValue);
    }
  }, [deferredValue, isControlled, onSearch]);

  return (
    <Box sx={{ minWidth: 0, flex: { xs: '1 1 100%', sm: '1 1 280px' }, maxWidth: { sm: 400 } }}>
      <TextField
        label={label}
        placeholder={placeholder}
        size={size}
        value={currentValue}
        onChange={handleChange}
        fullWidth={fullWidth}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
