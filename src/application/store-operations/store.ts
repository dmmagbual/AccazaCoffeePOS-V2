import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Branch, Shift } from './contracts'
export const localBranches: readonly Branch[] = [{ id: 'local-main', organizationId: 'local-accaza', name: 'Accaza Main Branch', code: 'MAIN', isDefault: true }, { id: 'local-mall', organizationId: 'local-accaza', name: 'Accaza Mall Branch', code: 'MALL', isDefault: false }]
interface OperationsState { branchId: string; shifts: readonly Shift[]; setBranch: (branchId: string) => void; addShift: (shift: Shift) => void; replaceShift: (shift: Shift) => void }
export const useOperationsStore = create<OperationsState>()(persist((set) => ({ branchId: localBranches[0]!.id, shifts: [], setBranch: (branchId) => set({ branchId }), addShift: (shift) => set((state) => ({ shifts: [...state.shifts, shift] })), replaceShift: (shift) => set((state) => ({ shifts: state.shifts.map((item) => item.id === shift.id ? shift : item) })) }), { name: 'accaza-store-operations' }))
