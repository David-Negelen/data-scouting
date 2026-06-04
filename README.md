# Soccer Scout

A personal scouting database for tracking, rating, and comparing football players. All data is stored locally in the browser — no accounts, no cloud, no subscriptions.

---

## Overview

Soccer Scout is a single-page React application backed by a lightweight Python API server. It lets you build a private player database, score players across 55+ attributes, log match observations, write scouting reports, and pull live season statistics from Understat automatically.

The tool is designed for a single user running it locally. There is no authentication, no multi-user sync, and no external database. Everything lives in `localStorage`.

---

## Features

### Player Database
- Add players manually or bulk-import an entire league from Understat
- Fields: name, position, age, nationality, club, league, contract expiry, market value, photo URL, scouting status
- Four scouting statuses: **Prospect**, **Target**, **Watchlist**, **Rejected**
- Calculated **Overall Score** (0–100) weighted across four categories
- Score **trend indicator** comparing the last three sessions to the prior three

### Attribute Scoring (55+ metrics)
Metrics are grouped into four categories, each with a configurable weighting that feeds the overall score:

| Category | Weight | Metrics |
|---|---|---|
| Technical | 25% | Short/long passing, first touch, dribbling, crossing, shooting (power/accuracy/technique), heading, tackling, ball control, set pieces, weak foot |
| Physical | 20% | Acceleration, top speed, stamina, strength, agility, jumping reach, injury resistance, work rates |
| Tactical/Mental | 25% | Positioning, decision making, vision, composure, pressing, defensive shape, off-ball movement, leadership, communication, adaptability, consistency, aggression |
| Match Stats | 30% | Goals, assists, xG, xA, key passes, chances created, duels, interceptions, clearances, fouls, distance, sprints, progressive carries/passes, pressures, shots, box touches |

Goalkeepers use a separate metric set (shot stopping, distribution, aerial dominance, command of area, reflexes, footwork, sweeping, penalty saving, claims) with different category weights.

All sliders are 0–100. Match stats are normalised against realistic per-game benchmarks (`normMax`) and can be marked `inverted` for metrics where lower is better (e.g. fouls committed).

### Match Logs
- Log individual matches or import season totals from Understat
- Fields: date, opponent, competition, minutes, goals, assists, xG, xA, yellow/red cards, and all match-stat metrics defined above
- Season-total entries (from the stats import) are flagged `isSeason: true` and rendered differently in the UI
- Match logs drive the Match Stats category score and the trend indicator

### Stats Import (Understat via soccerdata)
Two import modes:

**League import** — fetches every player in a league/season and adds them all to your database in one go. Skips players already present (name-matched, case-insensitive). Each imported player gets a season-total match log entry automatically.

**Individual player fetch** — from any player detail page, click "Fetch Stats" to pull their season stats for a specific league and season. Matches by exact name first, then falls back to partial matching via a normalised string (lowercase, alphanumeric only). Confirms the match before writing to the database.

Supported leagues (Understat coverage):
- Premier League (England)
- Bundesliga (Germany)
- La Liga (Spain)
- Serie A (Italy)
- Ligue 1 (France)

Supported seasons: 2024/25, 2023/24, 2022/23, 2021/22

Stats fetched per player: goals, assists, xG, xA, non-penalty xG, shots, key passes, minutes, matches, yellow cards, red cards, position, team. Understat does not provide nationality.

Soccerdata caches responses to `~/soccerdata/data/Understat/`. First call for a league/season takes ~5 seconds; subsequent calls are instant.

### Player Comparison
Select up to four players to compare side by side:
- Overlaid radar chart across all four categories
- Category score table with the leader highlighted per row
- Per-metric bar chart breakdown for Technical, Physical, and Tactical
- Bio comparison table (position, age, nationality, club, contract, market value, status)

### Scouting Reports
- Rich-text report editor per player (HTML content stored in Zustand)
- Fields: match date, competition, venue, overall rating (0–10), recommendation (Sign / Loan / Monitor / Pass)
- Recommendations are colour-coded: Sign (green), Loan (lime), Monitor (amber), Pass (red)
- Multiple reports per player, sorted by creation date
- The latest recommendation is surfaced on the player header

### Print View
A print-optimised layout for a player's latest scouting report, generated from the "Print" tab on any player detail page. Includes the radar chart, attribute breakdown, match log summary, and the full scouting report text. Triggered via `window.print()` with a dedicated CSS stylesheet (`print.css`).

### Dashboard
Landing page showing aggregate stats across your database: number of players, breakdown by status, recent activity, and overall score distribution.

---

## Architecture

