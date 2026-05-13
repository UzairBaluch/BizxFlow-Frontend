# BizxFlow frontend — roadmap pointers

This repo tracks **UI** work. Product and API contracts live with the backend (Railway/OpenAPI).

- **Notifications & roles** — Behavior (who receives which event type, `notifyCompanyAndManagers`, data model `recipient` vs `recipientCompany`) is defined server-side; this app consumes the routes in `src/api/client.ts` and [`docs/API_INTEGRATION.md`](docs/API_INTEGRATION.md).
- **Realtime** — [`docs/FRONTEND-SOCKET.md`](docs/FRONTEND-SOCKET.md) + `src/lib/notificationSocket.ts`.
- **Swagger** — `{API_HOST}/api-docs` and `/api-docs.json` for authoritative request/response shapes.

Concrete feature backlogs (team chat depth, manager permissions, etc.) belong in your issue tracker; link those here if you maintain a public roadmap.
