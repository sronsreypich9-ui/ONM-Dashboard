'use client'

import { signIn } from 'next-auth/react'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl  = searchParams.get('callbackUrl') || '/'
  const errorParam   = searchParams.get('error')

  const [username, setUsername] = useState('Sron Sreypich')
  const [password, setPassword] = useState('Admin@1234')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [selectedRole, setSelectedRole] = useState<'Admin' | 'Editor' | 'Viewer'>('Admin')

  useEffect(() => {
    if (errorParam) setError('Invalid credentials or session expired. Please log in again.')
  }, [errorParam])

  const selectRolePreset = (role: 'Admin' | 'Editor' | 'Viewer') => {
    setSelectedRole(role)
    setError('')
    if (role === 'Admin') {
      setUsername('Sron Sreypich')
      setPassword('Admin@1234')
    } else if (role === 'Editor') {
      setUsername('Editor User')
      setPassword('Editor@1234')
    } else {
      setUsername('Viewer User')
      setPassword('Viewer@1234')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      username: username.trim(),
      password,
      redirect: false,
      callbackUrl,
    })

    if (result?.error) {
      setError('Invalid User Name or Password. Please try again.')
      setLoading(false)
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #0f766e 40%, #0284c7 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: "'Inter', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(15, 118, 110, 0.4) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Main Glass Layout Box */}
      <div style={{
        width: '100%',
        maxWidth: 960,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: 0,
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(20px)',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Left Column: Role Selector & Login Form */}
        <div style={{ padding: '36px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Logo badge */}
          <div style={{ textAlign: 'left', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, #0f766e, #0284c7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color: 'white', fontWeight: 800,
                boxShadow: '0 6px 16px rgba(15, 118, 110, 0.35)',
              }}>
                ONM
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  ONM BU Dashboard
                </div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                  VP Office · Role-Based Access Control
                </div>
              </div>
            </div>
          </div>

          {/* Quick Role Selection Cards */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 8 }}>
              Select Access Level Role:
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {/* Admin */}
              <button
                type="button"
                onClick={() => selectRolePreset('Admin')}
                style={{
                  padding: '10px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  background: selectedRole === 'Admin' ? '#fef3c7' : '#f8fafc',
                  border: selectedRole === 'Admin' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 16 }}>👑</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: selectedRole === 'Admin' ? '#92400e' : '#334155', marginTop: 2 }}>
                  VP Admin
                </div>
                <div style={{ fontSize: 9.5, color: '#64748b', marginTop: 1 }}>Full Control</div>
              </button>

              {/* Editor */}
              <button
                type="button"
                onClick={() => selectRolePreset('Editor')}
                style={{
                  padding: '10px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  background: selectedRole === 'Editor' ? '#dbeafe' : '#f8fafc',
                  border: selectedRole === 'Editor' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 16 }}>✏️</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: selectedRole === 'Editor' ? '#1e40af' : '#334155', marginTop: 2 }}>
                  Editor
                </div>
                <div style={{ fontSize: 9.5, color: '#64748b', marginTop: 1 }}>Read & Edit</div>
              </button>

              {/* Viewer */}
              <button
                type="button"
                onClick={() => selectRolePreset('Viewer')}
                style={{
                  padding: '10px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  background: selectedRole === 'Viewer' ? '#f1f5f9' : '#f8fafc',
                  border: selectedRole === 'Viewer' ? '2px solid #64748b' : '1px solid #e2e8f0',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 16 }}>👁️</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: selectedRole === 'Viewer' ? '#0f172a' : '#334155', marginTop: 2 }}>
                  Viewer
                </div>
                <div style={{ fontSize: 9.5, color: '#64748b', marginTop: 1 }}>Read Only</div>
              </button>
            </div>
          </div>

          {/* Error notification */}
          {error && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', background: '#fef2f2',
              border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626',
              fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* User Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#475569', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                User Name / Email
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: 0.4 }}>👤</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter user name"
                  required
                  style={{
                    width: '100%', padding: '10px 12px 10px 38px',
                    border: '1.5px solid #cbd5e1', borderRadius: 9,
                    fontSize: 13.5, color: '#0f172a', background: '#f8fafc',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#475569', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: 0.4 }}>🔒</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  style={{
                    width: '100%', padding: '10px 40px 10px 38px',
                    border: '1.5px solid #cbd5e1', borderRadius: 9,
                    fontSize: 13.5, color: '#0f172a', background: '#f8fafc',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, opacity: 0.5,
                  }}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0f766e, #0284c7)',
                color: 'white', border: 'none', borderRadius: 9,
                fontSize: 14.5, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(15, 118, 110, 0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? 'Authenticating…' : `🔐 Sign In as ${selectedRole}`}
            </button>
          </form>

          <div style={{ marginTop: 18, textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>
            🔒 Authenticated Session · JWT Expired in 8 Hours
          </div>
        </div>

        {/* Right Column: Access Rights Matrix Info Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '36px 32px', color: 'white', display: 'flex',
          flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 18 }}>🛡️</span>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.2px' }}>
                Access Rights Matrix
              </h3>
            </div>

            <p style={{ color: '#94a3b8', fontSize: 12.5, lineHeight: 1.5, marginBottom: 20 }}>
              The ONM Energy VP Dashboard enforces Role-Based Access Control (RBAC) to ensure data integrity and security.
            </p>

            {/* Matrix List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* VP Admin */}
              <div style={{
                background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px',
                border: selectedRole === 'Admin' ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: '#fcd34d' }}>👑 VP Admin (Full Access)</span>
                  <span style={{ fontSize: 9.5, background: '#f59e0b', color: '#78350f', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>ALL PERMISSIONS</span>
                </div>
                <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.4 }}>
                  Full read, write, edit, delete, project status management, Discord issue escalation, and bulk Excel import/export.
                </div>
              </div>

              {/* Editor */}
              <div style={{
                background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px',
                border: selectedRole === 'Editor' ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: '#93c5fd' }}>✏️ Editor (Edit & Write)</span>
                  <span style={{ fontSize: 9.5, background: '#3b82f6', color: 'white', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>READ / WRITE</span>
                </div>
                <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.4 }}>
                  Can edit project progress, write meeting memos, and analyze Discord threads. Cannot delete projects or import database feeds.
                </div>
              </div>

              {/* Viewer */}
              <div style={{
                background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px',
                border: selectedRole === 'Viewer' ? '1px solid #94a3b8' : '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: '#cbd5e1' }}>👁️ Viewer (Read Only)</span>
                  <span style={{ fontSize: 9.5, background: '#64748b', color: 'white', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>READ ONLY</span>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>
                  Read-only view across all 31 portfolio projects, divisions, meeting memos, and Discord recaps. Edit & import actions disabled.
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 14, fontSize: 11, color: '#64748b', textAlign: 'center' }}>
            ONM Energy BU · VP Executive Portal
          </div>
        </div>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading Login Portal…</div>}>
      <LoginForm />
    </Suspense>
  )
}
