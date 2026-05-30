export const POSITIONS = [
  { id: 'GK',  label: 'Goalkeeper',        category: 'goalkeeper' },
  { id: 'CB',  label: 'Centre-Back',        category: 'defender'  },
  { id: 'RB',  label: 'Right-Back',         category: 'defender'  },
  { id: 'LB',  label: 'Left-Back',          category: 'defender'  },
  { id: 'RWB', label: 'Right Wing-Back',    category: 'defender'  },
  { id: 'LWB', label: 'Left Wing-Back',     category: 'defender'  },
  { id: 'CDM', label: 'Defensive Mid',      category: 'midfielder'},
  { id: 'CM',  label: 'Central Mid',        category: 'midfielder'},
  { id: 'CAM', label: 'Attacking Mid',      category: 'midfielder'},
  { id: 'RM',  label: 'Right Mid',          category: 'midfielder'},
  { id: 'LM',  label: 'Left Mid',           category: 'midfielder'},
  { id: 'RW',  label: 'Right Winger',       category: 'attacker'  },
  { id: 'LW',  label: 'Left Winger',        category: 'attacker'  },
  { id: 'SS',  label: 'Second Striker',     category: 'attacker'  },
  { id: 'CF',  label: 'Centre Forward',     category: 'attacker'  },
  { id: 'ST',  label: 'Striker',            category: 'attacker'  },
]

export const POSITION_CATEGORIES = ['goalkeeper', 'defender', 'midfielder', 'attacker']

export const isGK = (pos) => pos === 'GK'

export const positionLabel = (id) => POSITIONS.find((p) => p.id === id)?.label ?? id

export const positionCategoryColor = {
  goalkeeper: '#ef4444',
  defender:   '#3b82f6',
  midfielder: '#f59e0b',
  attacker:   '#c8f230',
}
