import type { PropsWithChildren } from 'react'
type Props = PropsWithChildren<{ className?: string; title?: string; description?: string }>
export function Card({ children, className = '', title, description }: Props) { return <section className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{title && <header className="mb-5"><h2 className="text-sm font-semibold">{title}</h2>{description && <p className="mt-1 text-xs text-slate-500">{description}</p>}</header>}{children}</section> }
