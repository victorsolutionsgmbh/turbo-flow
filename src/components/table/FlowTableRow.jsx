import React from "react";
import TriggerBadge from "./TriggerBadge";
import { useLanguage } from "../../i18n/LanguageContext";

export default function FlowTableRow({ item, selectedFlows, toggleFlowSelection, visibleColumns, onNameClick }) {
    const { t } = useLanguage();
    const isFlow = item.type === "Flow";
    const isSelected = selectedFlows.includes(item.id);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('de-DE', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const getStateColor = (state) => {
        if (!state || typeof state !== 'string') return 'bg-gray-100 text-gray-800';
        switch (state.toLowerCase()) {
            case 'started': return 'bg-green-100 text-green-800';
            case 'stopped': return 'bg-red-100 text-red-800';
            case 'suspended': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleRowClick = (e) => {
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('a')) return;
        if (isFlow) toggleFlowSelection(item.id);
    };

    const handleNameClick = (e) => {
        e.stopPropagation();
        if (onNameClick && isFlow) onNameClick(item);
    };

    return (
        <tr
            className={`border-b hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''} ${isFlow ? 'cursor-pointer' : ''}`}
            onClick={handleRowClick}
        >
            <td className="px-4 py-3">
                {isFlow && (
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFlowSelection(item.id)}
                        className="cursor-pointer pointer-events-none"
                    />
                )}
            </td>

            {visibleColumns.displayName && (
                <td className="px-6 py-3 text-sm text-gray-900">
                    <div className="break-words whitespace-normal">
                        <button onClick={handleNameClick} className="text-left text-blue-600 hover:text-blue-800 hover:underline font-medium">
                            {item.displayName || item.name || '-'}
                        </button>
                    </div>
                </td>
            )}

            {visibleColumns.trigger && (
                <td className="px-6 py-3">
                    {item.definitionTriggers && item.definitionTriggers[0] ? (
                        <TriggerBadge trigger={item.definitionTriggers[0].api ? item.definitionTriggers[0].api.properties.displayName : item.definitionTriggers[0].type} />
                    ) : (
                        <span className="text-sm text-gray-500">-</span>
                    )}
                </td>
            )}

            {visibleColumns.state && (
                <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStateColor(item.state)}`}>
                        {item.state || '-'}
                    </span>
                </td>
            )}

            {visibleColumns.createdTime && (
                <td className="px-6 py-3 text-sm text-gray-700">{formatDate(item.createdTime)}</td>
            )}

            {visibleColumns.lastModifiedTime && (
                <td className="px-6 py-3 text-sm text-gray-700">{formatDate(item.lastModifiedTime)}</td>
            )}

            {visibleColumns.environment && (
                <td className="px-6 py-3 text-sm text-gray-700">{item.environmentDisplayName || '-'}</td>
            )}

            {visibleColumns.actions && (
                <td className="px-6 py-3">
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                if (item.environmentName) {
                                    window.open(`https://make.powerautomate.com/environments/${item.environmentName}/flows/${item.id}/details`, '_blank');
                                }
                            }}
                            className="btn text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            {t('row.open')}
                        </button>
                    </div>
                </td>
            )}
        </tr>
    );
}
