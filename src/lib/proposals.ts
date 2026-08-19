import { supabase } from './supabase'
import type { PlaceResult } from './places'
import type { ProposalOptions } from '../data/liveTypes'
import { enqueueWrite, flushQueue } from './offlineQueue'

interface CreateProposalArgs {
  type: 'swap' | 'addition'
  dayId: string
  // Swap: the stop being replaced (required). Addition: the stop to insert
  // after, or null to land at the very start of the day.
  stopId: string | null
  place: PlaceResult
  category: string | null
  createdBy: string
}

interface VoteArgs {
  proposalId: string
  playerId: string
  option: 'yes' | 'no'
}

async function createProposalOnline({ type, dayId, stopId, place, category, createdBy }: CreateProposalArgs) {
  const options: ProposalOptions = {
    placeId: place.id,
    title: place.name,
    address: place.address,
    category,
    photoUrl: place.photoUrl,
    rating: place.rating,
    userRatingCount: place.userRatingCount,
    priceLevel: place.priceLevel,
    googleMapsUri: place.googleMapsUri,
    editorialSummary: place.editorialSummary,
    timeLabel: 'Flex',
  }

  const { data: inserted, error } = await supabase
    .from('proposals')
    .insert({ type, day_id: dayId, stop_id: stopId, created_by: createdBy, options })
    .select('id')
    .single()
  if (error) throw error

  // Proposing something counts as approving it.
  await castVoteOnline({ proposalId: inserted.id, playerId: createdBy, option: 'yes' })
}

async function castVoteOnline({ proposalId, playerId, option }: VoteArgs) {
  const { error } = await supabase
    .from('votes')
    .upsert({ proposal_id: proposalId, player_id: playerId, option }, { onConflict: 'proposal_id,player_id' })
  if (error) throw error
}

// Both writes fall back to an IndexedDB queue when offline (or when the
// request just fails), flushed automatically on reconnect — see
// lib/offlineQueue.ts and lib/useOfflineStatus.ts. Per CLAUDE.md, this
// deliberately doesn't depend on the Background Sync API (unreliable on
// iOS Safari); it's a plain `online` event listener instead.

export async function createProposal(args: CreateProposalArgs) {
  try {
    if (!navigator.onLine) throw new Error('offline')
    await createProposalOnline(args)
  } catch {
    await enqueueWrite('proposal', args)
  }
}

export async function castVote(proposalId: string, playerId: string, option: 'yes' | 'no') {
  try {
    if (!navigator.onLine) throw new Error('offline')
    await castVoteOnline({ proposalId, playerId, option })
  } catch {
    await enqueueWrite('vote', { proposalId, playerId, option })
  }
}

export async function flushOfflineQueue() {
  await flushQueue({
    vote: castVoteOnline,
    proposal: (payload) => createProposalOnline(payload as CreateProposalArgs),
  })
}
