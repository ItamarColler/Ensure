import { createBrowserRouter, redirect } from 'react-router';

import { App } from './App';
import { AppError } from './AppError';
import { Coverage } from './routes/coverage/Coverage';
import { Quote } from './routes/quote/Quote';
import { Register } from './routes/register/Register';
import { Vehicle } from './routes/vehicle/Vehicle';
import { useDraftStore } from './store';
import { guardRedirectPath, wizardResetPath } from './wizard';

const wizardLoader = (pathname: string) => () => {
  const target = guardRedirectPath(pathname, useDraftStore.getState());

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
      { path: 'vehicle', Component: Vehicle },
      {
        path: 'coverage',
        loader: wizardLoader('/coverage'),
        Component: Coverage,
      },
      {
        path: 'quote',
        loader: wizardLoader('/quote'),
        Component: Quote,
      },
      {
        path: 'register',
        loader: wizardLoader('/register'),
        Component: Register,
      },
    ],
  },
]);
