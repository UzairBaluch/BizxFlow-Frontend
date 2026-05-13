# Socket.io & notifications — frontend

Aligned with the BizxFlow API and backend **`enrichNotificationMetadata()`** / **`createNotificationSafe`**. Same host as **`VITE_API_BASE_URL`** (origin only for the Socket handshake), default **`path: /socket.io`** (override **`VITE_SOCKET_IO_PATH`**).

## Client

- **`socket.io-client`** — `src/lib/notificationSocket.ts`.
- **`auth: { token: accessToken }`** — same JWT as REST (**user** or **company**).
- Transports: `websocket`, `polling`.
- Event **`notification`** (default). Override with comma-separated **`VITE_NOTIFICATION_SOCKET_EVENTS`** if the server uses other names.

## Server (reference)

- **User** JWT → room **`user:<userId>`** (string id).
- **Company** JWT → room **`company:<companyId>`** (`companyId` normalized to string hex on the server).
- Emit **`notification`** with the **same document shape** as REST (`_id`, `type`, `title`, `body`, `read`, `metadata`, …).

## REST pairing

| Session | List | Unread | Mark one | Mark all |
|--------|------|--------|----------|----------|
| User | `GET /api/v1/users/my-notifications` | `GET /api/v1/users/unread-count` | `PATCH /api/v1/users/my-notifications/:id/read` | `PATCH /api/v1/users/my-notifications/read-all` |
| Company | `GET /api/v1/users/company-notifications` | `GET /api/v1/users/company-notifications/unread-count` | `PATCH /api/v1/users/company-notifications/:id/read` | `PATCH /api/v1/users/company-notifications/read-all` |

If company-specific routes 404/403, the SPA may fall back to **`my-notifications`** / **`unread-count`** with the same company JWT (`NotificationContext`).

## Metadata → UI routing

Backend merges **`enrichNotificationMetadata()`** into saved rows (tasks, leave, attendance via **`notifyOrg`**, announcements, etc.). The SPA resolves deep links in **`src/lib/notificationDeepLink.ts`** (bell, notifications page, sidebar badges).

| Area | Canonical / keys the UI checks | Notes |
|------|--------------------------------|--------|
| **Tasks** | `taskId`, `task_id`, `assignedTaskId`, `assigneeId` | Assignee payloads may expose **`assignedTo` → assigneeId** after enrich. |
| **Leave** | `leaveId`, `leaveRequestId`, `requestId`, `leave_id`, `submittedLeaveId`, `employeeId` | Approve/reject may add **`employeeId` → userId**; if `type` contains **`LEAVE`** and **`userId`** is set, UI routes to **Leave**. |
| **Announcements** | `announcementId`, `announcement_id` | |
| **Attendance** | `attendanceId`, `attendanceRecordId`, `recordId`, `checkInId` | |
| **Fallback** | `type` string | Substrings **`LEAVE`**, **`TASK`**, **`ANNOUNCEMENT`**, **`ATTENDANCE`** (e.g. `LEAVE_SUBMITTED`) still route when metadata is sparse. |

**`_id`:** REST/socket may send Mongo **`{ $oid }`**; **`parseInAppNotificationDoc`** normalizes to a string.

## SPA sync (no socket required for correctness)

- After **leave submit**, **approve/reject**, **check-in/out**, **task create/update**, **announcement publish** — **`refreshNotifications()`** refetches list + unread.
- **Tab visible** + **window focus** — debounced REST refetch (~450ms).
- Optional **`VITE_NOTIFICATION_POLL_MS`** (≥15000) — periodic poll (see `.env.example`).

## Verify after Railway deploy

1. **Company JWT** — Immediately after an employee **check-in**, call **`GET /api/v1/users/company-notifications`** (Swagger or same token in the app). Expect at least one new row (`ATTENDANCE_CHECK_IN` / similar).
2. If **empty** — Server logs for **`BizxFlow notification create failed`** (or your equivalent), confirm **latest backend build** is live, and that **`notifyCompanyAndManagers` / `emitNotificationToCompany`** run with a normalized **`company:<companyId>`** room id.
3. **Socket** — Company session open in the app: devtools should show socket connected; optional **`VITE_NOTIFICATION_POLL_MS=30000`** to confirm REST path alone.

## Troubleshooting (company inbox empty)

1. Backend persists **`recipientCompany`** (or equivalent) and emits to **`company:<companyId>`**.
2. REST returns rows for **company** token (not only user inbox).
3. Socket handshake accepts **company** Bearer; room id matches REST tenant.
4. CORS / **`VITE_API_BASE_URL`** / **`VITE_SOCKET_IO_PATH`**.

See also: [`API_INTEGRATION.md`](./API_INTEGRATION.md), [`FRONTEND_API_SUMMARY.md`](./FRONTEND_API_SUMMARY.md), Swagger **`/api-docs`**.
