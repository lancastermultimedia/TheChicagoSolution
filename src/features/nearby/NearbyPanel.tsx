import { useState } from 'react'
import { motion } from 'framer-motion'
import { searchPlacesNearby, formatPriceLevel, type PlaceResult } from '../../lib/places'
import { createProposal } from '../../lib/proposals'
import { distanceMeters, formatWalkingDistance } from '../../lib/geo'
import { useTripData } from '../../data/useTripData'
import { useItineraryStopsContext } from '../../state/ItineraryStopsContext'
import { PlacementPicker } from './PlacementPicker'
import { EXPLORE_CATEGORIES as CATEGORIES } from '../../lib/exploreCategories'
import { Icon } from '../../components/Icon'

interface NearbyPanelProps {
  stopId: string
  dayId: string
  // The stop whose card this panel lives on — used for the "Add as Next
  // Stop" shortcut. Null when opened from a context with no natural anchor
  // (e.g. a future map view), where the full placement picker shows instead.
  defaultAnchorStop: { id: string; title: string } | null
  center: { lat: number; lng: number } | null
  color: string
  playerId: string
}

export function NearbyPanel({ stopId, dayId, defaultAnchorStop, center, color, playerId }: NearbyPanelProps) {
  const { data } = useTripData()
  const { stops } = useItineraryStopsContext()
  const [queryText, setQueryText] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [results, setResults] = useState<PlaceResult[]>([])
  const [visibleCount, setVisibleCount] = useState(4)
  const [loading, setLoading] = useState(false)
  const [proposedId, setProposedId] = useState<string | null>(null)
  const [pendingAdd, setPendingAdd] = useState<PlaceResult | null>(null)
  const [showFullPicker, setShowFullPicker] = useState(false)

  async function runSearch(query: string, category: string | null) {
    setLoading(true)
    setActiveCategory(category)
    const found = await searchPlacesNearby(query, center)
    setResults(found)
    setVisibleCount(4)
    setLoading(false)
  }

  async function proposeSwap(place: PlaceResult) {
    setProposedId(place.id)
    await createProposal({ type: 'swap', dayId, stopId, place, category: activeCategory, createdBy: playerId })
  }

  async function confirmAddition(targetDayId: string, afterStopId: string | null) {
    if (!pendingAdd) return
    setProposedId(pendingAdd.id)
    await createProposal({
      type: 'addition',
      dayId: targetDayId,
      stopId: afterStopId,
      place: pendingAdd,
      category: activeCategory,
      createdBy: playerId,
    })
    setPendingAdd(null)
    setShowFullPicker(false)
  }

  if (pendingAdd && data) {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            setPendingAdd(null)
            setShowFullPicker(false)
          }}
          className="font-label text-[10px] text-grey self-start"
        >
          ← Back to results
        </button>

        <p className="font-label text-[10px] text-grey">
          ADD <span className="text-ink">{pendingAdd.name.toUpperCase()}</span> —
        </p>

        {!showFullPicker ? (
          <div className="flex flex-col gap-2">
            {defaultAnchorStop && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => confirmAddition(dayId, defaultAnchorStop.id)}
                className="font-label text-xs py-3"
                style={{ background: color, color: 'var(--color-white)' }}
              >
                Add as Next Stop
              </motion.button>
            )}
            <button
              type="button"
              onClick={() => setShowFullPicker(true)}
              className="font-label text-[10px] text-grey underline underline-offset-2 self-start"
            >
              Choose a different day or time
            </button>
          </div>
        ) : (
          <PlacementPicker
            days={data.days}
            stops={stops}
            defaultDayId={dayId}
            color={color}
            onChoose={confirmAddition}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <motion.button
            key={c.label}
            type="button"
            onClick={() => runSearch(c.query, c.category)}
            whileTap={{ scale: 0.94 }}
            className="font-label text-[10px] px-2.5 py-1.5 border-[1.5px] flex items-center gap-1.5"
            style={
              activeCategory === c.category
                ? { background: color, color: 'var(--color-white)', borderColor: color }
                : { borderColor: color, color }
            }
          >
            <Icon name={c.icon} className="w-3.5 h-3.5" />
            {c.label}
          </motion.button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (queryText.trim()) runSearch(queryText.trim(), null)
        }}
        className="flex gap-2"
      >
        <input
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && queryText.trim()) {
              e.preventDefault()
              runSearch(queryText.trim(), null)
            }
          }}
          placeholder="Search anything nearby…"
          // 16px min so iOS Safari doesn't force-zoom the page on focus
          className="flex-1 font-mono text-[16px] px-3 py-2 border-[1.5px] border-ink bg-white text-ink"
        />
        <button type="submit" className="font-label text-[10px] px-3 border-[1.5px]" style={{ borderColor: color, color }}>
          Go
        </button>
      </form>

      {loading && <p className="font-label text-[10px] text-grey">Searching…</p>}

      {!loading && results.length === 0 && activeCategory !== null && (
        <p className="font-label text-[10px] text-grey">No results nearby.</p>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-2">
          {results.slice(0, visibleCount).map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(i, 4) * 0.04 }}
              className="flex gap-3 border-[1.5px] border-ink p-2 bg-white"
            >
              {r.photoUrl && (
                <img src={r.photoUrl} alt={r.name} className="w-16 h-16 object-cover shrink-0 border border-ink" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg leading-none truncate">{r.name}</p>
                <p className="font-label text-[9px] text-grey mt-1.5 truncate">{r.address}</p>
                {(r.rating != null || formatPriceLevel(r.priceLevel)) && (
                  <p className="font-mono text-[10px] text-grey mt-1">
                    {r.rating != null && (
                      <>
                        {r.rating} &#9733; ({r.userRatingCount ?? 0})
                      </>
                    )}
                    {r.rating != null && formatPriceLevel(r.priceLevel) && ' · '}
                    {formatPriceLevel(r.priceLevel)}
                  </p>
                )}
                {center && r.lat != null && r.lng != null && (
                  <p className="font-mono text-[10px] mt-1" style={{ color }}>
                    {formatWalkingDistance(distanceMeters(center, { lat: r.lat, lng: r.lng }))}
                  </p>
                )}
                <div className="flex gap-3 mt-1.5">
                  <button
                    type="button"
                    disabled={proposedId === r.id}
                    onClick={() => proposeSwap(r)}
                    className="font-label text-[9px] underline underline-offset-2 disabled:opacity-50"
                    style={{ color }}
                  >
                    {proposedId === r.id ? 'Proposed' : 'Propose Swap'}
                  </button>
                  <button
                    type="button"
                    disabled={proposedId === r.id}
                    onClick={() => setPendingAdd(r)}
                    className="font-label text-[9px] underline underline-offset-2 disabled:opacity-50"
                    style={{ color }}
                  >
                    {proposedId === r.id ? 'Proposed' : 'Propose Add'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {visibleCount < results.length && (
            <button
              type="button"
              onClick={() => setVisibleCount((v) => v + 4)}
              className="font-label text-[10px] text-grey underline underline-offset-2 self-start"
            >
              See other options
            </button>
          )}
        </div>
      )}
    </div>
  )
}
