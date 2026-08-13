'use client'

import { signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl  = searchParams.get('callbackUrl') || '/'
  const errorParam   = searchParams.get('error')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [showPw,   setShowPw]   = useState(false)

  useEffect(() => {
    if (errorParam) setError('Invalid User Name or password. Please try again.')
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
      setError('Invalid User Name or password. Please try again.')
      setLoading(false)
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #0f766e 50%, #0284c7 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Card container */}
      <div style={{
        width: '100%',
        maxWidth: 420,
        margin: '20px',
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(20px)',
        borderRadius: 20,
        padding: '36px 32px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Logo badge */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #0f766e, #0284c7)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, marginBottom: 12, color: 'white',
            boxShadow: '0 8px 20px rgba(15, 118, 110, 0.3)',
          }}>
            ⚡
          </div>
          <div style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.3px',
          }}>
            ONM BU Dashboard
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 }}>
            VP Office · Secure Access
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            marginBottom: 20,
            padding: '12px 14px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 10,
            color: '#dc2626',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* User Name field */}
          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 700,
              color: '#374151',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
            }}>
              User Name
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 16, opacity: 0.4,
              }}>👤</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter User Name (e.g. Sron Sreypich)"
                required
                autoFocus
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 40px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: 14,
                  color: '#0f172a',
                  background: '#f8fafc',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={{ marginBottom: 28 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 700,
              color: '#374151',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 16, opacity: 0.4,
              }}>🔒</span>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '11px 44px 11px 40px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: 14,
                  color: '#0f172a',
                  background: '#f8fafc',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 16, opacity: 0.5, padding: 4,
                }}
                title={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: loading
                ? '#94a3b8'
                : 'linear-gradient(135deg, #0f766e, #0284c7)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(15,118,110,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? 'Signing in…' : '🔐 Sign In to Dashboard'}
          </button>
        </form>

        {/* Default credentials hint */}
        <div style={{
          marginTop: 28,
          padding: '14px 16px',
          background: 'linear-gradient(135deg, #f0fdfa, #eff6ff)',
          borderRadius: 10,
          border: '1px solid #ccfbf1',
          fontSize: 12,
          color: '#475569',
          lineHeight: 1.7,
        }}>
          <div style={{ fontWeight: 700, color: '#0f766e', marginBottom: 6, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            🔑 Default Accounts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
            <span style={{ color: '#64748b' }}>Admin Name:</span>
            <span style={{ fontFamily: 'monospace', color: '#0f766e', fontWeight: 700 }}>Sron Sreypich</span>
            <span style={{ color: '#64748b' }}>Password:</span>
            <span style={{ fontFamily: 'monospace', color: '#0f766e', fontWeight: 700 }}>Admin@1234</span>
            <span style={{ color: '#64748b', marginTop: 4 }}>Viewer Name:</span>
            <span style={{ fontFamily: 'monospace', color: '#64748b', marginTop: 4 }}>Viewer User</span>
            <span style={{ color: '#64748b' }}>Password:</span>
            <span style={{ fontFamily: 'monospace', color: '#64748b' }}>Viewer@1234</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>
          🔒 Secure session · Expires after 8 hours
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <LoginForm />
    </Suspense>
  )
}
