import { createBrowserRouter } from 'react-router-dom'

import { AppShell } from '@/widgets/app-shell/ui/AppShell'
import { PlaceholderPage } from '@/pages/placeholder/ui/PlaceholderPage'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        path: '/',
        element: <PlaceholderPage />,
      },
      {
        path: '*',
        element: <PlaceholderPage />,
      },
    ],
  },
])
