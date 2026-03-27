let requestLog = [];
let isMonitoring = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startMonitoring') {
    startMonitoring(message.tabId);
    sendResponse({ success: true });
  }
  return true;
});

function startMonitoring(tabId) {
  if (isMonitoring) {
    return;
  }
  
  requestLog = [];
  isMonitoring = true;

  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      const body = details.requestBody?.raw?.[0]?.bytes
        ? new TextDecoder("utf-8").decode(details.requestBody.raw[0].bytes)
        : "";

      requestLog.push({
        requestId: details.requestId,
        url: details.url,
        method: details.method,
        body: body,
        headers: {},
        statusCode: null,
      });
      chrome.storage.session.set({ requestLog });
    },
    { urls: ["https://make.powerautomate.com/*", "https://api.flow.microsoft.com/*"] },
    ["requestBody"]
  );

  chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
      const entry = requestLog.find((req) => req.requestId === details.requestId);
      if (entry) {
        entry.headers = details.requestHeaders;
      }
      chrome.storage.session.set({ requestLog });
    },
    { urls: ["https://make.powerautomate.com/*", "https://api.flow.microsoft.com/*"] },
    ["requestHeaders", "extraHeaders"]
  );

  chrome.tabs.reload(tabId);
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
}