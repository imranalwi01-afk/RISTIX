// packages/frontend/src/components/banking/segmentation/EnhancedDatePicker.tsx
import React, { useState, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Popover,
  Box,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Clear as ClearIcon,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { format, parse, isValid, startOfMonth, endOfMonth, eachDayOfInterval, 
         getDay, addMonths, subMonths, isSameDay, isToday } from 'date-fns';

interface EnhancedDatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  format?: string;
  displayFormat?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  sx?: any;
}

/**
 * Enhanced Date Picker Component with DD-MMM-YYYY format support
 * Provides a better UX than standard HTML5 date input
 */
export const EnhancedDatePicker: React.FC<EnhancedDatePickerProps> = ({
  label,
  value,
  onChange,
  format: dateFormat = 'yyyy-MM-dd', // Storage format (for database)
  displayFormat = 'dd-MMM-yyyy',    // Display format (DD-MMM-YYYY)
  disabled = false,
  required = false,
  error = false,
  helperText = '',
  fullWidth = true,
  sx = {},
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [displayValue, setDisplayValue] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [inputError, setInputError] = useState(false);

  // Month names for display
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const fullMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Parse initial value
  useEffect(() => {
    if (value) {
      try {
        // Try to parse the value from storage format
        const parsedDate = parse(value, dateFormat, new Date());
        if (isValid(parsedDate)) {
          setSelectedDate(parsedDate);
          setDisplayValue(format(parsedDate, displayFormat));
          setCurrentMonth(parsedDate);
          setInputError(false);
        } else {
          // Try parsing from display format (in case it's already formatted)
          const altParsed = parse(value, displayFormat, new Date());
          if (isValid(altParsed)) {
            setSelectedDate(altParsed);
            setDisplayValue(value);
            setCurrentMonth(altParsed);
            setInputError(false);
          } else {
            setDisplayValue(value);
            setInputError(true);
          }
        }
      } catch {
        setDisplayValue(value);
        setInputError(true);
      }
    } else {
      setSelectedDate(null);
      setDisplayValue('');
      setInputError(false);
    }
  }, [value, dateFormat, displayFormat]);

  // Handle manual input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setDisplayValue(inputValue);

    if (!inputValue) {
      setSelectedDate(null);
      onChange('');
      setInputError(false);
      return;
    }

    // Try to parse the manual input (support various formats)
    const formats = [displayFormat, 'dd-MMM-yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy'];
    let parsedDate: Date | null = null;

    for (const fmt of formats) {
      try {
        const parsed = parse(inputValue, fmt, new Date());
        if (isValid(parsed)) {
          parsedDate = parsed;
          break;
        }
      } catch {
        // Continue trying other formats
      }
    }

    if (parsedDate) {
      setSelectedDate(parsedDate);
      setCurrentMonth(parsedDate);
      onChange(format(parsedDate, dateFormat));
      setInputError(false);
    } else {
      setInputError(true);
    }
  };

  // Handle calendar selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setDisplayValue(format(date, displayFormat));
    onChange(format(date, dateFormat));
    setAnchorEl(null);
    setInputError(false);
  };

  // Handle clear
  const handleClear = () => {
    setSelectedDate(null);
    setDisplayValue('');
    onChange('');
    setInputError(false);
  };

  // Calendar navigation
  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    const today = new Date();
    handleDateSelect(today);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // Add empty cells for alignment
    const startDay = getDay(start);
    const emptyCells = Array(startDay).fill(null);

    return [...emptyCells, ...days];
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <FormControl fullWidth={fullWidth} sx={sx} error={error || inputError}>
        <TextField
          label={label}
          value={displayValue}
          onChange={handleInputChange}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          placeholder={displayFormat.toUpperCase()}
          fullWidth={fullWidth}
          required={required}
          error={error || inputError}
          helperText={inputError ? 'Invalid date format' : helperText}
          disabled={disabled}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {displayValue && !disabled && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setAnchorEl(anchorEl ? null : e.currentTarget);
                  }}
                  edge="end"
                  disabled={disabled}
                >
                  <CalendarIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </FormControl>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 320 }}>
          {/* Calendar Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <IconButton onClick={handlePreviousMonth} size="small">
              <ChevronLeft />
            </IconButton>
            <Typography variant="subtitle1" fontWeight="bold">
              {fullMonthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Typography>
            <IconButton onClick={handleNextMonth} size="small">
              <ChevronRight />
            </IconButton>
          </Box>

          {/* Day Headers */}
          <Grid container spacing={0.5} sx={{ mb: 1 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Grid item xs={12/7} key={day}>
                <Typography variant="caption" align="center" display="block" fontWeight="bold">
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Calendar Days */}
          <Grid container spacing={0.5}>
            {generateCalendarDays().map((day, index) => (
              <Grid item xs={12/7} key={index}>
                {day ? (
                  <Button
                    variant={selectedDate && isSameDay(day, selectedDate) ? 'contained' : 'text'}
                    color={isToday(day) ? 'primary' : 'inherit'}
                    onClick={() => handleDateSelect(day)}
                    size="small"
                    sx={{
                      minWidth: 36,
                      height: 36,
                      p: 0,
                      fontWeight: isToday(day) ? 'bold' : 'normal',
                      ...(isToday(day) && !selectedDate && {
                        border: '1px solid',
                        borderColor: 'primary.main',
                      }),
                    }}
                  >
                    {day.getDate()}
                  </Button>
                ) : (
                  <Box sx={{ width: 36, height: 36 }} />
                )}
              </Grid>
            ))}
          </Grid>

          {/* Footer Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button onClick={handleToday} size="small">
              Today
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={() => setAnchorEl(null)} size="small">
                Cancel
              </Button>
              {selectedDate && (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
                  {format(selectedDate, displayFormat)}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default EnhancedDatePicker;