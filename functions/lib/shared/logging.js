export function log(event, fields) { console.info(JSON.stringify({ event, ...fields })); }
