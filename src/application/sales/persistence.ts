import { collection, doc, writeBatch, type Firestore } from 'firebase/firestore'
import { create } from 'zustand'
import { COLLECTIONS } from '../../shared/config'
import { firestore } from '../../shared/firebase'
import type { CompletedSaleOrder, SalePersistence } from './contracts'
import type { Payment, Receipt } from '../../features/pos/domain'

export interface LocalSaleLedger { orders: readonly CompletedSaleOrder[]; save: (order: CompletedSaleOrder) => void }
export const useLocalSaleLedger = create<LocalSaleLedger>((set) => ({ orders: [], save: (order) => set((state) => ({ orders: [...state.orders, order] })) }))
export const localSalePersistence: SalePersistence = { async saveCompletedSale(order) { useLocalSaleLedger.getState().save(order) } }

export function createFirestoreSalePersistence(firestore: Firestore): SalePersistence {
  return { async saveCompletedSale(order: CompletedSaleOrder, payments: readonly Payment[], receipt: Receipt) {
    const batch = writeBatch(firestore)
    batch.set(doc(collection(firestore, COLLECTIONS.orders), order.id), order)
    for (const payment of payments) batch.set(doc(collection(firestore, COLLECTIONS.payments), payment.id), { ...payment, orderId: order.id, organizationId: order.organizationId, storeId: order.storeId, paidAt: order.saleTimestamp })
    batch.set(doc(collection(firestore, COLLECTIONS.receipts), receipt.number), { ...receipt, orderId: order.id, organizationId: order.organizationId, storeId: order.storeId })
    await batch.commit()
  } }
}

export function getConfiguredSalePersistence(): SalePersistence { return firestore ? createFirestoreSalePersistence(firestore) : localSalePersistence }
