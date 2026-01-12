import React from 'react';
import {
    Create,
    SimpleForm,
    TextInput,
    DateInput,
    SelectInput,
    required,
    email,
    Edit,
    BooleanInput
} from 'react-admin';
import { Box } from '@mui/material';

export const ConsultantCreate = () => (
    <Create>
        <SimpleForm>
            <Box display="flex" gap={2} width="100%">
                <TextInput source="fullName" validate={[required()]} fullWidth />
                <TextInput source="email" validate={[required(), email()]} fullWidth />
            </Box>
            <TextInput source="firmName" fullWidth />
            <TextInput source="specialization" fullWidth />
            <Box display="flex" gap={2} width="100%">
                <DateInput source="startDate" />
                <DateInput source="endDate" />
            </Box>
            <SelectInput source="status" choices={[
                { id: 'active', name: 'Active' },
                { id: 'inactive', name: 'Inactive' },
                { id: 'on_hold', name: 'On Hold' },
            ]} defaultValue="active" />
            <TextInput source="notes" multiline rows={3} fullWidth />
        </SimpleForm>
    </Create>
);

export const ConsultantEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <Box display="flex" gap={2} width="100%">
                <TextInput source="fullName" validate={[required()]} fullWidth />
                <TextInput source="email" validate={[required(), email()]} fullWidth />
            </Box>
            <TextInput source="firmName" fullWidth />
            <TextInput source="specialization" fullWidth />
            <Box display="flex" gap={2} width="100%">
                <DateInput source="startDate" />
                <DateInput source="endDate" />
            </Box>
            <SelectInput source="status" choices={[
                { id: 'active', name: 'Active' },
                { id: 'inactive', name: 'Inactive' },
                { id: 'on_hold', name: 'On Hold' },
            ]} />
            <BooleanInput source="isActive" label="Is Active System User?" />
            <TextInput source="notes" multiline rows={3} fullWidth />
        </SimpleForm>
    </Edit>
);
