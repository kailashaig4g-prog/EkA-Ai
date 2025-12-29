import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const LanguageContext = createContext(null);

// Supported languages (11 Indian languages + English)
export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
];

// UI Translations
const TRANSLATIONS = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.chat': 'AI Chat',
    'nav.vehicles': 'My Vehicles',
    'nav.newChat': 'New Chat',
    'nav.logout': 'Logout',
    
    // Chat
    'chat.welcome': 'Welcome to Kailash AI',
    'chat.subtitle': 'Your automotive AI assistant. Ask me anything about your vehicle.',
    'chat.placeholder': 'Ask Kailash AI anything...',
    'chat.send': 'Send',
    'chat.stop': 'Stop',
    'chat.newChat': 'New Chat',
    'chat.noVehicle': 'No vehicle selected',
    
    // Quick Prompts
    'prompt.service': 'Service Schedule',
    'prompt.serviceDesc': 'When is my next service due?',
    'prompt.oil': 'Engine Oil',
    'prompt.oilDesc': 'Recommend engine oil for my car',
    'prompt.battery': 'Battery Check',
    'prompt.batteryDesc': 'How to check battery health?',
    'prompt.ev': 'EV Charging',
    'prompt.evDesc': 'Find nearby charging stations',
    
    // Vehicles
    'vehicle.title': 'My Vehicles',
    'vehicle.add': 'Add Vehicle',
    'vehicle.edit': 'Edit',
    'vehicle.delete': 'Delete',
    'vehicle.setPrimary': 'Set Primary',
    'vehicle.noVehicles': 'No vehicles registered',
    'vehicle.addFirst': 'Add your first vehicle',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    
    // Auth
    'auth.login': 'Sign In',
    'auth.register': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Full Name',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
  },
  hi: {
    'nav.dashboard': 'डैशबोर्ड',
    'nav.chat': 'AI चैट',
    'nav.vehicles': 'मेरी गाड़ियाँ',
    'nav.newChat': 'नई चैट',
    'nav.logout': 'लॉग आउट',
    'chat.welcome': 'कैलाश AI में आपका स्वागत है',
    'chat.subtitle': 'आपका ऑटोमोटिव AI सहायक। अपने वाहन के बारे में कुछ भी पूछें।',
    'chat.placeholder': 'कैलाश AI से कुछ भी पूछें...',
    'chat.send': 'भेजें',
    'chat.stop': 'रोकें',
    'chat.newChat': 'नई चैट',
    'chat.noVehicle': 'कोई वाहन चयनित नहीं',
    'prompt.service': 'सर्विस शेड्यूल',
    'prompt.serviceDesc': 'मेरी अगली सर्विस कब है?',
    'prompt.oil': 'इंजन ऑयल',
    'prompt.oilDesc': 'मेरी कार के लिए इंजन ऑयल सुझाएं',
    'prompt.battery': 'बैटरी जांच',
    'prompt.batteryDesc': 'बैटरी की स्वास्थ्य कैसे जांचें?',
    'prompt.ev': 'EV चार्जिंग',
    'prompt.evDesc': 'नजदीकी चार्जिंग स्टेशन खोजें',
    'vehicle.title': 'मेरी गाड़ियाँ',
    'vehicle.add': 'गाड़ी जोड़ें',
    'vehicle.edit': 'संपादित करें',
    'vehicle.delete': 'हटाएं',
    'vehicle.setPrimary': 'प्राथमिक सेट करें',
    'vehicle.noVehicles': 'कोई वाहन पंजीकृत नहीं',
    'vehicle.addFirst': 'अपनी पहली गाड़ी जोड़ें',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'एक त्रुटि हुई',
    'common.success': 'सफल',
    'auth.login': 'साइन इन',
    'auth.register': 'साइन अप',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.name': 'पूरा नाम',
    'auth.noAccount': 'खाता नहीं है?',
    'auth.hasAccount': 'पहले से खाता है?',
  },
  // Add more languages as needed - keeping translations minimal for MVP
};

/**
 * LanguageProvider - Manages multi-language support
 */
export const LanguageProvider = ({ children }) => {
  // Initialize from localStorage or default to 'en'
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });

  // Get current language info
  const currentLanguage = useMemo(() => {
    return LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  }, [language]);

  // Translation function
  const t = useCallback(
    (key, fallback = key) => {
      const translations = TRANSLATIONS[language] || TRANSLATIONS.en;
      return translations[key] || TRANSLATIONS.en[key] || fallback;
    },
    [language]
  );

  // Change language
  const changeLanguage = useCallback((langCode) => {
    if (LANGUAGES.some((l) => l.code === langCode)) {
      setLanguage(langCode);
      localStorage.setItem('language', langCode);
    }
  }, []);

  // Get AI prompt instruction for language
  const getAIPromptInstruction = useCallback(() => {
    if (language === 'en') return '';
    
    const langInfo = LANGUAGES.find((l) => l.code === language);
    if (!langInfo) return '';
    
    return `\n\nIMPORTANT: Please respond in ${langInfo.name} (${langInfo.native}). The user prefers communication in this language.`;
  }, [language]);

  const value = {
    language,
    currentLanguage,
    languages: LANGUAGES,
    t,
    changeLanguage,
    getAIPromptInstruction,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
