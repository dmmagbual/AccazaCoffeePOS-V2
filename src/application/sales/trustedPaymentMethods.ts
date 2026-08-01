import { collection, getDocs, query, where } from 'firebase/firestore'
import type { ConfiguredPaymentMethod } from '../../features/pos/domain'
import { firestore } from '../../shared/firebase/config'

interface PaymentMethodReadModel {
  name?: unknown
  code?: unknown
  active?: unknown
  branchIds?: unknown
  currencyCode?: unknown
  settlementCategory?: unknown
  requiresTransactionReference?: unknown
  requiresTenderedAmount?: unknown
}

/**
 * Reads only client-safe payment configuration for picker labels. The callable
 * independently validates every selected id, amount, currency, and policy.
 */
export async function loadTrustedPaymentMethods(organizationId: string, branchId: string): Promise<readonly ConfiguredPaymentMethod[]> {
  if (!firestore) return []
  const snapshots = await getDocs(query(collection(firestore, 'paymentMethods'), where('organizationId', '==', organizationId), where('active', '==', true)))
  return snapshots.docs.flatMap((snapshot) => {
    const value = snapshot.data() as PaymentMethodReadModel
    const branchIds = Array.isArray(value.branchIds) ? value.branchIds.filter((id): id is string => typeof id === 'string') : []
    if (branchIds.length > 0 && !branchIds.includes(branchId)) return []
    if (typeof value.name !== 'string' || typeof value.code !== 'string' || typeof value.settlementCategory !== 'string') return []
    return [{
      id: snapshot.id,
      name: value.name,
      code: value.code,
      currencyCode: typeof value.currencyCode === 'string' ? value.currencyCode : 'PHP',
      settlementCategory: value.settlementCategory,
      requiresTransactionReference: value.requiresTransactionReference === true,
      requiresTenderedAmount: value.requiresTenderedAmount === true,
    }]
  })
}
