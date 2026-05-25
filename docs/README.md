# Mboakako — E-Commerce Marketplace

> A full-stack e-commerce platform for Cameroon, built as a Software Construction and DevOps class project.
> Features AI-powered product recommendations, Supabase backend, Docker containerization, and Prometheus/Grafana monitoring.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Project Structure](#project-structure)
5. [Software Construction Explanation](#software-construction-explanation)
6. [Setup Instructions](#setup-instructions)
   - [Prerequisites](#prerequisites)
   - [Supabase Setup](#supabase-setup)
   - [Local Development](#local-development)
   - [Docker Setup](#docker-setup)
   - [Vercel Deployment](#vercel-deployment)
   - [Prometheus & Grafana](#prometheus--grafana)
7. [Environment Variables](#environment-variables)
8. [Database Schema](#database-schema)
9. [Recommendation System](#recommendation-system)
10. [API / Service Layer](#api--service-layer)

---

## Project Overview

**Mboakako** is a modern e-commerce web application targeting the Cameroonian market. It allows customers to browse and purchase products across 20+ categories including fashion, electronics, beauty, and lifestyle. Sellers (admins) can list and manage products directly from an admin dashboard.

The project was originally built with **React + FastAPI + SQLite** and has been fully refactored into a clean, modern architecture using:

- **React + TypeScript + Tailwind CSS** — frontend
- **Supabase** — replacing FastAPI/SQLite (auth, database, storage, real-time)
- **Docker** — containerized deployment
- **Vercel** — frontend hosting
- **Prometheus + Grafana** — observability and monitoring

---

## Features

- 🛍️ **Product Marketplace** — browse 20+ categories with search and filtering
- 🤖 **AI Recommendations** — TF-IDF content-based filtering based on user reviews
- 🔐 **Authentication** — Supabase Auth (email/password, JWT sessions)
- 🛒 **Shopping Cart** — persistent, real-time cart with quantity management
- 📦 **Order Management** — place orders, track status, view history
- ⭐ **Product Reviews** — rate and review products (one review per product)
- 👨‍💼 **Admin Panel** — create, manage, and deactivate products
- 📊 **Monitoring** — Prometheus metrics + Grafana dashboards
- 🐳 **Docker** — fully containerized for consistent environments
- 🚀 **Vercel** — zero-config production deployment

---

## Technologies Used

| Layer          | Technology                        | Purpose                              |
|----------------|-----------------------------------|--------------------------------------|
| Frontend       | React 18 + TypeScript             | UI framework                         |
| Styling        | Tailwind CSS v3                   | Utility-first CSS                    |
| Routing        | React Router v6                   | Client-side routing                  |
| Build Tool     | Vite 5                            | Fast dev server + bundler            |
| Backend        | Supabase (PostgreSQL + Auth)      | Database, authentication, storage    |
| Recommendations| Custom TF-IDF (TypeScript)        | Content-based filtering engine       |
| Containerization| Docker + Nginx                   | Production deployment                |
| Orchestration  | Docker Compose                    | Multi-service management             |
| Monitoring     | Prometheus v2.52                  | Metrics collection                   |
| Dashboards     | Grafana v10                       | Metrics visualization                |
| Hosting        | Vercel                            | Frontend CDN deployment              |
| CI/CD          | Vercel Git Integration            | Auto-deploy on push                  |

---

## Project Structure

```
mboakako/
├── frontend/                      # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                # Reusable UI primitives (Button, Input, Badge…)
│   │   │   ├── product/           # Product-specific components (ProductCard)
│   │   │   └── layout/            # App shell (Navbar, Footer)
│   │   ├── pages/
│   │   │   ├── Home/              # Landing page with recommendations
│   │   │   ├── Market/            # Product catalogue + filters
│   │   │   ├── ProductDetails/    # Single product view + reviews
│   │   │   ├── Cart/              # Shopping cart
│   │   │   ├── Checkout/          # Order placement
│   │   │   ├── Auth/              # Login + Signup
│   │   │   ├── Dashboard/         # User order history + profile
│   │   │   ├── Admin/             # Admin product management
│   │   │   ├── Review/            # Leave a review
│   │   │   └── FAQ/               # Frequently asked questions
│   │   ├── context/
│   │   │   ├── AuthContext.tsx    # Supabase auth state
│   │   │   └── CartContext.tsx    # Cart state + actions
│   │   ├── hooks/
│   │   │   ├── useProducts.ts     # Product fetching hooks
│   │   │   └── useRecommendations.ts  # Recommendation hook
│   │   ├── services/
│   │   │   ├── supabase.ts        # Supabase client instance
│   │   │   ├── products.ts        # Product CRUD queries
│   │   │   ├── reviews.ts         # Review queries
│   │   │   └── orders.ts          # Order queries
│   │   ├── types/
│   │   │   └── database.ts        # TypeScript types matching Supabase schema
│   │   └── utils/
│   │       ├── recommendation.ts  # TF-IDF recommendation engine
│   │       └── helpers.ts         # Utility functions (formatPrice, formatDate…)
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── package.json
│   ├── vercel.json                # Vercel deployment config
│   └── .env.example               # Environment variable template
│
├── supabase/
│   ├── schema.sql                 # Complete PostgreSQL schema (run this first)
│   └── migrations/                # Supabase CLI migration files
│
├── devops/
│   ├── docker/
│   │   ├── Dockerfile.frontend    # Multi-stage Nginx build
│   │   ├── nginx.conf             # Nginx SPA routing config
│   │   ├── docker-compose.yml     # Orchestrates all services
│   │   └── .env.example           # Docker environment template
│   ├── prometheus/
│   │   ├── prometheus.yml         # Scrape config + job definitions
│   │   └── alerts/
│   │       └── mboakako_alerts.yml  # Alerting rules
│   └── grafana/
│       ├── provisioning/
│       │   ├── datasources/       # Auto-configure Prometheus datasource
│       │   └── dashboards/        # Auto-load dashboard JSON
│       └── dashboards/
│           └── mboakako_overview.json  # Pre-built monitoring dashboard
│
└── docs/
    └── README.md                  # This file
```

---

## Software Construction Explanation

### Docker
Docker packages the application and all its dependencies into **containers** — isolated, reproducible environments that run identically on any machine.

In this project:
- `Dockerfile.frontend` uses a **multi-stage build**: Node.js builds the Vite app in Stage 1, then Nginx serves the static output in Stage 2 (final image is ~25MB).
- `docker-compose.yml` orchestrates three services: `frontend`, `prometheus`, and `grafana`, all on a shared Docker network.
- Named volumes (`prometheus_data`, `grafana_data`) persist metric data across container restarts.

### Vercel
Vercel is a cloud platform optimized for frontend frameworks. It provides:
- **Automatic deployments** on every `git push` to the main branch
- **Edge CDN** — static assets served from 50+ global locations
- **Environment variable management** — secrets stored securely, never in code
- The `vercel.json` config adds SPA rewrites (all routes → `index.html`) and security headers.

### Prometheus
Prometheus is a pull-based **metrics collection system**. Every 15 seconds it scrapes HTTP `/metrics` endpoints from configured targets and stores the time-series data in its TSDB (Time Series Database).

Metrics collected in this project:
- `up` — whether each service is reachable (0 = down, 1 = up)
- `nginx_connections_active` — live Nginx connection count
- `nginx_http_requests_total` — total requests by status code
- `scrape_duration_seconds` — how long each scrape took
- `prometheus_tsdb_head_samples_appended_total` — storage growth

### Grafana
Grafana connects to Prometheus and renders the time-series data as **interactive dashboards**. It is provisioned automatically via YAML files:
- `datasources/prometheus.yml` — registers Prometheus as a data source on startup
- `dashboards/dashboards.yml` — tells Grafana where to find dashboard JSON files
- `dashboards/mboakako_overview.json` — a pre-built dashboard with panels for service health, request rate, connections, and storage.

### Supabase
Supabase is an open-source Firebase alternative built on PostgreSQL. It replaces the original FastAPI backend entirely:
- **Auth** — email/password sign-up/login, JWT session management, `auth.users` table
- **Database** — PostgreSQL with Row Level Security (RLS) policies enforcing per-user data access
- **Auto-generated profile** — a database trigger creates a `profiles` row whenever a new user signs up
- **Functions** — PostgreSQL functions power the recommendation engine's data queries
- **Real-time** (optional) — the cart uses live queries for immediate updates

---

## Setup Instructions

### Prerequisites

Install the following before starting:

```bash
node --version    # v20+
npm --version     # v10+
docker --version  # v24+
docker compose version  # v2.20+
```

You also need a free [Supabase](https://supabase.com) account.

---

### Supabase Setup

**Step 1 — Create a project**

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a name (e.g. `mboakako`), set a strong database password, select a region close to Cameroon (e.g. `eu-west-1`)
3. Wait ~2 minutes for provisioning

**Step 2 — Run the schema**

1. In your Supabase project dashboard, click **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste and click **Run**
5. Verify tables appear under **Table Editor**

**Step 3 — Get your API keys**

1. Go to **Project Settings → API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

**Step 4 — Create an admin user**

1. Go to **Authentication → Users → Add User**
2. Enter email + password
3. In **SQL Editor**, run:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'your-admin@email.com';
   ```

---

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/your-username/mboakako.git
cd mboakako

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Create environment file
cp .env.example .env.local
# Edit .env.local and fill in your Supabase URL and anon key

# 4. Start the development server
npm run dev

# App is now running at http://localhost:5173
```

---

### Docker Setup

Docker runs the production-ready version of the app with monitoring included.

```bash
# 1. Navigate to the docker directory
cd devops/docker

# 2. Create your environment file
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Build and start all services
docker compose up --build -d

# Services:
#   Frontend  → http://localhost:3000
#   Prometheus→ http://localhost:9090
#   Grafana   → http://localhost:3001 (admin / mboakako_admin)

# 4. Check service status
docker compose ps

# 5. View logs
docker compose logs -f frontend
docker compose logs -f prometheus

# 6. Stop all services
docker compose down

# 7. Stop and remove volumes (clears metric data)
docker compose down -v
```

---

### Vercel Deployment

**Option A — Via Vercel Dashboard (recommended)**

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Set **Root Directory** to `frontend`
5. Set **Framework Preset** to `Vite`
6. Add environment variables:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
7. Click **Deploy**

**Option B — Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from the frontend directory
cd frontend
vercel

# Follow prompts — set root to current directory
# Add env vars when prompted or in the dashboard
```

Vercel will give you a production URL like `https://mboakako.vercel.app`.

Every `git push` to the `main` branch triggers an automatic redeployment.

---

### Prometheus & Grafana

After running `docker compose up`, monitoring is available immediately.

**Prometheus**
- URL: http://localhost:9090
- Check targets: http://localhost:9090/targets
- Run a test query: `up` in the Expression Browser

**Grafana**
- URL: http://localhost:3001
- Login: `admin` / `mboakako_admin`
- The **Mboakako — System Overview** dashboard is pre-loaded under **Dashboards → Mboakako**
- To import additional dashboards: **Dashboards → Import → Upload JSON**

**Hot-reload Prometheus config** (without restart):
```bash
curl -X POST http://localhost:9090/-/reload
```

---

## Environment Variables

| Variable                 | Required | Description                           |
|--------------------------|----------|---------------------------------------|
| `VITE_SUPABASE_URL`      | ✅ Yes   | Your Supabase project URL             |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes   | Supabase anon/public API key          |
| `VITE_APP_NAME`          | Optional | App display name (default: Mboakako)  |
| `VITE_APP_URL`           | Optional | App base URL (for metadata)           |

> **Security note:** The anon key is safe to expose in the browser — it only grants access allowed by your Row Level Security (RLS) policies. Never expose the `service_role` key on the frontend.

---

## Database Schema

Core tables in PostgreSQL (Supabase):

| Table            | Description                                      |
|------------------|--------------------------------------------------|
| `profiles`       | User profiles extending `auth.users`             |
| `categories`     | Product category lookup table                    |
| `products`       | Product listings with category, price, stock     |
| `reviews`        | Product reviews with rating 1–5 (one per user)   |
| `carts`          | One cart per user                                |
| `cart_items`     | Items in a cart with quantity and subtotal       |
| `orders`         | Placed orders with status tracking              |
| `order_items`    | Individual line items in each order             |
| `user_activity`  | View/cart/purchase events for recommendations   |

Views:
- `products_with_ratings` — products joined with average rating and review count

Functions:
- `get_user_reviewed_products(user_id)` — reviewed products with ratings/comments
- `get_products_for_recommendation(user_id)` — unreviewed candidate products

All tables have **Row Level Security (RLS)** enabled. Users can only read/write their own data. Admins have elevated privileges via role check.

---

## Recommendation System

The recommendation engine is a client-side **content-based filtering** system implemented in TypeScript (`src/utils/recommendation.ts`), adapted from the original Python TF-IDF logic.

**Algorithm:**

1. **Fetch reviewed products** — calls `get_user_reviewed_products()` to get products the user has rated, along with their comments and star ratings.

2. **Fetch candidate products** — calls `get_products_for_recommendation()` to get all active products the user has NOT yet reviewed.

3. **Build TF-IDF corpus** — tokenizes `title + description + category + comment` for all products. Computes Term Frequency–Inverse Document Frequency vectors for each.

4. **Build user profile vector** — weights each reviewed product's TF-IDF vector by the user's star rating (5-star review contributes 5× more than 1-star).

5. **Cosine similarity** — measures angle between user profile vector and each candidate product's vector. Products closest to the user's taste score highest.

6. **Return top-K** — fetches full product data for the top 6 matches from Supabase.

**Cold start** — if the user has no reviews yet, falls back to showing the top-rated products by average rating.

---

## API / Service Layer

All data access is abstracted into service modules under `src/services/`:

| Service        | Functions                                                          |
|----------------|--------------------------------------------------------------------|
| `supabase.ts`  | Singleton Supabase client                                          |
| `products.ts`  | `getAllProducts`, `getProductsByCategory`, `getProductById`, `searchProducts`, `createProduct`, `updateProduct`, `deleteProduct`, `getAdminProducts` |
| `reviews.ts`   | `getProductReviews`, `createReview`, `hasUserReviewed`             |
| `orders.ts`    | `placeOrder`, `getUserOrders`, `getOrderWithItems`, `updateOrderStatus` |

State is managed via React Context:
- `AuthContext` — Supabase session, user profile, sign-in/up/out
- `CartContext` — cart items, add/remove/update/clear actions

---

*Built for the Software Construction course — demonstrating Docker, Vercel, Prometheus, Grafana, and Supabase in a real-world application.*
