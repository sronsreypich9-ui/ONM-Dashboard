'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [project, setProject]   = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState<'overview' | 'memos' | 'issues' | 'actions'>('overview')
  const [expandedMemos, setExpandedMemos] = useState<Set<number>>(new Set())

  useEffect(() => {
    params.then((p) => {
      fetch(`/api/projects/${p.id}`)
        .then((r) => r.json())
        .then((d) => { setProject(d); setLoading(false) })
    })
  }, [params])

  const refresh = () => {
    params.then((p) => {
      fetch(`/api/projects/${p.id}`).then((r) => r.json()).then(setProject)
    })
  }

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>Loading project…</div>
  if (!project || project.error) return <div style={{ padding: 32 }}>Project not found</div>

  const now     = new Date()
  const openIss = project.issues?.filter((i: any) => i.status !== 'Resolved') ?? []
  const openAct = project.actionItems?.filter((a: any) => a.status !== 'Done') ?? []
  const overdueAct = project.actionItems?.filter((a: any) => new Date(a.dueDate) < now && a.status !== 'Done') ?? []

  const toggleMemo = (id: number) => {
    setExpandedMemos((s) => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  return (
    <>
      {/* TOP BAR */}
      <div className="topbar">
        <div className="topbar-left">
          <button
            className="btn-icon"
            onClick={() => router.back()}
            style={{ marginRight: 4 }}
          >
            ←
          </button>
          <div>
            <div className="topbar-title">{project.name}</div>
            <div className="topbar-subtitle">
              {project.code} · {project.division?.name}
              {project.location ? ` · ${project.location}` : ''}
            </div>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => router.push(`/admin?projectId=${project.id}`)}>
            ✏️ Edit
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
            🖨️ Export
          </button>
        </div>
      </div>

      <div className="page-container">
        {/* BREADCRUMB */}
        <div className="breadcrumb" style={{ marginBottom: 16 }}>
          <a onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>Portfolio</a>
          <span>›</span>
          <a onClick={() => router.push(`/divisions/${project.divisionId}`)} style={{ cursor: 'pointer' }}>
            {project.division?.code}
          </a>
          <span>›</span>
          <span>{project.name}</span>
        </div>

        {/* PROJECT HEADER CARD */}
        <div className="card animate-in" style={{ marginBottom: 20 }}>
          <div className="card-body" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
              {/* Division badge */}
              <div style={{
                width: 56, height: 56, borderRadius: 12,
                background: project.division?.colorHex || 'var(--brand-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: 13,
                flexShrink: 0,
              }}>
                {project.division?.code}
              </div>

              {/* Main info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                  <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 800, color: 'var(--gray-900)' }}>
                    {project.name}
                  </h1>
                  <div className={`rag-badge ${project.statusRag}`} style={{ fontSize: 13 }}>
                    <div className={`rag-dot ${project.statusRag}`} />
                    {project.statusRag}
                  </div>
                  {project.needsVpAttention && <span className="vp-flag">⚑ VP Attention</span>}
                </div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: 'var(--gray-600)' }}>
                  {project.location     && <span>📍 {project.location}</span>}
                  {project.capacityMw   && <span>⚡ {project.capacityMw} MW</span>}
                  {project.currentPhase && <span>🔄 {project.currentPhase}</span>}
                </div>
              </div>

              {/* Progress */}
              <div style={{ minWidth: 200 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>
                  <span>Overall Progress</span>
                  <span style={{ fontWeight: 800, color: 'var(--gray-900)', fontSize: 16 }}>
                    {Math.round(project.percentComplete)}%
                  </span>
                </div>
                <div className="progress-bar" style={{ height: 10 }}>
                  <div
                    className={`progress-fill ${project.statusRag === 'Red' ? 'red' : project.statusRag === 'Yellow' ? 'yellow' : ''}`}
                    style={{ width: `${project.percentComplete}%` }}
                  />
                </div>
                {project.nextMilestone && (
                  <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 6, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 2 }}>
                      Next Milestone
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-800)' }}>{project.nextMilestone}</div>
                    {project.nextMilestoneDate && (
                      <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>
                        {new Date(project.nextMilestoneDate).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="stat-grid animate-in stagger-1" style={{ marginBottom: 20 }}>
          <div className="stat-tile" style={{ '--accent-color': '#7c3aed' } as any}>
            <div className="stat-label">Open Issues</div>
            <div className="stat-value">{openIss.length}</div>
          </div>
          <div className="stat-tile" style={{ '--accent-color': '#ef4444' } as any}>
            <div className="stat-label">Overdue Actions</div>
            <div className="stat-value" style={{ color: overdueAct.length > 0 ? '#ef4444' : 'var(--gray-900)' }}>
              {overdueAct.length}
            </div>
          </div>
          <div className="stat-tile" style={{ '--accent-color': 'var(--brand-secondary)' } as any}>
            <div className="stat-label">Meeting Memos</div>
            <div className="stat-value">{project.meetings?.length ?? 0}</div>
          </div>
          <div className="stat-tile" style={{ '--accent-color': 'var(--brand-primary)' } as any}>
            <div className="stat-label">Action Items</div>
            <div className="stat-value">{openAct.length}</div>
            <div className="stat-sub">Open items</div>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          {(['overview', 'memos', 'issues', 'actions'] as const).map((t) => (
            <button
              key={t}
              className={`tab-btn ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'overview' ? '📊 KPIs' : t === 'memos' ? `📝 Memos (${project.meetings?.length ?? 0})` : t === 'issues' ? `⚠️ Issues (${openIss.length})` : `✅ Actions (${openAct.length})`}
            </button>
          ))}
        </div>

        {/* ── KPI OVERVIEW TAB ─────────────────────────────── */}
        {tab === 'overview' && (
          <div className="animate-in">
            {(!project.kpis || project.kpis.length === 0) ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">📊</div>
                  <div className="empty-state-text">No KPIs recorded yet</div>
                  <div className="empty-state-sub">Add KPIs via the Admin panel</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                {project.kpis.map((kpi: any) => {
                  const readings = kpi.readings ?? []
                  const latest   = readings[readings.length - 1]
                  const chartData = readings.map((r: any) => ({ period: r.period, actual: r.actualValue, target: kpi.target }))
                  const isGood   = kpi.unit === 'L/MWh' || kpi.name.toLowerCase().includes('outage')
                    ? (latest?.actualValue ?? 0) <= (kpi.target ?? Infinity)
                    : (latest?.actualValue ?? 0) >= (kpi.target ?? 0)

                  return (
                    <div key={kpi.id} className="card">
                      <div className="card-header">
                        <div className="card-title" style={{ fontSize: 14 }}>{kpi.name}</div>
                        <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>{kpi.unit}</span>
                      </div>
                      <div className="card-body">
                        <div style={{ display: 'flex', gap: 20, marginBottom: 16, alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700 }}>Latest</div>
                            <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, color: isGood ? '#22c55e' : '#ef4444' }}>
                              {latest ? latest.actualValue.toLocaleString() : '—'}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{latest?.period || ''}</div>
                          </div>
                          {kpi.target != null && (
                            <div>
                              <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700 }}>Target</div>
                              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-600)' }}>
                                {kpi.target.toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>
                        {chartData.length > 1 && (
                          <div style={{ height: 140 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} width={40} />
                                <Tooltip />
                                <Line type="monotone" dataKey="actual" stroke="var(--brand-primary)" strokeWidth={2} dot={{ r: 3 }} name="Actual" />
                                {kpi.target && <Line type="monotone" dataKey="target" stroke="var(--rag-red)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Target" />}
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── MEMOS TAB ────────────────────────────────────── */}
        {tab === 'memos' && (
          <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={() => router.push(`/admin?tab=memo&projectId=${project.id}`)}>
                + Add Memo
              </button>
            </div>
            {(!project.meetings || project.meetings.length === 0) ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">📝</div>
                  <div className="empty-state-text">No meeting memos yet</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {project.meetings.map((m: any) => {
                  const d = new Date(m.meetingDate)
                  const expanded = expandedMemos.has(m.id)
                  let attendees: string[] = []
                  try { attendees = JSON.parse(m.attendees) } catch { attendees = [m.attendees] }

                  return (
                    <div key={m.id} className="memo-card">
                      <div className="memo-header" onClick={() => toggleMemo(m.id)}>
                        <div className="memo-date-badge">
                          <div className="memo-date-day">{d.getDate()}</div>
                          <div className="memo-date-month">{d.toLocaleString('en', { month: 'short' })}</div>
                        </div>
                        <div className="memo-info">
                          <div className="memo-title">{m.title}</div>
                          <div className="memo-meta">
                            <span>📅 {d.toLocaleDateString('en-GB', { dateStyle: 'medium' })}</span>
                            <span>👥 {attendees.length} attendees</span>
                            {m.actionItems?.length > 0 && (
                              <span>✅ {m.actionItems.length} action items</span>
                            )}
                            <span style={{ fontSize: 10, background: 'var(--gray-100)', padding: '1px 6px', borderRadius: 3, color: 'var(--gray-500)', fontWeight: 600 }}>
                              {m.source}
                            </span>
                          </div>
                        </div>
                        <span style={{ color: 'var(--gray-400)', fontSize: 16 }}>{expanded ? '▲' : '▼'}</span>
                      </div>

                      <div className="memo-body" style={{ display: expanded ? 'block' : 'none', padding: '0 18px 16px' }}>
                        <div className="memo-section-title">Attendees</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                          {attendees.map((a: string, i: number) => (
                            <span key={i} style={{ background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 12, fontSize: 12, color: 'var(--gray-700)' }}>
                              {a}
                            </span>
                          ))}
                        </div>

                        <div className="memo-section-title">Summary</div>
                        <div className="memo-text">{m.summary}</div>

                        {m.decisions && (
                          <>
                            <div className="memo-section-title">Decisions</div>
                            <div className="memo-text" style={{ background: '#f0fdf4', padding: '8px 12px', borderRadius: 6, borderLeft: '3px solid #22c55e' }}>
                              {m.decisions}
                            </div>
                          </>
                        )}

                        {m.actionItems?.length > 0 && (
                          <>
                            <div className="memo-section-title">Action Items</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {m.actionItems.map((ai: any) => {
                                const isOverdue = new Date(ai.dueDate) < now && ai.status !== 'Done'
                                return (
                                  <div key={ai.id} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10,
                                    padding: '8px 10px',
                                    background: isOverdue ? '#fef2f2' : 'var(--gray-50)',
                                    borderRadius: 6, border: `1px solid ${isOverdue ? '#fecaca' : 'var(--border)'}`,
                                  }}>
                                    <span className={`badge badge-${ai.status === 'Done' ? 'done' : ai.status === 'In-progress' ? 'inprogress' : isOverdue ? 'overdue' : 'open'}`}
                                      style={{ flexShrink: 0 }}>
                                      {isOverdue ? 'Overdue' : ai.status}
                                    </span>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{ai.description}</div>
                                      <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>
                                        Owner: {ai.owner} · Due: {new Date(ai.dueDate).toLocaleDateString('en-GB')}
                                      </div>
                                    </div>
                                    <StatusDropdown ai={ai} onUpdate={refresh} />
                                  </div>
                                )
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ISSUES TAB ───────────────────────────────────── */}
        {tab === 'issues' && (
          <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={() => router.push(`/admin?tab=issue&projectId=${project.id}`)}>
                + Add Issue
              </button>
            </div>
            {openIss.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">✅</div>
                  <div className="empty-state-text">No open issues</div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div style={{ overflowX: 'auto' }}>
                  <table className="project-table">
                    <thead>
                      <tr><th>Issue</th><th>Severity</th><th>Status</th><th>Owner</th><th>VP Flag</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {project.issues.map((issue: any) => (
                        <tr key={issue.id}>
                          <td style={{ maxWidth: 300 }}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{issue.title}</div>
                            {issue.description && (
                              <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{issue.description}</div>
                            )}
                          </td>
                          <td><span className={`badge badge-${issue.severity.toLowerCase()}`}>{issue.severity}</span></td>
                          <td><span className={`badge badge-${issue.status === 'Resolved' ? 'done' : issue.status === 'In-progress' ? 'inprogress' : 'open'}`}>{issue.status}</span></td>
                          <td style={{ fontSize: 12 }}>{issue.owner || '—'}</td>
                          <td>{issue.needsVpAttention && <span className="vp-flag">⚑ VP</span>}</td>
                          <td>
                            <IssueResolveButton issue={issue} onUpdate={refresh} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ACTIONS TAB ──────────────────────────────────── */}
        {tab === 'actions' && (
          <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={() => router.push(`/admin?tab=action&projectId=${project.id}`)}>
                + Add Action
              </button>
            </div>
            {project.actionItems?.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">✅</div>
                  <div className="empty-state-text">No action items</div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div style={{ overflowX: 'auto' }}>
                  <table className="project-table">
                    <thead>
                      <tr><th>Description</th><th>Owner</th><th>Due Date</th><th>Status</th><th>Update</th></tr>
                    </thead>
                    <tbody>
                      {project.actionItems.map((ai: any) => {
                        const isOverdue = new Date(ai.dueDate) < now && ai.status !== 'Done'
                        return (
                          <tr key={ai.id} style={{ background: isOverdue ? '#fff5f5' : undefined }}>
                            <td style={{ maxWidth: 300, fontSize: 13 }}>{ai.description}</td>
                            <td style={{ fontSize: 12 }}>{ai.owner}</td>
                            <td style={{ fontSize: 12, color: isOverdue ? '#dc2626' : 'var(--gray-600)', fontWeight: isOverdue ? 700 : 400 }}>
                              {new Date(ai.dueDate).toLocaleDateString('en-GB')}
                              {isOverdue && ' ⚠️'}
                            </td>
                            <td>
                              <span className={`badge badge-${ai.status === 'Done' ? 'done' : ai.status === 'In-progress' ? 'inprogress' : isOverdue ? 'overdue' : 'open'}`}>
                                {isOverdue && ai.status !== 'Done' ? 'Overdue' : ai.status}
                              </span>
                            </td>
                            <td>
                              <StatusDropdown ai={ai} onUpdate={refresh} />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

function StatusDropdown({ ai, onUpdate }: { ai: any; onUpdate: () => void }) {
  const [saving, setSaving] = useState(false)

  const update = async (status: string) => {
    setSaving(true)
    await fetch(`/api/action-items/${ai.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...ai, status }),
    })
    setSaving(false)
    onUpdate()
  }

  return (
    <select
      className="filter-select"
      style={{ fontSize: 11, padding: '3px 6px' }}
      value={ai.status}
      disabled={saving}
      onChange={(e) => update(e.target.value)}
    >
      <option value="Open">Open</option>
      <option value="In-progress">In-progress</option>
      <option value="Done">Done</option>
      <option value="Overdue">Overdue</option>
    </select>
  )
}

function IssueResolveButton({ issue, onUpdate }: { issue: any; onUpdate: () => void }) {
  const [saving, setSaving] = useState(false)

  const resolve = async () => {
    setSaving(true)
    await fetch(`/api/issues/${issue.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...issue, status: 'Resolved' }),
    })
    setSaving(false)
    onUpdate()
  }

  if (issue.status === 'Resolved') return null
  return (
    <button className="btn btn-secondary btn-sm" onClick={resolve} disabled={saving}>
      {saving ? '…' : 'Resolve'}
    </button>
  )
}
