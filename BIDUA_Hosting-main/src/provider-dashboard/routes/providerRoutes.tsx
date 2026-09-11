import { RouteObject } from 'react-router-dom';
import { ProviderLayout } from '../layouts/ProviderLayout';
import { Dashboard } from '../pages/Dashboard';
import { ServersList } from '../pages/ServersList';
import { ServerDetails } from '../pages/ServerDetails';
import { ExpiryTracker } from '../pages/ExpiryTracker';

export const providerRoutes: RouteObject = {
  path: '/provider',
  element: <ProviderLayout />,
  children: [
    {
      index: true,
      element: <Dashboard />,
    },
    {
      path: 'servers',
      element: <ServersList />,
    },
    {
      path: 'servers/:serverId',
      element: <ServerDetails />,
    },
    {
      path: 'expiry-tracker',
      element: <ExpiryTracker />,
    },
  ],
};
