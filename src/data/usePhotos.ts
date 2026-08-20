import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Photo } from './liveTypes'

function sortPhotos(photos: Photo[]): Photo[] {
  return [...photos].sort((a, b) => b.created_at.localeCompare(a.created_at))
}

// Only ever mount this from one place (GalleryTab) — a second concurrent
// instance would create a second Realtime channel with the same name and
// crash (see ItineraryStopsProvider, which exists for exactly this reason).
export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('photos')
      .select('*')
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data) setPhotos(sortPhotos(data as Photo[]))
        setLoading(false)
      })

    const channel = supabase
      .channel('photos_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, (payload) => {
        setPhotos((prev) => {
          if (payload.eventType === 'INSERT') {
            return sortPhotos([...prev, payload.new as Photo])
          }
          if (payload.eventType === 'DELETE') {
            return prev.filter((p) => p.id !== (payload.old as { id: string }).id)
          }
          return prev
        })
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  return { photos, loading }
}
