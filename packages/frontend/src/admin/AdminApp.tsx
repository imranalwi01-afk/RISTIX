// packages/frontend/src/admin/AdminApp.tsx
import React from 'react';
import '../styles/globals.css';
import { Admin, Resource, ShowGuesser, ListGuesser, EditGuesser } from 'react-admin';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
  Calculate as CalculateIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Upload as UploadIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

// Providers
import { authProvider } from './providers/auth/authProvider';
import { dataProvider } from './providers/data/dataProvider';

// Themes
import { conventionalTheme } from './themes/conventionalTheme';
import { syariahTheme } from './themes/syariahTheme';

// Components
import { Dashboard } from './components/common/Dashboard';
import { LoginPage } from './components/common/LoginPage';
import { AdminLayout } from './components/common/AdminLayout';

// Resources
import { UserResource } from './resources/users/UserResource';
import { RoleResource } from './resources/roles/RoleResource';
import { PermissionResource } from './resources/permissions/PermissionResource';
import { MenuResource } from './resources/menus/MenuResource';
import { TenantResource } from './resources/tenants/TenantResource';
import { PortfolioResource } from './resources/portfolios/PortfolioResource';
import { AccountResource } from './resources/accounts/AccountResource';
import { CalculationResource } from './resources/CalculationResource';
import { ConfigurationResource } from './resources/ConfigurationResource';
import { CustomerResource } from './resources/CustomerResource';
import { ProductParameterResource } from './resources/parameters/ProductParameterResource';

// Enhanced Banking Resources
import { EnhancedPortfolioAccountResource } from './resources/banking/EnhancedPortfolioAccountResource';
import { EnhancedCustomerResource } from './resources/banking/EnhancedCustomerResource';
import { BankingProductResource } from './resources/banking/BankingProductResource';
import { IFRS9CalculationResource } from './resources/banking/IFRS9CalculationResource';

// Internationalization
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';

// Custom i18n messages for banking terms
const messages = {
  en: {
    ...englishMessages,
    resources: {
      users: {
        name: 'User |||| Users',
        fields: {
          email: 'Email',
          name: 'Full Name',
          role: 'Role',
          tenant: 'Banking Institution',
          bankingMode: 'Banking Mode',
          status: 'Status',
          lastLogin: 'Last Login'
        }
      },
      portfolios: {
        name: 'Portfolio |||| Portfolios',
        fields: {
          name: 'Portfolio Name',
          type: 'Portfolio Type',
          bankingMode: 'Banking Mode',
          totalExposure: 'Total Exposure',
          eclAmount: 'ECL Amount',
          stage1: 'Stage 1 Assets',
          stage2: 'Stage 2 Assets',
          stage3: 'Stage 3 Assets'
        }
      },
      calculations: {
        name: 'ECL Calculation |||| ECL Calculations',
        fields: {
          calculationDate: 'Calculation Date',
          portfolioName: 'Portfolio',
          stage: 'IFRS 9 Stage',
          eclAmount: 'ECL Amount',
          status: 'Status',
          methodology: 'Methodology',
          approvalStatus: 'Approval Status'
        }
      }
    },
    custom: {
      banking: {
        conventional: 'Conventional Banking',
        syariah: 'Syariah Banking',
        switchMode: 'Switch Banking Mode'
      },
      ifrs9: {
        stage1: 'Stage 1 - 12-month ECL',
        stage2: 'Stage 2 - Lifetime ECL',
        stage3: 'Stage 3 - Credit Impaired',
        eclCalculation: 'Expected Credit Loss Calculation',
        staging: 'IFRS 9 Staging Analysis'
      }
    }
  }
};

const i18nProvider = polyglotI18nProvider(() => messages.en, 'en');

// Theme selection based on banking mode (this would come from context/state in real app)
const getBankingTheme = (mode: 'conventional' | 'syariah' = 'conventional') => {
  return mode === 'syariah' ? syariahTheme : conventionalTheme;
};

