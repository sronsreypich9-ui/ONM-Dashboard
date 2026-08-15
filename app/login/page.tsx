'use client'

import { signIn } from 'next-auth/react'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl  = searchParams.get('callbackUrl') || '/'
  const errorParam   = searchParams.get('error')

  const [username, setUsername] = useState('VP Tann Tourthang')
  const [password, setPassword] = useState('1108')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [showPw,   setShowPw]   = useState(false)

  useEffect(() => {
    if (errorParam) setError('Invalid User Name or Password. Please try again.')
  }, [errorParam])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        username: username.trim(),
        password: password.trim(),
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError('Invalid User Name or Password. Please try again.')
        setLoading(false)
      } else {
        window.location.href = callbackUrl || '/'
      }
    } catch (err) {
      console.error(err)
      window.location.href = '/'
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

      {/* Clean Single Card Container */}
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: '#ffffff',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
        border: '1px solid #e2e8f0',
        padding: '40px 36px',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Clean Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #0f766e 0%, #0284c7 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: 'white', fontWeight: 800, marginBottom: 12,
            boxShadow: '0 6px 16px rgba(15, 118, 110, 0.25)',
          }}>
            ONM
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.4px' }}>
            ONM BU Dashboard
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, margin: 0, fontWeight: 500 }}>
            Sign in to access your VP Executive Dashboard
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
                placeholder="Enter User Name"
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

          {/* Clean Standard Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0f766e 0%, #0284c7 100%)',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(15, 118, 110, 0.35)',
            }}
          >
            {loading ? 'Signing in…' : '🔐 Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11.5, color: '#94a3b8' }}>
          🔒 Secure Authenticated Session · VP Office Portal
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
