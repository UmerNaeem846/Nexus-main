# Nexus Platform — Architecture & Week‑1 Implementation Guide

> **Scope:** This document explains how the Nexus React app (Vite + Tailwind) is structured and how the Week‑1 “Scheduling Calendar” feature is integrated. Keep this file at the project root as `ARCHITECTURE.md`.

---

## 1) Tech Stack & Project Info
- **Runtime/Build:** Node 18+/20+, Vite
- **Framework:** React (Hooks)
- **Styling:** Tailwind CSS (custom theme)
- **Routing:** React Router (if present) / Vite SPA routing
- **Deployment:** Vercel

### NPM scripts (typical)
```bash
npm install       # install deps
npm run dev       # start Vite dev server (usually http://localhost:5173)
npm run build     # production build (to /dist)
npm run preview   # preview the production build locally
```

---

## 2) Directory Structure (High‑level)
```
project-root/
├─ index.html
├─ package.json
├─ tailwind.config.js
├─ postcss.config.js
├─ vite.config.js
├─ ARCHITECTURE.md   ← (this file)
└─ src/
   ├─ main.jsx               # React entrypoint (creates root)
   ├─ App.jsx                # App shell: routes/layout
   ├─ assets/                # images, logos, icons
   ├─ styles/                # global.css, tailwind.css, util classes
   ├─ components/            # reusable UI components
   │  ├─ ui/                 # low-level atoms (Button, Input, Modal, Card)
   │  ├─ layout/             # Navbar, Sidebar, Footer
   │  ├─ calendar/           # Calendar feature components (Week‑1)
   │  └─ ...
   ├─ pages/                 # route-level views (Login, Dashboard, Profile)
   ├─ hooks/                 # custom hooks (useAuth, useFetch, etc.)
   ├─ context/               # React Context providers (AuthContext, UIContext)
   ├─ lib/                   # helpers: date, storage, constants
   ├─ services/              # API/client layer (fetch wrappers)
   └─ types/                 # TS types or JSDoc typedefs (if used)
```

> **Note:** Exact folders may vary in the base repo. Keep new feature code in clearly named subfolders (`components/calendar`, `services/meetings.js`, etc.).

---

## 3) Routing Map
Typical SPA routes (adjust if your repo differs):

| Route        | Page Component         | Purpose                                 |
|--------------|------------------------|------------------------------------------|
| `/login`     | `pages/Login.jsx`      | User auth (email/password or OAuth)      |
| `/dashboard` | `pages/Dashboard.jsx`  | User overview + **Calendar** (Week‑1)    |
| `/profile`   | `pages/Profile.jsx`    | Profile & availability defaults          |

> If the app shows blank at `/`, navigate directly to `/login` or `/dashboard`.

---

## 4) Theming & Design System (Tailwind)
Tailwind is configured in `tailwind.config.js` with **brand palettes** and **animations**. Use semantic utilities instead of hex codes.

### Palette (aliases → classes)
- **Primary:** `text-primary-700`, `bg-primary-500`, `border-primary-800`
- **Secondary:** `bg-secondary-500`, `text-secondary-700`
- **Accent:** `bg-accent-500`, `text-accent-700`
- **State colors:** `success-500`, `warning-500`, `error-500`

### Typography
- Base font: `font-sans` → Inter var

### Motion
- `animate-fade-in` (0.5s) and `animate-slide-in` (0.3s) for subtle UI feedback

### Global CSS
Ensure `src/styles/global.css` includes Tailwind layers and any app‑wide utilities:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Example composables */
.container-p {
  @apply p-6 md:p-8 lg:p-10;
}
.card {
  @apply bg-white rounded-2xl shadow-lg;
}
```

---

## 5) State Management Strategy
- **Local state:** Component‑level UI (inputs, dialogs, local events list)
- **Context (Optional for Week‑1):**
  - `AuthContext` → user session, token, role (investor/entrepreneur)
  - `UIContext` → theme mode, toasts, modals
- **Server state (Future Weeks):** Remote data (meetings, availability). For Week‑1, a local in‑memory array is acceptable; later replace with API calls.

---

## 6) Calendar Feature (Week‑1)
**Goal:** Users can add/modify availability and visualize meetings inside Dashboard.

### Libraries
```
@fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

### Minimal Integration
`components/calendar/Calendar.jsx`
- Renders FullCalendar
- Handles clicks to create events
- Stores events in local state for Week‑1

**Event shape (JSDoc):**
```js
/** @typedef {Object} CalendarEvent
 *  @property {string} id
 *  @property {string} title
 *  @property {string|Date} start
 *  @property {string|Date} [end]
 *  @property {boolean} [allDay]
 *  @property {"availability"|"request"|"confirmed"} kind
 *  @property {"pending"|"accepted"|"declined"} [status]
 */
```

