import React, { useEffect } from "react";
import { useLanguage } from "../../i18n/LanguageContext";

const STORAGE_KEY = 'turboflow_filters';

export default function FilterHeader({
    envFilter,
    setEnvFilter,
    availableEnvironments,
    triggerFilter,
    setTriggerFilter,
    availableTriggers,
    statusFilter,
    setStatusFilter,
    availableStates,
    searchTerm,
    setSearchTerm,
    hideFullyUnresolved,
    setHideFullyUnresolved,
    loading,
    onOpenColumnConfig,
    showColumnConfig = true,
    showTriggerFilter = true,
    showHideUnresolved = false,
}) {
    const { t } = useLanguage();

    useEffect(() => {
        try {
            const savedFilters = localStorage.getItem(STORAGE_KEY);
            if (savedFilters) {
                const filters = JSON.parse(savedFilters);
                if (filters.searchTerm) setSearchTerm(filters.searchTerm);
                if (filters.envFilter) setEnvFilter(filters.envFilter);
                if (filters.triggerFilter && showTriggerFilter) setTriggerFilter(filters.triggerFilter);
                if (filters.statusFilter) setStatusFilter(filters.statusFilter);
                if (filters.hideFullyUnresolved !== undefined && showHideUnresolved) {
                    setHideFullyUnresolved(filters.hideFullyUnresolved);
                }
            }
        } catch (error) {
            console.error('error loading filters:', error);
        }
    }, []);

    useEffect(() => {
        const filters = { searchTerm, envFilter, triggerFilter, statusFilter, hideFullyUnresolved };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    }, [searchTerm, envFilter, triggerFilter, statusFilter, hideFullyUnresolved]);

    const activeFiltersCount = [
        envFilter,
        showTriggerFilter ? triggerFilter : null,
        statusFilter
    ].filter(Boolean).length;

    const clearAllFilters = () => {
        setEnvFilter('');
        setTriggerFilter('');
        setStatusFilter('');
        setSearchTerm('');
        setHideFullyUnresolved(false);
    };

    return (
        <div className="p-4 border-b border-gray-200 space-y-4">
            <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex flex-col lg:flex-row gap-3 flex-1">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder={t('filter.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={loading}
                        />
                        <svg
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                title={t('filter.search_clear')}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <div className="relative lg:min-w-[200px]">
                        <select
                            value={envFilter}
                            onChange={(e) => setEnvFilter(e.target.value)}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                            disabled={loading}
                        >
                            <option value="">{t('filter.all_environments')}</option>
                            {availableEnvironments.map(env => (
                                <option key={env} value={env}>{env}</option>
                            ))}
                        </select>
                        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {envFilter && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">1</span>
                        )}
                    </div>

                    {showTriggerFilter && (
                        <div className="relative lg:min-w-[200px]">
                            <select
                                value={triggerFilter}
                                onChange={(e) => setTriggerFilter(e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                disabled={loading}
                            >
                                <option value="">{t('filter.all_triggers')}</option>
                                {availableTriggers.map(trigger => (
                                    <option key={trigger} value={trigger}>{trigger}</option>
                                ))}
                            </select>
                            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            {triggerFilter && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">1</span>
                            )}
                        </div>
                    )}

                    <div className="relative lg:min-w-[200px]">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                            disabled={loading}
                        >
                            <option value="">{t('filter.all_status')}</option>
                            {availableStates.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {statusFilter && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">1</span>
                        )}
                    </div>

                    {showHideUnresolved && (
                        <div className="relative lg:min-w-[200px]">
                            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={hideFullyUnresolved}
                                    onChange={(e) => setHideFullyUnresolved(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 whitespace-nowrap">{t('filter.only_old_url')}</span>
                            </label>
                        </div>
                    )}
                </div>

                {showColumnConfig && (
                    <button
                        onClick={onOpenColumnConfig}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium whitespace-nowrap"
                        title={t('filter.configure_columns')}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="hidden lg:inline">{t('filter.columns')}</span>
                    </button>
                )}
            </div>

            {(activeFiltersCount > 0 || hideFullyUnresolved) && (
                <div className="flex flex-wrap gap-2">
                    {envFilter && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            <span className="font-medium">{t('filter.badge_environment')}</span> {envFilter}
                            <button onClick={() => setEnvFilter('')} className="ml-1 hover:bg-blue-200 rounded-full p-0.5" title={t('filter.remove')}>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </span>
                    )}
                    {showTriggerFilter && triggerFilter && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                            <span className="font-medium">{t('filter.badge_trigger')}</span> {triggerFilter}
                            <button onClick={() => setTriggerFilter('')} className="ml-1 hover:bg-purple-200 rounded-full p-0.5" title={t('filter.remove')}>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </span>
                    )}
                    {statusFilter && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            <span className="font-medium">{t('filter.badge_status')}</span> {statusFilter}
                            <button onClick={() => setStatusFilter('')} className="ml-1 hover:bg-green-200 rounded-full p-0.5" title={t('filter.remove')}>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </span>
                    )}
                    {showHideUnresolved && hideFullyUnresolved && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                            <span className="font-medium">{t('filter.badge_unresolved')}</span>
                            <button onClick={() => setHideFullyUnresolved(false)} className="ml-1 hover:bg-red-200 rounded-full p-0.5" title={t('filter.remove')}>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </span>
                    )}
                    <button
                        onClick={clearAllFilters}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                        {t('filter.reset_all')}
                    </button>
                </div>
            )}

            {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('filter.loading')}
                </div>
            )}
        </div>
    );
}
