'use client';

import React, { useState } from 'react';
import {
    TextField,
    IconButton,
    InputAdornment,
    Tooltip,
    TextFieldProps,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    AutoAwesome as GenerateIcon,
    ContentCopy as CopyIcon,
    Check as CheckIcon,
} from '@mui/icons-material';

// Function to generate random secure password
const generatePassword = (length = 12): string => {
    // Ensuring at least one lowercase, one uppercase, one number, and one special char
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
    
    // Shuffle the result
    return password.split('').sort(() => 0.5 - Math.random()).join('');
};

type PasswordInputProps = Omit<TextFieldProps, 'onChange'> & {
    value: string;
    onChange: (value: string) => void;
    generateLength?: number;
};

export const PasswordInput: React.FC<PasswordInputProps> = ({
    value,
    onChange,
    generateLength = 12,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleToggleVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleGenerate = () => {
        const newPassword = generatePassword(generateLength);
        onChange(newPassword);
        // Automatically show the password if they generated it so they can see it
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
    );
};
