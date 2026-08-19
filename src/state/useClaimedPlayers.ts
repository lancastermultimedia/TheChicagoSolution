import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Live set of player ids someone has already claimed, so the claim screen
// can grey those out for everyone else in real time.
export function useClaimedPlayers(): Set<string> {
  const [claimed, setClaimed] = useState<Set<string>>(new Set())

  useEffect(() => {
    supabase
      .from('players')
      .select('id, claimed_at')
      .then(({ data }) => {
        if (data) setClaimed(new Set(data.filter((p) => p.claimed_at).map((p) => p.id)))
      })

    const channel = supabase
      .channel('players_claims')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'players' }, (payload) => {
        const row = payload.new as { id: string; claimed_at: string | null }
        setClaimed((prev) => {
          const next = new Set(prev)
          if (row.claimed_at) next.add(row.id)
          else next.delete(row.id)
          return next
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return claimed
}
