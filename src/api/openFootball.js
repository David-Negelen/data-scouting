// Fetches static JSON from the openfootball GitHub raw files (no key needed).
const RAW = 'https://raw.githubusercontent.com/openfootball'

const fetchJSON = async (url) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`OpenFootball fetch failed: ${url}`)
  return res.json()
}

const SEASON_URLS = {
  'bundesliga':     `${RAW}/bundesliga/master/2023-24/1-bundesliga.json`,
  'premier-league': `${RAW}/england/master/2023-24/1-premierleague.json`,
  'laliga':         `${RAW}/espana/master/2023-24/1-liga.json`,
  'serie-a':        `${RAW}/italy/master/2023-24/1-serie-a.json`,
  'ligue1':         `${RAW}/france/master/2023-24/1-ligue1.json`,
}

export const fetchLeagueFixtures = async (leagueId) => {
  const url = SEASON_URLS[leagueId]
  if (!url) throw new Error(`No OpenFootball dataset for league: ${leagueId}`)
  return fetchJSON(url)
}

// Returns array of { team, matchday, date, home, away, score }
export const parseFixtures = (data) => {
  const fixtures = []
  for (const round of data.rounds ?? []) {
    for (const match of round.matches ?? []) {
      fixtures.push({
        matchday: round.name,
        date: match.date,
        home: match.team1,
        away: match.team2,
        score: match.score,
      })
    }
  }
  return fixtures
}
