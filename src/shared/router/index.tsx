import { createBrowserRouter } from 'react-router-dom'
import type { ComponentType } from 'react'
import { AppLayout } from '../../layouts/AppLayout'
import { ROUTES } from '../config'

const load = <T,>(loader: () => Promise<T>, component: keyof T) => async () => ({ Component: (await loader())[component] as ComponentType })

export const router = createBrowserRouter([{ path: ROUTES.dashboard, element: <AppLayout />, children: [
  { index: true, lazy: load(() => import('../../features/dashboard/pages/DashboardPage'), 'DashboardPage') },
  { path: ROUTES.pos.slice(1), lazy: load(() => import('../../features/pos/pages/PointOfSalePage'), 'PointOfSalePage') },
  { path: ROUTES.inventory.slice(1), lazy: load(() => import('../../features/inventory/pages/InventoryPage'), 'InventoryPage') },
  { path: ROUTES.customers.slice(1), lazy: load(() => import('../../features/customers/pages/CustomersPage'), 'CustomersPage') },
  { path: ROUTES.employees.slice(1), lazy: load(() => import('../../features/employees/pages/EmployeesPage'), 'EmployeesPage') },
  { path: ROUTES.finance.slice(1), lazy: load(() => import('../../features/finance/pages/FinancePage'), 'FinancePage') },
  { path: ROUTES.reports.slice(1), lazy: load(() => import('../../features/reports/pages/ReportsPage'), 'ReportsPage') },
  { path: ROUTES.settings.slice(1), lazy: async () => { const { FeaturePlaceholder } = await import('../components'); return { Component: () => <FeaturePlaceholder title="Settings" description="Workspace preferences and operational controls will live here." /> } } },
] }, { path: ROUTES.signIn, lazy: load(() => import('../../features/auth/pages/SignInPage'), 'SignInPage') }])
