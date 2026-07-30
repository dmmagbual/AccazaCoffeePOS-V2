export interface ReceiptItem { productId: string; name: string; sku: string; quantity: number; unitPrice: number; total: number }
export interface ReceiptSummary { subtotal: number; discount: number; vat: number; grandTotal: number; paid: number; change: number }
export interface ReceiptBusiness { name: string; address: string; tin: string; footerMessage: string }
export interface ReceiptPayment { method: string; amount: number }
export interface Receipt { number: string; orderNumber: string; business: ReceiptBusiness; cashier: string; issuedAt: Date; items: readonly ReceiptItem[]; summary: ReceiptSummary; payment: ReceiptPayment; notes?: string }
export type ReceiptOutput = 'thermal' | 'pdf' | 'email' | 'bluetooth'
