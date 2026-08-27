import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import applicant from './he/applicant.json';
import auth from './he/auth.json';
import common from './he/common.json';
import coverage from './he/coverage.json';
import errors from './he/errors.json';
import policy from './he/policy.json';
import vehicle from './he/vehicle.json';

const languageDirections = { he: 'rtl' } as const;

type SupportedLanguage = keyof typeof languageDirections;

const activeLanguage: SupportedLanguage = 'he';

void i18next.use(initReactI18next).init({
  lng: activeLanguage,
  fallbackLng: activeLanguage,
  ns: ['common', 'vehicle', 'errors', 'coverage', 'auth', 'applicant', 'policy'],
  defaultNS: 'common',
  resources: {
    he: { common, vehicle, errors, coverage, auth, applicant, policy },
  },
  interpolation: { escapeValue: false },
});

document.documentElement.lang = activeLanguage;
document.documentElement.dir = languageDirections[activeLanguage];
document.title = i18next.t('app.title');
