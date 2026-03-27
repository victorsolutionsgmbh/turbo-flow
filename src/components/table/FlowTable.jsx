import React, { useEffect, useMemo, useState } from "react";
import Loader from "../sync/Loader";
import FilterHeader from "../filter/FilterHeader";
import { useLanguage } from "../../i18n/LanguageContext";
import FlowTableRow from "./FlowTableRow";
import Pagination from "./Pagination";
import ColumnConfigModal from "./ColumnConfigModal";
import BulkActionsDropdown from "./BulkActionsDropdown";
import CSVExportModal from "./CSVExportModal";
import FlowSidePanel from "../panel/FlowSidePanel";
import { flowsTable } from "../../db";
import { exportFlowsToCSV } from "./useCSVExport";

export default function FlowTable({ loading, isSyncing }) {
    const { t } = useLanguage();
    const [columnConfigOpen, setColumnConfigOpen] = useState(false);
    const [csvExportModalOpen, setCSVExportModalOpen] = useState(false);
    const [envFilter, setEnvFilter] = useState("");
    const [triggerFilter, setTriggerFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFlows, setSelectedFlows] = useState([]);
    const [data, setData] = useState([]);
    const [selectedFlowForPanel, setSelectedFlowForPanel] = useState(null);
    const itemsPerPage = 10;

    const [visibleColumns, setVisibleColumns] = useState(() => {
        const saved = localStorage.getItem('flowTableColumns');
        return saved ? JSON.parse(saved) : {
            displayName: true,
            trigger: true,
            state: true,
            createdTime: true,
            lastModifiedTime: true,
            environment: true,
            actions: true
        };
    });

    const handleSaveColumns = (newColumns) => {
        setVisibleColumns(newColumns);
        localStorage.setItem('flowTableColumns', JSON.stringify(newColumns));
    };

    const refreshData = async () => {
        try {
            const lf = await flowsTable.toArray();
            const validFlows = lf.filter(flow => flow && typeof flow === 'object' && flow.id);
            setData(validFlows);
        } catch (error) {
            console.error('error refreshing data:', error);
        }
    };

    useEffect(() => {
        refreshData();
    }, [isSyncing]);

    useEffect(() => {
        if (isSyncing || loading) {
            const interval = setInterval(refreshData, 2000);
            return () => clearInterval(interval);
        }
    }, [isSyncing, loading]);

    const toggleFlowSelection = (flowId) => {
        if (!flowId) return;
        setSelectedFlows((prev) =>
            prev.includes(flowId) ? prev.filter(id => id !== flowId) : [...prev, flowId]
        );
    };

    const availableEnvironments = useMemo(() => {
        const flowEnvs = data
            .filter(d => d && d.environmentDisplayName)
            .map((d) => d.environmentDisplayName);
        return [...new Set(flowEnvs)].filter(Boolean);
    }, [data]);

    const availableTriggers = useMemo(() => {
        const triggers = data
            .filter(d => d && d.definitionTriggers && d.definitionTriggers[0])
            .map((item) => item.definitionTriggers[0].api ? item.definitionTriggers[0].api.properties.displayName : item.definitionTriggers[0].type)
            .filter(Boolean);
        return [...new Set(triggers)].sort();
    }, [data]);

    const availableStates = useMemo(() => {
        const states = data
            .filter(d => d && d.state)
            .map((d) => d.state)
            .filter(Boolean);
        return [...new Set(states)].sort();
    }, [data]);

    const isFlowMatchingSearch = useMemo(() => {
        if (!searchTerm || !searchTerm.trim()) return () => true;

        const normalizedSearchTerm = String(searchTerm).toLowerCase().trim();

        return (flow) => {
            if (!flow) return false;

            const fields = [];

            if (flow.name) fields.push(String(flow.name));
            if (flow.displayName) fields.push(String(flow.displayName));
            if (flow.environmentDisplayName) fields.push(String(flow.environmentDisplayName));

            if (flow.definitionTriggers && Array.isArray(flow.definitionTriggers) && flow.definitionTriggers[0]) {
                const trigger = flow.definitionTriggers[0];
                if (trigger.api && trigger.api.properties && trigger.api.properties.displayName) {
                    fields.push(String(trigger.api.properties.displayName));
                } else if (trigger.type) {
                    fields.push(String(trigger.type));
                }
            }

            return fields.some(field => {
                try {
                    return field.toLowerCase().includes(normalizedSearchTerm);
                } catch (e) {
                    console.warn('search filter error:', e, 'field:', field);
                    return false;
                }
            });
        };
    }, [searchTerm]);

    const filteredFlows = useMemo(() => {
        let flows = data.filter(flow => flow && flow.id);

        if (searchTerm && searchTerm.trim()) {
            flows = flows.filter(isFlowMatchingSearch);
        }

        if (envFilter) {
            flows = flows.filter(flow => flow.environmentDisplayName === envFilter);
        }

        if (triggerFilter) {
            flows = flows.filter(flow =>
                flow.definitionTriggers &&
                flow.definitionTriggers[0] &&
                (
                    flow.definitionTriggers[0].api ?
                        (flow.definitionTriggers[0].api.properties.displayName === triggerFilter) :
                        (flow.definitionTriggers[0].type === triggerFilter)
                )
            );
        }

        if (statusFilter) {
            flows = flows.filter(flow => flow.state === statusFilter);
        }

        return flows.map(flow => ({ ...flow, type: "Flow" }));
    }, [data, searchTerm, envFilter, triggerFilter, statusFilter, isFlowMatchingSearch]);

    const allAvailableFlowIds = useMemo(() => {
        return filteredFlows.filter(flow => flow && flow.id).map(flow => flow.id);
    }, [filteredFlows]);

    const globalSelectionState = useMemo(() => {
        if (allAvailableFlowIds.length === 0) return 'none';
        const selectedCount = allAvailableFlowIds.filter(id => selectedFlows.includes(id)).length;
        if (selectedCount === 0) return 'none';
        if (selectedCount === allAvailableFlowIds.length) return 'all';
        return 'partial';
    }, [allAvailableFlowIds, selectedFlows]);

    const toggleGlobalSelection = () => {
        setSelectedFlows((prev) => {
            if (globalSelectionState === 'all') {
                return prev.filter(id => !allAvailableFlowIds.includes(id));
            } else {
                return [...new Set([...prev, ...allAvailableFlowIds])];
            }
        });
    };

    const totalPages = Math.ceil(filteredFlows.length / itemsPerPage);
    const currentData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredFlows.slice(start, start + itemsPerPage);
    }, [filteredFlows, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
        setSelectedFlows(prev => prev.filter(id => allAvailableFlowIds.includes(id)));
    }, [searchTerm, envFilter, triggerFilter, statusFilter]);

    const hasSearchResults = !searchTerm || !searchTerm.trim() || filteredFlows.length > 0;
    const showNoResultsMessage = searchTerm && searchTerm.trim() && filteredFlows.length === 0;

    const handleOpenCSVExport = () => setCSVExportModalOpen(true);

    const handleCSVExport = (csvSettings) => {
        try {
            const flowsToExport = filteredFlows.filter(flow => selectedFlows.includes(flow.id));
            const finalFlowsToExport = flowsToExport.length > 0 ? flowsToExport : filteredFlows;
            exportFlowsToCSV(finalFlowsToExport, visibleColumns, csvSettings, t);
        } catch (error) {
            console.error('csv export error:', error);
            alert('Fehler beim Exportieren der Daten. Bitte versuchen Sie es erneut.');
        }
    };

    return (
        <div className="flex h-full">
            <div className="flex flex-col flex-1 min-w-0">
                <FilterHeader
                    envFilter={envFilter}
                    setEnvFilter={setEnvFilter}
                    availableEnvironments={availableEnvironments}
                    triggerFilter={triggerFilter}
                    setTriggerFilter={setTriggerFilter}
                    availableTriggers={availableTriggers}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    availableStates={availableStates}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    hideFullyUnresolved={false}
                    setHideFullyUnresolved={() => {}}
                    loading={loading || isSyncing}
                    onOpenColumnConfig={() => setColumnConfigOpen(true)}
                    showColumnConfig={true}
                    showTriggerFilter={true}
                    showHideUnresolved={false}
                />

                <div className="flex-1 overflow-auto p-4">
                    {selectedFlows.length > 0 && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <BulkActionsDropdown
                                    selectedFlows={selectedFlows}
                                    onDeselectAll={() => setSelectedFlows([])}
                                    onOpenCSVExport={handleOpenCSVExport}
                                />
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-blue-900">
                                        {t('table.selected_flows', { count: selectedFlows.length, suffix: selectedFlows.length !== 1 ? 's' : '' })}
                                    </span>
                                    <span className="text-xs text-blue-700">
                                        {t('table.available_flows', { count: allAvailableFlowIds.length })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {(loading || isSyncing) && (
                        <div className="flex justify-center items-center py-12">
                            <Loader />
                        </div>
                    )}

                    {showNoResultsMessage && (
                        <div className="text-center py-12">
                            <div className="text-gray-500 text-lg mb-2">{t('table.no_results_title')}</div>
                            <div className="text-gray-400 text-sm">
                                {t('table.no_results_msg', { term: searchTerm })}
                            </div>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {t('table.reset_search')}
                            </button>
                        </div>
                    )}

                    {hasSearchResults && filteredFlows.length > 0 && (
                        <>
                            <div className="overflow-x-auto rounded-lg shadow ring-1 ring-gray-200">
                                <table className="min-w-full table-fixed border-collapse bg-white">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left w-12">
                                                <div className="flex flex-col items-center gap-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={globalSelectionState === 'all'}
                                                        ref={checkbox => {
                                                            if (checkbox) {
                                                                checkbox.indeterminate = globalSelectionState === 'partial';
                                                            }
                                                        }}
                                                        onChange={toggleGlobalSelection}
                                                        title={
                                                            globalSelectionState === 'all'
                                                                ? t('table.deselect_all_title', { count: allAvailableFlowIds.length })
                                                                : globalSelectionState === 'partial'
                                                                    ? t('table.select_all_partial_title', { count: allAvailableFlowIds.length, selected: selectedFlows.filter(id => allAvailableFlowIds.includes(id)).length })
                                                                    : t('table.select_all_title', { count: allAvailableFlowIds.length })
                                                        }
                                                    />
                                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                                        {t('table.select_all')}
                                                    </span>
                                                </div>
                                            </th>
                                            {visibleColumns.displayName && (
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-64">{t('table.col_name')}</th>
                                            )}
                                            {visibleColumns.trigger && (
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-64">{t('table.col_trigger')}</th>
                                            )}
                                            {visibleColumns.state && (
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-24">{t('table.col_status')}</th>
                                            )}
                                            {visibleColumns.createdTime && (
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-32">{t('table.col_created')}</th>
                                            )}
                                            {visibleColumns.lastModifiedTime && (
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-32">{t('table.col_modified')}</th>
                                            )}
                                            {visibleColumns.environment && (
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-32">{t('table.col_environment')}</th>
                                            )}
                                            {visibleColumns.actions && (
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-28">{t('table.col_actions')}</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentData.map((flow) => (
                                            <FlowTableRow
                                                key={flow.id}
                                                item={flow}
                                                selectedFlows={selectedFlows}
                                                toggleFlowSelection={toggleFlowSelection}
                                                visibleColumns={visibleColumns}
                                                onNameClick={(flow) => setSelectedFlowForPanel(flow)}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination
                                totalPages={totalPages}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                totalItems={filteredFlows.length}
                                itemsPerPage={itemsPerPage}
                            />
                        </>
                    )}

                    {hasSearchResults && filteredFlows.length > 0 && (
                        <div className="mt-4 text-sm text-gray-500 text-center">
                            {searchTerm && searchTerm.trim() && (
                                <span>
                                    {t('table.flows_found', { count: filteredFlows.length, suffix: filteredFlows.length !== 1 ? 's' : '', term: searchTerm })}
                                    {envFilter && t('table.flows_in_env', { env: envFilter })}
                                    {triggerFilter && t('table.flows_with_trigger', { trigger: triggerFilter })}
                                    {statusFilter && t('table.flows_with_status', { status: statusFilter })}
                                </span>
                            )}
                            {!searchTerm && (envFilter || triggerFilter || statusFilter) && (
                                <span>
                                    {t('table.flows_total', { count: filteredFlows.length, suffix: filteredFlows.length !== 1 ? 's' : '' })}
                                    {envFilter && t('table.flows_in_env', { env: envFilter })}
                                    {triggerFilter && t('table.flows_with_trigger', { trigger: triggerFilter })}
                                    {statusFilter && t('table.flows_with_status', { status: statusFilter })}
                                </span>
                            )}
                            {!searchTerm && !envFilter && !triggerFilter && !statusFilter && (
                                <span>
                                    {t('table.flows_total', { count: filteredFlows.length, suffix: filteredFlows.length !== 1 ? 's' : '' })}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {selectedFlowForPanel && (
                <FlowSidePanel
                    flow={selectedFlowForPanel}
                    onClose={() => setSelectedFlowForPanel(null)}
                />
            )}

            <ColumnConfigModal
                open={columnConfigOpen}
                onClose={() => setColumnConfigOpen(false)}
                columns={visibleColumns}
                onSaveColumns={handleSaveColumns}
            />

            <CSVExportModal
                open={csvExportModalOpen}
                onClose={() => setCSVExportModalOpen(false)}
                onExport={handleCSVExport}
                flowCount={selectedFlows.length > 0
                    ? filteredFlows.filter(flow => selectedFlows.includes(flow.id)).length
                    : filteredFlows.length
                }
            />
        </div>
    );
}
