import type { Day, Stop } from '../data/types'

// Times in the data are copy, not structured ("~10:30 AM", "1:30–4:30 PM",
// "Afternoon"). Pulls the first clock time out when there is one; returns
// null for purely descriptive times (those just render as text, no countdown).
export function parseStopDateTime(day: Day, stop: Stop): Date | null {
  const match = stop.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return null

  let hours = Number(match[1])
  const minutes = Number(match[2])
  const isPM = match[3].toUpperCase() === 'PM'
  if (isPM && hours !== 12) hours += 12
  if (!isPM && hours === 12) hours = 0

  const [year, month, dayOfMonth] = day.date.split('-').map(Number)
  return new Date(year, month - 1, dayOfMonth, hours, minutes)
}

export function formatCountdown(target: Date, now: Date): string {
  const diffMs = target.getTime() - now.getTime()
  if (diffMs <= 0) return 'NOW'

  const totalMinutes = Math.round(diffMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `IN ${minutes}M`
  if (minutes === 0) return `IN ${hours}H`
  return `IN ${hours}H ${minutes}M`
}
