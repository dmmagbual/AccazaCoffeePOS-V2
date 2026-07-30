export function calculateTax(amount: number, rate: number): number { return Math.round(Math.max(0, amount) * Math.max(0, rate) * 100) / 100 }
