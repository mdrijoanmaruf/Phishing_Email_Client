# 🛡️ PhishGuard — Phishing Email Detector (Client)

A modern, high-performance web dashboard for cybersecurity analysts and researchers to explore, analyze, and manage a 71,000+ record phishing email corpus, monitor threat domains, inspect data distributions, and maintain audit records.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**, seamlessly integrated with a modular **Python Flask REST API**.

---

## 🚀 Key Modules & Capabilities

### 1. 📊 Executive Dashboard (`/dashboard`)
* **Key Metric Cards**: Instant visibility over total corpus size, phishing vs. safe proportions, total audited operations, and active blocked domains.
* **Corpus Composition & Security Posture**: Visual distribution bars indicating safe vs. phishing email shares and real-time defense status.
* **Operational Shortcuts**: One-click shortcuts to dataset management, analytics, domain blacklists, and audit history.
* **Live Audit Activity Feed**: Quick stream of the 5 most recent operations with entity badges, actor tags, and timestamps.

### 2. 🗄️ Dataset Explorer & Management (`/dataset`)
* **High-Volume Pagination**: Clean multi-page navigation featuring direct numeric page buttons, first/last quick jumps, and configurable items-per-page (10, 20, 50, 100).
* **Multi-Field Search & Filtering**: Instant search across sender addresses, recipient mailboxes, subject lines, and email body contents, with label filters (`All`, `Phishing`, `Safe`).
* **Interactive Email Inspector**: Modal preview providing full email metadata, extracted URL lists, and complete body rendering.
* **Full CRUD Operations**:
  * **Add Email**: Create new email records with validation.
  * **Edit Email**: Update subject, sender, recipient, body, and classification label.
  * **Delete Email**: Remove records with interactive SweetAlert2 confirmation dialogs.
* **One-Click Domain Blacklisting**: Add suspicious sender domains directly to the active blacklist from either the dataset table or the email detail modal.

### 3. 📈 Analytics & Statistical Metrics (`/analytics`)
* **Analyzed Dataset Schema**: Comprehensive reference breakdown of all 8 evaluated dataset attributes (`label`, `sender`, `subject`, `body`, `domain`, `urls`, `receiver`, `date`).
* **Statistical Risk Score Metrics**:
  * Metrics: **Mean Score**, **Std Deviation**, **Median (50th Percentile)**, **25th Percentile (Lower Quartile)**, **75th Percentile (Upper Quartile)**, and **Score Range**.
  * **Transparent Column Attribution**: Explicitly indicates which dataset columns metrics are derived from (`label`, `subject`, `body`) without technical code jargon.
* **Risk Score Distribution Histogram**: 10-point interval bar chart categorizing records into Safe (0–39), Suspicious (40–69), and Phishing (70–100).
* **Top Phishing Keywords**: Relative frequency bars highlighting the most prevalent threat terms and call-to-action triggers in phishing bodies (`label = 1`).
* **Phishing Sender Domain Breakdown**: Ranked distribution table of sender domains most frequently associated with phishing campaigns.

### 4. 🚫 Threat Domain Blacklist (`/blacklist`)
* **Active Domain Registry**: View all blocked malicious hostnames stored in `blacklist.json`.
* **Domain Search**: Live domain filtering and real-time search.
* **Domain Management**: Add new domains with format validation, or remove domains with confirmation prompts.
* **Audit Integration**: All blacklist operations automatically record `BLACKLIST_ADD` and `BLACKLIST_REMOVE` audit log entries.

### 5. 📜 Activity & Audit History (`/history`)
* **Persistent Audit Trail**: Records all user actions (`ADD`, `EDIT`, `DELETE`, `VIEW`, `BLACKLIST_ADD`, `BLACKLIST_REMOVE`) to `data/history.json`.
* **Action Filtering**: Filter audit records by specific action types or entity categories (`EMAIL`, `BLACKLIST`, `DATASET`).
* **Detailed Audit Cards**: Timestamp, actor identity, entity ID, summary, and contextual modification details.
* **Clear History Action**: Safeguarded bulk wipe option with confirmation dialogs.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16 (Turbopack)** | React framework with App Router, server-side optimizations, and client navigation |
| **React 19** | Modern UI component rendering and reactive state hooks |
| **TypeScript 5** | Strict type-safety, interface modeling, and compile-time verification |
| **Tailwind CSS v4** | Modern utility-first design system with PostCSS engine |
| **Lucide React** | Clean, accessible cybersecurity and UI iconography |
| **SweetAlert2** | Interactive feedback modals, toast alerts, and confirmation dialogs |
| **Flask REST Server** | Python 3 backend API handling CSV processing, JSON storage, and analytics |