```
soccer-scout/
├── src/                      React/Vite frontend
│   ├── api/
│   │   └── soccerdata.js     Fetch wrapper for the Python backend
│   ├── components/
│   │   ├── compare/          CompareSelector + CompareView
│   │   ├── dashboard/        Dashboard, RecentActivity, StatSummary
│   │   ├── layout/           Layout, Sidebar, Topbar
│   │   ├── matches/          MatchLog, MatchStatForm
│   │   ├── metrics/          MetricsPanel, MetricSlider, RadarChart, StatBar
│   │   ├── players/          PlayerCard, PlayerForm, PlayerList, PlayerSearch
│   │   │                     LeagueImportModal, SofaScoreModal (individual fetch)
│   │   └── scouting/         ScoutingReport, ReportEditor, ReportPrint
│   ├── constants/
│   │   ├── leagues.js        League definitions (17 leagues + Other)
│   │   ├── metricDefinitions.js  All 55+ metrics + category config
│   │   └── positions.js      Position list + GK detection helper
│   ├── hooks/                usePlayers, useCompare, useScoutingReports, useLocalStorage
│   ├── pages/                DashboardPage, PlayersPage, PlayerDetailPage,
│   │                         ComparePage, ScoutingReportPage, SettingsPage
│   ├── store/
│   │   ├── playersSlice.js   Zustand store with localStorage persistence
│   │   └── reportsSlice.js   Zustand store for scouting reports
│   └── utils/
│       ├── metricsCalc.js    Category/overall score, radar data, trend, sparkline
│       ├── formatters.js     Market value, date, flag URL helpers
│       ├── csvParser.js      CSV import utility
│       └── exportPDF.js      PDF export helper
├── server/
│   ├── main.py               FastAPI server (leagues, seasons, players endpoints)
│   ├── requirements.txt      fastapi, uvicorn, soccerdata
│   └── venv/                 Python virtual environment (not committed)
├── vite.config.js            Dev proxy: /api/soccerdata → localhost:8000
└── package.json
```

### Data flow

```
Browser (React)
  └─ /api/soccerdata/players/{league}/{season}
       └─ Vite dev proxy
            └─ FastAPI (localhost:8000)
                 └─ soccerdata.Understat
                      └─ understat.com (or disk cache)
```

The frontend fetches all players for a given league/season in one call. Individual player matching is done client-side. The Python server is stateless; it scrapes, flattens the DataFrame, and returns a JSON array.

### State management

All player and report data is managed with Zustand and persisted to `localStorage` via the `persist` middleware:
- `scout-players` key: full player array including match logs and metrics
- `scout-reports` key: scouting reports array

No server-side persistence. Clearing browser storage wipes the database.

---

## Setup

### Prerequisites
- Node.js 18+
- Python 3.9+

### Install

```bash
# Frontend
npm install

# Python backend
cd server
python3 -m venv venv
venv/bin/pip install -r requirements.txt
cd ..
```

### Run

Open two terminals:

```bash
# Terminal 1 — Vite dev server
npm run dev

# Terminal 2 — FastAPI server
npm run server
```

The app runs at `http://localhost:5173`. The Python API runs at `http://localhost:8000` and is proxied through Vite so the frontend never makes cross-origin requests.

### First fetch

Navigate to Players → Import League, pick a league and season, and click "Import League". The first call downloads and caches data from Understat (~5 seconds). Subsequent calls for the same league/season are instant.

---

## Scoring model

### Outfield players

```
Overall = Technical×0.25 + Physical×0.20 + Tactical×0.25 + MatchStats×0.30
```

- **Technical, Physical, Tactical**: straight average of all filled-in slider values (0–100) in that category. Zeros and nulls are excluded from the average.
- **Match Stats**: each match log session is scored by averaging all match-stat metrics, normalised to 0–100 using each metric's `normMax`. The category score is the average of all session scores.

### Goalkeepers

```
Overall = Goalkeeping×0.50 + Tactical×0.30 + Physical×0.20
```

Goalkeepers use the dedicated goalkeeping metric set. The radar chart shows Goalkeeping, Physical, Tactical, Distribution, and Composure axes.

### Trend

Compares the average session score of the three most recent match logs against the three logs before that. A delta above +2 shows an upward arrow; below −2 shows a downward arrow.

### Score colours

| Range | Colour |
|---|---|
| 80–100 | Green |
| 65–79 | Lime |
| 50–64 | Amber |
| 0–49 | Red |

---

## Leagues reference

The app supports 17 league definitions for manually tagging players:

Bundesliga, 2. Bundesliga, Premier League, Championship, La Liga, La Liga 2, Serie A, Serie B, Ligue 1, Ligue 2, Eredivisie, Primeira Liga, Pro League (Belgium), Süper Lig, UEFA Champions League, UEFA Europa League, MLS, Other.

Stats import via Understat is restricted to the top 5 European leagues (see above).

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + Vite 5 |
| Routing | React Router 6 |
| State / persistence | Zustand 4 + localStorage |
| Charts | Recharts |
| Styling | CSS variables + Tailwind utilities |
| Date handling | date-fns |
| CSV parsing | PapaParse |
| Backend | FastAPI + Uvicorn |
| Data scraping | soccerdata 1.9 → Understat |
| Data processing | pandas + numpy |
