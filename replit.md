# E-Ticketing Service HP

Web application untuk mengelola siklus perbaikan ponsel dari intake sampai pickup dengan tracking publik dan notifikasi pelanggan.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/eticketing-service-hp` — aplikasi web utama dan seluruh halaman operasional.
- `artifacts/api-server/src/routes/repair.ts` — endpoint dashboard, ticket, customer, payment, notification, dan public tracking.
- `artifacts/api-server/src/routes/repair-store.ts` — contoh data domain dan state repair lifecycle.
- `lib/api-spec/openapi.yaml` — kontrak API sebagai sumber kebenaran untuk generated hooks.

## Architecture decisions

- Frontend memakai React + Vite di root preview agar customer tracking dan operasi staff hidup dalam satu aplikasi.
- API contract ditulis OpenAPI lalu di-generate menjadi React Query hooks dan Zod schemas.
- Status ticket memakai enum string dari PRD (`DEVICE_RECEIVED` sampai `PICKED_UP`) dan setiap perpindahan menambah history audit.
- WhatsApp dimodelkan sebagai notification queue dengan status delivery dan retry endpoint; provider WhatsApp dapat dipasang tanpa mengubah lifecycle ticket.

## Product

- Dashboard command center untuk intake, repair queue, deadline, delayed tickets, dan ready pickup.
- Ticket list/detail, create intake, assignment teknisi, diagnosis, estimasi biaya, approval/status updates, payments, notification retry, dan printable receipt.
- Customer directory, public tracking tanpa login, customer masking, status timeline, serta delay/pickup information.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