**UI Rules (Week‑1 local only):**
- **Availability slot** → created by clicking on date; color = `bg-primary-500`
- **Meeting request** → (placeholder button/modal) color = `bg-accent-500`
- **Confirmed** → `bg-success-500`

> In Week‑1, you can implement *availability + add event*. Requests/accept/decline back‑end wiring can come in Week‑2.

### Dashboard Wiring
- `pages/Dashboard.jsx` imports `components/calendar/Calendar.jsx`
- Place inside a `.card` container with padding and title

---

## 7) Components Catalog (selected)

### Layout
- `components/layout/Navbar.jsx` — brand, user menu
- `components/layout/Sidebar.jsx` (if present) — navigation

### UI Primitives (ui/)
- `Button.jsx` — primary/secondary variants using Tailwind classes
- `Input.jsx`, `Select.jsx`, `Modal.jsx`, `Badge.jsx`, `Card.jsx`

### Feature — Calendar (calendar/)
- `Calendar.jsx` — FullCalendar wrapper
- `NewEventDialog.jsx` — (optional) a modal replacing `prompt()` to capture title/date/time
- `EventLegend.jsx` — shows color meaning (availability/request/confirmed)

---

## 8) Services / API Layer (stub for future)
Create `services/meetings.js` for future server integration:
```js
// services/meetings.js
export async function fetchMeetings() {
  // GET /api/meetings
  return [];
}

export async function createMeeting(payload) {
  // POST /api/meetings
  return { id: crypto.randomUUID(), ...payload };
}

export async function respondToMeeting(id, action /* accept|decline */) {
  // PATCH /api/meetings/:id
  return { id, status: action === "accept" ? "accepted" : "declined" };
}
```

Keep **all fetch logic** in `services/` so components stay clean.

---

## 9) Auth Flow (high‑level)
- `/login` handles credentials → set token in memory/localStorage
- `AuthContext` (optional Week‑1) exposes `user`, `login()`, `logout()`
- Protected routes redirect to `/login` if no session

---

## 10) Error, Loading & Empty States
- Use small helpers/components: `Loader`, `ErrorState`, `EmptyState`
- Keep UX consistent: spinners, toasts, and retry buttons

---

## 11) Environment Variables
In Vite, env vars start with `VITE_`:
```
VITE_API_BASE_URL=https://api.example.com
VITE_ENV=development
```
Create `.env.local` (not committed) and access via `import.meta.env.VITE_API_BASE_URL`.

---

## 12) Coding Conventions
- **File naming:** `PascalCase` for components, `camelCase` for hooks/utils
- **Imports:** absolute aliases (configure in `vite.config.js`) or consistent relative paths
- **Styling:** use theme tokens (e.g., `text-primary-700`) — avoid raw hex
- **Accessibility:** `aria-*` attributes for interactive controls; keyboard navigable dialogs
- **Testing (optional):** co‑locate tests next to components

---

## 13) Build & Deployment (Vercel)
1. Push to GitHub (your fork)
2. On Vercel → **New Project** → Import from GitHub
3. Framework Preset: **Vite** (auto-detected)
4. Build command: `npm run build` | Output: `dist`
5. Set env vars (if any) under **Project Settings → Environment Variables**
6. Deploy → get public URL (e.g., `https://nexus-yourname.vercel.app/login`)

---

## 14) Development Workflow
- **Branches:** `feature/calendar-week1` → PR → `main`
- **Commits:** small, descriptive (e.g., `feat(calendar): add FullCalendar wrapper with add-on-date-click`)
- **Docs:** update this `ARCHITECTURE.md` when adding new modules

---

## 15) Week‑1 Checklist (copy for PR description)
- [ ] Tailwind theme configured (colors, fonts, animations)
- [ ] `Calendar.jsx` added with FullCalendar integration
- [ ] Calendar rendered on `Dashboard`
- [ ] Basic event creation (date click → title → event)
- [ ] `ARCHITECTURE.md` added to repo root
- [ ] Vercel deployment successful (URL shared)

---

## 16) TODO / Roadmap (Weeks 2+)
- **Meeting requests:** create/send request to another user
- **Accept/Decline:** status updates & notifications (toast + badge)
- **Availability management:** dedicated UI to define recurring slots
- **Persistence:** replace local state with API (services/meetings.js)
- **Authorization:** role‑based access (investor vs entrepreneur)
- **Calendar UX:** drag‑to‑select times, edit/delete events via modal

---

**Maintainer Note:** Keep this document short but *living*. Update sections when adding services, contexts, or routes so new contributors can onboard quickly.

