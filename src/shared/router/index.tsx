import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../../layouts/AppLayout'
import { ROUTES } from '../config'

export const router = createBrowserRouter([
  { path: ROUTES.settings, lazy: async () => ({ Component: (await import('../../features/settings')).SettingsPage }) },
  { path: ROUTES.businessSetup, lazy: async () => ({ Component: (await import('../../features/business-setup')).BusinessSetupPage }) },
  {
    path: ROUTES.dashboard,
    element: <AppLayout />,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('../../features/dashboard/pages/DashboardPage')).DashboardPage }) },
      { path: ROUTES.pos.slice(1), lazy: async () => ({ Component: (await import('../../features/pos/pages/PointOfSalePage')).PointOfSalePage }) },
      { path: ROUTES.menuManagement.slice(1), lazy: async () => ({ Component: (await import('../../features/pos/pages/MenuManagementPage')).MenuManagementPage }) },
      { path: ROUTES.masterData.slice(1), lazy: async () => ({ Component: (await import('../../features/master-data')).MasterDataPage }) },
      { path: ROUTES.ingredients.slice(1), lazy: async () => ({ Component: (await import('../../features/ingredients')).IngredientManagementPage }) },
      { path: ROUTES.recipes.slice(1), lazy: async () => ({ Component: (await import('../../features/recipes')).RecipeManagementPage }) },
      { path: ROUTES.operations.slice(1), lazy: async () => ({ Component: (await import('../../features/operations')).StoreOperationsPage }) },
      { path: ROUTES.procurement.slice(1), lazy: async () => ({ Component: (await import('../../features/procurement')).ProcurementPage }) },
      { path: ROUTES.production.slice(1), lazy: async () => ({ Component: (await import('../../features/production')).ProductionPage }) },
      { path: ROUTES.platformConfiguration.slice(1), lazy: async () => ({ Component: (await import('../../features/platform-configuration')).PlatformConfigurationPage }) },
      { path: ROUTES.finance.slice(1), lazy: async () => ({ Component: (await import('../../features/finance')).FinancePage }) },
      { path: ROUTES.interBranchTransfers.slice(1), lazy: async () => ({ Component: (await import('../../features/inter-branch-transfers')).InterBranchTransfersPage }) },
      { path: ROUTES.crm.slice(1), lazy: async () => ({ Component: (await import('../../features/crm')).CrmPage }) },
      { path: ROUTES.analytics.slice(1), lazy: async () => ({ Component: (await import('../../features/analytics')).AnalyticsPage }) },
      { path: ROUTES.workflow.slice(1), lazy: async () => ({ Component: (await import('../../features/workflow')).WorkflowPage }) },
      { path: ROUTES.assets.slice(1), lazy: async () => ({ Component: (await import('../../features/assets')).AssetsPage }) },
      { path: ROUTES.hr.slice(1), lazy: async () => ({ Component: (await import('../../features/hr')).HrPage }) },
      { path: ROUTES.franchise.slice(1), lazy: async () => ({ Component: (await import('../../features/franchise')).FranchisePage }) },
    ],
  },
])
