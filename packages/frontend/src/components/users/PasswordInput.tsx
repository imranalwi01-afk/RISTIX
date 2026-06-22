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
import { useQuery } from '@tanstack/react-query';
import { securityConfigAPI } from '@/services/api/security-config.api';
import {
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    AutoAwesome as GenerateIcon,
    ContentCopy as CopyIcon,
    Check as CheckIcon,
} from '@mui/icons-material';

export interface PasswordPolicy {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
    minLength: 8,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSpecialChars: false,
};

const buildPasswordRules = (policy: PasswordPolicy) => [
    { label: `Min ${policy.minLength} characters`, test: (v: string) => v.length >= policy.minLength },
    ...(policy.requireUppercase ? [{ label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) }] : []),
    ...(policy.requireLowercase ? [{ label: 'Lowercase letter', test: (v: string) => /[a-z]/.test(v) }] : []),
    ...(policy.requireNumbers ? [{ label: 'Number', test: (v: string) => /[0-9]/.test(v) }] : []),
    ...(policy.requireSpecialChars ? [{ label: 'Special character', test: (v: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v) }] : []),
];

export function validatePassword(password: string, policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY): { valid: boolean; errors: string[] } {
    const errors = buildPasswordRules(policy).filter(r => !r.test(password)).map(r => r.label);
    return { valid: errors.length === 0, errors };
}

// Function to generate random secure password
const generatePassword = (policy: PasswordPolicy, length = 12): string => {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const special = "!@#$%^&*()_+";
    const targetLength = Math.max(length, policy.minLength);
    
    let password = "";
    if (policy.requireLowercase) password += lower.charAt(Math.floor(Math.random() * lower.length));
    if (policy.requireUppercase) password += upper.charAt(Math.floor(Math.random() * upper.length));
    if (policy.requireNumbers) password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    if (policy.requireSpecialChars) password += special.charAt(Math.floor(Math.random() * special.length));
    
    const charset =
        (policy.requireLowercase ? lower : '') +
        (policy.requireUppercase ? upper : '') +
        (policy.requireNumbers ? numbers : '') +
        (policy.requireSpecialChars ? special : '') ||
        lower + upper + numbers + special;

    for (let i = password.length, n = charset.length; i < targetLength; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    
    return password.split('').sort(() => 0.5 - Math.random()).join('');
};

type PasswordInputProps = Omit<TextFieldProps, 'onChange'> & {
    value: string;
    onChange: (value: string) => void;
    generateLength?: number;
    showValidation?: boolean;
    policy?: PasswordPolicy;
    showGenerate?: boolean;
    showCopy?: boolean;
};

export const PasswordInput: React.FC<PasswordInputProps> = ({
    value,
    onChange,
    generateLength = 12,
    showValidation = false,
    showGenerate = false,
    showCopy = false,
    policy = DEFAULT_PASSWORD_POLICY,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);

    const { data: securityConfig } = useQuery({
        queryKey: ['security-config'],
        queryFn: () => securityConfigAPI.get(),
        staleTime: 5 * 60 * 1000,
    });

    const activePolicy = useMemo(() => {
        if (policy !== DEFAULT_PASSWORD_POLICY) return policy;
        if (securityConfig?.passwordPolicy) {
            return { ...DEFAULT_PASSWORD_POLICY, ...securityConfig.passwordPolicy };
        }
        return DEFAULT_PASSWORD_POLICY;
    }, [policy, securityConfig]);

    const ruleChecks = useMemo(() => {
        if (!showValidation || !value) return null;
        return buildPasswordRules(activePolicy).map(r => ({ ...r, pass: r.test(value) }));
    }, [value, showValidation, activePolicy]);

    const handleToggleVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleGenerate = () => {
        const newPassword = generatePassword(activePolicy, generateLength);
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
                            {showGenerate && (
                                <Tooltip title="Generate secure password">
                                    <IconButton onClick={handleGenerate} edge="end" size="small" color="primary">
                                        <GenerateIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {showCopy && (
                                <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                                    <IconButton onClick={handleCopy} edge="end" size="small" disabled={!value}>
                                        {copied ? <CheckIcon fontSize="small" color="success" /> : <CopyIcon fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                            )}
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
