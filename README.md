# UPGOV: Next-Gen Civic Grievance Resolution Platform

UPGOV is a comprehensive, AI-driven Smart City platform designed to transform how citizens and municipalities interact. By replacing outdated, bureaucratic complaint portals with an intelligent, autonomous system, UPGOV reduces resolution times, eliminates duplicates, and proactively manages urban infrastructure.

## 🌟 Key Features

### 1. Autonomous AI Pipeline
UPGOV features three distinct AI agents working in a chained pipeline:
- **Intake & Classification Agent (Gemini 2.0 Flash):** Processes citizen complaints, extracts structured JSON, infers the correct department (PWD, Jal Board, Sanitation), assesses severity, and performs semantic duplicate detection to prevent redundant tickets.
- **Predictive Risk Agent (Open-Meteo + Gemini):** Correlates live meteorological data (e.g., 3-day precipitation forecasts) with active ticket density in specific sectors to predict infrastructure failures (e.g., waterlogging) before they happen.
- **SLA Escalation Monitor:** Continuously scans the database in the background, calculating SLA deadlines based on issue categories, and pre-emptively escalates tickets that are at risk of breaching compliance.

### 2. Multi-Role Dashboards (Supabase Auth & RLS)
- **Citizen Portal:** A consumer-grade interface for filing complaints via text, voice dictation, or AR scanning. Features live ticket tracking, an interactive heatmap, and a Carbon Impact Tracker showing the ecological benefit of resolved issues.
- **Officer Dashboard:** A streamlined queue for field officers to view assignments, update statuses, and track SLA compliance for their specific jurisdiction.
- **Admin Command Center:** A high-level control room for city administrators featuring real-time analytics, predictive risk alerts, departmental performance metrics, and a live activity feed.

### 3. Advanced Integrations
- **AR & 3D Scanning:** Citizens can scan potholes or infrastructure damage using augmented reality, appending rich spatial data to their complaints.
- **Multi-Language Support (i18n):** Native support for English and Hindi, dynamically adapting the entire interface and AI interactions for local accessibility.

## 🏗️ Architecture

```mermaid
graph TD
    %% Actors
    Citizen([Citizen])
    Officer([Field Officer])
    Admin([City Admin])
    
    %% UI Layer
    subgraph Frontend (React + Vite + TailwindCSS)
        CP[Citizen Portal]
        OD[Officer Dashboard]
        AD[Admin Command Center]
    end
    
    %% Backend Layer
    subgraph Backend (Supabase)
        DB[(PostgreSQL DB)]
        Auth[Supabase Auth]
        RLS{Row Level Security}
    end
    
    %% AI Agents Layer
    subgraph AI Pipeline (Gemini 2.0)
        A1[Intake & Classification Agent]
        A2[Predictive Risk Agent]
        A3[SLA Escalation Monitor]
    end
    
    %% Flow Connections
    Citizen -->|Files Complaint| CP
    CP -->|Uploads Media & Data| DB
    CP -->|Triggers| A1
    A1 -->|Checks Duplicates & Classifies| DB
    A1 -->|Triggers| A2
    A2 -->|Fetches Open-Meteo Weather| A2
    A2 -->|Flags Sector Risk| DB
    A2 -->|Triggers| A3
    A3 -->|Escalates near-breach tickets| DB
    
    Officer -->|Logs in| OD
    OD -->|Filtered by Sector| RLS
    RLS <--> DB
    
    Admin -->|Views Aggregates| AD
    AD <--> DB
```

## 🚀 Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS 4.0, Framer Motion, Recharts, React-Leaflet
- **Backend & Database:** Supabase (PostgreSQL, Auth, Row Level Security)
- **AI / LLMs:** Google Gemini 2.0 Flash (Function Calling, Structured Output)
- **Deployment:** Vercel (Frontend & Serverless API Proxy), GitHub Actions

## ⚙️ Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/coder-jane06/UPGOV.git
   cd UPGOV
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   # Do NOT put GEMINI_API_KEY in .env if deploying to frontend.
   # It is stored securely in Vercel's Environment Variables for the Serverless Proxy.
   ```

4. **Database Setup:**
   Run the `supabase-schema.sql` script in your Supabase SQL Editor to create the `tickets` table and RLS policies.

5. **Run locally:**
   ```bash
   npm run dev
   ```

## ⚠️ Known Limitations & Roadmap
- **Citizen Authentication:** Currently operates in a frictionless "demo mode" allowing any user to file a complaint without signing in. Strict Supabase Auth gating is planned for v2.
- **Predictive Scope:** The predictive weather agent currently uses hardcoded coordinates for Greater Noida. Future versions will dynamically fetch coordinates based on the user's selected sector.
- **SLA Defaults:** SLA windows are based on generalized civic best practices. Real deployments will integrate directly with state-mandated CPGRAMS SLA regulations.