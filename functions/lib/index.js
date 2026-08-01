import { HttpsError, onCall, onRequest } from 'firebase-functions/https';
import { BranchAuthorizationRepository } from './authorization/index.js';
import { CategoryRepository, OptionGroupRepository, OptionItemRepository, ProductOptionAssignmentRepository, ProductRepository, VariationRepository } from './catalog/index.js';
import { PaymentMethodRepository } from './payments/index.js';
import { RecipeRepository } from './recipes/index.js';
import { completeSaleRequestHash, FirestoreTrustedSaleRepository, salePersistenceStages } from './sales/completeSale.js';
import { TrustedSaleInputResolver } from './sales/trustedSaleInputResolver.js';
import { getAdminFirestore } from './shared/admin.js';
import { correlationId, requestContext } from './shared/requestContext.js';
import { mapCallableError } from './shared/callableErrors.js';
import { TaxRepository, TaxResolver } from './tax/index.js';
export const health = onRequest({ region: 'asia-southeast1' }, async (_request, response) => { getAdminFirestore(); response.status(200).json({ service: 'abp-functions', status: 'ok', environment: process.env.FUNCTIONS_EMULATOR === 'true' ? 'emulator' : 'server', timestamp: new Date().toISOString(), correlationId: correlationId() }); });
export const completeSale = onCall({ region: 'asia-southeast1' }, async (request) => {
    const requestCorrelationId = correlationId();
    try {
        const context = { ...requestContext(request), correlationId: requestCorrelationId };
        const data = request.data;
        if (!data || typeof data !== 'object' || !Array.isArray(data.cartLines) || !Array.isArray(data.payments))
            throw new HttpsError('invalid-argument', 'A sale command is required.');
        const db = getAdminFirestore();
        const authorization = new BranchAuthorizationRepository(db);
        authorization.validateUserOrganizationAccess(context, context.organizationId);
        authorization.validateUserBranchAccess(context, data.requestedBranchId);
        authorization.validatePermission(context, 'sales.complete');
        await authorization.validateOrganizationActive(context.organizationId);
        await authorization.validateBranchActive(context.organizationId, data.requestedBranchId);
        if (!context.employeeId)
            throw new HttpsError('failed-precondition', 'An employee context is required.');
        await authorization.validateEmployeeActive(context.organizationId, context.employeeId);
        await authorization.validateEmployeeBranchAssignment(context.organizationId, context.employeeId, data.requestedBranchId);
        await authorization.validateOpenShiftAccess(context.organizationId, data.requestedBranchId, context.employeeId);
        const replay = await db.collection('saleIdempotency').doc(`${context.organizationId}_${data.idempotencyKey}`).get();
        if (replay.exists) {
            const evidence = replay.data();
            if (evidence.requestHash !== completeSaleRequestHash(data))
                throw new HttpsError('already-exists', 'This idempotency key was used for a different request.');
            if (evidence.status === 'COMPLETED' && evidence.resultSnapshot)
                return evidence.resultSnapshot;
        }
        const categories = new CategoryRepository(db);
        const products = new ProductRepository(db, categories);
        const variations = new VariationRepository(db);
        const assignments = new ProductOptionAssignmentRepository(db);
        const groups = new OptionGroupRepository(db);
        const options = new OptionItemRepository(db);
        const recipes = new RecipeRepository(db);
        const tax = new TaxResolver(new TaxRepository(db));
        const payments = new PaymentMethodRepository(db);
        const resolved = await new TrustedSaleInputResolver(authorization, categories, products, variations, assignments, groups, options, recipes, tax, payments).resolveTrustedSaleInput({ branchId: data.requestedBranchId, lines: data.cartLines.map((line) => ({ productId: line.productId, variationId: line.variationId, quantity: line.quantity, selectedOptionItemIds: line.selectedOptionItemIds, notes: line.notes })), paymentMethodIds: data.payments.map((payment) => payment.paymentMethodId), customerId: data.customerId, notes: data.notes }, context);
        const injectedStage = process.env.FUNCTIONS_EMULATOR === 'true' && typeof request.auth?.token.testFailurePoint === 'string' && salePersistenceStages.includes(request.auth.token.testFailurePoint) ? request.auth.token.testFailurePoint : undefined;
        const executionOptions = injectedStage ? { onPersistenceStage: (stage) => { if (stage === injectedStage)
                throw new HttpsError('internal', 'Controlled emulator persistence failure.'); } } : undefined;
        return await new FirestoreTrustedSaleRepository(db, executionOptions).execute(data, context, resolved);
    }
    catch (error) {
        throw mapCallableError(error, requestCorrelationId);
    }
});
