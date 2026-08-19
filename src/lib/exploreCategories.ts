import type { IconName } from '../components/Icon'

// Shared between the per-stop Nearby panel and the Explore map, so the same
// category always means the same color (and icon) everywhere in the app.
export interface ExploreCategory {
  label: string
  query: string
  category: string
  color: string
  icon: IconName
}

// Literal hex, not CSS var() — these values also feed Google Maps marker
// icons, which render via canvas/SVG and can't resolve CSS custom properties.
export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  { label: 'Coffee', query: 'coffee shop', category: 'coffee', color: '#3A7A8A', icon: 'coffee' },
  { label: 'Records', query: 'record store', category: 'records', color: '#7A8A3A', icon: 'record' },
  { label: 'Thrift', query: 'thrift store', category: 'thrift', color: '#A8352A', icon: 'shirt' },
  { label: 'Parks', query: 'park or attraction', category: 'attraction', color: '#5C6829', icon: 'column' },
  { label: 'Food', query: 'restaurant', category: 'food', color: '#D94535', icon: 'fork' },
  { label: 'Bars', query: 'bar', category: 'bar', color: '#1E4A55', icon: 'moon' },
  { label: 'Graveyards', query: 'cemetery', category: 'cemetery', color: '#8A8A7C', icon: 'grave' },
]
