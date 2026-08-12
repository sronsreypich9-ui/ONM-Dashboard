'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function worstRag(rags: string[]): string {
  if (rags.includes('Red'))    return 'Red'
  if (rags.includes('Yellow')) return 'Yellow'
  return 'Green'
}

export default function DivisionsPage() {
  const router = useRouter()
  const [divisions, setDivisions] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    fetch('/api/divisions')
      .then((r) => r.json())
      .then((d) => { setDivisions(d); setLoading(false) })
  }, [])

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-title">All Divisions</div>
        </div>
      </div>

      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="breadcrumb">
              <a onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>Portfolio</a>
              <span>›</span>
              <span>Divisions</span>
            </div>
            <div className="page-title">🏢 Division Overview</div>
            <div className="page-subtitle">All 5 operational divisions — click to drill into projects</div>
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div className="empty-state-icon">⚡</div><div>Loading…</div></div>
        ) : (
          <div className="division-grid">
            {divisions.map((div) => {
              const projects = div.projects ?? []
              const rags     = projects.map((p: any) => p.statusRag)
              const divRag   = worstRag(rags)
              const green    = rags.filter((r: string) => r === 'Green').length
              const yellow   = rags.filter((r: string) => r === 'Yellow').length
              const red      = rags.filter((r: string) => r === 'Red').length
              const vpCount  = projects.filter((p: any) => p.needsVpAttention).length
              const avgPct   = projects.length ? Math.round(projects.reduce((s: number, p: any) => s + p.percentComplete, 0) / projects.length) : 0

              return (
                <div
                  key={div.id}
                  className="division-card animate-in"
                  style={{ '--div-color': div.colorHex } as any}
                  onClick={() => router.push(`/divisions/${div.id}`)}
                >
                  <div className="division-card-accent" />
                  <div className="division-card-code">{div.code}</div>
                  <div className="division-card-name" style={{ fontSize: 15 }}>{div.name}</div>
                  {div.leadName && (() => {
                    const [name, title] = div.leadName.split(' · ')
                    return (
                      <div style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>
                          👤 {name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 1 }}>
                          {title}
                        </div>
                      </div>
                    )
                  })()}
                  <div className="division-card-meta">{projects.length} project{projects.length !== 1 ? 's' : ''}</div>

                  <div className="progress-bar" style={{ marginBottom: 12 }}>
                    <div className="progress-fill" style={{ width: `${avgPct}%` }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 14 }}>Avg. {avgPct}% complete</div>

                  <div className="division-rag-row">
                    {green  > 0 && <span className="rag-count-pill Green">🟢 {green}</span>}
                    {yellow > 0 && <span className="rag-count-pill Yellow">🟡 {yellow}</span>}
                    {red    > 0 && <span className="rag-count-pill Red">🔴 {red}</span>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className={`rag-badge ${divRag}`}>
                      <div className={`rag-dot ${divRag}`} />
                      Division: {divRag}
                    </div>
                    {vpCount > 0 && (
                      <span className="vp-flag">⚑ {vpCount} VP</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
