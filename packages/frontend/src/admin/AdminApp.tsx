import React from 'react';

export interface AdminAppProps {
    tenantConfig?: any;
}

export default function AdminApp({ tenantConfig }: AdminAppProps) {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Admin App Placeholder</h1>
            <p>The Admin App component is currently under development.</p>
            {tenantConfig && (
                <pre>{JSON.stringify(tenantConfig, null, 2)}</pre>
            )}
        </div>
    );
}
