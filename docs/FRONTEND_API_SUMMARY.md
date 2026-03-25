# BizxFlow API — frontend summary

## Base URL

**`VITE_API_BASE_URL`** → e.g. `https://bizxflow-production.up.railway.app` (no trailing slash). Routes are under **`/api/v1/users/...`**.

## Login

**`POST /api/v1/users/login`** — returns `data.type`: `"company"` or `"user"`, plus `data.accessToken` (and refresh/cookies if you use them).

- **Company** = org owner account (signup via **register**). Not a row in `users`; separate JWT.
- **User** = staff in the users collection with **`role`: `"Manager"` or `"Employee"` only** (no `Admin` user role).

## Who can do what (elevated org actions)

These require either **company JWT** or a **Manager user JWT**:

- Dashboard, all-users, add-user, update/delete user (with backend guards), create task, all-tasks, record-all (company-wide attendance), update leave / all-leaves, create announcement.

**Employee user:** self-service attendance (`checkIn`, `checkOut`, `check-record`), my tasks, submit leave, my leaves, list announcements, notifications (Socket + REST), profile, etc.

**Company JWT** cannot use employee-only attendance self-service routes — those expect a **user** JWT (typically **Employee**; confirm with OpenAPI if Manager may also clock in).

## REST

Standard JSON; many responses wrap as `{ statusCode, data, message, success }`. Use Swagger **`/api-docs`** and **`/api-docs.json`** for exact paths and bodies.

## Notifications

- **REST (user JWT only):** `GET /my-notifications`, `GET /unread-count`, optional `PATCH .../read-all`, `PATCH .../:notificationId/read` (exact paths per OpenAPI).
- **Socket.io:** connect to same origin as API with `socket.io-client`, `auth: { token: userAccessToken }` (**user** token, not company). Event **`notification`** = one notification document.

Details: `docs/API_INTEGRATION.md` and `src/lib/notificationSocket.ts`.

## Roles in UI

After login as **user**, read **`user.role`** — show manager-only screens when **`role === "Manager"`** (and company flow when **`type === "company"`**).

The frontend may still **normalize legacy `"Admin"`** from older APIs to **Manager** for gates until backends fully drop `Admin`.

## CORS

Production API **`CORS_ORIGIN`** must match the frontend origin if you have cookie/credential issues.

See also: [AUTH_MODEL.md](./AUTH_MODEL.md), [API_INTEGRATION.md](./API_INTEGRATION.md).
