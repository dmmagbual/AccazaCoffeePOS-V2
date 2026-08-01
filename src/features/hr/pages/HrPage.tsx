import { UsersRound } from 'lucide-react'
import { Card, Page } from '../../../shared/components'
export function HrPage() { return <Page eyebrow="People" title="Human resources" description="People, employee relationships, branch assignments, and payroll-free attendance foundations."><Card className="p-5"><UsersRound className="text-emerald-700" size={22} /><h2 className="mt-4 font-semibold">Employee foundation</h2><p className="mt-1 text-sm text-slate-500">Person identity stays separate from login identity and employment history.</p></Card></Page> }
