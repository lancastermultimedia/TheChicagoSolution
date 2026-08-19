import type { IconName } from '../components/Icon'

export function conditionToIcon(condition: string): IconName {
  const c = condition.toLowerCase()
  if (c.includes('storm') || c.includes('thunder')) return 'cloud-bolt'
  if (c.includes('rain') || c.includes('shower')) return 'cloud'
  if (c.includes('cloud') || c.includes('overcast')) return 'cloud-sun'
  if (c.includes('sun') || c.includes('clear')) return 'sun'
  return 'cloud-sun'
}
