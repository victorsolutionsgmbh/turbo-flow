import React, { useState, useEffect } from 'react';
import { useLanguage } from './i18n/LanguageContext';

const LANGUAGE_LABELS = { de: 'DE', en: 'EN' };

function Popup() {
  const { t, language, switchLanguage, availableLanguages } = useLanguage();
  const [isValidPage, setIsValidPage] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prüfe aktuelle Tab-URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const url = currentTab?.url || '';

      setCurrentUrl(url);
      setIsValidPage(url.startsWith('https://make.powerautomate.com'));
      setLoading(false);
    });
  }, []);

  const handleStartExtension = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];

      // Lösche vorherige Logs
      chrome.storage.session.set({ requestLog: [] }, () => {
        // Starte Monitoring
        chrome.runtime.sendMessage(
          { action: 'startMonitoring', tabId: currentTab.id },
          () => {
            window.close();
          }
        );
      });
    });
  };

  const handleGoToPowerAutomate = () => {
    chrome.tabs.create({ url: 'https://make.powerautomate.com' });
    window.close();
  };

  if (loading) {
    return (
      <div className="w-80 p-8 bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⚡</div>
          <div className="text-lg font-semibold text-blue-600">{t('popup.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gradient-to-br from-blue-50 to-white">
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-end mb-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => switchLanguage(lang)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    language === lang
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {LANGUAGE_LABELS[lang] ?? lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4 shadow-lg">
            <span className="text-4xl">⚡</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">
            Turbo Flow
          </h1>
          <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full"></div>
        </div>

        {isValidPage ? (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
              <p className="text-sm text-blue-800 leading-relaxed text-center">
                {t('popup.valid_page_msg')}
              </p>
            </div>

            <button
              onClick={handleStartExtension}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center gap-2">
                <span>🚀</span>
                <span>{t('popup.start_btn')}</span>
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
              <div className="text-center mb-3">
                <span className="text-3xl">ℹ️</span>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed text-center">
                {t('popup.invalid_page_msg')}
              </p>
            </div>

            <button
              onClick={handleGoToPowerAutomate}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center gap-2">
                <span>🔗</span>
                <span>{t('popup.go_to_pa')}</span>
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-blue-500 py-2 text-center">
        <p className="text-xs text-white font-medium">
          {t('popup.powered_by')} <a href='https://github.com/victorsolutionsgmbh/turbo-flow' target='_blank'>Victorsolutions GmbH</a>
        </p>
      </div>
    </div>
  );
}

export default Popup;
