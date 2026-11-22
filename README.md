# BharatSafar & BharatExplorer — Universal Multi-Site CMS

## Setup & Deployment Steps

1. **Supabase SQL Setup**: Run `supabase/schema.sql` inside your Supabase SQL Editor.
2. **Environment Variables (Vercel / Netlify)**:
   - `DEFAULT_SITE_SLUG` = `bharatsafar`
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase Project URL (without `/rest/v1`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase `anon` public key
   - `ADMIN_PASSWORD` = Your secret admin password (do NOT prefix with `NEXT_PUBLIC_`)
3. **Routes**:
   - `/` — Public Portal (`BharatSafar` & `BharatExplorer` switcher, Side Menu `☰` with unlimited sections & subsections, public post Likes, no admin button, no `.com` promotion)
   - `/admin` — Password-protected Unified Admin Workspace for managing both sites
