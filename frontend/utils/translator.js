'use client';

// This is a simplified translator service
// In a production app, you'd use a more sophisticated translation service like Google Translate API
const translationCache = new Map();

// List of supported languages
export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' }
];

// Google Translate API function (requires API key)
export const translateText = async (text, targetLang = 'en', sourceLang = 'auto') => {
  // If text is empty or target language is the same as source, return as is
  if (!text || targetLang === sourceLang) {
    return text;
  }
  
  // Check cache first
  const cacheKey = `${text}_${sourceLang}_${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }
  
  try {
    // In a real implementation, you would call the Google Translate API here
    // For demo purposes, we'll just append [Translated] to show it would be translated
    // Replace this with actual API call in production
    
    // Mock translation API call
    const translatedText = `${text} [Translated to ${targetLang}]`;
    
    // Cache the result
    translationCache.set(cacheKey, translatedText);
    
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
};

// Function to detect language
export const detectLanguage = async (text) => {
  // In a real implementation, you would call a language detection API
  // For demo purposes, returning English
  return 'en';
};

// Mock translation service
// Replace with actual API in production
const translations = {
  'en': {
    'Submit': 'Submit',
    'Login': 'Login',
    'Signup': 'Signup',
    'Complaint': 'Complaint',
    'Department': 'Department',
    'Home': 'Home',
    'Profile': 'Profile',
    'Track Complaint': 'Track Complaint',
    'Register Complaint': 'Register Complaint',
    'Complaint History': 'Complaint History'
  },
  'hi': {
    'Submit': 'सबमिट करें',
    'Login': 'लॉगिन',
    'Signup': 'साइन अप',
    'Complaint': 'शिकायत',
    'Department': 'विभाग',
    'Home': 'होम',
    'Profile': 'प्रोफाइल',
    'Track Complaint': 'शिकायत ट्रैक करें',
    'Register Complaint': 'शिकायत दर्ज करें',
    'Complaint History': 'शिकायत इतिहास'
  }
};

// Simple translation function for UI elements
export const translate = (key, lang = 'en') => {
  if (!translations[lang] || !translations[lang][key]) {
    return key; // Fallback to the key itself
  }
  return translations[lang][key];
};