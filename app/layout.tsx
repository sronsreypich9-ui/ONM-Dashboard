import type { Metadata } from 'next'
import './globals.css'
import { Nav } from '@/components/Nav'
import { AuthProvider } from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'ONM BU Dashboard — VP Office',
  description: 'Project tracking and meeting memo dashboard for the VP Office',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="app-shell" id="app-shell">
            <Nav />
            <div className="main-content" id="main-content">
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
