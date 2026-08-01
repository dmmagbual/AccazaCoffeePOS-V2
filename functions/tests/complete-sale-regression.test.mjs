import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const sourcePath = new URL('../src/sales/completeSale.ts', import.meta.url)
const source = await readFile(sourcePath, 'utf8')

test('completeSale uses the shared inventory package exactly once', () => {
  assert.match(source, /from '@abp\/inventory-consumption'/)
  assert.equal((source.match(/consumeInventoryBatch\(/g) ?? []).length, 1)
})

test('completeSale contains no local FIFO or negative-allocation engine', () => {
  assert.doesNotMatch(source, /allocateFifo|\.sort\(\(a, b\) => a\.receivedDate|fallbackUnitCost|allocation\.remaining/)
  assert.doesNotMatch(source, /const negativeAllocation|Negative inventory allocation created/)
})

test('completeSale keeps inventory effects inside the Firestore transaction', () => {
  assert.match(source, /this\.db\.runTransaction\(async \(transaction\)/)
  assert.match(source, /consumeInventoryBatch\(inputs\)/)
  assert.match(source, /transaction\.set\(this\.db\.collection\('stockMovements'\)/)
  assert.match(source, /transaction\.set\(this\.db\.collection\('inventoryBalances'\)/)
})

test('idempotent retry returns completed result before inventory execution', () => {
  const completed = source.indexOf("data.status === 'COMPLETED'")
  const inventory = source.indexOf('consumeInventoryBatch(inputs)')
  assert.ok(completed >= 0 && inventory >= 0 && completed < inventory)
})
