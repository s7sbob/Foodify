// routes/Router.tsx
import  { lazy } from 'react';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import PrivateRoute from './PrivateRoute';
import HomePage from '../views/pages/frontend-pages/Homepage';
import { Navigate } from 'react-router';
import FullLayout from 'src/layouts/full/FullLayout.tsx';
import BlankLayout from 'src/layouts/blank/BlankLayout.tsx';

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

// authentication
const Login = Loadable(lazy(() => import('../views/authentication/auth1/Login')));

const Error = Loadable(lazy(() => import('../views/authentication/Error')));



// Define the router with PrivateRoute wrapping protected routes
const Router = [
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { path: '/', element: <Navigate to="/HomePage" /> },
      {
        path: '/HomePage',
        element: <PrivateRoute />,
        children: [{ path: '', element: <HomePage /> }],
      },
      
      {
        path: '/pages/treeview',
        element: <PrivateRoute />,
        children: [{ path: '', element: <Treeview /> }],
      },
      {
      path: '/pages/POSScreen',
      element: <PrivateRoute />,
      children: [{ path: '', element: <POSScreen /> }],
      },
      
      {
        path: '/pages/Company',
        element: <PrivateRoute />,
        children: [{ path: '', element: <Company /> }],
      },
      
      {
        path: '/react-tables/column-visiblity',
        element: <PrivateRoute />,
        children: [{ path: '', element: <ReactColumnVisibilityTable /> }],
      },
      {
        path: '/react-tables/PilotListTable',
        element: <PrivateRoute />,
        children: [{ path: '', element: <PilotListTable /> }],
      },
      {
      path: '/react-tables/WaitersPage',
      element: <PrivateRoute />,
      children: [{ path: '', element: <WaitersTable /> }],
      },
      {
        path: '/react-tables/ZoneListTable',
        element: <PrivateRoute />,
        children: [{ path: '', element: <ZoneListTable /> }],
      },
      {
        path: '/react-tables/TableListTable',
        element: <PrivateRoute />,
        children: [{ path: '', element: <TablesListTable /> }],
      },
      {
        path: '/react-tables/TableSectionListTable',
        element: <PrivateRoute />,
        children: [{ path: '', element: <TablesSectionTable /> }],
      },
     //
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/auth/404', element: <Error /> },
      { path: '/auth/login', element: <Login /> },
            { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

export default Router;
