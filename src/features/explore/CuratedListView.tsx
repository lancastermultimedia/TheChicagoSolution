import { useState } from 'react'
import { useCuratedList } from '../../data/useCuratedList'
import { formatPriceLevel, type PlaceResult } from '../../lib/places'
import { createProposal } from '../../lib/proposals'
import { useTripData } from '../../data/useTripData'
import { useItineraryStopsContext } from '../../state/ItineraryStopsContext'
import { useStopCoords } from '../../lib/useStopCoords'
import { findBestDayFit, formatDayFit } from '../../lib/dayFit'
import { PlacementPicker } from '../nearby/PlacementPicker'

const ACCENT: Record<'bars' | 'restaurants', string> = {
  bars: 'var(--color-teal-dark)',
  restaurants: 'var(--color-red)',
}

export function CuratedListView({ category, playerId }: { category: 'bars' | 'restaurants'; playerId: string }) {
  const { results, loading } = useCuratedList(category)
  const { data } = useTripData()
  const { stops } = useItineraryStopsContext()
  const stopCoords = useStopCoords(stops)
  const [pendingAdd, setPendingAdd] = useState<PlaceResult | null>(null)
  const [proposedId, setProposedId] = useState<string | null>(null)
  const color = ACCENT[category]

  async function confirmAdd(dayId: string, afterStopId: string | null) {
    if (!pendingAdd) return
    setProposedId(pendingAdd.id)
    await createProposal({ type: 'addition', dayId, stopId: afterStopId, place: pendingAdd, category, createdBy: playerId })
    setPendingAdd(null)
  }

  return (
    <div className="overflow-y-auto h-full px-4 pb-8 flex flex-col gap-3" style={{ paddingTop: 'calc(4.5rem + env(safe-area-inset-top))' }}>
      <p className="font-label text-[11px] text-grey">
        {category === 'bars' ? 'RECOMMENDED BARS' : 'RECOMMENDED RESTAURANTS'}
      </p>

      {loading && <p className="font-label text-[10px] text-grey">Loading…</p>}
      {!loading && results.length === 0 && <p className="font-label text-[10px] text-grey">Nothing here yet.</p>}

      {results.map((r) => {
        const dayFit =
          data && r.lat != null && r.lng != null ? findBestDayFit({ lat: r.lat, lng: r.lng }, stops, stopCoords, data.days) : null
        return (
          <div key={r.id} className="flex gap-3 border-[1.5px] border-ink p-2 bg-white">
            {r.photoUrl && <img src={r.photoUrl} alt={r.name} className="w-20 h-20 object-cover shrink-0 border border-ink" />}
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
              {dayFit && (
                <p className="font-label text-[9px] mt-1" style={{ color }}>
                  {formatDayFit(dayFit).toUpperCase()}
                </p>
              )}

              {pendingAdd?.id === r.id ? (
                data && (
                  <div className="mt-2">
                    <PlacementPicker
                      days={data.days}
                      stops={stops}
                      defaultDayId={dayFit?.dayId ?? data.days[0].id}
                      color={color}
                      onChoose={confirmAdd}
                    />
                  </div>
                )
              ) : (
                <button
                  type="button"
                  disabled={proposedId === r.id}
                  onClick={() => setPendingAdd(r)}
                  className="font-label text-[9px] underline underline-offset-2 mt-1.5 disabled:opacity-50"
                  style={{ color }}
                >
                  {proposedId === r.id ? 'Proposed' : 'Propose to Add'}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
