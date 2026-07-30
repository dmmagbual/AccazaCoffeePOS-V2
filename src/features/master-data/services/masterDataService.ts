import type { ScopedRepository } from '../../../shared/data/firestore/repositories'
export function createMasterDataService<T>(repository: ScopedRepository<T>) { return { list: repository.list, getById: repository.getById, create: repository.create, update: repository.update } }
