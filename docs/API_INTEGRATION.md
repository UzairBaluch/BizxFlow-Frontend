# BizxFlow frontend ↔ API

Aligned with the backend integration guide and **docs/FRONTEND_API_SUMMARY.md**. **Live OpenAPI:** `{API_HOST}/api-docs` and `/api-docs.json`.

## Base URL

Set **`VITE_API_BASE_URL`** in `.env` (no trailing slash). All routes in `src/api/client.ts` are prefixed with **`/api/v1/users`**.

## Auth

- Protected calls: **`Authorization: Bearer <accessToken>`** (stored in `localStorage` as `accessToken`).
- After login, branch on **`data.type`**: `company` vs `user`, and on **`user.role`** when `type === user` (`Manager` \| `Employee` only).
- Optional cookie-based auth requires same-site CORS + `credentials: 'include'`; this SPA uses **Bearer** by default.

## Response shape

Success bodies include `success`, `data`, `message`, and often `statusCode`. Errors: HTTP status + `error` or `message` string.

## Feature access (summary)

| Feature | Who |
|--------|-----|
| `GET /dashboard` | **Company JWT** or **Manager user** (same KPIs). **`totalTeamMembers`** / **`totalEmployees`**: all user roles (not company). **Team-member card** uses **`GET /all-users`** `totalUsers` when available. **Pending leave card** prefers **`GET /all-leaves`** and counts rows with status `pending` (same as Leave page) so it stays correct after approve/reject; if that call fails, falls back to dashboard **`totalPendingLeaves`** / **`leavesByStatus`**. |
| `GET /tasks` | **User JWT** — **my assigned tasks** (paginated); query `page`, `limit`, `search`. Per OpenAPI, not “all company tasks”. |
| `GET /all-tasks` | **Company JWT** or **Manager** — all tenant tasks. Query: `page`, `limit`, `search` (title), optional `status` (`Pending` \| `In Progress` \| `Done`). Response `data`: `{ tasks, totalTasks, page, limit }`. Populated: `assignedTo`, `createdBy`, `createdByCompany`. Frontend uses this for the Tasks page (dashboard-aligned). |
| `POST /tasks` | Company or Manager user |
| `PATCH /tasks/:id` | **Assignee user** (status only) |
| Check-in / out / `check-record` | **Employee user** self-service (user JWT, typically Employee) — **not** company JWT (403) |
| `GET /record-all` | Company or Manager |
| Leave apply / my-leaves | **User** |
| Leave approve / all-leaves | Company or Manager |
| Announcements list | Authenticated; **POST** Company or Manager |
| `PATCH /update-user-role/:userId` | **Company JWT** or **Manager** — body `{ role: "Manager" \| "Employee" }` (exact strings; confirm OpenAPI). **200** + usual `ApiResponse`, **`data`**: updated user (no `password` / `refreshToken`). **400** invalid `userId`; **404** wrong tenant or user missing; **403** cannot change **your own** role when logged in as a **user** JWT; other guards per backend (e.g. last elevated manager). Frontend: Users **Edit** modal → Save role. |
| `DELETE /delete-user/:userId` | **Company JWT** or **Manager** — no body. **200** + **`data: { deleted: true }`**. **404** tenant/user; **403** cannot delete **yourself**; other rules per backend. Frontend: Users **Edit** → remove (hidden for your own row when signed in as that user). |
| **User notifications (REST)** | **`GET /my-notifications`** — list/history (optional `page`, `limit`). Frontend accepts `data.notifications`, top-level `notifications`, `data.items`, etc. **`GET /unread-count`** — `unreadCount`, `count`, `unread`, `totalUnread` on `data` or root. **`PATCH /my-notifications/:id/read`** then **`PATCH /notifications/:id/read`** on 404 (see `client.ts`). Optional **`PATCH .../read-all`** per OpenAPI. **User JWT only** — not company. |
| **User notifications (Socket.io)** | Connect to **`URL.origin`** of `VITE_API_BASE_URL` (path stripped), default **`path: /socket.io`**, **`auth: { token }`**, transports websocket + polling. Optional **`VITE_SOCKET_IO_PATH`** if the server uses a custom path. Event **`notification`**: document or `{ notification \| data \| doc: {...} }`. **User JWT only**. |

See the full guide in your project docs or backend README for the complete table.

## Who receives in-app / company notifications (backend)

The SPA only **displays** notifications for **user** JWTs (`/my-notifications` + Socket). **Who gets a row** when someone checks in/out, submits leave, or updates task status must be decided **on the server** when the event is handled.

There is no **`Admin`** user role; use **Manager** where you previously targeted “elevated users.”

| Trigger | Actor: **Employee** | Actor: **Manager** |
|--------|---------------------|---------------------|
| Check-in / check-out | All **Manager** users in tenant **+** **Company** channel | **Company** only (do **not** fan out to other Managers) |
| Leave submit | Managers **+** Company | Company only |
| Task status update (assignee) | Managers **+** Company | Company only |

**Company** here means whatever channel the backend uses for the company account (e.g. company activity feed, email, or a future company JWT notification API). This frontend does not call `my-notifications` with a company token today.

Omit the **actor** from recipient lists if you want no self-notifications on their own actions.
