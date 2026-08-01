import { create } from 'zustand'
import type { CompletedSaleOrder, SalePersistence } from './contracts'

export interface LocalSaleLedger { orders: readonly CompletedSaleOrder[]; save: (order: CompletedSaleOrder) => void }
export const useLocalSaleLedger = create<LocalSaleLedger>((set) => ({ orders: [], save: (order) => set((state) => ({ orders: [...state.orders, order] })) }))
export const localSalePersistence: SalePersistence = { async saveCompletedSale(order) { useLocalSaleLedger.getState().save(order) } }

/**
 * Browser clients must not independently persist sales, payments, receipts, or
 * inventory evidence. P4-002 replaces this compatibility seam with a trusted
 * server command; until that command is deployed checkout fails safely.
 */
export function getConfiguredSalePersistence(): SalePersistence { return { async saveCompletedSale() { throw new Error('Trusted sales execution is not configured. No sale was committed.') } } }
