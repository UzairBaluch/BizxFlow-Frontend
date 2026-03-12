# SmartLink Hub — Frontend

React + TypeScript + Vite frontend for SmartLink Hub: public profile pages (Linktree-style) with a private dashboard to edit profile and links.

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

## Routes

| Path | Description |
|------|-------------|
| `/` | Home: sign in / get started, or redirect to dashboard if logged in |
| `/login` | Sign in |
| `/register` | Create account (email, password, handle, name) |
| `/dashboard` | Protected: edit profile + links, copy public URL |
| `/u/:handle` | Public profile (e.g. `/u/uzair`) |

Auth uses JWT; the access token is stored in `localStorage` and sent as `Authorization: Bearer <token>`.

## Tech

- **React 19** + **TypeScript**
- **Vite**
- **React Router**
- **Tailwind CSS**
