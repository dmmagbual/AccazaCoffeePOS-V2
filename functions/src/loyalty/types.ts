export interface CustomerDocument { id: string; organizationId: string; branchIds?: readonly string[]; active: boolean; displayName: string; phone?: string; email?: string }
export interface CustomerSnapshot { customerId: string; displayName: string }
export interface LoyaltyProgramDocument { id: string; organizationId: string; branchIds?: readonly string[]; active: boolean; effectiveFrom?: Date; effectiveTo?: Date; earnRate?: number; redemptionRate?: number; minimumRedemptionPoints?: number; pointsExpiryDays?: number; tiers?: readonly { id: string; name: string; minimumPoints: number }[] }
export interface LoyaltyBalanceDocument { id: string; organizationId: string; customerId: string; availablePoints: number; reservedPoints: number; updatedAt?: Date }
export type LoyaltyTransactionType = 'EARN' | 'REDEEM' | 'REVERSE'
export interface LoyaltyTransactionInstruction { saleId: string; organizationId: string; customerId: string; type: LoyaltyTransactionType; points: number; createdBy: string; idempotencyKey: string }
export interface LoyaltyResolution { status: 'NOT_ENABLED' | 'NOT_APPLICABLE' | 'READY'; customer: CustomerSnapshot | null; program: LoyaltyProgramDocument | null; pointsEarned: number; permittedRedemption: number }
