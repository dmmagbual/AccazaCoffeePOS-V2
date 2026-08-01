import type { Firestore } from 'firebase-admin/firestore'
import { HttpsError } from 'firebase-functions/https'
import { isBranchAvailable } from './validation.js'
import type { ProductOptionAssignmentDocument } from './types.js'

export class ProductOptionAssignmentRepository {
  constructor(private readonly db: Firestore) {}
  private async list(organizationId: string, branchId: string, field: 'productId' | 'variationId', id: string) { const query = await this.db.collection('productOptionAssignments').where('organizationId', '==', organizationId).where(field, '==', id).where('active', '==', true).limit(50).get(); return query.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<ProductOptionAssignmentDocument, 'id'>) })).filter((item) => isBranchAvailable(item.branchAvailability, branchId)) }
  listAssignmentsForProduct(organizationId: string, branchId: string, productId: string) { return this.list(organizationId, branchId, 'productId', productId) }
  listAssignmentsForVariation(organizationId: string, branchId: string, variationId: string) { return this.list(organizationId, branchId, 'variationId', variationId) }
  async validateOptionGroupAssigned(organizationId: string, branchId: string, productId: string, variationId: string | undefined, optionGroupId: string) { const assignments = [...await this.listAssignmentsForProduct(organizationId, branchId, productId), ...(variationId ? await this.listAssignmentsForVariation(organizationId, branchId, variationId) : [])]; const assignment = assignments.find((value) => value.optionGroupId === optionGroupId); if (!assignment) throw new HttpsError('permission-denied', 'Option group is not assigned to this product.'); return assignment }
  resolveAssignmentOverrides(assignment: ProductOptionAssignmentDocument) { return { required: assignment.requiredOverride, minimumSelections: assignment.minimumOverride, maximumSelections: assignment.maximumOverride, sortOrder: assignment.sortOrder } }
}
