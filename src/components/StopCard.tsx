import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { LiveStop } from '../data/liveTypes'
import { getStopColor } from '../lib/stopPalette'
import { getDirectionsUrl } from '../lib/directions'
import { getMoreInfoUrl } from '../lib/moreInfo'
import { getStopIcon } from '../lib/stopIcon'
import { usePlaceDetails } from '../lib/usePlaceDetails'
import { distanceMeters, formatWalkingDistance, formatHopFromPrevious } from '../lib/geo'
import { useRouteInfo } from '../lib/useRouteInfo'
import { formatRouteInfo } from '../lib/routes'
import { formatPriceLevel } from '../lib/places'
import { getBookingUrl } from '../lib/bookingLinks'
import { getCuratedPhoto } from '../lib/curatedPhotos'
import { getStopNotes } from '../lib/stopNotes'
import { moveStop } from '../lib/moves'
import { useIdentity } from '../state/IdentityContext'
import { useUserLocation } from '../state/UserLocationContext'
import { useTripData } from '../data/useTripData'
import { useItineraryStopsContext } from '../state/ItineraryStopsContext'
import { Icon } from './Icon'
import { Chip } from './Chip'
import { NotesSheet } from './NotesSheet'
import { NearbyPanel } from '../features/nearby/NearbyPanel'
import { PlacementPicker } from '../features/nearby/PlacementPicker'

type StopReference = Pick<LiveStop, 'id' | 'title' | 'address'>

interface StopCardProps {
  stop: LiveStop
  indexInDay: number
  previousStop?: StopReference | null
}

