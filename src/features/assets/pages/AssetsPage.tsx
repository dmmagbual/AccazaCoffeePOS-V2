import { Wrench } from 'lucide-react'
import { Card, Page } from '../../../shared/components'
export function AssetsPage() { return <Page eyebrow="Operations" title="Assets & maintenance" description="Branch-owned equipment, preventive maintenance, downtime, and service history."><Card className="p-5"><Wrench className="text-emerald-700" size={22} /><h2 className="mt-4 font-semibold">Preventive maintenance</h2><p className="mt-1 text-sm text-slate-500">Maintenance plans create safe scheduled occurrences; work orders remain workflow-ready.</p></Card></Page> }
