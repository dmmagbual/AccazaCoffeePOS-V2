export class ServerError extends Error { constructor(public readonly code: string, message: string) { super(message) } }
export function toSafeError(error: unknown): { code: string; message: string } { return error instanceof ServerError ? { code: error.code, message: error.message } : { code: 'internal', message: 'Request could not be completed.' } }
