import React, { useState, useEffect } from "react";
import FlowTable from "./components/table/FlowTable";
import Onboarding from "./components/onboarding/Onboarding";
import SyncProgress from "./components/sync/SyncProgress";
import HeaderActions from "./components/header/HeaderActions";
import { useFlowData } from "./hooks/useFlowData";
import { resetExtension } from "./db";
import { useLanguage } from "./i18n/LanguageContext";

const GITHUB_URL = "https://github.com/victorsolutionsgmbh/turbo-flow";

const LANGUAGE_LABELS = {
  de: "DE",
  en: "EN",
};

function App() {
  const { flows, loading, isSyncing, syncStatus, lastSync, triggerSync } = useFlowData();
  const { t, language, switchLanguage, availableLanguages } = useLanguage();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [showPreLoader, setShowPreLoader] = useState(false);
  const [forceSync, setForceSync] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("turboflow_onboarding_completed");
    const shouldSync = localStorage.getItem("turboflow_should_sync");

    setShowOnboarding(!completed);
    setOnboardingChecked(true);

    if (shouldSync === "true") {
      localStorage.removeItem("turboflow_should_sync");
      triggerSync();
    }
  }, []);

  const hasData = flows.length > 0;
  const isInitialLoad = !hasData && (loading || isSyncing);
  const showSyncScreen = forceSync || isInitialLoad;

  const handleReset = async () => {
    if (confirm(t('app.reset_confirm'))) {
      await resetExtension();
      window.location.reload();
    }
  };

  const handleRefresh = () => {
    setForceSync(true);
    triggerSync().finally(() => {
      setForceSync(false);
    });
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);

    if (flows.length === 0) {
      setShowPreLoader(true);
      localStorage.setItem("turboflow_should_sync", "true");

      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  };

  if (!onboardingChecked) {
    return null;
  }

  const showMainContent = !showOnboarding && !showPreLoader && !showSyncScreen;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-blue-900">Turbo Flow</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => switchLanguage(lang)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      language === lang
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {LANGUAGE_LABELS[lang] ?? lang.toUpperCase()}
                  </button>
                ))}
              </div>
              {showMainContent && (
                <HeaderActions
                  lastSync={lastSync}
                  onRefresh={handleRefresh}
                  onReset={handleReset}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-2 flex-1 flex flex-col">
        {showOnboarding ? (
          <Onboarding onComplete={handleOnboardingComplete} />
        ) : showPreLoader ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <p className="text-xl text-gray-700 font-medium">{t('app.preloader')}</p>
            </div>
          </div>
        ) : showSyncScreen ? (
          <SyncProgress
            status={syncStatus}
            onRefresh={() => window.location.reload()}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
            <FlowTable loading={loading} isSyncing={isSyncing} />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              {t('app.footer_copyright', { year: new Date().getFullYear() })}
            </div>
            <div className="flex items-center gap-4">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                {t('app.footer_github')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
