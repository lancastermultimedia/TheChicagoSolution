import type { Player } from '../../data/types'
import { useIdentity } from '../../state/IdentityContext'
import { useClaimedPlayers } from '../../state/useClaimedPlayers'
import { supabase } from '../../lib/supabase'
import { Avatar } from '../../components/Avatar'

export function ClaimScreen({ players }: { players: Player[] }) {
  const { setMe } = useIdentity()
  const claimed = useClaimedPlayers()

  async function claim(playerId: string) {
    setMe(playerId)
    await supabase.from('players').update({ claimed_at: new Date().toISOString() }).eq('id', playerId)
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center px-6 py-10">
      <p className="font-label text-[11px] text-grey">THE CHICAGO SOLUTION</p>
      <h1 className="font-display text-[2.4rem] leading-[0.95] mt-2">Who's this?</h1>
      <p className="text-ink text-[15px] font-light mt-3 max-w-prose">
        Pick your name. This is how the app knows who's who and tracks your progress.
      </p>

      <div className="flex flex-col gap-3 mt-8">
        {players.map((p) => {
          const isClaimed = claimed.has(p.id)
          return (
            <button
              key={p.id}
              type="button"
              disabled={isClaimed}
              onClick={() => claim(p.id)}
              className="flex items-center gap-3 px-5 py-4 border-[1.5px] border-ink text-left disabled:opacity-40"
            >
              <Avatar playerId={p.id} name={p.name} size={40} />
              <span className="font-display text-2xl flex-1">{p.name}</span>
              {isClaimed ? (
                <span className="font-label text-[10px] text-grey">TAKEN</span>
              ) : (
                p.role === 'host' && <span className="font-label text-[10px] text-grey">HOST</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
