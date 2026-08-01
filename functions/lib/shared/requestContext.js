"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.correlationId = correlationId;
exports.requestContext = requestContext;
const https_1 = require("firebase-functions/https");
function correlationId() { return crypto.randomUUID(); }
function requestContext(request) { if (!request.auth)
    throw new https_1.HttpsError('unauthenticated', 'Authentication is required.'); const claims = request.auth.token; const organizationId = typeof claims.organizationId === 'string' ? claims.organizationId : ''; if (!organizationId)
    throw new https_1.HttpsError('permission-denied', 'Organization scope is required.'); return { authenticatedUserId: request.auth.uid, organizationId, branchId: typeof claims.branchId === 'string' ? claims.branchId : undefined, employeeId: typeof claims.employeeId === 'string' ? claims.employeeId : undefined, roleIds: Array.isArray(claims.roleIds) ? claims.roleIds.filter((value) => typeof value === 'string') : [], permissions: Array.isArray(claims.permissions) ? claims.permissions.filter((value) => typeof value === 'string') : [], correlationId: correlationId(), requestTimestamp: new Date() }; }
