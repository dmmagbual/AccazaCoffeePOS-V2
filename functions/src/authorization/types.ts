export interface OrganizationDocument { id: string; active: boolean; currencyCode?: string; timezone?: string }
export interface BranchDocument { id: string; organizationId: string; active: boolean; timezone: string; currencyCode: string; settings?: Record<string, unknown> }
export interface EmployeeDocument { id: string; organizationId: string; userId: string; active: boolean }
export interface EmployeeBranchAssignment { id: string; organizationId: string; employeeId: string; branchId: string; active: boolean }
export interface ShiftDocument { id: string; organizationId: string; storeId: string; cashierId: string; status: string }
