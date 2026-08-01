# Pilot Gap Register

Updated 2026-08-02 after the final P4-002 closure audit. Status is evidence-based.

| ID | Severity | Status | Current evidence | Smallest remaining closure scope |
| --- | --- | --- | --- | --- |
| PILOT-001 | CRITICAL | OPEN | Persistent catalog/server resolution exists; owner-operated catalog completeness is outside P4-002. | Complete owner catalog workflows and POS read-model wiring. |
| PILOT-002 | CRITICAL | OPEN | Real callable emulator coverage verifies authoritative resolution, inventory/COGS, Finance, loyalty earn/redemption, shift totals, rollback, immutability, and read/write rules. | P4-002H.1 POS integration/receipt behavior; P4-002K stale recovery/rules/index closure; executed UAT. |
| PILOT-003 | CRITICAL | OPEN | Server tax precedence/effective dates/embedded snapshots/receipt/Finance/history are verified by `tax-resolution.test.mjs` and `historical-snapshots.test.mjs`. | Mixed-tax discount allocation and refund/reversal tax snapshot foundation; canonical tax snapshot document. |
| PILOT-004 | CRITICAL | OPEN | No approved opening-inventory command audit evidence. | Approved idempotent opening inventory and reversals. |
| PILOT-005 | HIGH | OPEN | Route authorization remains outside this closure audit. | Permission-aware route/deep-link guard and tests. |
| PILOT-006 | HIGH | PARTIAL | Server option resolution/snapshots are verified. POS does not yet carry selected variation/option identifiers into trusted checkout. | P4-002H.1 client cart/request alignment. |
| PILOT-007 | HIGH | PARTIAL | Trusted sale updates persistent shift totals idempotently. Close/settlement/refund workflow is not verified. | Shift settlement and refund foundations. |
| PILOT-008 | HIGH | PARTIAL | Emulator rules tests verify key write denials and owner/cashier/cross-scope reads. | Add actual-collection coverage for every trusted collection and complete indexes. |
| PILOT-009 | MEDIUM | OPEN | No change. | Procurement/AP workflow completion. |
| PILOT-010 | MEDIUM | OPEN | Server recipe resolution is verified; full owner recipe workflow is not assessed here. | Recipe Builder operational completion. |
| PILOT-011 | MEDIUM | OPEN | No change. | Employee/user/role owner workflows. |
| PILOT-012 | MEDIUM | OPEN | Server emulator tests pass; browser UI/UAT coverage is not complete. | Execute the expanded UAT and POS interaction tests. |

P4-002 and PILOT-002 must not be marked closed until the exact items in `docs/P4_002_REMAINING_WORK.md` are complete.
