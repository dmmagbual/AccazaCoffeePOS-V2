"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityRepository = void 0;
const validation_js_1 = require("./validation.js");
class AvailabilityRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async resolve(organizationId, branchId, target, at, timezone) {
        Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(at);
        const query = await this.db.collection('productAvailability').where('organizationId', '==', organizationId).where('branchId', 'in', [branchId, null]).limit(100).get();
        const entries = query.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((entry) => (0, validation_js_1.isEffective)(entry.effectiveFrom, entry.effectiveTo, at) && ((target.productId && entry.productId === target.productId) || (target.variationId && entry.variationId === target.variationId) || (target.optionItemId && entry.optionItemId === target.optionItemId)));
        const day = at.getUTCDay();
        const minutes = at.getUTCHours() * 60 + at.getUTCMinutes();
        const inWindow = (entry) => { const parse = (value) => value ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5)) : undefined; const start = parse(entry.startsAt); const end = parse(entry.endsAt); return (!entry.dayOfWeek || entry.dayOfWeek.includes(day)) && (start === undefined || minutes >= start) && (end === undefined || minutes <= end); };
        const blocking = entries.find((entry) => inWindow(entry) && ['SOLD_OUT', 'DISCONTINUED', 'TEMPORARILY_UNAVAILABLE', 'COMING_SOON'].includes(entry.status));
        if (blocking)
            return { available: false, reason: blocking.status === 'TEMPORARILY_UNAVAILABLE' ? 'SOLD_OUT' : blocking.status, evaluatedAt: at };
        const scheduled = entries.find((entry) => !inWindow(entry));
        if (scheduled)
            return { available: false, reason: 'OUTSIDE_HOURS', evaluatedAt: at };
        return { available: true, reason: 'AVAILABLE', evaluatedAt: at };
    }
}
exports.AvailabilityRepository = AvailabilityRepository;
