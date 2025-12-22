// packages/frontend/src/admin/resources/PortfolioAccountResource.tsx
import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  BooleanField,
  Show,
  SimpleShowLayout,
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  DateInput,
  BooleanInput,
  SelectInput,
  ReferenceInput,
  Create,
  Filter,
  SearchInput,
  ChipField,
  FunctionField
} from 'react-admin';
import { Chip } from '@mui/material';

const PortfolioAccountFilter = (props: any) => (
  <Filter {...props}>
    <SearchInput source="q" placeholder="Search accounts..." alwaysOn />
    <SelectInput
      source="currentStage"
      choices={[
        { id: 1, name: 'Stage 1' },
        { id: 2, name: 'Stage 2' },
        { id: 3, name: 'Stage 3' },
      ]}
      emptyText="All Stages"
    />
    <SelectInput
      source="customerType"
      choices={[
        { id: 'Individual', name: 'Individual' },
        { id: 'Corporate', name: 'Corporate' },
        { id: 'SME', name: 'SME' },
      ]}
      emptyText="All Customer Types"
    />
    <BooleanInput source="isSyariahCompliant" label="Syariah Compliant Only" />
  </Filter>
);

const StageChip = ({ record }: any) => {
  const getStageColor = (stage: number) => {
    switch (stage) {
      case 1: return 'success';
      case 2: return 'warning';
      case 3: return 'error';
      default: return 'default';
    }
  };

  return (
    <Chip 
      label={`Stage ${record.currentStage}`}
      color={getStageColor(record.currentStage)}
      size="small"
    />
  );
};

export const PortfolioAccountList = (props: any) => (
  <List {...props} filters={<PortfolioAccountFilter />} perPage={25}>
    <Datagrid rowClick="show">
      <TextField source="accountId" label="Account ID" />
      <TextField source="customerName" label="Customer" />
      <TextField source="productType" label="Product" />
      <NumberField 
        source="outstandingAmount" 
        label="Outstanding" 
        options={{ style: 'currency', currency: 'USD' }}
      />
      <FunctionField
        label="Stage"
        render={(record: any) => <StageChip record={record} />}
      />
      <NumberField source="pd12m" label="PD 12M" options={{ style: 'percent', minimumFractionDigits: 2 }} />
      <NumberField source="lgd" label="LGD" options={{ style: 'percent', minimumFractionDigits: 2 }} />
      <NumberField 
        source="ecl12m" 
        label="ECL 12M" 
        options={{ style: 'currency', currency: 'USD' }}
      />
      <BooleanField source="isSyariahCompliant" label="Syariah" />
      <DateField source="reportingDate" label="Reporting Date" />
    </Datagrid>
  </List>
);

export const PortfolioAccountShow = (props: any) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="accountId" label="Account ID" />
      <TextField source="customerId" label="Customer ID" />
      <TextField source="customerName" label="Customer Name" />
      <TextField source="productType" label="Product Type" />
      <NumberField 
        source="outstandingAmount" 
        label="Outstanding Amount" 
        options={{ style: 'currency', currency: 'USD' }}
      />
      <NumberField 
        source="committedAmount" 
        label="Committed Amount" 
        options={{ style: 'currency', currency: 'USD' }}
      />
      <TextField source="currencyCode" label="Currency" />
      <DateField source="originationDate" label="Origination Date" />
      <DateField source="maturityDate" label="Maturity Date" />
      <DateField source="reportingDate" label="Reporting Date" />
      
      <FunctionField
        label="IFRS 9 Stage"
        render={(record: any) => <StageChip record={record} />}
      />
      
      <TextField source="customerType" label="Customer Type" />
      <TextField source="industrySector" label="Industry Sector" />
      <TextField source="internalRating" label="Internal Rating" />
      <TextField source="externalRating" label="External Rating" />
      
      <NumberField source="pd12m" label="PD 12M" options={{ style: 'percent', minimumFractionDigits: 4 }} />
      <NumberField source="pdLifetime" label="PD Lifetime" options={{ style: 'percent', minimumFractionDigits: 4 }} />
      <NumberField source="lgd" label="LGD" options={{ style: 'percent', minimumFractionDigits: 2 }} />
      <NumberField 
        source="ead" 
        label="EAD" 
        options={{ style: 'currency', currency: 'USD' }}
      />
      <NumberField 
        source="ecl12m" 
        label="ECL 12M" 
        options={{ style: 'currency', currency: 'USD' }}
      />
      <NumberField 
        source="eclLifetime" 
        label="ECL Lifetime" 
        options={{ style: 'currency', currency: 'USD' }}
      />
      
      <BooleanField source="isSyariahCompliant" label="Syariah Compliant" />
      <TextField source="syariahContractType" label="Syariah Contract Type" />
      <TextField source="syariahStructure" label="Syariah Structure" />
      <NumberField source="profitSharingRatio" label="Profit Sharing Ratio" options={{ style: 'percent' }} />
      
      <TextField source="accountStatus" label="Account Status" />
      <BooleanField source="isActive" label="Active" />
      <DateField source="createdAt" label="Created At" showTime />
      <DateField source="updatedAt" label="Updated At" showTime />
    </SimpleShowLayout>
  </Show>
);

