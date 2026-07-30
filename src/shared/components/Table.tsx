import type { PropsWithChildren } from 'react'
export function Table({ children }: PropsWithChildren) { return <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full text-left text-sm">{children}</table></div> }
