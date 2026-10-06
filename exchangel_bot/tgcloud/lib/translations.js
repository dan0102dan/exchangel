// Localized welcome message and Mini App button label.
export const translations = {
  ar: { welcome: 'مرحبا بك في!', openMiniApp: 'فتح التطبيق الصغير' },
  de: { welcome: 'Willkommen bei Exchangel!', openMiniApp: 'Mini-App öffnen' },
  en: { welcome: 'Welcome to Exchangel!', openMiniApp: 'Open Mini App' },
  es: { welcome: '¡Bienvenido a Exchangel!', openMiniApp: 'Abrir Mini App' },
  fr: { welcome: 'Bienvenue sur Exchangel!', openMiniApp: "Ouvrir l'application Mini" },
  ja: { welcome: 'へようこそ！', openMiniApp: 'ミニアプリを開く' },
  ru: { welcome: 'Добро пожаловать в Exchangel!', openMiniApp: 'Открыть Mini App' },
  zh: { welcome: '欢迎来到Exchangel！', openMiniApp: '打开小程序' },
};

export function t(languageCode, key) {
  return translations[languageCode]?.[key] ?? translations.en[key];
}
