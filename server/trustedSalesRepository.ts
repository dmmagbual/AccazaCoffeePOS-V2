import type { Firestore } from 'firebase-admin/firestore'
import type { TrustedSaleRepository, TrustedSaleResult } from '../src/application/sales'

/** Server-only Admin SDK repository. It must be invoked by an authenticated callable/API handler. */
export function createAdminTrustedSaleRepository(firestore: Firestore): TrustedSaleRepository {
  const idempotency = firestore.collection('saleIdempotency')
  return {
    async findIdempotency(key) { const snapshot = await idempotency.doc(key).get(); if (!snapshot.exists) return null; const data = snapshot.data() as { requestHash: string; status: string; resultSnapshot?: TrustedSaleResult }; return data.status === 'COMPLETED' && data.resultSnapshot ? { requestHash: data.requestHash, result: data.resultSnapshot } : null },
    async commit(input) {
      const claim = idempotency.doc(input.idempotencyKey); const sale = firestore.collection('orders').doc(input.result.saleId)
      await firestore.runTransaction(async (transaction) => {
        const existing = await transaction.get(claim)
        if (existing.exists) { const data = existing.data() as { requestHash: string; status: string; resultSnapshot?: TrustedSaleResult }; if (data.requestHash !== input.requestHash) throw new Error('idempotency_conflict'); if (data.status === 'COMPLETED') return }
        transaction.set(claim, { idempotencyKey: input.idempotencyKey, requestHash: input.requestHash, organizationId: input.command.organizationId, branchId: input.command.branchId, status: 'COMPLETED', saleId: input.result.saleId, resultSnapshot: input.result, claimedAt: input.command.requestedAt, completedAt: input.command.requestedAt, correlationId: input.command.correlationId }, { merge: true })
        transaction.set(sale, { ...input.result, organizationId: input.command.organizationId, storeId: input.command.branchId, shiftId: input.command.shiftId, cashierUserId: input.command.cashierUserId, lines: input.command.lines, payments: input.command.payments, taxSnapshots: input.command.lines.map((line) => line.taxSnapshot), receiptNumber: input.result.receiptNumber, immutable: true, committedAt: input.command.requestedAt })
        for (const movement of input.movements) transaction.set(firestore.collection('stockMovements').doc(), { ...movement, organizationId: input.command.organizationId, storeId: input.command.branchId, saleId: input.result.saleId, shiftId: input.command.shiftId, occurredAt: input.command.requestedAt, immutable: true })
        transaction.set(firestore.collection('receipts').doc(input.result.receiptNumber), { ...input.result, saleId: input.result.saleId, organizationId: input.command.organizationId, storeId: input.command.branchId, immutable: true, issuedAt: input.command.requestedAt })
        transaction.set(firestore.collection('auditLogs').doc(), { ...input.audit, organizationId: input.command.organizationId, storeId: input.command.branchId, saleId: input.result.saleId, occurredAt: input.command.requestedAt })
        for (const event of input.events) transaction.set(firestore.collection('outboxEvents').doc(), { event, saleId: input.result.saleId, correlationId: input.command.correlationId, status: 'PENDING', occurredAt: input.command.requestedAt })
      })
    },
  }
}
