'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { invalidateCache } from '@/lib/useDataCache'

const navItems = [
  { href: '/',             label: 'Project Overview',   icon: '📊', section: 'MAIN' },
  { href: '/divisions',    label: 'Divisions',          icon: '🏢', section: 'MAIN' },
  { href: '/projects',     label: 'All Projects',       icon: '📋', section: 'MAIN' },
  { href: '/memos',        label: 'Meeting Memos',      icon: '📝', section: 'MAIN' },
  { href: '/discord-recap',label: 'Discord Recap',     icon: '💬', section: 'MAIN' },
  { href: '/admin',        label: 'Data Entry',         icon: '✏️',  section: 'MANAGE' },
  { href: '/import',       label: 'Import / Feed',      icon: '📥', section: 'MANAGE' },
]

export function Nav() {
  const pathname   = usePathname()
  const router     = useRouter()
  const { data: session } = useSession()
  const [collapsed, setCollapsed]    = useState(false)
  const [presenting,  setPresenting]  = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const user = session?.user as any

  // Load initial collapse state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('onm_sidebar_collapsed')
    if (saved === 'true') {
      setCollapsed(true)
      document.getElementById('sidebar')?.classList.add('collapsed')
      document.getElementById('main-content')?.classList.add('sidebar-collapsed')
    }
  }, [])

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev
      const sidebar = document.getElementById('sidebar')
      const mainContent = document.getElementById('main-content')
      if (next) {
        sidebar?.classList.add('collapsed')
        mainContent?.classList.add('sidebar-collapsed')
        localStorage.setItem('onm_sidebar_collapsed', 'true')
      } else {
        sidebar?.classList.remove('collapsed')
        mainContent?.classList.remove('sidebar-collapsed')
        localStorage.setItem('onm_sidebar_collapsed', 'false')
      }
      return next
    })
  }

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
    invalidateCache()
    await signOut({ callbackUrl: '/login', redirect: true })
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
    <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`} id="sidebar">
      {/* Logo Header & Collapse Toggle */}
      <div className="sidebar-logo" style={{ justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo-mark">ONM</div>
          <div className="logo-text">
            <span className="logo-text-main">ONM BU Dashboard</span>
            <span className="logo-text-sub">VP Office</span>
          </div>
        </div>

        {/* Sidebar Toggle Button */}
        <button
          onClick={toggleCollapse}
          title={collapsed ? 'Expand Menu Bar' : 'Collapse Menu Bar'}
          style={{
            background: 'var(--gray-100)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: 'var(--gray-600)',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gray-200)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--gray-100)')}
        >
          {collapsed ? '▶' : '◀'}
        </button>
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
                onMouseEnter={() => router.prefetch(item.href)}
                title={item.label}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </button>
            ))}
          </div>
        ))}

        <div className="nav-section-label" style={{ marginTop: 8 }}>TOOLS</div>
        <button
          className={`nav-item ${presenting ? 'active' : ''}`}
          onClick={togglePresentation}
          title={presenting ? 'Exit Presentation' : 'Presentation Mode'}
        >
          <span style={{ fontSize: 15 }}>🖥️</span>
          <span className="nav-text">{presenting ? 'Exit Presentation' : 'Presentation Mode'}</span>
        </button>
      </div>

      {/* Discord-Style User Profile Bar */}
      <div style={{
        margin: '8px',
        borderRadius: 10,
        border: '1px solid var(--border)',
        background: 'var(--gray-50)',
        padding: '10px 10px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 8,
        }}>
          {/* Avatar with Discord Online Green Dot */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #5865F2, #0284c7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: 13,
            }}>
              {initials}
            </div>
            {/* Status Dot */}
            <div
              title="Online"
              style={{
                position: 'absolute', bottom: -1, right: -1,
                width: 11, height: 11, borderRadius: '50%',
                background: '#23a55a', border: '2px solid white',
              }}
            />
          </div>

          <div className="user-details-text" style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12.5, fontWeight: 700, color: 'var(--gray-800)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.name || 'Sron Sreypich'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
              <span style={{ fontSize: 10, color: 'var(--gray-500)', fontWeight: 600 }}>#2026</span>
              <span style={{
                fontSize: 9.5, fontWeight: 700, padding: '1px 5px',
                borderRadius: 4, background: roleBadge.bg, color: roleBadge.color,
              }}>
                {roleBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Log Out Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          title="Sign Out of Dashboard"
          style={{
            width: '100%', padding: '7px 10px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 7,
            color: '#dc2626',
            fontSize: 12, fontWeight: 700,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#fef2f2')}
        >
          🚪 <span className="nav-text">Log Out</span>
        </button>
      </div>

      {/* Footer */}
      <div className="sidebar-footer" style={{ paddingTop: 8 }}>
        <div>ONM BU Dashboard · VP Office · {new Date().getFullYear()}</div>
      </div>

      {/* Discord-Style Log Out Confirmation Modal */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            background: '#313338', borderRadius: 14, maxWidth: 420, width: '100%',
            padding: '24px 24px 20px 24px', boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
            border: '1px solid #2b2d31', color: '#f2f3f5', fontFamily: "'gg sans', sans-serif",
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f2f3f5', margin: '0 0 10px 0' }}>
              Log Out
            </h2>
            <p style={{ fontSize: 13.5, color: '#dbdee1', lineHeight: 1.5, margin: '0 0 24px 0' }}>
              Are you sure you want to log out of <strong>ONM Energy VP Office Dashboard</strong>?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                style={{
                  background: 'none', border: 'none', color: 'white',
                  fontSize: 13, fontWeight: 600, padding: '10px 20px',
                  borderRadius: 6, cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: '#da373c', color: 'white', border: 'none',
                  padding: '10px 24px', borderRadius: 6, fontSize: 13.5,
                  fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(218, 55, 60, 0.4)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#a1282c')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#da373c')}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
