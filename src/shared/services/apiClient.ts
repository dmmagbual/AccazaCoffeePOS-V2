export const apiClient = { get: async <T,>(path: string): Promise<T> => { throw new Error(`API integration pending: ${path}`) } }
