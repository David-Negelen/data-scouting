export const LEAGUES = [
  { id: 'bundesliga',       label: 'Bundesliga',              country: 'Germany',     code: 'de',     tier: 1 },
  { id: 'bundesliga2',      label: '2. Bundesliga',           country: 'Germany',     code: 'de',     tier: 2 },
  { id: 'premier-league',   label: 'Premier League',          country: 'England',     code: 'gb-eng', tier: 1 },
  { id: 'championship',     label: 'Championship',            country: 'England',     code: 'gb-eng', tier: 2 },
  { id: 'laliga',           label: 'La Liga',                 country: 'Spain',       code: 'es',     tier: 1 },
  { id: 'laliga2',          label: 'La Liga 2',               country: 'Spain',       code: 'es',     tier: 2 },
  { id: 'serie-a',          label: 'Serie A',                 country: 'Italy',       code: 'it',     tier: 1 },
  { id: 'serie-b',          label: 'Serie B',                 country: 'Italy',       code: 'it',     tier: 2 },
  { id: 'ligue1',           label: 'Ligue 1',                 country: 'France',      code: 'fr',     tier: 1 },
  { id: 'ligue2',           label: 'Ligue 2',                 country: 'France',      code: 'fr',     tier: 2 },
  { id: 'eredivisie',       label: 'Eredivisie',              country: 'Netherlands', code: 'nl',     tier: 1 },
  { id: 'primeira-liga',    label: 'Primeira Liga',           country: 'Portugal',    code: 'pt',     tier: 1 },
  { id: 'pro-league',       label: 'Pro League',              country: 'Belgium',     code: 'be',     tier: 1 },
  { id: 'super-lig',        label: 'Süper Lig',               country: 'Turkey',      code: 'tr',     tier: 1 },
  { id: 'champions-league', label: 'UEFA Champions League',   country: 'Europe',      code: 'eu',     tier: 0 },
  { id: 'europa-league',    label: 'UEFA Europa League',      country: 'Europe',      code: 'eu',     tier: 0 },
  { id: 'mls',              label: 'MLS',                     country: 'USA',         code: 'us',     tier: 1 },
  { id: 'other',            label: 'Other',                   country: '',            code: '',       tier: 3 },
]

export const leagueLabel = (id) => LEAGUES.find((l) => l.id === id)?.label ?? id
