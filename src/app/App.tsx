import { RouterProvider } from 'react-router-dom'
import { router } from '../shared/router'
import { ErrorBoundary } from './ErrorBoundary'

function App() {
  return <ErrorBoundary><RouterProvider router={router} /></ErrorBoundary>
}

export default App
