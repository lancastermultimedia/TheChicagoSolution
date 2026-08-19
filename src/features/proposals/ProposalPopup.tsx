import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { castVote } from '../../lib/proposals'
import { formatPriceLevel } from '../../lib/places'
import { useIdentity } from '../../state/IdentityContext'
import { useTripData } from '../../data/useTripData'
import { useItineraryStopsContext } from '../../state/ItineraryStopsContext'
import type { Proposal, Vote } from '../../data/liveTypes'
import { Avatar } from '../../components/Avatar'

export function ProposalPopup() {
  const { meId } = useIdentity()
  const { data } = useTripData()
  const { stops } = useItineraryStopsContext()
  const [openProposals, setOpenProposals] = useState<Proposal[]>([])
  const [votesByProposal, setVotesByProposal] = useState<Record<string, Vote[]>>({})

  useEffect(() => {
    supabase
      .from('proposals')
      .select('*')
      .eq('status', 'open')
      .then(({ data: rows }) => {
        if (rows) setOpenProposals(rows as Proposal[])
      })

    supabase
      .from('votes')
      .select('*')
      .then(({ data: rows }) => {
        if (!rows) return
        const grouped: Record<string, Vote[]> = {}
        for (const v of rows as Vote[]) {
          ;(grouped[v.proposal_id] ??= []).push(v)
        }
        setVotesByProposal(grouped)
      })

    const channel = supabase
      .channel('proposals_global')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proposals' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const p = payload.new as Proposal
          if (p.status === 'open') setOpenProposals((prev) => [...prev, p])
        } else if (payload.eventType === 'UPDATE') {
          const p = payload.new as Proposal
          setOpenProposals((prev) => (p.status === 'open' ? prev.map((x) => (x.id === p.id ? p : x)) : prev.filter((x) => x.id !== p.id)))
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes' }, (payload) => {
        const v = payload.new as Vote
        setVotesByProposal((prev) => ({ ...prev, [v.proposal_id]: [...(prev[v.proposal_id] ?? []), v] }))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const current =
    meId && data ? openProposals.find((p) => !(votesByProposal[p.id] ?? []).some((v) => v.player_id === meId)) : undefined

  const votes = current ? (votesByProposal[current.id] ?? []) : []
  const yesVoters = votes
    .filter((v) => v.option === 'yes')
    .map((v) => data?.players.find((p) => p.id === v.player_id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
  const noVoters = votes
    .filter((v) => v.option === 'no')
    .map((v) => data?.players.find((p) => p.id === v.player_id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
  const dayLabel = current ? (data?.days.find((d) => d.id === current.day_id)?.label ?? 'the trip') : ''
  const anchorTitle = current?.stop_id ? stops.find((s) => s.id === current.stop_id)?.title : null
  const placementPhrase = current
    ? current.type === 'swap'
      ? `SWAPPING ${anchorTitle?.toUpperCase() ?? 'THIS STOP'}`
      : anchorTitle
        ? `ADDING A STOP AFTER ${anchorTitle.toUpperCase()}`
        : `ADDING A STOP TO START ${dayLabel.toUpperCase()}`
    : ''
  const proposer = current ? (data?.players.find((p) => p.id === current.created_by)?.name ?? 'Someone') : ''

  async function vote(option: 'yes' | 'no') {
    if (!meId || !current) return
    await castVote(current.id, meId, option)
  }

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-full max-w-md bg-white border-[1.5px] border-ink p-5 flex flex-col gap-4 max-h-[85dvh] overflow-y-auto"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <p className="font-label text-[10px] text-grey">
              {proposer.toUpperCase()} PROPOSES {placementPhrase}
            </p>

            {current.options.photoUrl && (
              <img
                src={current.options.photoUrl}
                alt={current.options.title}
                className="w-full aspect-[4/3] object-cover border-[1.5px] border-ink"
              />
            )}

            <div>
              <h3 className="font-display text-2xl text-ink">{current.options.title}</h3>
              <p className="font-label text-[11px] text-grey mt-1">{current.options.address}</p>
              {(current.options.rating != null || formatPriceLevel(current.options.priceLevel)) && (
                <p className="font-mono text-xs text-grey mt-1.5">
                  {current.options.rating != null && (
                    <>
                      {current.options.rating} &#9733; ({current.options.userRatingCount ?? 0} reviews)
                    </>
                  )}
                  {current.options.rating != null && formatPriceLevel(current.options.priceLevel) && ' · '}
                  {formatPriceLevel(current.options.priceLevel)}
                </p>
              )}
              {current.options.editorialSummary && (
                <p className="text-ink text-sm font-light mt-2">{current.options.editorialSummary}</p>
              )}
            </div>

            {current.options.googleMapsUri && (
              <a
                href={current.options.googleMapsUri}
                target="_blank"
                rel="noreferrer"
                className="font-label text-[10px] underline underline-offset-2 text-grey"
              >
                View on Google Maps
              </a>
            )}

            <div className="flex gap-3">
              <motion.button
                type="button"
                onClick={() => vote('yes')}
                whileTap={{ scale: 0.97 }}
                className="flex-1 font-label text-xs py-3"
                style={{ background: 'var(--color-teal)', color: 'var(--color-white)' }}
              >
                Approve
              </motion.button>
              <motion.button
                type="button"
                onClick={() => vote('no')}
                whileTap={{ scale: 0.97 }}
                className="flex-1 font-label text-xs py-3 border-[1.5px] border-ink"
              >
                Deny
              </motion.button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-label text-[10px] text-grey w-16 shrink-0">APPROVE</span>
                <div className="flex -space-x-2">
                  {yesVoters.map((p) => (
                    <Avatar key={p.id} playerId={p.id} name={p.name} size={24} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-label text-[10px] text-grey w-16 shrink-0">DENY</span>
                <div className="flex -space-x-2">
                  {noVoters.map((p) => (
                    <Avatar key={p.id} playerId={p.id} name={p.name} size={24} />
                  ))}
                </div>
              </div>
            </div>
            <p className="font-label text-[10px] text-grey text-center">NEEDS 3 OF 5 TO RESOLVE</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
