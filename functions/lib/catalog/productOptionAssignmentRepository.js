"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductOptionAssignmentRepository = void 0;
const https_1 = require("firebase-functions/https");
const validation_js_1 = require("./validation.js");
class ProductOptionAssignmentRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async list(organizationId, branchId, field, id) { const query = await this.db.collection('productOptionAssignments').where('organizationId', '==', organizationId).where(field, '==', id).where('active', '==', true).limit(50).get(); return query.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((item) => (0, validation_js_1.isBranchAvailable)(item.branchAvailability, branchId)); }
    listAssignmentsForProduct(organizationId, branchId, productId) { return this.list(organizationId, branchId, 'productId', productId); }
    listAssignmentsForVariation(organizationId, branchId, variationId) { return this.list(organizationId, branchId, 'variationId', variationId); }
    async validateOptionGroupAssigned(organizationId, branchId, productId, variationId, optionGroupId) { const assignments = [...await this.listAssignmentsForProduct(organizationId, branchId, productId), ...(variationId ? await this.listAssignmentsForVariation(organizationId, branchId, variationId) : [])]; const assignment = assignments.find((value) => value.optionGroupId === optionGroupId); if (!assignment)
        throw new https_1.HttpsError('permission-denied', 'Option group is not assigned to this product.'); return assignment; }
    resolveAssignmentOverrides(assignment) { return { required: assignment.requiredOverride, minimumSelections: assignment.minimumOverride, maximumSelections: assignment.maximumOverride, sortOrder: assignment.sortOrder }; }
}
exports.ProductOptionAssignmentRepository = ProductOptionAssignmentRepository;
