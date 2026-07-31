import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '../shared/components'

type Props = { children: ReactNode }
type State = { failed: boolean }
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }
  static getDerivedStateFromError(): State { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo): void { void error; void info }
  render(): ReactNode { return this.state.failed ? <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><section className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm"><h1 className="font-serif text-2xl">Something went wrong</h1><p className="mt-2 text-sm text-slate-500">Your current data has not been submitted. Reload to recover the application.</p><Button className="mt-5" type="button" onClick={() => window.location.reload()}>Reload application</Button></section></main> : this.props.children }
}
