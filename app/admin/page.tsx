'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AdminContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<'project' | 'memo' | 'issue' | 'action' | 'kpi' | 'users'>(
    (searchParams.get('tab') as any) || 'project'
  )
  const [projects, setProjects]   = useState<any[]>([])
  const [divisions, setDivisions] = useState<any[]>([])
  const [users, setUsers]         = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [message, setMessage]     = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Forms state
  const [userForm, setUserForm] = useState({
    name: '',
    password: '',
    role: 'Viewer',
  })
  const [projectForm, setProjectForm] = useState({
    divisionId: '',
    name: '',
    code: '',
    location: '',
    capacityMw: '',
    statusRag: 'Green',
    percentComplete: '0',
    currentPhase: '',
    nextMilestone: '',
    nextMilestoneDate: '',
    needsVpAttention: false,
  })

  const [memoForm, setMemoForm] = useState({
    projectId: searchParams.get('projectId') || '',
    meetingDate: new Date().toISOString().split('T')[0],
    title: '',
    attendees: '',
    summary: '',
    decisions: '',
  })

  const [issueForm, setIssueForm] = useState({
    projectId: searchParams.get('projectId') || '',
    title: '',
    description: '',
    severity: 'Med',
    owner: '',
    needsVpAttention: false,
  })

  const [actionForm, setActionForm] = useState({
    projectId: searchParams.get('projectId') || '',
    description: '',
    owner: '',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'Open',
  })

  const [kpiReadingForm, setKpiReadingForm] = useState({
    projectId: searchParams.get('projectId') || '',
    kpiId: '',
    period: new Date().toISOString().slice(0, 7),
    actualValue: '',
  })
  const [projectKpis, setProjectKpis] = useState<any[]>([])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (e) {
      console.error('Failed to fetch users', e)
    }
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/divisions').then((r) => r.json()),
      fetch('/api/users').then((r) => r.ok ? r.json() : []),
    ]).then(([p, d, u]) => {
      setProjects(p)
      setDivisions(d)
      setUsers(u)
      setLoading(false)
      if (p.length > 0 && !memoForm.projectId) {
        setMemoForm((f) => ({ ...f, projectId: String(p[0].id) }))
        setIssueForm((f) => ({ ...f, projectId: String(p[0].id) }))
        setActionForm((f) => ({ ...f, projectId: String(p[0].id) }))
        setKpiReadingForm((f) => ({ ...f, projectId: String(p[0].id) }))
      }
      if (d.length > 0 && !projectForm.divisionId) {
        setProjectForm((f) => ({ ...f, divisionId: String(d[0].id) }))
      }
    })
  }, [])

  const submitUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create user')
      setMessage({ type: 'success', text: `User "${data.name}" added successfully as ${data.role}!` })
      setUserForm({ name: '', password: '', role: 'Viewer' })
      fetchUsers()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    }
  }

  const updateUserRole = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) throw new Error('Failed to update user role')
      setMessage({ type: 'success', text: 'User access role updated successfully!' })
      fetchUsers()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    }
  }

  const deleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to remove access for user "${userName}"?`)) return
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete user')
      setMessage({ type: 'success', text: `User "${userName}" access removed.` })
      fetchUsers()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    }
  }

  useEffect(() => {
    if (kpiReadingForm.projectId) {
      fetch(`/api/kpis?projectId=${kpiReadingForm.projectId}`)
        .then((r) => r.json())
        .then((kpis) => {
          setProjectKpis(kpis)
          if (kpis.length > 0) {
            setKpiReadingForm((f) => ({ ...f, kpiId: String(kpis[0].id) }))
          } else {
            setKpiReadingForm((f) => ({ ...f, kpiId: '' }))
          }
        })
    }
  }, [kpiReadingForm.projectId])

  const submitProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          divisionId: parseInt(projectForm.divisionId),
          name: projectForm.name,
          code: projectForm.code,
          location: projectForm.location || null,
          capacityMw: projectForm.capacityMw ? parseFloat(projectForm.capacityMw) : null,
          statusRag: projectForm.statusRag,
          percentComplete: parseFloat(projectForm.percentComplete),
          currentPhase: projectForm.currentPhase || null,
          nextMilestone: projectForm.nextMilestone || null,
          nextMilestoneDate: projectForm.nextMilestoneDate ? new Date(projectForm.nextMilestoneDate) : null,
          needsVpAttention: projectForm.needsVpAttention,
        }),
      })
      if (!res.ok) throw new Error('Failed to create project')
      const created = await res.json()
      setMessage({ type: 'success', text: `Project "${created.name}" created successfully!` })
      setProjectForm((f) => ({ ...f, name: '', code: '', location: '', capacityMw: '' }))
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  const submitMemo = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    try {
      const attendeesArr = memoForm.attendees.split(',').map((a) => a.trim()).filter(Boolean)
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: parseInt(memoForm.projectId),
          meetingDate: new Date(memoForm.meetingDate),
          title: memoForm.title,
          attendees: JSON.stringify(attendeesArr),
          summary: memoForm.summary,
          decisions: memoForm.decisions || null,
          source: 'manual',
        }),
      })
      if (!res.ok) throw new Error('Failed to create meeting memo')
      setMessage({ type: 'success', text: 'Meeting memo saved successfully!' })
      setMemoForm((f) => ({ ...f, title: '', summary: '', decisions: '' }))
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  const submitIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: parseInt(issueForm.projectId),
          title: issueForm.title,
          description: issueForm.description || null,
          severity: issueForm.severity,
          owner: issueForm.owner || null,
          needsVpAttention: issueForm.needsVpAttention,
        }),
      })
      if (!res.ok) throw new Error('Failed to log issue')
      setMessage({ type: 'success', text: 'Issue logged successfully!' })
      setIssueForm((f) => ({ ...f, title: '', description: '', owner: '' }))
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  const submitAction = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    try {
      const res = await fetch('/api/action-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: parseInt(actionForm.projectId),
          description: actionForm.description,
          owner: actionForm.owner,
          dueDate: new Date(actionForm.dueDate),
          status: actionForm.status,
        }),
      })
      if (!res.ok) throw new Error('Failed to add action item')
      setMessage({ type: 'success', text: 'Action item created!' })
      setActionForm((f) => ({ ...f, description: '', owner: '' }))
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  const submitKpiReading = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    try {
      const res = await fetch('/api/kpi-readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kpiId: parseInt(kpiReadingForm.kpiId),
          period: kpiReadingForm.period,
          actualValue: parseFloat(kpiReadingForm.actualValue),
        }),
      })
      if (!res.ok) throw new Error('Failed to record KPI reading')
      setMessage({ type: 'success', text: 'KPI reading recorded!' })
      setKpiReadingForm((f) => ({ ...f, actualValue: '' }))
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-title">Data Entry & Management</div>
        </div>
      </div>

      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="breadcrumb">
              <a onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>Portfolio</a>
              <span>›</span>
              <span>Admin / Data Entry</span>
            </div>
            <div className="page-title">✏️ Admin Data Entry Forms</div>
            <div className="page-subtitle">Add or update projects, meeting memos, issues, action items, and KPI readings</div>
          </div>
        </div>

        {message && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              marginBottom: 20,
              background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
              color: message.type === 'success' ? '#15803d' : '#dc2626',
              border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {message.type === 'success' ? '✅ ' : '❌ '}
            {message.text}
          </div>
        )}

        {/* TABS */}
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'project' ? 'active' : ''}`} onClick={() => setActiveTab('project')}>
            🏢 New Project
          </button>
          <button className={`tab-btn ${activeTab === 'memo' ? 'active' : ''}`} onClick={() => setActiveTab('memo')}>
            📝 New Meeting Memo
          </button>
          <button className={`tab-btn ${activeTab === 'issue' ? 'active' : ''}`} onClick={() => setActiveTab('issue')}>
            ⚠️ Log Issue / Risk
          </button>
          <button className={`tab-btn ${activeTab === 'action' ? 'active' : ''}`} onClick={() => setActiveTab('action')}>
            ✅ Add Action Item
          </button>
          <button className={`tab-btn ${activeTab === 'kpi' ? 'active' : ''}`} onClick={() => setActiveTab('kpi')}>
            📊 Record KPI
          </button>
          <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            👥 User Access & Rights
          </button>
        </div>

        <div className="card animate-in">
          <div className="card-body">
            {/* ── CREATE PROJECT ─────────────────────────────────── */}
            {activeTab === 'project' && (
              <form onSubmit={submitProject}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Division *</label>
                    <select
                      className="form-select"
                      required
                      value={projectForm.divisionId}
                      onChange={(e) => setProjectForm({ ...projectForm, divisionId: e.target.value })}
                    >
                      {divisions.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Project Code *</label>
                    <input
                      className="form-input"
                      placeholder="e.g. OPV-013"
                      required
                      value={projectForm.code}
                      onChange={(e) => setProjectForm({ ...projectForm, code: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Project Name *</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Rayong Phase 2 Solar"
                      required
                      value={projectForm.name}
                      onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Rayong"
                      value={projectForm.location}
                      onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Capacity (MW)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      placeholder="e.g. 45.5"
                      value={projectForm.capacityMw}
                      onChange={(e) => setProjectForm({ ...projectForm, capacityMw: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">RAG Status *</label>
                    <select
                      className="form-select"
                      value={projectForm.statusRag}
                      onChange={(e) => setProjectForm({ ...projectForm, statusRag: e.target.value })}
                    >
                      <option value="Green">🟢 Green — On Track</option>
                      <option value="Yellow">🟡 Yellow — At Risk</option>
                      <option value="Red">🔴 Red — Critical</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">% Complete (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-input"
                      value={projectForm.percentComplete}
                      onChange={(e) => setProjectForm({ ...projectForm, percentComplete: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Phase</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Construction / COD Operations"
                      value={projectForm.currentPhase}
                      onChange={(e) => setProjectForm({ ...projectForm, currentPhase: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Next Milestone</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Protection Relay Testing"
                      value={projectForm.nextMilestone}
                      onChange={(e) => setProjectForm({ ...projectForm, nextMilestone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Next Milestone Due Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={projectForm.nextMilestoneDate}
                      onChange={(e) => setProjectForm({ ...projectForm, nextMilestoneDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <input
                    type="checkbox"
                    id="needsVp"
                    checked={projectForm.needsVpAttention}
                    onChange={(e) => setProjectForm({ ...projectForm, needsVpAttention: e.target.checked })}
                  />
                  <label htmlFor="needsVp" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                    🚨 Flag for VP Attention
                  </label>
                </div>

                <div style={{ marginTop: 24 }}>
                  <button type="submit" className="btn btn-primary btn-lg">Create Project</button>
                </div>
              </form>
            )}

            {/* ── CREATE MEMO ──────────────────────────────────── */}
            {activeTab === 'memo' && (
              <form onSubmit={submitMemo}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Project *</label>
                    <select
                      className="form-select"
                      required
                      value={memoForm.projectId}
                      onChange={(e) => setMemoForm({ ...memoForm, projectId: e.target.value })}
                    >
                      {projects.map((p: any) => (
                        <option key={p.id} value={p.id}>[{p.division?.code}] {p.code} — {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Meeting Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={memoForm.meetingDate}
                      onChange={(e) => setMemoForm({ ...memoForm, meetingDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Meeting Title *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Monthly O&M Progress Review — Aug 2026"
                    required
                    value={memoForm.title}
                    onChange={(e) => setMemoForm({ ...memoForm, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Attendees (comma separated)</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Somchai P. (Lead), Site Manager, EPC Rep"
                    value={memoForm.attendees}
                    onChange={(e) => setMemoForm({ ...memoForm, attendees: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discussion Summary *</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Key discussion points, updates, performance findings..."
                    required
                    value={memoForm.summary}
                    onChange={(e) => setMemoForm({ ...memoForm, summary: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Key Decisions</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Formal decisions made during the meeting..."
                    value={memoForm.decisions}
                    onChange={(e) => setMemoForm({ ...memoForm, decisions: e.target.value })}
                  />
                </div>
                <div style={{ marginTop: 24 }}>
                  <button type="submit" className="btn btn-primary btn-lg">Save Meeting Memo</button>
                </div>
              </form>
            )}

            {/* ── LOG ISSUE ────────────────────────────────────── */}
            {activeTab === 'issue' && (
              <form onSubmit={submitIssue}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Project *</label>
                    <select
                      className="form-select"
                      required
                      value={issueForm.projectId}
                      onChange={(e) => setIssueForm({ ...issueForm, projectId: e.target.value })}
                    >
                      {projects.map((p: any) => (
                        <option key={p.id} value={p.id}>[{p.division?.code}] {p.code} — {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Severity *</label>
                    <select
                      className="form-select"
                      value={issueForm.severity}
                      onChange={(e) => setIssueForm({ ...issueForm, severity: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Med">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Issue Title *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Transformer delivery delayed by 3 weeks"
                    required
                    value={issueForm.title}
                    onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Detailed Description</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Impact, root cause, and current mitigation steps..."
                    value={issueForm.description}
                    onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Owner / Responsible Person</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Site PM / Procurement Lead"
                    value={issueForm.owner}
                    onChange={(e) => setIssueForm({ ...issueForm, owner: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    id="issueVp"
                    checked={issueForm.needsVpAttention}
                    onChange={(e) => setIssueForm({ ...issueForm, needsVpAttention: e.target.checked })}
                  />
                  <label htmlFor="issueVp" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                    🚨 Needs VP Attention
                  </label>
                </div>
                <div style={{ marginTop: 24 }}>
                  <button type="submit" className="btn btn-primary btn-lg">Log Issue</button>
                </div>
              </form>
            )}

            {/* ── ADD ACTION ITEM ───────────────────────────────── */}
            {activeTab === 'action' && (
              <form onSubmit={submitAction}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Project *</label>
                    <select
                      className="form-select"
                      required
                      value={actionForm.projectId}
                      onChange={(e) => setActionForm({ ...actionForm, projectId: e.target.value })}
                    >
                      {projects.map((p: any) => (
                        <option key={p.id} value={p.id}>[{p.division?.code}] {p.code} — {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Owner *</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Krit Siriwat"
                      required
                      value={actionForm.owner}
                      onChange={(e) => setActionForm({ ...actionForm, owner: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={actionForm.dueDate}
                      onChange={(e) => setActionForm({ ...actionForm, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status *</label>
                    <select
                      className="form-select"
                      value={actionForm.status}
                      onChange={(e) => setActionForm({ ...actionForm, status: e.target.value })}
                    >
                      <option value="Open">Open</option>
                      <option value="In-progress">In-progress</option>
                      <option value="Done">Done</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Action Description *</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Specific actionable task to be completed..."
                    required
                    value={actionForm.description}
                    onChange={(e) => setActionForm({ ...actionForm, description: e.target.value })}
                  />
                </div>
                <div style={{ marginTop: 24 }}>
                  <button type="submit" className="btn btn-primary btn-lg">Add Action Item</button>
                </div>
              </form>
            )}

            {/* ── RECORD KPI ────────────────────────────────────── */}
            {activeTab === 'kpi' && (
              <form onSubmit={submitKpiReading}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Project *</label>
                    <select
                      className="form-select"
                      required
                      value={kpiReadingForm.projectId}
                      onChange={(e) => setKpiReadingForm({ ...kpiReadingForm, projectId: e.target.value })}
                    >
                      {projects.map((p: any) => (
                        <option key={p.id} value={p.id}>[{p.division?.code}] {p.code} — {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">KPI Indicator *</label>
                    <select
                      className="form-select"
                      required
                      value={kpiReadingForm.kpiId}
                      onChange={(e) => setKpiReadingForm({ ...kpiReadingForm, kpiId: e.target.value })}
                    >
                      {projectKpis.length === 0 ? (
                        <option value="">No KPIs defined for this project</option>
                      ) : (
                        projectKpis.map((k: any) => (
                          <option key={k.id} value={k.id}>{k.name} ({k.unit}) — Target: {k.target ?? 'N/A'}</option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Period (e.g. 2026-08) *</label>
                    <input
                      className="form-input"
                      placeholder="YYYY-MM"
                      required
                      value={kpiReadingForm.period}
                      onChange={(e) => setKpiReadingForm({ ...kpiReadingForm, period: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Actual Value *</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      placeholder="Numerical reading"
                      required
                      value={kpiReadingForm.actualValue}
                      onChange={(e) => setKpiReadingForm({ ...kpiReadingForm, actualValue: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 24 }}>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={!kpiReadingForm.kpiId}>
                    Record KPI Reading
                  </button>
                </div>
              </form>
            )}

            {/* ── USER ACCESS & RIGHTS ─────────────────────────────── */}
            {activeTab === 'users' && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--gray-800)' }}>
                  ➕ Add New User Account & Assign Rights
                </h3>
                <form onSubmit={submitUser} style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">User Name *</label>
                      <input
                        className="form-input"
                        placeholder="e.g. Sron Sreypich"
                        required
                        value={userForm.name}
                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Password *</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="Set account password"
                        required
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Access Right / Role *</label>
                      <select
                        className="form-select"
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                      >
                        <option value="Viewer">Viewer (Read-Only Access)</option>
                        <option value="Editor">Editor (Data Entry & Updates)</option>
                        <option value="Admin">Admin (Full Control & User Rights)</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <button type="submit" className="btn btn-primary btn-md">
                      ➕ Add User & Grant Access
                    </button>
                  </div>
                </form>

                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--gray-800)' }}>
                  📋 User Directory & Access Rights ({users.length})
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>User Name</th>
                        <th>Access Role</th>
                        <th>Created Date</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)' }}>
                            No users registered yet.
                          </td>
                        </tr>
                      ) : (
                        users.map((u: any) => (
                          <tr key={u.id}>
                            <td style={{ fontWeight: 700, color: 'var(--gray-800)' }}>
                              👤 {u.name}
                            </td>
                            <td>
                              <select
                                className="form-select"
                                value={u.role}
                                onChange={(e) => updateUserRole(u.id, e.target.value)}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  width: 'auto',
                                  borderRadius: 6,
                                  background: u.role === 'Admin' ? '#fef3c7' : u.role === 'Editor' ? '#dbeafe' : '#f1f5f9',
                                  color: u.role === 'Admin' ? '#92400e' : u.role === 'Editor' ? '#1e40af' : '#475569',
                                  border: '1px solid var(--border)',
                                }}
                              >
                                <option value="Viewer">Viewer</option>
                                <option value="Editor">Editor</option>
                                <option value="Admin">Admin</option>
                              </select>
                            </td>
                            <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => deleteUser(u.id, u.name)}
                                style={{ color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }}
                              >
                                🗑️ Remove Access
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Loading…</div>}>
      <AdminContent />
    </Suspense>
  )
}
