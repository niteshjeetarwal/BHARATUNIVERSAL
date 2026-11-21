'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DEFAULT_SITES, INITIAL_SAMPLE_CONTENT } from '@/lib/defaultSites';
import { SiteConfig, CMSContentItem } from '@/types/cms';
import BlockRenderer from '@/components/BlockRenderer';

export default function MultiTenantPublicSite() {
  const [site, setSite] = useState<SiteConfig>(DEFAULT_SITES[0]);
  const [allSites, setAllSites] = useState<SiteConfig[]>(DEFAULT_SITES);
  const [posts, setPosts] = useState<CMSContentItem[]>([]);
  const [selectedPost, setSelectedPost] = useState<CMSContentItem | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const querySite = params.get('site');
    const hostname = window.location.hostname;

    const savedSitesRaw = localStorage.getItem('bharat_cms_sites');
    const savedItemsRaw = localStorage.getItem('bharat_cms_items');

    const loadedSites: SiteConfig[] = savedSitesRaw ? JSON.parse(savedSitesRaw) : DEFAULT_SITES;
    const loadedItems: CMSContentItem[] = savedItemsRaw ? JSON.parse(savedItemsRaw) : INITIAL_SAMPLE_CONTENT;

    setAllSites(loadedSites);

    const matchedSite =
      loadedSites.find((s) => s.slug === querySite) ||
      loadedSites.find((s) => hostname.includes(s.slug)) ||
      loadedSites[0];

    setSite(matchedSite);
    setPosts(loadedItems.filter((item) => item.site_id === matchedSite.id && item.status === 'published'));
  }, []);

  const primary = site.theme_config.primaryColor;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header style={{ backgroundColor: primary }} className="text-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button onClick={() => setSelectedPost(null)} className="text-2xl font-extrabold tracking-tight text-left">
              {site.name}
            </button>
            <p className="text-xs text-white/80">{site.tagline}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg text-xs">
              <span className="opacity-75">Switch Site:</span>
              {allSites.map((s) => (
                <a
                  key={s.id}
                  href={`/?site=${s.slug}`}
                  className={`px-2 py-0.5 rounded font-semibold ${
                    s.id === site.id ? 'bg-white text-slate-900' : 'text-white hover:underline'
                  }`}
                >
                  {s.name}
                </a>
              ))}
            </div>
            <Link href="/admin" className="px-3.5 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-bold shadow hover:bg-slate-100">
              CMS Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        {selectedPost ? (
          <article className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <button onClick={() => setSelectedPost(null)} className="text-xs font-bold text-slate-500 hover:text-slate-900">
              ← Back to {site.name} Home
            </button>
            <div>
              <span style={{ backgroundColor: primary }} className="text-white text-[11px] uppercase font-bold px-2.5 py-1 rounded">
                {selectedPost.content_type.replace('_', ' ')}
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-3">{selectedPost.title}</h1>
              <p className="text-slate-500 mt-2">{selectedPost.excerpt}</p>
            </div>

            {selectedPost.editor_mode === 'drag_drop' && (
              <BlockRenderer blocks={selectedPost.content_blocks} primaryColor={primary} />
            )}
            {selectedPost.editor_mode === 'normal' && (
              <div className="prose max-w-none text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedPost.normal_html }} />
            )}
            {selectedPost.editor_mode === 'html' && (
              <div dangerouslySetInnerHTML={{ __html: selectedPost.raw_html }} />
            )}
          </article>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Latest on {site.name}</h2>
              <span className="text-xs text-slate-500">Domain: <strong>{site.domain}</strong></span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span style={{ color: primary }} className="text-xs font-bold uppercase tracking-wider">
                      {post.content_type.replace('_', ' ')}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2">{post.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-3">{post.excerpt}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                    <span style={{ color: primary }}>Read Full Article →</span>
                    <span className="text-slate-400">Mode: {post.editor_mode}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 text-xs py-6 px-6 text-center">
        © {new Date().getFullYear()} {site.name} ({site.domain}) • Powered by Bharat Universal Multi-Tenant CMS
      </footer>
    </div>
  );
}
