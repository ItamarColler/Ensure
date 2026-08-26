import { createBrowserRouter, redirect } from 'react-router';

import { App } from './App';
import { CoverageForm } from './CoverageForm';
import { PlateForm } from './PlateForm';
import { QuoteSummary } from './QuoteSummary';
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
        Component: QuoteSummary,
      },
    ],
  },
]);
