// routes/Router.tsx

import { lazy } from 'react';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import PrivateRoute from './PrivateRoute';
import HomePage from '../views/pages/frontend-pages/Homepage';
import { Navigate } from 'react-router';
import FullLayout from 'src/layouts/full/FullLayout';
import BlankLayout from 'src/layouts/blank/BlankLayout';

// Lazy load pages
const Treeview = Loadable(lazy(() => import('../views/pages/treeview/Treeview')));
const POSScreen = Loadable(lazy(() => import('../views/pages/treeview/POSScreen.tsx')));
const Company = Loadable(lazy(() => import('../views/pages/Company/CompanyManagementPage')));
const ReactColumnVisibilityTable = Loadable(
  lazy(() => import('../views/react-tables/columnvisibility/page')),
);
const PilotListTable = Loadable(
  lazy(() => import('../components/react-tables/PilotListTable/PilotListTable')),
);
const WaitersTable = Loadable(
  lazy(() => import('../components/react-tables/WaitersTable/WaitersPage')),
);
const ZoneListTable = Loadable(
  lazy(() => import('../components/react-tables/ZoneListTable/ZoneListTable')),
);
const TablesListTable = Loadable(
  lazy(() => import('../components/react-tables/TablesListTable/TableListTable')),
);
const TablesSectionTable = Loadable(
  lazy(() => import('../components/react-tables/TablesSectionTable/TableSectionListTable')),
);

// Authentication
const Login = Loadable(lazy(() => import('../views/authentication/auth1/Login')));
const Error = Loadable(lazy(() => import('../views/authentication/Error')));

// Define the router with PrivateRoute wrapping protected routes
const Router = [
  {
    path: '/',
    element: <FullLayout />,
    children: [
      // Since we're using MemoryRouter and want the URL to remain constant,
      // we'll use relative paths and ensure that all navigation happens within the app.
      { index: true, element: <Navigate to="/HomePage" replace /> },
      {
        path: 'HomePage',
        element: (
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        ),
      },
      {
        path: 'pages',
        children: [
          {
            path: 'treeview',
            element: (
              <PrivateRoute>
                <Treeview />
              </PrivateRoute>
            ),
          },
          {
            path: 'POSScreen',
            element: (
              <PrivateRoute>
                <POSScreen />
              </PrivateRoute>
            ),
          },
          {
            path: 'Company',
            element: (
              <PrivateRoute>
                <Company />
              </PrivateRoute>
            ),
          },
        ],
      },
      {
        path: 'react-tables',
        children: [
          {
            path: 'column-visiblity',
            element: (
              <PrivateRoute>
                <ReactColumnVisibilityTable />
              </PrivateRoute>
            ),
          },
          {
            path: 'PilotListTable',
            element: (
              <PrivateRoute>
                <PilotListTable />
              </PrivateRoute>
            ),
          },
          {
            path: 'WaitersPage',
            element: (
              <PrivateRoute>
                <WaitersTable />
              </PrivateRoute>
            ),
          },
          {
            path: 'ZoneListTable',
            element: (
              <PrivateRoute>
                <ZoneListTable />
              </PrivateRoute>
            ),
          },
          {
            path: 'TableListTable',
            element: (
              <PrivateRoute>
                <TablesListTable />
              </PrivateRoute>
            ),
          },
          {
            path: 'TableSectionListTable',
            element: (
              <PrivateRoute>
                <TablesSectionTable />
              </PrivateRoute>
            ),
          },
        ],
      },
      { path: '*', element: <Navigate to="/auth/404" replace /> },
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      {
        path: 'auth',
        children: [
          { path: '404', element: <Error /> },
          { path: 'login', element: <Login /> },
          { path: '*', element: <Navigate to="/auth/404" replace /> },
        ],
      },
    ],
  },
];

export default Router;
