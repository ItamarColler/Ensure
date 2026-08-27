import { createBrowserRouter, redirect } from 'react-router';

import { App } from './App';
import { AppError } from './AppError';
import { restoreSession, useAuthStore } from './auth-store';
import { RouteFallback } from './components/RouteFallback';
import { Coverage } from './routes/coverage/Coverage';
import { Register } from './routes/register/Register';
import { Vehicle } from './routes/vehicle/Vehicle';
import { useDraftStore } from './store';
import { guardRedirectPath, sealRedirectPath, wizardResetPath } from './wizard';

const wizardLoader = (pathname: string) => async () => {
  await restoreSession();

  const auth = useAuthStore.getState();
  const sealTarget = sealRedirectPath(pathname, auth.policy !== undefined);

  if (sealTarget !== undefined) {
    return redirect(sealTarget);
  }

  const draft = useDraftStore.getState();
  const target = guardRedirectPath(pathname, {
    vehicle: draft.vehicle,
    coverage: draft.coverage,
    auth: auth.user,
  });

  if (target !== undefined) {
    return redirect(target);
  }

  return {};
};

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    ErrorBoundary: AppError,
    children: [
      { index: true, loader: () => redirect(wizardResetPath) },
      {
        path: 'vehicle',
        loader: wizardLoader('/vehicle'),
        HydrateFallback: RouteFallback,
        Component: Vehicle,
      },
      {
        path: 'coverage',
        loader: wizardLoader('/coverage'),
        HydrateFallback: RouteFallback,
        Component: Coverage,
      },
      {
        path: 'register',
        loader: wizardLoader('/register'),
        HydrateFallback: RouteFallback,
        Component: Register,
      },
    ],
  },
]);
