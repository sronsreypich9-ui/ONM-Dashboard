'use client'

import { useEffect, useState } from 'react'

interface Project {
  id: number
  name: string
  code: string
}

interface Division {
  id: number
  name: string
  code: string
  colorHex: string
}

interface DiscordRecap {
  id: number
  channelName: string
  threadTitle: string
  threadUrl: string | null
  rawMessages: string
  executiveSummary: string
  alertLevel: 'Normal' | 'Attention' | 'Critical'
  detectedIssues: string | null
  actionItems: string | null
  projectId: number | null
  project: Project | null
  division: Division | null
  createdBy: string | null
  createdAt: string
}

export default function DiscordRecapPage() {
  const [recaps, setRecaps] = useState<DiscordRecap[]>([])
  const [selectedRecap, setSelectedRecap] = useState<DiscordRecap | null>(null)
  const [loading, setLoading] = useState(true)
  const [alertFilter, setAlertFilter] = useState<string>('All')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])

  // Modal Form State
  const [formTitle, setFormTitle] = useState('')
  const [formChannel, setFormChannel] = useState('#opv-site-updates')
  const [formTranscript, setFormTranscript] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [actionStatus, setActionStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchRecaps()
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  const fetchRecaps = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/discord-recap')
      const data = await res.json()
      if (Array.isArray(data)) {
        setRecaps(data)
        if (data.length > 0 && !selectedRecap) {
          setSelectedRecap(data[0])
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle || !formTranscript) return
    try {
      setAnalyzing(true)
      const res = await fetch('/api/discord-recap/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadTitle: formTitle,
          channelName: formChannel,
          rawMessages: formTranscript,
        }),
      })
      const newRecap = await res.json()
      if (res.ok) {
        setRecaps((prev) => [newRecap, ...prev])
        setSelectedRecap(newRecap)
        setShowModal(false)
        setFormTitle('')
        setFormTranscript('')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleEscalateIssue = async (issueObj: any) => {
    if (!selectedRecap || !selectedRecap.projectId) {
      alert('Please associate this recap with a project to create an official issue.')
      return
    }
    try {
      setActionStatus('Escalating to Official Project Register…')
      const res = await fetch('/api/discord-recap/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recapId: selectedRecap.id,
          projectId: selectedRecap.projectId,
          issueTitle: issueObj.title,
          severity: issueObj.severity,
          owner: issueObj.owner,
          description: issueObj.description,
          type: 'issue',
        }),
      })
      const result = await res.json()
      if (res.ok) {
        setActionStatus('✅ Created Official Issue & Updated Project Status!')
        setTimeout(() => setActionStatus(null), 4000)
      }
    } catch (err) {
      console.error(err)
      setActionStatus('❌ Failed to escalate.')
    }
  }

  const handleEscalateAction = async (actionObj: any) => {
    if (!selectedRecap || !selectedRecap.projectId) {
      alert('Please associate this recap with a project to add an action item.')
      return
    }
    try {
      setActionStatus('Adding to Project Action Items…')
      const res = await fetch('/api/discord-recap/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recapId: selectedRecap.id,
          projectId: selectedRecap.projectId,
          issueTitle: actionObj.description,
          owner: actionObj.owner,
          type: 'actionItem',
        }),
      })
      if (res.ok) {
        setActionStatus('✅ Action item added to Project Register!')
        setTimeout(() => setActionStatus(null), 4000)
      }
    } catch (err) {
      console.error(err)
      setActionStatus('❌ Failed to add action item.')
    }
  }

  // Quick preset sample threads
  const loadPreset = (preset: 'transformer' | 'bess' | 'hfo') => {
    if (preset === 'transformer') {
      setFormTitle('SNTU 350MW Substation 230kV Transformer Dielectric Testing')
      setFormChannel('#opv-site-updates')
      setFormTranscript(`[09:00 AM] @tech_lead: Starting dielectric insulation test on 230kV main transformer for SNTU 350MW.
[09:15 AM] @engineer_b: Phase B dielectric test failed moisture contamination limit (35 ppm).
[09:25 AM] @site_manager: Immediate action needed. Contact OEM Bangkok office for vacuum oil filtration unit.
[09:40 AM] @grid_coordinator: This delays grid synchronization run by 5 days. Notifying EDC grid dispatcher.`)
    } else if (preset === 'bess') {
      setFormTitle('SNTK 500MW/1000MWH BESS Container 12 Cooling Thermal Loop Check')
      setFormChannel('#ess-bess-commissioning')
      setFormTranscript(`[11:00 AM] @bess_eng: Continuous 0.5C charge test on SNTK 500MW BESS. Container 12 thermal sensor read +3.8°C drift.
[11:15 AM] @bms_dev: BMS automated logic throttled C-rate to 0.25C. Physical cell temp verified normal at 27.5°C.
[11:30 AM] @suom_vireak: Deploy BMS Firmware patch v2.4.1 to reset RTD telemetry module tonight.`)
    } else {
      setFormTitle('SNTA 23MW Power Plant Annual Overhaul Pre-Audit Inspection')
      setFormChannel('#hfo-operations')
      setFormTranscript(`[03:00 PM] @hfo_supervisor: Pre-audit inspection of SNTA 23MW power plant completed.
[03:20 PM] @tann_slengdy: Engine cylinder pressure and lube oil viscosity within normal operating specs.
[03:35 PM] @hfo_supervisor: All 4 engines running at 100% capacity. Ready for EDC annual compliance signoff.`)
    }
  }

  const filteredRecaps = recaps.filter((r) => {
    const matchesAlert = alertFilter === 'All' || r.alertLevel === alertFilter
    const matchesSearch =
      r.threadTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.channelName.toLowerCase().includes(search.toLowerCase()) ||
      (r.project?.name || '').toLowerCase().includes(search.toLowerCase())
    return matchesAlert && matchesSearch
  })

  // Parse JSON helpers
  const parseJsonArray = (str: string | null) => {
    if (!str) return []
    try {
      return JSON.parse(str)
    } catch {
      return []
    }
  }

  const parsedIssues = parseJsonArray(selectedRecap?.detectedIssues || null)
  const parsedActions = parseJsonArray(selectedRecap?.actionItems || null)

  const alertBadge = (level: string) => {
    if (level === 'Critical') return <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>🔴 Critical Alert</span>
    if (level === 'Attention') return <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>🟡 Attention Needed</span>
    return <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>🟢 Normal Status</span>
  }

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        borderRadius: 16,
        padding: '24px 28px',
        marginBottom: 24,
        boxShadow: 'var(--shadow)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 24 }}>💬</span>
              <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'white', margin: 0 }}>
                Discord AI Recap & Management Alerts
              </h1>
              <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.3)', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>
                AI Engine Active
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 13.5, margin: 0, maxWidth: 750 }}>
              AI-powered analysis of Discord site discussion threads, automatic technical issue detection, and 1-click executive escalation to project registers.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={{
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
              color: 'white', border: 'none', borderRadius: 10,
              padding: '10px 18px', fontWeight: 700, fontSize: 13.5,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
            }}
          >
            <span>🤖</span> Analyze New Thread / Webhook
          </button>
        </div>

        {/* Quick Stats Counter Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>TOTAL THREADS ANALYZED</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'white', marginTop: 2 }}>{recaps.length}</div>
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ fontSize: 11, color: '#fca5a5', fontWeight: 600 }}>CRITICAL ALERTS</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#ef4444', marginTop: 2 }}>
              {recaps.filter((r) => r.alertLevel === 'Critical').length}
            </div>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ fontSize: 11, color: '#fde68a', fontWeight: 600 }}>ATTENTION NEEDED</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b', marginTop: 2 }}>
              {recaps.filter((r) => r.alertLevel === 'Attention').length}
            </div>
          </div>
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <div style={{ fontSize: 11, color: '#86efac', fontWeight: 600 }}>NORMAL LOGS</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e', marginTop: 2 }}>
              {recaps.filter((r) => r.alertLevel === 'Normal').length}
            </div>
          </div>
        </div>
      </div>

      {/* Action status notification alert */}
      {actionStatus && (
        <div style={{
          background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0',
          padding: '12px 18px', borderRadius: 10, marginBottom: 16,
          fontWeight: 700, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>⚡</span> {actionStatus}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6, background: 'var(--gray-100)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
          {['All', 'Critical', 'Attention', 'Normal'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setAlertFilter(lvl)}
              style={{
                padding: '6px 14px', borderRadius: 7, border: 'none',
                fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                background: alertFilter === lvl ? 'white' : 'transparent',
                color: alertFilter === lvl ? 'var(--gray-900)' : 'var(--gray-600)',
                boxShadow: alertFilter === lvl ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {lvl === 'Critical' ? '🔴 Critical' : lvl === 'Attention' ? '🟡 Attention' : lvl === 'Normal' ? '🟢 Normal' : '🌐 All Threads'}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="🔍 Search Discord channels, threads, or projects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px 14px', borderRadius: 9, border: '1px solid var(--border)',
            fontSize: 13, width: 320, background: 'white', outline: 'none',
          }}
        />
      </div>

      {/* 3-Panel Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left Panel: Thread List */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '14px 16px', background: 'var(--gray-50)', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 13, color: 'var(--gray-700)' }}>
            ANALYZED DISCORD THREADS ({filteredRecaps.length})
          </div>

          <div style={{ maxHeight: 680, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>Loading Recaps…</div>
            ) : filteredRecaps.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>No Discord recaps found.</div>
            ) : (
              filteredRecaps.map((r) => {
                const isSelected = selectedRecap?.id === r.id
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRecap(r)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: isSelected ? '#f0fdfa' : 'white',
                      borderLeft: isSelected ? '4px solid var(--brand-primary)' : '4px solid transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-primary)', background: '#ccfbf1', padding: '1px 6px', borderRadius: 4 }}>
                        {r.channelName}
                      </span>
                      {alertBadge(r.alertLevel)}
                    </div>

                    <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--gray-900)', marginBottom: 4, lineHeight: 1.3 }}>
                      {r.threadTitle}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--gray-400)', marginTop: 8 }}>
                      <span>{r.project ? r.project.name : 'General Log'}</span>
                      <span>{new Date(r.createdAt).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Panel: Detail Briefing Area */}
        {selectedRecap ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Active Recap Header Card */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#3b82f6', background: '#dbeafe', padding: '2px 8px', borderRadius: 6 }}>
                      {selectedRecap.channelName}
                    </span>
                    {alertBadge(selectedRecap.alertLevel)}
                    {selectedRecap.project && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#0f766e', background: '#ccfbf1', padding: '2px 8px', borderRadius: 6 }}>
                        📁 {selectedRecap.project.name} ({selectedRecap.project.code})
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 19, fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
                    {selectedRecap.threadTitle}
                  </h2>
                </div>

                {selectedRecap.threadUrl && (
                  <a
                    href={selectedRecap.threadUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: '#5865F2', color: 'white', padding: '7px 14px', borderRadius: 8,
                      fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    💬 View Original Discord Thread ↗
                  </a>
                )}
              </div>
            </div>

            {/* Card 1: Executive AI Briefing */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                <span style={{ fontSize: 18 }}>🤖</span>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
                  AI Executive Summary Briefing
                </h3>
              </div>

              <div style={{
                background: 'var(--gray-50)', padding: '16px 20px', borderRadius: 10,
                border: '1px solid var(--border)', fontSize: 13.5, color: 'var(--gray-800)',
                lineHeight: 1.7, whiteSpace: 'pre-line',
              }}>
                {selectedRecap.executiveSummary}
              </div>
            </div>

            {/* Card 2: Detected Issues & Management Escalation */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                <span style={{ fontSize: 18 }}>🚨</span>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
                  Detected Technical Issues & Alerts ({parsedIssues.length})
                </h3>
              </div>

              {parsedIssues.length === 0 ? (
                <div style={{ color: 'var(--gray-400)', fontSize: 13, padding: 12, textAlign: 'center' }}>
                  🟢 No critical technical issues detected in this thread.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {parsedIssues.map((issue: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        background: issue.severity === 'Critical' ? '#fef2f2' : '#fffbeb',
                        border: issue.severity === 'Critical' ? '1px solid #fecaca' : '1px solid #fde68a',
                        borderRadius: 10, padding: '14px 18px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 4,
                            background: issue.severity === 'Critical' ? '#dc2626' : '#b45309', color: 'white',
                          }}>
                            {issue.severity}
                          </span>
                          <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--gray-900)' }}>
                            {issue.title}
                          </span>
                        </div>
                        <p style={{ fontSize: 12.5, color: 'var(--gray-600)', margin: 0 }}>
                          {issue.description}
                        </p>
                        <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 4 }}>
                          👤 Assigned Lead: <strong>{issue.owner}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => handleEscalateIssue(issue)}
                        style={{
                          background: '#dc2626', color: 'white', border: 'none', borderRadius: 8,
                          padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                          boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)',
                        }}
                      >
                        ⚡ Convert to Official Project Issue
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card 3: Extracted Action Items */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                <span style={{ fontSize: 18 }}>🎯</span>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
                  Extracted Action Items & Tasks ({parsedActions.length})
                </h3>
              </div>

              {parsedActions.length === 0 ? (
                <div style={{ color: 'var(--gray-400)', fontSize: 13, padding: 12, textAlign: 'center' }}>
                  No action items assigned in this thread.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {parsedActions.map((action: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--gray-50)', border: '1px solid var(--border)',
                        borderRadius: 10, padding: '12px 16px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 3 }}>
                          📋 {action.description}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                          Assignee: <strong>{action.owner}</strong> · Due Date: <strong>{action.dueDate}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => handleEscalateAction(action)}
                        style={{
                          background: 'var(--brand-primary)', color: 'white', border: 'none', borderRadius: 7,
                          padding: '6px 12px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        📋 Add to Action Items
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card 4: Raw Discord Transcript */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>📜</span>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
                  Raw Discord Thread Transcript
                </h3>
              </div>

              <pre style={{
                background: '#0f172a', color: '#e2e8f0', padding: '16px', borderRadius: 10,
                fontSize: 12.5, fontFamily: 'monospace', overflowX: 'auto', whiteSpace: 'pre-wrap',
                maxHeight: 250, border: '1px solid #334155', lineHeight: 1.5,
              }}>
                {selectedRecap.rawMessages}
              </pre>
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
            Select a Discord recap thread from the left list to view details.
          </div>
        )}
      </div>

      {/* Modal: Analyze New Discord Thread */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: 'white', borderRadius: 16, maxWidth: 640, width: '100%',
            padding: '24px 28px', boxShadow: 'var(--shadow-lg)', margin: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
                🤖 AI Discord Thread Analyzer
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
            </div>

            {/* Quick Presets */}
            <div style={{ marginBottom: 16, background: '#f0fdfa', padding: 12, borderRadius: 10, border: '1px solid #ccfbf1' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0f766e', marginBottom: 6 }}>⚡ LOAD QUICK DEMO PRESET THREADS:</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => loadPreset('transformer')} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  🔴 SNTU 350MW Transformer Alert
                </button>
                <button type="button" onClick={() => loadPreset('bess')} style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  🟡 SNTK 500MW BESS Telemetry
                </button>
                <button type="button" onClick={() => loadPreset('hfo')} style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  🟢 SNTA 23MW Overhaul Audit
                </button>
              </div>
            </div>

            <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 4 }}>Thread / Discussion Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SNTU 350MW Transformer Dielectric Test Delay"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 4 }}>Discord Channel Name</label>
                <input
                  type="text"
                  required
                  placeholder="#opv-site-updates"
                  value={formChannel}
                  onChange={(e) => setFormChannel(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 4 }}>Paste Discord Chat Transcript or Webhook Payload</label>
                <textarea
                  required
                  rows={6}
                  placeholder={`[09:00 AM] @tech_lead: Ran insulation test on 230kV main transformer...\n[09:15 AM] @engineer: Phase B failed dielectric test...\n[09:30 AM] @manager: Dispatched OEM vacuum oil team...`}
                  value={formTranscript}
                  onChange={(e) => setFormTranscript(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12.5, fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'white', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={analyzing} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {analyzing ? 'Analyzing with AI…' : '⚡ Analyze & Save Recap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
