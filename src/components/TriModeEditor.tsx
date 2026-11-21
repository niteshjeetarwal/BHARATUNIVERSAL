'use client';

import React, { useState } from 'react';
import {
  LayoutGrid, FileText, Code2, Plus, ArrowUp, ArrowDown,
  Trash2, Eye, Save, CheckCircle2,
} from 'lucide-react';
import {
  CMSContentItem, ContentBlock, BlockType, EditorMode, SiteConfig,
} from '@/types/cms';
import BlockRenderer from './BlockRenderer';

interface TriModeEditorProps {
  site: SiteConfig;
  initialItem?: CMSContentItem | null;
  onSave: (item: CMSContentItem) => void;
  onCancel: () => void;
}

export default function TriModeEditor({
  site, initialItem, onSave, onCancel,
}: TriModeEditorProps) {
  const [title, setTitle] = useState(initialItem?.title || '');
  const [slug, setSlug] = useState(initialItem?.slug || '');
  const [excerpt, setExcerpt] = useState(initialItem?.excerpt || '');
  const [contentType, setContentType] = useState<CMSContentItem['content_type']>(
    initialItem?.content_type || 'post'
  );
  const [status, setStatus] = useState<CMSContentItem['status']>(
    initialItem?.status || 'published'
  );
  const [editorMode, setEditorMode] = useState<EditorMode>(
    initialItem?.editor_mode || 'drag_drop'
  );

  const [blocks, setBlocks] = useState<ContentBlock[]>(
    initialItem?.content_blocks || [
      {
        id: 'block-init-1',
        type: 'hero',
        data: {
          heading: 'Welcome to ' + site.name,
          subheading: 'Start adding blocks or switch to Normal / HTML Editor anytime.',
          ctaText: 'Explore More',
        },
        styles: { backgroundColor: '#f8fafc', textAlign: 'left' },
      },
    ]
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(blocks[0]?.id || null);
  const [normalHtml, setNormalHtml] = useState(
    initialItem?.normal_html || '<p>Write your article content here...</p>'
  );
  const [rawHtml, setRawHtml] = useState(
    initialItem?.raw_html ||
      `<div style="padding: 24px; border-radius: 12px; background: #f1f5f9; border: 1px solid #cbd5e1;">\n  <h2 style="margin:0 0 8px 0;">Custom HTML Section for ${site.name}</h2>\n  <p style="margin:0;">Paste any custom HTML, SVG diagram, or interactive calculator here.</p>\n</div>`
  );

  const [metaTitle, setMetaTitle] = useState(initialItem?.seo_meta?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialItem?.seo_meta?.metaDescription || '');
  const [focusKeyword, setFocusKeyword] = useState(initialItem?.seo_meta?.focusKeyword || '');

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialItem) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const addBlock = (type: BlockType) => {
    const id = 'blk-' + Date.now();
    const defaults: Record<BlockType, Record<string, any>> = {
      hero: { heading: 'New Hero Banner', subheading: 'Subtitle description', ctaText: 'Learn More' },
      richtext: { text: 'Enter detailed paragraph text here...' },
      infobox: { title: 'Important Fact / Tip', content: 'Highlight key takeaways for readers.' },
      faq: { question: 'What is the best time to visit?', answer: 'October to March offers pleasant weather.' },
      cards: { title: 'Feature Card' },
      table: {
        headers: ['Attribute', 'Details'],
        rows: [['Location', 'India'], ['Category', site.name]],
      },
      custom_html: { html: '<div class="p-4 bg-amber-50 rounded-lg">Custom Inline HTML Block</div>' },
    };

    const newBlock: ContentBlock = {
      id,
      type,
      data: defaults[type],
      styles: { backgroundColor: '#ffffff', textAlign: 'left' },
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(id);
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const updated = [...blocks];
    const [removed] = updated.splice(index, 1);
    updated.splice(target, 0, removed);
    setBlocks(updated);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const updateBlockData = (id: string, key: string, value: any) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, data: { ...b.data, [key]: value } } : b)));
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  const handlePublish = () => {
    if (!title.trim()) {
      alert('Please enter a title before saving.');
      return;
    }
    onSave({
      id: initialItem?.id || 'item-' + Date.now(),
      site_id: site.id,
      content_type: contentType,
      title: title.trim(),
      slug: slug || 'untitled-' + Date.now(),
      excerpt,
      editor_mode: editorMode,
      content_blocks: blocks,
      normal_html: normalHtml,
      raw_html: rawHtml,
      status,
      seo_meta: {
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        focusKeyword,
        noIndex: false,
      },
      views_count: initialItem?.views_count || 0,
      updated_at: new Date().toISOString(),
    });
  };

  const seoScore =
    (title.length >= 15 ? 30 : 10) +
    (metaDescription.length >= 40 ? 30 : 10) +
    (focusKeyword.trim().length > 0 ? 25 : 0) +
    (slug.length > 3 ? 15 : 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            style={{ backgroundColor: site.theme_config.primaryColor }}
            className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider"
          >
            {site.name}
          </span>
          <h2 className="font-semibold text-base">
            {initialItem ? 'Edit Content' : 'Create New Content'}
          </h2>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => setEditorMode('drag_drop')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              editorMode === 'drag_drop' ? 'bg-white text-slate-900 shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Drag & Drop Builder
          </button>
          <button
            type="button"
            onClick={() => setEditorMode('normal')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              editorMode === 'normal' ? 'bg-white text-slate-900 shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Normal Editor
          </button>
          <button
            type="button"
            onClick={() => setEditorMode('html')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              editorMode === 'html' ? 'bg-white text-slate-900 shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            HTML / Code Editor
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePublish}
            style={{ backgroundColor: site.theme_config.primaryColor }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white shadow hover:opacity-95"
          >
            <Save className="w-3.5 h-3.5" />
            Save & Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-9 p-6 border-r border-slate-200 space-y-6">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter Post / Page Title..."
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2 focus:outline-none focus:border-teal-600"
            />
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-medium">Permalink:</span>
              <span className="bg-slate-100 px-2 py-1 rounded text-slate-700">
                https://{site.domain}/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="border border-slate-200 rounded px-2 py-1 text-slate-800 flex-1 min-w-[200px]"
              />
            </div>
          </div>

          {editorMode === 'drag_drop' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-3 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  + Add Blocks
                </p>
                {(
                  [
                    ['hero', 'Hero Banner'],
                    ['richtext', 'Text Paragraph'],
                    ['infobox', 'Highlight Info Box'],
                    ['faq', 'FAQ Accordion'],
                    ['table', 'Comparison Table'],
                    ['custom_html', 'Inline HTML Block'],
                  ] as [BlockType, string][]
                ).map(([bType, label]) => (
                  <button
                    key={bType}
                    type="button"
                    onClick={() => addBlock(bType)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-teal-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition"
                  >
                    <span>{label}</span>
                    <Plus className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>

              <div className="md:col-span-6 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Canvas (Click block to edit, use arrows to reorder)
                </p>
                {blocks.map((block, idx) => (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                      selectedBlockId === block.id
                        ? 'border-teal-600 bg-teal-50/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {block.type}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); moveBlock(idx, -1); }}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); moveBlock(idx, 1); }}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                          className="p-1 hover:bg-red-100 text-red-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-700 truncate">
                      {block.data.heading || block.data.title || block.data.question || block.data.text || 'Structured Block'}
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Live Rendered Preview
                  </p>
                  <BlockRenderer blocks={blocks} primaryColor={site.theme_config.primaryColor} />
                </div>
              </div>

              <div className="md:col-span-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Block Inspector
                </p>
                {selectedBlock ? (
                  <div className="space-y-3 text-xs">
                    {Object.entries(selectedBlock.data).map(([key, val]) => {
                      if (typeof val !== 'string') return null;
                      return (
                        <div key={key}>
                          <label className="block font-semibold text-slate-700 capitalize mb-1">{key}</label>
                          <textarea
                            rows={key === 'text' || key === 'html' || key === 'content' ? 4 : 2}
                            value={val}
                            onChange={(e) => updateBlockData(selectedBlock.id, key, e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800"
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Select any block to edit its fields.</p>
                )}
              </div>
            </div>
          )}

          {editorMode === 'normal' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 bg-slate-100 p-2 rounded-lg border border-slate-200">
                {[
                  ['H2 Heading', '<h2>Section Heading</h2>\n'],
                  ['Bold', '<strong>Bold Text</strong> '],
                  ['Paragraph', '<p>New paragraph text...</p>\n'],
                  ['Bullet List', '<ul>\n  <li>Point 1</li>\n  <li>Point 2</li>\n</ul>\n'],
                ].map(([label, snippet]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setNormalHtml((prev) => prev + snippet)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-medium hover:bg-slate-50"
                  >
                    + {label}
                  </button>
                ))}
              </div>
              <textarea
                rows={14}
                value={normalHtml}
                onChange={(e) => setNormalHtml(e.target.value)}
                className="w-full p-4 border border-slate-300 rounded-xl font-sans text-sm leading-relaxed focus:outline-none focus:border-teal-600"
                placeholder="Write clean article text or HTML formatting..."
              />
            </div>
          )}

          {editorMode === 'html' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                  Raw HTML / CSS / Inline Widget Code
                </label>
                <textarea
                  rows={16}
                  value={rawHtml}
                  onChange={(e) => setRawHtml(e.target.value)}
                  className="w-full p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                  Instant Live Output Preview
                </label>
                <div
                  className="p-4 border border-slate-200 rounded-xl min-h-[340px] bg-white"
                  dangerouslySetInnerHTML={{ __html: rawHtml }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 p-5 bg-slate-50 space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Document Settings</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as CMSContentItem['content_type'])}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs"
              >
                <option value="post">Blog Post / Article</option>
                <option value="page">Static Page</option>
                <option value="destination">Travel Destination (BharatSafar)</option>
                <option value="historical_fact">Historical Fact / Ruler (BharatExplorer)</option>
                <option value="book_chapter">Digital Book Chapter</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CMSContentItem['status'])}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs"
              >
                <option value="published">Published (Live)</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Excerpt / Summary</label>
              <textarea
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">SEO Optimizer</h3>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3" /> {seoScore}/100
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Focus Keyword</label>
              <input
                type="text"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Description</label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
