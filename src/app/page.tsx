'use client';

import React, { useEffect, useState } from 'react';
import { DEFAULT_SITES, SiteConfig, ArticleItem } from '@/lib/defaultSites';

const PUBLIC_SITES = [
  { slug: 'bharatsafar', label: 'BharatSafar' },
  { slug: 'bharatexplorer', label: 'BharatExplorer' },
];

export default function HomePage() {
  const [activeSlug, setActiveSlug] = useState<string>('bharatsafar');
  const [site, setSite] = useState<SiteConfig>(DEFAULT_SITES.bharatsafar);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [selectedSubsectionId, setSelectedSubsectionId] = useState<string>('all');
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSite = params.get('site');
    if (urlSite && (urlSite === 'bharatsafar' || urlSite === 'bharatexplorer')) {
      setActiveSlug(urlSite);
    }
    try {
      const savedLikes = JSON.parse(localStorage.getItem('bu_liked_posts') || '{}');
      setLikedIds(savedLikes);
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSelectedArticle(null);
    setSelectedSectionId('all');
    setSelectedSubsectionId('all');

    fetch(`/api/content?site=${encodeURIComponent(activeSlug)}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json?.site) {
          setSite(json.site);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSite(DEFAULT_SITES[activeSlug] || DEFAULT_SITES.bharatsafar);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeSlug]);

  const handleSwitchSite = (slug: string) => {
    setActiveSlug(slug);
    setDrawerOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set('site', slug);
    window.history.replaceState({}, '', url.toString());
  };

  const handleToggleLike = async (article: ArticleItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const alreadyLiked = Boolean(likedIds[article.id]);
    const delta = alreadyLiked ? -1 : 1;

    const updatedLikesMap = { ...likedIds, [article.id]: !alreadyLiked };
    setLikedIds(updatedLikesMap);
    try {
      localStorage.setItem('bu_liked_posts', JSON.stringify(updatedLikesMap));
    } catch {}

    setSite((prev) => ({
      ...prev,
      articles: prev.articles.map((a) =>
        a.id === article.id
          ? { ...a, likes: Math.max(0, (Number(a.likes) || 0) + delta) }
          : a
      ),
    }));

    if (selectedArticle?.id === article.id) {
      setSelectedArticle((prev) =>
        prev
          ? { ...prev, likes: Math.max(0, (Number(prev.likes) || 0) + delta) }
          : null
      );
    }

    fetch('/api/content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: activeSlug, articleId: article.id, delta }),
    }).catch(() => {});
  };

  const filteredArticles = site.articles.filter((art) => {
    if (selectedSectionId !== 'all' && art.sectionId !== selectedSectionId) {
      return false;
    }
    if (
      selectedSubsectionId !== 'all' &&
      art.subsectionId !== selectedSubsectionId
    ) {
      return false;
    }
    return true;
  });

  const activeSectionObj = (site.sections || []).find(
    (s) => s.id === selectedSectionId
  );
  const activeSubObj = activeSectionObj?.subsections.find(
    (sub) => sub.id === selectedSubsectionId
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Side Menu Drawer for Unlimited Sections & Subsections */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[82vw] bg-white h-full shadow-2xl flex flex-col">
            <div
              style={{ backgroundColor: site.accentColor || '#0f766e' }}
              className="px-4 py-4 text-white flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-base">{site.name}</p>
                <p className="text-[11px] text-white/85">Browse Sections &amp; Topics</p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-sm font-bold"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedSectionId('all');
                  setSelectedSubsectionId('all');
                  setSelectedArticle(null);
                  setDrawerOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  selectedSectionId === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                🏠 All Posts ({site.articles.length})
              </button>

              {(site.sections || []).map((sec) => {
                const isSecSelected = selectedSectionId === sec.id;
                const isExpanded = expandedSectionId === sec.id || isSecSelected;
                return (
                  <div key={sec.id} className="pt-1">
                    <div className="flex items-center justify-between rounded-lg hover:bg-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSectionId(sec.id);
                          setSelectedSubsectionId('all');
                          setSelectedArticle(null);
                          setDrawerOpen(false);
                        }}
                        className={`flex-1 text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                          isSecSelected && selectedSubsectionId === 'all'
                            ? 'text-slate-900 bg-slate-200/70'
                            : 'text-slate-800'
                        }`}
                      >
                        <span>{sec.icon || '📂'}</span>
                        <span className="truncate">{sec.name}</span>
                      </button>

                      {sec.subsections?.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedSectionId(isExpanded ? null : sec.id)
                          }
                          className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-900"
                          aria-label="Toggle subsections"
                        >
                          {isExpanded ? '▾' : '▸'}
                        </button>
                      )}
                    </div>

                    {isExpanded && sec.subsections?.length > 0 && (
                      <div className="ml-5 mt-1 pl-2 border-l border-slate-200 space-y-1">
                        {sec.subsections.map((sub) => {
                          const isSubActive =
                            isSecSelected && selectedSubsectionId === sub.id;
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => {
                                setSelectedSectionId(sec.id);
                                setSelectedSubsectionId(sub.id);
                                setSelectedArticle(null);
                                setDrawerOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition ${
                                isSubActive
                                  ? 'bg-slate-900 text-white font-semibold'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              • {sub.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Header with Left Side Icon & Site Switcher (No Admin Link) */}
      <header
        style={{ backgroundColor: site.accentColor || '#0f766e' }}
        className="text-white shadow-sm transition-colors duration-300"
      >
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="w-10 h-10 rounded-lg bg-white/15 hover:bg-white/25 flex flex-col items-center justify-center gap-1.5 shrink-0 transition"
              aria-label="Open sections menu"
              title="Open Sections & Subsections"
            >
              <span className="w-5 h-0.5 bg-white rounded-full" />
              <span className="w-5 h-0.5 bg-white rounded-full" />
              <span className="w-5 h-0.5 bg-white rounded-full" />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {site.name}
              </h1>
              <p className="text-xs sm:text-sm text-white/90 mt-0.5">
                {site.tagline}
              </p>
            </div>
          </div>

          <div className="inline-flex rounded-lg bg-black/20 p-1 self-start sm:self-auto">
            {PUBLIC_SITES.map((item) => {
              const isActive = activeSlug === item.slug;
              return (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => handleSwitchSite(item.slug)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {(site.sections || []).length > 0 && (
          <div className="bg-black/15 border-t border-white/10">
            <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  setSelectedSectionId('all');
                  setSelectedSubsectionId('all');
                  setSelectedArticle(null);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  selectedSectionId === 'all'
                    ? 'bg-white text-slate-900'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                All
              </button>
              {(site.sections || []).map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    setSelectedSectionId(sec.id);
                    setSelectedSubsectionId('all');
                    setSelectedArticle(null);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                    selectedSectionId === sec.id
                      ? 'bg-white text-slate-900'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {sec.icon ? `${sec.icon} ` : ''}
                  {sec.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-7">
        {loading ? (
          <div className="text-sm text-slate-500 py-12 text-center">
            Loading {site.name}...
          </div>
        ) : selectedArticle ? (
          <article className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
              >
                ← Back to {site.name}
              </button>

              <button
                type="button"
                onClick={(e) => handleToggleLike(selectedArticle, e)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition inline-flex items-center gap-1.5 ${
                  likedIds[selectedArticle.id]
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{likedIds[selectedArticle.id] ? '♥' : '♡'}</span>
                <span>{selectedArticle.likes || 0} Likes</span>
              </button>
            </div>

            <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {selectedArticle.category} • {selectedArticle.publishedAt}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1 mb-4">
              {selectedArticle.title}
            </h2>
            <div className="space-y-4 text-slate-700 leading-relaxed">
              {selectedArticle.blocks?.map((block) => {
                if (block.type === 'heading') {
                  return (
                    <h3
                      key={block.id}
                      className="text-lg font-semibold text-slate-900 pt-2"
                    >
                      {block.text}
                    </h3>
                  );
                }
                if (block.type === 'quote') {
                  return (
                    <blockquote
                      key={block.id}
                      className="border-l-4 border-slate-300 pl-4 italic text-slate-600"
                    >
                      {block.text}
                    </blockquote>
                  );
                }
                if (block.type === 'list') {
                  return (
                    <div key={block.id}>
                      {block.text && (
                        <p className="font-semibold text-slate-800 mb-1">
                          {block.text}
                        </p>
                      )}
                      <ul className="list-disc pl-5 space-y-1">
                        {(block.items || []).map((li, idx) => (
                          <li key={idx}>{li}</li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return <p key={block.id}>{block.text}</p>;
              })}
            </div>
          </article>
        ) : (
          <div>
            {activeSectionObj && activeSectionObj.subsections.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-5">
                <button
                  type="button"
                  onClick={() => setSelectedSubsectionId('all')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold border transition ${
                    selectedSubsectionId === 'all'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  All in {activeSectionObj.name}
                </button>
                {activeSectionObj.subsections.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubsectionId(sub.id)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold border transition ${
                      selectedSubsectionId === sub.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                {activeSubObj
                  ? `${activeSectionObj?.name} › ${activeSubObj.name}`
                  : activeSectionObj
                  ? activeSectionObj.name
                  : `Latest on ${site.name}`}
              </h2>
              <span className="text-xs text-slate-500">
                {filteredArticles.length} post(s)
              </span>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500">
                No articles published in this section yet.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {filteredArticles.map((article) => {
                  const isLiked = Boolean(likedIds[article.id]);
                  return (
                    <div
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="cursor-pointer bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          {article.category}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">
                          {article.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-2 line-clamp-3">
                          {article.excerpt}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => handleToggleLike(article, e)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition inline-flex items-center gap-1 ${
                            isLiked
                              ? 'bg-rose-50 border-rose-200 text-rose-600'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>{isLiked ? '♥' : '♡'}</span>
                          <span>{article.likes || 0}</span>
                        </button>

                        <span
                          style={{ color: site.accentColor || '#0f766e' }}
                          className="text-xs font-semibold hover:underline"
                        >
                          Read Full Article →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Clean Footer — No Unauthorized .com Domain */}
      <footer className="bg-slate-900 text-slate-300 text-xs py-5">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{site.footerText}</span>
          <span className="text-slate-400">
            {site.name} • Curated Knowledge &amp; Travel Portal
          </span>
        </div>
      </footer>
    </div>
  );
}
