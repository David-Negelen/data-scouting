// Each metric: { id, label, category, weight, min, max, normMax?, description }
// normMax: for match stats, the value representing "100%" performance in one session

export const METRIC_CATEGORIES = {
  technical:    { label: 'Technical',      weight: 0.25, color: '#3b82f6' },
  physical:     { label: 'Physical',       weight: 0.20, color: '#f59e0b' },
  tactical:     { label: 'Tactical',       weight: 0.25, color: '#c8f230' },
  matchStats:   { label: 'Match Stats',    weight: 0.30, color: '#22c55e' },
  goalkeeping:  { label: 'Goalkeeping',    weight: 1.00, color: '#ef4444' },
}

export const METRICS = [
  // ── Technical ────────────────────────────────────────────────────────────
  { id: 'shortPassing',       label: 'Short Passing',       category: 'technical',  min: 0, max: 100, description: 'Accuracy of short range passes' },
  { id: 'longPassing',        label: 'Long Passing',        category: 'technical',  min: 0, max: 100, description: 'Accuracy and range of long passes' },
  { id: 'firstTouch',         label: 'First Touch',         category: 'technical',  min: 0, max: 100, description: 'Ball control on receiving' },
  { id: 'dribbling',          label: 'Dribbling',           category: 'technical',  min: 0, max: 100, description: 'Ability to beat opponents with the ball' },
  { id: 'crossing',           label: 'Crossing',            category: 'technical',  min: 0, max: 100, description: 'Quality of crosses into the box' },
  { id: 'shootingPower',      label: 'Shooting Power',      category: 'technical',  min: 0, max: 100, description: 'Power behind shots' },
  { id: 'shootingAccuracy',   label: 'Shooting Accuracy',   category: 'technical',  min: 0, max: 100, description: 'Ability to hit the target' },
  { id: 'shootingTechnique',  label: 'Shooting Technique',  category: 'technical',  min: 0, max: 100, description: 'Variety and quality of finishing' },
  { id: 'heading',            label: 'Heading',             category: 'technical',  min: 0, max: 100, description: 'Aerial ball control and direction' },
  { id: 'tacklingStanding',   label: 'Standing Tackle',     category: 'technical',  min: 0, max: 100, description: 'Effectiveness of standing tackles' },
  { id: 'tacklingSliding',    label: 'Sliding Tackle',      category: 'technical',  min: 0, max: 100, description: 'Effectiveness of sliding tackles' },
  { id: 'ballControl',        label: 'Ball Control',        category: 'technical',  min: 0, max: 100, description: 'Close control and touch quality' },
  { id: 'freeKick',           label: 'Free Kick',           category: 'technical',  min: 0, max: 100, description: 'Ability to score or create from free kicks' },
  { id: 'cornerKick',         label: 'Corner Kick',         category: 'technical',  min: 0, max: 100, description: 'Delivery quality from corner kicks' },
  { id: 'penaltyKick',        label: 'Penalty Kick',        category: 'technical',  min: 0, max: 100, description: 'Penalty conversion ability' },
  { id: 'weakFoot',           label: 'Weak Foot',           category: 'technical',  min: 0, max: 100, description: 'Ability and comfort with weaker foot' },

  // ── Physical ─────────────────────────────────────────────────────────────
  { id: 'acceleration',       label: 'Acceleration',        category: 'physical',   min: 0, max: 100, description: 'Speed off the mark' },
  { id: 'topSpeed',           label: 'Top Speed',           category: 'physical',   min: 0, max: 100, description: 'Maximum running speed' },
  { id: 'stamina',            label: 'Stamina',             category: 'physical',   min: 0, max: 100, description: 'Ability to maintain performance for 90+ mins' },
  { id: 'strength',           label: 'Strength',            category: 'physical',   min: 0, max: 100, description: 'Physical power in duels' },
  { id: 'agility',            label: 'Agility',             category: 'physical',   min: 0, max: 100, description: 'Quickness of movement and change of direction' },
  { id: 'jumpingReach',       label: 'Jumping Reach',       category: 'physical',   min: 0, max: 100, description: 'Height and power of jump' },
  { id: 'injuryResistance',   label: 'Injury Resistance',   category: 'physical',   min: 0, max: 100, description: 'Historical durability and injury history' },
  { id: 'workrateDefensive',  label: 'Defensive Work Rate', category: 'physical',   min: 0, max: 100, description: 'Effort and pressing intensity without the ball' },
  { id: 'workrateOffensive',  label: 'Offensive Work Rate', category: 'physical',   min: 0, max: 100, description: 'Runs and movement when the team has the ball' },

  // ── Tactical / Mental ────────────────────────────────────────────────────
  { id: 'positioning',        label: 'Positioning',         category: 'tactical',   min: 0, max: 100, description: 'Reading of the game and positional sense' },
  { id: 'decisionMaking',     label: 'Decision Making',     category: 'tactical',   min: 0, max: 100, description: 'Quality of choices under pressure' },
  { id: 'vision',             label: 'Vision',              category: 'tactical',   min: 0, max: 100, description: 'Ability to see and execute key passes' },
  { id: 'composure',          label: 'Composure',           category: 'tactical',   min: 0, max: 100, description: 'Calmness in high-pressure situations' },
  { id: 'pressingIntensity',  label: 'Pressing Intensity',  category: 'tactical',   min: 0, max: 100, description: 'Energy and effectiveness when pressing' },
  { id: 'defensiveShape',     label: 'Defensive Shape',     category: 'tactical',   min: 0, max: 100, description: 'Maintaining defensive structure' },
  { id: 'offBallMovement',    label: 'Off-Ball Movement',   category: 'tactical',   min: 0, max: 100, description: 'Movement and runs without the ball' },
  { id: 'leadership',         label: 'Leadership',          category: 'tactical',   min: 0, max: 100, description: 'Influence and command of teammates' },
  { id: 'communication',      label: 'Communication',       category: 'tactical',   min: 0, max: 100, description: 'Organisation and vocal presence' },
  { id: 'adaptability',       label: 'Adaptability',        category: 'tactical',   min: 0, max: 100, description: 'Ability to adjust to different systems' },
  { id: 'consistency',        label: 'Consistency',         category: 'tactical',   min: 0, max: 100, description: 'Performance level game-to-game' },
  { id: 'aggression',         label: 'Aggression',          category: 'tactical',   min: 0, max: 100, description: 'Controlled physicality and competitive drive' },

  // ── Match Stats (per session, normalized) ────────────────────────────────
  { id: 'goals',              label: 'Goals',               category: 'matchStats', min: 0, max: 10,  normMax: 3,   description: 'Goals scored' },
  { id: 'assists',            label: 'Assists',             category: 'matchStats', min: 0, max: 10,  normMax: 3,   description: 'Goal assists' },
  { id: 'keyPasses',          label: 'Key Passes',          category: 'matchStats', min: 0, max: 20,  normMax: 8,   description: 'Passes leading to a shot' },
  { id: 'chancesCreated',     label: 'Chances Created',     category: 'matchStats', min: 0, max: 15,  normMax: 6,   description: 'Chances created for teammates' },
  { id: 'duelsWon',           label: 'Duels Won',           category: 'matchStats', min: 0, max: 30,  normMax: 12,  description: 'Ground duels won' },
  { id: 'duelsLost',          label: 'Duels Lost',          category: 'matchStats', min: 0, max: 30,  normMax: 5,   description: 'Ground duels lost (lower is better)', inverted: true },
  { id: 'aerialsWon',         label: 'Aerials Won',         category: 'matchStats', min: 0, max: 20,  normMax: 8,   description: 'Aerial duels won' },
  { id: 'aerialsLost',        label: 'Aerials Lost',        category: 'matchStats', min: 0, max: 20,  normMax: 3,   description: 'Aerial duels lost (lower is better)', inverted: true },
  { id: 'interceptions',      label: 'Interceptions',       category: 'matchStats', min: 0, max: 15,  normMax: 5,   description: 'Balls intercepted' },
  { id: 'clearances',         label: 'Clearances',          category: 'matchStats', min: 0, max: 20,  normMax: 8,   description: 'Defensive clearances' },
  { id: 'foulsCommitted',     label: 'Fouls Committed',     category: 'matchStats', min: 0, max: 10,  normMax: 2,   description: 'Fouls given away (lower is better)', inverted: true },
  { id: 'foulsWon',           label: 'Fouls Won',           category: 'matchStats', min: 0, max: 10,  normMax: 5,   description: 'Fouls won' },
  { id: 'distanceCovered',    label: 'Distance (km)',        category: 'matchStats', min: 0, max: 15,  normMax: 11,  description: 'Total distance covered in km' },
  { id: 'sprintCount',        label: 'Sprints',             category: 'matchStats', min: 0, max: 60,  normMax: 25,  description: 'Number of sprints' },
  { id: 'xG',                 label: 'xG',                  category: 'matchStats', min: 0, max: 5,   normMax: 1.5, description: 'Expected goals' },
  { id: 'xA',                 label: 'xA',                  category: 'matchStats', min: 0, max: 5,   normMax: 1.0, description: 'Expected assists' },
  { id: 'progressiveCarries', label: 'Prog. Carries',       category: 'matchStats', min: 0, max: 20,  normMax: 8,   description: 'Ball carries advancing play significantly' },
  { id: 'progressivePasses',  label: 'Prog. Passes',        category: 'matchStats', min: 0, max: 30,  normMax: 12,  description: 'Passes advancing play significantly' },
  { id: 'pressuresApplied',   label: 'Pressures',           category: 'matchStats', min: 0, max: 40,  normMax: 18,  description: 'Number of pressures applied' },
  { id: 'pressuresSucceeded', label: 'Press Success',       category: 'matchStats', min: 0, max: 25,  normMax: 8,   description: 'Successful pressures' },
  { id: 'shotOnTarget',       label: 'Shots On Target',     category: 'matchStats', min: 0, max: 10,  normMax: 4,   description: 'Shots on target' },
  { id: 'shotOffTarget',      label: 'Shots Off Target',    category: 'matchStats', min: 0, max: 10,  normMax: 2,   description: 'Shots off target (lower is better)', inverted: true },
  { id: 'touchesInBox',       label: 'Touches in Box',      category: 'matchStats', min: 0, max: 20,  normMax: 8,   description: 'Touches in the opposition penalty area' },

  // ── Goalkeeping ──────────────────────────────────────────────────────────
  { id: 'shotStopping',       label: 'Shot Stopping',       category: 'goalkeeping', min: 0, max: 100, description: 'General shot-stopping ability' },
  { id: 'distribution',       label: 'Distribution',        category: 'goalkeeping', min: 0, max: 100, description: 'Passing, throwing and kicking from the hands' },
  { id: 'aerialDominance',    label: 'Aerial Dominance',    category: 'goalkeeping', min: 0, max: 100, description: 'Command of crosses and high balls' },
  { id: 'commandOfArea',      label: 'Command of Area',     category: 'goalkeeping', min: 0, max: 100, description: 'Organisation and presence in the 18-yard box' },
  { id: 'reflexes',           label: 'Reflexes',            category: 'goalkeeping', min: 0, max: 100, description: 'Speed of reaction to close-range shots' },
  { id: 'footwork',           label: 'Footwork',            category: 'goalkeeping', min: 0, max: 100, description: 'Comfort playing out from the back' },
  { id: 'sweeping',           label: 'Sweeping',            category: 'goalkeeping', min: 0, max: 100, description: 'Ability to rush out and claim through balls' },
  { id: 'penaltySaving',      label: 'Penalty Saving',      category: 'goalkeeping', min: 0, max: 100, description: 'Penalty kick save ability' },
  { id: 'claimsHigh',         label: 'Claims (High)',       category: 'goalkeeping', min: 0, max: 100, description: 'Confidence claiming high crosses' },
  { id: 'claimsLow',          label: 'Claims (Low)',        category: 'goalkeeping', min: 0, max: 100, description: 'Safety when gathering low shots' },
]

export const metricsByCategory = (cat) => METRICS.filter((m) => m.category === cat)
export const metricById = (id) => METRICS.find((m) => m.id === id)

export const PLAYER_STATUSES = ['Prospect', 'Target', 'Watchlist', 'Rejected']

export const STATUS_COLORS = {
  Prospect:  '#3b82f6',
  Target:    '#c8f230',
  Watchlist: '#f59e0b',
  Rejected:  '#ef4444',
}

export const RECOMMENDATION_COLORS = {
  Sign:    '#22c55e',
  Loan:    '#c8f230',
  Monitor: '#f59e0b',
  Pass:    '#ef4444',
}
