import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps'
import { useTripData } from '../../data/useTripData'
import { useItineraryStopsContext } from '../../state/ItineraryStopsContext'
import { useIdentity } from '../../state/IdentityContext'
import { useUserLocation } from '../../state/UserLocationContext'
import { searchPlacesNearby, placesConfigured, formatPriceLevel } from '../../lib/places'
import { EXPLORE_CATEGORIES } from '../../lib/exploreCategories'
import { MAP_STYLE } from '../../lib/mapStyle'
import { distanceMeters } from '../../lib/geo'
import { useStopCoords } from '../../lib/useStopCoords'
import { PinInfoSheet, type ExplorePin } from './PinInfoSheet'
import { Icon } from '../../components/Icon'

const PLACES_KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY as string | undefined
const CHICAGO_HOME_CENTER = { lat: 41.9686, lng: -87.6873 } // Ravenswood/Lincoln Square
const SEARCH_TEXT_COLOR = '#0F0F0C'

function pinIconUrl(color: string, size = 26): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 26 26"><circle cx="13" cy="13" r="9" fill="${color}" stroke="#F8F5EE" stroke-width="2.5"/></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function ExploreTab() {
  const { data, loading } = useTripData()
  const { stops } = useItineraryStopsContext()
  const { meId } = useIdentity()
  const myLocation = useUserLocation()
  const stopCoords = useStopCoords(stops)

  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set())
  const [pinsByCategory, setPinsByCategory] = useState<Record<string, ExplorePin[]>>({})
  const [searchPins, setSearchPins] = useState<ExplorePin[]>([])
  const [queryText, setQueryText] = useState('')
  const [searching, setSearching] = useState(false)
  const [selectedPin, setSelectedPin] = useState<ExplorePin | null>(null)
  const [mapCenter, setMapCenter] = useState(CHICAGO_HOME_CENTER)
  const [lastSearchedCenter, setLastSearchedCenter] = useState(CHICAGO_HOME_CENTER)

  if (loading || !data) return <div className="p-8 font-label text-sm text-grey">Loading…</div>

  if (!placesConfigured() || !PLACES_KEY) {
    return (
      <div className="p-8 font-label text-sm text-grey">
        Explore needs the Google Places key configured to work.
      </div>
    )
  }

  async function toggleCategory(cat: (typeof EXPLORE_CATEGORIES)[number]) {
    const isActive = activeCategories.has(cat.category)
    const nextActive = new Set(activeCategories)
    if (isActive) {
      nextActive.delete(cat.category)
      setActiveCategories(nextActive)
      setPinsByCategory((prev) => {
        const next = { ...prev }
        delete next[cat.category]
        return next
      })
      return
    }
    nextActive.add(cat.category)
    setActiveCategories(nextActive)
    const found = await searchPlacesNearby(cat.query, mapCenter, 20)
    const pins: ExplorePin[] = found
      .filter((p) => p.lat != null && p.lng != null)
      .map((p) => ({ ...p, categoryKey: cat.category, color: cat.color }))
    setPinsByCategory((prev) => ({ ...prev, [cat.category]: pins }))
    setLastSearchedCenter(mapCenter)
  }

  async function runTextSearch() {
    if (!queryText.trim()) return
    setSearching(true)
    const found = await searchPlacesNearby(queryText.trim(), mapCenter, 20)
    setSearchPins(
      found
        .filter((p) => p.lat != null && p.lng != null)
        .map((p) => ({ ...p, categoryKey: 'search', color: SEARCH_TEXT_COLOR })),
    )
    setLastSearchedCenter(mapCenter)
    setSearching(false)
  }

  async function searchThisArea() {
    setLastSearchedCenter(mapCenter)
    for (const cat of EXPLORE_CATEGORIES) {
      if (!activeCategories.has(cat.category)) continue
      const found = await searchPlacesNearby(cat.query, mapCenter, 20)
      const pins: ExplorePin[] = found
        .filter((p) => p.lat != null && p.lng != null)
        .map((p) => ({ ...p, categoryKey: cat.category, color: cat.color }))
      setPinsByCategory((prev) => ({ ...prev, [cat.category]: pins }))
    }
    if (queryText.trim()) await runTextSearch()
  }

  const allPins: ExplorePin[] = [...Object.values(pinsByCategory).flat(), ...searchPins]
  const movedFromLastSearch = distanceMeters(mapCenter, lastSearchedCenter) > 600
  const hasActiveSearch = activeCategories.size > 0 || searchPins.length > 0

  return (
    <div className="relative" style={{ height: '100%' }}>
      <APIProvider apiKey={PLACES_KEY}>
        <Map
          style={{ width: '100%', height: '100%' }}
          defaultCenter={CHICAGO_HOME_CENTER}
          defaultZoom={13}
          styles={MAP_STYLE}
          disableDefaultUI
          gestureHandling="greedy"
          onCameraChanged={(e) => setMapCenter(e.detail.center)}
          onClick={() => setSelectedPin(null)}
        >
          {allPins.map((pin) => (
            <Marker
              key={`${pin.categoryKey}-${pin.id}`}
              position={{ lat: pin.lat as number, lng: pin.lng as number }}
              icon={pinIconUrl(pin.color)}
              onClick={() => setSelectedPin(pin)}
            />
          ))}
          {myLocation && <Marker position={myLocation} icon={pinIconUrl('#0F0F0C', 18)} />}
        </Map>
      </APIProvider>

      <AnimatePresence>
        {movedFromLastSearch && hasActiveSearch && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            whileTap={{ scale: 0.96 }}
            onClick={searchThisArea}
            className="absolute left-1/2 -translate-x-1/2 font-label text-[10px] px-4 py-2 bg-ink text-white"
            style={{ top: 'calc(12px + env(safe-area-inset-top))' }}
          >
            Search This Area
          </motion.button>
        )}
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 bg-paper border-t-[1.5px] border-ink p-3 flex flex-col gap-2">
        {allPins.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="font-label text-[10px] text-grey">{allPins.length} RESULT{allPins.length === 1 ? '' : 'S'}</p>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3">
              {allPins.map((pin) => (
                <ResultCard
                  key={`${pin.categoryKey}-${pin.id}`}
                  pin={pin}
                  active={selectedPin?.id === pin.id}
                  onClick={() => setSelectedPin(pin)}
                />
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {EXPLORE_CATEGORIES.map((c) => {
            const active = activeCategories.has(c.category)
            return (
              <motion.button
                key={c.category}
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => toggleCategory(c)}
                className="font-label text-[10px] px-2.5 py-1.5 border-[1.5px] flex items-center gap-1.5"
                style={active ? { background: c.color, borderColor: c.color, color: '#F8F5EE' } : { borderColor: c.color, color: c.color }}
              >
                <Icon name={c.icon} className="w-3.5 h-3.5" />
                {c.label}
              </motion.button>
            )
          })}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            runTextSearch()
          }}
          className="flex gap-2"
        >
          <input
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search the map…"
            className="flex-1 font-mono text-xs px-3 py-2 border-[1.5px] border-ink bg-white text-ink"
          />
          <button type="submit" className="font-label text-[10px] px-3 border-[1.5px] border-ink text-ink">
            {searching ? '…' : 'Go'}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {selectedPin && meId && (
          <PinInfoSheet
            pin={selectedPin}
            days={data.days}
            stops={stops}
            stopCoords={stopCoords}
            playerId={meId}
            onClose={() => setSelectedPin(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ResultCard({ pin, active, onClick }: { pin: ExplorePin; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="shrink-0 w-36 text-left border-[1.5px] bg-white flex flex-col overflow-hidden"
      style={{ borderColor: active ? pin.color : 'var(--color-ink)' }}
    >
      {pin.photoUrl ? (
        <img src={pin.photoUrl} alt={pin.name} className="w-full h-20 object-cover" />
      ) : (
        <div className="w-full h-20 flex items-center justify-center" style={{ background: pin.color + '1a' }}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: pin.color }} />
        </div>
      )}
      <div className="p-2">
        <p className="font-display text-sm leading-none truncate">{pin.name}</p>
        {(pin.rating != null || formatPriceLevel(pin.priceLevel)) && (
          <p className="font-mono text-[9px] text-grey mt-1 truncate">
            {pin.rating != null && <>{pin.rating} &#9733;</>}
            {pin.rating != null && formatPriceLevel(pin.priceLevel) && ' · '}
            {formatPriceLevel(pin.priceLevel)}
          </p>
        )}
      </div>
    </motion.button>
  )
}
