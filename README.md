# ONM Energy — VP Office Project Tracking & Meeting Memo Dashboard

A full-stack web application designed for executive project portfolio tracking, meeting memo logging, issue & risk management, and KPI monitoring across 5 operating divisions.

---

## 🌟 Key Features

1. **Portfolio Overview (Landing Page)**
   - High-level executive KPI rollups (Total Projects, On Track, At Risk, Critical, Open Issues, Overdue Actions)
   - Interactive RAG Status Donut Chart (Recharts)
   - **🚨 VP Attention Required** dedicated panel listing all flagged items
   - Division summary cards with worst-RAG rollups and progress indicators
   - Projector-friendly **Presentation Mode** toggle for VP meetings

2. **Division View**
   - Deep-dive into each of the 5 divisions: **OPV**, **ESS**, **WPD**, **GSS**, **HFO**
   - Aggregated division stats, projects health, and division-wide open issues

3. **Project Detail Record**
   - Complete record for each project with RAG health, overall completion %, phase, location, capacity (MW)
   - Interactive KPI trend charts with target vs. actual lines
   - Meeting Memo log with expandable entries, key decisions, and action items
   - Issues & risks table with severity badges and direct "Resolve" action
   - Action Item status tracking with live dropdown status updates

4. **Cross-Project Meeting Memos Feed**
   - Filterable feed by division, date range, or search keywords
   - One-click Excel/CSV export of meeting memos and decisions

5. **Admin & Data Entry Forms**
   - Form tabs for creating projects, recording meeting memos, logging issues, adding action items, and logging KPI readings

6. **Batch Import & Webhook Ingestion**
   - CSV spreadsheet batch project import with downloadable template
   - RESTful API Webhook endpoint (`POST /api/webhook/feed`) to receive automated updates from Slack/Discord or external daily reporting systems

---

## 🏗️ Tech Stack

- **Framework**: Next.js 14 / Next.js 16 (App Router)
- **Database**: SQLite (via `@prisma/adapter-better-sqlite3` & `better-sqlite3`)
- **ORM**: Prisma 7
- **Data Visualization**: Recharts
- **Styling**: Modern Vanilla CSS + custom design tokens (Clean light energy palette, projector-ready typography & animations)
- **Export Utility**: `xlsx` (Excel), `papaparse` (CSV)

---

## 🚀 Quick Start Guide

### 1. Installation

```bash
cd onm-dashboard
npm install
```

### 2. Database Migration & Seed Data

The database comes pre-configured with SQLite. Run the seed script to populate all 5 divisions and 22 projects:

```bash
# Apply database migrations
npx prisma migrate dev

# Seed database (5 divisions, 22 projects, meeting memos, KPIs, action items)
npx tsx prisma/seed.ts
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Pre-seeded User Accounts

| Role | Email | Password | Scope |
|---|---|---|---|
| **VP / Leadership (Viewer)** | `vp@onm-energy.com` | `viewer123` | Read-only executive dashboard view |
| **System Admin / Editor** | `admin@onm-energy.com` | `admin123` | Full CRUD access to projects & memos |

---

## 📡 Webhook Feed Ingestion API

You can push automated memo or issue updates into the dashboard from external tools using:

**Endpoint**: `POST /api/webhook/feed`  
**Headers**: `Content-Type: application/json`

### Example Payload:

```json
{
  "source": "slack_bot",
  "projectCode": "OPV-005",
  "type": "issue",
  "data": {
    "title": "Inverter trip due to high temperature",
    "description": "Inverter #4 tripped during peak afternoon sun. Inspection underway.",
    "severity": "High",
    "owner": "Chaiyaphum Site PM"
  }
}
```

---

## 📂 Project Structure

```
onm-dashboard/
├── app/
│   ├── page.tsx                    # Portfolio Overview (Landing page)
│   ├── layout.tsx                  # App Shell & Navigation Layout
│   ├── globals.css                 # CSS Design System Tokens & Components
│   ├── divisions/                  # Division list & detail pages
│   ├── projects/                   # Project list & detail pages
│   ├── memos/                      # Cross-project Memo Feed page
│   ├── admin/                      # Data Entry forms page
│   ├── import/                     # CSV Import & Webhook Docs page
│   └── api/                        # RESTful API Endpoints (CRUD + Rollups)
├── components/
│   └── Nav.tsx                     # Sidebar Navigation & Presentation Toggle
├── lib/
│   ├── db.ts                       # Prisma Client Singleton
│   └── rag.ts                      # RAG Rollup Logic & Color Helpers
├── prisma/
│   ├── schema.prisma               # Database Schema (8 Tables)
│   └── seed.ts                     # Portfolio Seed Dataset (22 Projects)
└── dev.db                          # SQLite Database File
```

---

## 📊 Portfolio Summary (Seed Data)

- **OPV (Solar PV Division)**: 12 Projects (OPV-001 to OPV-012)
- **ESS (Energy Storage Division)**: 3 Projects (ESS-001 to ESS-003)
- **WPD (Wind Power Division)**: 1 Project (WPD-001)
- **GSS (Grid & Substation Division)**: 1 Project (GSS-001)
- **HFO (HFO & LNG Division)**: 5 Projects (HFO-001 to HFO-005)
