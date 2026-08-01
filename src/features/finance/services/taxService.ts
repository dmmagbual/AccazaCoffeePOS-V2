import type { TaxProfile, TaxProfileVersion, TaxResolutionContext, TaxRoundingMethod, TaxSnapshot } from '../domain'

const RATE_SCALE = 1_000_000n

export interface TaxCalculationInput { amountMinor: number; profile: TaxProfile; version: TaxProfileVersion; calculatedAt: Date }
export interface TaxResolution { profile: TaxProfile; version: TaxProfileVersion; source: 'transaction' | 'product' | 'category' | 'branch' | 'organization' }

function assertMinor(value: number): bigint { if (!Number.isSafeInteger(value) || value < 0) throw new Error('Money must be a non-negative integer number of minor units.'); return BigInt(value) }
function decimalRate(value: string): bigint { if (!/^0(?:\.\d{1,6})?$|^1(?:\.0{1,6})?$/.test(value)) throw new Error('Tax rate must be a controlled decimal from 0 to 1 with at most six decimal places.'); const [whole, fraction = ''] = value.split('.'); return BigInt(`${whole}${fraction.padEnd(6, '0')}`) }
function roundedDivision(numerator: bigint, denominator: bigint, method: TaxRoundingMethod): bigint { const quotient = numerator / denominator; const remainder = numerator % denominator; if (remainder === 0n || method === 'DOWN') return quotient; if (method === 'UP') return quotient + 1n; const doubled = remainder * 2n; if (doubled > denominator || (doubled === denominator && (method === 'HALF_UP' || quotient % 2n !== 0n))) return quotient + 1n; return quotient }
function asMinor(value: bigint): number { if (value > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Tax calculation exceeds supported monetary precision.'); return Number(value) }

export function validateTaxProfile(profile: TaxProfile): void {
  if (!profile.organizationId || !profile.code.trim() || !profile.name.trim()) throw new Error('Tax profile organization, code, and name are required.')
  if (!Number.isInteger(profile.priority) || profile.priority < 0) throw new Error('Tax priority must be a non-negative integer.')
  for (const version of profile.versions) {
    decimalRate(version.rate)
    if (!Number.isInteger(version.roundingPrecision) || version.roundingPrecision !== 2) throw new Error('Tax rounding precision must match the configured currency minor unit precision.')
    if (version.effectiveTo !== null && version.effectiveTo <= version.effectiveFrom) throw new Error('Tax effective end must be after its effective start.')
  }
  const ordered = [...profile.versions].sort((left, right) => left.effectiveFrom.getTime() - right.effectiveFrom.getTime())
  for (let index = 1; index < ordered.length; index += 1) { const prior = ordered[index - 1]; const next = ordered[index]; if (prior.effectiveTo === null || prior.effectiveTo > next.effectiveFrom) throw new Error('Tax profile versions cannot have overlapping effective periods.') }
}

export function resolveTaxProfile(profiles: readonly TaxProfile[], context: TaxResolutionContext, permittedOverrides = false): TaxResolution | null {
  const candidates: readonly [TaxResolution['source'], string | undefined][] = [['transaction', context.explicitTaxProfileId], ['product', context.productTaxProfileId], ['category', context.categoryTaxProfileId], ['branch', context.branchDefaultTaxProfileId], ['organization', context.organizationDefaultTaxProfileId]]
  for (const [source, id] of candidates) {
    if (!id || (source === 'transaction' && !permittedOverrides)) continue
    const profile = profiles.find((item) => item.id === id && item.organizationId === context.organizationId && item.active && (item.branchIds === null || item.branchIds.includes(context.branchId)))
    if (!profile) continue
    const versions = profile.versions.filter((version) => version.active && version.effectiveFrom <= context.transactionAt && (version.effectiveTo === null || context.transactionAt < version.effectiveTo))
    if (versions.length > 1) throw new Error(`More than one tax version applies to ${profile.code}.`)
    if (versions.length === 1) return { profile, version: versions[0], source }
  }
  return null
}

export function calculateTaxSnapshot(input: TaxCalculationInput): TaxSnapshot {
  const amount = assertMinor(input.amountMinor); const rate = decimalRate(input.version.rate); const noTax = input.profile.taxType === 'NO_TAX' || input.profile.taxType === 'EXEMPT' || input.profile.taxType === 'ZERO_RATED' || input.version.calculationMode === 'NOT_APPLICABLE'
  const tax = noTax ? 0n : input.version.calculationMode === 'TAX_INCLUSIVE' ? roundedDivision(amount * rate, RATE_SCALE + rate, input.version.roundingMethod) : roundedDivision(amount * rate, RATE_SCALE, input.version.roundingMethod)
  const exclusive = input.version.calculationMode === 'TAX_INCLUSIVE' ? amount - tax : amount
  const inclusive = input.version.calculationMode === 'TAX_INCLUSIVE' ? amount : amount + tax
  return { taxProfileId: input.profile.id, taxConfigurationVersionId: input.version.id, taxCode: input.profile.code, taxName: input.profile.name, taxType: input.profile.taxType, rateApplied: input.version.rate, calculationMode: input.version.calculationMode, taxableAmountMinor: asMinor(noTax ? 0n : exclusive), taxAmountMinor: asMinor(tax), taxInclusiveAmountMinor: asMinor(inclusive), taxExclusiveAmountMinor: asMinor(exclusive), zeroRatedAmountMinor: input.profile.taxType === 'ZERO_RATED' ? asMinor(amount) : 0, exemptAmountMinor: input.profile.taxType === 'EXEMPT' ? asMinor(amount) : 0, roundingAdjustmentMinor: 0, calculatedAt: input.calculatedAt }
}

export function scheduleTaxRateChange(profile: TaxProfile, version: TaxProfileVersion): TaxProfile {
  if (version.taxProfileId !== profile.id) throw new Error('Tax version must belong to its profile.')
  if (profile.versions.some((item) => item.id === version.id)) throw new Error('Tax version identifier already exists.')
  const next = { ...profile, versions: [...profile.versions, version] }
  validateTaxProfile(next)
  return next
}
