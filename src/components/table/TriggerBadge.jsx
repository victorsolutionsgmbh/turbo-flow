import React from "react";

export default function TriggerBadge({ trigger }) {
    const hashString = (str) => {
        if (!str || typeof str !== 'string') return 0;
        let hash = 0;
        const normalized = String(str).toLowerCase().trim();
        for (let i = 0; i < normalized.length; i++) {
            const char = normalized.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    };

    const hslToHex = (h, s, l) => {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    };

    const getTriggerColors = (triggerType) => {
        if (!triggerType || typeof triggerType !== 'string') {
            return { from: '#6B7280', to: '#4B5563', text: 'text-white' };
        }

        const hash = hashString(triggerType);
        const baseHue = hash % 360;
        const saturation = 65 + (hash % 20);
        const lightnessFrom = 50 + (hash % 10);
        const lightnessTo = 40 + (hash % 10);
        const colorFrom = hslToHex(baseHue, saturation, lightnessFrom);
        const colorTo = hslToHex(baseHue, saturation, lightnessTo);

        return { from: colorFrom, to: colorTo, text: 'text-white' };
    };

    const displayName = trigger ? String(trigger) : 'Unknown';
    const colors = getTriggerColors(trigger);

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${colors.text}`}
            style={{ background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)` }}
            title={displayName}
        >
            {displayName}
        </span>
    );
}
