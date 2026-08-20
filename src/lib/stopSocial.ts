import { supabase } from './supabase'

export async function toggleLike(stopId: string, playerId: string, currentlyLiked: boolean) {
  if (currentlyLiked) {
    const { error } = await supabase.from('stop_likes').delete().eq('stop_id', stopId).eq('player_id', playerId)
    if (error) throw error
  } else {
    const { error } = await supabase.from('stop_likes').insert({ stop_id: stopId, player_id: playerId })
    if (error) throw error
  }
}

export async function addComment(stopId: string, playerId: string, body: string) {
  const trimmed = body.trim()
  if (!trimmed) return
  const { error } = await supabase.from('stop_comments').insert({ stop_id: stopId, player_id: playerId, body: trimmed })
  if (error) throw error
}

export async function deleteComment(id: string) {
  const { error } = await supabase.from('stop_comments').delete().eq('id', id)
  if (error) throw error
}