const AdminApp: React.FC = () => {
  // In a real app, this would come from Redux/Context
  const currentBankingMode: 'conventional' | 'syariah' = 'conventional';
  const theme = createTheme(getBankingTheme(currentBankingMode));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Admin
        authProvider={authProvider}
        dataProvider={dataProvider}
        i18nProvider={i18nProvider}
        dashboard={Dashboard}
        loginPage={LoginPage}
        layout={AdminLayout}
        title="IFRS 9 Multi-Tenant Platform"
        disableTelemetry
      >
        {/* Core Platform Resources */}
        <Resource
          name="users"
          list={UserResource.List}
          edit={UserResource.Edit}
          create={UserResource.Create}
          show={UserResource.Show}
          icon={PeopleIcon}
          options={{ label: 'Users' }}
        />

        <Resource
          name="roles"
          list={RoleResource.List}
          edit={RoleResource.Edit}
          create={RoleResource.Create}
          icon={SecurityIcon}
          options={{ label: 'Roles & Permissions' }}
        />

        <Resource
          name="permissions"
          list={PermissionResource.List}
          edit={PermissionResource.Edit}
          create={PermissionResource.Create}
          show={PermissionResource.Show}
          icon={SecurityIcon}
          options={{ label: 'Permissions' }}
        />

        <Resource
          name="menus"
          list={MenuResource.List}
          edit={MenuResource.Edit}
          create={MenuResource.Create}
          show={MenuResource.Show}
          icon={SettingsIcon}
          options={{ label: 'Menu Management' }}
        />

        <Resource
          name="tenants"
          list={ListGuesser}
          edit={EditGuesser}
          create={EditGuesser}
          show={ShowGuesser}
          icon={AccountBalanceIcon}
          options={{ label: 'Banking Institutions' }}
        />

        {/* Banking & IFRS 9 Resources */}
        <Resource
          name="portfolios"
          list={PortfolioResource.List}
          edit={PortfolioResource.Edit}
          create={PortfolioResource.Create}
          show={PortfolioResource.Show}
          icon={AccountBalanceIcon}
          options={{ label: 'Portfolios' }}
        />

        {/* Enhanced Banking Resources */}
        <Resource
          name="portfolio-accounts"
          list={EnhancedPortfolioAccountResource.List}
          edit={EnhancedPortfolioAccountResource.Edit}
          create={EnhancedPortfolioAccountResource.Create}
          show={EnhancedPortfolioAccountResource.Show}
          icon={AccountBalanceIcon}
          options={{ label: 'Portfolio Accounts (Enhanced)' }}
        />

        <Resource
          name="banking-customers"
          list={EnhancedCustomerResource.list}
          edit={EnhancedCustomerResource.edit}
          create={EnhancedCustomerResource.create}
          show={EnhancedCustomerResource.show}
          icon={PeopleIcon}
          options={{ label: 'Banking Customers (Enhanced)' }}
        />

        <Resource
          name="banking-products"
          list={BankingProductResource.list}
          edit={BankingProductResource.edit}
          create={BankingProductResource.create}
          show={BankingProductResource.show}
          icon={AccountBalanceIcon}
          options={{ label: 'Banking Products' }}
        />

        <Resource
          name="ifrs9-calculations"
          list={IFRS9CalculationResource.list}
          edit={IFRS9CalculationResource.edit}
          create={IFRS9CalculationResource.create}
          show={IFRS9CalculationResource.show}
          icon={CalculateIcon}
          options={{ label: 'IFRS 9 Calculations' }}
        />

        <Resource
          name="accounts"
          list={AccountResource.List}
          edit={AccountResource.Edit}
          create={AccountResource.Create}
          icon={AccountBalanceIcon}
          options={{ label: 'Portfolio Accounts (Legacy)' }}
        />

        <Resource
          name="customers"
          list={CustomerResource.List}
          edit={CustomerResource.Edit}
          create={CustomerResource.Create}
          show={CustomerResource.Show}
          icon={PeopleIcon}
          options={{ label: 'Customers (Legacy)' }}
        />

        <Resource
          name="calculations"
          list={CalculationResource.List}
          edit={CalculationResource.Edit}
          create={CalculationResource.Create}
          show={CalculationResource.Show}
          icon={CalculateIcon}
          options={{ label: 'ECL Calculations' }}
        />

        <Resource
          name="configurations"
          list={ConfigurationResource.List}
          edit={ConfigurationResource.Edit}
          create={ConfigurationResource.Create}
          icon={SettingsIcon}
          options={{ label: 'IFRS 9 Configuration' }}
        />

        {/* Parameter Resources */}
        <ProductParameterResource />

        {/* Additional Resources */}
        <Resource
          name="reports"
          list={ListGuesser}
          show={ShowGuesser}
          icon={AssessmentIcon}
          options={{ label: 'Reports' }}
        />

        <Resource
          name="uploads"
          list={ListGuesser}
          create={EditGuesser}
          icon={UploadIcon}
          options={{ label: 'Data Upload' }}
        />
      </Admin>
    </ThemeProvider>
  );
};

export default AdminApp;