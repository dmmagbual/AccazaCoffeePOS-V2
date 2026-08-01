"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTransaction = runTransaction;
exports.normalizeTimestamp = normalizeTimestamp;
exports.serializeMoney = serializeMoney;
async function runTransaction(firestore, work) { return firestore.runTransaction(work); }
function normalizeTimestamp(value) { return value instanceof Date ? value : value.toDate(); }
function serializeMoney(minor) { if (!Number.isSafeInteger(minor))
    throw new Error('Money must use safe minor units.'); return minor; }
