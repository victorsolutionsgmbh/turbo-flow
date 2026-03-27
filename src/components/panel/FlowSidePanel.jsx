import React from 'react';
import { X, ExternalLink, Clock, Layers, Globe } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function FlowSidePanel({ flow, onClose }) {
    const { t } = useLanguage();
    if (!flow) return null;

    const openInPowerAutomate = () => {
        if (flow.environmentName && flow.id) {
            window.open(
                `https://make.powerautomate.com/environments/${flow.environmentName}/flows/${flow.id}/details`,
                '_blank'
            );
        }
    };

    return (
        <div className="w-96 border-l border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{t('panel.title')}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div>
                    <button
                        onClick={openInPowerAutomate}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        <ExternalLink className="w-4 h-4" />
                        {t('panel.open_pa')}
                    </button>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t('panel.name')}</label>
                    <p className="text-sm font-semibold text-gray-900">{flow.displayName}</p>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t('panel.flow_id')}</label>
                    <p className="text-xs text-gray-700 font-mono break-all">{flow.id}</p>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t('panel.status')}</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        flow.state === 'Started' ? 'bg-green-100 text-green-800'
                        : flow.state === 'Stopped' ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                        {flow.state}
                    </span>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {t('panel.environment')}
                    </label>
                    <p className="text-sm text-gray-900">{flow.environmentDisplayName}</p>
                    <p className="text-xs text-gray-500 mt-1">{flow.environmentName}</p>
                </div>

                {flow.uris && flow.uris.length > 0 && (
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {t('panel.uris', { count: flow.uris.length })}
                        </label>
                        <div className="space-y-2">
                            {flow.uris.map((uri, index) => (
                                <div key={index} className="bg-white border border-gray-200 rounded p-2">
                                    <p className="text-xs text-gray-700 break-all font-mono">{uri}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t('panel.created')}
                    </label>
                    <p className="text-sm text-gray-900">
                        {flow.createdTime ? new Date(flow.createdTime).toLocaleString('de-DE') : '-'}
                    </p>
                </div>

                {flow.lastModifiedTime && (
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('panel.modified')}</label>
                        <p className="text-sm text-gray-900">{new Date(flow.lastModifiedTime).toLocaleString('de-DE')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
