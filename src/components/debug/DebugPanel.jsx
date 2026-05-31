import { useState, useEffect, useRef } from 'react'
import { subscribe, clearLog } from '@/utils/logger'

export default function DebugPanel() {
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState([])
  const bottomRef = useRef(null)

  useEffect(() => subscribe(setEntries), [])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [open, entries])

  const unread = entries.length

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999, fontFamily: 'JetBrains Mono', fontSize: 11 }}>
      {open && (
        <div
          style={{
            width: 520,
            maxHeight: 340,
            marginBottom: 8,
            background: 'rgba(10,12,18,0.97)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)' }}>
            <span style={{ fontWeight: 700, letterSpacing: '0.05em', color: 'var(--accent-primary)' }}>DEBUG LOG</span>
            <button
              onClick={clearLog}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)', padding: '2px 6px' }}
            >
              clear
            </button>
          </div>
          <div style={{ overflow: 'auto', flex: 1, padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {entries.length === 0 && (
              <span style={{ color: 'var(--text-muted)' }}>No log entries yet.</span>
            )}
            {entries.map((e) => (
              <div key={e.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{e.ts}</span>
                <span style={{ color: e.level === 'error' ? 'var(--danger)' : 'var(--text-primary)', wordBreak: 'break-all' }}>
                  {e.message}
                </span>
                {e.data !== undefined && (
                  <span style={{ color: '#a0c4ff', wordBreak: 'break-all', flex: 1 }}>
                    {typeof e.data === 'object' ? JSON.stringify(e.data) : String(e.data)}
                  </span>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            background: open ? 'var(--accent-primary)' : 'rgba(10,12,18,0.9)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            cursor: 'pointer',
            padding: '5px 10px',
            color: open ? '#000' : 'var(--text-muted)',
            fontFamily: 'JetBrains Mono',
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          LOG
          {unread > 0 && !open && (
            <span style={{ background: 'var(--accent-primary)', color: '#000', borderRadius: 10, padding: '0 5px', fontSize: 10, fontWeight: 800 }}>
              {unread}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
