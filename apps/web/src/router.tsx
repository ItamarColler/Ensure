import { createBrowserRouter, redirect } from 'react-router';

import { App } from './App';
import { AppError } from './AppError';
import { restoreSession, useAuthStore } from './auth-store';
import { RouteFallback } from './components/RouteFallback';
import { Confirmation } from './routes/confirmation/Confirmation';
import { Contact } from './routes/contact/Contact';
import { Driving } from './routes/driving/Driving';
import { Personal } from './routes/personal/Personal';
import { Coverage } from './routes/coverage/Coverage';
import { Register } from './routes/register/Register';
import { Vehicle } from './routes/vehicle/Vehicle';
import { useDraftStore } from './store';
import {
  guardRedirectPath,
  nextStepPath,
  sealRedirectPath,
  wizardPrerequisiteSnapshot,
  wizardResetPath,
} from './wizard';

const wizardLoader = (pathname: string) => async () => {
  await restoreSession();

  const auth = useAuthStore.getState();
  const sealTarget = sealRedirectPath(pathname, auth.policy !== undefined);

  if (sealTarget !== undefined) {
    return redirect(sealTarget);
  }

  const draft = useDraftStore.getState();
  const target = guardRedirectPath(
    pathname,
    wizardPrerequisiteSnapshot({
      vehicle: draft.vehicle,
      coverage: draft.coverage,
      auth: auth.user,
      identity: draft.identity,
      contact: draft.contact,
    }),
  );

  if (target !== undefined) {
    return redirect(target);
  }

  if (pathname === '/register' && auth.user !== undefined) {
    const forward = nextStepPath(pathname);

    if (forward !== undefined) {
      return redirect(forward);
    }
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
        path: 'confirmation',
        loader: wizardLoader('/confirmation'),
        HydrateFallback: RouteFallback,
        Component: Confirmation,
      },
      {
        path: 'personal',
        loader: wizardLoader('/personal'),
        HydrateFallback: RouteFallback,
        Component: Personal,
      },
      {
        path: 'contact',
        loader: wizardLoader('/contact'),
        HydrateFallback: RouteFallback,
        Component: Contact,
      },
      {
        path: 'driving',
        loader: wizardLoader('/driving'),
        HydrateFallback: RouteFallback,
        Component: Driving,
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
