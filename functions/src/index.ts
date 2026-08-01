import { onRequest } from 'firebase-functions/https'
import { getAdminFirestore } from './shared/admin.js'
import { correlationId } from './shared/requestContext.js'
export const health = onRequest({ region: 'asia-southeast1' }, async (_request, response) => { getAdminFirestore(); response.status(200).json({ service: 'abp-functions', status: 'ok', environment: process.env.FUNCTIONS_EMULATOR === 'true' ? 'emulator' : 'server', timestamp: new Date().toISOString(), correlationId: correlationId() }) })
