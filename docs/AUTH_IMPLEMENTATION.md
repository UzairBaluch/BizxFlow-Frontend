# Auth model – frontend implementation

This checklist reflects **docs/AUTH_MODEL.md**. All items are implemented.

## Two account types

| Item | Implementation |
|------|----------------|
| **Company** – created via register | `auth.register(body, logo?)` → `POST /api/v1/users/register`. Register page: company signup only (email, password, companyName, optional logo). |
| **User** – created via add-user | `users.addUser(body, picture?)` → `POST /api/v1/users/add-user`. Users page: “Add user” modal (fullName, email, password, role, optional picture). |
| Login returns `type` + company or user | `auth.login` → `POST /api/v1/users/login`. `AuthContext` stores `accountType`, `company`, `user`; `parseAuthResponse` reads `type`, company/user, tokens. |
| Restore session | `auth.me` → `GET /api/v1/users/me`; AuthContext `fetchMe` sets type, company or user. |

## Users list (Company users page)

| Item | Implementation |
|------|----------------|
| List only user accounts (employees) | `users.all({ search, page, limit })` → `GET /api/v1/users/all-users`. Users page shows table (User, Role, Email, Joined). |
| Company not in list | Explained in UI copy: “This list shows user accounts (employees) in your company—not your company account…” |
| Who can see list | `canListUsers` = company or Admin/Manager; else show “Access restricted” and do not call API. |

## Who can add users

| Item | Implementation |
|------|----------------|
| Company or Admin/Manager | `canAddUser` = `accountType === 'company' \|\| (user?.role === 'Admin' \|\| user?.role === 'Manager')`. “Add user” button and modal only when `canAddUser`. |
| Employee cannot | No button; 403 from API shows toast: “You don't have permission to add users.” |

## UI copy

- **Company users page:** “This list shows user accounts (employees) in your company—not your company account. You’re signed in as the company, so you won’t appear as a row here. Add employees with ‘Add user’ and they will appear in this table.”

## Files

- **docs/AUTH_MODEL.md** – backend auth model (source of truth).
- **src/types/api.ts** – `AccountType`, `Company`, `User`, `RegisterBody`, `AddUserBody`, `AuthData`, `MeData`.
- **src/api/client.ts** – `auth.register`, `auth.login`, `auth.me`, `users.all`, `users.addUser`, `company.update`.
- **src/context/AuthContext.tsx** – `accountType`, `company`, `user`, register (then login), login, fetchMe, logout.
- **src/pages/Register.tsx** – Company signup form over landing.
- **src/pages/Login.tsx** – Login form over landing.
- **src/pages/Users.tsx** – Company users list, canListUsers/canAddUser, Add user modal, 403/404 handling, UI copy.
