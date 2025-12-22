'use client'
import { useState } from 'react'

export default function SimplePage() {
  const [count, setCount] = useState(0)
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🔥 SIMPLE TEST PAGE</h1>
      <p>Count: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{ 
          padding: '10px 20px', 
          background: 'blue', 
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Click me! 
      </button>
      <div style={{ marginTop: '20px' }}>
        {count > 0 && <p>✅ JavaScript is working!</p>}
      </div>
    </div>
  )
}
