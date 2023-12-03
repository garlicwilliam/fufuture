import enTranslation from './en';
import viTranslation from './vi';
import ruTranslation from './ru';
import koTranslation from './ko';
import jaTranslation from './ja';
import zhTranslation from './zh';
import zhHKTranslation from './zhHK';

import { getAppName } from '../util/app';

const appName: string = getAppName();

const LanguageCacheKey = appName + '_LanguageCacheKey';
const cacheLanguage = localStorage.getItem(LanguageCacheKey);

let selectedLanguage = cacheLanguage || 'en';

export const LgContainer: { [l: string]: any } = {
  en: enTranslation,
  vi: viTranslation,
  ru: ruTranslation,
  ko: koTranslation,
  ja: jaTranslation,
  zh: zhTranslation,
  zhHK: zhHKTranslation,
};

export const setLanguage = (lg: string) => {
  if (!LgContainer[lg]) {
    return;
  }
  localStorage.setItem(LanguageCacheKey, lg);
  selectedLanguage = lg;
};

export const getLanguage = () => {
  return selectedLanguage;
};
