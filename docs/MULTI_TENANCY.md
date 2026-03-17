# Multi-tenancy (frontend summary)

Data is scoped by company. Each company only sees its own records. The backend uses `companyId` from the logged-in company or the logged-in user’s company.

## Who can see company-wide lists

Same rule everywhere: **Company** (account type) or **Admin** or **Manager** (user role). **Employee** cannot.

- **Dashboard** – Company, Admin, Manager only (Employee sees “Access restricted”).
- **Users list / Add user** – Company, Admin, Manager only.
- **All attendance** (`record-all`) – Company, Admin, Manager only.
- **All leaves** (when backend is ready) – same.
- **Tasks, Announcements, Dashboard data** (when backend is ready) – same; same endpoints, backend scopes by company.

Frontend already uses this rule for Dashboard, Users, and Attendance. No new endpoints; keep calling the same APIs.

## Auth (unchanged)

Login returns `type: "company"` or `type: "user"`. Use that (and `user.role` when it’s a user) to show/hide:

- “All attendance”, “All leaves”, company-wide lists
- “Add user”, Users page
- Dashboard

Company and Admin/Manager see company-wide lists; Employee sees only their own (e.g. my record, my leaves, my tasks).

## Backend status (for reference)

### Done

- **Attendance**
  - **Check-in** – Employee only. No request/response change; backend stores `companyId` on the record.
  - **Check-out** – Unchanged.
  - **My record** (`check-record`) – Unchanged (“my” attendance by date range).
  - **All attendance** (`record-all`) – Who can call: Company or Admin/Manager. Response: only that company’s attendance (same shape). Frontend uses same rule and list UI.

### Coming next

Leave, then Task, then Announcements, then Dashboard will be scoped by company the same way: same endpoints and response shapes, lists/counts only for the current company. Frontend can keep calling the same APIs; no new endpoints required.

## Frontend checklist

- [x] Attendance: `record-all` only for Company / Admin / Manager; check-in/out UI only for Employee.
- [x] Users / Add user: Company, Admin, Manager only.
- [x] Dashboard: Company, Admin, Manager only.
- [ ] Leave: when backend is ready, use same rule for “all leaves” if present.
- [ ] Tasks: when backend is ready, same endpoints, backend scopes by company.
- [ ] Announcements / Dashboard: same.

See also: [AUTH_MODEL.md](./AUTH_MODEL.md).
