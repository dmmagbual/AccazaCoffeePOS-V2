import type { ScopedRepository } from '../../../shared/data/firestore/repositories'
import type { CompanySettings, IngredientCategory, PaymentMethod, ProductCategory, StoreLocation, TaxRate, UnitOfMeasure } from '../domain'
export type UnitRepository = ScopedRepository<UnitOfMeasure>
export type ProductCategoryRepository = ScopedRepository<ProductCategory>
export type IngredientCategoryRepository = ScopedRepository<IngredientCategory>
export type PaymentMethodRepository = ScopedRepository<PaymentMethod>
export type TaxRateRepository = ScopedRepository<TaxRate>
export type StoreLocationRepository = ScopedRepository<StoreLocation>
export type CompanySettingsRepository = ScopedRepository<CompanySettings>
