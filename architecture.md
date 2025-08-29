# Nexus Platform — Architecture & Implementation Guide  

> **Scope:** This document explains how the Nexus React app (Vite + Tailwind) is structured and summarizes the implementation across **Week-1 to Week-3 milestones**. Keep this file at the project root as `ARCHITECTURE.md`.

---

## 1) Tech Stack & Project Info
- **Runtime/Build:** Node 18+/20+, Vite  
- **Framework:** React (Hooks)  
- **Styling:** Tailwind CSS (custom theme)  
- **Routing:** React Router  
- **Deployment:** Vercel  

### NPM scripts
```bash
npm install       # install deps
npm run dev       # start Vite dev server
npm run build     # production build (to /dist)
npm run preview   # preview the production build locally


project-root/
├─ index.html
├─ package.json
├─ tailwind.config.js
├─ postcss.config.js
├─ vite.config.js
├─ ARCHITECTURE.md   ← this file
└─ src/
   ├─ main.tsx / main.jsx
   ├─ App.tsx / App.jsx
   ├─ assets/                # logos, icons, images
   ├─ styles/                # global.css, tailwind.css
   ├─ components/
   │  ├─ ui/                 # Button, Input, Card, Modal, Badge
   │  ├─ layout/             # Navbar, Sidebar, Footer
   │  ├─ calendar/           # Scheduling Calendar (Week-1)
   │  ├─ video/              # Video calling UI (Week-2)
   │  ├─ documents/          # Document chamber (Week-2)
   │  ├─ payments/           # Payment UI (Week-3)
   │  └─ security/           # Password meter, OTP form (Week-3)
   ├─ pages/                 # Login, Register, Dashboard, Profile
   ├─ context/               # AuthContext, UIContext
   ├─ hooks/                 # useAuth, useFetch, etc.
   ├─ services/              # API stubs (meetings, payments)
   └─ types/                 # Shared TS types

| Route                     | Page Component         | Purpose                                |
| ------------------------- | ---------------------- | -------------------------------------- |
| `/login`                  | `pages/LoginPage`      | User auth + OTP step (2FA mock)        |
| `/register`               | `pages/RegisterPage`   | Signup with role selection + pwd meter |
| `/forgot-password`        | `pages/ForgotPassword` | Password reset flow                    |
| `/dashboard`              | `pages/Dashboard`      | Main dashboard (role-based)            |
| `/dashboard/entrepreneur` | Entrepreneur view      | Scheduling + wallet + docs             |
| `/dashboard/investor`     | Investor view          | Deals, funding + payments              |
| `/profile`                | `pages/Profile`        | User profile & settings                |
4) Theming & Design System

Primary Palette: bg-primary-500, text-primary-700, border-primary-600

Secondary/Accent: for highlights (funding, requests)

State colors: success, warning, error (for payments & docs status)

Typography: Inter var, font-sans

Components: consistent Button, Input, Card, Modal built with Tailwind tokens

5) State Management

Local state: form inputs, UI toggles

Context:

AuthContext → login, register, reset password, role (investor/entrepreneur)

UIContext (future) → theme, toasts

Mock data: Local arrays for meetings, transactions, docs in Week-1 → Week-3

Future: Replace with API layer in services/

6) Completed Milestones
✅ Week 1 – Scheduling & Setup

Milestone 1: Repo setup, Tailwind theme, documented architecture

Milestone 2: Calendar integration (FullCalendar)

Add/modify availability slots

Placeholder meeting requests (accept/decline later)

Confirmed meetings displayed on dashboard

✅ Week 2 – Video Calling & Document Chamber

Milestone 3: Video calling UI (mock)

Start/End call buttons

Video/audio toggle

Screen share (optional mock)

Milestone 4: Document chamber

Upload + preview PDFs

E-signature mock (signature pad)

Status labels (Draft, In Review, Signed)

✅ Week 3 – Payments & Security

Milestone 5: Payment section

Wallet balance display

Deposit/Withdraw/Transfer (simulation)

Transaction history table

Mock funding flow (Investor → Entrepreneur)

Milestone 6: Security & access control

Password strength meter (Register + Reset Password)

Multi-step login with OTP form (mock, 6-digit input)

Role-based dashboards (Investor vs Entrepreneur)