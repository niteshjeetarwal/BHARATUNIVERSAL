export type EditorMode = 'drag_drop' | 'normal' | 'html';
export type ContentStatus = 'draft' | 'published' | 'scheduled';
export type ContentType = 'page' | 'post' | 'destination' | 'historical_fact' | 'book_chapter';

export interface SiteConfig {
  id: string;
  name: string;
  slug: string;
  domain: string;
  tagline: string;
  theme_config: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    badge?: string;
  };
  seo_defaults: {
    metaTitleSuffix: string;
    defaultDescription: string;
    googleAnalyticsId: string;
    googleSearchConsole: string;
  };
  ads_config: {
    adsenseClientId: string;
    headerSlot: string;
    inArticleSlot: string;
    sidebarSlot: string;
    enabled: boolean;
  };
  custom_modules: string[];
  status: 'active' | 'maintenance' | 'inactive';
}

export type BlockType = 'hero' | 'richtext' | 'infobox' | 'faq' | 'cards' | 'table' | 'custom_html';

export interface ContentBlock {
  id: string;
  type: BlockType;
  data: Record<string, any>;
  styles?: {
    backgroundColor?: string;
    paddingY?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
}

export interface CMSContentItem {
  id: string;
  site_id: string;
  content_type: ContentType;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
  editor_mode: EditorMode;
  content_blocks: ContentBlock[];
  normal_html: string;
  raw_html: string;
  status: ContentStatus;
  seo_meta: {
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
    noIndex: boolean;
  };
  views_count: number;
  updated_at: string;
}
