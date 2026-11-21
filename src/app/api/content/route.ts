import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_SAMPLE_CONTENT } from '@/lib/defaultSites';

export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get('site_id');
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('pages_posts').select('*').order('updated_at', { ascending: false });
    if (siteId) query = query.eq('site_id', siteId);
    const { data, error } = await query;
    if (!error && data) return NextResponse.json({ items: data, source: 'supabase' });
  }
  const filtered = siteId ? INITIAL_SAMPLE_CONTENT.filter((i) => i.site_id === siteId) : INITIAL_SAMPLE_CONTENT;
  return NextResponse.json({ items: filtered, source: 'default_seed' });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('pages_posts').upsert(body).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ item: data, source: 'supabase' });
  }
  return NextResponse.json({ item: body, source: 'local_mode' });
}
