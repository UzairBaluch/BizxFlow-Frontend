# BizxFlow frontend ↔ API

Aligned with the backend integration guide. **Live OpenAPI:** `{API_HOST}/api-docs` and `/api-docs.json`.

## Base URL

Set **`VITE_API_BASE_URL`** in `.env` (no trailing slash). All routes in `src/api/client.ts` are prefixed with **`/api/v1/users`**.

## Auth

- Protected calls: **`Authorization: Bearer <accessToken>`** (stored in `localStorage` as `accessToken`).
- After login, branch on **`data.type`**: `company` vs `user`, and on **`user.role`** when `type === user`.
- Optional cookie-based auth requires same-site CORS + `credentials: 'include'`; this SPA uses **Bearer** by default.

## Response shape

Success bodies include `success`, `data`, `message`, and often `statusCode`. Errors: HTTP status + `error` or `message` string.

## Feature access (summary)

| Feature | Who |
|--------|-----|
| `GET /dashboard` | **Company JWT** or **Admin / Manager user** (same KPIs) |
| `GET /tasks` | **User JWT** — **my assigned tasks** (paginated); query `page`, `limit`, `search`. Per OpenAPI, not “all company tasks”. |
| `GET /all-tasks` | **Company JWT** or **Admin / Manager** — all tenant tasks. Query: `page`, `limit`, `search` (title), optional `status` (`Pending` \| `In Progress` \| `Done`). Response `data`: `{ tasks, totalTasks, page, limit }`. Populated: `assignedTo`, `createdBy`, `createdByCompany`. Frontend uses this for the Tasks page (dashboard-aligned). |
| `POST /tasks` | Company or Admin/Manager user |
| `PATCH /tasks/:id` | **Assignee user** (status only) |
| Check-in / out / `check-record` | **Employee user only** — **not** company JWT (403) |
| `GET /record-all` | Company or Admin/Manager |
| Leave apply / my-leaves | **User** |
| Leave approve / all-leaves | Company or Admin/Manager |
| Announcements list | Authenticated; **POST** Company or Admin/Manager |

See the full guide in your project docs or backend README for the complete table.
