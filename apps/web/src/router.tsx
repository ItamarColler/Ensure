import { createBrowserRouter, redirect } from 'react-router';

import { App } from './App';
import { AppError } from './AppError';
import { Coverage } from './routes/coverage/Coverage';
import { Quote } from './routes/quote/Quote';
import { Vehicle } from './routes/vehicle/Vehicle';
import { useDraftStore } from './store';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    ErrorBoundary: AppError,
    children: [
      { index: true, loader: () => redirect('/vehicle') },
      { path: 'vehicle', Component: Vehicle },
      {
        path: 'coverage',
        loader: () => {
          if (!useDraftStore.getState().vehicle) {
            return redirect('/vehicle');
          }

          return {};
        },
        Component: Coverage,
      },
      {
        path: 'quote',
        loader: () => {
          const { vehicle, coverage } = useDraftStore.getState();

          if (!vehicle) {
            return redirect('/vehicle');
          }

          if (!coverage) {
            return redirect('/coverage');
          }

          return {};
        },
        Component: Quote,
      },
    ],
  },
]);
