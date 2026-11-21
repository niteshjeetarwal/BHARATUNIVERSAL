'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe, LayoutDashboard, FileText, Layers, Settings,
  PlusCircle, ExternalLink, Search, Edit3, Trash2, Sparkles, Check,
} from 'lucide-react';
import { SiteConfig, CMSContentItem } from '@/types/cms';
import { DEFAULT_SITES, INITIAL_SAMPLE_CONTENT } from '@/lib/defaultSites';
import TriModeEditor from '@/components/TriModeEditor';

type AdminTab = 'dashboard' | 'content' | 'settings' | 'add_site';

export default function UniversalAdminDashboard() {
  const [sites, setSites] = useState<SiteConfig[]>(DEFAULT_SITES);
  const [activeSiteId, setActiveSiteId] = useState<string>(DEFAULT_SITES[0].id);
  const [items, setItems] = useState<CMSContentItem[]>(INITIAL_SAMPLE_CONTENT);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<CMSContentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteDomain, setNewSiteDomain] = useState('');
  const [newSiteTagline, setNewSiteTagline] = useState('');
  const [newSiteColor, setNewSiteColor] = useState('#1d4ed8');

  useEffect(() => {
    const savedSites = localStorage.getItem('bharat_cms_sites');
    const savedItems = localStorage.getItem('bharat_cms_items');
    if (savedSites) setSites(JSON.parse(savedSites));
    if (savedItems) setItems(JSON.parse(savedItems));
  }, []);

  const persistData = (updatedSites: SiteConfig[], updatedItems: CMSContentItem[]) => {
    setSites(updatedSites);
    setItems(updatedItems);
    localStorage.setItem('bharat_cms_sites', JSON.stringify(updatedSites));
    localStorage.setItem('bharat_cms_items', JSON.stringify(updatedItems));
  };

  const activeSite = sites.find((s) => s.id === activeSiteId) || sites[0];
  const siteItems = items.filter(
    (item) =>
      item.site_id === activeSite.id &&
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveContent = (savedItem: CMSContentItem) => {
    const exists = items.some((i) => i.id === savedItem.id);
    const updatedItems = exists
      ? items.map((i) => (i.id === savedItem.id ? savedItem : i))
      : [savedItem, ...items];
    persistData(sites, updatedItems);
    setIsEditing(false);
    setEditingItem(null);
    setActiveTab('content');
  };

  const handleDeleteContent = (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    persistData(sites, items.filter((i) => i.id !== id));
  };

  const handleCreateNewSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim() || !newSiteDomain.trim()) return;
    const slug = newSiteName.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const created: SiteConfig = {
      id: 'site-' + slug + '-' + Date.now(),
      name: newSiteName.trim(),
      slug,
      domain: newSiteDomain.trim().toLowerCase(),
      tagline: newSiteTagline || `${newSiteName} Official Website`,
      theme_config: {
        primaryColor: newSiteColor,
        secondaryColor: '#f59e0b',
        fontFamily: 'Inter',
        badge: 'Multi-Tenant Site',
      },
      seo_defaults: {
        metaTitleSuffix: ` | ${newSiteName}`,
        defaultDescription: newSiteTagline,
        googleAnalyticsId: '',
        googleSearchConsole: '',
      },
      ads_config: {
        adsenseClientId: '',
        headerSlot: '',
        inArticleSlot: '',
        sidebarSlot: '',
        enabled: false,
      },
      custom_modules: ['Articles', 'Pages', 'Categories'],
      status: 'active',
    };
    const updatedSites = [...sites, created];
    persistData(updatedSites, items);
    setActiveSiteId(created.id);
    setNewSiteName('');
    setNewSiteDomain('');
    setNewSiteTagline('');
    setActiveTab('dashboard');
  };

  const handleUpdateSiteSettings = (field: string, value: any) => {
    const updatedSites = sites.map((s) => {
      if (s.id !== activeSite.id) return s;
      if (field === 'primaryColor') {
        return { ...s, theme_config: { ...s.theme_config, primaryColor: value } };
      }
      if (field === 'adsenseClientId') {
        return {
          ...s,
          ads_config: { ...s.ads_config, adsenseClientId: value, enabled: Boolean(value) },
        };
      }
      return { ...s, [field]: value };
    });
    persistData(updatedSites, items);
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Bharat Universal CMS</span>
          </div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
            Active Website ({sites.length} Connected)
          </label>
          <select
            value={activeSite.id}
            onChange={(e) => { setActiveSiteId(e.target.value); setIsEditing(false); }}
            className="w-full bg-slate-800 border border-slate-700 text-white text-sm font-semibold rounded-lg px-3 py-2 focus:outline-none"
          >
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                🌐 {site.name} ({site.domain})
              </option>
            ))}
          </select>
        </div>

        <nav className="flex-1 p-3 space-y-1 text-sm">
          <button
            onClick={() => { setActiveTab('dashboard'); setIsEditing(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              activeTab === 'dashboard' && !isEditing ? 'bg-teal-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard Overview
          </button>
          <button
            onClick={() => { setActiveTab('content'); setIsEditing(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              activeTab === 'content' && !isEditing ? 'bg-teal-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" /> Pages & Posts ({siteItems.length})
          </button>
          <button
            onClick={() => { setEditingItem(null); setIsEditing(true); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              isEditing ? 'bg-teal-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" /> + New Page / Post
          </button>
          <button
            onClick={() => { setActiveTab('settings'); setIsEditing(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              activeTab === 'settings' && !isEditing ? 'bg-teal-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Settings className="w-4 h-4" /> Site Settings & Ads
          </button>
          <div className="pt-4 mt-4 border-t border-slate-800">
            <button
              onClick={() => { setActiveTab('add_site'); setIsEditing(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                activeTab === 'add_site' ? 'bg-amber-600 text-white font-semibold' : 'bg-slate-800/70 hover:bg-slate-800 text-amber-300'
              }`}
            >
              <PlusCircle className="w-4 h-4" /> Add 3rd / New Website
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <a
            href={`/?site=${activeSite.slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Visit {activeSite.name} Live
          </a>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {isEditing ? (
          <TriModeEditor
            site={activeSite}
            initialItem={editingItem}
            onSave={handleSaveContent}
            onCancel={() => { setIsEditing(false); setEditingItem(null); }}
          />
        ) : activeTab === 'dashboard' ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">{activeSite.name} — Control Center</h1>
                <p className="text-sm text-slate-500">{activeSite.tagline}</p>
              </div>
              <button
                onClick={() => { setEditingItem(null); setIsEditing(true); }}
                style={{ backgroundColor: activeSite.theme_config.primaryColor }}
                className="px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow hover:opacity-95"
              >
                + Create Page / Post
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-400">Published Content</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{siteItems.length}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-400">Connected Domain</p>
                <p className="text-lg font-bold text-slate-900 mt-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-teal-600" /> {activeSite.domain}
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-400">Active Modules</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {activeSite.custom_modules.map((m) => (
                    <span key={m} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">{m}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4">Multi-Tenant Network ({sites.length} Websites)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sites.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setActiveSiteId(s.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center justify-between ${
                      s.id === activeSite.id ? 'border-teal-600 bg-teal-50/40' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.theme_config.primaryColor }} />
                        <h3 className="font-bold text-slate-900">{s.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{s.domain}</p>
                    </div>
                    {s.id === activeSite.id && (
                      <span className="text-xs font-bold text-teal-700 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Active
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'content' ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-slate-900">{activeSite.name} — Pages & Posts</h1>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm bg-white"
                  />
                </div>
                <button
                  onClick={() => { setEditingItem(null); setIsEditing(true); }}
                  style={{ backgroundColor: activeSite.theme_config.primaryColor }}
                  className="px-4 py-2 rounded-xl text-white text-sm font-bold"
                >
                  + Add New
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-3.5 px-5">Title</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Editor Mode</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {siteItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        {item.title}
                        <div className="text-xs font-normal text-slate-400">/{item.slug}</div>
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-600">{item.content_type.replace('_', ' ')}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">{item.editor_mode}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 capitalize">{item.status}</span>
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-2">
                        <button
                          onClick={() => { setEditingItem(item); setIsEditing(true); }}
                          className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContent(item.id)}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'settings' ? (
          <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h1 className="text-xl font-bold text-slate-900">{activeSite.name} — Isolated Site Settings</h1>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Website Display Name</label>
              <input
                type="text"
                value={activeSite.name}
                onChange={(e) => handleUpdateSiteSettings('name', e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Custom Domain</label>
              <input
                type="text"
                value={activeSite.domain}
                onChange={(e) => handleUpdateSiteSettings('domain', e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={activeSite.tagline}
                onChange={(e) => handleUpdateSiteSettings('tagline', e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand Primary Color</label>
                <input
                  type="color"
                  value={activeSite.theme_config.primaryColor}
                  onChange={(e) => handleUpdateSiteSettings('primaryColor', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Google AdSense Publisher ID</label>
                <input
                  type="text"
                  placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                  value={activeSite.ads_config.adsenseClientId}
                  onChange={(e) => handleUpdateSiteSettings('adsenseClientId', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleCreateNewSite}
            className="max-w-xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
          >
            <h1 className="text-xl font-bold text-slate-900">Add New Website to Universal CMS</h1>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Site Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. StudiesRankers"
                value={newSiteName}
                onChange={(e) => setNewSiteName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Domain Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. studiesrankers.com"
                value={newSiteDomain}
                onChange={(e) => setNewSiteDomain(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={newSiteTagline}
                onChange={(e) => setNewSiteTagline(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Theme Accent Color</label>
              <input
                type="color"
                value={newSiteColor}
                onChange={(e) => setNewSiteColor(e.target.value)}
                className="h-10 w-24 rounded border border-slate-300"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800"
            >
              Launch Website in CMS
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
