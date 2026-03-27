import Dexie from "dexie";

const DB_NAME = "turboflow-db-v3";

export const db = new Dexie(DB_NAME);

db.version(2).stores({
  flows: "id, displayName, environmentId, environmentName, uris",
});

export const flowsTable = db.table("flows");

export const cleanUpDuplicates = async () => {
  const allFlows = await flowsTable.toArray();

  const groupedById = allFlows.reduce((acc, flow) => {
    if (!acc[flow.id]) acc[flow.id] = [];
    acc[flow.id].push(flow);
    return acc;
  }, {});

  for (const [flowId, flows] of Object.entries(groupedById)) {
    if (flows.length > 1) {
      const sorted = flows.sort((a, b) => new Date(b.insertedOn) - new Date(a.insertedOn));
      const toDelete = sorted.slice(1);
      for (const dup of toDelete) {
        await flowsTable.delete(dup.id);
      }
    }
  }
};

export const syncFlowsWithDB = async (newFlows) => {
  for (const flow of newFlows) {
    const flowId = flow.name;
    const existingFlow = await flowsTable.get(flowId);

    const newRecord = {
      id: flowId,
      state: flow.properties.state || "",
      displayName: flow.properties.displayName,
      createdTime: flow.properties.createdTime,
      lastModifiedTime: flow.properties.lastModifiedTime || undefined,
      environmentId: flow.properties.environment.id,
      environmentName: flow.properties.environment.name,
      environmentDisplayName: flow.environmentDisplayName || "",
      isManaged: flow.properties.isManaged,
      flowFailureAlertSubscribed: flow.properties.flowFailureAlertSubscribed,
      creatorUserId: (flow.properties.creator != undefined ?? flow.properties.creator.userId) || "",
      definitionTriggers: flow.properties.definitionSummary.triggers,
      definitionActions: flow.properties.definitionSummary.actions,
      insertedOn: new Date().toISOString(),
      connections: existingFlow?.connections || [],
      connectionsUpdatedAt: existingFlow?.connectionsUpdatedAt || null,
      uris: existingFlow?.uris || [],
      urisUpdatedAt: existingFlow?.urisUpdatedAt || null
    };

    const hasChanges = !existingFlow || JSON.stringify(existingFlow) !== JSON.stringify(newRecord);
    if (hasChanges) {
      await flowsTable.put(newRecord);
    }
  }
};

export const setSyncTimestamp = async () => {
  const timestamp = new Date().toISOString();
  localStorage.setItem("turboflow_last_sync", timestamp);
  return timestamp;
};

export const getSyncTimestamp = () => {
  return localStorage.getItem("turboflow_last_sync");
};

export const clearCache = async () => {
  await db.delete();
  localStorage.removeItem("turboflow_last_sync");
};

export const resetExtension = async () => {
  await db.delete();
  localStorage.clear();
};
