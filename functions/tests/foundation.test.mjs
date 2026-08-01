import assert from 'node:assert/strict'
import test from 'node:test'
import { correlationId, requestContext } from '../lib/shared/requestContext.js'
test('creates a correlation ID', () => assert.match(correlationId(), /^[0-9a-f-]{36}$/i))
test('rejects unauthenticated callable context', () => assert.throws(() => requestContext({ auth: null }), /Authentication is required/))
test('parses trusted claims', () => assert.equal(requestContext({ auth: { uid: 'user-1', token: { organizationId: 'org-1', permissions: ['pos.sell'], roleIds: ['cashier'] } } }).organizationId, 'org-1'))
