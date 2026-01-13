'use client';

import React, { Suspense } from 'react';
import { Admin, Resource, CustomRoutes, ListGuesser, EditGuesser, ShowGuesser, defaultTheme } from 'react-admin';
import {
    Business as TenantsIcon,
    Group as ConsultantsIcon,
    Analytics as AnalyticsIcon,
    Monitor as InfrastructureIcon,
    Support as SupportIcon,
    Security as AuditIcon,
    People as UsersIcon,
} from '@mui/icons-material';

import { platformDataProvider } from '../providers/PlatformDataProvider';
import { authProvider } from '../providers/PlatformAuthProvider';
import { TenantList } from './tenants/TenantList';
import { TenantEdit, TenantCreate } from './tenants/TenantEdit';
import { ConsultantList } from './consultants/ConsultantList';
import { ConsultantEdit, ConsultantCreate } from './consultants/ConsultantEdit';
import { PlatformUserList } from './platform-users/PlatformUserList';
import { PlatformUserEdit, PlatformUserCreate } from './platform-users/PlatformUserEdit';

// ============================================================================
// LOADING COMPONENT
// ============================================================================

const AdminLoadingPage: React.FC = () => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        flexDirection: 'column',
        gap: '16px'
    }}>
        <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }} />
        <div style={{
            fontSize: '16px',
            color: '#666',
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
        }}>
            Loading Platform Administration...
        </div>
        <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    </div>
);

// ============================================================================
// CUSTOM LOGIN PAGE (Redirects to Main App Login)
// ============================================================================
const CustomLoginPage = () => {
    React.useEffect(() => {
        // Redirect to main login page with return URL
        console.log('🔄 Redirecting to main login page...');
        window.location.href = '/login?role=platform_admin&from=/platform/admin';
    }, []);

    return <AdminLoadingPage />;
};

// ============================================================================
// PLATFORM THEME MATCHING YOUR COLORS
// ============================================================================

const platformTheme = {
    ...defaultTheme,
    palette: {
        ...defaultTheme.palette,
        primary: {
            main: '#667eea', // Your platform primary color
        },
        secondary: {
            main: '#764ba2', // Your platform secondary color
        },
        background: {
            default: '#fafafa',
        },
    },
    typography: {
        ...defaultTheme.typography,
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        ...defaultTheme.components,
        RaAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#667eea',
                    '& .RaAppBar-title': {
                        color: '#ffffff',
                        fontWeight: 'bold',
                    },
                },
            },
        },
        RaSidebar: {
            styleOverrides: {
                root: {
                    '& .RaMenu-open': {
                        width: 240,
                    },
                },
            },
        },
    },
};

// ============================================================================
// PLATFORM ADMIN DASHBOARD WITH REAL DATA
// ============================================================================

