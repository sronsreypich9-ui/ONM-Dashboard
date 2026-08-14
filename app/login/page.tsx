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
      background: '#1e1f22',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: "'gg sans', 'Inter', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Discord Ambient Background Glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '30%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(88, 101, 242, 0.25) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Discord Glass Container Card */}
      <div style={{
        width: '100%',
        maxWidth: 780,
        background: '#313338',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        border: '1px solid #2b2d31',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Left Column: Form Section */}
        <div style={{ padding: '36px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Header text */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(88, 101, 242, 0.15)', border: '1px solid #5865F2',
              color: '#5865F2', padding: '4px 12px', borderRadius: 20,
              fontSize: 11.5, fontWeight: 800, marginBottom: 12,
            }}>
              👑 VP Executive Portal
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f2f3f5', margin: 0, letterSpacing: '-0.3px' }}>
              Welcome back, Sron Sreypich!
            </h1>
            <p style={{ fontSize: 13, color: '#b5bac1', marginTop: 4, margin: 0 }}>
              Enter password to access ONM BU Dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', background: 'rgba(237, 66, 69, 0.15)',
              border: '1px solid #ed4245', borderRadius: 8, color: '#f87171',
              fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* User Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#b5bac1', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                User Name / Email <span style={{ color: '#ed4245' }}>*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Sron Sreypich"
                required
                style={{
                  width: '100%', padding: '10px 12px',
                  background: '#1e1f22', border: '1px solid #1e1f22',
                  borderRadius: 6, fontSize: 14, color: '#f2f3f5',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#b5bac1', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Password <span style={{ color: '#ed4245' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  style={{
                    width: '100%', padding: '10px 38px 10px 12px',
                    background: '#1e1f22', border: '1px solid #1e1f22',
                    borderRadius: 6, fontSize: 14, color: '#f2f3f5',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#949ba4',
                  }}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Discord Blurple Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: loading ? '#4e5058' : '#5865F2',
                color: 'white', border: 'none', borderRadius: 6,
                fontSize: 14.5, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
                boxShadow: '0 4px 12px rgba(88, 101, 242, 0.4)',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#4752C4' }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#5865F2' }}
            >
              {loading ? 'Authenticating…' : '🔐 Log In as Sron Sreypich (VP Admin)'}
            </button>
          </form>

          <div style={{ marginTop: 18, fontSize: 11.5, color: '#949ba4', textAlign: 'center' }}>
            🔒 Authenticated VP Session · Admin Permissions Active
          </div>
        </div>

        {/* Right Column: Discord QR Code Scan Simulation */}
        <div style={{
          background: '#2b2d31', padding: '36px 28px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center', borderLeft: '1px solid #1e1f22',
        }}>
          {/* QR Code Container */}
          <div style={{
            background: 'white', padding: 12, borderRadius: 12,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)', marginBottom: 16,
            position: 'relative', width: 150, height: 150,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Simulated High-Res QR SVG */}
            <svg width="126" height="126" viewBox="0 0 100 100" fill="#0f172a">
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
              <rect x="38" y="38" width="12" height="12" fill="#5865F2" />
              <rect x="54" y="38" width="8" height="8" />
              <rect x="68" y="12" width="12" height="12" />
              <rect x="84" y="48" width="8" height="8" />
              <rect x="38" y="60" width="8" height="8" />
              <rect x="54" y="60" width="12" height="12" fill="#0f766e" />
              <rect x="72" y="60" width="8" height="8" />
              <rect x="48" y="76" width="12" height="12" />
              <rect x="68" y="76" width="10" height="10" />
              <rect x="84" y="80" width="8" height="8" />
            </svg>

            {/* ONM Badge Overlay */}
            <div style={{
              position: 'absolute', width: 32, height: 32, borderRadius: 8,
              background: '#0f766e', color: 'white', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 800,
              fontSize: 11, border: '2px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}>
              ONM
            </div>
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f2f3f5', margin: '0 0 6px 0' }}>
            Log in with QR Code
          </h3>
          <p style={{ fontSize: 12.5, color: '#b5bac1', lineHeight: 1.5, margin: 0, maxWidth: 220 }}>
            Scan with your phone or tap below for 1-click test sign-in!
          </p>

          <button
            type="button"
            onClick={(e) => handleSubmit(e as any)}
            style={{
              marginTop: 16, background: '#35363c', color: '#dbdee1',
              border: '1px solid #4e5058', padding: '8px 16px', borderRadius: 6,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#404249')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#35363c')}
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
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#b5bac1', background: '#1e1f22', minHeight: '100vh' }}>Loading Discord Portal…</div>}>
      <LoginForm />
    </Suspense>
  )
}
