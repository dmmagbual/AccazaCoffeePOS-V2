import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & { variant?: 'primary' | 'secondary' }
export function Button({ children, className = '', variant = 'primary', ...props }: Props) { return <button className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${variant === 'primary' ? 'bg-emerald-700 text-white hover:bg-emerald-800' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'} ${className}`} {...props}>{children}</button> }
