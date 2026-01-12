import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    EmailField,
    DateField,
    EditButton,
    ChipField,
    TextInput,
    SelectInput
} from 'react-admin';

const consultantFilters = [
    <TextInput source="q" label="Search" alwaysOn />,
    <SelectInput source="status" choices={[
        { id: 'active', name: 'Active' },
        { id: 'inactive', name: 'Inactive' },
        { id: 'on_hold', name: 'On Hold' },
    ]} />,
];

export const ConsultantList = () => (
    <List filters={consultantFilters} sort={{ field: 'createdAt', order: 'DESC' }}>
        <Datagrid rowClick="edit">
            <TextField source="fullName" label="Name" />
            <EmailField source="email" />
            <TextField source="firmName" label="Firm" />
            <TextField source="specialization" />
            <DateField source="startDate" />
            <DateField source="endDate" />
            <ChipField source="status" />
            <EditButton />
        </Datagrid>
    </List>
);
