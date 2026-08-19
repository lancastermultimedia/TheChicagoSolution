import { useState } from 'react'
import { motion } from 'framer-motion'
import type { PlaceResult } from '../../lib/places'
import { formatPriceLevel } from '../../lib/places'
import { distanceMeters, formatWalkingDistance } from '../../lib/geo'
import { findBestDayFit, formatDayFit } from '../../lib/dayFit'
import { createProposal } from '../../lib/proposals'
import { useUserLocation } from '../../state/UserLocationContext'
import type { Day } from '../../data/types'
import type { LiveStop } from '../../data/liveTypes'
import { PlacementPicker } from '../nearby/PlacementPicker'

export interface ExplorePin extends PlaceResult {
  categoryKey: string
  color: string
}

interface PinInfoSheetProps {
  pin: ExplorePin
  days: Day[]
  stops: LiveStop[]
  stopCoords: Record<string, { lat: number; lng: number }>
  playerId: string
  onClose: () => void
}

export function PinInfoSheet({ pin, days, stops, stopCoords, playerId, onClose }: PinInfoSheetProps) {
  const myLocation = useUserLocation()
  const [showPicker, setShowPicker] = useState(false)
  const [proposed, setProposed] = useState(false)

  const distanceInfo =
    myLocation && pin.lat != null && pin.lng != null
      ? formatWalkingDistance(distanceMeters(myLocation, { lat: pin.lat, lng: pin.lng }))
      : null

  const dayFit =
    pin.lat != null && pin.lng != null ? findBestDayFit({ lat: pin.lat, lng: pin.lng }, stops, stopCoords, days) : null

  async function confirmAdd(dayId: string, afterStopId: string | null) {
    await createProposal({
      type: 'addition',
      dayId,
      stopId: afterStopId,
      place: pin,
      category: pin.categoryKey,
      createdBy: playerId,
    })
    setProposed(true)
  }

  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 z-40"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div
        className="bg-white border-t-[1.5px] border-ink p-5 flex flex-col gap-3 max-h-[70dvh] overflow-y-auto"
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
      >
        <button type="button" onClick={onClose} className="font-label text-[10px] text-grey self-start">
          ✕ Close
        </button>

        {pin.photoUrl && (
          <img src={pin.photoUrl} alt={pin.name} className="w-full aspect-[4/3] object-cover border-[1.5px] border-ink" />
        )}

        <div>
          <h3 className="font-display text-2xl text-ink">{pin.name}</h3>
          <p className="font-label text-[11px] text-grey mt-1">{pin.address}</p>
          {(pin.rating != null || formatPriceLevel(pin.priceLevel) || distanceInfo) && (
            <p className="font-mono text-xs text-grey mt-1.5">
              {pin.rating != null && (
                <>
                  {pin.rating} &#9733; ({pin.userRatingCount ?? 0})
                </>
              )}
              {pin.rating != null && formatPriceLevel(pin.priceLevel) && ' · '}
              {formatPriceLevel(pin.priceLevel)}
              {(pin.rating != null || formatPriceLevel(pin.priceLevel)) && distanceInfo && ' · '}
              {distanceInfo}
            </p>
          )}
          {dayFit && (
            <p className="font-label text-[10px] mt-2" style={{ color: pin.color }}>
              {formatDayFit(dayFit).toUpperCase()}
            </p>
          )}
          {pin.editorialSummary && <p className="text-ink text-sm font-light mt-2">{pin.editorialSummary}</p>}
        </div>

        {pin.googleMapsUri && (
          <a
            href={pin.googleMapsUri}
            target="_blank"
            rel="noreferrer"
            className="font-label text-[10px] underline underline-offset-2 text-grey"
          >
            View on Google Maps
          </a>
        )}

        {proposed ? (
          <p className="font-label text-[10px] text-grey">Proposed — waiting on votes.</p>
        ) : !showPicker ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPicker(true)}
            className="font-label text-xs py-3"
            style={{ background: pin.color, color: 'var(--color-white)' }}
          >
            Propose to Add
          </motion.button>
        ) : (
          <PlacementPicker
            days={days}
            stops={stops}
            defaultDayId={dayFit?.dayId ?? days[0].id}
            color={pin.color}
            onChoose={confirmAdd}
          />
        )}
      </div>
    </motion.div>
  )
}
