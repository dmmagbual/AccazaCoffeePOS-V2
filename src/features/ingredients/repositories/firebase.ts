import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, type DocumentData, type Firestore } from 'firebase/firestore'
import { COLLECTIONS } from '../../../shared/config'
import { documentConverter } from '../../../shared/firebase'
import type { Ingredient } from '../domain'
import type { IngredientRepository } from './interfaces'

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
