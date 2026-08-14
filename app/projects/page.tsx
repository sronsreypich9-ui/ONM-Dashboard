'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { useCachedData } from '@/lib/useDataCache'

function ProjectsContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters]     = useState({
    divisionId: searchParams.get('divisionId') || '',
    rag:        '',
    q:          '',
  })

  const queryUrl = `/api/projects?${new URLSearchParams({
    ...(filters.divisionId ? { divisionId: filters.divisionId } : {}),
    ...(filters.rag ? { rag: filters.rag } : {}),
    ...(filters.q ? { q: filters.q } : {}),
  }).toString()}`

  const { data: projectsData, loading: projLoading } = useCachedData<any[]>(queryUrl)
  const { data: divisionsData } = useCachedData<any[]>('/api/divisions')

  const projects  = projectsData || []
  const divisions = divisionsData || []
  const loading   = projLoading && !projectsData

  const now = new Date()

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-title">All Projects</div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary btn-sm" onClick={() => router.push('/admin')}>
            + New Project
          </button>
        </div>
      </div>

      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="breadcrumb">
              <a onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>Portfolio</a>
              <span>›</span>
              <span>Projects</span>
            </div>
            <div className="page-title">📋 All Projects ({projects.length})</div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="card animate-in" style={{ marginBottom: 20 }}>
          <div className="card-body" style={{ padding: '12px 20px' }}>
            <div className="filter-bar">
              <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
                <span style={{ color: 'var(--gray-400)' }}>🔍</span>
                <input
                  placeholder="Search projects…"
                  value={filters.q}
                  onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                />
              </div>
              <select
                className="filter-select"
                value={filters.divisionId}
                onChange={(e) => setFilters((f) => ({ ...f, divisionId: e.target.value }))}
              >
                <option value="">All Divisions</option>
                {divisions.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
                ))}
              </select>
              <select
                className="filter-select"
                value={filters.rag}
                onChange={(e) => setFilters((f) => ({ ...f, rag: e.target.value }))}
              >
                <option value="">All Statuses</option>
                <option value="Green">🟢 Green</option>
                <option value="Yellow">🟡 Yellow</option>
                <option value="Red">🔴 Red</option>
              </select>
              {(filters.divisionId || filters.rag || filters.q) && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setFilters({ divisionId: '', rag: '', q: '' })}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card animate-in stagger-2">
          {loading ? (
            <div className="empty-state"><div>Loading…</div></div>
          ) : projects.length === 0 ? (
            <div className="card-body">
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-text">No projects match your filters</div>
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
                    <th>Capacity</th>
                    <th>Phase</th>
                    <th>Next Milestone</th>
                    <th>Issues</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => {
                    const openIssues  = p.issues?.length ?? 0
                    const openActions = p.actionItems?.length ?? 0
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
                            background: `${p.division?.colorHex}20`,
                            color: p.division?.colorHex,
                            padding: '2px 8px', borderRadius: 4,
                            fontSize: 12, fontWeight: 700,
                          }}>
                            {p.division?.code}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className={`rag-badge ${p.statusRag}`}>
                              <div className={`rag-dot ${p.statusRag}`} />
                              {p.statusRag}
                            </div>
                            {p.needsVpAttention && <span className="vp-flag">⚑</span>}
                          </div>
                        </td>
                        <td style={{ minWidth: 110 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div className="progress-bar" style={{ flex: 1 }}>
                              <div
                                className={`progress-fill ${p.statusRag === 'Red' ? 'red' : p.statusRag === 'Yellow' ? 'yellow' : ''}`}
                                style={{ width: `${p.percentComplete}%` }}
                              />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700 }}>{Math.round(p.percentComplete)}%</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--gray-600)' }}>
                          {p.capacityMw ? `${p.capacityMw} MW` : '—'}
                        </td>
                        <td style={{ fontSize: 12 }}>{p.currentPhase || '—'}</td>
                        <td style={{ fontSize: 12, maxWidth: 160 }}>
                          <div className="truncate">{p.nextMilestone || '—'}</div>
                          {p.nextMilestoneDate && (
                            <div style={{ color: 'var(--gray-400)', fontSize: 11 }}>
                              {new Date(p.nextMilestoneDate).toLocaleDateString('en-GB')}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {openIssues > 0 && <span className="badge badge-high">{openIssues} issues</span>}
                            {overdueActs > 0 && <span className="badge badge-overdue">{overdueActs} overdue</span>}
                            {openIssues === 0 && overdueActs === 0 && <span style={{ color: 'var(--gray-300)', fontSize: 12 }}>—</span>}
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => router.push(`/projects/${p.id}`)}
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Loading…</div>}>
      <ProjectsContent />
    </Suspense>
  )
}
