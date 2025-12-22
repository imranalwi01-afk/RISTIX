import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '20px'
    }}>
      <h2>Page Not Found</h2>
      <p>Could not find the requested page.</p>
      <Link href="/admin" style={{
        padding: '10px 20px',
        backgroundColor: '#1976d2',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px'
      }}>
        Go to Admin Interface
      </Link>
    </div>
  )
}
