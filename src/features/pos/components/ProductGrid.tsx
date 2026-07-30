import { useMemo } from 'react'
import type { Category, Product } from '../domain'
import { ProductCard } from './ProductCard'

interface ProductGridProps { products: readonly Product[]; categories: readonly Category[]; onAdd: (product: Product) => void }

export function ProductGrid({ products, categories, onAdd }: ProductGridProps) {
  const categoryNames = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories])
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">{products.map((product) => <ProductCard key={product.id} product={product} categoryName={categoryNames.get(product.category.id) ?? 'Uncategorized'} onAdd={onAdd} />)}</div>
}
