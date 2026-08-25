import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from './he/common.json';

const languageDirections = { he: 'rtl' } as const;

type SupportedLanguage = keyof typeof languageDirections;

const activeLanguage: SupportedLanguage = 'he';

void i18next.use(initReactI18next).init({
  lng: activeLanguage,
  fallbackLng: activeLanguage,
  ns: ['common'],
  defaultNS: 'common',
  resources: { he: { common } },
  interpolation: { escapeValue: false },
});

document.documentElement.lang = activeLanguage;
document.documentElement.dir = languageDirections[activeLanguage];
document.title = i18next.t('app.title');
