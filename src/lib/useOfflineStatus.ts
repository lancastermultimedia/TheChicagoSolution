import { useEffect, useState } from 'react'
import { getQueueCount } from './offlineQueue'
import { flushOfflineQueue } from './proposals'

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [queueCount, setQueueCount] = useState(0)

  useEffect(() => {
    function refreshCount() {
      getQueueCount().then(setQueueCount)
    }
    refreshCount()

    // Covers launching already-online with writes queued from a prior
    // offline session (no 'online' event will fire in that case).
    if (navigator.onLine) {
      flushOfflineQueue().then(refreshCount)
    }

    async function handleOnline() {
      setIsOnline(true)
      await flushOfflineQueue()
      refreshCount()
    }
    function handleOffline() {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    const interval = setInterval(refreshCount, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  return { isOnline, queueCount }
}
