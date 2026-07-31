import { useState } from 'react'
import { Button, Dialog } from '../../../shared/components'
import type { Ingredient, IngredientCategoryOption, IngredientUnit, SupplierOption } from '../domain'
import { ingredientCreateSchema } from '../types'
import { validateIngredientUnitConversion, withCalculatedBaseUnitCost } from '../services'

type Props = { ingredient: Ingredient; categories: readonly IngredientCategoryOption[]; units: readonly IngredientUnit[]; suppliers: readonly SupplierOption[]; open: boolean; onClose: () => void; onSave: (ingredient: Ingredient) => void }
type FormState = Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'baseUnitCost'>

function toFormState(ingredient: Ingredient): FormState { return { organizationId: ingredient.organizationId, name: ingredient.name, description: ingredient.description, ingredientCategoryId: ingredient.ingredientCategoryId, baseUnitId: ingredient.baseUnitId, purchasingUnitId: ingredient.purchasingUnitId, purchasingToBaseUnitConversion: ingredient.purchasingToBaseUnitConversion, sku: ingredient.sku, barcode: ingredient.barcode, brand: ingredient.brand, preferredSupplierId: ingredient.preferredSupplierId, latestPurchaseCost: ingredient.latestPurchaseCost, trackInventory: ingredient.trackInventory, minimumStockLevel: ingredient.minimumStockLevel, reorderQuantity: ingredient.reorderQuantity, shelfLifeDays: ingredient.shelfLifeDays, storageInstructions: ingredient.storageInstructions, allergens: ingredient.allergens, status: ingredient.status } }

export function IngredientEditorDialog({ ingredient, categories, units, suppliers, open, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>(() => toFormState(ingredient))
  const [error, setError] = useState('')
  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((current) => ({ ...current, [field]: value }))
  function save() {
    const parsed = ingredientCreateSchema.safeParse(form)
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Review the ingredient details.'); return }
    const baseUnit = units.find((unit) => unit.id === form.baseUnitId)
    const purchasingUnit = units.find((unit) => unit.id === form.purchasingUnitId)
    if (!baseUnit || !purchasingUnit) { setError('Select valid base and purchasing units.'); return }
    try {
      validateIngredientUnitConversion(baseUnit, purchasingUnit, form.purchasingToBaseUnitConversion)
      onSave(withCalculatedBaseUnitCost({ ...ingredient, ...form }))
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save ingredient.') }
  }
  const inputClass = 'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600'
  return <Dialog title={`Edit ${ingredient.name}`} open={open} onClose={onClose} footer={<><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="button" onClick={save}>Save ingredient</Button></>}><div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
    {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <label className="block text-sm font-medium">Ingredient name<input className={inputClass} value={form.name} onChange={(event) => setField('name', event.target.value)} /></label>
    <label className="block text-sm font-medium">Description<textarea className={inputClass} rows={2} value={form.description} onChange={(event) => setField('description', event.target.value)} /></label>
    <div className="grid gap-3 sm:grid-cols-2"><SelectField label="Category" value={form.ingredientCategoryId} onChange={(value) => setField('ingredientCategoryId', value)} options={categories} /><SelectField label="Preferred supplier" value={form.preferredSupplierId ?? ''} onChange={(value) => setField('preferredSupplierId', value || null)} options={suppliers} emptyLabel="No preferred supplier" /></div>
    <div className="grid gap-3 sm:grid-cols-2"><SelectField label="Base unit" value={form.baseUnitId} onChange={(value) => setField('baseUnitId', value)} options={units} /><SelectField label="Purchasing unit" value={form.purchasingUnitId} onChange={(value) => setField('purchasingUnitId', value)} options={units} /></div>
    <div className="grid gap-3 sm:grid-cols-2"><NumberField label="Purchase-to-base conversion" value={form.purchasingToBaseUnitConversion} onChange={(value) => setField('purchasingToBaseUnitConversion', value)} /><NumberField label="Latest purchase cost (₱)" value={form.latestPurchaseCost} min={0} onChange={(value) => setField('latestPurchaseCost', value)} /></div>
    <div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-medium">SKU<input className={inputClass} value={form.sku} onChange={(event) => setField('sku', event.target.value)} /></label><label className="block text-sm font-medium">Barcode<input className={inputClass} value={form.barcode} onChange={(event) => setField('barcode', event.target.value)} /></label></div>
    <label className="block text-sm font-medium">Brand<input className={inputClass} value={form.brand} onChange={(event) => setField('brand', event.target.value)} /></label>
    <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.trackInventory} onChange={(event) => setField('trackInventory', event.target.checked)} />Track inventory</label>
    {form.trackInventory && <div className="grid gap-3 sm:grid-cols-2"><NumberField label="Minimum stock" value={form.minimumStockLevel ?? 0} min={0} onChange={(value) => setField('minimumStockLevel', value || null)} /><NumberField label="Reorder quantity" value={form.reorderQuantity ?? 0} min={0} onChange={(value) => setField('reorderQuantity', value || null)} /></div>}
    <NumberField label="Shelf life (days)" value={form.shelfLifeDays ?? 0} min={0} onChange={(value) => setField('shelfLifeDays', value || null)} />
    <label className="block text-sm font-medium">Storage instructions<textarea className={inputClass} rows={2} value={form.storageInstructions} onChange={(event) => setField('storageInstructions', event.target.value)} /></label>
    <label className="block text-sm font-medium">Allergens<select multiple className={inputClass} value={form.allergens} onChange={(event) => setField('allergens', Array.from(event.target.selectedOptions, (option) => option.value as Ingredient['allergens'][number]))}><option value="none">None</option><option value="milk">Milk</option><option value="soy">Soy</option><option value="gluten">Gluten</option><option value="nuts">Nuts</option><option value="eggs">Eggs</option></select></label>
    <label className="block text-sm font-medium">Status<select className={inputClass} value={form.status} onChange={(event) => setField('status', event.target.value as Ingredient['status'])}><option value="active">Active</option><option value="archived">Archived</option></select></label>
  </div></Dialog>
}
function SelectField({ label, value, onChange, options, emptyLabel }: { label: string; value: string; onChange: (value: string) => void; options: readonly { id: string; name: string }[]; emptyLabel?: string }) { return <label className="block text-sm font-medium">{label}<select className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600" value={value} onChange={(event) => onChange(event.target.value)}>{emptyLabel && <option value="">{emptyLabel}</option>}{options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label> }
function NumberField({ label, value, onChange, min = 0 }: { label: string; value: number; min?: number; onChange: (value: number) => void }) { return <label className="block text-sm font-medium">{label}<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600" type="number" min={min} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label> }