export function StopCard({ stop, indexInDay, previousStop = null }: StopCardProps) {
  const [nearbyOpen, setNearbyOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const [moving, setMoving] = useState(false)
  const { meId } = useIdentity()
  const { data: tripData } = useTripData()
  const { stops: allStops } = useItineraryStopsContext()
  const color = getStopColor(indexInDay)
  const icon = getStopIcon(stop)
  const details = usePlaceDetails(stop.id, `${stop.title} ${stop.address}`)
  const previousDetails = usePlaceDetails(
    previousStop?.id ?? '',
    previousStop ? `${previousStop.title} ${previousStop.address}` : '',
  )
  const notes = getStopNotes(stop.id)
  const photoUrl = getCuratedPhoto(stop.id) ?? details?.photoUrl ?? null
  // A swapped-in replacement isn't the original book-ahead venue anymore, so
  // it shouldn't inherit the old stop's hardcoded ticket link.
  const bookingUrl = stop.status !== 'swapped' ? getBookingUrl(stop.id) : null
  const moreInfoUrl = bookingUrl ?? details?.googleMapsUri ?? getMoreInfoUrl(stop)
  const center = details && details.lat != null && details.lng != null ? { lat: details.lat, lng: details.lng } : null
  const previousCenter =
    previousDetails && previousDetails.lat != null && previousDetails.lng != null
      ? { lat: previousDetails.lat, lng: previousDetails.lng }
      : null
  const myLocation = useUserLocation()
  const walkingInfo = myLocation && center ? formatWalkingDistance(distanceMeters(myLocation, center)) : null
  // Interstate gaps (Lexington -> Chicago) aren't a "local hop" — routing
  // that through transit produces nonsense like "749 MIN BUS." Anything the
  // itinerary already describes as a drive doesn't need a hop line at all.
  const straightLineMeters = previousCenter && center ? distanceMeters(previousCenter, center) : null
  const isLocalHop = straightLineMeters !== null && straightLineMeters < 80_000 // ~50 miles
  const routeInfo = useRouteInfo(
    previousStop && isLocalHop ? `${previousStop.id}->${stop.id}` : null,
    previousCenter,
    center,
  )
  const hopLabel = previousStop?.id === 'home-base' ? 'FROM HOME BASE' : 'FROM LAST STOP'
  const hopInfo = !isLocalHop
    ? null
    : routeInfo
      ? formatRouteInfo(routeInfo, hopLabel)
      : straightLineMeters !== null
        ? formatHopFromPrevious(straightLineMeters, hopLabel)
        : null
  const priceLevel = details ? formatPriceLevel(details.priceLevel) : null

  return (
    <section
      className="snap-start shrink-0 w-full flex flex-col justify-center px-5 py-10 border-b-[1.5px] border-ink"
      style={{ minHeight: 'var(--app-height, 100svh)' }}
    >
      <div className="mx-auto w-full max-w-md flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-full w-11 h-11 shrink-0" style={{ background: color }}>
            <Icon name={icon} className="w-5 h-5" style={{ color: 'var(--color-white)' }} />
          </div>
          <span className="font-mono text-sm text-grey">{stop.time_label.toUpperCase()}</span>
          {stop.status === 'swapped' && (
            <span className="font-label text-[10px] text-grey">SWAPPED</span>
          )}
        </div>

        {hopInfo && <p className="font-label text-[10px] text-grey -mt-2">{hopInfo}</p>}

        <div>
          <h3 className="font-display text-3xl text-ink leading-[0.95]">{stop.title}</h3>
          <p className="font-label text-[11px] text-grey mt-2">{stop.address}</p>

          {(details?.rating != null || priceLevel) && (
            <p className="font-mono text-xs text-grey mt-1.5">
              {details?.rating != null && (
                <>
                  {details.rating} &#9733; ({details.userRatingCount ?? 0})
                </>
              )}
              {details?.rating != null && priceLevel && ' · '}
              {priceLevel}
            </p>
          )}

          {walkingInfo && (
            <p className="font-mono text-xs mt-1.5" style={{ color }}>
              {walkingInfo}
            </p>
          )}
        </div>

        {photoUrl && (
          <motion.img
            key={photoUrl}
            src={photoUrl}
            alt={stop.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full aspect-[4/3] object-cover border-[1.5px] border-ink"
          />
        )}

        <p className="text-ink text-[15px] leading-relaxed font-light">{stop.description}</p>

        {stop.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {stop.tags.map((tag) => (
              <Chip key={tag} color={color}>
                {tag.replace(/-/g, ' ')}
              </Chip>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 pt-1">
          <motion.a
            href={getDirectionsUrl(stop.address)}
            target="_blank"
            rel="noreferrer"
            whileTap={{ scale: 0.97 }}
            className="font-label text-xs text-center py-3"
            style={{ background: color, color: 'var(--color-white)' }}
          >
            Directions
          </motion.a>
          <div className="flex gap-2">
            <motion.a
              href={moreInfoUrl}
              target="_blank"
              rel="noreferrer"
              whileTap={{ scale: 0.97 }}
              className="font-label text-xs flex-1 text-center py-3 border-[1.5px]"
              style={{ borderColor: color, color }}
            >
              {bookingUrl ? 'Get Tickets' : 'More Info'}
            </motion.a>
            <motion.button
              type="button"
              onClick={() => setNearbyOpen((v) => !v)}
              whileTap={{ scale: 0.97 }}
              className="font-label text-xs flex-1 flex items-center justify-center gap-1.5 py-3 border-[1.5px]"
              style={{ borderColor: color, color }}
            >
              Nearby
              <motion.svg
                viewBox="0 0 24 24"
                className="w-3 h-3"
                animate={{ rotate: nearbyOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </motion.svg>
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setMoveOpen((v) => !v)}
              whileTap={{ scale: 0.97 }}
              className="font-label text-xs flex-1 flex items-center justify-center gap-1.5 py-3 border-[1.5px]"
              style={{ borderColor: color, color }}
            >
              Move
              <motion.svg
                viewBox="0 0 24 24"
                className="w-3 h-3"
                animate={{ rotate: moveOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </motion.svg>
            </motion.button>
          </div>
          {notes && (
            <motion.button
              type="button"
              onClick={() => setNotesOpen(true)}
              whileTap={{ scale: 0.97 }}
              className="font-label text-xs text-center py-3 border-[1.5px]"
              style={{ borderColor: color, color }}
            >
              Notes
            </motion.button>
          )}
        </div>

        <AnimatePresence>{notesOpen && notes && <NotesSheet notes={notes} onClose={() => setNotesOpen(false)} />}</AnimatePresence>

        <AnimatePresence initial={false}>
          {nearbyOpen && meId && (
            <motion.div
              key="nearby-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <NearbyPanel
                stopId={stop.id}
                dayId={stop.day_id}
                defaultAnchorStop={{ id: stop.id, title: stop.title }}
                center={center}
                color={color}
                playerId={meId}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {moveOpen && tripData && (
            <motion.div
              key="move-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div className="flex flex-col gap-2">
                <p className="font-label text-[10px] text-grey">MOVE {stop.title.toUpperCase()} TO —</p>
                <PlacementPicker
                  days={tripData.days}
                  stops={allStops.filter((s) => s.id !== stop.id)}
                  defaultDayId={stop.day_id}
                  color={color}
                  onChoose={async (dayId, afterStopId) => {
                    setMoving(true)
                    await moveStop(stop.id, dayId, afterStopId)
                    setMoving(false)
                    setMoveOpen(false)
                  }}
                />
                {moving && <p className="font-label text-[10px] text-grey">Moving…</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
