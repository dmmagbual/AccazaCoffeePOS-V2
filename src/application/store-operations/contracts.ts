export type ShiftStatus = 'open' | 'closed'
export interface Branch { id: string; organizationId: string; name: string; code: string; isDefault: boolean }
export interface Shift { id: string; shiftNumber: string; organizationId: string; storeId: string; cashierId: string; openedAt: Date; closedAt: Date | null; openingCash: number; expectedCash: number | null; actualCash: number | null; variance: number | null; totalSales: number; totalTransactions: number; totalRefunds: number; status: ShiftStatus; notes: string }
export interface ShiftReport { shift: Shift; cashSales: number; cardSales: number; gcashSales: number; mayaSales: number; refunds: number; topProducts: readonly { productName: string; quantity: number }[]; durationMinutes: number }
export interface ShiftRepository { save(shift: Shift): Promise<void>; update(id: string, updates: Partial<Shift>): Promise<void> }
