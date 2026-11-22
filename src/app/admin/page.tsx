'use client';

import React, { useEffect, useState } from 'react';
import {
  DEFAULT_SITES,
  SiteConfig,
  ArticleItem,
  SiteSection,
} from '@/lib/defaultSites';

const MANAGED_SITES = [
  { slug: 'bharatsafar', label: 'BharatSafar' },
  { slug: 'bharatexplorer', label: 'BharatExplorer' },
];

export default function AdminPortalPage() {
  const [passwordInput, setPasswordInput] = useState('');
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [authError, setAuthError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const [selectedSlug, setSelectedSlug] = useState<string>('bharatsafar');
  const [siteData, setSiteData] = useState<SiteConfig>(DEFAULT_SITES.bharatsafar);
  const [loadingSite, setLoadingSite] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionIcon, setNewSectionIcon] = useState('📂');
  const [targetSectionForSub, setTargetSectionForSub] = useState('');
  const [newSubName, setNewSubName] = useState('');

  const [newTitle, setNewTitle] = useState('');
  const [postSectionId, setPostSectionId] = useState('');
  const [postSubId, setPostSubId] = useState('');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newBody, setNewBody] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('bu_admin_key');
    if (saved) setAdminPassword(saved);
  }, []);

  useEffect(() => {
    if (!adminPassword) return;
    setLoadingSite(true);
    setStatusMessage('');

    fetch(`/api/content?site=${encodeURIComponent(selectedSlug)}`)
      .then((r) => r.json())
      .then((json) => {
        const loaded: SiteConfig =
          json?.site || DEFAULT_SITES[selectedSlug] || DEFAULT_SITES.bharatsafar;
        setSiteData(loaded);
        const firstSec = loaded.sections?.[0]?.id || '';
        setTargetSectionForSub(firstSec);
        setPostSectionId(firstSec);
        setPostSubId(loaded.sections?.[0]?.subsections?.[0]?.id || '');
      })
      .catch(() => {
        const fallback = DEFAULT_SITES[selectedSlug] || DEFAULT_SITES.bharatsafar;
        setSiteData(fallback);
      })
      .finally(() => setLoadingSite(false));
  }, [adminPassword, selectedSlug]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setAuthError(err.error || 'Incorrect password.');
        setVerifying(false);
        return;
      }

      sessionStorage.setItem('bu_admin_key', passwordInput);
      setAdminPassword(passwordInput);
      setPasswordInput('');
    } catch {
      setAuthError('Unable to verify password right now.');
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('bu_admin_key');
    setAdminPassword(null);
  };

  const handleSaveSite = async (updatedConfig: SiteConfig) => {
    if (!adminPassword) return;
    setSaving(true);
    setStatusMessage('');

    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify(updatedConfig),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatusMessage(`Error: ${data.error || 'Failed to save changes.'}`);
      } else {
        setSiteData(updatedConfig);
        setStatusMessage(`Saved changes to ${updatedConfig.name} successfully.`);
      }
    } catch {
      setStatusMessage('Network error while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    const newSec: SiteSection = {
      id: `sec-${Date.now()}`,
      name: newSectionName.trim(),
      icon: newSectionIcon.trim() || '📂',
      subsections: [],
    };

    const updated: SiteConfig = {
      ...siteData,
      sections: [...(siteData.sections || []), newSec],
    };

    await handleSaveSite(updated);
    setNewSectionName('');
    if (!targetSectionForSub) setTargetSectionForSub(newSec.id);
    if (!postSectionId) setPostSectionId(newSec.id);
  };

  const handleAddSubsection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSectionForSub || !newSubName.trim()) return;

    const updatedSections = (siteData.sections || []).map((sec) => {
      if (sec.id !== targetSectionForSub) return sec;
      return {
        ...sec,
        subsections: [
          ...(sec.subsections || []),
          { id: `sub-${Date.now()}`, name: newSubName.trim() },
        ],
      };
    });

    await handleSaveSite({ ...siteData, sections: updatedSections });
    setNewSubName('');
  };

  const handleDeleteSection = async (secId: string) => {
    const updatedSections = (siteData.sections || []).filter((s) => s.id !== secId);
    await handleSaveSite({ ...siteData, sections: updatedSections });
  };

  const handleDeleteSubsection = async (secId: string, subId: string) => {
    const updatedSections = (siteData.sections || []).map((sec) =>
      sec.id === secId
        ? {
            ...sec,
            subsections: sec.subsections.filter((sub) => sub.id !== subId),
          }
        : sec
    );
    await handleSaveSite({ ...siteData, sections: updatedSections });
  };

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    const chosenSec = (siteData.sections || []).find((s) => s.id === postSectionId);
    const chosenSub = chosenSec?.subsections.find((sub) => sub.id === postSubId);
    const categoryLabel = chosenSec
      ? chosenSub
        ? `${chosenSec.name} • ${chosenSub.name}`
        : chosenSec.name
      : 'General';

    const newArticle: ArticleItem = {
      id: `post-${Date.now()}`,
      title: newTitle.trim(),
      sectionId: postSectionId || 'general',
      subsectionId: postSubId || undefined,
      category: categoryLabel,
      excerpt: newExcerpt.trim() || newBody.trim().slice(0, 140) + '...',
      publishedAt: new Date().toISOString().slice(0, 10),
      likes: 0,
    blocks: newBody
  .split('\n\n')
  .filter(Boolean)
  .map((para, i) => ({
    id: `blk-${Date.now()}-${i}`,
    type: 'paragraph' as const,
    text: para.trim(),
  })),
    };

    const updated: SiteConfig = {
      ...siteData,
      articles: [newArticle, ...siteData.articles],
    };

    await handleSaveSite(updated);
    setNewTitle('');
    setNewExcerpt('');
    setNewBody('');
  };

  const handleDeleteArticle = async (id: string) => {
    const updated: SiteConfig = {
      ...siteData,
      articles: siteData.articles.filter((a) => a.id !== id),
    };
    await handleSaveSite(updated);
  };

  if (!adminPassword) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-white rounded-xl p-6 shadow-xl space-y-4"
        >
          <div>
            <h1 className="text-xl font-bold text-slate-900">Control Center Sign In</h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your administrator password to manage BharatSafar &amp; BharatExplorer.
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Password
            </label>
            <input
              type="password"
              required
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-800"
            />
          </div>
          {authError && <p className="text-xs font-medium text-red-600">{authError}</p>}
          <button
            type="submit"
            disabled={verifying}
            className="w-full rounded-lg bg-slate-900 text-white py-2.5 text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
          >
            {verifying ? 'Verifying...' : 'Unlock Workspace'}
          </button>
        </form>
      </div>
    );
  }

  const selectedPostSectionObj = (siteData.sections || []).find(
    (s) => s.id === postSectionId
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-900 text-white px-4 py-4 shadow">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400">
              Unified Multi-Site Workspace
            </span>
            <h1 className="text-lg font-bold">
              Managing: {siteData.name} ({selectedSlug})
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {MANAGED_SITES.map((s) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => setSelectedSlug(s.slug)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  selectedSlug === s.slug
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}

            <a
              href={`/?site=${selectedSlug}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white/10 hover:bg-white/20"
            >
              Preview Live ↗
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-red-600/80 hover:bg-red-600"
            >
              Lock
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {statusMessage && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-medium text-emerald-900">
            {statusMessage}
          </div>
        )}

        {loadingSite ? (
          <p className="text-sm text-slate-500">Loading site configuration...</p>
        ) : (
          <>
            {/* Unlimited Sections & Subsections Manager */}
            <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Manage Unlimited Sections &amp; Subsections ({siteData.name})
                </h2>
                <p className="text-xs text-slate-500">
                  These appear inside the side menu icon (☰) and top filter bar for visitors.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <form
                  onSubmit={handleAddSection}
                  className="border border-slate-200 rounded-lg p-3.5 space-y-3 bg-slate-50"
                >
                  <p className="text-xs font-bold text-slate-800">
                    + Add New Main Section
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSectionIcon}
                      onChange={(e) => setNewSectionIcon(e.target.value)}
                      className="w-14 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-sm bg-white"
                      placeholder="📂"
                    />
                    <input
                      type="text"
                      required
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      placeholder="e.g. Historical Rulers"
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                  >
                    Add Section
                  </button>
                </form>

                <form
                  onSubmit={handleAddSubsection}
                  className="border border-slate-200 rounded-lg p-3.5 space-y-3 bg-slate-50"
                >
                  <p className="text-xs font-bold text-slate-800">
                    + Add Subsection Inside a Section
                  </p>
                  <select
                    value={targetSectionForSub}
                    onChange={(e) => setTargetSectionForSub(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white"
                  >
                    <option value="">Select Parent Section...</option>
                    {(siteData.sections || []).map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.icon} {sec.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="e.g. Mewar Dynasty"
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white"
                  />
                  <button
                    type="submit"
                    disabled={saving || !targetSectionForSub}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                  >
                    Add Subsection
                  </button>
                </form>
              </div>

              <div className="space-y-2">
                {(siteData.sections || []).map((sec) => (
                  <div
                    key={sec.id}
                    className="border border-slate-200 rounded-lg p-3 bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">
                        {sec.icon} {sec.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(sec.id)}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remove Section
                      </button>
                    </div>
                    {sec.subsections?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-100">
                        {sec.subsections.map((sub) => (
                          <span
                            key={sub.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-xs text-slate-700"
                          >
                            {sub.name}
                            <button
                              type="button"
                              onClick={() => handleDeleteSubsection(sec.id, sub.id)}
                              className="text-red-500 hover:text-red-700 font-bold"
                              title="Delete subsection"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Publish New Post */}
            <form
              onSubmit={handleAddArticle}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
            >
              <h2 className="text-base font-bold text-slate-900">
                Publish New Post to {siteData.name}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Select Section
                  </label>
                  <select
                    value={postSectionId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPostSectionId(val);
                      const found = (siteData.sections || []).find((s) => s.id === val);
                      setPostSubId(found?.subsections?.[0]?.id || '');
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                  >
                    {(siteData.sections || []).map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.icon} {sec.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Select Subsection (Optional)
                  </label>
                  <select
                    value={postSubId}
                    onChange={(e) => setPostSubId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value="">None (Main Section Only)</option>
                    {(selectedPostSectionObj?.subsections || []).map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter post title..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Short Summary (Excerpt)
                </label>
                <input
                  type="text"
                  value={newExcerpt}
                  onChange={(e) => setNewExcerpt(e.target.value)}
                  placeholder="Brief 1–2 line summary..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Full Content (Separate paragraphs with a blank line)
                </label>
                <textarea
                  rows={5}
                  required
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Write your article paragraphs here..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? 'Publishing...' : `Publish to ${siteData.name}`}
              </button>
            </form>

            {/* Site Branding & Footer Settings */}
            <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                Site Branding &amp; Footer ({siteData.name})
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Site Display Name
                  </label>
                  <input
                    type="text"
                    value={siteData.name}
                    onChange={(e) => setSiteData({ ...siteData, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Theme Accent Color (Hex)
                  </label>
                  <input
                    type="text"
                    value={siteData.accentColor}
                    onChange={(e) =>
                      setSiteData({ ...siteData, accentColor: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={siteData.tagline}
                    onChange={(e) =>
                      setSiteData({ ...siteData, tagline: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Footer Text (No .com promotion)
                  </label>
                  <input
                    type="text"
                    value={siteData.footerText}
                    onChange={(e) =>
                      setSiteData({ ...siteData, footerText: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveSite(siteData)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? 'Saving...' : `Save ${siteData.name} Settings`}
              </button>
            </section>

            {/* Published Posts List */}
            <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-slate-900">
                Published Posts on {siteData.name} ({siteData.articles.length})
              </h2>
              {siteData.articles.map((art) => (
                <div
                  key={art.id}
                  className="flex items-center justify-between gap-3 border border-slate-100 rounded-lg p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{art.title}</p>
                    <p className="text-xs text-slate-500">
                      {art.category} • {art.publishedAt} • ♥ {art.likes || 0} Likes
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteArticle(art.id)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
