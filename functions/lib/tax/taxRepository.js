import { HttpsError } from 'firebase-functions/https';
import { isEffective } from '../catalog/validation.js';
export class TaxRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async getProfileById(organizationId, id) { const doc = await this.db.collection('taxProfiles').doc(id).get(); if (!doc.exists)
        throw new HttpsError('not-found', 'Tax profile was not found.'); const value = { id: doc.id, ...doc.data() }; if (value.organizationId !== organizationId)
        throw new HttpsError('permission-denied', 'Tax profile is outside organization scope.'); return value; }
    async getConfigurationVersionById(organizationId, profileId, versionId) { const doc = await this.db.collection('taxConfigurationVersions').doc(versionId).get(); if (!doc.exists)
        throw new HttpsError('not-found', 'Tax configuration version was not found.'); const value = { id: doc.id, ...doc.data() }; if (value.organizationId !== organizationId || value.taxProfileId !== profileId)
        throw new HttpsError('permission-denied', 'Tax version is outside organization scope.'); return value; }
    async resolveOrganizationDefault(organizationId) { const query = await this.db.collection('taxProfiles').where('organizationId', '==', organizationId).where('active', '==', true).where('defaultForOrganization', '==', true).limit(2).get(); if (query.size !== 1)
        throw new HttpsError('failed-precondition', 'A single organization default tax profile is required.'); return { id: query.docs[0].id, ...query.docs[0].data() }; }
    async resolveBranchOverride(organizationId, branchId) { return this.assignment(organizationId, 'BRANCH', branchId); }
    resolveCategoryTax(organizationId, categoryId) { return this.assignment(organizationId, 'CATEGORY', categoryId); }
    resolveProductTax(organizationId, productId) { return this.assignment(organizationId, 'PRODUCT', productId); }
    resolveVariationTax(organizationId, variationId) { return this.assignment(organizationId, 'VARIATION', variationId); }
    resolveOptionTax(organizationId, optionId) { return this.assignment(organizationId, 'OPTION', optionId); }
    async assignment(organizationId, scope, scopeId, at = new Date()) { const query = await this.db.collection('taxAssignments').where('organizationId', '==', organizationId).where('scope', '==', scope).where('scopeId', '==', scopeId).where('active', '==', true).limit(10).get(); const values = query.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((value) => isEffective(value.effectiveFrom, value.effectiveTo, at)); if (values.length > 1)
        throw new HttpsError('failed-precondition', 'Overlapping tax assignments are not permitted.'); return values[0] ?? null; }
    validateEffectivePeriod(version, at = new Date()) { if (!version.active || !isEffective(version.effectiveFrom, version.effectiveTo, at))
        throw new HttpsError('failed-precondition', 'Tax version is not effective.'); }
    validateNoOverlap(versions) { const sorted = [...versions].sort((a, b) => a.effectiveFrom.getTime() - b.effectiveFrom.getTime()); for (let index = 1; index < sorted.length; index += 1) {
        const previous = sorted[index - 1];
        const current = sorted[index];
        if (previous && current && (!previous.effectiveTo || previous.effectiveTo >= current.effectiveFrom))
            throw new HttpsError('failed-precondition', 'Tax configuration versions overlap.');
    } }
    async effectiveVersion(organizationId, profileId, at = new Date()) { const query = await this.db.collection('taxConfigurationVersions').where('organizationId', '==', organizationId).where('taxProfileId', '==', profileId).where('active', '==', true).limit(25).get(); const values = query.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((value) => isEffective(value.effectiveFrom, value.effectiveTo, at)); if (values.length !== 1)
        throw new HttpsError('failed-precondition', 'A single effective tax version is required.'); return values[0]; }
}
