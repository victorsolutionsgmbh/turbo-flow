import React, { useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";

export default function HeaderActions({ lastSync, onRefresh, onReset }) {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const formatLastSync = () => {
    if (!lastSync) return t('header.last_sync_never');
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return t('header.last_sync_just_now');
    if (diffMins < 60) return t('header.last_sync_minutes', { count: diffMins });

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return t('header.last_sync_hours', { count: diffHours });

    const diffDays = Math.floor(diffHours / 24);
    return t('header.last_sync_days', { count: diffDays, suffix: diffDays > 1 ? 'en' : '' });
  };

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-gray-600">
        <span className="font-medium">{t('header.last_sync_label')}</span>{" "}
        <span>{formatLastSync()}</span>
      </div>
      <button
        onClick={onRefresh}
        className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
      >
        🔄 {t('header.refresh')}
      </button>

      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="px-2 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
              <button
                onClick={() => { setMenuOpen(false); onReset(); }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {t('header.reset')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
