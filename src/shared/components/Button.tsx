import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-700 text-white hover:bg-emerald-800 disabled:bg-emerald-300',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 disabled:text-slate-400',
  danger: 'text-rose-700 hover:bg-rose-50 disabled:text-rose-300',
}

export function Button({ children, className = '', variant = 'primary', ...props }: ButtonProps) {
  return <button className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`} {...props}>{children}</button>
}
