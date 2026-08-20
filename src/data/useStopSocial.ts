import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { StopComment, StopLike } from './liveTypes'

// Fetched once for the whole itinerary (not per-stop) and shared via
// StopSocialContext — a per-StopCard subscription would create one Realtime
// channel per visible card, all with the same name, which is exactly the
// crash already hit once before (see ItineraryStopsProvider).
export function useStopSocial() {
  const [likes, setLikes] = useState<StopLike[]>([])
  const [comments, setComments] = useState<StopComment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.all([supabase.from('stop_likes').select('*'), supabase.from('stop_comments').select('*')]).then(
      ([likesRes, commentsRes]) => {
        if (cancelled) return
        if (likesRes.data) setLikes(likesRes.data as StopLike[])
        if (commentsRes.data) setComments((commentsRes.data as StopComment[]).sort((a, b) => a.created_at.localeCompare(b.created_at)))
        setLoading(false)
      },
    )

    const channel = supabase
      .channel('stop_social_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stop_likes' }, (payload) => {
        setLikes((prev) => {
          if (payload.eventType === 'INSERT') return [...prev, payload.new as StopLike]
          if (payload.eventType === 'DELETE') return prev.filter((l) => l.id !== (payload.old as { id: string }).id)
          return prev
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stop_comments' }, (payload) => {
        setComments((prev) => {
          if (payload.eventType === 'INSERT') {
            return [...prev, payload.new as StopComment].sort((a, b) => a.created_at.localeCompare(b.created_at))
          }
          if (payload.eventType === 'DELETE') return prev.filter((c) => c.id !== (payload.old as { id: string }).id)
          return prev
        })
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  return { likes, comments, loading }
}
