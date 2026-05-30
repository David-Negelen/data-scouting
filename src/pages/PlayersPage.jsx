import { useState, useRef } from 'react'
import { usePlayersStore } from '@/store'
import { usePlayers } from '@/hooks/usePlayers'
import PlayerList from '@/components/players/PlayerList'
import PlayerSearch from '@/components/players/PlayerSearch'
import PlayerForm from '@/components/players/PlayerForm'
import { parsePlayerCSV, exportPlayersCSV, downloadCSV } from '@/utils/csvParser'
import { downloadJSON } from '@/utils/exportPDF'

export default function PlayersPage() {
  const addPlayer = usePlayersStore((s) => s.addPlayer)
  const importPlayers = usePlayersStore((s) => s.importPlayers)
  const { players } = usePlayers()

  const [view, setView] = useState('grid')
  const [modal, setModal] = useState(null) // null | 'add' | 'search'
  const csvRef = useRef()
  const [csvError, setCsvError] = useState('')

  const handleSearchSelect = (mapped) => {
    addPlayer({ ...mapped, status: 'Prospect' })
    setModal(null)
  }

  const handleCSVImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = parsePlayerCSV(ev.target.result)
        importPlayers([...players, ...parsed])
        setCsvError('')
      } catch (err) {
        setCsvError(err.message)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={() => setModal('add')}>
          + Add Player
        </button>
        <button className="btn btn-secondary" onClick={() => setModal('search')}>
          🔍 Search Transfermarkt
        </button>

        <div style={{ flex: 1 }} />

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', padding: 3, borderRadius: 8 }}>
          {['grid', 'table'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                background: view === v ? 'var(--bg-surface)' : 'transparent',
                color: view === v ? 'var(--text-primary)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {v === 'grid' ? '⊞ Grid' : '☰ Table'}
            </button>
          ))}
        </div>

        <button className="btn btn-secondary" onClick={() => csvRef.current?.click()}>
          Import CSV
        </button>
        <input ref={csvRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCSVImport} />
        <button
          className="btn btn-secondary"
          onClick={() => downloadCSV(exportPlayersCSV(players))}
          disabled={!players.length}
        >
          Export CSV
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => downloadJSON(players, 'players.json')}
          disabled={!players.length}
        >
          Export JSON
        </button>
      </div>

      {csvError && <div className="alert alert-error" style={{ marginBottom: 12 }}>{csvError}</div>}

      {/* Modals */}
      {modal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 20,
          }}
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: modal === 'add' ? 700 : 600, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: 20 }}>
                {modal === 'add' ? 'Add New Player' : 'Search Transfermarkt'}
              </h2>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>✕</button>
            </div>
            {modal === 'add' ? (
              <PlayerForm
                onSubmit={(data) => { addPlayer(data); setModal(null) }}
                onCancel={() => setModal(null)}
              />
            ) : (
              <PlayerSearch onSelect={handleSearchSelect} />
            )}
          </div>
        </div>
      )}

      <PlayerList players={players} view={view} />
    </div>
  )
}
