import type { PropsWithChildren } from 'react'
export function Modal({ children }: PropsWithChildren) { return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">{children}</section></div> }
