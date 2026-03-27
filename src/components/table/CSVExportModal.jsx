import React, { useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";

export default function CSVExportModal({ open, onClose, onExport, flowCount }) {
    const { t } = useLanguage();
    const [settings, setSettings] = useState({
        delimiter: ',',
        linebreak: '\n',
        includeHeader: true,
        encoding: 'utf-8-bom',
        quoteChar: '"'
    });

    const handleExport = () => {
        onExport(settings);
        onClose();
    };

    if (!open) return null;

    const suffix = flowCount !== 1 ? 's' : '';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start p-6 pb-4 border-b border-gray-200 flex-shrink-0">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">{t('csv.title')}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {t('csv.export_count', { count: flowCount, suffix })}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('csv.delimiter')}</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: ',', label: t('csv.comma_label'), desc: t('csv.comma_desc') },
                                    { value: ';', label: t('csv.semicolon_label'), desc: t('csv.semicolon_desc') },
                                    { value: '\t', label: t('csv.tab_label'), desc: t('csv.tab_desc') },
                                    { value: '|', label: t('csv.pipe_label'), desc: t('csv.pipe_desc') },
                                ].map(({ value, label, desc }) => (
                                    <label key={value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input type="radio" name="delimiter" value={value} checked={settings.delimiter === value}
                                            onChange={(e) => setSettings({ ...settings, delimiter: e.target.value })} className="mr-3" />
                                        <div>
                                            <div className="font-medium text-gray-900">{label}</div>
                                            <div className="text-xs text-gray-500">{desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('csv.linebreak')}</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { value: '\n', label: 'LF (\\n)', desc: 'Unix/Mac' },
                                    { value: '\r\n', label: 'CRLF (\\r\\n)', desc: 'Windows' },
                                    { value: '\r', label: 'CR (\\r)', desc: 'Alt Mac' },
                                ].map(({ value, label, desc }) => (
                                    <label key={value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input type="radio" name="linebreak" value={value} checked={settings.linebreak === value}
                                            onChange={(e) => setSettings({ ...settings, linebreak: e.target.value })} className="mr-3" />
                                        <div>
                                            <div className="font-medium text-gray-900">{label}</div>
                                            <div className="text-xs text-gray-500">{desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('csv.encoding')}</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: 'utf-8-bom', label: t('csv.utf8bom_label'), desc: t('csv.utf8bom_desc') },
                                    { value: 'utf-8', label: 'UTF-8', desc: t('csv.utf8_desc') },
                                ].map(({ value, label, desc }) => (
                                    <label key={value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input type="radio" name="encoding" value={value} checked={settings.encoding === value}
                                            onChange={(e) => setSettings({ ...settings, encoding: e.target.value })} className="mr-3" />
                                        <div>
                                            <div className="font-medium text-gray-900">{label}</div>
                                            <div className="text-xs text-gray-500">{desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('csv.quote')}</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: '"', label: t('csv.double_quote_label'), desc: t('csv.utf8_desc') },
                                    { value: "'", label: t('csv.single_quote_label'), desc: t('csv.pipe_desc') },
                                ].map(({ value, label, desc }) => (
                                    <label key={value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input type="radio" name="quoteChar" value={value} checked={settings.quoteChar === value}
                                            onChange={(e) => setSettings({ ...settings, quoteChar: e.target.value })} className="mr-3" />
                                        <div>
                                            <div className="font-medium text-gray-900">{label}</div>
                                            <div className="text-xs text-gray-500">{desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <input type="checkbox" id="includeHeader" checked={settings.includeHeader}
                                onChange={(e) => setSettings({ ...settings, includeHeader: e.target.checked })} className="mr-3 w-5 h-5" />
                            <label htmlFor="includeHeader" className="cursor-pointer">
                                <div className="font-medium text-gray-900">{t('csv.include_header_label')}</div>
                                <div className="text-xs text-gray-500">{t('csv.include_header_desc')}</div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 p-6 pt-4 border-t border-gray-200 flex-shrink-0">
                    <button onClick={handleExport}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {t('csv.export_btn')}
                    </button>
                    <button onClick={onClose}
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
                        {t('csv.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
}
