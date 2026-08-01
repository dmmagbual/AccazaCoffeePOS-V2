import { describe, expect, it } from 'vitest'
import type { BusinessSetupDraft } from '../domain'
import { buildSetupPlan, validateSetupDraft } from './setupService'

const draft: BusinessSetupDraft = { idempotencyKey: 'setup_00000001', step: 13, status: 'in_progress', profile: { legalName: 'Accaza Coffee House', tradeName: 'Accaza', businessType: 'coffee_shop', logoUrl: '', address: 'Main Street', country: 'Philippines', province: 'Metro Manila', city: 'Manila', postalCode: '1000', timezone: 'Asia/Manila', currency: 'PHP', language: 'en', fiscalYearStartMonth: 1, businessDays: ['Mon', 'Tue'] }, organizationName: 'Accaza Coffee House', branch: { code: 'MAIN', name: 'Main Branch', address: 'Main Street', openingHours: '08:00-20:00', managerName: 'Owner', timezone: 'Asia/Manila', currency: 'PHP' }, tax: { name: 'VAT', rate: 0.12, mode: 'exclusive' }, chartTemplate: 'coffee_shop', enabledFeatures: ['FINANCE.ENABLED', 'INVENTORY.SIMPLE_STORAGE'], owner: { name: 'Owner', email: 'owner@example.com', password: 'secure-password' }, updatedAt: '2026-08-01T00:00:00.000Z' }

describe('business setup plan', () => {
  it('reuses existing master-data and finance seeds in a stable plan', () => { const first = buildSetupPlan(draft); const second = buildSetupPlan(draft); expect(first).toEqual(second); expect(first.unitNames).toContain('Gram'); expect(first.unitNames).toContain('Cup'); expect(first.paymentMethodCodes).toContain('GCASH'); expect(first.featureKeys).not.toContain('FRANCHISE.ENABLED') })
  it('rejects invalid business setup data before initialization', () => { expect(() => validateSetupDraft({ ...draft, branch: { ...draft.branch, code: 'too-long-branch-code' } })).toThrow() })
})
