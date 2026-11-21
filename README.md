# Bharat Universal Multi-Tenant CMS (BharatSafar & BharatExplorer)

A complete, production-ready Multi-Tenant Universal CMS built with **Next.js 14 (App Router)**, **Supabase (PostgreSQL)**, **Tailwind CSS**, and a **Tri-Mode Page Builder** (Visual Drag & Drop + Normal Rich Text + Raw HTML/CSS/JS).

## Quick Deployment Guide (Vercel / Netlify + Supabase)
1. **Database Setup (Supabase)**:
   - Create a free project at [supabase.com](https://supabase.com).
   - Open **SQL Editor** -> Paste the contents of `supabase/schema.sql` -> Click **Run**.
2. **Environment Variables**:
   - Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. **Local Development**:
   ```bash
   npm install
   npm run dev
   ```
   - Open `http://localhost:3000/admin` for the Universal CMS Dashboard.
   - Preview sites locally: `http://localhost:3000?site=bharatsafar` or `http://localhost:3000?site=bharatexplorer`.
4. **Production Deployment (Vercel / Netlify)**:
   - Push this folder to GitHub and import into Vercel or Netlify.
   - Add custom domains (`bharatsafar.com` & `bharatexplorer.com`) in your hosting dashboard's **Domains** settings.
