import { useEffect, useMemo, useState } from 'react'
import { Button, Dialog } from '../../../shared/components'
import { loadTrustedPaymentMethods, type TrustedSaleSubmissionResult } from '../../../application/sales'
import type { ConfiguredPaymentMethod } from '../domain'
import { getPaymentSummary, usePaymentStore } from '../stores/paymentStore'

export function PaymentDialog({ open, due, organizationId, branchId, onClose, onComplete }: { open: boolean; due: number; organizationId: string; branchId: string; onClose: () => void; onComplete: (payments: ReturnType<typeof usePaymentStore.getState>['payments']) => Promise<TrustedSaleSubmissionResult> }) {
  const [methods, setMethods] = useState<readonly ConfiguredPaymentMethod[]>([])
  const [methodId, setMethodId] = useState('')
  const [amount, setAmount] = useState('')
  const [reference, setReference] = useState('')
  const [processing, setProcessing] = useState(false)
  const [configurationError, setConfigurationError] = useState<string | null>(null)
  const [result, setResult] = useState<TrustedSaleSubmissionResult | null>(null)
  const paymentState = usePaymentStore()
  const summary = useMemo(() => getPaymentSummary(paymentState), [paymentState])
  const selectedMethod = methods.find((method) => method.id === methodId) ?? null

  useEffect(() => { if (open) paymentState.setDue(due) }, [due, open, paymentState])
  useEffect(() => {
    if (!open) return
    let active = true
    void loadTrustedPaymentMethods(organizationId, branchId).then((configured) => {
      if (!active) return
      setMethods(configured)
      setMethodId((current) => configured.some((method) => method.id === current) ? current : (configured[0]?.id ?? ''))
      setConfigurationError(configured.length ? null : 'No trusted payment methods are configured for this branch.')
    }).catch(() => { if (active) setConfigurationError('Payment methods could not be loaded. Check your connection and retry.') })
    return () => { active = false }
  }, [branchId, open, organizationId])

  async function submit() {
    if (processing || summary.balance > 0) return
    setProcessing(true)
    const completed = await onComplete(paymentState.payments)
    setResult(completed)
    setProcessing(false)
    if (completed.success) paymentState.clearPayments()
  }

  const canAdd = Boolean(selectedMethod) && Number(amount) > 0 && (!selectedMethod?.requiresTransactionReference || reference.trim())
  const finalFailure = Boolean(result && !result.success && !result.error.recoverable); const uncertainFailure = Boolean(result && !result.success && result.error.code === 'offline_unavailable')
  return <Dialog title="Payment" open={open} onClose={onClose} footer={result?.success ? <Button type="button" onClick={onClose}>Close</Button> : <Button type="button" disabled={summary.balance > 0 || processing || Boolean(configurationError) || finalFailure || uncertainFailure} onClick={() => void submit()}>{processing ? 'Completing…' : 'Complete payment'}</Button>}><div className="space-y-3">{result?.success ? <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900"><strong className="block">Sale completed</strong><p className="mt-1">Receipt {result.receiptNumber} · Change ₱{result.changeAmount.toFixed(2)}</p><p className="mt-2 text-xs">Total ₱{result.grandTotal.toFixed(2)} · Tax ₱{result.taxTotal.toFixed(2)}</p>{result.receipt ? <p className="mt-2 text-xs">Server receipt loaded with {result.receipt.lines.length} line{result.receipt.lines.length === 1 ? '' : 's'}.</p> : <p role="alert" className="mt-2 text-xs">Sale is committed. The immutable receipt is still loading; use reprint once it is available.</p>}</div> : <><select value={methodId} onChange={(event) => setMethodId(event.target.value)} disabled={Boolean(configurationError)} className="w-full rounded border p-2"><option value="">Select configured payment method</option>{methods.map((method) => <option key={method.id} value={method.id}>{method.name}</option>)}</select>{configurationError ? <p role="alert" className="rounded bg-rose-50 p-2 text-sm text-rose-700">{configurationError}</p> : null}<input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="0" placeholder="Amount" className="w-full rounded border p-2" />{selectedMethod?.requiresTransactionReference ? <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Transaction reference" className="w-full rounded border p-2" /> : null}<Button type="button" disabled={!canAdd || processing || finalFailure || uncertainFailure} onClick={() => { if (!selectedMethod) return; const numericAmount = Number(amount); paymentState.addPayment({ paymentMethodId: selectedMethod.id, amount: numericAmount, currencyCode: selectedMethod.currencyCode, ...(reference.trim() ? { transactionReference: reference.trim() } : {}), ...(selectedMethod.settlementCategory === 'CASH' ? { tenderedAmount: numericAmount } : {}) }); setAmount(''); setReference('') }}>Add payment</Button><p>Due: ₱{summary.due.toFixed(2)} · Balance: ₱{summary.balance.toFixed(2)} · Change: ₱{summary.change.toFixed(2)}</p>{result && !result.success ? <p role="alert" className="rounded bg-rose-50 p-2 text-sm text-rose-700">{result.error.message}{result.error.correlationId ? <span className="mt-1 block text-xs">Support ID: {result.error.correlationId}</span> : null}</p> : null}</>}</div></Dialog>
}
