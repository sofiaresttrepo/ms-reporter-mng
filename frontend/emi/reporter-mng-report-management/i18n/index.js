import en from './en';
import es from './es';

const locales = {
    en, es
}

export default {
    locales,
    ...locales,
    get: (locale = 'en') => {
        if (locales[locale]){
            return locales[locale]
        }
        return locales[locale.split('_')[0]] ||  en;
    }
};