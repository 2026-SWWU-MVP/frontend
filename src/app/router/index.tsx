import { createBrowserRouter, Navigate } from 'react-router-dom'

import { ProblemSetPage } from '@/pages/problem-set/ui/ProblemSetPage'
import { PlaceholderPage } from '@/pages/placeholder/ui/PlaceholderPage'
import { WorkspacePage } from '@/pages/workspace/ui/WorkspacePage'
import { SchoolTrendsPage } from '@/pages/school-trends/ui/SchoolTrendsPage'
import { ReportsPage } from '@/pages/reports/ui/ReportsPage'
import { ReviewsPage } from '@/pages/reviews/ui/ReviewsPage'
import { AppShell } from '@/widgets/app-shell/ui/AppShell'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        path: '/',
        element: <Navigate replace to="/workspace" />,
      },
      {
        path: '/workspace',
        element: <WorkspacePage />,
      },
      {
        path: '/problem-sets',
        element: <ProblemSetPage />,
      },
      {
        path: '/problem-sets/:problemSetId',
        element: <ProblemSetPage />,
      },
      {
        path: '/school-trends',
        element: <SchoolTrendsPage />,
      },
      {
        path: '/reports',
        element: <ReportsPage />,
      },
      {
        path: '/reviews',
        element: <ReviewsPage />,
      },
      {
        path: '/members',
        element: <PlaceholderPage />,
      },
      {
        path: '/settings',
        element: <PlaceholderPage />,
      },
      {
        path: '*',
        element: <PlaceholderPage />,
      },
    ],
  },
])
