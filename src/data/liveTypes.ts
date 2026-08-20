export interface LiveStop {
  id: string
  day_id: string
  day_order: number
  title: string
  address: string
  time_label: string
  description: string
  fixed: boolean
  tags: string[]
  category: string | null
  status: 'planned' | 'done' | 'skipped' | 'swapped'
  swapped_from_place_id: string | null
}

export interface ProposalOptions {
  placeId: string
  title: string
  address: string
  category: string | null
  photoUrl: string | null
  rating: number | null
  userRatingCount: number | null
  priceLevel: string | null
  googleMapsUri: string | null
  editorialSummary: string | null
  timeLabel: string
}

export interface Proposal {
  id: string
  type: 'swap' | 'addition' | 'quick_poll'
  day_id: string | null
  stop_id: string | null
  created_by: string
  options: ProposalOptions
  status: 'open' | 'resolved' | 'expired'
  resolved_option: string | null
  created_at: string
}

export interface Vote {
  id: string
  proposal_id: string
  player_id: string
  option: string
  created_at: string
}

export interface Photo {
  id: string
  storage_path: string
  uploaded_by: string
  stop_id: string | null
  day_id: string | null
  caption: string | null
  created_at: string
}

export interface StopLike {
  id: string
  stop_id: string
  player_id: string
  created_at: string
}

export interface StopComment {
  id: string
  stop_id: string
  player_id: string
  body: string
  created_at: string
}
