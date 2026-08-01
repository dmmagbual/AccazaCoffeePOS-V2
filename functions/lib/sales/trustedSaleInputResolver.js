import { HttpsError } from 'firebase-functions/https';
export class TrustedSaleInputResolver {
    authorization;
    categories;
    products;
    variations;
    assignments;
    groups;
    options;
    recipes;
    tax;
    payments;
    constructor(authorization, categories, products, variations, assignments, groups, options, recipes, tax, payments) {
        this.authorization = authorization;
        this.categories = categories;
        this.products = products;
        this.variations = variations;
        this.assignments = assignments;
        this.groups = groups;
        this.options = options;
        this.recipes = recipes;
        this.tax = tax;
        this.payments = payments;
    }
    async resolveTrustedSaleInput(command, context) {
        this.authorization.validateUserOrganizationAccess(context, context.organizationId);
        this.authorization.validateUserBranchAccess(context, command.branchId);
        this.authorization.validatePermission(context, 'sales.complete');
        await this.authorization.validateOrganizationActive(context.organizationId);
        await this.authorization.validateBranchActive(context.organizationId, command.branchId);
        if (!context.employeeId)
            throw new HttpsError('failed-precondition', 'An employee context is required.');
        await this.authorization.validateEmployeeActive(context.organizationId, context.employeeId);
        await this.authorization.validateEmployeeBranchAssignment(context.organizationId, context.employeeId, command.branchId);
        await this.authorization.validateOpenShiftAccess(context.organizationId, command.branchId, context.employeeId);
        const currencyCode = await this.authorization.resolveBranchCurrency(context.organizationId, command.branchId);
        const lines = await Promise.all(command.lines.map(async (line) => { if (!Number.isInteger(line.quantity) || line.quantity < 1)
            throw new HttpsError('invalid-argument', 'Line quantity must be a positive integer.'); const product = await this.products.getSellableProduct(context.organizationId, command.branchId, line.productId, context.requestTimestamp); const variationId = line.variationId ?? product.defaultVariationId ?? undefined; const category = await this.categories.resolveCategorySnapshot(context.organizationId, command.branchId, product.categoryId); const variation = variationId ? await this.variations.resolveVariationSnapshot(context.organizationId, command.branchId, product.id, variationId) : undefined; const unitPrice = variationId ? await this.variations.resolveVariationPrice(context.organizationId, command.branchId, product.id, variationId) : await this.products.resolveEffectivePrice(context.organizationId, command.branchId, product.id); const recipe = product.recipeId ? await this.recipes.resolveRecipeSnapshot(context.organizationId, product.id, variationId) : undefined; const selections = line.selectedOptionItemIds ?? []; if (new Set(selections.map((selection) => selection.optionItemId)).size !== selections.length)
            throw new HttpsError('failed-precondition', 'Duplicate option selections are not allowed.'); const selectedByGroup = new Map(); const resolvedItems = await Promise.all(selections.map((selection) => this.options.getById(context.organizationId, selection.optionItemId))); for (const item of resolvedItems)
            selectedByGroup.set(item.modifierGroupId, [...(selectedByGroup.get(item.modifierGroupId) ?? []), item.id]); const assignments = [...await this.assignments.listAssignmentsForProduct(context.organizationId, command.branchId, product.id), ...(variationId ? await this.assignments.listAssignmentsForVariation(context.organizationId, command.branchId, variationId) : [])]; for (const assignment of assignments) {
            await this.groups.resolveOptionGroupSnapshot(context.organizationId, command.branchId, assignment.optionGroupId);
            const selected = selectedByGroup.get(assignment.optionGroupId) ?? [];
            await this.groups.validateRequiredSelections(context.organizationId, assignment.optionGroupId, selected, assignment);
            await this.groups.validateMinimumSelections(context.organizationId, assignment.optionGroupId, selected, assignment);
            await this.groups.validateMaximumSelections(context.organizationId, assignment.optionGroupId, selected, assignment);
        } const optionSnapshots = await Promise.all(selections.map(async (selection) => { const item = await this.options.getById(context.organizationId, selection.optionItemId); await this.assignments.validateOptionGroupAssigned(context.organizationId, command.branchId, product.id, variationId, item.modifierGroupId); const group = await this.groups.getById(context.organizationId, item.modifierGroupId); return this.options.resolveOptionItemSnapshot(context.organizationId, command.branchId, group, item.id, selection.quantity ?? 1); })); const tax = await this.tax.resolveEffectiveTaxForSaleLine({ organizationId: context.organizationId, branchId: command.branchId, categoryId: product.categoryId, productId: product.id, variationId, productTaxProfileId: product.taxProfileId, at: context.requestTimestamp }); return { quantity: line.quantity, product: await this.products.resolveProductSnapshot(context.organizationId, command.branchId, product.id), category, ...(variation ? { variation } : {}), unitPrice, ...(recipe ? { recipe } : {}), options: optionSnapshots, tax, ...(line.notes ? { notes: line.notes } : {}) }; }));
        return { organizationId: context.organizationId, branchId: command.branchId, employeeId: context.employeeId, currencyCode, lines, paymentMethods: await Promise.all(command.paymentMethodIds.map((id) => this.payments.resolvePaymentMethodSnapshot(context.organizationId, command.branchId, id))), ...(command.customerId ? { customerId: command.customerId } : {}), ...(command.notes ? { notes: command.notes } : {}) };
    }
}
