import { createBrowserRouter } from 'react-router-dom'

import { WorkspacePage } from '@/pages/workspace/ui/WorkspacePage'
import { AppShell } from '@/widgets/app-shell/ui/AppShell'
import { PlaceholderPage } from '@/pages/placeholder/ui/PlaceholderPage'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        path: '/',
        element: <WorkspacePage />,
      },
      {
        path: '*',
        element: <PlaceholderPage />,
      },
    ],
  },
])
