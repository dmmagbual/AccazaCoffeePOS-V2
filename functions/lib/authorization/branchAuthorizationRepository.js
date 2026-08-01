import { HttpsError } from 'firebase-functions/https';
export class BranchAuthorizationRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async getOrganization(id) { const doc = await this.db.collection('organizations').doc(id).get(); if (!doc.exists)
        throw new HttpsError('not-found', 'Organization was not found.'); return { id: doc.id, ...doc.data() }; }
    async getBranch(organizationId, id) { const doc = await this.db.collection('branches').doc(id).get(); if (!doc.exists)
        throw new HttpsError('not-found', 'Branch was not found.'); const value = { id: doc.id, ...doc.data() }; if (value.organizationId !== organizationId)
        throw new HttpsError('permission-denied', 'User is not authorized for this organization.'); return value; }
    async validateOrganizationActive(organizationId) { const value = await this.getOrganization(organizationId); if (!value.active)
        throw new HttpsError('failed-precondition', 'Organization is inactive.'); return value; }
    async validateBranchActive(organizationId, branchId) { const value = await this.getBranch(organizationId, branchId); if (!value.active)
        throw new HttpsError('failed-precondition', 'Branch is inactive.'); return value; }
    validateUserOrganizationAccess(context, organizationId) { if (context.organizationId !== organizationId || (context.franchiseOrganizationId && context.franchiseOrganizationId !== organizationId && !context.headOfficeScope))
        throw new HttpsError('permission-denied', 'User is not authorized for this organization.'); }
    validateUserBranchAccess(context, branchId) { if (context.branchId && context.branchId !== branchId && !context.permissions.includes('branches.all'))
        throw new HttpsError('permission-denied', 'User is not authorized for this branch.'); }
    async validateEmployeeActive(organizationId, employeeId) { const doc = await this.db.collection('employees').doc(employeeId).get(); if (!doc.exists)
        throw new HttpsError('not-found', 'Employee was not found.'); const value = { id: doc.id, ...doc.data() }; if (value.organizationId !== organizationId || !value.active)
        throw new HttpsError('failed-precondition', 'Employee is not active.'); return value; }
    async validateEmployeeBranchAssignment(organizationId, employeeId, branchId) { const query = await this.db.collection('employeeBranchAssignments').where('organizationId', '==', organizationId).where('employeeId', '==', employeeId).where('branchId', '==', branchId).where('active', '==', true).limit(1).get(); if (query.empty)
        throw new HttpsError('permission-denied', 'Employee is not assigned to this branch.'); return { id: query.docs[0].id, ...query.docs[0].data() }; }
    validatePermission(context, permission) { if (!context.permissions.includes(permission) && !context.permissions.includes('*'))
        throw new HttpsError('permission-denied', 'Required permission is missing.'); }
    async validateOpenShiftAccess(organizationId, branchId, employeeId) { const query = await this.db.collection('shifts').where('organizationId', '==', organizationId).where('storeId', '==', branchId).where('cashierId', '==', employeeId).where('status', '==', 'OPEN').limit(1).get(); if (query.empty)
        throw new HttpsError('failed-precondition', 'An open shift is required.'); return { id: query.docs[0].id, ...query.docs[0].data() }; }
    async resolveBranchTimezone(organizationId, branchId) { return (await this.validateBranchActive(organizationId, branchId)).timezone; }
    async resolveBranchCurrency(organizationId, branchId) { return (await this.validateBranchActive(organizationId, branchId)).currencyCode; }
    async resolveBranchSettings(organizationId, branchId) { return (await this.validateBranchActive(organizationId, branchId)).settings ?? {}; }
}
