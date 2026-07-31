import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../../layouts/AppLayout'
import { ROUTES } from '../config'

export const router = createBrowserRouter([
  {
    path: ROUTES.dashboard,
    element: <AppLayout />,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('../../features/dashboard/pages/DashboardPage')).DashboardPage }) },
      { path: ROUTES.pos.slice(1), lazy: async () => ({ Component: (await import('../../features/pos/pages/PointOfSalePage')).PointOfSalePage }) },
      { path: ROUTES.menuManagement.slice(1), lazy: async () => ({ Component: (await import('../../features/pos/pages/MenuManagementPage')).MenuManagementPage }) },
      { path: ROUTES.masterData.slice(1), lazy: async () => ({ Component: (await import('../../features/master-data')).MasterDataPage }) },
      { path: ROUTES.ingredients.slice(1), lazy: async () => ({ Component: (await import('../../features/ingredients')).IngredientManagementPage }) },
    ],
  },
])
