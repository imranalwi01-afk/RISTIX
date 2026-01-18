import React from 'react';

interface AdminAppProps {
    tenantConfig?: any;
}

const AdminApp: React.FC<AdminAppProps> = ({ tenantConfig }) => {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Admin App Placeholder</h1>
            <p>The Admin App component is currently under development.</p>
            {tenantConfig && (
                <pre>{JSON.stringify(tenantConfig, null, 2)}</pre>
            )}
        </div>
    );
};

export default AdminApp;
