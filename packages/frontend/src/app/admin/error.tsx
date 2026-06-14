'use client';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
      <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        onClick={reset}
        style={{
          padding: '8px 24px', background: '#1976d2', color: '#fff',
          border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14,
        }}
      >
        Try Again
      </button>
    </div>
  );
}
