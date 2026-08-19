export function getGreeting(date: Date): string {
  const h = date.getHours()
  if (h < 5) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

export const DAY_MESSAGES: Record<string, string> = {
  fri: 'Settling in near home base — records, coffee, and a jazz bar within walking distance.',
  sat: 'The busiest day: water taxi to Chinatown, the Art Institute, then Smartbar at night.',
  sun: 'A slower day — thrift and record shops through Wicker Park and Logan Square.',
  mon: 'Coffee near home base, then the drive back.',
}

export const DEFAULT_MESSAGE = "Here's the plan for today."

export function preTripMessage(daysUntil: number): string {
  if (daysUntil <= 1) return 'The trip starts tomorrow.'
  return `${daysUntil} days until the trip starts.`
}
