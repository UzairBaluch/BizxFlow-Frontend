# BizxFlow API — frontend summary

## Base URL

**`VITE_API_BASE_URL`** → e.g. `https://bizxflow-production.up.railway.app` (no trailing slash). Routes are under **`/api/v1/users/...`**.

## Login

**`POST /api/v1/users/login`** — returns `data.type`: `"company"` or `"user"`, plus `data.accessToken` (and refresh/cookies if you use them).

- **Company** = org owner account (signup via **register**). Not a row in `users`; separate JWT. Full org access except **employee-only** attendance (`checkIn` / `checkOut` / `check-record`).
- **User** = staff with **`role`: `"Manager"` or `"Employee"` only** (no `Admin` user role).

## Who can do what (elevated org actions)

These require either **company JWT** or a **Manager user JWT**:

- Dashboard, all-users, add-user, update/delete user, create task, all-tasks, record-all (company-wide attendance), update leave / all-leaves, create announcement.

**Employee user:** self-service attendance, my tasks, submit leave, my leaves, list announcements, **user notification inbox** (REST + socket), profile, etc.

## Notifications — REST

**User JWT**

- `GET /my-notifications`
- `GET /unread-count`
- `PATCH /my-notifications/read-all`
- `PATCH /my-notifications/:notificationId/read`

**Company JWT**

- `GET /company-notifications`
- `GET /company-notifications/unread-count`
- `PATCH /company-notifications/read-all`
- `PATCH /company-notifications/:notificationId/read`

**Data model (reference):** each row has `companyId` and either **`recipient` (User)** or **`recipientCompany` (Company)**, not both.

**Who gets what (high level):** Backend may use helpers like **`notifyCompanyAndManagers`** (one row for company + one per Manager, same type/title/body/metadata; optional **`skipManagerUserIds`** so the actor isn’t duplicated). Event types and recipients (e.g. `TASK_ASSIGNED`, `TASK_STATUS_UPDATED`, `LEAVE_*`, `ANNOUNCEMENT_CREATED`, `ATTENDANCE_CHECK_IN` / `OUT`) are implemented server-side — see backend docs / Swagger.

## Notifications — Socket.io

Same API host; **`auth: { token: accessToken }`**. **User** token → room **`user:<userId>`**; **company** token → room **`company:<companyId>`**. Server emits **`notification`** with the same shape as the saved document.

Details: [`FRONTEND-SOCKET.md`](./FRONTEND-SOCKET.md), `src/lib/notificationSocket.ts`.

## Roles in UI

After login as **user**, read **`user.role`** — manager-only screens when **`role === "Manager"`** (and company flow when **`type === "company"`**). Legacy API **`Admin`** may still be normalized to **Manager** in `src/lib/authAccess.ts` until removed from the API.

## CORS

Production API **`CORS_ORIGIN`** must match the frontend origin if you have cookie/credential issues.

See also: [AUTH_MODEL.md](./AUTH_MODEL.md), [API_INTEGRATION.md](./API_INTEGRATION.md), [README.md](../README.md), [ROADMAP.md](../ROADMAP.md).
