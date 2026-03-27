export const exportFlowsToCSV = (flows, visibleColumns, settings, t) => {
    const { delimiter, linebreak, includeHeader, encoding, quoteChar } = settings;

    const escapeField = (field) => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        if (str.includes(delimiter) || str.includes(quoteChar) || str.includes('\n') || str.includes('\r')) {
            return quoteChar + str.replace(new RegExp(quoteChar, 'g'), quoteChar + quoteChar) + quoteChar;
        }
        return str;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getTriggerName = (flow) => {
        if (!flow.definitionTriggers || !flow.definitionTriggers[0]) return '';
        const trigger = flow.definitionTriggers[0];
        return trigger.api ? trigger.api.properties.displayName : trigger.type;
    };

    const columnHeaders = {
        displayName: t('table.col_name'),
        trigger: t('table.col_trigger'),
        state: t('table.col_status'),
        createdTime: t('table.col_created'),
        lastModifiedTime: t('table.col_modified'),
        environment: t('table.col_environment'),
        actions: 'Flow-Link'
    };

    const headers = Object.entries(visibleColumns)
        .filter(([key, visible]) => visible && key !== 'actions')
        .map(([key]) => columnHeaders[key]);

    if (visibleColumns.actions) {
        headers.push(columnHeaders.actions);
    }

    const rows = flows.map(flow => {
        const row = [];

        if (visibleColumns.displayName) row.push(escapeField(flow.displayName || flow.name || ''));
        if (visibleColumns.trigger) row.push(escapeField(getTriggerName(flow)));
        if (visibleColumns.state) row.push(escapeField(flow.state || ''));
        if (visibleColumns.createdTime) row.push(escapeField(formatDate(flow.createdTime)));
        if (visibleColumns.lastModifiedTime) row.push(escapeField(formatDate(flow.lastModifiedTime)));
        if (visibleColumns.environment) row.push(escapeField(flow.environmentDisplayName || ''));
        if (visibleColumns.actions && flow.environmentName && flow.id) {
            const flowUrl = `https://make.powerautomate.com/environments/${flow.environmentName}/flows/${flow.id}/details`;
            row.push(escapeField(flowUrl));
        }

        return row.join(delimiter);
    });

    let csvContent = '';
    if (includeHeader) {
        csvContent += headers.map(h => escapeField(h)).join(delimiter) + linebreak;
    }
    csvContent += rows.join(linebreak);

    const BOM = '\uFEFF';
    const finalContent = encoding === 'utf-8-bom' ? BOM + csvContent : csvContent;

    const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `flows_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
