import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — ONM Energy VP Dashboard',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
