import React, { useState, useEffect } from 'react';

const DOCS_PASS = 'iaf-docs-2026';
const STORAGE_KEY = 'iaf_docs_auth';

export default function Gatekeeper({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const auth = localStorage.getItem(STORAGE_KEY);
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === DOCS_PASS) {
            localStorage.setItem(STORAGE_KEY, 'true');
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Incorrect password. Please try again.');
        }
    };

    if (isLoading) return null;

    if (!isAuthenticated) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                backgroundColor: '#f4f7f9',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
                <div style={{
                    padding: '2rem',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    width: '100%',
                    maxWidth: '400px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ color: '#1a365d', marginBottom: '1.5rem' }}>IAF TechDocs</h2>
                    <p style={{ color: '#4a5568', marginBottom: '2rem' }}>Please enter the password to access the documentation.</p>

                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                marginBottom: '1rem',
                                borderRadius: '4px',
                                border: '1px solid #e2e8f0',
                                fontSize: '1rem'
                            }}
                            autoFocus
                        />
                        {error && <p style={{ color: '#e53e3e', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: '#2b6cb0',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Unlock Documentation
                        </button>
                    </form>

                    <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#a0aec0' }}>
                        © 2024 Indonesia Airawata Finance
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
