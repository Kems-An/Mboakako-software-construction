# Mboakako — E-Commerce Marketplace

See [`docs/README.md`](./docs/README.md) for the full documentation.

## Quick Start

```bash
# Frontend development
cd frontend
cp .env.example .env.local   # Add Supabase credentials
npm install && npm run dev    # → http://localhost:5173

# Docker (frontend + monitoring)
cd devops/docker
cp .env.example .env          # Add Supabase credentials
docker compose up --build -d  # → http://localhost:3000
                               # Prometheus → http://localhost:9090
                               # Grafana    → http://localhost:3001
```

## Supabase Database Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Open the **SQL Editor** and run `supabase/schema.sql`
3. Copy your **Project URL** and **anon key** to your `.env.local`

See full instructions in [`docs/README.md`](./docs/README.md).
