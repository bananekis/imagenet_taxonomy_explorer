# ImageNet Taxonomy Explorer

An interactive full-stack app for browsing and searching the ImageNet 2011 taxonomy (60 942 synsets).

**Stack:** React 18 + Vite · Node.js + Express · PostgreSQL 16 · Prisma · Tailwind CSS · TanStack Query

---

## Quick Start

**Prerequisites:** Node.js 18+, Docker (on macOS [OrbStack](https://orbstack.dev) is recommended — make sure it's running before step 1).

**1. Start the database**

```bash
docker compose up postgres -d
```

**2. Backend** (terminal 1)

```bash
cd backend
npm install
npx prisma db push
npm run ingest   # one-time — fetches XML and seeds the DB (~30 s)
npm run dev      # http://localhost:3001
```

**3. Frontend** (terminal 2)

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

**Stop**

```bash
lsof -ti :3001 | xargs kill -9
lsof -ti :5173 | xargs kill -9
docker compose stop postgres
```

---

## Project Structure

```
├── docker-compose.yml          postgres (local dev)
├── backend/
│   ├── prisma/schema.prisma
│   ├── scripts/ingest.ts       fetch XML → parse → seed DB
│   └── src/
│       ├── index.ts
│       ├── routes/nodes.ts     GET /api/nodes
│       ├── routes/search.ts    GET /api/search
│       └── lib/buildTree.ts    O(n) tree reconstruction
└── frontend/
    └── src/
        ├── api.ts
        ├── App.tsx
        └── components/
            ├── TreeView.tsx
            ├── TreeNode.tsx
            ├── SearchBar.tsx
            └── SearchResults.tsx
```
