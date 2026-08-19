import type { IconName } from '../components/Icon'

interface IconableStop {
  category?: string | null
  tags: string[]
}

const CATEGORY_ICON: Record<string, IconName> = {
  records: 'record',
  coffee: 'coffee',
  thrift: 'shirt',
  food: 'fork',
  bar: 'moon',
  nightlife: 'speaker',
  attraction: 'column',
  transit: 'bus',
  market: 'market',
}

const TAG_ICON: Record<string, IconName> = {
  drive: 'car',
  checkin: 'key',
  depart: 'suitcase',
}

export function getStopIcon(stop: IconableStop): IconName {
  if (stop.category && CATEGORY_ICON[stop.category]) return CATEGORY_ICON[stop.category]
  const tagMatch = stop.tags.find((t) => TAG_ICON[t])
  if (tagMatch) return TAG_ICON[tagMatch]
  return 'pin'
}
