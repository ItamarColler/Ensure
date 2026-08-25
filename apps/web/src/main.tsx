import '@fontsource/heebo/400.css';
import '@fontsource/heebo/500.css';
import '@fontsource/heebo/700.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './i18n';
import { App } from './App';
import { RtlRoot } from './theme/rtl';

const container = document.querySelector('#root');

if (container) {
  createRoot(container).render(
    <StrictMode>
      <RtlRoot>
        <App />
      </RtlRoot>
    </StrictMode>,
  );
}
