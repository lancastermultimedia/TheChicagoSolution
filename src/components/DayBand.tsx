import type { Day } from '../data/types'
import { ACCENTS } from '../lib/accent'
import { conditionToIcon } from '../lib/weatherText'
import { Patch } from './Patch'
import { Icon } from './Icon'

interface DayBandProps {
  day: Day
  dayNumber: number
  liveForecast?: { tempF: number; label: string; icon: Parameters<typeof Icon>[0]['name'] }
  compact?: boolean
}

function getAroundLabel(day: Day) {
  const hasTransit = day.stops.some((s) => s.tags.includes('transit') || s.category === 'transit')
  const hasDrive = day.stops.some((s) => s.tags.includes('drive'))
  if (hasDrive) return 'DRIVING'
  if (hasTransit) return 'TRANSIT + WALK'
  return 'ON FOOT'
}

export function DayBand({ day, dayNumber, liveForecast, compact }: DayBandProps) {
  const accent = ACCENTS[day.accent]
  const weatherIcon = liveForecast?.icon ?? conditionToIcon(day.weather.condition)
  const weatherValue = liveForecast ? `${liveForecast.tempF}°F` : `${day.weather.highF}°F`

  return (
    <div className={`w-full px-5 ${compact ? 'pt-2 pb-7' : 'py-7'} flex flex-col gap-5 border-b-[1.5px] border-ink`}>
      <div className="flex items-center gap-4">
        <Patch value={String(dayNumber).padStart(2, '0')} label="DAY" color={accent.base} />
        <div className="min-w-0">
          <h2 className="font-display text-[2rem] text-ink">{day.label}</h2>
          <p className="font-label text-[11px] text-grey mt-0.5">
            {new Date(`${day.date}T00:00:00`).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
            })}{' '}
            &mdash; {day.title}
          </p>
        </div>
      </div>

      <p className="text-[15px] leading-relaxed text-ink font-light max-w-prose">{day.objective}</p>

      <div className="flex items-stretch text-left">
        <Stat icon={weatherIcon} label="WEATHER" value={weatherValue} color={accent.base} />
        <Rule />
        <Stat icon="footprint" label="WALKING" value={`${day.walkMiles} MI`} color={accent.base} />
        <Rule />
        <Stat icon="bus" label="GETTING AROUND" value={getAroundLabel(day)} color={accent.base} />
        <Rule />
        <Stat icon="pin" label="STOPS" value={String(day.stops.length)} color={accent.base} />
      </div>
    </div>
  )
}

function Rule() {
  return <div className="w-px mx-3 self-stretch bg-border" />
}

function Stat({
  icon,
  label,
  value,
  color,
}: {
  icon: Parameters<typeof Icon>[0]['name']
  label: string
  value: string
  color: string
}) {
  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0 basis-0">
      <Icon name={icon} className="w-4 h-4" style={{ color }} />
      <span className="font-label text-[9px] text-grey truncate">{label}</span>
      <span className="font-mono text-sm text-ink truncate">{value}</span>
    </div>
  )
}
