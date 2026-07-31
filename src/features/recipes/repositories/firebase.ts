import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, type DocumentData, type Firestore } from 'firebase/firestore'
import { COLLECTIONS } from '../../../shared/config'
import { documentConverter } from '../../../shared/firebase'
import type { Recipe, RecipeVersion } from '../domain'
import type { RecipeRepository, RecipeVersionRepository } from './interfaces'

export function createFirebaseRecipeRepositories(firestore: Firestore): { recipes: RecipeRepository; versions: RecipeVersionRepository } {
  const recipes = collection(firestore, COLLECTIONS.recipes).withConverter(documentConverter<Recipe>())
  return { recipes: { async getById(id) { const snapshot = await getDoc(doc(recipes, id)); return snapshot.exists() ? snapshot.data() : null }, async list(organizationId) { const snapshots = await getDocs(query(recipes, where('organizationId', '==', organizationId))); return snapshots.docs.map((snapshot) => snapshot.data()) }, async create(recipe) { await setDoc(doc(recipes, recipe.id), recipe); return recipe }, async update(id, updates) { await updateDoc(doc(recipes, id), updates as DocumentData) } }, versions: { async list(recipeId) { const reference = collection(firestore, COLLECTIONS.recipes, recipeId, 'versions').withConverter(documentConverter<RecipeVersion>()); const snapshots = await getDocs(reference); return snapshots.docs.map((snapshot) => snapshot.data()) }, async create(version) { const reference = doc(firestore, COLLECTIONS.recipes, version.recipeId, 'versions', version.id).withConverter(documentConverter<RecipeVersion>()); await setDoc(reference, version); return version }, async update(recipeId, versionId, updates) { await updateDoc(doc(firestore, COLLECTIONS.recipes, recipeId, 'versions', versionId), updates as DocumentData) } } }
}
