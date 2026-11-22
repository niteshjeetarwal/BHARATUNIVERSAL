import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_SITES, SiteConfig, ArticleItem } from '@/lib/defaultSites';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug =
    searchParams.get('site') ||
    process.env.DEFAULT_SITE_SLUG ||
    'bharatsafar';

  const fallback = DEFAULT_SITES[slug] || DEFAULT_SITES.bharatsafar;
  const supabase = getSupabase();

  if (!supabase) {
    return NextResponse.json({ site: fallback, source: 'default' });
  }

  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ site: fallback, source: 'default' });
  }

  const site: SiteConfig = {
    slug: data.slug,
    name: data.name || fallback.name,
    tagline: data.tagline || fallback.tagline,
    accentColor: data.accent_color || fallback.accentColor,
    footerText:
      data.footer_text || `© 2026 ${data.name || fallback.name}. All rights reserved.`,
    sections: Array.isArray(data.sections) ? data.sections : fallback.sections,
    articles: Array.isArray(data.articles) ? data.articles : fallback.articles,
  };

  return NextResponse.json({ site, source: 'supabase' });
}

export async function PATCH(request: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  try {
    const { slug, articleId, delta } = await request.json();
    if (!slug || !articleId || (delta !== 1 && delta !== -1)) {
      return NextResponse.json({ error: 'Invalid like request' }, { status: 400 });
    }

    const fallback = DEFAULT_SITES[slug] || DEFAULT_SITES.bharatsafar;
    const { data } = await supabase
      .from('sites')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    const currentArticles: ArticleItem[] = Array.isArray(data?.articles)
      ? data.articles
      : fallback.articles;

    const updatedArticles = currentArticles.map((art) =>
      art.id === articleId
        ? { ...art, likes: Math.max(0, (Number(art.likes) || 0) + delta) }
        : art
    );

    await supabase.from('sites').upsert(
      {
        slug,
        name: data?.name || fallback.name,
        tagline: data?.tagline || fallback.tagline,
        accent_color: data?.accent_color || fallback.accentColor,
        footer_text: data?.footer_text || fallback.footerText,
        sections: Array.isArray(data?.sections) ? data.sections : fallback.sections,
        articles: updatedArticles,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update like' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  const provided = request.headers.get('x-admin-password');

  if (!expected || provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase environment variables are missing.' },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as SiteConfig;
    if (!body.slug) {
      return NextResponse.json({ error: 'Missing site slug.' }, { status: 400 });
    }

    const { error } = await supabase.from('sites').upsert(
      {
        slug: body.slug,
        name: body.name,
        tagline: body.tagline,
        accent_color: body.accentColor,
        footer_text: body.footerText,
        sections: body.sections || [],
        articles: body.articles || [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }
}
