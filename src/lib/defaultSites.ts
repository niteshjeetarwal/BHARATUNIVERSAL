import { SiteConfig, CMSContentItem } from '@/types/cms';

export const DEFAULT_SITES: SiteConfig[] = [
  {
    id: 'site-bharatsafar-01',
    name: 'BharatSafar',
    slug: 'bharatsafar',
    domain: 'bharatsafar.com',
    tagline: 'Explore Incredible India — Travel Guides, Routes & Hidden Gems',
    theme_config: {
      primaryColor: '#0f766e',
      secondaryColor: '#f97316',
      fontFamily: 'Inter',
      badge: 'Travel & Tourism',
    },
    seo_defaults: {
      metaTitleSuffix: ' | BharatSafar Travel Guide',
      defaultDescription: 'Complete Indian travel guides, itineraries, hill stations, and heritage routes.',
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
    custom_modules: ['Destinations', 'Tour Itineraries', 'State Guides'],
    status: 'active',
  },
  {
    id: 'site-bharatexplorer-02',
    name: 'BharatExplorer',
    slug: 'bharatexplorer',
    domain: 'bharatexplorer.com',
    tagline: 'Discover Indian Cities, Historical Rulers, Ministers & Untold Facts',
    theme_config: {
      primaryColor: '#9a3412',
      secondaryColor: '#d97706',
      fontFamily: 'Georgia',
      badge: 'History, Cities & Facts',
    },
    seo_defaults: {
      metaTitleSuffix: ' | BharatExplorer Encyclopedia',
      defaultDescription: 'Verified facts on Indian cities, historical dynasties, rulers, and governance.',
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
    custom_modules: ['Indian Cities', 'Historical Rulers', 'Ministers & Polity'],
    status: 'active',
  },
];

export const INITIAL_SAMPLE_CONTENT: CMSContentItem[] = [
  {
    id: 'post-bs-1',
    site_id: 'site-bharatsafar-01',
    content_type: 'destination',
    title: 'Complete 5-Day Udaipur & Kumbhalgarh Heritage Travel Guide',
    slug: 'udaipur-kumbhalgarh-5-day-travel-guide',
    excerpt: 'Day-by-day itinerary covering City Palace, Lake Pichola, Sajjangarh, and the Great Wall of India at Kumbhalgarh.',
    editor_mode: 'drag_drop',
    content_blocks: [
      {
        id: 'b1',
        type: 'hero',
        data: {
          heading: 'Udaipur & Kumbhalgarh: The Royal Mewar Circuit',
          subheading: 'Best visited between October and March • Budget: ₹12,500 per person',
          ctaText: 'View Day-Wise Route',
        },
        styles: { backgroundColor: '#f0fdfa', paddingY: '32px', textAlign: 'left' },
      },
      {
        id: 'b2',
        type: 'infobox',
        data: {
          title: 'Quick Travel Snapshot',
          content: 'Nearest Airport: Maharana Pratap Airport (UDR) • Nearest Railhead: Udaipur City (UDZ) • Ideal Duration: 4 Nights / 5 Days.',
        },
      },
    ],
    normal_html: '<p>Start your journey at Lake Pichola at sunrise...</p>',
    raw_html: '<div class="p-6 bg-teal-50 rounded-xl border border-teal-200"><h2 class="text-xl font-bold">Custom Interactive Route Map Widget</h2></div>',
    status: 'published',
    seo_meta: {
      metaTitle: '5-Day Udaipur & Kumbhalgarh Travel Guide (2026)',
      metaDescription: 'Plan your Udaipur and Kumbhalgarh trip with exact routes, entry fees, and local food tips.',
      focusKeyword: 'Udaipur travel guide',
      noIndex: false,
    },
    views_count: 1420,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'post-be-1',
    site_id: 'site-bharatexplorer-02',
    content_type: 'historical_fact',
    title: 'Jaipur: Architecture, Sawai Jai Singh II & Astronomical Heritage',
    slug: 'jaipur-history-sawai-jai-singh-architecture',
    excerpt: 'How Maharaja Sawai Jai Singh II planned India’s first grid-based city in 1727 using Shilpa Shastra principles.',
    editor_mode: 'drag_drop',
    content_blocks: [
      {
        id: 'b101',
        type: 'hero',
        data: {
          heading: 'Jaipur: The Planned Pink Capital of Rajputana',
          subheading: 'Founded in 1727 CE • Architect: Vidyadhar Bhattacharya',
          ctaText: 'Explore Historical Timeline',
        },
        styles: { backgroundColor: '#fff7ed', paddingY: '32px', textAlign: 'left' },
      },
      {
        id: 'b102',
        type: 'table',
        data: {
          headers: ['Monument', 'Year Built', 'Key Architectural Feature'],
          rows: [
            ['Jantar Mantar', '1734 CE', 'World’s largest stone sundial (Samrat Yantra)'],
            ['Hawa Mahal', '1799 CE', '953 Jharokhas engineered for Venturi cooling'],
            ['Nahargarh Fort', '1734 CE', 'Madhavendra Bhawan interconnected suites'],
          ],
        },
      },
    ],
    normal_html: '<p>Jaipur was designed in nine rectangular sectors (Chowkris)...</p>',
    raw_html: '',
    status: 'published',
    seo_meta: {
      metaTitle: 'Jaipur History & Sawai Jai Singh II | BharatExplorer',
      metaDescription: 'Detailed historical facts on Jaipur city planning, Jantar Mantar, and rulers.',
      focusKeyword: 'Jaipur history',
      noIndex: false,
    },
    views_count: 2380,
    updated_at: new Date().toISOString(),
  },
];
