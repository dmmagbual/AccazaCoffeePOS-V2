import { describe, expect, it } from 'vitest'
import { createSalesAnalyticsProvider, evaluateKpi } from '.'
import type { CompletedSaleOrder } from '../../../application/sales'
import type { Payment } from '../../pos/domain'
const now = new Date('2026-08-01T10:00:00.000Z')
const order = { id: 'o', idempotencyKey: 'sale_branch_u_payment_1', orderNumber: 'O-1', status: 'completed', organizationId: 'org', storeId: 'branch', cashierId: 'u', items: [], payments: [] as Payment[], subtotal: 100, discount: 10, tax: 5, total: 95, estimatedCogs: 0, saleTimestamp: now } satisfies CompletedSaleOrder
describe('analytics', () => { it('uses registered sales metrics and safe KPI statuses', async () => { const provider = createSalesAnalyticsProvider([order]); const result = await provider.execute({ organizationId: 'org', branchIds: ['branch'], dateRange: { from: new Date('2026-08-01'), to: new Date('2026-08-02') }, metricKeys: ['sales.net_sales', 'sales.average_order_value'], requestedBy: 'u', currencyCode: 'PHP', comparisonMode: 'NONE' }); expect(result.map((item) => item.value)).toEqual([95, 95]); expect(evaluateKpi({ id: 'k', name: 'Sales', metricKey: 'sales.net_sales', targetType: 'MINIMUM', targetValue: 100, warningThreshold: 90, criticalThreshold: 50 }, 95).status).toBe('ON_TARGET') }) })
