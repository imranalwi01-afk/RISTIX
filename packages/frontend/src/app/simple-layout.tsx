import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Simple PSAK 413 Test',
  description: 'Testing React functionality',
}

export default function SimpleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Simple Layout Working</h1>
        {children}
      </body>
    </html>
  )
}
