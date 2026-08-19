import { useTripData } from '../../data/useTripData'
import { stopsForDay } from '../../data/useItineraryStops'
import { useItineraryStopsContext } from '../../state/ItineraryStopsContext'
import { useIdentity } from '../../state/IdentityContext'
import { useNow } from '../../lib/useNow'
import { useWeather } from '../../lib/useWeather'
import { getGreeting, preTripMessage } from '../../lib/greeting'
import { getDailyFact } from '../../lib/funFacts'
import { getPreviousStopReference } from '../../lib/homeBase'
import { todayISO } from '../../lib/upNext'
import type { Day } from '../../data/types'
import { DayBand } from '../../components/DayBand'
import { StopCard } from '../../components/StopCard'
import { Icon } from '../../components/Icon'
import { Avatar } from '../../components/Avatar'

export function HomeTab() {
  const { data, loading, error } = useTripData()
  const { stops } = useItineraryStopsContext()
  const { meId } = useIdentity()
  const now = useNow()
  const weather = useWeather()

  if (loading) return <div className="p-8 font-label text-sm text-grey">Loading…</div>
  if (error || !data) return <div className="p-8 font-label text-sm text-grey">Couldn't load trip data. {error}</div>

  const me = data.players.find((p) => p.id === meId) ?? null
  const iso = todayISO(now)
  const currentDay = data.days.find((d) => d.date === iso)
  const firstDay = data.days[0]

  const phase: 'before' | 'during' | 'after' = currentDay ? 'during' : iso < firstDay.date ? 'before' : 'after'
  const displayDay: Day | null = currentDay ?? (phase === 'before' ? firstDay : null)
  const dayNumber = displayDay ? data.days.findIndex((d) => d.id === displayDay.id) + 1 : 0
  const todaysStops = displayDay ? stopsForDay(stops, displayDay.id) : []

  const daysUntil =
    phase === 'before'
      ? Math.ceil((new Date(`${firstDay.date}T00:00:00`).getTime() - new Date(`${iso}T00:00:00`).getTime()) / 86_400_000)
      : 0

  // During the trip, the day-band's own objective (right below, no divider)
  // already describes the day — a second description here would just repeat it.
  const message =
    phase === 'after' ? 'The trip is complete.' : phase === 'before' ? preTripMessage(daysUntil) : ''

  // Once the trip is underway, the greeting and today's day-band describe
  // the same day — merge them into one seamless block (no dividing line).
  const merged = phase === 'during'

  return (
    <div className="pb-24">
      <GreetingHeader
        name={me?.name}
        meId={meId}
        now={now}
        message={message}
        weather={weather.current}
        isLive={weather.isLive}
        merged={merged}
      />

      {phase === 'after' && (
        <div className="px-5 py-10 text-center">
          <p className="text-ink text-[15px] font-light">
            The gallery still holds everything from the weekend — recap view is coming.
          </p>
        </div>
      )}

      {displayDay && (
        <>
          <DayBand day={displayDay} dayNumber={dayNumber} liveForecast={weather.daily[displayDay.date]} compact={merged} />
          {todaysStops.map((stop, i) => (
            <StopCard
              key={stop.id}
              stop={stop}
              indexInDay={i}
              previousStop={getPreviousStopReference(displayDay, i, todaysStops, data.trip.homeBase)}
            />
          ))}
        </>
      )}
    </div>
  )
}

function GreetingHeader({
  name,
  meId,
  now,
  message,
  weather,
  isLive,
  merged,
}: {
  name: string | undefined
  meId: string | null
  now: Date
  message: string
  weather: { tempF: number; label: string; icon: Parameters<typeof Icon>[0]['name'] } | null
  isLive: boolean
  merged: boolean
}) {
  const greeting = getGreeting(now)

  return (
    <div className={`px-5 pt-10 ${merged ? 'pb-4' : 'pb-7 border-b-[1.5px] border-ink'}`}>
      <p className="font-label text-[11px] text-grey">
        {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>
      <div className="flex items-center gap-3 mt-1">
        {meId && name && <Avatar playerId={meId} name={name} size={44} />}
        <h1 className="font-display text-[2.6rem] leading-[0.95] text-ink">
          {greeting}
          {name ? `, ${name}` : ''}.
        </h1>
      </div>

      {meId && (
        <div className="mt-3">
          <p className="font-label text-[10px]" style={{ color: 'var(--color-teal)' }}>
            CHICAGO FACT
          </p>
          <p className="text-ink text-sm font-light mt-1 max-w-prose">{getDailyFact(now, meId)}</p>
        </div>
      )}

      {message && <p className="text-ink text-[15px] font-light mt-3 max-w-prose">{message}</p>}

      {weather && (
        <div className="flex items-center gap-2 mt-4 font-mono text-sm text-ink">
          <Icon name={weather.icon} className="w-4 h-4" style={{ color: 'var(--color-teal)' }} />
          <span>
            {weather.tempF}°F &middot; {weather.label}
          </span>
          {!isLive && <span className="font-label text-[10px] text-grey">(CACHED)</span>}
        </div>
      )}
    </div>
  )
}
