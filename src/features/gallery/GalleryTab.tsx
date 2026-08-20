import { useRef, useState, type ChangeEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTripData } from '../../data/useTripData'
import { usePhotos } from '../../data/usePhotos'
import { useIdentity } from '../../state/IdentityContext'
import { uploadPhoto, deletePhoto, getPhotoUrl } from '../../lib/photos'
import { todayISO } from '../../lib/upNext'
import { ACCENTS } from '../../lib/accent'
import { Avatar } from '../../components/Avatar'
import { Icon } from '../../components/Icon'
import type { Photo } from '../../data/liveTypes'

export function GalleryTab() {
  const { data, loading: dataLoading } = useTripData()
  const { photos, loading: photosLoading } = usePhotos()
  const { meId } = useIdentity()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingPreview, setPendingPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [uploadDay, setUploadDay] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const [dayFilter, setDayFilter] = useState<string | null>(null)
  const [personFilter, setPersonFilter] = useState<string | null>(null)
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null)

  if (dataLoading || !data) return <div className="p-8 font-label text-sm text-grey">Loading…</div>

  const currentDay = data.days.find((d) => d.date === todayISO(new Date()))

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !data) return
    setPendingFile(file)
    setPendingPreview(URL.createObjectURL(file))
    setUploadDay(currentDay?.id ?? data.days[0].id)
    e.target.value = ''
  }

  function cancelUpload() {
    setPendingFile(null)
    setPendingPreview(null)
    setCaption('')
  }

  async function confirmUpload() {
    if (!pendingFile || !meId) return
    setUploading(true)
    try {
      await uploadPhoto({ file: pendingFile, playerId: meId, dayId: uploadDay, stopId: null, caption: caption || null })
      cancelUpload()
    } finally {
      setUploading(false)
    }
  }

  const filtered = photos.filter((p) => {
    if (dayFilter && p.day_id !== dayFilter) return false
    if (personFilter && p.uploaded_by !== personFilter) return false
    return true
  })

  return (
    <div className="overflow-y-auto" style={{ height: '100%' }}>
      <div className="px-5 pt-8 pb-5">
        <p className="font-label text-[11px] text-grey">THE CHICAGO SOLUTION</p>
        <h1 className="font-display text-[2.2rem] leading-[0.95] mt-1 text-ink">Gallery</h1>
      </div>

      <div className="px-5 pb-4 flex flex-col gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => fileInputRef.current?.click()}
          className="font-label text-xs py-3 flex items-center justify-center gap-2"
          style={{ background: 'var(--color-teal)', color: 'var(--color-white)' }}
        >
          <Icon name="camera" className="w-4 h-4" />
          Add a Photo
        </motion.button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-wrap gap-2">
          {data.days.map((d) => {
            const accent = ACCENTS[d.accent]
            const active = dayFilter === d.id
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDayFilter(active ? null : d.id)}
                className="font-label text-[10px] px-2.5 py-1.5 border-[1.5px]"
                style={
                  active
                    ? { background: accent.base, borderColor: accent.base, color: 'var(--color-white)' }
                    : { borderColor: accent.base, color: accent.base }
                }
              >
                {d.label.toUpperCase()}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {data.players.map((p) => {
            const active = personFilter === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPersonFilter(active ? null : p.id)}
                className="flex items-center gap-1.5 pr-2.5 py-1 border-[1.5px] border-ink"
                style={active ? { background: 'var(--color-ink)' } : undefined}
              >
                <Avatar playerId={p.id} name={p.name} size={22} />
                <span
                  className="font-label text-[10px]"
                  style={{ color: active ? 'var(--color-white)' : 'var(--color-ink)' }}
                >
                  {p.name.toUpperCase()}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {photosLoading ? (
        <p className="px-5 font-label text-[10px] text-grey">Loading photos…</p>
      ) : filtered.length === 0 ? (
        <p className="px-5 font-label text-[10px] text-grey">
          {photos.length === 0 ? 'No photos yet — be the first.' : 'Nothing matches that filter.'}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-1 px-1 pb-24">
          {filtered.map((photo) => (
            <motion.button
              key={photo.id}
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setLightboxPhoto(photo)}
              className="aspect-square overflow-hidden"
            >
              <img
                src={getPhotoUrl(photo.storage_path)}
                alt={photo.caption ?? ''}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {pendingPreview && (
          <motion.div
            className="fixed inset-0 z-40 flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={cancelUpload} />
            <motion.div
              className="relative w-full bg-white border-t-[1.5px] border-ink p-5 flex flex-col gap-3 max-h-[85dvh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
            >
              <img src={pendingPreview} alt="" className="w-full aspect-square object-cover border-[1.5px] border-ink" />
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption (optional)…"
                className="font-mono text-[16px] px-3 py-2 border-[1.5px] border-ink bg-white text-ink"
              />
              <div className="flex flex-wrap gap-2">
                {data.days.map((d) => {
                  const accent = ACCENTS[d.accent]
                  const active = uploadDay === d.id
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setUploadDay(d.id)}
                      className="font-label text-[10px] px-2.5 py-1.5 border-[1.5px]"
                      style={
                        active
                          ? { background: accent.base, borderColor: accent.base, color: 'var(--color-white)' }
                          : { borderColor: accent.base, color: accent.base }
                      }
                    >
                      {d.label.toUpperCase()}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={cancelUpload}
                  className="flex-1 font-label text-xs py-3 border-[1.5px] border-ink text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmUpload}
                  disabled={uploading}
                  className="flex-1 font-label text-xs py-3 disabled:opacity-50"
                  style={{ background: 'var(--color-teal)', color: 'var(--color-white)' }}
                >
                  {uploading ? 'Uploading…' : 'Post'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: '#0F0F0C' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="flex items-center justify-between px-5 shrink-0"
              style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))', paddingBottom: '1rem' }}
            >
              <button type="button" onClick={() => setLightboxPhoto(null)} className="font-label text-[10px] text-white">
                ✕ Close
              </button>
              {lightboxPhoto.uploaded_by === meId && (
                <button
                  type="button"
                  onClick={async () => {
                    await deletePhoto(lightboxPhoto.id, lightboxPhoto.storage_path)
                    setLightboxPhoto(null)
                  }}
                  className="font-label text-[10px] text-grey"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex-1 min-h-0 flex items-center justify-center px-4">
              <img
                src={getPhotoUrl(lightboxPhoto.storage_path)}
                alt={lightboxPhoto.caption ?? ''}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div
              className="px-5 flex items-center gap-3 shrink-0"
              style={{ paddingTop: '1rem', paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
            >
              {(() => {
                const uploader = data.players.find((pl) => pl.id === lightboxPhoto.uploaded_by)
                return uploader ? <Avatar playerId={uploader.id} name={uploader.name} size={30} /> : null
              })()}
              <div className="flex-1 min-w-0">
                {lightboxPhoto.caption && <p className="text-white text-sm">{lightboxPhoto.caption}</p>}
                <p className="font-label text-[9px] text-grey mt-0.5">
                  {new Date(lightboxPhoto.created_at).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
