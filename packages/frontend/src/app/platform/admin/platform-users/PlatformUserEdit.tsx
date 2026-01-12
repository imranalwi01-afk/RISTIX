import React from 'react';
import {
    Create,
    SimpleForm,
    TextInput,
    required,
    email,
    Edit,
    PasswordInput,
    BooleanInput
} from 'react-admin';
import { Box } from '@mui/material';

export const PlatformUserCreate = () => (
    <Create>
        <SimpleForm>
            <Box display="flex" gap={2} width="100%">
                <TextInput source="firstName" validate={[required()]} fullWidth />
                <TextInput source="lastName" fullWidth />
            </Box>
            <TextInput source="email" validate={[required(), email()]} fullWidth />
            <TextInput source="phone" fullWidth />
            <PasswordInput source="password" validate={[required()]} fullWidth />
        </SimpleForm>
    </Create>
);

export const PlatformUserEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <Box display="flex" gap={2} width="100%">
                <TextInput source="firstName" validate={[required()]} fullWidth />
                <TextInput source="lastName" fullWidth />
            </Box>
            <TextInput source="email" disabled fullWidth />
            <TextInput source="phone" fullWidth />
            <BooleanInput source="isActive" />
        </SimpleForm>
    </Edit>
);
