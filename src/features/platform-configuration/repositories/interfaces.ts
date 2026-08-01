import type { FeatureConfiguration, StorageLocation } from '../domain'
export interface PlatformConfigurationRepository<T extends { id: string }> { list(organizationId: string, branchId?: string): Promise<readonly T[]>; create(document: T): Promise<T>; update(id: string, updates: Partial<Omit<T, 'id'>>): Promise<void> }
export interface PlatformConfigurationRepositories { featureConfigurations: PlatformConfigurationRepository<FeatureConfiguration>; storageLocations: PlatformConfigurationRepository<StorageLocation> }
