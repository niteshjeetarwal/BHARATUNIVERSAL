import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { DEFAULT_SITES } from '@/lib/defaultSites';

export async function GET() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('sites').select('*').order('created_at', { ascending: true });
    if (!error && data && data.length > 0) {
      return NextResponse.json({ sites: data, source: 'supabase' });
    }
  }
  return NextResponse.json({ sites: DEFAULT_SITES, source: 'default_seed' });
}
