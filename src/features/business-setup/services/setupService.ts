import { z } from 'zod'
import { seedChartOfAccounts } from '../../finance/services'
import { standardUnits } from '../../master-data/services/unitConversion'
import { FEATURE_REGISTRY } from '../../platform-configuration/services'
import type { BusinessSetupDraft, SetupPlan } from '../domain'

const profileSchema = z.object({ legalName: z.string().trim().min(2), tradeName: z.string().trim().min(2), businessType: z.enum(['coffee_shop', 'restaurant', 'bakery', 'cafe', 'retail', 'other']), logoUrl: z.string(), address: z.string().trim().min(5), country: z.string().trim().min(2), province: z.string().trim().min(2), city: z.string().trim().min(2), postalCode: z.string().trim().min(3), timezone: z.string().trim().min(3), currency: z.literal('PHP'), language: z.string().trim().min(2), fiscalYearStartMonth: z.number().int().min(1).max(12), businessDays: z.array(z.string()).min(1) })
const branchSchema = z.object({ code: z.string().trim().regex(/^[A-Z0-9-]{2,12}$/), name: z.string().trim().min(2), address: z.string().trim().min(5), openingHours: z.string().trim().min(3), managerName: z.string().trim().min(2), timezone: z.string().trim().min(3), currency: z.literal('PHP') })
export const businessSetupSchema = z.object({ idempotencyKey: z.string().regex(/^[A-Za-z0-9_-]{8,150}$/), step: z.number().int().min(1).max(14), status: z.enum(['not_started', 'in_progress', 'initialized', 'cancelled', 'failed']), profile: profileSchema, organizationName: z.string().trim().min(2), branch: branchSchema, tax: z.object({ name: z.string().trim().min(2), rate: z.number().min(0).max(1), mode: z.enum(['inclusive', 'exclusive', 'exempt']) }), chartTemplate: z.enum(['coffee_shop', 'import_existing']), enabledFeatures: z.array(z.string()), owner: z.object({ name: z.string().trim().min(2), email: z.string().trim().email(), password: z.string().min(12) }), updatedAt: z.string().datetime() })

const seedUnits = [...standardUnits.map((unit) => unit.name), 'Box', 'Cup', 'Tablespoon', 'Teaspoon']
const categoryGroups = ['Ingredient Categories', 'Product Categories', 'Expense Categories', 'Supplier Categories', 'Asset Categories', 'Customer Categories']
const paymentMethodCodes = ['CASH', 'GCASH', 'MAYA', 'BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'GIFT_CARD', 'STORE_CREDIT', 'LOYALTY_REDEMPTION']
export function validateSetupDraft(draft: BusinessSetupDraft): void { businessSetupSchema.parse(draft) }
export function buildSetupPlan(draft: BusinessSetupDraft): SetupPlan {
  validateSetupDraft(draft)
  const organizationId = `org_${draft.idempotencyKey}`
  const branchId = `branch_${draft.idempotencyKey}`
  if (draft.chartTemplate === 'coffee_shop') seedChartOfAccounts(organizationId, 'setup-owner')
  const featureKeys = draft.enabledFeatures.filter((key): key is keyof typeof FEATURE_REGISTRY => key in FEATURE_REGISTRY)
  return { organizationId, branchId, profile: draft.profile, unitNames: seedUnits, categoryGroups, paymentMethodCodes, featureKeys, chartTemplate: draft.chartTemplate, ownerEmail: draft.owner.email }
}

export interface BusinessSetupRepository { getByKey(idempotencyKey: string): Promise<SetupPlan | null>; initialize(plan: SetupPlan): Promise<SetupPlan>; rollback(idempotencyKey: string): Promise<void> }
export function createLocalBusinessSetupRepository(): BusinessSetupRepository {
  const key = 'abp.business-setup.plans'
  const read = (): Record<string, SetupPlan> => JSON.parse(window.localStorage.getItem(key) ?? '{}') as Record<string, SetupPlan>
  const write = (plans: Record<string, SetupPlan>): void => window.localStorage.setItem(key, JSON.stringify(plans))
  return { async getByKey(idempotencyKey) { return read()[idempotencyKey] ?? null }, async initialize(plan) { const plans = read(); const existing = plans[plan.organizationId.replace('org_', '')]; if (existing) return existing; plans[plan.organizationId.replace('org_', '')] = plan; write(plans); return plan }, async rollback(idempotencyKey) { const plans = read(); delete plans[idempotencyKey]; write(plans) } }
}
