export const scopedReadFixtureIds = Object.freeze({
  ownerOrganizationId: 'read-owner-org',
  ownerBranchId: 'read-owner-branch',
  cashierBranchId: 'read-cashier-branch',
  otherBranchId: 'read-other-branch',
  otherOrganizationId: 'read-other-org',
  franchiseOrganizationId: 'read-franchise-org',
  ownerShiftId: 'read-owner-shift',
  cashierShiftId: 'read-cashier-shift',
})

const fixtureDocuments = [
  ['cashierSaleSummaries', 'read-summary-owner'], ['receipts', 'read-receipt-owner'], ['orders', 'read-sale-owner'],
  ['journalEntries', 'read-journal-owner'], ['financePostingRequests', 'read-finance-owner'], ['stockMovements', 'read-cost-owner'],
  ['loyaltyBalances', 'read-loyalty-owner'], ['auditLogs', 'read-audit-owner'],
  ['cashierSaleSummaries', 'read-summary-cashier'], ['receipts', 'read-receipt-cashier'],
  ['cashierSaleSummaries', 'read-summary-other-branch'], ['receipts', 'read-receipt-other-branch'],
  ['cashierSaleSummaries', 'read-summary-other-org'], ['receipts', 'read-receipt-other-org'], ['journalEntries', 'read-journal-other-org'], ['loyaltyBalances', 'read-loyalty-other-org'],
  ['cashierSaleSummaries', 'read-summary-franchise'], ['receipts', 'read-receipt-franchise'], ['journalEntries', 'read-journal-franchise'], ['loyaltyBalances', 'read-loyalty-franchise'], ['auditLogs', 'read-audit-franchise'],
]

function createSummary(organizationId, branchId, shiftId, suffix, franchiseOrganizationId) {
  return {
    organizationId, branchId, shiftId, saleId: `read-sale-${suffix}`, receiptNumber: `READ-${suffix}`,
    completedAt: new Date('2026-01-15T12:00:00.000Z'), cashierUserId: 'security-cashier', status: 'COMPLETED',
    subtotal: 100, discountTotal: 0, taxCode: 'VAT', taxRateApplied: 0.1, taxAmount: 10, total: 110,
    ...(franchiseOrganizationId ? { franchiseOrganizationId } : {}),
  }
}

export async function seedScopedReadRecords(db) {
  const ids = scopedReadFixtureIds
  const now = new Date('2026-01-15T12:00:00.000Z')
  const write = (collection, id, data) => db.collection(collection).doc(id).set({ id, ...data, createdAt: now, updatedAt: now })
  const receipt = (organizationId, branchId, suffix, franchiseOrganizationId) => ({
    organizationId, storeId: branchId, branchId, saleId: `read-sale-${suffix}`, receiptNumber: `READ-${suffix}`,
    subtotal: 100, taxAmount: 10, grandTotal: 110, taxSnapshot: { code: 'VAT', rate: 0.1 },
    ...(franchiseOrganizationId ? { franchiseOrganizationId } : {}),
  })
  await Promise.all([
    write('cashierSaleSummaries', 'read-summary-owner', createSummary(ids.ownerOrganizationId, ids.ownerBranchId, ids.ownerShiftId, 'owner')),
    write('receipts', 'read-receipt-owner', receipt(ids.ownerOrganizationId, ids.ownerBranchId, 'owner')),
    write('orders', 'read-sale-owner', { organizationId: ids.ownerOrganizationId, storeId: ids.ownerBranchId, branchId: ids.ownerBranchId, shiftId: ids.ownerShiftId, confirmedCogs: 20, taxAmount: 10, grandTotal: 110 }),
    write('journalEntries', 'read-journal-owner', { organizationId: ids.ownerOrganizationId, storeId: ids.ownerBranchId, branchId: ids.ownerBranchId, status: 'POSTED' }),
    write('financePostingRequests', 'read-finance-owner', { organizationId: ids.ownerOrganizationId, storeId: ids.ownerBranchId, branchId: ids.ownerBranchId, status: 'PENDING' }),
    write('stockMovements', 'read-cost-owner', { organizationId: ids.ownerOrganizationId, storeId: ids.ownerBranchId, branchId: ids.ownerBranchId, saleId: 'read-sale-owner', unitCost: 2, movementType: 'SALE_CONSUMPTION' }),
    write('loyaltyBalances', 'read-loyalty-owner', { organizationId: ids.ownerOrganizationId, customerId: 'read-customer-owner', availablePoints: 100 }),
    write('auditLogs', 'read-audit-owner', { organizationId: ids.ownerOrganizationId, storeId: ids.ownerBranchId, branchId: ids.ownerBranchId, eventType: 'SaleCompleted' }),
    write('cashierSaleSummaries', 'read-summary-cashier', createSummary(ids.ownerOrganizationId, ids.cashierBranchId, ids.cashierShiftId, 'cashier')),
    write('receipts', 'read-receipt-cashier', receipt(ids.ownerOrganizationId, ids.cashierBranchId, 'cashier')),
    write('cashierSaleSummaries', 'read-summary-other-branch', createSummary(ids.ownerOrganizationId, ids.otherBranchId, 'read-other-branch-shift', 'other-branch')),
    write('receipts', 'read-receipt-other-branch', receipt(ids.ownerOrganizationId, ids.otherBranchId, 'other-branch')),
    write('cashierSaleSummaries', 'read-summary-other-org', createSummary(ids.otherOrganizationId, 'read-other-org-branch', 'read-other-org-shift', 'other-org')),
    write('receipts', 'read-receipt-other-org', receipt(ids.otherOrganizationId, 'read-other-org-branch', 'other-org')),
    write('journalEntries', 'read-journal-other-org', { organizationId: ids.otherOrganizationId, storeId: 'read-other-org-branch', branchId: 'read-other-org-branch' }),
    write('loyaltyBalances', 'read-loyalty-other-org', { organizationId: ids.otherOrganizationId, customerId: 'read-customer-other', availablePoints: 100 }),
    write('cashierSaleSummaries', 'read-summary-franchise', createSummary(ids.franchiseOrganizationId, 'read-franchise-branch', 'read-franchise-shift', 'franchise', ids.franchiseOrganizationId)),
    write('receipts', 'read-receipt-franchise', receipt(ids.franchiseOrganizationId, 'read-franchise-branch', 'franchise', ids.franchiseOrganizationId)),
    write('journalEntries', 'read-journal-franchise', { organizationId: ids.franchiseOrganizationId, storeId: 'read-franchise-branch', branchId: 'read-franchise-branch', franchiseOrganizationId: ids.franchiseOrganizationId }),
    write('loyaltyBalances', 'read-loyalty-franchise', { organizationId: ids.franchiseOrganizationId, customerId: 'read-customer-franchise', availablePoints: 100, franchiseOrganizationId: ids.franchiseOrganizationId }),
    write('auditLogs', 'read-audit-franchise', { organizationId: ids.franchiseOrganizationId, storeId: 'read-franchise-branch', branchId: 'read-franchise-branch', franchiseOrganizationId: ids.franchiseOrganizationId, eventType: 'SaleCompleted' }),
  ])
  return ids
}

export async function cleanupScopedReadRecords(db) {
  await Promise.all(fixtureDocuments.map(([collection, id]) => db.collection(collection).doc(id).delete()))
}

export const scopedReadFixtureDocumentCount = fixtureDocuments.length
