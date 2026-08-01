import { HttpsError } from 'firebase-functions/https';
import { assertOrganization, isBranchAvailable } from './validation.js';
const collection = 'productCategories';
export class CategoryRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async read(id) { const snapshot = await this.db.collection(collection).doc(id).get(); if (!snapshot.exists)
        throw new HttpsError('not-found', 'Product category was not found.'); return { id: snapshot.id, ...snapshot.data() }; }
    async getById(organizationId, id) { const value = await this.read(id); assertOrganization(value.organizationId, organizationId); return value; }
    async getByCode(organizationId, code) { const query = await this.db.collection(collection).where('organizationId', '==', organizationId).where('code', '==', code).limit(1).get(); if (query.empty)
        throw new HttpsError('not-found', 'Product category was not found.'); return { id: query.docs[0].id, ...query.docs[0].data() }; }
    async listActiveByOrganization(organizationId) { const query = await this.db.collection(collection).where('organizationId', '==', organizationId).where('active', '==', true).orderBy('sortOrder').limit(250).get(); return query.docs.map((doc) => ({ id: doc.id, ...doc.data() })); }
    async listVisibleForBranch(organizationId, branchId) { return (await this.listActiveByOrganization(organizationId)).filter((category) => category.visibleOnPOS && isBranchAvailable(category.branchAvailability, branchId)); }
    async validateCategoryForProduct(organizationId, branchId, id) { const category = await this.getById(organizationId, id); if (!category.active || !category.visibleOnPOS || !isBranchAvailable(category.branchAvailability, branchId))
        throw new HttpsError('failed-precondition', 'Product category is not sellable for this branch.'); return category; }
    async resolveCategorySnapshot(organizationId, branchId, id) { const category = await this.validateCategoryForProduct(organizationId, branchId, id); return { categoryId: category.id, categoryCode: category.code, categoryName: category.name, ...(category.parentCategoryId ? { parentCategoryId: category.parentCategoryId } : {}), sortOrder: category.sortOrder, visibleOnPOS: category.visibleOnPOS }; }
    async validateHierarchy(organizationId, categoryId, parentCategoryId) { if (parentCategoryId) {
        const parent = await this.getById(organizationId, parentCategoryId);
        if (!parent.active || parent.id === categoryId)
            throw new HttpsError('failed-precondition', 'Category hierarchy is invalid.');
        await this.preventHierarchyCycle(organizationId, categoryId, parent.id);
    } }
    async preventHierarchyCycle(organizationId, categoryId, parentCategoryId) { let cursor = parentCategoryId; const seen = new Set(); while (cursor) {
        if (cursor === categoryId || seen.has(cursor))
            throw new HttpsError('failed-precondition', 'Category hierarchy contains a cycle.');
        seen.add(cursor);
        cursor = (await this.getById(organizationId, cursor)).parentCategoryId;
    } }
}
