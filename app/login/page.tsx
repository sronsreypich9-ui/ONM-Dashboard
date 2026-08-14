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

  useEffect(() => {
    if (errorParam) setError('Invalid credentials or session expired. Please log in again.')
  }, [errorParam])

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
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: "'Inter', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Subtle Radial Accent */}
      <div style={{
        position: 'absolute', top: '10%', left: '20%', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(15, 118, 110, 0.08) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Main White Card Container */}
      <div style={{
        width: '100%',
        maxWidth: 820,
        background: '#ffffff',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
        border: '1px solid #e2e8f0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Left Column: Form Section */}
        <div style={{ padding: '40px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Header text */}
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#f0fdfa', border: '1px solid #ccfbf1',
              color: '#0f766e', padding: '5px 14px', borderRadius: 20,
              fontSize: 12, fontWeight: 800, marginBottom: 14,
            }}>
              👑 VP Executive Access Portal
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.4px' }}>
              Welcome back, Sron Sreypich!
            </h1>
            <p style={{ fontSize: 13.5, color: '#64748b', marginTop: 4, margin: 0, fontWeight: 500 }}>
              Enter your password to sign in to ONM BU Dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              marginBottom: 18, padding: '10px 14px', background: '#fef2f2',
              border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626',
              fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* User Name */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                User Name / Email <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: 0.4 }}>👤</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Sron Sreypich"
                  required
                  style={{
                    width: '100%', padding: '11px 12px 11px 38px',
                    background: '#f8fafc', border: '1.5px solid #cbd5e1',
                    borderRadius: 10, fontSize: 14, color: '#0f172a',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Password <span style={{ color: '#dc2626' }}>*</span>
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
                    width: '100%', padding: '11px 40px 11px 38px',
                    background: '#f8fafc', border: '1.5px solid #cbd5e1',
                    borderRadius: 10, fontSize: 14, color: '#0f172a',
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
                width: '100%', padding: '13px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0f766e 0%, #0284c7 100%)',
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: 14.5, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(15, 118, 110, 0.35)',
              }}
            >
              {loading ? 'Authenticating…' : '🔐 Sign In as Sron Sreypich (VP Admin)'}
            </button>
          </form>

          <div style={{ marginTop: 20, fontSize: 12, color: '#64748b', textAlign: 'center' }}>
            🔒 Authenticated Session · VP Admin Permissions Active
          </div>
        </div>

        {/* Right Column: Simulated QR Code Scan Box (Light Theme) */}
        <div style={{
          background: '#f8fafc', padding: '40px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center', borderLeft: '1px solid #e2e8f0',
        }}>
          {/* QR Code Frame */}
          <div style={{
            background: '#ffffff', padding: 14, borderRadius: 16,
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)', marginBottom: 18,
            border: '1px solid #e2e8f0', position: 'relative',
            width: 156, height: 156, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* SVG QR Pattern */}
            <svg width="130" height="130" viewBox="0 0 100 100" fill="#0f172a">
              <rect x="0" y="0" width="30" height="30" rx="4" />
              <rect x="5" y="5" width="20" height="20" fill="white" />
              <rect x="10" y="10" width="10" height="10" fill="#0f172a" />

              <rect x="70" y="0" width="30" height="30" rx="4" />
              <rect x="75" y="5" width="20" height="20" fill="white" />
              <rect x="80" y="10" width="10" height="10" fill="#0f172a" />

              <rect x="0" y="70" width="30" height="30" rx="4" />
              <rect x="5" y="75" width="20" height="20" fill="white" />
              <rect x="10" y="80" width="10" height="10" fill="#0f172a" />

              {/* Data Blocks */}
              <rect x="36" y="5" width="8" height="8" />
              <rect x="48" y="12" width="8" height="8" />
              <rect x="36" y="24" width="8" height="8" />
              <rect x="12" y="38" width="8" height="8" />
              <rect x="24" y="48" width="8" height="8" />
              <rect x="38" y="38" width="12" height="12" fill="#0f766e" />
              <rect x="54" y="38" width="8" height="8" />
              <rect x="68" y="12" width="12" height="12" />
              <rect x="84" y="48" width="8" height="8" />
              <rect x="38" y="60" width="8" height="8" />
              <rect x="54" y="60" width="12" height="12" fill="#0284c7" />
              <rect x="72" y="60" width="8" height="8" />
              <rect x="48" y="76" width="12" height="12" />
              <rect x="68" y="76" width="10" height="10" />
              <rect x="84" y="80" width="8" height="8" />
            </svg>

            {/* ONM Badge Overlay */}
            <div style={{
              position: 'absolute', width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #0f766e, #0284c7)', color: 'white', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 800,
              fontSize: 11, border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            }}>
              ONM
            </div>
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            Log in with QR Code
          </h3>
          <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.5, margin: 0, maxWidth: 230 }}>
            Scan with your mobile device or tap below for 1-click test sign-in!
          </p>

          <button
            type="button"
            onClick={(e) => handleSubmit(e as any)}
            style={{
              marginTop: 18, background: '#ffffff', color: '#0f172a',
              border: '1.5px solid #cbd5e1', padding: '9px 18px', borderRadius: 9,
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9'
              e.currentTarget.style.borderColor = '#94a3b8'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff'
              e.currentTarget.style.borderColor = '#cbd5e1'
            }}
          >
            <span>📱</span> 1-Click Quick Scan Sign In
          </button>
        </div>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#64748b', background: '#f8fafc', minHeight: '100vh' }}>Loading Login Portal…</div>}>
      <LoginForm />
    </Suspense>
  )
}
