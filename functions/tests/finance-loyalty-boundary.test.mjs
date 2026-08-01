import assert from 'node:assert/strict'
import test from 'node:test'
import { SaleFinanceResolver } from '../lib/finance/saleFinanceResolver.js'
import { SaleLoyaltyResolver } from '../lib/loyalty/saleLoyaltyResolver.js'
import { ShiftTotalsRepository } from '../lib/shifts/shiftTotalsRepository.js'

test('finance resolver emits a balanced configured instruction', async () => {
  const account = (id) => ({ accountId: id, code: id, name: id, accountType: 'ASSET' })
  const resolver = new SaleFinanceResolver({ resolvePaymentAccount: async () => account('cash'), resolveRevenueAccount: async () => account('revenue'), resolveTaxPayableAccount: async () => account('tax'), resolveCostOfSalesAccount: async () => account('cogs'), resolveInventoryAccount: async () => account('inventory') }, { resolvePostingDate: async () => ({ date: new Date('2026-01-01'), period: { id: 'period' } }) }, { resolve: async () => ({ status: 'READY', configuration: { cogsPostingEnabled: true, paymentAccountIds: { cash: 'cash' }, revenueAccountId: 'revenue', taxPayableAccountId: 'tax', costOfSalesAccountId: 'cogs', inventoryAccountId: 'inventory' } }) })
  const result = await resolver.resolve({ saleId: 'sale', organizationId: 'org', branchId: 'branch', businessDate: new Date('2026-01-01'), idempotencyKey: 'key', createdBy: 'user', payments: [{ paymentMethodId: 'cash', amount: 110 }], netSales: 100, taxAmount: 10, confirmedCogs: 25, cogsStatus: 'CONFIRMED' }, 'UTC')
  assert.equal(result.status, 'READY'); assert.equal(result.instruction.lines.reduce((sum, line) => sum + line.debit, 0), result.instruction.lines.reduce((sum, line) => sum + line.credit, 0))
})
test('loyalty resolver reads configured eligibility without browser services', async () => { const resolver = new SaleLoyaltyResolver({ resolveCustomerSnapshot: async () => ({ customerId: 'customer', displayName: 'Customer' }) }, { getActiveProgram: async () => ({ id: 'program', earnRate: 2 }), validateProgramEffectiveDate: () => undefined, resolveEarnRules: () => ({ earnRate: 2 }) }); const result = await resolver.resolve({ organizationId: 'org', branchId: 'branch', customerId: 'customer', netSales: 125, now: new Date() }); assert.equal(result.status, 'READY'); assert.equal(result.pointsEarned, 250) })
test('shift categories preserve known payment types and isolate others', () => { const repository = new ShiftTotalsRepository({}); assert.equal(repository.resolvePaymentCategory('cash'), 'CASH'); assert.equal(repository.resolvePaymentCategory('bank'), 'BANK'); assert.equal(repository.resolvePaymentCategory('voucher'), 'OTHER') })
