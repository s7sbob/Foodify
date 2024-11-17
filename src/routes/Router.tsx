// src/routes/Router.tsx

import { lazy } from 'react';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import PrivateRoute from './PrivateRoute';
import { Navigate } from 'react-router';
import FullLayout from 'src/layouts/full/FullLayout';
import BlankLayout from 'src/layouts/blank/BlankLayout';
import HomePage from 'src/views/pages/frontend-pages/Homepage.tsx';

// Lazy load pages
const Treeview = Loadable(lazy(() => import('../views/pages/treeview/Treeview')));
const POSScreen = Loadable(lazy(() => import('../views/pages/treeview/POSScreen.tsx')));
const Company = Loadable(lazy(() => import('../views/pages/Company/CompanyManagementPage')));
const ProductsPage = Loadable(lazy(() => import('../views/pages/ProductsPage/ProductsPage')));
const Products = Loadable(lazy(() => import('../views/pages/Products/ProductsPage.tsx')));
const ReactColumnVisibilityTable = Loadable(lazy(() => import('../views/react-tables/columnvisibility/page')));
const PilotListTable = Loadable(lazy(() => import('../components/react-tables/PilotListTable/PilotListTable')));
const WaitersTable = Loadable(lazy(() => import('../components/react-tables/WaitersTable/WaitersPage')));
const ZoneListTable = Loadable(lazy(() => import('../components/react-tables/ZoneListTable/ZoneListTable')));
const TablesListTable = Loadable(lazy(() => import('../components/react-tables/TablesListTable/TableListTable')));
const TablesSectionTable = Loadable(lazy(() => import('../components/react-tables/TablesSectionTable/TableSectionListTable')));

// Authentication
const Login = Loadable(lazy(() => import('../views/authentication/auth1/Login')));
const Error = Loadable(lazy(() => import('../views/authentication/Error')));

// Define the router with PrivateRoute wrapping protected routes
const Router = [
  {
    path: '/',
    element: (
      <PrivateRoute>
        <FullLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'HomePage',
        element: <HomePage />,
      },
      {
        path: 'products',
        element: <Products />
      },
      {
        path: 'pages',
        children: [
          {
            path: 'treeview',
            element: <Treeview />,
          },
          {
            path: 'POSScreen',
            element: <POSScreen />,
          },
          {
            path: 'Company',
            element: <Company />,
          },
        ],
      },
      {
        path: 'react-tables',
        children: [
          {
            path: 'column-visiblity',
            element: <ReactColumnVisibilityTable />,
          },
          {
            path: 'PilotListTable',
            element: <PilotListTable />,
          },
          {
            path: 'WaitersPage',
            element: <WaitersTable />,
          },
          {
            path: 'ZoneListTable',
            element: <ZoneListTable />,
          },
          {
            path: 'TableListTable',
            element: <TablesListTable />,
          },
          {
            path: 'TableSectionListTable',
            element: <TablesSectionTable />,
          },
        ],
      },
      { path: '*', element: <Navigate to="/auth/404" replace /> },
    ],
  },
  {
    path: '/auth/*',
    element: <BlankLayout />,
    children: [
      { path: '404', element: <Error /> },
      { path: 'login', element: <Login /> },
      { path: '*', element: <Navigate to="/auth/404" replace /> },
    ],
  },
];

export default Router;
