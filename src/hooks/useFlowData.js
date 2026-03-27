import { useEffect, useState } from "react";
import { flowsTable, setSyncTimestamp, getSyncTimestamp, syncFlowsWithDB, cleanUpDuplicates } from "../db";

const extractBearerToken = async (headers) => {
    if (!headers || !Array.isArray(headers) || headers.length === 0) {
        console.debug("headers are empty or not an array");
        return null;
    }

    const authHeader = headers.find(
        (h) => h && h.name && typeof h.name === 'string' && h.name.toLowerCase() === "authorization" &&
            h.value && typeof h.value === 'string' && h.value.startsWith("Bearer ")
    );
    return authHeader?.value || null;
};

const decodeToken = (token) => {
    if (!token || typeof token !== 'string' || !token.includes('.')) {
        console.debug("invalid or missing token");
        return null;
    }

    try {
        const payload = token.split('.')[1];
        if (!payload) {
            console.debug("token has no payload");
            return null;
        }
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch (e) {
        console.error("error decoding token:", e);
        return null;
    }
};

const guidToDotSuffix = (guid) => {
    if (!guid) return '';
    const hex = String(guid).replace(/-/g, "").toLowerCase();
    return hex.slice(0, -2) + "." + hex.slice(-2);
};

const fetchAllFlows = async (url, token, environment) => {
    let collectedFlows = [];

    try {
        const res = await fetch(url, {
            headers: { Authorization: token }
        });
        if (!res.ok) throw new Error(`fetch error: ${res.statusText}`);

        const data = await res.json();
        const flows = Array.isArray(data.value) ? data.value : [];

        const enriched = flows.map(flow => ({
            ...flow,
            environmentDisplayName: environment?.properties?.displayName || 'Unknown',
            connectionsUpdatedAt: new Date().toISOString()
        }));

        collectedFlows.push(...enriched);

        if (data.nextLink) {
            const nextFlows = await fetchAllFlows(data.nextLink, token, environment);
            if (Array.isArray(nextFlows)) {
                collectedFlows = collectedFlows.concat(nextFlows);
            }
        }

        return collectedFlows;
    } catch (err) {
        console.error("error loading flows:", err);
        return collectedFlows;
    }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const extractJwt = (token) => {
    if (!token || typeof token !== 'string') {
        console.error("invalid token for extractJwt");
        return null;
    }

    try {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("error extracting jwt:", e);
        return null;
    }
};

export const useFlowData = () => {
    const [flows, setFlows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState({
        hasToken: true,
        loadingEnvironments: false,
        loadingFlows: false,
        currentEnv: 0,
        totalEnvs: 0,
        envName: "",
        totalFlows: 0,
        currentFlows: 0,
        progress: 0,
        error: null
    });
    const [lastSync, setLastSync] = useState(getSyncTimestamp());

    useEffect(() => {
        const loadLocalFlows = async () => {
            try {
                const localFlows = await flowsTable.toArray();
                setFlows(Array.isArray(localFlows) ? localFlows : []);
                setLastSync(getSyncTimestamp());
            } catch (err) {
                console.error("error loading local flows:", err);
                setFlows([]);
            } finally {
                setLoading(false);
            }
        };

        loadLocalFlows();
    }, []);

    const performSync = async () => {
        try {
            setIsSyncing(true);
            setSyncStatus({
                hasToken: true,
                loadingEnvironments: false,
                loadingFlows: false,
                currentEnv: 0,
                totalEnvs: 0,
                envName: "",
                totalFlows: 0,
                currentFlows: 0,
                progress: 0,
                error: null
            });

            const result = await new Promise((resolve, reject) => {
                chrome.storage.session.get("requestLog", (result) => {
                    if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                    else resolve(result);
                });
            });

            const { requestLog } = result || {};

            if (!Array.isArray(requestLog)) {
                setSyncStatus(prev => ({ ...prev, hasToken: false }));
                return;
            }

            let token = null;
            for (const req of requestLog) {
                if (req && req.headers) {
                    token = await extractBearerToken(req.headers);
                    if (token) break;
                }
            }

            if (!token) {
                setSyncStatus(prev => ({ ...prev, hasToken: false }));
                return;
            }

            const decoded = decodeToken(token);
            if (!decoded || !decoded.tid) {
                setSyncStatus(prev => ({ ...prev, hasToken: false }));
                return;
            }

            const tidFormatted = guidToDotSuffix(decoded.tid);
            const jwtInfo = extractJwt(token);

            if (!jwtInfo || !jwtInfo.oid) {
                setSyncStatus(prev => ({ ...prev, error: "jwt info incomplete" }));
                return;
            }

            setSyncStatus(prev => ({ ...prev, loadingEnvironments: true, progress: 10 }));
            const envUrl = `https://${tidFormatted}.tenant.api.powerplatform.com/powerautomate/environments?api-version=1`;

            const envRes = await fetch(envUrl, { headers: { Authorization: token } });
            if (!envRes.ok) throw new Error(`error fetching environments: ${envRes.statusText}`);

            const envData = await envRes.json();
            const environments = Array.isArray(envData.value) ? envData.value : [];

            setSyncStatus(prev => ({ ...prev, totalEnvs: environments.length, progress: 20 }));

            let totalFlowsCollected = 0;

            for (let i = 0; i < environments.length; i++) {
                const env = environments[i];

                if (!env || !env.name || !env.properties) continue;

                const envProgress = 20 + ((i / environments.length) * 70);

                setSyncStatus(prev => ({
                    ...prev,
                    currentEnv: i + 1,
                    loadingFlows: true,
                    envName: env.properties.displayName,
                    progress: Math.round(envProgress)
                }));

                const envIdFormatted = guidToDotSuffix(env.name);
                const personalFlowsUrl = `https://${envIdFormatted}.environment.api.powerplatform.com/powerautomate/flows?api-version=1&$expand=properties.protectionStatus&$filter=search('personal')+and+excludedModernFlowTypes+in+(2)&$top=50&draftFlow=true`;
                const teamFlowsUrl = `https://${envIdFormatted}.environment.api.powerplatform.com/powerautomate/flows?api-version=1&$expand=properties.protectionStatus&$filter=search('team')+and+excludedModernFlowTypes+in+(2)&$top=50&draftFlow=true`;

                const personalFlows = await fetchAllFlows(personalFlowsUrl, token, env);
                const teamFlows = await fetchAllFlows(teamFlowsUrl, token, env);

                const allEnvFlows = [
                    ...(Array.isArray(personalFlows) ? personalFlows : []),
                    ...(Array.isArray(teamFlows) ? teamFlows : [])
                ];

                totalFlowsCollected += allEnvFlows.length;

                if (allEnvFlows.length > 0) {
                    await syncFlowsWithDB(allEnvFlows);
                }

                setSyncStatus(prev => ({ ...prev, totalFlows: totalFlowsCollected }));

                await delay(1000);
            }

            setSyncStatus(prev => ({ ...prev, progress: 95 }));
            await cleanUpDuplicates();
            await setSyncTimestamp();

            const synced = await flowsTable.toArray();
            setFlows(Array.isArray(synced) ? synced : []);
            setLastSync(getSyncTimestamp());

            setSyncStatus(prev => ({ ...prev, progress: 100 }));

        } catch (err) {
            console.error("sync error:", err);
            setSyncStatus(prev => ({ ...prev, error: err.message }));
        } finally {
            setIsSyncing(false);
        }
    };

    return {
        flows,
        loading,
        isSyncing,
        syncStatus,
        lastSync,
        triggerSync: performSync
    };
};
