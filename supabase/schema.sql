-- =============================================================
-- MBOAKAKO E-COMMERCE PLATFORM — SUPABASE SCHEMA
-- Full PostgreSQL schema with RLS, indexes, and policies
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username     TEXT UNIQUE NOT NULL,
    email        TEXT UNIQUE NOT NULL,
    role         TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    avatar_url   TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- CATEGORIES TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id          SERIAL PRIMARY KEY,
    name        TEXT UNIQUE NOT NULL,
    slug        TEXT UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.categories (name, slug) VALUES
    ('Shoes',       'shoes'),
    ('Bags',        'bags'),
    ('Jewelries',   'jewelries'),
    ('Topwear',     'topwear'),
    ('Bottomwear',  'bottomwear'),
    ('Perfume',     'perfume'),
    ('Fragrance',   'fragrance'),
    ('Bodywash',    'bodywash'),
    ('Backpacks',   'backpacks'),
    ('Belts',       'belts'),
    ('Headwear',    'headwear'),
    ('Innerwear',   'innerwear'),
    ('Wallets',     'wallets'),
    ('Nails',       'nails'),
    ('Eyewear',     'eyewear'),
    ('Ties',        'ties'),
    ('Gadget',      'gadget'),
    ('Furniture',   'furniture'),
    ('Afro',        'afro'),
    ('Flip',        'flip')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- PRODUCTS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS public.products (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title        TEXT NOT NULL,
    description  TEXT NOT NULL DEFAULT '',
    price        NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    stock        INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url    TEXT NOT NULL DEFAULT '',
    category     TEXT NOT NULL,
    admin_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category    ON public.products(category);
CREATE INDEX idx_products_admin_id    ON public.products(admin_id);
CREATE INDEX idx_products_is_active   ON public.products(is_active);
CREATE INDEX idx_products_price       ON public.products(price);
CREATE INDEX idx_products_created_at  ON public.products(created_at DESC);

-- Full-text search index
CREATE INDEX idx_products_fts ON public.products
    USING GIN(to_tsvector('english', title || ' ' || description || ' ' || category));

-- =============================================================
-- REVIEWS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)  -- one review per user per product
);

CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_user_id    ON public.reviews(user_id);
CREATE INDEX idx_reviews_rating     ON public.reviews(rating);

-- =============================================================
-- CARTS TABLE (one cart per user)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.carts (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_carts_user_id ON public.carts(user_id);

-- =============================================================
-- CART ITEMS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id     UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    subtotal    NUMERIC(12, 2) NOT NULL DEFAULT 0,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(cart_id, product_id)
);

CREATE INDEX idx_cart_items_cart_id    ON public.cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);

-- =============================================================
-- ORDERS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_amount    NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
    stripe_session_id TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id    ON public.orders(user_id);
CREATE INDEX idx_orders_status     ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- =============================================================
-- ORDER ITEMS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE SET NULL,
    quantity    INTEGER NOT NULL CHECK (quantity > 0),
    price       NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    subtotal    NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * price) STORED
);

CREATE INDEX idx_order_items_order_id   ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- =============================================================
-- USER ACTIVITY TABLE (for recommendation engine)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.user_activity (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    event_type  TEXT NOT NULL DEFAULT 'view'
                    CHECK (event_type IN ('view', 'add_to_cart', 'purchase')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_activity_user_id    ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_product_id ON public.user_activity(product_id);
CREATE INDEX idx_user_activity_event_type ON public.user_activity(event_type);

-- =============================================================
-- HELPER VIEWS
-- =============================================================

-- Product with average rating
CREATE OR REPLACE VIEW public.products_with_ratings AS
SELECT
    p.*,
    COALESCE(AVG(r.rating), 0)::NUMERIC(3,2) AS average_rating,
    COUNT(r.id)::INTEGER                      AS review_count
FROM public.products p
LEFT JOIN public.reviews r ON r.product_id = p.id
GROUP BY p.id;

-- =============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_carts_updated_at
    BEFORE UPDATE ON public.carts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_cart_items_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories   ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES ----
CREATE POLICY "profiles_select_own"  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own"  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all"   ON public.profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ---- CATEGORIES (public read) ----
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (TRUE);

-- ---- PRODUCTS ----
-- Anyone can read active products
CREATE POLICY "products_public_read" ON public.products
    FOR SELECT USING (is_active = TRUE);

-- Admins can read all products including inactive
CREATE POLICY "products_admin_read_all" ON public.products
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Only admins can insert products
CREATE POLICY "products_admin_insert" ON public.products
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Admins can update/delete their own products
CREATE POLICY "products_admin_update" ON public.products
    FOR UPDATE USING (
        admin_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "products_admin_delete" ON public.products
    FOR DELETE USING (
        admin_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ---- REVIEWS ----
CREATE POLICY "reviews_public_read"   ON public.reviews FOR SELECT USING (TRUE);
CREATE POLICY "reviews_user_insert"   ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_user_update"   ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_user_delete"   ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- ---- CARTS ----
CREATE POLICY "carts_user_own" ON public.carts FOR ALL USING (auth.uid() = user_id);

-- ---- CART ITEMS ----
CREATE POLICY "cart_items_user_own" ON public.cart_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid())
    );

-- ---- ORDERS ----
CREATE POLICY "orders_user_own" ON public.orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "orders_admin_read" ON public.orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ---- ORDER ITEMS ----
CREATE POLICY "order_items_user_own" ON public.order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
    );

CREATE POLICY "order_items_insert_checkout" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
    );

-- ---- USER ACTIVITY ----
CREATE POLICY "user_activity_own" ON public.user_activity FOR ALL USING (auth.uid() = user_id);

-- =============================================================
-- FUNCTIONS FOR RECOMMENDATION ENGINE
-- =============================================================

-- Get products reviewed by a user with their ratings
CREATE OR REPLACE FUNCTION public.get_user_reviewed_products(p_user_id UUID)
RETURNS TABLE (
    product_id   UUID,
    title        TEXT,
    description  TEXT,
    category     TEXT,
    rating       INTEGER,
    comment      TEXT
) LANGUAGE sql SECURITY DEFINER AS $$
    SELECT
        p.id,
        p.title,
        p.description,
        p.category,
        r.rating,
        r.comment
    FROM public.reviews r
    JOIN public.products p ON p.id = r.product_id
    WHERE r.user_id = p_user_id AND r.rating > 0;
$$;

-- Get all active products for recommendation scoring
CREATE OR REPLACE FUNCTION public.get_products_for_recommendation(p_user_id UUID)
RETURNS TABLE (
    id          UUID,
    title       TEXT,
    description TEXT,
    category    TEXT,
    price       NUMERIC,
    image_url   TEXT,
    stock       INTEGER
) LANGUAGE sql SECURITY DEFINER AS $$
    SELECT
        p.id,
        p.title,
        p.description,
        p.category,
        p.price,
        p.image_url,
        p.stock
    FROM public.products p
    WHERE p.is_active = TRUE
      AND p.id NOT IN (
          SELECT product_id FROM public.reviews WHERE user_id = p_user_id
      );
$$;
