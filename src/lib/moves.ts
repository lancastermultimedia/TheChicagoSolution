import { supabase } from './supabase'

// Reordering/rescheduling is direct — no vote, unlike swaps/additions which
// are group preference decisions. Runs server-side (see the move_stop
// migration) so concurrent moves from different phones can't corrupt
// day_order.
export async function moveStop(stopId: string, targetDayId: string, afterStopId: string | null) {
  const { error } = await supabase.rpc('move_stop', {
    p_stop_id: stopId,
    p_target_day_id: targetDayId,
    p_after_stop_id: afterStopId,
  })
  if (error) throw error
}

// Same direct-action reasoning as moveStop — no vote. Closes the day_order
// gap left behind server-side (see the remove_stop migration).
export async function removeStop(stopId: string) {
  const { error } = await supabase.rpc('remove_stop', { p_stop_id: stopId })
  if (error) throw error
}
