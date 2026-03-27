import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";

export default function SyncProgress({ status, onRefresh }) {
  const { t } = useLanguage();

  const getStatusDisplay = () => {
    if (status.error) {
      return {
        icon: "❌",
        title: t('sync.error_title'),
        message: status.error,
        showRefresh: true,
        showProgress: false
      };
    }

    if (!status.hasToken) {
      return {
        icon: "🔑",
        title: t('sync.no_token_title'),
        message: t('sync.no_token_msg'),
        showRefresh: true,
        showProgress: false
      };
    }

    if (status.loadingEnvironments && status.totalEnvs === 0) {
      return {
        icon: "🌍",
        title: t('sync.loading_envs_title'),
        message: t('sync.loading_envs_msg'),
        showRefresh: false,
        showProgress: true
      };
    }

    if (status.loadingFlows) {
      return {
        icon: "⚡",
        title: t('sync.loading_flows_title'),
        message: t('sync.loading_flows_msg', {
          envName: status.envName,
          currentEnv: status.currentEnv,
          totalEnvs: status.totalEnvs
        }),
        details: status.totalFlows > 0
          ? t('sync.loading_flows_details', { totalFlows: status.totalFlows })
          : null,
        showRefresh: false,
        showProgress: true
      };
    }

    return {
      icon: "🔄",
      title: t('sync.syncing_title'),
      message: t('sync.syncing_msg'),
      showRefresh: false,
      showProgress: true
    };
  };

  const display = getStatusDisplay();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="max-w-md w-full px-6 text-center">
        <div className="text-6xl mb-6 animate-pulse">{display.icon}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{display.title}</h2>
        <p className="text-gray-600 mb-2">{display.message}</p>
        {display.details && (
          <p className="text-sm text-gray-500 mb-6">{display.details}</p>
        )}

        {display.showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${status.progress || 0}%` }}
            />
          </div>
        )}

        {display.showProgress && (
          <p className="text-xs text-gray-500 mb-6">{status.progress || 0}%</p>
        )}

        {display.showRefresh && (
          <button
            onClick={onRefresh}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {t('sync.reload')}
          </button>
        )}
      </div>
    </div>
  );
}
