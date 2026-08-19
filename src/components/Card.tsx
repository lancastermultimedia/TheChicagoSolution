import type { HTMLAttributes } from 'react'
import clsx from 'clsx'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('border-[1.5px] border-ink bg-white', className)}
      {...props}
    />
  )
}
