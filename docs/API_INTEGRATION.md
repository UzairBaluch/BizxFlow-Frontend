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
| `GET /dashboard` | **Company JWT** or **Admin / Manager user** (same KPIs). **`totalTeamMembers`** / **`totalEmployees`**: all user roles (not company). **Team-member card** uses **`GET /all-users`** `totalUsers` when available. **Pending leave card** prefers **`GET /all-leaves`** and counts rows with status `pending` (same as Leave page) so it stays correct after approve/reject; if that call fails, falls back to dashboard **`totalPendingLeaves`** / **`leavesByStatus`**. |
| `GET /tasks` | **User JWT** — **my assigned tasks** (paginated); query `page`, `limit`, `search`. Per OpenAPI, not “all company tasks”. |
| `GET /all-tasks` | **Company JWT** or **Admin / Manager** — all tenant tasks. Query: `page`, `limit`, `search` (title), optional `status` (`Pending` \| `In Progress` \| `Done`). Response `data`: `{ tasks, totalTasks, page, limit }`. Populated: `assignedTo`, `createdBy`, `createdByCompany`. Frontend uses this for the Tasks page (dashboard-aligned). |
| `POST /tasks` | Company or Admin/Manager user |
| `PATCH /tasks/:id` | **Assignee user** (status only) |
| Check-in / out / `check-record` | **Employee user only** — **not** company JWT (403) |
| `GET /record-all` | Company or Admin/Manager |
| Leave apply / my-leaves | **User** |
| Leave approve / all-leaves | Company or Admin/Manager |
| Announcements list | Authenticated; **POST** Company or Admin/Manager |
| `PATCH /update-user-role/:userId` | **Company JWT** or **Admin/Manager** — body `{ role: "Admin" \| "Manager" \| "Employee" }` (exact strings). **200** + usual `ApiResponse`, **`data`**: updated user (no `password` / `refreshToken`). **400** invalid `userId`; **404** wrong tenant or user missing; **403** cannot change **your own** role when logged in as a **user** JWT; **403** cannot demote the **only Admin** in the company. Frontend: Users **Edit** modal → Save role. |
| `DELETE /delete-user/:userId` | **Company JWT** or **Admin/Manager** — no body. **200** + **`data: { deleted: true }`**. **404** tenant/user; **403** cannot delete **yourself**; **403** cannot delete the **last Admin**. Hard delete on backend — tasks/leaves/attendance may still reference the id until cleanup/soft-delete. Frontend: Users **Edit** → remove (hidden for your own row when signed in as that user). |

See the full guide in your project docs or backend README for the complete table.
