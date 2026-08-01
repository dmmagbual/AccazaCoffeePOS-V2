import { HttpsError, onCall, onRequest } from 'firebase-functions/https'
import { BranchAuthorizationRepository } from './authorization/index.js'
import { CategoryRepository, OptionGroupRepository, OptionItemRepository, ProductOptionAssignmentRepository, ProductRepository, VariationRepository } from './catalog/index.js'
import { PaymentMethodRepository } from './payments/index.js'
import { RecipeRepository } from './recipes/index.js'
import { FirestoreTrustedSaleRepository, type CompleteSaleRequest } from './sales/completeSale.js'
import { TrustedSaleInputResolver } from './sales/trustedSaleInputResolver.js'
import { getAdminFirestore } from './shared/admin.js'
import { correlationId, requestContext } from './shared/requestContext.js'
import { TaxRepository, TaxResolver } from './tax/index.js'

export const health = onRequest({ region: 'asia-southeast1' }, async (_request, response) => { getAdminFirestore(); response.status(200).json({ service: 'abp-functions', status: 'ok', environment: process.env.FUNCTIONS_EMULATOR === 'true' ? 'emulator' : 'server', timestamp: new Date().toISOString(), correlationId: correlationId() }) })

export const completeSale = onCall({ region: 'asia-southeast1' }, async (request) => {
  const context = requestContext(request); const data = request.data as CompleteSaleRequest
  if (!data || typeof data !== 'object') throw new HttpsError('invalid-argument', 'A sale command is required.')
  const db = getAdminFirestore(); const authorization = new BranchAuthorizationRepository(db); const categories = new CategoryRepository(db); const products = new ProductRepository(db, categories); const variations = new VariationRepository(db); const assignments = new ProductOptionAssignmentRepository(db); const groups = new OptionGroupRepository(db); const options = new OptionItemRepository(db); const recipes = new RecipeRepository(db); const tax = new TaxResolver(new TaxRepository(db)); const payments = new PaymentMethodRepository(db)
  const resolved = await new TrustedSaleInputResolver(authorization, categories, products, variations, assignments, groups, options, recipes, tax, payments).resolveTrustedSaleInput({ branchId: data.requestedBranchId, lines: data.cartLines.map((line) => ({ productId: line.productId, variationId: line.variationId, quantity: line.quantity, selectedOptionItemIds: line.selectedOptionItemIds, notes: line.notes })), paymentMethodIds: data.payments.map((payment) => payment.paymentMethodId), customerId: data.customerId, notes: data.notes }, context)
  return new FirestoreTrustedSaleRepository(db).execute(data, context, resolved)
})
