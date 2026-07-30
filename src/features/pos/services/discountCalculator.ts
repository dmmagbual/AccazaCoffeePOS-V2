import type { CartDiscount } from '../domain'
export function calculateDiscount(subtotal: number, discount: CartDiscount | null): number { if (!discount) return 0; const value = discount.type === 'percentage' ? subtotal * Math.min(100, Math.max(0, discount.value)) / 100 : discount.value; return Math.round(Math.min(Math.max(0, subtotal), Math.max(0, value)) * 100) / 100 }
