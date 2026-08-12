'use client'

import { signIn, getSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl  = searchParams.get('callbackUrl') || '/'
  const errorParam   = searchParams.get('error')

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [showPw,   setShowPw]   = useState(false)

  useEffect(() => {
    if (errorParam) setError('Invalid email or password. Please try again.')
  }, [errorParam])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email:       email.trim(),
      password,
      redirect:    false,
      callbackUrl,
    })

    if (result?.error) {
      setError('Invalid email or password. Please try again.')
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

      {/* Animated background blobs */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', width: 600, height: 600,
          borderRadius: '50%',
          background: 'rgba(15,118,110,0.15)',
          top: '-200px', left: '-200px',
          animation: 'blob1 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 500, height: 500,
          borderRadius: '50%',
          background: 'rgba(2,132,199,0.12)',
          bottom: '-150px', right: '-100px',
          animation: 'blob2 10s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300,
          borderRadius: '50%',
          background: 'rgba(22,163,74,0.10)',
          top: '40%', right: '20%',
          animation: 'blob3 7s ease-in-out infinite',
        }} />
      </div>

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      {/* Login card */}
      <div style={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 20,
        padding: '48px 44px',
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 10,
        animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #0f766e, #0284c7)',
            borderRadius: 16,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 8px 24px rgba(15,118,110,0.35)',
          }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: 'white', fontFamily: "'Outfit', sans-serif" }}>
              ⚡
            </span>
          </div>
          <div style={{
            fontFamily: "'Outfit', system-ui, sans-serif",
            fontSize: 22,
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.3px',
          }}>
            ONM Energy
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 }}>
            VP Office Dashboard · Secure Access
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderLeft: '4px solid #ef4444',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 20,
            fontSize: 13,
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'shake 0.3s ease',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email field */}
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
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 16, opacity: 0.4,
              }}>✉️</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@onmenergy.com"
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
                onFocus={(e) => {
                  e.target.style.borderColor = '#0f766e'
                  e.target.style.background  = '#ffffff'
                  e.target.style.boxShadow   = '0 0 0 3px rgba(15,118,110,0.12)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.background  = '#f8fafc'
                  e.target.style.boxShadow   = 'none'
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
                onFocus={(e) => {
                  e.target.style.borderColor = '#0f766e'
                  e.target.style.background  = '#ffffff'
                  e.target.style.boxShadow   = '0 0 0 3px rgba(15,118,110,0.12)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.background  = '#f8fafc'
                  e.target.style.boxShadow   = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 16, opacity: 0.5, padding: 4,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
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
              boxShadow: loading ? 'none' : '0 4px 16px rgba(15,118,110,0.35)',
              letterSpacing: '0.2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(15,118,110,0.45)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,118,110,0.35)'
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Signing in…
              </>
            ) : (
              <>🔐 Sign In to Dashboard</>
            )}
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
            <span style={{ color: '#64748b' }}>VP Admin:</span>
            <span style={{ fontFamily: 'monospace', color: '#0f766e', fontWeight: 700 }}>admin@onm.com</span>
            <span style={{ color: '#64748b' }}>Password:</span>
            <span style={{ fontFamily: 'monospace', color: '#0f766e', fontWeight: 700 }}>Admin@1234</span>
            <span style={{ color: '#64748b', marginTop: 4 }}>Viewer:</span>
            <span style={{ fontFamily: 'monospace', color: '#64748b', marginTop: 4 }}>viewer@onm.com</span>
            <span style={{ color: '#64748b' }}>Password:</span>
            <span style={{ fontFamily: 'monospace', color: '#64748b' }}>Viewer@1234</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 24,
          textAlign: 'center',
          fontSize: 11,
          color: '#94a3b8',
        }}>
          🔒 Secure session · Expires after 8 hours
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@700;800;900&display=swap');

        @keyframes blob1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%       { transform: translate(40px,60px) scale(1.1); }
          66%       { transform: translate(-20px,30px) scale(0.95); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%       { transform: translate(-50px,-30px) scale(1.08); }
          66%       { transform: translate(30px,-50px) scale(0.92); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50%       { transform: translate(20px,-40px) scale(1.12); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25%       { transform: translateX(-6px); }
          75%       { transform: translateX(6px); }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
