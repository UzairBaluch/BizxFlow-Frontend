# Backend auth model (for frontend / docs)

## Two account types

- **Company** – Created by `POST /api/v1/users/register` (email, password, companyName, optional logo). This is the “company account.” It is not a row in the User collection. Login returns `type: "company"` and a company object. In the UI, **company is treated like the first user / admin**: same sidebar (Main, Features, Management, Account) and same Dashboard when the dashboard API supports company tokens; otherwise a welcome card is shown.
- **User** – Created by `POST /api/v1/users/add-user` (by company or Admin/Manager). These are employees. Each has companyId and appears in the users list.

## Users list (e.g. “Company users” page)

`GET /api/v1/users/all-users` returns only **user accounts (employees)** for that company. The company account is not and will not appear in this list. So:

- One row (e.g. Ramees) = one user you added; that’s correct.
- The company (the logged-in company account) is not “missing”; it’s simply not shown in this table by design.

## Who can add users / see dashboard

- **Dashboard** and **Add user** (Users list) are for **company**, **Admin**, and **Manager** only. **Employees** do not see Dashboard in the sidebar and see an “Access restricted” message if they open the dashboard or users page.
- **Company** (logged in as company) or a user with role **Admin** or **Manager** can call add-user and view the users list.
- Users with role **Employee** cannot.

## Backend endpoints (summary)

- **Add-user:** `POST /api/v1/users/add-user` (auth required; body: fullName, email, password, role; optional picture). New users can log in immediately.
- **Register** is company signup only (not user self-signup).
- **Login** is one endpoint; it returns either company or user and `type: "company"` or `type: "user"`.

## Copy for the “Company users” UI

Use this (or equivalent) on the Company users page:

> This list shows user accounts (employees) in your company—not your company account. You’re signed in as the company, so you won’t appear as a row here. Add employees with “Add user” and they will appear in this table.

## Multi-tenancy

Data is scoped by company. For who can call company-wide endpoints (all-users, record-all, all-leaves, etc.) and the backend rollout status, see [MULTI_TENANCY.md](./MULTI_TENANCY.md).
