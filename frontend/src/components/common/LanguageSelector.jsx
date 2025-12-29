import { useState, useRef, useEffect, memo } from 'react';
import { useLanguage, LANGUAGES } from '../../contexts/LanguageContext';

/**
 * LanguageSelector - Dropdown for language selection
 */
export const LanguageSelector = memo(() => {
  const { language, currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef} data-testid="language-selector">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:bg-[var(--bg-hover)]"
        style={{ color: 'var(--text-secondary)' }}
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium hidden sm:inline">{currentLanguage.native}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden z-50 animate-fade-in"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div className="max-h-[300px] overflow-y-auto py-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--bg-hover)] ${
                  lang.code === language ? 'bg-[var(--bg-secondary)]' : ''
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {lang.native}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {lang.name}
                  </p>
                </div>
                {lang.code === language && (
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: 'var(--brand-primary)' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

LanguageSelector.displayName = 'LanguageSelector';

export default LanguageSelector;
