import { HttpsError } from 'firebase-functions/https'

const reasons: Record<string, string> = {
  unauthenticated: 'UNAUTHENTICATED',
  'Organization scope is required.': 'ORGANIZATION_ACCESS_DENIED',
  'User is not authorized for this organization.': 'ORGANIZATION_ACCESS_DENIED',
  'User is not authorized for this branch.': 'BRANCH_ACCESS_DENIED',
  'Employee is not active.': 'EMPLOYEE_INACTIVE',
  'Employee is not assigned to this branch.': 'EMPLOYEE_BRANCH_ASSIGNMENT_MISSING',
  'An open shift is required.': 'OPEN_SHIFT_REQUIRED',
  'The requested shift is not open.': 'SHIFT_CLOSED',
  'Required permission is missing.': 'POS_PERMISSION_DENIED'
}

export function mapCallableError(error: unknown, correlationId: string): HttpsError {
  if (error instanceof HttpsError) {
    const reasonCode = reasons[error.message] ?? error.code.toUpperCase().replace(/-/g, '_')
    return new HttpsError(error.code, error.code === 'internal' ? 'The request could not be completed.' : error.message, { correlationId, reasonCode })
  }
  return new HttpsError('internal', 'The request could not be completed.', { correlationId, reasonCode: 'INTERNAL_ERROR' })
}
