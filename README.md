# Turbo Flow

**Turbo Flow** is a Chrome extension that significantly simplifies and speeds up searching and managing Power Automate flows.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Privacy & Security](#privacy--security)
- [Technical Details](#technical-details)
- [Development](#development)

---

## Overview

Power Automate has no built-in way to quickly search across all your flows from all environments at once. Turbo Flow solves this: the extension fetches all flows from all available environments once and caches them locally in the browser — enabling instant, precise search without any loading delays and without sending data to external servers.

The extension is fully available in **German** and **English**.

---

## Features

### Local Flow Caching
- On first launch, all flows are fetched from every Power Platform environment and stored locally in the browser (IndexedDB).
- Subsequent searches run instantly against the local cache — no repeated API calls needed.
- The cache can be manually refreshed at any time.

### Search & Filtering
- **Full-text search** across flow name, environment, and trigger type (fuzzy search via Fuse.js)
- **Environment filter** — show only flows from a specific Power Platform environment
- **Trigger type filter** — e.g. only flows with an HTTP request trigger
- **Status filter** — Started, Stopped, Suspended
- Active filters are displayed as badges and can be reset individually or all at once
- Filters are persisted in localStorage and restored on next launch

### Direct Navigation
- Clicking a flow opens the Power Automate detail page directly in a new tab
- No more manual searching through the Power Automate UI

### CSV Export
- Select any flows via checkbox and export them as CSV
- Configurable export options:
  - Delimiter: comma, semicolon, tab, pipe
  - Line endings: LF, CRLF, CR
  - Encoding: UTF-8 with BOM (Excel-compatible) or UTF-8 standard
  - Quote character: double or single quotes
  - Optional header row
- Suitable for compliance documentation and audits

### Column Configuration
- Table columns can be individually shown or hidden
- Configuration is saved locally

### Multilingual Support
- The interface is fully available in **German** and **English**
- Language can be switched directly within the extension

---

## Prerequisites

- Google Chrome (or any Chromium-based browser)
- Active access to [make.powerautomate.com](https://make.powerautomate.com) with a valid Microsoft account
- No additional infrastructure, no app registration in Entra ID required

---

## Installation

### Option A: Chrome Web Store

> *(Link coming after publication)*

### Option B: Manual Installation (Developer Mode)

1. Clone the repository or download the latest release as a ZIP
2. Build the extension:
   ```bash
   cd turbo-flow
   npm install
   npm run build
   ```
3. Open `chrome://extensions` in Chrome
4. Enable **Developer mode** in the top right corner
5. Click **"Load unpacked"** and select the `dist/` folder

---

## Usage

1. Open [make.powerautomate.com](https://make.powerautomate.com) in your browser and log in
2. Click the Turbo Flow icon in the Chrome toolbar
3. Click **"Launch extension"** in the popup
4. On first launch, a short onboarding is shown — afterwards the sync starts automatically
5. The sync fetches all flows from all available environments — depending on the number of flows, this may take a few seconds to a few minutes
6. Once complete, the search interface is ready to use

### Refreshing Flows
Use the **Refresh** button in the header to trigger a new sync that re-fetches all flows.

### Using Search
The search field in the filter bar searches all cached flows in real time. Combine search and filters for precise results.

### Exporting to CSV
1. Select the desired flows via checkbox (or use the header checkbox to select all)
2. Click **"Export CSV"** in the action bar
3. Configure the export options and start the download

---

## Privacy & Security

- **No external servers**: All data stays exclusively in local browser storage (IndexedDB). No data is transmitted to third-party servers.
- **No Entra secret required**: The extension uses the existing session token of the logged-in user — no app registration, no secrets, no additional Azure/Entra configuration needed.
- **Minimal permissions**: Host permissions are strictly limited to `make.powerautomate.com` and `api.flow.microsoft.com`.
- **Local token handling**: The Bearer token is only extracted locally from intercepted requests and is used exclusively for calls to the Power Platform API.
- **No tracking, no telemetry**: The extension contains no analytics or data collection of any kind.

---

## Technical Details

### Architecture

The extension consists of three parts:

| Component | File | Purpose |
|---|---|---|
| Popup | `popup.html` / `Popup.jsx` | Entry point, validates the active page |
| Background Service Worker | `background.js` | Intercepts HTTP requests, extracts auth token |
| Main UI | `index.html` / `App.jsx` | Search interface, table, filters, CSV export |

### Database Schema

Flows are stored in a local **IndexedDB** database (`turboflow-db-v3`):

| Field | Description |
|---|---|
| `id` | Unique flow ID |
| `displayName` | Flow name |
| `state` | Status (Started, Stopped, Suspended) |
| `createdTime` | Creation timestamp |
| `lastModifiedTime` | Last modified timestamp |
| `environmentId` | Environment ID |
| `environmentName` | Internal environment name |
| `environmentDisplayName` | Display name of the environment |
| `definitionTriggers` | Trigger types of the flow |
| `definitionActions` | Actions used in the flow |
| `uris` | Links to the Power Automate detail page |

### APIs Used

- `https://{tenantId}.tenant.api.powerplatform.com/powerautomate/environments` — Fetch all environments
- `https://{environmentId}.environment.api.powerplatform.com/powerautomate/flows` — Fetch all flows per environment

### Tech Stack

| Area | Technology |
|---|---|
| UI Framework | React 18 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Local Database | Dexie (IndexedDB) |
| Fuzzy Search | Fuse.js |
| Build Tool | Vite + @crxjs/vite-plugin |

---

## Development

```bash
# Install dependencies
npm install

# Development build with watch mode
npm run dev

# Production build
npm run build
```

After the build, load the `dist/` folder in Chrome as an unpacked extension (see [Installation](#installation)).

---

*Developed by Victorsolutions GmbH*
