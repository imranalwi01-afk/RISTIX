'use client';

import React, { useState, useMemo } from 'react';
import {
    TextField,
    IconButton,
    InputAdornment,
    Tooltip,
    TextFieldProps,
    Box,
    Chip,
    Stack,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    AutoAwesome as GenerateIcon,
    ContentCopy as CopyIcon,
    Check as CheckIcon,
} from '@mui/icons-material';

const PASSWORD_RULES = [
    { label: 'Min 8 characters', test: (v: string) => v.length >= 8 },
    { label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
    { label: 'Lowercase letter', test: (v: string) => /[a-z]/.test(v) },
    { label: 'Number', test: (v: string) => /[0-9]/.test(v) },
    { label: 'Special character', test: (v: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v) },
];

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors = PASSWORD_RULES.filter(r => !r.test(password)).map(r => r.label);
    return { valid: errors.length === 0, errors };
}

// Function to generate random secure password
const generatePassword = (length = 12): string => {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const special = "!@#$%^&*()_+";
    
    let password = "";
    password += lower.charAt(Math.floor(Math.random() * lower.length));
    password += upper.charAt(Math.floor(Math.random() * upper.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += special.charAt(Math.floor(Math.random() * special.length));
    
    const charset = lower + upper + numbers + special;
    for (let i = 4, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    
    return password.split('').sort(() => 0.5 - Math.random()).join('');
};

type PasswordInputProps = Omit<TextFieldProps, 'onChange'> & {
    value: string;
    onChange: (value: string) => void;
    generateLength?: number;
    showValidation?: boolean;
};

export const PasswordInput: React.FC<PasswordInputProps> = ({
    value,
    onChange,
    generateLength = 12,
    showValidation,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);

    const ruleChecks = useMemo(() => {
        if (!showValidation || !value) return null;
        return PASSWORD_RULES.map(r => ({ ...r, pass: r.test(value) }));
    }, [value, showValidation]);

    const handleToggleVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleGenerate = () => {
        const newPassword = generatePassword(generateLength);
        onChange(newPassword);
        setShowPassword(true);
    };

    const handleCopy = async () => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <Box>
            <TextField
                {...props}
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                InputProps={{
                    ...props.InputProps,
                    endAdornment: (
                        <InputAdornment position="end" sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Generate secure password">
                                <IconButton onClick={handleGenerate} edge="end" size="small" color="primary">
                                    <GenerateIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                                <IconButton onClick={handleCopy} edge="end" size="small" disabled={!value}>
                                    {copied ? <CheckIcon fontSize="small" color="success" /> : <CopyIcon fontSize="small" />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={showPassword ? "Hide password" : "Show password"}>
                                <IconButton onClick={handleToggleVisibility} edge="end" size="small">
                                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                </IconButton>
                            </Tooltip>
                        </InputAdornment>
                    ),
                }}
            />
            {ruleChecks && (
                <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                    {ruleChecks.map((rule) => (
                        <Chip
                            key={rule.label}
                            label={rule.label}
                            size="small"
                            color={rule.pass ? 'success' : 'default'}
                            variant={rule.pass ? 'filled' : 'outlined'}
                            sx={{ height: 22, fontSize: 11 }}
                        />
                    ))}
                </Stack>
            )}
        </Box>
    );
};
