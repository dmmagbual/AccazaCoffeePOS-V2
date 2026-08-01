"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = log;
function log(event, fields) { console.info(JSON.stringify({ event, ...fields })); }
