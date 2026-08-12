'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DivisionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [division, setDivision] = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [divId, setDivId]       = useState<string>('')

  useEffect(() => {
    params.then((p) => {
      setDivId(p.id)
      fetch(`/api/divisions/${p.id}`)
        .then((r) => r.json())
        .then((d) => { setDivision(d); setLoading(false) })
    })
  }, [params])

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>Loading…</div>
  if (!division) return <div style={{ padding: 32 }}>Division not found</div>

  const projects   = division.projects ?? []
  const allIssues  = projects.flatMap((p: any) => (p.issues ?? []).map((i: any) => ({ ...i, project: p })))
  const allActions = projects.flatMap((p: any) => (p.actionItems ?? []).map((a: any) => ({ ...a, project: p })))
  const now        = new Date()

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div style={{
            width: 32, height: 32, borderRadius: 7, background: division.colorHex,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 11, flexShrink: 0,
          }}>{division.code}</div>
          <div>
            <div className="topbar-title">{division.name}</div>
            <div className="topbar-subtitle">
              {projects.length} projects
              {division.leadName && (
                <> · <strong>{division.leadName.split(' · ')[0]}</strong>
                  {' '}{division.leadName.split(' · ')[1] || ''}
                </>
              )}
            </div>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => router.push('/projects?divisionId=' + divId)}>
          All projects →
        </button>
      </div>

      <div className="page-container">
        <div className="page-header" style={{ marginBottom: 20 }}>
          <div>
            <div className="breadcrumb">
              <a onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>Portfolio</a>
              <span>›</span>
              <a onClick={() => router.push('/divisions')} style={{ cursor: 'pointer' }}>Divisions</a>
              <span>›</span>
              <span>{division.code}</span>
            </div>
            <div className="page-title">{division.name} ({division.code})</div>
            <div className="page-subtitle">
              {projects.length} Operating &amp; Development Projects
              {division.leadName && (() => {
                const [hName, hTitle] = division.leadName.split(' · ')
                return (
                  <span style={{ marginLeft: 12, borderLeft: '1px solid var(--gray-300)', paddingLeft: 12 }}>
                    <span style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{hName}</span>
                    {hTitle && <span style={{ color: 'var(--gray-500)' }}> · {hTitle}</span>}
                  </span>
                )
              })()}
            </div>
          </div>
        </div>

        {/* STAT TILES */}
        <div className="stat-grid animate-in" style={{ marginBottom: 24 }}>
          <div className="stat-tile" style={{ '--accent-color': division.colorHex } as any}>
            <div className="stat-label">Total Projects</div>
            <div className="stat-value">{projects.length}</div>
            <div className="stat-sub">In division</div>
          </div>
          <div className="stat-tile" style={{ '--accent-color': '#22c55e' } as any}>
            <div className="stat-label">On Track (Green)</div>
            <div className="stat-value" style={{ color: '#22c55e' }}>
              {projects.filter((p: any) => p.statusRag === 'Green').length}
            </div>
            <div className="stat-sub">Normal operations</div>
          </div>
          <div className="stat-tile" style={{ '--accent-color': '#f59e0b' } as any}>
            <div className="stat-label">At Risk (Yellow)</div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>
              {projects.filter((p: any) => p.statusRag === 'Yellow').length}
            </div>
            <div className="stat-sub">Monitoring required</div>
          </div>
          <div className="stat-tile" style={{ '--accent-color': '#ef4444' } as any}>
            <div className="stat-label">Critical (Red)</div>
            <div className="stat-value" style={{ color: '#ef4444' }}>
              {projects.filter((p: any) => p.statusRag === 'Red').length}
            </div>
            <div className="stat-sub">VP attention required</div>
          </div>
          <div className="stat-tile" style={{ '--accent-color': '#7c3aed' } as any}>
            <div className="stat-label">Open Issues</div>
            <div className="stat-value" style={{ color: '#7c3aed' }}>{allIssues.length}</div>
            <div className="stat-sub">Across all projects</div>
          </div>
          <div className="stat-tile" style={{ '--accent-color': '#ef4444' } as any}>
            <div className="stat-label">Overdue Actions</div>
            <div className="stat-value" style={{ color: '#ef4444' }}>
              {allActions.filter((a: any) => new Date(a.dueDate) < now && a.status !== 'Done').length}
            </div>
            <div className="stat-sub">Pending follow-up</div>
          </div>
        </div>

        {/* PROJECTS TABLE */}
        <div className="card animate-in stagger-2" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">📋 Projects in {division.code}</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="project-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Phase</th>
                  <th>Next Milestone</th>
                  <th>Issues</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p: any) => (
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
                      <div className="flex items-center gap-2">
                        <div className={`rag-badge ${p.statusRag}`}>
                          <div className={`rag-dot ${p.statusRag}`} />
                          {p.statusRag}
                        </div>
                        {p.needsVpAttention && <span className="vp-flag">⚑ VP</span>}
                      </div>
                    </td>
                    <td style={{ minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div
                            className={`progress-fill ${p.statusRag === 'Red' ? 'red' : p.statusRag === 'Yellow' ? 'yellow' : ''}`}
                            style={{ width: `${p.percentComplete}%` }}
                          />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-700)', minWidth: 32 }}>
                          {Math.round(p.percentComplete)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{p.currentPhase || '—'}</td>
                    <td style={{ fontSize: 12, maxWidth: 180 }}>
                      <div>{p.nextMilestone || '—'}</div>
                      {p.nextMilestoneDate && (
                        <div style={{ color: 'var(--gray-400)', fontSize: 11 }}>
                          {new Date(p.nextMilestoneDate).toLocaleDateString('en-GB')}
                        </div>
                      )}
                    </td>
                    <td>
                      {(p.issues?.length ?? 0) > 0 ? (
                        <span className="badge badge-high">{p.issues.length} open</span>
                      ) : (
                        <span style={{ color: 'var(--gray-300)', fontSize: 12 }}>None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ISSUES */}
        {allIssues.length > 0 && (
          <div className="card animate-in stagger-3">
            <div className="card-header">
              <div className="card-title">⚠️ Open Issues — {division.code}</div>
              <span className="badge badge-high">{allIssues.length} issues</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="project-table">
                <thead>
                  <tr><th>Issue</th><th>Project</th><th>Severity</th><th>Owner</th><th>VP Flag</th></tr>
                </thead>
                <tbody>
                  {allIssues.map((issue: any) => (
                    <tr key={issue.id}>
                      <td style={{ maxWidth: 260 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{issue.title}</div>
                        {issue.description && (
                          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{issue.description}</div>
                        )}
                      </td>
                      <td>
                        <span
                          className="project-name"
                          onClick={() => router.push(`/projects/${issue.project.id}`)}
                          style={{ fontSize: 13 }}
                        >
                          {issue.project.code}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${issue.severity.toLowerCase()}`}>{issue.severity}</span>
                      </td>
                      <td style={{ fontSize: 12 }}>{issue.owner || '—'}</td>
                      <td>{issue.needsVpAttention && <span className="vp-flag">⚑ VP</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
