import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Product Search',
  description: 'Product Search',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
