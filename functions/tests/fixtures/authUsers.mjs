export const authFixtureIds = Object.freeze({ owner: 'security-owner', cashier: 'security-cashier', otherOrganization: 'security-other-org', franchise: 'security-franchise', headOffice: 'security-head-office' })

async function create(auth, uid, claims) { try { await auth.createUser({ uid }) } catch {} return { uid, claims, customToken: await auth.createCustomToken(uid, claims) } }
export function createOwner(auth, organizationId, branchId) { return create(auth, authFixtureIds.owner, { organizationId, branchId, permissions: ['operations.read', 'finance.read', 'branches.all', 'sales.complete'], roleIds: ['owner'] }) }
export function createCashier(auth, organizationId, branchId, employeeId) { return create(auth, authFixtureIds.cashier, { organizationId, branchId, employeeId, permissions: ['operations.read', 'sales.complete'], roleIds: ['cashier'] }) }
export function createOtherOrgUser(auth, organizationId, branchId) { return create(auth, authFixtureIds.otherOrganization, { organizationId, branchId, permissions: ['operations.read'], roleIds: ['owner'] }) }
export function createFranchiseUser(auth, organizationId, branchId) { return create(auth, authFixtureIds.franchise, { organizationId, branchId, franchiseOrganizationId: organizationId, permissions: ['operations.read'], roleIds: ['franchise'] }) }
export function createHeadOfficeUser(auth, organizationId) { return create(auth, authFixtureIds.headOffice, { organizationId, headOfficeScope: true, permissions: ['operations.read', 'branches.all'], roleIds: ['head-office'] }) }
export async function removeAuthFixtures(auth) { await Promise.all(Object.values(authFixtureIds).map(async (uid) => { try { await auth.deleteUser(uid) } catch {} })) }
