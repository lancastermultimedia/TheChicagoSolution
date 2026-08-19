import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { LiveStop } from './liveTypes'

function sortStops(stops: LiveStop[]): LiveStop[] {
  return [...stops].sort((a, b) => a.day_order - b.day_order)
}

export function useItineraryStops() {
  const [stops, setStops] = useState<LiveStop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('itinerary_stops')
      .select('*')
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data) setStops(sortStops(data as LiveStop[]))
        setLoading(false)
      })

    const channel = supabase
      .channel('itinerary_stops_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'itinerary_stops' },
        (payload) => {
          setStops((prev) => {
            if (payload.eventType === 'INSERT') {
              return sortStops([...prev, payload.new as LiveStop])
            }
            if (payload.eventType === 'UPDATE') {
              return sortStops(prev.map((s) => (s.id === (payload.new as LiveStop).id ? (payload.new as LiveStop) : s)))
            }
            if (payload.eventType === 'DELETE') {
              return prev.filter((s) => s.id !== (payload.old as { id: string }).id)
            }
            return prev
          })
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  return { stops, loading }
}

export function stopsForDay(stops: LiveStop[], dayId: string): LiveStop[] {
  return stops.filter((s) => s.day_id === dayId)
}