export const PortfolioAccountEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="accountId" label="Account ID" disabled />
      <TextInput source="customerId" label="Customer ID" />
      <TextInput source="customerName" label="Customer Name" />
      <TextInput source="productType" label="Product Type" />
      
      <NumberInput source="outstandingAmount" label="Outstanding Amount" />
      <NumberInput source="committedAmount" label="Committed Amount" />
      <TextInput source="currencyCode" label="Currency Code" />
      
      <DateInput source="originationDate" label="Origination Date" />
      <DateInput source="maturityDate" label="Maturity Date" />
      <DateInput source="reportingDate" label="Reporting Date" />
      
      <SelectInput
        source="currentStage"
        label="Current Stage"
        choices={[
          { id: 1, name: 'Stage 1 - Normal' },
          { id: 2, name: 'Stage 2 - Watch' },
          { id: 3, name: 'Stage 3 - Impaired' },
        ]}
      />
      
      <TextInput source="customerType" label="Customer Type" />
      <TextInput source="industrySector" label="Industry Sector" />
      <TextInput source="internalRating" label="Internal Rating" />
      <TextInput source="externalRating" label="External Rating" />
      
      <NumberInput source="pd12m" label="PD 12M" step={0.0001} />
      <NumberInput source="pdLifetime" label="PD Lifetime" step={0.0001} />
      <NumberInput source="lgd" label="LGD" step={0.01} />
      <NumberInput source="ead" label="EAD" />
      
      <BooleanInput source="isSyariahCompliant" label="Syariah Compliant" />
      <TextInput source="syariahContractType" label="Syariah Contract Type" />
      <TextInput source="syariahStructure" label="Syariah Structure" />
      <NumberInput source="profitSharingRatio" label="Profit Sharing Ratio" step={0.01} />
      
      <SelectInput
        source="accountStatus"
        label="Account Status"
        choices={[
          { id: 'active', name: 'Active' },
          { id: 'closed', name: 'Closed' },
          { id: 'suspended', name: 'Suspended' },
          { id: 'default', name: 'Default' },
        ]}
      />
      <BooleanInput source="isActive" label="Active" />
    </SimpleForm>
  </Edit>
);

export const PortfolioAccountCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="accountId" label="Account ID" required />
      <TextInput source="customerId" label="Customer ID" required />
      <TextInput source="customerName" label="Customer Name" required />
      <TextInput source="productType" label="Product Type" required />
      
      <NumberInput source="outstandingAmount" label="Outstanding Amount" required />
      <NumberInput source="committedAmount" label="Committed Amount" />
      <TextInput source="currencyCode" label="Currency Code" defaultValue="USD" />
      
      <DateInput source="originationDate" label="Origination Date" required />
      <DateInput source="maturityDate" label="Maturity Date" required />
      <DateInput source="reportingDate" label="Reporting Date" defaultValue={new Date()} />
      
      <SelectInput
        source="currentStage"
        label="Current Stage"
        choices={[
          { id: 1, name: 'Stage 1 - Normal' },
          { id: 2, name: 'Stage 2 - Watch' },
          { id: 3, name: 'Stage 3 - Impaired' },
        ]}
        defaultValue={1}
      />
      
      <TextInput source="customerType" label="Customer Type" required />
      <TextInput source="industrySector" label="Industry Sector" />
      <TextInput source="internalRating" label="Internal Rating" />
      <TextInput source="externalRating" label="External Rating" />
      
      <BooleanInput source="isSyariahCompliant" label="Syariah Compliant" />
      <TextInput source="syariahContractType" label="Syariah Contract Type" />
      
      <SelectInput
        source="accountStatus"
        label="Account Status"
        choices={[
          { id: 'active', name: 'Active' },
          { id: 'pending', name: 'Pending' },
        ]}
        defaultValue="active"
      />
    </SimpleForm>
  </Create>
);
