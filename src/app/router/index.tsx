import { createBrowserRouter } from 'react-router-dom'

import { PlaceholderPage } from '@/pages/placeholder/ui/PlaceholderPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PlaceholderPage />,
  },
  {
    path: '*',
    element: <PlaceholderPage />,
  },
])
