import React from 'react';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

const LanguageSwitcher = ({ language, onLanguageChange }) => {
  return (
    <div className="flex items-center gap-2" data-testid="language-switcher">
      <Globe className="w-4 h-4 text-sage-500" />
      <div className="flex gap-1 bg-white rounded-full p-1 shadow-sm border border-stone-200">
        <Button
          data-testid="language-en-btn"
          onClick={() => onLanguageChange('en')}
          variant="ghost"
          size="sm"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            language === 'en'
              ? 'bg-sage-500 text-white hover:bg-sage-500 hover:text-white'
              : 'text-stone-600 hover:text-sage-500 hover:bg-sage-50'
          }`}
        >
          EN
        </Button>
        <Button
          data-testid="language-tr-btn"
          onClick={() => onLanguageChange('tr')}
          variant="ghost"
          size="sm"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            language === 'tr'
              ? 'bg-sage-500 text-white hover:bg-sage-500 hover:text-white'
              : 'text-stone-600 hover:text-sage-500 hover:bg-sage-50'
          }`}
        >
          TR
        </Button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;