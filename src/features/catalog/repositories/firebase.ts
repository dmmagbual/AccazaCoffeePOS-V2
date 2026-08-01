import { collection, getDocs, limit, query, where, type Firestore } from 'firebase/firestore'
import { documentConverter } from '../../../shared/firebase'
import type { CatalogProduct, MenuAvailability, ModifierGroup, PosMenuLayout, ProductCategory, ProductVariation } from '../domain'
import type { CatalogQuery, CatalogRepositories, CatalogRepository } from './interfaces'

function repository<T extends { id: string; organizationId: string }>(firestore: Firestore, name: string): CatalogRepository<T> {
  const reference = collection(firestore, name).withConverter(documentConverter<T>())
  return { async getById(id) { const records = await getDocs(query(reference, where('id', '==', id), limit(1))); return records.docs[0]?.data() ?? null }, async list(input: CatalogQuery) { const records = await getDocs(query(reference, where('organizationId', '==', input.organizationId), limit(input.limit))); return records.docs.map((record) => record.data()) }, async create(record) { void record; throw new Error(`Trusted catalog write command is required to create ${name}.`) }, async update() { throw new Error(`Trusted catalog write command is required to update ${name}.`) } }
}
export function createCatalogRepositories(firestore: Firestore): CatalogRepositories { return { categories: repository<ProductCategory>(firestore, 'productCategories'), products: repository<CatalogProduct>(firestore, 'products'), variations: repository<ProductVariation>(firestore, 'productVariations'), optionGroups: repository<ModifierGroup>(firestore, 'optionGroups'), availability: repository<MenuAvailability>(firestore, 'productAvailability'), layouts: repository<PosMenuLayout>(firestore, 'posMenuLayouts') } }
