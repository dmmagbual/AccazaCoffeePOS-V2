"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.health = void 0;
const https_1 = require("firebase-functions/https");
const admin_js_1 = require("./shared/admin.js");
const requestContext_js_1 = require("./shared/requestContext.js");
exports.health = (0, https_1.onRequest)({ region: 'asia-southeast1' }, async (_request, response) => { (0, admin_js_1.getAdminFirestore)(); response.status(200).json({ service: 'abp-functions', status: 'ok', environment: process.env.FUNCTIONS_EMULATOR === 'true' ? 'emulator' : 'server', timestamp: new Date().toISOString(), correlationId: (0, requestContext_js_1.correlationId)() }); });
