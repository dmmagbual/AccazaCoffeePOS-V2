"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerError = void 0;
exports.toSafeError = toSafeError;
class ServerError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
exports.ServerError = ServerError;
function toSafeError(error) { return error instanceof ServerError ? { code: error.code, message: error.message } : { code: 'internal', message: 'Request could not be completed.' }; }
