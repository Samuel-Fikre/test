# Inventory Manager

A single-page CRUD inventory management app built with Next.js, Drizzle ORM, Neon PostgreSQL, and Cloudinary.

## Tech Stack

- **Next.js** — Full-stack React framework
- **TailwindCSS** — Styling
- **shadcn/ui** — UI components (Dialog, AlertDialog, Table, Select)
- **Drizzle ORM** — TypeScript-first ORM
- **PostgreSQL** — Database (Neon serverless)
- **Cloudinary** — Image hosting
- **Motion** — Animations
- **Turborepo** — Monorepo build system

## Getting Started

1. Install dependencies:

```bash
bun install
```

2. Copy the environment template and fill in your credentials:

```bash
cp apps/web/.env.example apps/web/.env
```

Required variables:

| Variable                | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `DATABASE_URL`          | Neon pooled connection string                   |
| `DATABASE_URL_UNPOOLED` | Neon direct connection (for `drizzle-kit push`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                           |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                              |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                           |
| `CORS_ORIGIN`           | `http://localhost:3001` for local dev           |

3. Push the schema to your database:

```bash
bun run db:push
```

4. Start the dev server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) to use the app.

## Project Structure

```
inventory/
├── apps/
│   └── web/
│       └── src/
│           ├── app/
│           │   ├── api/
│           │   │   ├── items/         # GET (list), POST (create)
│           │   │   └── items/[id]/    # PUT (update), DELETE
│           │   ├── layout.tsx
│           │   └── page.tsx           # Single-page CRUD UI
│           └── components/
│               ├── inventory/
│               │   ├── items-table.tsx
│               │   ├── item-form.tsx
│               │   └── delete-dialog.tsx
│               └── ui/                # shadcn + custom components
├── packages/
│   ├── db/                            # Drizzle schema + client
│   └── env/                           # Env validation (Zod)
```

## Scripts

- `bun run dev` — Start all apps in development mode
- `bun run build` — Build all apps
- `bun run check` — Run linter
- `bun run db:push` — Push schema to database
- `bun run db:studio` — Open Drizzle Studio
