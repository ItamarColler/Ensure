import '@fontsource/heebo/400.css';
import '@fontsource/heebo/500.css';
import '@fontsource/heebo/700.css';
import '@fontsource/heebo/800.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import './i18n';
import { router } from './router';
import { RtlRoot } from './theme/rtl';

const queryClient = new QueryClient({
  defaultOptions: { mutations: { retry: false } },
});

const container = document.querySelector('#root');

if (container) {
  createRoot(container).render(
    <StrictMode>
      <RtlRoot>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </RtlRoot>
    </StrictMode>,
  );
}
