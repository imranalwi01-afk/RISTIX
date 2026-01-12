'use client';

import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    BooleanField,
    DateField,
    SearchInput,
    TextInput,
    SelectInput,
    EditButton,
    CreateButton,
    TopToolbar,
    ExportButton,
    FilterButton,
    FunctionField
} from 'react-admin';
import { Chip } from '@mui/material';

// Custom List Actions (Toolbar)
const TenantListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
        <ExportButton />
    </TopToolbar>
);

const tenantFilters = [
    <SearchInput source="q" alwaysOn />,
    <SelectInput source="bankingMode" choices={[
        { id: 'conventional', name: 'Conventional' },
        { id: 'syariah', name: 'Syariah' },
        { id: 'dual', name: 'Dual' },
    ]} />,
];

export const TenantList = () => (
    <List
        actions={<TenantListActions />}
        filters={tenantFilters}
        sort={{ field: 'name', order: 'ASC' }}
        perPage={25}
    >
        <Datagrid rowClick="edit">
            <TextField source="code" label="Code" />
            <TextField source="name" label="Tenant Name" />
            <TextField source="slug" label="Slug (URL)" />
            <FunctionField
                label="Banking Mode"
                render={(record: any) => (
                    <Chip
                        label={record.bankingMode?.toUpperCase()}
                        size="small"
                        color={
                            record.bankingMode === 'syariah' ? 'success' :
                                record.bankingMode === 'dual' ? 'warning' : 'primary'
                        }
                        variant="outlined"
                    />
                )}
            />
            <BooleanField source="isActive" label="Active" />
            <DateField source="createdAt" showTime />
            <EditButton />
        </Datagrid>
    </List>
);

export default TenantList;
