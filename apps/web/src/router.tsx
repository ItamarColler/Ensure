import { createBrowserRouter, redirect } from 'react-router';

import { App } from './App';
import { CoverageForm } from './CoverageForm';
import { PlateForm } from './PlateForm';
import { useDraftStore } from './store';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      { index: true, loader: () => redirect('/vehicle') },
      { path: 'vehicle', Component: PlateForm },
      {
        path: 'coverage',
        loader: () => {
          if (!useDraftStore.getState().vehicle) {
            return redirect('/vehicle');
          }

          return {};
        },
        Component: CoverageForm,
      },
    ],
  },
]);
