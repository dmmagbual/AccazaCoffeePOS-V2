import assert from 'node:assert/strict'
import test from 'node:test'
import { HttpsError } from 'firebase-functions/https'
import { mapCallableError } from '../lib/shared/callableErrors.js'
test('callable errors retain one correlation id and sanitize unknown failures', () => { const denied = mapCallableError(new HttpsError('permission-denied', 'User is not authorized for this branch.'), 'cid'); assert.equal(denied.details.correlationId, 'cid'); assert.equal(denied.details.reasonCode, 'BRANCH_ACCESS_DENIED'); const validation = mapCallableError(new HttpsError('invalid-argument', 'A sale command is required.'), 'cid'); assert.equal(validation.details.correlationId, 'cid'); const internal = mapCallableError(new Error('secret/path/stack'), 'cid'); assert.equal(internal.code, 'internal'); assert.equal(internal.details.correlationId, 'cid'); assert.equal(internal.message.includes('secret'), false) })
