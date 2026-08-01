import { CalendarClock, Landmark, Percent, ShieldCheck } from 'lucide-react'
import { Card, Page } from '../../../shared/components'

const safeguards = [
  { title: 'Effective-dated rates', description: 'Each rate is a separate version. Published transaction snapshots are never recalculated.', icon: CalendarClock },
  { title: 'Controlled decimal rates', description: 'Rates are configuration values, not constants. Calculations use currency minor units and explicit rounding.', icon: Percent },
  { title: 'Account mappings', description: 'Tax payable, recoverable tax, and tax expense accounts are configured per profile.', icon: Landmark },
  { title: 'Authorized changes', description: 'Profile, rate, applicability, and override actions require the relevant tax permission and an audit record.', icon: ShieldCheck },
] as const

export function TaxConfigurationPage() { return <Page eyebrow="Finance settings" title="Tax configuration" description="Maintain organization-controlled tax profiles and effective-dated rate versions. Rates are never hardcoded into the POS."><div className="grid gap-4 sm:grid-cols-2">{safeguards.map(({ title, description, icon: Icon }) => <Card key={title} className="p-5"><Icon className="text-emerald-700" size={22} /><h2 className="mt-4 font-semibold">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></Card>)}</div><Card className="mt-5 p-5"><h2 className="font-semibold">Resolution order</h2><p className="mt-2 text-sm text-slate-600">Authorized transaction override → product or variation → product category → branch default → organization default.</p><p className="mt-2 text-sm text-slate-500">The central service and Firestore policy define the required controls. This screen intentionally does not grant cashier rate editing.</p></Card></Page> }
