'use client'

export default function TestPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🎉 REACT IS WORKING!</h1>
      <p>If you can see this, React is functioning correctly.</p>
      <p>The issue is in your main app loading logic.</p>
      <button onClick={() => alert('JavaScript is working!')}>
        Test JavaScript
      </button>
    </div>
  )
}
