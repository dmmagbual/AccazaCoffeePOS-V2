import type { FeatureKey } from '../../platform-configuration/domain'

export type BusinessType = 'coffee_shop' | 'restaurant' | 'bakery' | 'cafe' | 'retail' | 'other'
export type SetupStatus = 'not_started' | 'in_progress' | 'initialized' | 'cancelled' | 'failed'
export type TaxMode = 'inclusive' | 'exclusive' | 'exempt'

export interface BusinessProfile { legalName: string; tradeName: string; businessType: BusinessType; logoUrl: string; address: string; country: string; province: string; city: string; postalCode: string; timezone: string; currency: 'PHP'; language: string; fiscalYearStartMonth: number; businessDays: readonly string[] }
export interface FirstBranch { code: string; name: string; address: string; openingHours: string; managerName: string; timezone: string; currency: 'PHP' }
export interface TaxSetup { name: string; rate: string; mode: TaxMode }
export interface OwnerSetup { name: string; email: string; password: string }
export interface BusinessSetupDraft { idempotencyKey: string; step: number; status: SetupStatus; profile: BusinessProfile; organizationName: string; branch: FirstBranch; tax: TaxSetup; chartTemplate: 'coffee_shop' | 'import_existing'; enabledFeatures: readonly FeatureKey[]; owner: OwnerSetup; updatedAt: string }
export interface SetupPlan { organizationId: string; branchId: string; profile: BusinessProfile; unitNames: readonly string[]; categoryGroups: readonly string[]; paymentMethodCodes: readonly string[]; featureKeys: readonly FeatureKey[]; chartTemplate: BusinessSetupDraft['chartTemplate']; ownerEmail: string }
