'use client';

import React from 'react';
import { ContentBlock } from '@/types/cms';

export default function BlockRenderer({
  blocks,
  primaryColor = '#0f766e',
}: {
  blocks: ContentBlock[];
  primaryColor?: string;
}) {
  if (!blocks || blocks.length === 0) {
    return <p className="text-slate-500 italic">No content blocks added yet.</p>;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        switch (block.type) {
          case 'hero':
            return (
              <section
                key={block.id}
                style={{
                  backgroundColor: block.styles?.backgroundColor || '#f8fafc',
                  textAlign: block.styles?.textAlign || 'left',
                }}
                className="rounded-2xl p-8 border border-slate-200 shadow-sm"
              >
                <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
                  {block.data.heading || 'Hero Heading'}
                </h2>
                <p className="text-lg text-slate-600 mb-5">
                  {block.data.subheading || 'Supporting subtitle goes here.'}
                </p>
                {block.data.ctaText && (
                  <span
                    style={{ backgroundColor: primaryColor }}
                    className="inline-block px-5 py-2.5 rounded-lg text-white font-semibold text-sm"
                  >
                    {block.data.ctaText}
                  </span>
                )}
              </section>
            );

          case 'richtext':
            return (
              <div
                key={block.id}
                className="prose max-w-none text-slate-700 leading-relaxed whitespace-pre-line"
              >
                {block.data.text}
              </div>
            );

          case 'infobox':
            return (
              <div
                key={block.id}
                style={{ borderLeftColor: primaryColor }}
                className="bg-white border border-slate-200 border-l-4 rounded-r-xl p-5 shadow-sm"
              >
                <h4 className="font-bold text-slate-900 mb-1">
                  {block.data.title || 'Key Highlight'}
                </h4>
                <p className="text-slate-600 text-sm">{block.data.content}</p>
              </div>
            );

          case 'faq':
            return (
              <details
                key={block.id}
                className="bg-white border border-slate-200 rounded-xl p-4 group"
                open
              >
                <summary className="font-semibold text-slate-900 cursor-pointer">
                  {block.data.question || 'Frequently Asked Question?'}
                </summary>
                <p className="mt-2 text-slate-600 text-sm">{block.data.answer}</p>
              </details>
            );

          case 'table':
            return (
              <div key={block.id} className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse bg-white text-sm">
                  <thead>
                    <tr style={{ backgroundColor: primaryColor }} className="text-white">
                      {(block.data.headers || []).map((h: string, i: number) => (
                        <th key={i} className="py-3 px-4 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(block.data.rows || []).map((row: string[], rIdx: number) => (
                      <tr key={rIdx} className="border-t border-slate-100 even:bg-slate-50">
                        {row.map((cell: string, cIdx: number) => (
                          <td key={cIdx} className="py-2.5 px-4 text-slate-700">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'custom_html':
            return (
              <div
                key={block.id}
                dangerouslySetInnerHTML={{ __html: block.data.html || '' }}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
