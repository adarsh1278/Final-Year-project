'use client';

import { useState } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
];

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n, t } = useTranslation();

  const currentLanguage = supportedLanguages.find(lang => lang.code === i18n.language) || supportedLanguages[0];

  const handleSelect = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center space-x-1 text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="h-4 w-4" />
        <span className="text-lg mr-1">{currentLanguage.flag}</span>
        <span className="hidden md:inline">{currentLanguage.name}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
          >
            <div className="py-1 max-h-60 overflow-y-auto bg-white">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  className={`w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center justify-between transition-colors ${lang.code === i18n.language ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:text-blue-900'
                    }`}
                  onClick={() => handleSelect(lang.code)}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.name}</span>
                  </div>
                  {lang.code === i18n.language && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSelector;