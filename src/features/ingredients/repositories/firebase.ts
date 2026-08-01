import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, type DocumentData, type Firestore } from 'firebase/firestore'
import { COLLECTIONS } from '../../../shared/config'
import { documentConverter } from '../../../shared/firebase'
import type { Ingredient, IngredientCategory, IngredientMaster } from '../domain'
import type { IngredientCategoryRepository, IngredientMasterRepository, IngredientRepository } from './interfaces'

export function createFirebaseIngredientRepository(firestore: Firestore): IngredientRepository {
  const reference = collection(firestore, COLLECTIONS.ingredients).withConverter(documentConverter<Ingredient>())
  return {
    async getById(id) {
      const snapshot = await getDoc(doc(reference, id))
      return snapshot.exists() ? snapshot.data() : null
    },
    async list(organizationId) {
      const snapshots = await getDocs(query(reference, where('organizationId', '==', organizationId)))
      return snapshots.docs.map((snapshot) => snapshot.data())
    },
    async create(ingredient) {
      await setDoc(doc(reference, ingredient.id), ingredient)
      return ingredient
    },
    async update(id, updates) { await updateDoc(doc(reference, id), updates as DocumentData) },
  }
}
function masterReference<T extends DocumentData>(firestore: Firestore, name: string) { return collection(firestore, name).withConverter(documentConverter<T>()) }
export function createFirebaseIngredientMasterRepository(firestore: Firestore): IngredientMasterRepository { const reference = masterReference<IngredientMaster>(firestore, COLLECTIONS.ingredients); return { async getByCode(organizationId, ingredientCode) { const snapshots = await getDocs(query(reference, where('organizationId', '==', organizationId), where('ingredientCode', '==', ingredientCode))); return snapshots.docs[0]?.data() ?? null }, async list(organizationId) { const snapshots = await getDocs(query(reference, where('organizationId', '==', organizationId))); return snapshots.docs.map((item) => item.data()) }, async create(ingredient) { await setDoc(doc(reference, ingredient.id), ingredient); return ingredient }, async update(id, updates) { await updateDoc(doc(reference, id), updates as DocumentData) } } }
export function createFirebaseIngredientCategoryRepository(firestore: Firestore): IngredientCategoryRepository { const reference = masterReference<IngredientCategory>(firestore, 'ingredientCategories'); return { async list(organizationId) { const snapshots = await getDocs(query(reference, where('organizationId', '==', organizationId))); return snapshots.docs.map((item) => item.data()) }, async create(category) { await setDoc(doc(reference, category.id), category); return category }, async update(id, updates) { await updateDoc(doc(reference, id), updates as DocumentData) } } }