---

## 📂 Project Directory Structure

```
phishing_email_ditector_client/
├── app/
│   ├── analytics/              # Deep statistical analysis and schema definition
│   │   └── page.tsx
│   ├── blacklist/              # Threat domain blacklist management
│   │   └── page.tsx
│   ├── dashboard/              # Executive KPI dashboard and security status
│   │   └── page.tsx
│   ├── dataset/                # 71,000+ record dataset table, CRUD, and pagination
│   │   └── page.tsx
│   ├── history/                # Activity and audit history log explorer
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css             # Tailwind CSS v4 directives and theme variables
│   ├── layout.tsx              # Root HTML and metadata layout
│   └── page.tsx                # Redirect to /dashboard
├── components/
│   └── layout/
│       ├── DashboardLayout.tsx # Main dashboard layout wrapper
│       ├── Sidebar.tsx         # Sidebar navigation with active route highlights
│       └── Topbar.tsx          # Administrator header badge and breadcrumbs
├── lib/
│   ├── alerts.ts               # Reusable SweetAlert2 confirmation and notification helpers
│   └── api.ts                  # Typed Fetch API client connecting to Flask backend
├── public/                     # Static assets, icons, and SVG illustrations
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript configuration
└── next.config.ts              # Next.js configuration
```

---

## ⚙️ Getting Started

### Prerequisites
* **Node.js**: v18.18.0 or newer (v20+ recommended)
* **npm**: v9+ (or `pnpm` / `yarn`)
* **Python**: 3.9+ (for running the companion Flask backend)

---

### Step 1: Start the Backend Server

The client communicates with the Flask REST API. Start the backend first:

```bash
# Navigate to the backend directory
cd ../Phishing_Email_Detector_Server

# Install Python dependencies
pip install -r requirements.txt

# Run the Flask server (runs on http://127.0.0.1:5000 by default)
python app.py
```

---

### Step 2: Install Client Dependencies

In the `phishing_email_ditector_client` directory, install all required packages:

```bash
cd phishing_email_ditector_client
npm install
```

---

### Step 3: Configure Environment (Optional)

By default, the client points to `http://localhost:5000`. If your backend runs on a different port or host, create a `.env.local` file in the root of the client folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

### Step 4: Run the Development Server

```bash
npm run dev
```

Open your browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

---

### Step 5: Production Build

To verify type safety and produce an optimized production bundle:

```bash
npm run build
npm run start
```

---

## 🌐 API Endpoints Used

| Endpoint | Method | Description |
|---|---|---|
| `/api/dataset` | `GET` | Fetches paginated email records with search, filter, and pagination params |
| `/api/dataset` | `POST` | Adds a new email record to `data.csv` |
| `/api/dataset/<id>` | `PUT` | Updates an existing email record |
| `/api/dataset/<id>` | `DELETE` | Deletes an email record from the dataset |
| `/api/blacklist` | `GET` | Retrieves all blocked domains from `blacklist.json` |
| `/api/blacklist` | `POST` | Adds a new domain to the blacklist |
| `/api/blacklist/<domain>` | `DELETE` | Removes a domain from the blacklist |
| `/api/history` | `GET` | Retrieves audit log entries from `history.json` |
| `/api/history` | `POST` | Creates a new audit log entry |
| `/api/history/clear` | `POST` | Clears all activity history records |
| `/api/analytics/summary` | `GET` | High-level dataset counts and scan totals |
| `/api/analytics/scores` | `GET` | Statistical distribution metrics (mean, std dev, median, percentiles, histogram) |
| `/api/analytics/top-keywords` | `GET` | Top suspicious phishing keywords and frequencies |
| `/api/analytics/domain-breakdown` | `GET` | High-risk sender domain frequency analysis |

---

## 🎨 UI & Design Principles

* **Cybersecurity Palette**: Sophisticated indigo, slate, and subtle crimson/emerald accents designed for threat analysis.
* **Responsive Layout**: Fluid experience across mobile, tablet, and wide desktop screens.
* **Non-Blocking User Experience**: Instant optimistic UI updates paired with informative feedback via SweetAlert2.
* **Transparent Data Attribution**: Every statistical visualization clearly references its underlying data column.

---

## 📄 License & Attribution

Developed as an advanced cybersecurity platform for Phishing Email Detection, Threat Intelligence, and Dataset Analysis.
All dataset and audit files are maintained within the `Phishing_Email_Detector_Server/data/` directory.