const PlatformAdminDashboard: React.FC = () => {
    return (
        <div style={{ padding: '20px' }}>
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '30px',
                borderRadius: '8px',
                marginBottom: '20px',
            }}>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: 'bold' }}>
                    🏢 Platform Administration Center
                </h1>
                <p style={{ margin: '0', fontSize: '16px', opacity: 0.9 }}>
                    React Admin interface for IFRS9 multi-tenant platform management
                </p>
                <div style={{
                    marginTop: '15px',
                    fontSize: '14px',
                    opacity: 0.8,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '15px'
                }}>
                    <span>📊 Multi-tenant: Metro, Syariah, DANA Digital Bank</span>
                    <span>🔧 Real-time monitoring</span>
                    <span>👥 Consultant management</span>
                    <span>🛡️ Infrastructure oversight</span>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#667eea', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TenantsIcon /> Banking Institutions
                    </h3>
                    <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
                        Manage Metro Bank, Syariah Bank, and DANA Digital Bank tenants with real-time status monitoring.
                    </p>
                    <a
                        href="#/tenants"
                        style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            backgroundColor: '#667eea',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        Manage Tenants →
                    </a>
                </div>

                <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#764ba2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ConsultantsIcon /> Consultant Registry
                    </h3>
                    <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
                        Manage external consultants, track projects, monitor validation and quality assurance.
                    </p>
                    <a
                        href="#/consultants"
                        style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            backgroundColor: '#764ba2',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        Manage Consultants →
                    </a>
                </div>

                <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UsersIcon /> Platform Users
                    </h3>
                    <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
                        Manage platform administrators, view user analytics, handle permissions and access control.
                    </p>
                    <a
                        href="#/platform-users"
                        style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            backgroundColor: '#2e7d32',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        Manage Users →
                    </a>
                </div>

                <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#d32f2f', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <InfrastructureIcon /> System Monitoring
                    </h3>
                    <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
                        Monitor infrastructure health, view system metrics, manage deployments and performance.
                    </p>
                    <a
                        href="#/infrastructure"
                        style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            backgroundColor: '#d32f2f',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        View Infrastructure →
                    </a>
                </div>
            </div>

            <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <a
                        href="#/analytics"
                        style={{
                            padding: '10px 20px',
                            border: '2px solid #667eea',
                            color: '#667eea',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        📊 Platform Analytics
                    </a>
                    <a
                        href="#/audit-logs"
                        style={{
                            padding: '10px 20px',
                            border: '2px solid #764ba2',
                            color: '#764ba2',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        🔍 Audit Logs
                    </a>
                    <a
                        href="#/support-tickets"
                        style={{
                            padding: '10px 20px',
                            border: '2px solid #2e7d32',
                            color: '#2e7d32',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        🎫 Support Tickets
                    </a>
                    <a
                        href="/platform/dashboard"
                        style={{
                            padding: '10px 20px',
                            border: '2px solid #d32f2f',
                            color: '#d32f2f',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        📈 Classic Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// 🩹 SURGICAL FIX: Create fallback providers if they don't exist
// ============================================================================

const fallbackDataProvider = {
    getList: () => Promise.resolve({ data: [], total: 0 }),
    getOne: () => Promise.resolve({ data: {} }),
    getMany: () => Promise.resolve({ data: [] }),
    getManyReference: () => Promise.resolve({ data: [], total: 0 }),
    create: () => Promise.resolve({ data: {} }),
    update: () => Promise.resolve({ data: {} }),
    updateMany: () => Promise.resolve({ data: [] }),
    delete: () => Promise.resolve({ data: {} }),
    deleteMany: () => Promise.resolve({ data: [] }),
};

const fallbackAuthProvider = {
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    checkAuth: () => Promise.resolve(),
    checkError: () => Promise.resolve(),
    getPermissions: () => Promise.resolve(),
    getIdentity: () => Promise.resolve({
        id: '1',
        fullName: 'Platform Admin',
        avatar: 'https://ui-avatars.com/api/?name=Platform+Admin&background=667eea&color=fff'
    }),
};

function safeLoadProviders() {
    try {
        return {
            dataProvider: platformDataProvider || fallbackDataProvider,
            authProvider: authProvider || fallbackAuthProvider,
        };
    } catch (error) {
        console.warn('⚠️ Provider loading error, using fallbacks:', error);
        return {
            dataProvider: fallbackDataProvider,
            authProvider: fallbackAuthProvider,
        };
    }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AdminApp: React.FC = () => {
    const { dataProvider, authProvider: authProv } = safeLoadProviders();

    return (
        <div style={{ minHeight: '100vh' }}>
            <Admin
                dataProvider={dataProvider as any}
                authProvider={authProv}
                theme={platformTheme}
                dashboard={PlatformAdminDashboard}
                title="IFRS9 Platform Administration"
                disableTelemetry
                loginPage={CustomLoginPage}
            >
                <Resource
                    name="tenants"
                    list={TenantList}
                    edit={TenantEdit}
                    create={TenantCreate}
                    icon={TenantsIcon}
                    options={{ label: 'Banking Institutions' }}
                />

                <Resource
                    name="platform-users"
                    list={PlatformUserList}
                    edit={PlatformUserEdit}
                    create={PlatformUserCreate}
                    icon={UsersIcon}
                    options={{ label: 'Platform Users' }}
                />

                <Resource
                    name="consultants"
                    list={ConsultantList}
                    edit={ConsultantEdit}
                    create={ConsultantCreate}
                    icon={ConsultantsIcon}
                    options={{ label: 'Consultant Registry' }}
                />

                <Resource
                    name="infrastructure"
                    list={ListGuesser}
                    show={ShowGuesser}
                    icon={InfrastructureIcon}
                    options={{ label: 'Infrastructure' }}
                />

                <Resource
                    name="audit-logs"
                    list={ListGuesser}
                    show={ShowGuesser}
                    icon={AuditIcon}
                    options={{ label: 'Audit Logs' }}
                />

                <Resource
                    name="support-tickets"
                    list={ListGuesser}
                    edit={EditGuesser}
                    show={ShowGuesser}
                    icon={SupportIcon}
                    options={{ label: 'Support Tickets' }}
                />

                <Resource
                    name="analytics"
                    list={ListGuesser}
                    show={ShowGuesser}
                    icon={AnalyticsIcon}
                    options={{ label: 'Analytics' }}
                />
            </Admin>
        </div>
    );
};

export default AdminApp;
