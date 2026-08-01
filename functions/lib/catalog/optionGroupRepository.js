import { HttpsError } from 'firebase-functions/https';
import { assertOrganization, isBranchAvailable } from './validation.js';
export class OptionGroupRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async read(id) { const snapshot = await this.db.collection('optionGroups').doc(id).get(); if (!snapshot.exists)
        throw new HttpsError('not-found', 'Option group was not found.'); return { id: snapshot.id, ...snapshot.data() }; }
    async getById(organizationId, id) { const value = await this.read(id); assertOrganization(value.organizationId, organizationId); return value; }
    assignments(organizationId, field, id, branchId) { return this.db.collection('productOptionAssignments').where('organizationId', '==', organizationId).where(field, '==', id).where('active', '==', true).limit(50).get().then((query) => query.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((assignment) => isBranchAvailable(assignment.branchAvailability, branchId))); }
    async listAssignedToProduct(organizationId, branchId, productId) { const assignments = await this.assignments(organizationId, 'productId', productId, branchId); return Promise.all(assignments.map(async (assignment) => ({ assignment, group: await this.getById(organizationId, assignment.optionGroupId) }))); }
    async listAssignedToVariation(organizationId, branchId, variationId) { const assignments = await this.assignments(organizationId, 'variationId', variationId, branchId); return Promise.all(assignments.map(async (assignment) => ({ assignment, group: await this.getById(organizationId, assignment.optionGroupId) }))); }
    async resolveSelectionRules(organizationId, groupId, assignment) { const group = await this.getById(organizationId, groupId); return { selectionType: group.selectionType, required: assignment?.requiredOverride ?? group.required, minimumSelections: assignment?.minimumOverride ?? group.minimumSelections, maximumSelections: assignment?.maximumOverride ?? group.maximumSelections }; }
    async validateRequiredSelections(organizationId, groupId, selected, assignment) { const rules = await this.resolveSelectionRules(organizationId, groupId, assignment); if (rules.required && selected.length === 0)
        throw new HttpsError('failed-precondition', 'A required option group has no selection.'); }
    async validateMinimumSelections(organizationId, groupId, selected, assignment) { const rules = await this.resolveSelectionRules(organizationId, groupId, assignment); if (selected.length < rules.minimumSelections)
        throw new HttpsError('failed-precondition', 'Minimum option selections were not met.'); }
    async validateMaximumSelections(organizationId, groupId, selected, assignment) { const rules = await this.resolveSelectionRules(organizationId, groupId, assignment); if (selected.length > rules.maximumSelections || (rules.selectionType === 'SINGLE' && selected.length > 1))
        throw new HttpsError('failed-precondition', 'Maximum option selections were exceeded.'); }
    async resolveOptionGroupSnapshot(organizationId, branchId, id) { const group = await this.getById(organizationId, id); if (!group.active || !isBranchAvailable(group.branchAvailability, branchId))
        throw new HttpsError('failed-precondition', 'Option group is unavailable.'); return { optionGroupId: group.id, optionGroupCode: group.code, optionGroupName: group.name }; }
}
