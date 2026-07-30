import type { HTMLAttributes, PropsWithChildren } from 'react'

type CardProps = PropsWithChildren<HTMLAttributes<HTMLElement>>

export function Card({ children, className = '', ...props }: CardProps) {
  return <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`} {...props}>{children}</section>
}
