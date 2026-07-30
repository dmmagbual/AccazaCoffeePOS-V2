import { createBrowserRouter } from 'react-router-dom'
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage'
import { SignInPage } from '../../features/auth/pages/SignInPage'
import { PointOfSalePage } from '../../features/pos/pages/PointOfSalePage'
import { InventoryPage } from '../../features/inventory/pages/InventoryPage'
import { AppLayout } from '../../layouts/AppLayout'
import { FeaturePlaceholder } from '../components'

export const router = createBrowserRouter([
  { path: '/', element: <AppLayout />, children: [
    { index: true, element: <DashboardPage /> },
    { path: 'pos', element: <PointOfSalePage /> },
    { path: 'inventory', element: <InventoryPage /> },
    { path: 'settings', element: <FeaturePlaceholder title="Settings" description="Workspace preferences and operational controls will live here." /> },
  ] },
  { path: '/sign-in', element: <SignInPage /> },
])
