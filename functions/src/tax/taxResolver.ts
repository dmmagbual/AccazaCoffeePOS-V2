import type { TaxSnapshot } from './types.js'
import { TaxRepository } from './taxRepository.js'

export class TaxResolver {
  constructor(private readonly repository: TaxRepository) {}
  async resolveEffectiveTaxForSaleLine(input: { organizationId: string; branchId: string; categoryId: string; productId: string; variationId?: string; optionId?: string; productTaxProfileId?: string | null; at: Date }): Promise<TaxSnapshot> {
    const assignment = (input.optionId ? await this.repository.resolveOptionTax(input.organizationId, input.optionId) : null) ?? (input.variationId ? await this.repository.resolveVariationTax(input.organizationId, input.variationId) : null) ?? await this.repository.resolveProductTax(input.organizationId, input.productId) ?? await this.repository.resolveCategoryTax(input.organizationId, input.categoryId) ?? await this.repository.resolveBranchOverride(input.organizationId, input.branchId)
    const profile = assignment ? await this.repository.getProfileById(input.organizationId, assignment.taxProfileId) : input.productTaxProfileId ? await this.repository.getProfileById(input.organizationId, input.productTaxProfileId) : await this.repository.resolveOrganizationDefault(input.organizationId)
    const version = await this.repository.effectiveVersion(input.organizationId, profile.id, input.at); this.repository.validateEffectivePeriod(version, input.at)
    return { taxProfileId: profile.id, taxConfigurationVersionId: version.id, taxCode: profile.code, taxName: profile.name, taxType: profile.taxType, rateApplied: version.rate, calculationMode: version.calculationMode, roundingMethod: version.roundingMethod, roundingPrecision: version.roundingPrecision, ...(profile.taxPayableAccountId ? { taxPayableAccountId: profile.taxPayableAccountId } : {}) }
  }
}
