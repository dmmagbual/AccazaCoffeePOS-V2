import { HttpsError } from 'firebase-functions/https'
import { CustomerRepository } from './customerRepository.js'
import { LoyaltyProgramRepository } from './loyaltyProgramRepository.js'
import type { LoyaltyResolution } from './types.js'

const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

export class SaleLoyaltyResolver {
  constructor(private readonly customers: CustomerRepository, private readonly programs: LoyaltyProgramRepository) {}

  async resolve(input: { organizationId: string; branchId: string; customerId?: string; netSales: number; requestedRedemptionPoints?: number; now: Date }): Promise<LoyaltyResolution> {
    const requestedRedemptionPoints = input.requestedRedemptionPoints ?? 0
    if (!input.customerId) {
      if (requestedRedemptionPoints > 0) throw new HttpsError('failed-precondition', 'A customer is required for loyalty redemption.')
      return { status: 'NOT_APPLICABLE', customer: null, program: null, pointsEarned: 0, permittedRedemption: 0, redemptionAmount: 0 }
    }
    const customer = await this.customers.resolveCustomerSnapshot(input.organizationId, input.branchId, input.customerId)
    const program = await this.programs.getActiveProgram(input.organizationId, input.branchId, input.now)
    if (!program) {
      if (requestedRedemptionPoints > 0) throw new HttpsError('failed-precondition', 'Loyalty redemption is unavailable.')
      return { status: 'NOT_ENABLED', customer, program: null, pointsEarned: 0, permittedRedemption: 0, redemptionAmount: 0 }
    }
    this.programs.validateProgramEffectiveDate(program, input.now)
    const earn = this.programs.resolveEarnRules(program)
    let redemptionAmount = 0
    if (requestedRedemptionPoints > 0) {
      if (!Number.isSafeInteger(requestedRedemptionPoints)) throw new HttpsError('invalid-argument', 'Loyalty redemption points are invalid.')
      const rules = this.programs.resolveRedemptionRules(program)
      if (requestedRedemptionPoints < rules.minimumPoints) throw new HttpsError('failed-precondition', 'Loyalty redemption does not meet the minimum points requirement.')
      redemptionAmount = round(requestedRedemptionPoints * rules.redemptionRate)
      if (redemptionAmount > input.netSales) throw new HttpsError('failed-precondition', 'Loyalty redemption exceeds the amount due.')
    }
    const netAfterRedemption = round(input.netSales - redemptionAmount)
    return { status: 'READY', customer, program, pointsEarned: Math.max(0, Math.floor(netAfterRedemption * earn.earnRate)), permittedRedemption: requestedRedemptionPoints, redemptionAmount }
  }
}
