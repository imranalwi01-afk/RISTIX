'use client';

import React from 'react';
import {
    Create,
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    BooleanInput,
    required,
    minLength,
    maxLength
} from 'react-admin';
import { Box, Typography, Alert } from '@mui/material';

const TenantTitle = () => <span>Tenant Details</span>;

const validateCode = [required(), minLength(2), maxLength(20)];
const validateName = [required(), minLength(2), maxLength(100)];

export const TenantCreate = () => (
    <Create title="Create New Tenant">
        <SimpleForm defaultValues={{ isActive: true, type: 'banking', bankingMode: 'conventional' }}>
            <Box sx={{ mb: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                    Creating a new tenant will establish a separate data isolation environment.
                    The slug will be automatically generated from the code if left blank.
                </Alert>
            </Box>

            <Typography variant="h6" sx={{ mb: 2 }}>Basic Information</Typography>
            <Box display={{ xs: 'block', sm: 'flex', width: '100%' }}>
                <Box flex={1} mr={{ xs: 0, sm: '0.5em' }}>
                    <TextInput source="code" validate={validateCode} fullWidth helperText="Unique identifier code (e.g. BNI, BRI)" />
                </Box>
                <Box flex={1} ml={{ xs: 0, sm: '0.5em' }}>
                    <TextInput source="name" validate={validateName} fullWidth />
                </Box>
            </Box>

            <Box display={{ xs: 'block', sm: 'flex', width: '100%' }}>
                <Box flex={1} mr={{ xs: 0, sm: '0.5em' }}>
                    <TextInput source="slug" fullWidth helperText="URL-friendly identifier (leave empty to auto-generate from code)" />
                </Box>
                <Box flex={1} ml={{ xs: 0, sm: '0.5em' }}>
                    <SelectInput source="bankingMode" choices={[
                        { id: 'conventional', name: 'Conventional Banking' },
                        { id: 'syariah', name: 'Syariah Banking' },
                        { id: 'dual', name: 'Dual (Hybrid)' },
                    ]} fullWidth />
                </Box>
            </Box>

            <TextInput source="description" multiline rows={3} fullWidth />

            <BooleanInput source="isActive" label="Active Status" />
        </SimpleForm>
    </Create>
);

export const TenantEdit = () => (
    <Edit title={<TenantTitle />}>
        <SimpleForm>
            <Box sx={{ mb: 2 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Changing the Tenant Code or Slug may affect existing users' ability to access the system.
                </Alert>
            </Box>

            <Typography variant="h6" sx={{ mb: 2 }}>Configuration</Typography>

            <Box display={{ xs: 'block', sm: 'flex', width: '100%' }}>
                <Box flex={1} mr={{ xs: 0, sm: '0.5em' }}>
                    <TextInput source="code" validate={validateCode} fullWidth disabled />
                </Box>
                <Box flex={1} ml={{ xs: 0, sm: '0.5em' }}>
                    <TextInput source="name" validate={validateName} fullWidth />
                </Box>
            </Box>

            <Box display={{ xs: 'block', sm: 'flex', width: '100%' }}>
                <Box flex={1} mr={{ xs: 0, sm: '0.5em' }}>
                    <TextInput source="slug" fullWidth disabled helperText="Slug cannot be changed after creation" />
                </Box>
                <Box flex={1} ml={{ xs: 0, sm: '0.5em' }}>
                    <SelectInput source="bankingMode" choices={[
                        { id: 'conventional', name: 'Conventional Banking' },
                        { id: 'syariah', name: 'Syariah Banking' },
                        { id: 'dual', name: 'Dual (Hybrid)' },
                    ]} fullWidth />
                </Box>
            </Box>

            <TextInput source="description" multiline rows={3} fullWidth />
            <BooleanInput source="isActive" label="Active Status" />
        </SimpleForm>
    </Edit>
);
