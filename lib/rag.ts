// RAG rollup helper functions

export type RAG = 'Green' | 'Yellow' | 'Red'

export function worstRag(rags: RAG[]): RAG {
  if (rags.includes('Red')) return 'Red'
  if (rags.includes('Yellow')) return 'Yellow'
  return 'Green'
}

export function ragColor(rag: RAG): string {
  switch (rag) {
    case 'Red':    return '#ef4444'
    case 'Yellow': return '#f59e0b'
    case 'Green':  return '#22c55e'
    default:       return '#6b7280'
  }
}

export function ragBg(rag: RAG): string {
  switch (rag) {
    case 'Red':    return '#fef2f2'
    case 'Yellow': return '#fffbeb'
    case 'Green':  return '#f0fdf4'
    default:       return '#f9fafb'
  }
}

export function ragEmoji(rag: RAG): string {
  switch (rag) {
    case 'Red':    return '🔴'
    case 'Yellow': return '🟡'
    case 'Green':  return '🟢'
    default:       return '⚪'
  }
}

export function severityColor(severity: string): string {
  switch (severity) {
    case 'Critical': return '#7c3aed'
    case 'High':     return '#ef4444'
    case 'Med':      return '#f59e0b'
    case 'Low':      return '#22c55e'
    default:         return '#6b7280'
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case 'Done':        return '#22c55e'
    case 'In-progress': return '#3b82f6'
    case 'Overdue':     return '#ef4444'
    case 'Open':        return '#f59e0b'
    default:            return '#6b7280'
  }
}
