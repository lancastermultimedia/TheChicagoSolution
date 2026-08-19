import { useEffect, useState } from 'react'
import type { IconName } from '../components/Icon'

const CHICAGO = { lat: 41.8781, lon: -87.6298 }
const CACHE_KEY = 'chicago-solution:weather'
const STALE_MS = 3 * 60 * 60 * 1000 // refresh a few times a day, not on every load

interface Conditions {
  tempF: number
  label: string
  icon: IconName
}

interface WeatherCache {
  current: Conditions | null
  daily: Record<string, Conditions> // keyed by YYYY-MM-DD
  fetchedAt: number
}

function codeToConditions(code: number): Pick<Conditions, 'label' | 'icon'> {
  if (code === 0) return { label: 'Clear', icon: 'sun' }
  if (code <= 2) return { label: 'Partly Cloudy', icon: 'cloud-sun' }
  if (code === 3 || code === 45 || code === 48) return { label: 'Cloudy', icon: 'cloud' }
  if (code >= 51 && code <= 67) return { label: 'Rain', icon: 'cloud' }
  if (code >= 71 && code <= 86) return { label: 'Snow', icon: 'cloud' }
  if (code >= 95) return { label: 'Storms', icon: 'cloud-bolt' }
  return { label: 'Mild', icon: 'cloud-sun' }
}

function readCache(): WeatherCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as WeatherCache) : null
  } catch {
    return null
  }
}

export function useWeather() {
  const [cache, setCache] = useState<WeatherCache | null>(() => readCache())

  useEffect(() => {
    const isStale = !cache || Date.now() - cache.fetchedAt > STALE_MS
    if (!isStale) return

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${CHICAGO.lat}&longitude=${CHICAGO.lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,weather_code&temperature_unit=fahrenheit&timezone=America%2FChicago&forecast_days=10`

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        const current: Conditions = {
          tempF: Math.round(json.current.temperature_2m),
          ...codeToConditions(json.current.weather_code),
        }
        const daily: Record<string, Conditions> = {}
        const times: string[] = json.daily.time
        times.forEach((date: string, i: number) => {
          daily[date] = {
            tempF: Math.round(json.daily.temperature_2m_max[i]),
            ...codeToConditions(json.daily.weather_code[i]),
          }
        })
        const next: WeatherCache = { current, daily, fetchedAt: Date.now() }
        setCache(next)
        localStorage.setItem(CACHE_KEY, JSON.stringify(next))
      })
      .catch(() => {
        // offline or blocked — degrade to whatever's cached (or nothing, callers fall back to static data)
      })
  }, [cache])

  return {
    current: cache?.current ?? null,
    daily: cache?.daily ?? {},
    isLive: !!cache,
  }
}
