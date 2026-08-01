export type SaleOutboxType = 'SaleFinancePostingRequested' | 'SaleLoyaltyRequested' | 'ShiftTotalsUpdateRequested'
export interface SaleOutboxEvent { id: string; type: SaleOutboxType; sourceSaleId: string; organizationId: string; branchId: string; status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED_RETRYABLE' | 'FAILED_FINAL'; attemptCount: number; nextRetryAt: Date | null; lastError: string | null; createdAt: Date; updatedAt: Date }
export function saleOutboxEventId(type: SaleOutboxType, saleId: string): string { return `${type}-${saleId}` }
