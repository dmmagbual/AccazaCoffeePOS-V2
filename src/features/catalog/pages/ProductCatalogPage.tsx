import { Boxes, Layers3, PackagePlus, SlidersHorizontal, Tags } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, Page } from '../../../shared/components'
import { ROUTES } from '../../../shared/config'

const areas = [
  { title: 'Product categories', description: 'Hierarchy, visibility, controlled ordering, and deactivation.', icon: Layers3, to: ROUTES.menuManagement },
  { title: 'Products', description: 'Product master, POS visibility, recipe links, and branch availability.', icon: PackagePlus, to: ROUTES.menuManagement },
  { title: 'Sizes & variations', description: 'Default variations, variation recipes, and variation prices.', icon: SlidersHorizontal, to: ROUTES.menuManagement },
  { title: 'Modifiers & add-ons', description: 'Structured recipe effects, price adjustments, and selection rules.', icon: Tags, to: ROUTES.recipes },
  { title: 'Combos & menu layout', description: 'Bundle pricing, availability, favorites, and quick access.', icon: Boxes, to: ROUTES.menuManagement },
] as const
export function ProductCatalogPage() { return <Page eyebrow="Products & recipes" title="Product catalog" description="Manage the organization product catalog. Recipe cost and inventory consumption remain controlled by their existing services."><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{areas.map(({ title, description, icon: Icon, to }) => <Card className="p-5" key={title}><Icon className="text-emerald-700" size={22} /><h2 className="mt-4 font-semibold">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p><Link to={to} className="mt-4 inline-block text-sm font-medium text-emerald-700">Open configuration</Link></Card>)}</div></Page> }
