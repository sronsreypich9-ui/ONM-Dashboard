'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'

export default function ImportPage() {
  const router = useRouter()
  const [csvData, setCsvData] = useState<any[] | null>(null)
  const [columns, setColumns] = useState<string[]>([])
  const [filename, setFilename] = useState('')
  const [importing, setImporting] = useState(false)
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const downloadTemplate = () => {
    const csvContent = `divisionCode,code,name,location,capacityMw,statusRag,percentComplete,currentPhase,nextMilestone,needsVpAttention
OPV,OPV-013,Chonburi Solar Farm,Chonburi,25,Green,100,COD Operations,Q4 Performance Review,FALSE
ESS,ESS-004,Phuket BESS Project,Phuket,10,Yellow,50,Civil Works,Battery Rack Installation,TRUE
HFO,HFO-006,Rayong LNG Terminal,Rayong,100,Green,30,Engineering,FEED Study Complete,FALSE
`
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'onm_projects_import_template.csv'
    a.click()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFilename(file.name)
    setResultMsg(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data)
        if (results.meta.fields) {
          setColumns(results.meta.fields)
        }
      },
    })
  }

  const processImport = async () => {
    if (!csvData || csvData.length === 0) return
    setImporting(true)
    setResultMsg(null)

    try {
      // Fetch existing divisions
      const divRes  = await fetch('/api/divisions')
      const divList = await divRes.json()
      const divMap  = new Map(divList.map((d: any) => [d.code, d.id]))

      let importedCount = 0
      let errorsCount = 0

      for (const row of csvData) {
        const divCode = row.divisionCode?.trim()
        const divId   = divMap.get(divCode)
        if (!divId) {
          errorsCount++
          continue
        }

        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            divisionId: divId,
            code: row.code?.trim(),
            name: row.name?.trim(),
            location: row.location?.trim() || null,
            capacityMw: row.capacityMw ? parseFloat(row.capacityMw) : null,
            statusRag: row.statusRag?.trim() || 'Green',
            percentComplete: row.percentComplete ? parseFloat(row.percentComplete) : 0,
            currentPhase: row.currentPhase?.trim() || null,
            nextMilestone: row.nextMilestone?.trim() || null,
            needsVpAttention: row.needsVpAttention?.trim()?.toUpperCase() === 'TRUE',
          }),
        })

        if (res.ok) importedCount++
        else errorsCount++
      }

      setResultMsg({
        type: importedCount > 0 ? 'success' : 'error',
        text: `Import complete: ${importedCount} projects created, ${errorsCount} skipped/failed.`,
      })
    } catch (err: any) {
      setResultMsg({ type: 'error', text: err.message })
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-title">Data Import & External Feeds</div>
        </div>
      </div>

      <div className="page-container">
        <div className="page-header">
          <div>
            <div className="breadcrumb">
              <a onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>Portfolio</a>
              <span>›</span>
              <span>Import & Feeds</span>
            </div>
            <div className="page-title">📥 Spreadsheet Import & Webhook Ingestion</div>
            <div className="page-subtitle">Batch import projects via CSV/Excel or configure external Slack/Discord feeds</div>
          </div>
        </div>

        {/* SECTION 1: CSV IMPORT */}
        <div className="card animate-in" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div className="card-title">📄 CSV / Excel Project Batch Import</div>
            <button className="btn btn-secondary btn-sm" onClick={downloadTemplate}>
              📥 Download Sample CSV Template
            </button>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: 20 }}>
              <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Select CSV File</label>
              <input
                type="file"
                accept=".csv"
                className="form-input"
                onChange={handleFileUpload}
                style={{ padding: 10 }}
              />
            </div>

            {filename && (
              <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 16 }}>
                Selected file: <strong>{filename}</strong> ({csvData?.length ?? 0} rows parsed)
              </div>
            )}

            {resultMsg && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  marginBottom: 16,
                  background: resultMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  color: resultMsg.type === 'success' ? '#15803d' : '#dc2626',
                  border: `1px solid ${resultMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {resultMsg.type === 'success' ? '✅ ' : '❌ '}
                {resultMsg.text}
              </div>
            )}

            {csvData && csvData.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--gray-800)' }}>
                  Preview (First 5 rows)
                </div>
                <div style={{ overflowX: 'auto', marginBottom: 20, border: '1px solid var(--border)', borderRadius: 8 }}>
                  <table className="project-table" style={{ fontSize: 12 }}>
                    <thead>
                      <tr>
                        {columns.map((col) => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          {columns.map((col) => (
                            <td key={col}>{row[col]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  className="btn btn-primary btn-lg"
                  onClick={processImport}
                  disabled={importing}
                >
                  {importing ? 'Processing Import…' : `Import ${csvData.length} Projects`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: WEBHOOK FEED INGESTION API DOCS */}
        <div className="card animate-in stagger-2">
          <div className="card-header">
            <div className="card-title">📡 External Feed Webhook Endpoint</div>
            <span className="badge badge-inprogress">POST /api/webhook/feed</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: 14, color: 'var(--gray-700)', marginBottom: 16 }}>
              You can automatically push meeting memos, high-severity issues, or action items into this dashboard from external daily reports, Slack bots, or Discord webhooks using our RESTful ingestion endpoint.
            </p>

            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-500)', letterSpacing: '0.8px', marginBottom: 6 }}>
              Example Webhook Request Payload (JSON)
            </div>

            <pre style={{
              background: 'var(--gray-900)',
              color: '#38bdf8',
              padding: 16,
              borderRadius: 8,
              fontSize: 13,
              fontFamily: 'monospace',
              overflowX: 'auto',
              marginBottom: 16,
            }}>
{`// POST http://localhost:3000/api/webhook/feed
{
  "source": "slack_bot",
  "projectCode": "OPV-005",
  "type": "issue", // options: "memo" | "issue" | "action_item"
  "data": {
    "title": "Emergency site inverter trip reported by O&M team",
    "description": "Inverter #4 tripped due to over-temperature alert during peak irradiance hour.",
    "severity": "High",
    "owner": "Chaiyaphum Site PM"
  }
}`}
            </pre>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, padding: 12, background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-800)', marginBottom: 4 }}>Endpoint Header</div>
                <div style={{ fontSize: 12, color: 'var(--gray-600)', fontFamily: 'monospace' }}>Content-Type: application/json</div>
              </div>
              <div style={{ flex: 1, padding: 12, background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-800)', marginBottom: 4 }}>Supported Types</div>
                <div style={{ fontSize: 12, color: 'var(--gray-600)' }}><code>memo</code>, <code>issue</code>, <code>action_item</code></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
