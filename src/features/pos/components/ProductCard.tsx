import { Heart, Plus } from 'lucide-react'
import { Button, Card } from '../../../shared/components'
import type { Product } from '../domain'

interface ProductCardProps { product: Product; categoryName: string; onAdd: (product: Product) => void }

export function ProductCard({ product, categoryName, onAdd }: ProductCardProps) {
  const stockQuantity = product.inventory.stockQuantity
  const isAvailable = product.available && (!product.inventory.trackInventory || stockQuantity > 0)
  const stockLabel = !isAvailable ? 'Out of stock' : product.inventory.trackInventory && stockQuantity <= product.inventory.minimumStock ? `${stockQuantity} left` : 'In stock'
  const stockClass = !isAvailable ? 'bg-rose-100 text-rose-800' : product.inventory.trackInventory && stockQuantity <= product.inventory.minimumStock ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'

  return <Card className="group overflow-hidden"><div className="relative aspect-[4/3] bg-slate-100"><img className="size-full object-cover" src={product.image.url} alt={product.image.alt} /><span className={`absolute bottom-2 left-2 rounded-full px-2 py-1 text-[10px] font-bold ${stockClass}`}>{stockLabel}</span>{product.favorite && <Heart className="absolute right-2 top-2 fill-rose-500 text-rose-500" size={17} aria-label="Favorite" />}</div><div className="p-3"><p className="text-xs font-medium text-slate-500">{categoryName}</p><p className="mt-1 truncate text-sm font-semibold text-slate-800">{product.name}</p><div className="mt-3 flex items-center justify-between gap-2"><span className="text-sm font-bold text-emerald-700">₱{product.pricing.sellingPrice.toFixed(2)}</span><Button className="px-2.5 py-1.5 text-xs" type="button" disabled={!isAvailable} onClick={() => onAdd(product)}><Plus size={14} />Add</Button></div></div></Card>
}
