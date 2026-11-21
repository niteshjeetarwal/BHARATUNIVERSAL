CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    domain TEXT UNIQUE NOT NULL,
    tagline TEXT,
    theme_config JSONB NOT NULL DEFAULT '{"primaryColor": "#0f766e", "secondaryColor": "#f59e0b", "fontFamily": "Inter", "headerStyle": "modern"}'::jsonb,
    seo_defaults JSONB NOT NULL DEFAULT '{"metaTitleSuffix": " | Official Portal", "defaultDescription": "", "googleAnalyticsId": "", "googleSearchConsole": ""}'::jsonb,
    ads_config JSONB NOT NULL DEFAULT '{"adsenseClientId": "", "headerSlot": "", "inArticleSlot": "", "sidebarSlot": "", "enabled": false}'::jsonb,
    custom_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cms_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.cms_users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'author')),
    UNIQUE(site_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.pages_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.cms_users(id) ON DELETE SET NULL,
    content_type TEXT NOT NULL DEFAULT 'post' CHECK (content_type IN ('page', 'post', 'destination', 'historical_fact', 'book_chapter')),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    editor_mode TEXT NOT NULL DEFAULT 'drag_drop' CHECK (editor_mode IN ('drag_drop', 'normal', 'html')),
    content_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    normal_html TEXT DEFAULT '',
    raw_html TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    seo_meta JSONB NOT NULL DEFAULT '{"metaTitle": "", "metaDescription": "", "focusKeyword": "", "noIndex": false}'::jsonb,
    views_count BIGINT NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(site_id, slug)
);

CREATE INDEX idx_pages_posts_site_status ON public.pages_posts(site_id, status);
CREATE INDEX idx_pages_posts_slug ON public.pages_posts(site_id, slug);

CREATE TABLE IF NOT EXISTS public.taxonomies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    taxonomy_type TEXT NOT NULL DEFAULT 'category' CHECK (taxonomy_type IN ('category', 'tag', 'region', 'era', 'part')),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.taxonomies(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(site_id, taxonomy_type, slug)
);

CREATE TABLE IF NOT EXISTS public.content_taxonomies (
    content_id UUID NOT NULL REFERENCES public.pages_posts(id) ON DELETE CASCADE,
    taxonomy_id UUID NOT NULL REFERENCES public.taxonomies(id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, taxonomy_id)
);

CREATE TABLE IF NOT EXISTS public.menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    location TEXT NOT NULL CHECK (location IN ('header', 'footer', 'sidebar')),
    items_tree JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(site_id, location)
);

CREATE TABLE IF NOT EXISTS public.media_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    alt_text TEXT DEFAULT '',
    file_type TEXT NOT NULL DEFAULT 'image/webp',
    size_kb INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES public.pages_posts(id) ON DELETE CASCADE,
    editor_mode TEXT NOT NULL,
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.sites (name, slug, domain, tagline, theme_config, custom_modules)
VALUES
(
    'BharatSafar',
    'bharatsafar',
    'bharatsafar.com',
    'Explore Incredible India — Travel Guides, Routes & Hidden Gems',
    '{"primaryColor": "#0f766e", "secondaryColor": "#f97316", "fontFamily": "Inter", "badge": "Travel & Tourism"}'::jsonb,
    '["Destinations", "Tour Itineraries", "State Guides"]'::jsonb
),
(
    'BharatExplorer',
    'bharatexplorer',
    'bharatexplorer.com',
    'Discover India''s Heritage, Cities, Rulers & Untold Historical Facts',
    '{"primaryColor": "#9a3412", "secondaryColor": "#d97706", "fontFamily": "Georgia", "badge": "History & Facts"}'::jsonb,
    '["Indian Cities", "Historical Rulers", "Ministers & Polity"]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
