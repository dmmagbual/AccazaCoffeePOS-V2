export type FinanceReadiness = 'NOT_ENABLED' | 'NOT_CONFIGURED' | 'READY'
export interface AccountDocument { id: string; organizationId: string; branchId: string | null; code: string; name: string; accountType: string; active: boolean; systemAccount: boolean; allowManualPosting: boolean; postingAllowed?: boolean }
export interface AccountSnapshot { accountId: string; code: string; name: string; accountType: string }
export interface AccountingPeriodDocument { id: string; organizationId: string; startDate: Date; endDate: Date; status: 'OPEN' | 'SOFT_CLOSED' | 'CLOSED' }
export interface FinancePostingConfiguration { id: string; organizationId: string; branchId?: string | null; enabled: boolean; cogsPostingEnabled: boolean; paymentAccountIds: Record<string, string>; revenueAccountId?: string; taxPayableAccountId?: string; costOfSalesAccountId?: string; inventoryAccountId?: string }
export interface JournalLineInstruction { accountId: string; debit: number; credit: number; description: string; accountSnapshot?: AccountSnapshot }
export interface JournalInstruction { saleId: string; organizationId: string; branchId: string; periodId: string; idempotencyKey: string; lines: readonly JournalLineInstruction[]; postingDate?: Date; createdBy: string }
export interface CommittedSaleFinanceSnapshot { saleId: string; organizationId: string; branchId: string; businessDate: Date; idempotencyKey: string; createdBy: string; payments: readonly { paymentMethodId: string; amount: number }[]; netSales: number; taxAmount: number; confirmedCogs: number; cogsStatus: string }
export interface SaleFinanceResolution { status: FinanceReadiness; instruction: JournalInstruction | null; cogsIncluded: boolean }
