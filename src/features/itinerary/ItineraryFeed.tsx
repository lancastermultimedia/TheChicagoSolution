import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTripData } from '../../data/useTripData'
import { stopsForDay } from '../../data/useItineraryStops'
import { useItineraryStopsContext } from '../../state/ItineraryStopsContext'
import { useWeather } from '../../lib/useWeather'
import { ACCENTS } from '../../lib/accent'
import { conditionToIcon } from '../../lib/weatherText'
import { getPreviousStopReference } from '../../lib/homeBase'
import type { Day } from '../../data/types'
import type { LiveStop } from '../../data/liveTypes'
import { DayBand } from '../../components/DayBand'
import { StopCard } from '../../components/StopCard'
import { Patch } from '../../components/Patch'
import { Icon } from '../../components/Icon'

export function ItineraryFeed() {
  const { data, loading, error } = useTripData()
  const { stops } = useItineraryStopsContext()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const weather = useWeather()

  if (loading) {
    return <div className="p-8 font-label text-sm text-grey">Loading itinerary…</div>
  }

  if (error || !data) {
    return <div className="p-8 font-label text-sm text-grey">Couldn't load the itinerary. {error}</div>
  }

  const selectedIndex = data.days.findIndex((d) => d.id === selectedId)
  const selectedDay = selectedIndex >= 0 ? data.days[selectedIndex] : null

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!selectedDay ? (
        <motion.div
          key="picker"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{ height: '100%' }}
        >
          <DayPicker days={data.days} stops={stops} weather={weather} onSelect={setSelectedId} />
        </motion.div>
      ) : (
        <motion.div
          key="detail"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{ height: '100%' }}
        >
          <DayDetail
            day={selectedDay}
            dayNumber={selectedIndex + 1}
            stops={stopsForDay(stops, selectedDay.id)}
            homeBase={data.trip.homeBase}
            liveForecast={weather.daily[selectedDay.date]}
            onBack={() => setSelectedId(null)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function DayPicker({
  days,
  stops,
  weather,
  onSelect,
}: {
  days: Day[]
  stops: LiveStop[]
  weather: ReturnType<typeof useWeather>
  onSelect: (id: string) => void
}) {
  return (
    <div className="overflow-y-auto" style={{ height: 'var(--app-height, 100svh)' }}>
      <div className="px-5 pt-8 pb-5">
        <p className="font-label text-[11px] text-grey">THE CHICAGO SOLUTION</p>
        <h1 className="font-display text-[2.2rem] leading-[0.95] mt-1 text-ink">Itinerary</h1>
      </div>
      {days.map((day, i) => (
        <DayListRow
          key={day.id}
          day={day}
          dayNumber={i + 1}
          stopCount={stopsForDay(stops, day.id).length}
          liveForecast={weather.daily[day.date]}
          onClick={() => onSelect(day.id)}
        />
      ))}
    </div>
  )
}

function DayListRow({
  day,
  dayNumber,
  stopCount,
  liveForecast,
  onClick,
}: {
  day: Day
  dayNumber: number
  stopCount: number
  liveForecast?: { tempF: number; label: string; icon: Parameters<typeof Icon>[0]['name'] }
  onClick: () => void
}) {
  const accent = ACCENTS[day.accent]
  const weatherIcon = liveForecast?.icon ?? conditionToIcon(day.weather.condition)
  const weatherValue = liveForecast ? `${liveForecast.tempF}°F` : `${day.weather.highF}°F`

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98, backgroundColor: 'var(--color-white)' }}
      className="w-full text-left flex items-center gap-4 px-5 py-5 border-t-[1.5px] border-ink"
    >
      <Patch value={String(dayNumber).padStart(2, '0')} label="DAY" color={accent.base} size={56} />
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-2xl text-ink leading-none">{day.label}</h3>
        <p className="font-label text-[10px] text-grey mt-1.5">
          {new Date(`${day.date}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} &mdash;{' '}
          {day.title}
        </p>
        <div className="flex items-center gap-3 mt-2 font-mono text-xs text-grey">
          <span className="flex items-center gap-1">
            <Icon name={weatherIcon} className="w-3.5 h-3.5" />
            {weatherValue}
          </span>
          <span>{stopCount} STOPS</span>
        </div>
      </div>
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-grey shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </motion.button>
  )
}

function DayDetail({
  day,
  dayNumber,
  stops,
  homeBase,
  liveForecast,
  onBack,
}: {
  day: Day
  dayNumber: number
  stops: LiveStop[]
  homeBase: { label: string; address: string }
  liveForecast?: { tempF: number; label: string; icon: Parameters<typeof Icon>[0]['name'] }
  onBack: () => void
}) {
  return (
    <div className="flex flex-col" style={{ height: 'var(--app-height, 100svh)' }}>
      <div className="flex items-center gap-2 px-5 py-4 border-b-[1.5px] border-ink bg-paper shrink-0 sticky top-0 z-10">
        <button type="button" onClick={onBack} className="font-label text-xs text-grey flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          ALL DAYS
        </button>
        <span className="font-label text-xs text-ink">&middot; {day.label.toUpperCase()}</span>
      </div>

      {/* proximity, not mandatory — a stop card taller than one screen (photo +
          description + tags + Directions/More Info/Nearby/Move) needs to be
          freely scrollable past its snap point, or its own buttons become
          unreachable as the scroll position gets yanked back to the top */}
      <div className="snap-y snap-proximity overflow-y-scroll flex-1 min-h-0">
        <div className="snap-start" style={{ minHeight: '100%', display: 'flex', alignItems: 'center' }}>
          <DayBand day={day} dayNumber={dayNumber} liveForecast={liveForecast} />
        </div>
        {stops.map((stop, si) => (
          <StopCard
            key={stop.id}
            stop={stop}
            indexInDay={si}
            previousStop={getPreviousStopReference(day, si, stops, homeBase)}
          />
        ))}
      </div>
    </div>
  )
}
