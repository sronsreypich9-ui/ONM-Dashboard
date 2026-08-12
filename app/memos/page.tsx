'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import editor to avoid SSR issues
const RichEditor = dynamic(
  () => import('@/components/RichEditor').then((m) => m.RichEditor),
  { ssr: false, loading: () => <div style={{ padding: 32, color: '#94a3b8' }}>Loading editor…</div> }
)

// ─── Types ────────────────────────────────────────────────────────────────────
interface Division { id: number; code: string; name: string; colorHex: string }
interface Project  { id: number; name: string; code: string; divisionId: number; division: Division }
interface Meeting {
  id: number; projectId?: number | null; divisionId?: number | null
  title: string; meetingDate: string
  attendees: string; summary: string; decisions?: string
  content?: string; tags?: string; source: string; createdBy?: string
  actionItems: any[]
  project?: Project | null
  division?: Division | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtDateInput(iso: string) {
  return new Date(iso).toISOString().slice(0, 10)
}
function parseAttendees(raw: string): string[] {
  try { return JSON.parse(raw) } catch { return raw.split(',').map((s) => s.trim()).filter(Boolean) }
}

// ─── New Meeting Modal ────────────────────────────────────────────────────────
function NewMemoModal({
  projects, divisions, onClose, onCreate,
}: {
  projects: Project[]
  divisions: Division[]
  onClose: () => void
  onCreate: (m: Meeting) => void
}) {
  const [scope, setScope]         = useState<string>('general') // 'general', 'div-X', 'proj-Y'
  const [title, setTitle]         = useState('')
  const [date, setDate]           = useState(new Date().toISOString().slice(0, 10))
  const [attendees, setAttendees] = useState('')
  const [saving, setSaving]       = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    const attendeeArr = attendees.split(',').map((s) => s.trim()).filter(Boolean)

    let projectId: number | null = null
    let divisionId: number | null = null

    if (scope.startsWith('proj-')) {
      projectId = Number(scope.replace('proj-', ''))
      const p = projects.find((x) => x.id === projectId)
      if (p) divisionId = p.divisionId
    } else if (scope.startsWith('div-')) {
      divisionId = Number(scope.replace('div-', ''))
    }

    const res = await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        divisionId,
        title:       title.trim(),
        meetingDate: new Date(date).toISOString(),
        attendees:   JSON.stringify(attendeeArr),
        summary:     '',
        content:     '',
        source:      'manual',
      }),
    })
    const m = await res.json()
    const full = await fetch(`/api/meetings/${m.id}`).then((r) => r.json())
    onCreate(full)
    setSaving(false)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 300, backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 16, padding: '32px 36px',
          width: 500, boxShadow: '0 24px 60px rgba(0,0,0,.2)',
          animation: 'fadeInUp .25s ease',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 24, fontFamily: "'Outfit', sans-serif" }}>
          📝 New Meeting Note
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Target / Scope (Optional Project Link)</label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            style={{ ...inputStyle, fontWeight: 600 }}
          >
            <option value="general">📌 General VP Note (Unassigned / Strategic)</option>
            {divisions.map((d) => (
              <optgroup key={d.id} label={`🏢 Division: ${d.name} (${d.code})`}>
                <option value={`div-${d.id}`}>🌐 [{d.code}] General Division Note</option>
                {projects.filter((p) => p.divisionId === d.id).map((p) => (
                  <option key={p.id} value={`proj-${p.id}`}>📁 {p.code} — {p.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
            Notes do not need to be tied to a specific project. Select General for strategy or executive memos.
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Meeting Title</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q3 Strategic Review / Executive Meeting"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Attendees (comma-separated)</label>
            <input
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="VP, Somchai, Alice..."
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
          <button type="button" onClick={onClose} style={btnSecondaryStyle}>Cancel</button>
          <button type="submit" disabled={saving} style={btnPrimaryStyle}>
            {saving ? 'Creating…' : '✨ Create Note'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Styles helpers ───────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b',
  marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.6px',
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', border: '1.5px solid #e2e8f0',
  borderRadius: 8, fontSize: 13.5, color: '#0f172a', background: '#f8fafc',
  outline: 'none', boxSizing: 'border-box',
}
const btnPrimaryStyle: React.CSSProperties = {
  padding: '9px 20px', background: 'linear-gradient(135deg,#0f766e,#0284c7)',
  color: 'white', border: 'none', borderRadius: 8, fontSize: 13,
  fontWeight: 700, cursor: 'pointer',
}
const btnSecondaryStyle: React.CSSProperties = {
  padding: '9px 16px', background: 'white', color: '#475569',
  border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13,
  fontWeight: 600, cursor: 'pointer',
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NotebookPage() {
  const [projects,      setProjects]      = useState<Project[]>([])
  const [divisions,     setDivisions]     = useState<Division[]>([])
  const [meetings,      setMeetings]      = useState<Meeting[]>([])
  const [selScope,      setSelScope]      = useState<string>('general') // 'general', 'all', 'div-X', 'proj-Y'
  const [selMeetingId,  setSelMeetingId]  = useState<number | null>(null)
  const [expandedDivs,  setExpandedDivs]  = useState<Set<number>>(new Set())
  const [showNewModal,  setShowNewModal]  = useState(false)
  const [search,        setSearch]        = useState('')
  const [saving,        setSaving]        = useState<'idle' | 'saving' | 'saved'>('idle')
  const [editTitle,     setEditTitle]     = useState(false)
  const [editAttendees, setEditAttendees] = useState(false)
  const [editDate,      setEditDate]      = useState(false)
  const [tags,          setTags]          = useState('')
  const [editTags,      setEditTags]      = useState(false)
  const [loadingMemos,  setLoadingMemos]  = useState(false)

  // local draft of the active memo (for optimistic updates)
  const [draft, setDraft] = useState<Partial<Meeting>>({})
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load divisions and projects
  useEffect(() => {
    Promise.all([
      fetch('/api/divisions').then((r) => r.json()),
      fetch('/api/projects').then((r) => r.json()),
    ]).then(([divs, projs]) => {
      setDivisions(divs)
      setProjects(projs)
      if (divs.length) {
        setExpandedDivs(new Set(divs.map((d: any) => d.id)))
      }
    })
  }, [])

  // Load meetings for selected scope
  useEffect(() => {
    setLoadingMemos(true)
    let url = '/api/meetings'
    if (selScope === 'general') {
      url += '?general=true'
    } else if (selScope.startsWith('div-')) {
      url += `?divisionId=${selScope.replace('div-', '')}`
    } else if (selScope.startsWith('proj-')) {
      url += `?projectId=${selScope.replace('proj-', '')}`
    }

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setMeetings(data)
        setLoadingMemos(false)
        if (data.length > 0) {
          setSelMeetingId(data[0].id)
          setDraft(data[0])
          setTags(data[0].tags || '')
        } else {
          setSelMeetingId(null)
          setDraft({})
        }
      })
  }, [selScope])

  // Update draft when meeting selection changes
  useEffect(() => {
    if (!selMeetingId) return
    const m = meetings.find((x) => x.id === selMeetingId)
    if (m) { setDraft(m); setTags(m.tags || '') }
  }, [selMeetingId])

  // Auto-save with 1.5s debounce
  const scheduleAutoSave = useCallback((patch: Partial<Meeting>) => {
    if (!selMeetingId) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaving('saving')
    saveTimer.current = setTimeout(async () => {
      try {
        await fetch(`/api/meetings/${selMeetingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        })
        setSaving('saved')
        setTimeout(() => setSaving('idle'), 2000)
        // Refresh list silently
        let url = '/api/meetings'
        if (selScope === 'general') url += '?general=true'
        else if (selScope.startsWith('div-')) url += `?divisionId=${selScope.replace('div-', '')}`
        else if (selScope.startsWith('proj-')) url += `?projectId=${selScope.replace('proj-', '')}`

        fetch(url).then((r) => r.json()).then(setMeetings)
      } catch { setSaving('idle') }
    }, 1500)
  }, [selMeetingId, selScope])

  function patchDraft(patch: Partial<Meeting>) {
    setDraft((d) => ({ ...d, ...patch }))
    scheduleAutoSave(patch)
  }

  async function deleteMeeting(id: number) {
    if (!confirm('Delete this meeting note?')) return
    await fetch(`/api/meetings/${id}`, { method: 'DELETE' })
    const updated = meetings.filter((m) => m.id !== id)
    setMeetings(updated)
    if (selMeetingId === id) {
      setSelMeetingId(updated[0]?.id ?? null)
      setDraft(updated[0] ?? {})
    }
  }

  function handleMeetingCreated(m: Meeting) {
    setMeetings((prev) => [m, ...prev])
    if (m.projectId) {
      setSelScope(`proj-${m.projectId}`)
    } else if (m.divisionId) {
      setSelScope(`div-${m.divisionId}`)
    } else {
      setSelScope('general')
    }
    setSelMeetingId(m.id)
    setDraft(m)
  }

  // Filtered meetings for search
  const filteredMeetings = meetings.filter((m) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      m.title.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      (m.content || '').toLowerCase().includes(q) ||
      (m.decisions || '').toLowerCase().includes(q)
    )
  })

  // Global search across all meetings
  const [globalSearch, setGlobalSearch] = useState('')
  const [globalResults, setGlobalResults] = useState<Meeting[]>([])
  const [globalSearching, setGlobalSearching] = useState(false)

  useEffect(() => {
    if (!globalSearch.trim()) { setGlobalResults([]); return }
    setGlobalSearching(true)
    const t = setTimeout(() => {
      fetch(`/api/meetings?q=${encodeURIComponent(globalSearch)}`)
        .then((r) => r.json())
        .then((d) => { setGlobalResults(d); setGlobalSearching(false) })
    }, 400)
    return () => clearTimeout(t)
  }, [globalSearch])

  const activeMeeting = meetings.find((m) => m.id === selMeetingId)

  // Scope label for header
  let scopeLabel = 'General VP Notes'
  if (selScope === 'all') scopeLabel = 'All Notes'
  else if (selScope.startsWith('div-')) {
    const div = divisions.find((d) => d.id === Number(selScope.replace('div-', '')))
    if (div) scopeLabel = `${div.code} — Division Notes`
  } else if (selScope.startsWith('proj-')) {
    const proj = projects.find((p) => p.id === Number(selScope.replace('proj-', '')))
    if (proj) scopeLabel = `${proj.code} — ${proj.name}`
  }

  // Group projects by division
  const projectsByDiv = divisions.map((div) => ({
    div,
    projects: projects.filter((p) => p.divisionId === div.id),
  }))

  return (
    <>
      {/* ─── TOPBAR ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'white', borderBottom: '1px solid #e2e8f0',
        padding: '0 20px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50, gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit',sans-serif" }}>
            📒 Notebooks
          </div>
          {/* Global search */}
          <div style={{ position: 'relative' }}>
            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search all notes…"
              style={{
                padding: '6px 12px 6px 34px', border: '1.5px solid #e2e8f0',
                borderRadius: 20, fontSize: 13, width: 240, outline: 'none',
                background: '#f8fafc',
              }}
            />
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
            {/* Global results dropdown */}
            {globalSearch && (
              <div style={{
                position: 'absolute', top: 38, left: 0, right: 0, minWidth: 320,
                background: 'white', border: '1px solid #e2e8f0', borderRadius: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,.10)', zIndex: 200, overflow: 'hidden',
              }}>
                {globalSearching && <div style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 13 }}>Searching…</div>}
                {!globalSearching && globalResults.length === 0 && (
                  <div style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 13 }}>No results</div>
                )}
                {globalResults.slice(0, 8).map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      if (m.projectId) setSelScope(`proj-${m.projectId}`)
                      else if (m.divisionId) setSelScope(`div-${m.divisionId}`)
                      else setSelScope('general')

                      setTimeout(() => { setSelMeetingId(m.id); setDraft(m) }, 200)
                      setGlobalSearch('')
                    }}
                    style={{
                      padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                  >
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{m.title}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      {m.project ? `${m.project.division?.code} · ${m.project.name}` : m.division ? `[${m.division.code}] Division Note` : '📌 General Note'} · {fmtDate(m.meetingDate)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Auto-save indicator */}
          {saving === 'saving' && (
            <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', animation: 'pulse 1s infinite' }} />
              Saving…
            </span>
          )}
          {saving === 'saved' && (
            <span style={{ fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
              ✓ Saved
            </span>
          )}
          <button
            onClick={() => setShowNewModal(true)}
            style={{
              padding: '7px 16px', background: 'linear-gradient(135deg,#0f766e,#0284c7)',
              color: 'white', border: 'none', borderRadius: 8, fontSize: 13,
              fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            + New Note
          </button>
        </div>
      </div>

      {/* ─── THREE-PANEL LAYOUT ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

        {/* ── Panel 1: Notebook Navigator (General / Division / Project tree) ─ */}
        <div style={{
          width: 230, flexShrink: 0, borderRight: '1px solid #e2e8f0',
          overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '12px 12px 4px', fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Notebook Sections
          </div>

          {/* General Notes Top Section */}
          <button
            onClick={() => setSelScope('general')}
            style={{
              width: '100%', background: selScope === 'general' ? '#e0f2fe' : 'none',
              border: 'none', borderLeft: selScope === 'general' ? '3px solid #0f766e' : '3px solid transparent',
              cursor: 'pointer', padding: '9px 12px',
              display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left',
              margin: '2px 0', transition: 'background 0.1s',
            }}
            onMouseEnter={(e) => { if (selScope !== 'general') e.currentTarget.style.background = '#f1f5f9' }}
            onMouseLeave={(e) => { if (selScope !== 'general') e.currentTarget.style.background = 'none' }}
          >
            <span style={{ fontSize: 14 }}>📌</span>
            <span style={{ fontSize: 12, fontWeight: selScope === 'general' ? 700 : 600, color: selScope === 'general' ? '#0f172a' : '#334155' }}>
              General VP Notes
            </span>
          </button>

          {/* All Notes Section */}
          <button
            onClick={() => setSelScope('all')}
            style={{
              width: '100%', background: selScope === 'all' ? '#e0f2fe' : 'none',
              border: 'none', borderLeft: selScope === 'all' ? '3px solid #0284c7' : '3px solid transparent',
              cursor: 'pointer', padding: '8px 12px',
              display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left',
              margin: '2px 0 8px', transition: 'background 0.1s',
            }}
            onMouseEnter={(e) => { if (selScope !== 'all') e.currentTarget.style.background = '#f1f5f9' }}
            onMouseLeave={(e) => { if (selScope !== 'all') e.currentTarget.style.background = 'none' }}
          >
            <span style={{ fontSize: 14 }}>🌐</span>
            <span style={{ fontSize: 12, fontWeight: selScope === 'all' ? 700 : 600, color: selScope === 'all' ? '#0f172a' : '#334155' }}>
              All Meeting Notes
            </span>
          </button>

          <div style={{ height: 1, background: '#e2e8f0', margin: '4px 12px 8px' }} />

          <div style={{ padding: '4px 12px 4px', fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Divisions & Projects
          </div>

          {projectsByDiv.map(({ div, projects: divProjs }) => (
            <div key={div.id}>
              {/* Division header */}
              <button
                onClick={() => {
                  setSelScope(`div-${div.id}`)
                  setExpandedDivs((s) => new Set(s).add(div.id))
                }}
                style={{
                  width: '100%', background: selScope === `div-${div.id}` ? '#f0fdf4' : 'none',
                  border: 'none', borderLeft: selScope === `div-${div.id}` ? `3px solid ${div.colorHex}` : '3px solid transparent',
                  cursor: 'pointer', padding: '8px 12px',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 12, fontWeight: 700, color: '#334155', textAlign: 'left',
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: 5, background: div.colorHex,
                  color: 'white', fontSize: 9, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{div.code}</span>
                <span style={{ flex: 1, fontSize: 11.5, fontWeight: 700 }}>{div.code}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpandedDivs((s) => {
                      const n = new Set(s)
                      n.has(div.id) ? n.delete(div.id) : n.add(div.id)
                      return n
                    })
                  }}
                  style={{
                    fontSize: 9, color: '#94a3b8', padding: '2px 4px',
                    transform: expandedDivs.has(div.id) ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.15s',
                  }}
                >▶</span>
              </button>
              {/* Projects under division */}
              {expandedDivs.has(div.id) && divProjs.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelScope(`proj-${p.id}`)}
                  style={{
                    width: '100%', background: selScope === `proj-${p.id}` ? '#e0f2fe' : 'none',
                    border: 'none', borderLeft: selScope === `proj-${p.id}` ? `3px solid ${div.colorHex}` : '3px solid transparent',
                    cursor: 'pointer', padding: '7px 12px 7px 26px',
                    display: 'flex', alignItems: 'flex-start', gap: 6, textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => { if (selScope !== `proj-${p.id}`) e.currentTarget.style.background = '#f1f5f9' }}
                  onMouseLeave={(e) => { if (selScope !== `proj-${p.id}`) e.currentTarget.style.background = 'none' }}
                >
                  <span style={{ fontSize: 12, marginTop: 1 }}>📁</span>
                  <span style={{ fontSize: 11.5, fontWeight: selScope === `proj-${p.id}` ? 700 : 500, color: selScope === `proj-${p.id}` ? '#0f172a' : '#475569', lineHeight: 1.3 }}>
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* ── Panel 2: Page list (Meetings for selected scope) ───────────── */}
        <div style={{
          width: 250, flexShrink: 0, borderRight: '1px solid #e2e8f0',
          overflowY: 'auto', background: '#ffffff', display: 'flex', flexDirection: 'column',
        }}>
          {/* Section header */}
          <div style={{
            padding: '12px 14px 8px', borderBottom: '1px solid #f1f5f9',
            position: 'sticky', top: 0, background: 'white', zIndex: 1,
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
              {scopeLabel}
            </div>
            {/* Section search */}
            <div style={{ position: 'relative' }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter notes…"
                style={{ ...inputStyle, fontSize: 11.5, padding: '5px 8px 5px 26px' }}
              />
              <span style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', fontSize: 11, opacity: 0.4 }}>🔍</span>
            </div>
          </div>

          {/* Meeting pages list */}
          <div style={{ flex: 1 }}>
            {loadingMemos && <div style={{ padding: '20px 14px', color: '#94a3b8', fontSize: 12 }}>Loading…</div>}
            {!loadingMemos && filteredMeetings.length === 0 && (
              <div style={{ padding: '24px 14px', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
                {selScope ? 'No meeting notes yet.\nClick "+ New Note".' : 'Select a notebook section.'}
              </div>
            )}
            {filteredMeetings.map((m) => {
              const isActive = m.id === selMeetingId
              return (
                <div
                  key={m.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    borderLeft: isActive ? '3px solid #0f766e' : '3px solid transparent',
                    background: isActive ? '#f0fdfa' : 'white',
                    cursor: 'pointer', padding: '10px 12px',
                    transition: 'background 0.1s',
                    position: 'relative',
                  }}
                  onClick={() => { setSelMeetingId(m.id); setDraft(m); setTags(m.tags || '') }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#f8fafc' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'white' }}
                >
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3, fontWeight: 500 }}>
                    {fmtDate(m.meetingDate)}
                  </div>
                  <div style={{
                    fontSize: 12.5, fontWeight: isActive ? 700 : 600, color: '#0f172a',
                    lineHeight: 1.3, marginBottom: 4,
                  }}>
                    {m.title}
                  </div>
                  {m.tags && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 3 }}>
                      {m.tags.split(',').filter(Boolean).map((t, i) => (
                        <span key={i} style={{
                          fontSize: 9.5, padding: '1px 6px', borderRadius: 10,
                          background: '#f0f9ff', color: '#0369a1', fontWeight: 600,
                        }}>{t.trim()}</span>
                      ))}
                    </div>
                  )}
                  {/* Action count */}
                  {m.actionItems?.length > 0 && (
                    <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700 }}>
                      ☑ {m.actionItems.length} action{m.actionItems.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Panel 3: Note Content Editor ─────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
          {!activeMeeting ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', color: '#94a3b8',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>📒</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Select a meeting note</div>
              <div style={{ fontSize: 13, marginTop: 8 }}>or click "+ New Note" to create one</div>
            </div>
          ) : (
            <>
              {/* Note Header */}
              <div style={{
                padding: '20px 36px 12px', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
              }}>
                {/* Title — inline editable */}
                {editTitle ? (
                  <input
                    autoFocus
                    defaultValue={draft.title || activeMeeting.title}
                    style={{
                      fontSize: 24, fontWeight: 800, color: '#0f172a',
                      border: 'none', outline: 'none', width: '100%',
                      background: 'transparent', fontFamily: "'Outfit', sans-serif",
                      borderBottom: '2px solid #0f766e', paddingBottom: 2,
                    }}
                    onBlur={(e) => {
                      setEditTitle(false)
                      const v = e.target.value.trim()
                      if (v && v !== activeMeeting.title) patchDraft({ title: v } as any)
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as any).blur() }}
                  />
                ) : (
                  <div
                    onClick={() => setEditTitle(true)}
                    style={{
                      fontSize: 24, fontWeight: 800, color: '#0f172a',
                      cursor: 'text', fontFamily: "'Outfit', sans-serif",
                      borderBottom: '2px solid transparent',
                      padding: '0 0 2px',
                      transition: 'border-color 0.15s',
                    }}
                    title="Click to edit title"
                    onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = '#e2e8f0')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
                  >
                    {draft.title || activeMeeting.title}
                  </div>
                )}

                {/* Metadata row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
                  {/* Date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>📅</span>
                    {editDate ? (
                      <input
                        autoFocus
                        type="date"
                        defaultValue={fmtDateInput(draft.meetingDate || activeMeeting.meetingDate)}
                        style={{ ...inputStyle, fontSize: 12, width: 140, padding: '3px 6px' }}
                        onBlur={(e) => {
                          setEditDate(false)
                          patchDraft({ meetingDate: new Date(e.target.value).toISOString() } as any)
                        }}
                      />
                    ) : (
                      <span
                        onClick={() => setEditDate(true)}
                        style={{ fontSize: 13, color: '#475569', cursor: 'pointer', fontWeight: 500 }}
                        title="Click to change date"
                      >
                        {fmtDate(draft.meetingDate || activeMeeting.meetingDate)}
                      </span>
                    )}
                  </div>

                  <span style={{ color: '#e2e8f0' }}>|</span>

                  {/* Attendees */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>👥</span>
                    {editAttendees ? (
                      <input
                        autoFocus
                        defaultValue={parseAttendees(draft.attendees || activeMeeting.attendees).join(', ')}
                        placeholder="Alice, Bob, Carol…"
                        style={{ ...inputStyle, fontSize: 12, width: 220, padding: '3px 6px' }}
                        onBlur={(e) => {
                          setEditAttendees(false)
                          const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                          patchDraft({ attendees: JSON.stringify(arr) } as any)
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as any).blur() }}
                      />
                    ) : (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', cursor: 'pointer' }} onClick={() => setEditAttendees(true)} title="Click to edit attendees">
                        {parseAttendees(draft.attendees || activeMeeting.attendees).map((att, i) => (
                          <span key={i} style={{
                            fontSize: 11.5, padding: '2px 8px', borderRadius: 20,
                            background: '#f0f9ff', color: '#0369a1', fontWeight: 600,
                          }}>{att}</span>
                        ))}
                        {parseAttendees(draft.attendees || activeMeeting.attendees).length === 0 && (
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>Add attendees…</span>
                        )}
                      </div>
                    )}
                  </div>

                  <span style={{ color: '#e2e8f0' }}>|</span>

                  {/* Tags */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>🏷</span>
                    {editTags ? (
                      <input
                        autoFocus
                        defaultValue={tags}
                        placeholder="decision, risk, follow-up…"
                        style={{ ...inputStyle, fontSize: 12, width: 200, padding: '3px 6px' }}
                        onBlur={(e) => {
                          setEditTags(false)
                          const v = e.target.value
                          setTags(v)
                          patchDraft({ tags: v } as any)
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as any).blur() }}
                      />
                    ) : (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', cursor: 'pointer' }} onClick={() => setEditTags(true)} title="Click to edit tags">
                        {tags.split(',').filter(Boolean).map((t, i) => (
                          <span key={i} style={{
                            fontSize: 11, padding: '2px 7px', borderRadius: 10,
                            background: '#fdf4ff', color: '#7c3aed', fontWeight: 700,
                          }}>{t.trim()}</span>
                        ))}
                        {!tags && <span style={{ fontSize: 12, color: '#94a3b8' }}>Add tags…</span>}
                      </div>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteMeeting(activeMeeting.id)}
                    style={{
                      marginLeft: 'auto', padding: '4px 10px', background: 'none',
                      border: '1px solid #fecaca', borderRadius: 6, color: '#ef4444',
                      fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                    }}
                    title="Delete this note"
                  >🗑 Delete</button>
                </div>

                {/* Scope breadcrumb */}
                <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8' }}>
                  {activeMeeting.project ? (
                    <>
                      <span style={{ fontWeight: 600, color: activeMeeting.project.division?.colorHex || '#0f766e' }}>
                        {activeMeeting.project.division?.code}
                      </span>
                      {' › '}
                      <span>{activeMeeting.project.name}</span>
                    </>
                  ) : activeMeeting.division ? (
                    <>
                      <span style={{ fontWeight: 600, color: activeMeeting.division.colorHex || '#0f766e' }}>
                        {activeMeeting.division.code}
                      </span>
                      {' › '}
                      <span>General Division Note</span>
                    </>
                  ) : (
                    <span>📌 General VP Note (Unassigned)</span>
                  )}
                </div>
              </div>

              {/* Rich Text Editor */}
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <RichEditor
                  content={draft.content || activeMeeting.content || buildLegacyContent(activeMeeting)}
                  onChange={(html) => patchDraft({ content: html } as any)}
                  placeholder="Start writing your meeting notes… Use headings, bullet points, checkboxes for action items."
                />
              </div>

              {/* Action Items panel at the bottom */}
              {activeMeeting.actionItems && activeMeeting.actionItems.length > 0 && (
                <div style={{
                  borderTop: '1px solid #f1f5f9', padding: '10px 36px',
                  background: '#fffbeb', flexShrink: 0,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ☑ Action Items ({activeMeeting.actionItems.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {activeMeeting.actionItems.map((ai: any) => (
                      <span key={ai.id} style={{
                        fontSize: 11.5, padding: '3px 10px', borderRadius: 6,
                        background: ai.status === 'Done' ? '#f0fdf4' : '#fff7ed',
                        border: `1px solid ${ai.status === 'Done' ? '#bbf7d0' : '#fed7aa'}`,
                        color: ai.status === 'Done' ? '#15803d' : '#c2410c',
                        fontWeight: 600,
                      }}>
                        {ai.status === 'Done' ? '✅' : '⏳'} {ai.description} — {ai.owner}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showNewModal && (
        <NewMemoModal
          projects={projects}
          divisions={divisions}
          onClose={() => setShowNewModal(false)}
          onCreate={handleMeetingCreated}
        />
      )}

      <style>{`
        /* Tiptap editor styles */
        .ProseMirror {
          padding: 24px 36px;
          min-height: 400px;
          outline: none;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14.5px;
          line-height: 1.8;
          color: #1e293b;
        }
        .ProseMirror h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 20px 0 10px; font-family: 'Outfit', sans-serif; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px; }
        .ProseMirror h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 18px 0 8px; font-family: 'Outfit', sans-serif; }
        .ProseMirror h3 { font-size: 15px; font-weight: 700; color: #334155; margin: 14px 0 6px; }
        .ProseMirror p  { margin: 0 0 8px; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 22px; margin: 6px 0 10px; }
        .ProseMirror li { margin-bottom: 4px; }
        .ProseMirror blockquote {
          border-left: 4px solid #0f766e; padding: 8px 16px;
          background: #f0fdfa; margin: 12px 0; border-radius: 0 6px 6px 0;
          color: #0f766e; font-style: italic;
        }
        .ProseMirror code { background: #f1f5f9; padding: 2px 5px; border-radius: 4px; font-size: 13px; color: #7c3aed; }
        .ProseMirror pre  { background: #0f172a; color: #e2e8f0; padding: 16px 20px; border-radius: 10px; overflow-x: auto; margin: 12px 0; }
        .ProseMirror pre code { background: none; color: inherit; padding: 0; }
        .ProseMirror mark { background: #fef08a; border-radius: 2px; padding: 0 2px; }
        .ProseMirror hr  { border: none; border-top: 2px solid #e2e8f0; margin: 20px 0; }
        /* Task list */
        .ProseMirror ul[data-type="taskList"] { list-style: none; padding-left: 4px; }
        .ProseMirror ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
        .ProseMirror ul[data-type="taskList"] li > label { flex-shrink: 0; margin-top: 2px; }
        .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"] {
          width: 15px; height: 15px; accent-color: #0f766e; cursor: pointer;
        }
        .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div { text-decoration: line-through; color: #94a3b8; }
        /* Placeholder */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left; color: #cbd5e1; pointer-events: none; height: 0;
          font-style: italic;
        }
        /* Selection */
        .ProseMirror ::selection { background: #bfdbfe; }

        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.4 } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:none } }
      `}</style>
    </>
  )
}

// Build legacy rich content from old summary/decisions fields
function buildLegacyContent(m: Meeting): string {
  if (!m.summary && !m.decisions) return ''
  let html = ''
  if (m.summary) {
    html += `<h2>📋 Meeting Summary</h2><p>${m.summary.replace(/\n/g, '</p><p>')}</p>`
  }
  if (m.decisions) {
    html += `<h2>✅ Decisions Made</h2><p>${m.decisions.replace(/\n/g, '</p><p>')}</p>`
  }
  return html
}
