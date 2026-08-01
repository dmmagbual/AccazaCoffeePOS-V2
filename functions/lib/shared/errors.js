export class ServerError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
export function toSafeError(error) { return error instanceof ServerError ? { code: error.code, message: error.message } : { code: 'internal', message: 'Request could not be completed.' }; }
