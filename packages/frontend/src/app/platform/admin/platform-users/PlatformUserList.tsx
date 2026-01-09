import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    EmailField,
    DateField,
    EditButton,
    ChipField,
    TextInput
} from 'react-admin';

const userFilters = [
    <TextInput source="q" label="Search" alwaysOn />,
];

export const PlatformUserList = () => (
    <List filters={userFilters} sort={{ field: 'createdAt', order: 'DESC' }}>
        <Datagrid rowClick="edit">
            <TextField source="firstName" label="First Name" />
            <TextField source="lastName" label="Last Name" />
            <EmailField source="email" />
            <TextField source="phone" />
            <ChipField source="isActive" />
            <DateField source="lastLoginAt" showTime />
            <DateField source="createdAt" />
            <EditButton />
        </Datagrid>
    </List>
);
