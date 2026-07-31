import { Heart, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { Card } from '../../../shared/components'
import { OrderSummaryPanel } from '../components/OrderSummaryPanel'
import { ProductGrid } from '../components/ProductGrid'
import { ProductOperationalStatus } from '../components/ProductOperationalStatus'
import { filterProducts, getFavoriteProducts, useCartStore, useProductStore } from '../stores'

export function PointOfSalePage() {
  const selectedCategory = useProductStore((state) => state.selectedCategory)
  const query = useProductStore((state) => state.searchFilter)
  const categories = useProductStore((state) => state.categories)
  const products = useProductStore((state) => state.products)
  const catalogStatus = useProductStore((state) => state.status)
  const loadCatalog = useProductStore((state) => state.loadCatalog)
  const setSelectedCategory = useProductStore((state) => state.setSelectedCategory)
  const setQuery = useProductStore((state) => state.setSearchFilter)
  const favorites = useMemo(() => getFavoriteProducts(products), [products])
  const visibleProducts = useMemo(() => filterProducts(products, selectedCategory, query), [products, selectedCategory, query])
  const addProduct = useCartStore((state) => state.addItem)
  const searchInput = useRef<HTMLInputElement>(null)

  useEffect(() => { void loadCatalog() }, [loadCatalog])
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { const target = event.target as HTMLElement | null; if (event.key === '/' && target?.tagName !== 'INPUT' && target?.tagName !== 'TEXTAREA') { event.preventDefault(); searchInput.current?.focus() } }; window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown) }, [])

  return <div className="grid min-h-[calc(100vh-6.5rem)] gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(22rem,3fr)]">
    <section className="min-w-0 space-y-5"><header><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Point of sale</p><h1 className="mt-2 font-serif text-3xl tracking-tight">Create an order</h1></header><label className="relative block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input ref={searchInput} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm outline-none transition focus:border-emerald-600" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products (/)" />{query && <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" type="button" aria-label="Clear product search" onClick={() => setQuery('')}><X size={17} /></button>}</label><div className="flex gap-2 overflow-x-auto pb-1"><button type="button" onClick={() => setSelectedCategory('all')} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${selectedCategory === 'all' ? 'bg-slate-950 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'}`}>All</button>{categories.map((category) => <button key={category.id} type="button" onClick={() => setSelectedCategory(category.id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${selectedCategory === category.id ? 'bg-slate-950 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'}`}>{category.name}</button>)}</div><section><div className="mb-3 flex items-center gap-2"><Heart size={17} className="fill-rose-500 text-rose-500" /><h2 className="text-sm font-semibold">Favorites</h2></div><ProductGrid products={favorites} categories={categories} onAdd={addProduct} /></section><section><h2 className="mb-3 text-sm font-semibold">All products</h2>{catalogStatus === 'loading' || catalogStatus === 'idle' ? <Card className="p-8 text-center text-sm text-slate-500">Loading products…</Card> : visibleProducts.length ? <ProductGrid products={visibleProducts} categories={categories} onAdd={addProduct} /> : <Card className="p-8 text-center text-sm text-slate-500">No products match your search.</Card>}</section>{catalogStatus === 'ready' && <ProductOperationalStatus products={visibleProducts} />}</section>
    <OrderSummaryPanel />
  </div>
}
