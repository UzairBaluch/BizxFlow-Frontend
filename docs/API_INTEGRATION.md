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
| **Notifications (REST)** | **User JWT:** `GET /my-notifications`, `GET /unread-count`, `PATCH /my-notifications/read-all`, `PATCH /my-notifications/:notificationId/read`. **Company JWT:** `GET /company-notifications`, `GET /company-notifications/unread-count`, `PATCH /company-notifications/read-all`, `PATCH /company-notifications/:notificationId/read`. All under `/api/v1/users/`. List payloads: `data.notifications`, top-level `notifications`, `data.items`, etc. (`client.ts`). |
| **Notifications (Socket.io)** | Same API host; **`auth: { token }`**. User → room **`user:<userId>`**; company → **`company:<companyId>`**. Event **`notification`**: same shape as saved doc (or wrapped — see `NotificationContext`). Details: **`docs/FRONTEND-SOCKET.md`**. |

**Data model (reference):** each row has **`companyId`** and either **`recipient` (User)** or **`recipientCompany` (Company)**, not both. Server may batch **`notifyCompanyAndManagers`** (one company row + one per Manager; optional **`skipManagerUserIds`** for the actor).

See the full guide in your project docs or backend README for the complete table.

## Notification event types → recipients (backend)

| Type | Who gets it |
|------|-------------|
| `TASK_ASSIGNED` | Assignee (personal copy); company + managers (org copy). Assigning manager omitted from extra manager rows if applicable. |
| `TASK_STATUS_UPDATED` | Company + managers; updating manager skipped if applicable. |
| `LEAVE_SUBMITTED` | Company + managers; submitter skipped if they’re a manager. |
| `LEAVE_APPROVED` / `LEAVE_REJECTED` | Employee (submitter). |
| `ANNOUNCEMENT_CREATED` | All users in tenant (poster skipped on their user JWT). |
| `ATTENDANCE_CHECK_IN` / `ATTENDANCE_CHECK_OUT` | Company + managers. |

There is no **`Admin`** user role — use **Manager** for elevated staff. Frontend **`IN_APP_NOTIFICATION_TYPES`** in `src/types/api.ts` lists known type strings for reference.

Omit the **actor** from recipient lists when you want no self-notifications on their own actions.
