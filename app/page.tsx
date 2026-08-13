'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

interface PortfolioSummary {
  total: number
  byRag: { Green: number; Yellow: number; Red: number }
  highSeverityIssues: number
  overdueActions: number
  vpAttentionProjects: any[]
  divisionSummary: any[]
  totalCapacityMw: number
  codOperatingCount: number
  underConstructionCount: number
}

interface Division {
  id: number; code: string; name: string; colorHex: string; leadName: string
  projects: any[]
}

const RAG_COLORS: Record<string, string> = {
  Green: '#22c55e', Yellow: '#f59e0b', Red: '#ef4444',
}

function worstRag(rags: string[]): string {
  if (rags.includes('Red'))    return 'Red'
  if (rags.includes('Yellow')) return 'Yellow'
  return 'Green'
}

export default function PortfolioOverviewPage() {
  const router = useRouter()
  const [summary, setSummary]     = useState<PortfolioSummary | null>(null)
  const [divisions, setDivisions] = useState<Division[]>([])
  const [loading, setLoading]     = useState(true)
  const [nowStr, setNowStr]       = useState('')

  useEffect(() => {
    const update = () => setNowStr(new Date().toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' }))
    update()
    const t = setInterval(update, 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/portfolio/summary').then((r) => r.json()),
      fetch('/api/divisions').then((r) => r.json()),
    ]).then(([s, d]) => {
      setSummary(s)
      setDivisions(d)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)', paddingTop: 80 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Loading portfolio data…</div>
      </div>
    )
  }

  const donutData = [
    { name: 'Green',  value: summary?.byRag.Green  ?? 0 },
    { name: 'Yellow', value: summary?.byRag.Yellow ?? 0 },
    { name: 'Red',    value: summary?.byRag.Red    ?? 0 },
  ].filter((d) => d.value > 0)

  const vpProjects = summary?.vpAttentionProjects ?? []

  return (
    <>
      {/* Presentation banner — only visible in presentation mode */}
      <div className="presentation-banner" id="pres-banner" style={{ display: 'none' }}>
        <div>
          <div className="presentation-banner-title">ONM Energy — VP Office Portfolio Review</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>Confidential · For VP Use Only</div>
        </div>
        <div className="presentation-banner-time">{nowStr}</div>
      </div>

      {/* Top Bar */}
      <div className="topbar">
        <div className="topbar-left">
          <div>
            <div className="topbar-title">Project Overview</div>
            <div className="topbar-subtitle">As of {nowStr}</div>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => router.push('/import')}>
            📥 Import
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
            🖨️ Export PDF
          </button>
        </div>
      </div>

      <div className="page-container">
        {/* ── KPI STAT TILES ─────────────────────────────────── */}
        <div className="stat-grid animate-in" style={{ marginBottom: 24 }}>
          <div className="stat-tile" style={{ '--accent-color': 'var(--brand-primary)' } as any}>
            <div className="stat-label">Total Projects</div>
            <div className="stat-value">{summary?.total ?? 0}</div>
            <div className="stat-sub">Across 5 divisions</div>
            <div className="stat-icon">📋</div>
          </div>
          <div className="stat-tile" style={{ '--accent-color': 'var(--brand-secondary)' } as any}>
            <div className="stat-label">Total Capacity</div>
            <div className="stat-value" style={{ fontSize: 24 }}>
              {summary?.totalCapacityMw ? `${summary.totalCapacityMw.toLocaleString()} MW` : '—'}
            </div>
            <div className="stat-sub">Installed portfolio</div>
            <div className="stat-icon">⚡</div>
          </div>
          <div className="stat-tile" style={{ '--accent-color': '#22c55e' } as any}>
            <div className="stat-label">COD Operating</div>
            <div className="stat-value" style={{ color: '#22c55e' }}>{summary?.codOperatingCount ?? 0}</div>
            <div className="stat-sub">Fully commissioned</div>
            <div className="stat-icon">🟢</div>
          </div>
          <div className="stat-tile" style={{ '--accent-color': '#f59e0b' } as any}>
            <div className="stat-label">Under Construction</div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>{summary?.underConstructionCount ?? 0}</div>
            <div className="stat-sub">Development pipeline</div>
            <div className="stat-icon">🔨</div>
          </div>
          <div className="stat-tile" style={{ '--accent-color': '#7c3aed' } as any}>
            <div className="stat-label">High-Severity Issues</div>
            <div className="stat-value" style={{ color: '#7c3aed' }}>{summary?.highSeverityIssues ?? 0}</div>
            <div className="stat-sub">Open High/Critical</div>
            <div className="stat-icon">⚠️</div>
          </div>
          <div className="stat-tile" style={{ '--accent-color': '#ef4444' } as any}>
            <div className="stat-label">Overdue Actions</div>
            <div className="stat-value" style={{ color: '#ef4444' }}>{summary?.overdueActions ?? 0}</div>
            <div className="stat-sub">Past due date</div>
            <div className="stat-icon">⏰</div>
          </div>
        </div>

        {/* ── MAIN GRID: DONUT + ATTENTION PANEL ───────────── */}
        <div className="grid-2 animate-in stagger-2" style={{ marginBottom: 24 }}>
          {/* Portfolio RAG Donut */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">📊 Portfolio RAG Status</div>
            </div>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ flex: 1, height: 220, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%" cy="50%"
                      innerRadius={65} outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {donutData.map((entry) => (
                        <Cell key={entry.name} fill={RAG_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any, n: any) => [`${v} projects`, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center">
                  <div className="donut-value">{summary?.total}</div>
                  <div className="donut-label">Total</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {donutData.map((d) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: RAG_COLORS[d.name], flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>
                        {d.value} Projects
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                        {d.name === 'Green' ? '✅ On Track' : d.name === 'Yellow' ? '⚠️ At Risk' : '🚨 Critical'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* VP Attention Panel */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">🚨 VP Attention Required</div>
              <span className="badge badge-high">{vpProjects.length} items</span>
            </div>
            <div className="card-body" style={{ padding: '12px 20px' }}>
              {vpProjects.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">✅</div>
                  <div className="empty-state-text">No items need VP attention</div>
                </div>
              ) : (
                <div>
                  {vpProjects.map((p: any) => (
                    <div
                      key={p.id}
                      className="attention-item"
                      style={{ cursor: 'pointer' }}
                      onClick={() => router.push(`/projects/${p.id}`)}
                    >
                      <span style={{
                        fontSize: 18, lineHeight: 1,
                        color: p.statusRag === 'Red' ? '#ef4444' : '#f59e0b',
                      }}>
                        {p.statusRag === 'Red' ? '🔴' : '🟡'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-900)' }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                          {p.code} · {Math.round(p.percentComplete)}% complete · {p.currentPhase}
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--brand-primary)' }}>→</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── DIVISION CARDS ────────────────────────────────── */}
        <div className="card animate-in stagger-3" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div className="card-title">🏢 Division Summary</div>
            <button className="btn btn-secondary btn-sm" onClick={() => router.push('/divisions')}>
              View all →
            </button>
          </div>
          <div className="card-body">
            <div className="division-grid">
              {divisions.map((div) => {
                const projects = div.projects ?? []
                const rags     = projects.map((p: any) => p.statusRag)
                const divRag   = worstRag(rags)
                const green    = rags.filter((r: string) => r === 'Green').length
                const yellow   = rags.filter((r: string) => r === 'Yellow').length
                const red      = rags.filter((r: string) => r === 'Red').length
                const vpCount  = projects.filter((p: any) => p.needsVpAttention).length

                return (
                  <div
                    key={div.id}
                    className="division-card"
                    style={{ '--div-color': div.colorHex } as any}
                    onClick={() => router.push(`/divisions/${div.id}`)}
                  >
                    <div className="division-card-accent" />
                    <div className="division-card-code">{div.code}</div>
                    <div className="division-card-name">{div.name}</div>
                    <div className="division-card-meta">
                      {projects.length} project{projects.length !== 1 ? 's' : ''}
                    </div>
                    {div.leadName && (() => {
                      const [hName, hTitle] = div.leadName.split(' · ')
                      return (
                        <div style={{ marginTop: 2, marginBottom: 2 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-800)' }}>
                            👤 {hName}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--gray-500)' }}>{hTitle}</div>
                        </div>
                      )
                    })()}

                    <div className="division-rag-row">
                      {green  > 0 && <span className="rag-count-pill Green">🟢 {green}</span>}
                      {yellow > 0 && <span className="rag-count-pill Yellow">🟡 {yellow}</span>}
                      {red    > 0 && <span className="rag-count-pill Red">🔴 {red}</span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div className={`rag-badge ${divRag}`}>
                        <div className={`rag-dot ${divRag}`} />
                        {divRag}
                      </div>
                      {vpCount > 0 && (
                        <span className="vp-flag">⚑ VP {vpCount}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── RECENT PROJECTS TABLE ─────────────────────────── */}
        <RecentProjectsTable router={router} />
      </div>
    </>
  )
}

function RecentProjectsTable({ router }: { router: any }) {
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/projects').then((r) => r.json()).then(setProjects)
  }, [])

  const redYellow = projects.filter((p) => p.statusRag !== 'Green')

  return (
    <div className="card animate-in stagger-4">
      <div className="card-header">
        <div className="card-title">⚠️ Projects Needing Attention</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {redYellow.length > 0 && (
            <span className="badge badge-high">{redYellow.length} projects</span>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => router.push('/projects')}>
            All projects →
          </button>
        </div>
      </div>
      {redYellow.length === 0 ? (
        <div className="card-body">
          <div className="empty-state">
            <div className="empty-state-icon">🟢</div>
            <div className="empty-state-text">All projects are on track!</div>
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="project-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Division</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Phase</th>
                <th>Next Milestone</th>
                <th>Issues</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {redYellow.map((p) => {
                const openIssues  = p.issues?.length ?? 0
                const openActions = p.actionItems?.length ?? 0
                const now         = new Date()
                const overdueActs = p.actionItems?.filter((a: any) => new Date(a.dueDate) < now).length ?? 0

                return (
                  <tr key={p.id}>
                    <td>
                      <div className="project-name-cell">
                        <span className="project-name" onClick={() => router.push(`/projects/${p.id}`)}>
                          {p.name}
                        </span>
                        <span className="project-code">{p.code}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: `${p.division?.colorHex}18`,
                        color: p.division?.colorHex,
                        padding: '2px 8px', borderRadius: 4,
                        fontSize: 12, fontWeight: 700,
                      }}>
                        {p.division?.code}
                      </span>
                    </td>
                    <td>
                      <div className={`rag-badge ${p.statusRag}`}>
                        <div className={`rag-dot ${p.statusRag}`} />
                        {p.statusRag}
                      </div>
                    </td>
                    <td>
                      <div style={{ minWidth: 100 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div
                              className={`progress-fill ${p.statusRag === 'Red' ? 'red' : p.statusRag === 'Yellow' ? 'yellow' : ''}`}
                              style={{ width: `${p.percentComplete}%` }}
                            />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-700)', minWidth: 34, textAlign: 'right' }}>
                            {Math.round(p.percentComplete)}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--gray-600)' }}>{p.currentPhase || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray-600)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.nextMilestone || '—'}
                    </td>
                    <td>
                      {openIssues > 0 ? (
                        <span className="badge badge-high">{openIssues} open</span>
                      ) : (
                        <span style={{ color: 'var(--gray-300)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {overdueActs > 0 && <span className="badge badge-overdue">{overdueActs} overdue</span>}
                        {openActions > 0 && overdueActs === 0 && <span className="badge badge-open">{openActions} open</span>}
                        {openActions === 0 && <span style={{ color: 'var(--gray-300)', fontSize: 12 }}>—</span>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
