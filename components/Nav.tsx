'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

const navItems = [
  { href: '/',          label: 'Project Overview',   icon: '📊', section: 'MAIN' },
  { href: '/divisions', label: 'Divisions',          icon: '🏢', section: 'MAIN' },
  { href: '/projects',  label: 'All Projects',       icon: '📋', section: 'MAIN' },
  { href: '/memos',     label: 'Meeting Memos',      icon: '📝', section: 'MAIN' },
  { href: '/admin',     label: 'Data Entry',         icon: '✏️',  section: 'MANAGE' },
  { href: '/import',    label: 'Import / Feed',      icon: '📥', section: 'MANAGE' },
]

export function Nav() {
  const pathname   = usePathname()
  const router     = useRouter()
  const { data: session } = useSession()
  const [presenting,  setPresenting]  = useState(false)
  const [showLogout,  setShowLogout]  = useState(false)

  const user = session?.user as any

  const togglePresentation = () => {
    setPresenting((v) => {
      const shell = document.getElementById('app-shell')
      const main  = document.getElementById('main-content')
      if (!v) {
        shell?.classList.add('presentation-mode')
        main?.classList.add('presentation-mode')
      } else {
        shell?.classList.remove('presentation-mode')
        main?.classList.remove('presentation-mode')
      }
      return !v
    })
  }

  const handleLogout = async () => {
    if (session) {
      await signOut({ callbackUrl: '/' })
    } else {
      router.push('/')
    }
  }

  // Role badge color
  const roleBadge = user?.role === 'Viewer'
    ? { bg: '#f1f5f9', color: '#475569', label: 'Viewer' }
    : user?.role === 'Editor'
    ? { bg: '#dbeafe', color: '#1e40af', label: 'Editor' }
    : { bg: '#fef3c7', color: '#92400e', label: 'Admin' }

  // Initials avatar
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SS'

  const sections = ['MAIN', 'MANAGE']

  return (
    <nav className="sidebar" id="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">ONM</div>
        <div className="logo-text">
          <span className="logo-text-main">ONM BU Dashboard</span>
          <span className="logo-text-sub">VP Office</span>
        </div>
      </div>

      {/* Nav items */}
      <div className="sidebar-nav">
        {sections.map((section) => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {navItems.filter((i) => i.section === section).map((item) => (
              <button
                key={item.href}
                className={`nav-item ${pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) ? 'active' : ''}`}
                onClick={() => router.push(item.href)}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}

        <div className="nav-section-label" style={{ marginTop: 8 }}>TOOLS</div>
        <button
          className={`nav-item ${presenting ? 'active' : ''}`}
          onClick={togglePresentation}
        >
          <span style={{ fontSize: 15 }}>🖥️</span>
          {presenting ? 'Exit Presentation' : 'Presentation Mode'}
        </button>
      </div>

      {/* User profile section */}
      <div style={{
        margin: '8px',
        borderRadius: 10,
        border: '1px solid var(--border)',
        background: 'var(--gray-50)',
        overflow: 'hidden',
      }}>
        <button
          onClick={() => setShowLogout((v) => !v)}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textAlign: 'left',
          }}
        >
          {/* Avatar */}
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 12,
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12.5, fontWeight: 700, color: 'var(--gray-800)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.name || 'Sron Sreypich'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '1px 6px',
                borderRadius: 4, background: roleBadge.bg, color: roleBadge.color,
              }}>
                {roleBadge.label}
              </span>
            </div>
          </div>
          <span style={{
            fontSize: 11, color: 'var(--gray-400)',
            transform: showLogout ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}>▼</span>
        </button>

        {/* Logout panel */}
        {showLogout && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '6px 8px' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '8px 12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 7,
                color: '#dc2626',
                fontSize: 12.5, fontWeight: 700,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#fef2f2')}
            >
              🚪 Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer" style={{ paddingTop: 8 }}>
        <div>ONM BU Dashboard · VP Office · {new Date().getFullYear()}</div>
      </div>
    </nav>
  )
}
