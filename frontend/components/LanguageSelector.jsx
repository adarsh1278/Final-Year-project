'use client';

import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supportedLanguages } from '@/utils/translator';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, changeLanguage } = useAuth();
  
  const currentLanguage = supportedLanguages.find(lang => lang.code === language) || supportedLanguages[0];
  
  const handleSelect = (langCode) => {
    changeLanguage(langCode);
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
            className="absolute right-0 mt-1 w-40 bg-background border border-border rounded-md shadow-lg z-50"
          >
            <div className="py-1 max-h-60 overflow-y-auto text-blue-800 font-bold">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  className="w-full text-left px-4 py-2 hover:bg-muted flex items-center justify-between"
                  onClick={() => handleSelect(lang.code)}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{lang.flag}</span>
                    <span className="text-sm">{lang.name}</span>
                  </div>
                  {lang.code === language && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;