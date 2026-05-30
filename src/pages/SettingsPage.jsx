import { useState } from 'react'
import { usePlayersStore, useReportsStore } from '@/store'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { downloadJSON } from '@/utils/exportPDF'

function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <h3 style={{ fontFamily: 'Barlow Condensed', fontSize: 17, marginBottom: 14 }}>{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, description, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
      <span style={{ fontWeight: 600, fontSize: 13 }}>{label}</span>
      {description && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{description}</span>}
      {children}
    </label>
  )
}

export default function SettingsPage() {
  const players = usePlayersStore((s) => s.players)
  const reports = useReportsStore((s) => s.reports)
  const importPlayers = usePlayersStore((s) => s.importPlayers)
  const importReports = useReportsStore((s) => s.importReports)
  const clearPlayers = usePlayersStore((s) => s.clearAll)
  const clearReports = useReportsStore((s) => s.clearAll)

  const [settings, setSettings] = useLocalStorage('scout-settings', {
    rapidApiKey: '',
    footballDataKey: '',
  })
  const [theme, setTheme] = useLocalStorage('scout-theme', 'dark')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExportAll = () => {
    downloadJSON({ players, reports, exportedAt: new Date().toISOString() }, 'scout-backup.json')
  }

  const handleImportAll = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.players) importPlayers(data.players)
        if (data.reports) importReports(data.reports)
        alert('Import successful!')
      } catch {
        alert('Invalid backup file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleClearAll = () => {
    if (window.confirm('Delete all players and reports? This cannot be undone.')) {
      clearPlayers()
      clearReports()
    }
  }

  const handleSeedData = async () => {
    if (players.length > 0 && !window.confirm(`This will add 100 demo players to your existing ${players.length} players. Continue?`)) return
    try {
      const res = await fetch('/seed-players.json')
      const data = await res.json()
      const withIds = data.players.map((p) => ({ ...p, id: crypto.randomUUID() }))
      importPlayers([...players, ...withIds])
      alert(`Loaded ${withIds.length} demo players from the top 5 leagues.`)
    } catch {
      alert('Failed to load seed data.')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
      {/* API Keys */}
      <Section title="API Keys">
        <Field label="RapidAPI Key" description="Required for api-football (squad data, fixtures). Free tier: 100 req/day.">
          <input
            className="input"
            type="password"
            placeholder="Enter your RapidAPI key…"
            value={settings.rapidApiKey ?? ''}
            onChange={(e) => setSettings((s) => ({ ...s, rapidApiKey: e.target.value }))}
          />
        </Field>
        <Field label="football-data.org API Key" description="For competition standings and match data. Free tier available.">
          <input
            className="input"
            type="password"
            placeholder="Enter your football-data.org key…"
            value={settings.footballDataKey ?? ''}
            onChange={(e) => setSettings((s) => ({ ...s, footballDataKey: e.target.value }))}
          />
        </Field>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? '✓ Saved' : 'Save Keys'}
        </button>
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          Keys are stored locally in your browser only and never sent anywhere except the respective APIs.
        </p>
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <Field label="Theme">
          <div style={{ display: 'flex', gap: 8 }}>
            {['dark', 'light'].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                style={{
                  padding: '6px 20px',
                  borderRadius: 8,
                  border: `1px solid ${theme === t ? 'var(--accent-primary)' : 'var(--border)'}`,
                  background: theme === t ? 'rgba(200,242,48,.1)' : 'transparent',
                  color: theme === t ? 'var(--accent-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                  textTransform: 'capitalize',
                }}
              >
                {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* Data Management */}
      <Section title="Data Management">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <button className="btn btn-secondary" onClick={handleExportAll}>
            Export Full Backup (JSON)
          </button>
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            Import Backup (JSON)
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportAll} />
          </label>
          <button className="btn btn-secondary" onClick={handleSeedData}>
            Load Demo Data (Top 5 Leagues)
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
          {players.length} players · {reports.length} reports stored locally.
        </p>
        <button className="btn btn-danger" onClick={handleClearAll}>
          Clear All Data
        </button>
      </Section>

      {/* About */}
      <Section title="About">
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Soccer Scout is a production-grade local-first scouting tool. All data is stored in your browser's
          localStorage. No account required. The Transfermarkt integration uses the unofficial{' '}
          <code>transfermarkt-api.fly.dev</code> proxy — no API key needed.
        </p>
      </Section>
    </div>
  )
}
