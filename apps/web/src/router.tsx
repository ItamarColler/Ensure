import { createBrowserRouter, redirect } from 'react-router';

import { App } from './App';
import { PlateForm } from './PlateForm';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      { index: true, loader: () => redirect('/vehicle') },
      { path: 'vehicle', Component: PlateForm },
    ],
  },
]);
