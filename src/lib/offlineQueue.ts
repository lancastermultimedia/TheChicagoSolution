import { openDB, type DBSchema } from 'idb'

interface QueueEntry {
  id?: number
  kind: 'vote' | 'proposal'
  payload: unknown
  createdAt: number
}

interface QueueDB extends DBSchema {
  'pending-writes': {
    key: number
    value: QueueEntry
  }
}

// IndexedDB, not localStorage — per CLAUDE.md, this is the offline write
// queue for votes/proposals cast without a connection, flushed on reconnect.
const dbPromise = openDB<QueueDB>('chicago-solution-offline', 1, {
  upgrade(db) {
    db.createObjectStore('pending-writes', { keyPath: 'id', autoIncrement: true })
  },
})

export async function enqueueWrite(kind: QueueEntry['kind'], payload: unknown) {
  const db = await dbPromise
  await db.add('pending-writes', { kind, payload, createdAt: Date.now() })
}

export async function getQueueCount(): Promise<number> {
  const db = await dbPromise
  return db.count('pending-writes')
}

export async function flushQueue(handlers: {
  vote: (payload: { proposalId: string; playerId: string; option: 'yes' | 'no' }) => Promise<void>
  proposal: (payload: unknown) => Promise<void>
}) {
  const db = await dbPromise
  const all = await db.getAll('pending-writes')
  for (const entry of all) {
    try {
      if (entry.kind === 'vote') {
        await handlers.vote(entry.payload as { proposalId: string; playerId: string; option: 'yes' | 'no' })
      } else {
        await handlers.proposal(entry.payload)
      }
      if (entry.id != null) await db.delete('pending-writes', entry.id)
    } catch {
      // still offline or the request failed — leave it queued, retry next flush
    }
  }
}
