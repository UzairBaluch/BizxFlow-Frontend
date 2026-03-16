# BizxFlow — Frontend

React + TypeScript + Vite frontend for **BizxFlow**: team productivity and workforce management. Connects to the BizxFlow API (Node/Express on Railway) for auth, tasks, leave, attendance, and more.

---

## Features

### Main
- **Dashboard** — Overview, stats, and quick actions
- **Attendance** — Clock in/out and attendance history
- **Tasks** — Create, assign, and track tasks
- **Leave** — Request and manage leave (admin/manager approval)

### Collaboration & communication
- **Meetings** — Schedule and view meetings
- **Team Chat** — Team messaging
- **AI Briefing** — AI-powered daily briefings
- **Notifications** — In-app notifications
- **Community** — Team community feed
- **Announcements** — Company or team announcements

### Insights & wellness
- **Performance (Analytics)** — Performance insights and charts
- **Mood Check-in** — Daily mood tracking
- **End-of-Day Report** — End-of-day summary and reporting

### Management (admin/manager)
- **Users** — User management and roles

### Account
- **Profile** — Profile and settings
- **Login / Register** — JWT auth (token in `localStorage`, sent as `Authorization: Bearer`)

---

## Setup

```bash
npm install
```

Optional: set the API base URL (defaults to `https://bizxflow-production.up.railway.app`):

```bash
cp .env.example .env
# Edit .env and set:
# VITE_API_BASE_URL=https://your-api-url.com
```

## Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

Output is in `dist/`.

---

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing: sign in / get started |
| `/login` | Sign in |
| `/register` | Create account |
| `/dashboard` | Dashboard |
| `/tasks` | Tasks |
| `/leave` | Leave |
| `/attendance` | Attendance |
| `/users` | User management (admin/manager) |
| `/meetings` | Meetings |
| `/chat` | Team Chat |
| `/briefing` | AI Briefing |
| `/notifications` | Notifications |
| `/community` | Community |
| `/analytics` | Performance insights |
| `/announcements` | Announcements |
| `/mood` | Mood Check-in |
| `/end-of-day` | End-of-Day Report |
| `/profile` | Profile (Settings redirects here) |

---

## Tech

- **React 19** + **TypeScript**
- **Vite**
- **React Router**
- **Tailwind CSS**
- **Framer Motion**
- **Zustand**
- **Recharts** (charts)

