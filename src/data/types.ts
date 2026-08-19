export type DayAccent = 'orange' | 'teal' | 'mustard' | 'brick'

export interface Player {
  id: string
  name: string
  role: 'host' | 'player'
}

export interface Stop {
  id: string
  time: string
  title: string
  address: string
  description: string
  fixed: boolean
  tags: string[]
  category?: string
}

export interface Day {
  id: string
  date: string
  label: string
  title: string
  accent: DayAccent
  objective: string
  weather: { highF: number; condition: string }
  walkMiles: number
  stops: Stop[]
}

export interface Challenge {
  id: string
  category: string
  title: string
  description: string
  points: number
  type: 'photo' | 'honor'
  stealEligible: boolean
  isDrinking: boolean
}

export interface Penalty {
  id: string
  title: string
  points: number
  description: string
}

export interface WagerRound {
  trigger: string
  label: string
  description: string
}

export interface TripData {
  trip: {
    name: string
    dates: { start: string; end: string }
    homeBase: { label: string; address: string; note: string }
  }
  players: Player[]
  days: Day[]
  challengeDeck: Challenge[]
  penalties: Penalty[]
  wagerRound: WagerRound
}
