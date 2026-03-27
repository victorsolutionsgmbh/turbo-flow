import React, { useState, useEffect } from "react";
import { useLanguage } from "../../i18n/LanguageContext";

export default function ColumnConfigModal({ open, onClose, columns, onSaveColumns }) {
    const { t } = useLanguage();
    const [localColumns, setLocalColumns] = useState(columns);

    useEffect(() => {
        setLocalColumns(columns);
    }, [columns]);

    const handleToggle = (columnName) => {
        setLocalColumns(prev => ({ ...prev, [columnName]: !prev[columnName] }));
    };

    const handleSave = () => {
        onSaveColumns(localColumns);
        onClose();
    };

    const handleReset = () => {
        setLocalColumns({
            displayName: true,
            trigger: true,
            state: true,
            createdTime: true,
            lastModifiedTime: true,
            environment: true,
            actions: true
        });
    };

    if (!open) return null;

    const columnLabelKeys = {
        displayName: 'columns.display_name',
        trigger: 'columns.trigger',
        state: 'columns.state',
        createdTime: 'columns.created_time',
        lastModifiedTime: 'columns.last_modified',
        environment: 'columns.environment',
        actions: 'columns.actions',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">{t('columns.title')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-3 mb-6">
                    {Object.entries(columnLabelKeys).map(([key, labelKey]) => (
                        <div key={key} className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">{t(labelKey)}</label>
                            <button
                                onClick={() => handleToggle(key)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localColumns[key] ? 'bg-blue-600' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localColumns[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleReset}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {t('columns.reset')}
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {t('columns.save')}
                    </button>
                </div>
            </div>
        </div>
    );
}
