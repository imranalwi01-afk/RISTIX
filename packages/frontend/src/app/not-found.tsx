export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, padding: 32, textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 48, fontWeight: 700, color: '#666', margin: 0 }}>404</h1>
      <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Page Not Found</h2>
      <p style={{ color: '#666', maxWidth: 400, margin: 0 }}>The page you are looking for doesn&apos;t exist or may have been moved.</p>
      <a href="/" style={{ display: 'inline-block', padding: '8px 24px', background: '#1976d2', color: '#fff', textDecoration: 'none', borderRadius: 6, marginTop: 8 }}>Go to Home</a>
    </div>
  );
}
