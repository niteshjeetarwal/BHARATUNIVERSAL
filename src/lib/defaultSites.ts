export interface ContentBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'quote' | 'list';
  text: string;
  items?: string[];
}

export interface SubSection {
  id: string;
  name: string;
}

export interface SiteSection {
  id: string;
  name: string;
  icon?: string;
  subsections: SubSection[];
}

export interface ArticleItem {
  id: string;
  title: string;
  excerpt: string;
  sectionId: string;
  subsectionId?: string;
  category: string;
  publishedAt: string;
  likes: number;
  blocks: ContentBlock[];
}

export interface SiteConfig {
  slug: string;
  name: string;
  tagline: string;
  accentColor: string;
  footerText: string;
  sections: SiteSection[];
  articles: ArticleItem[];
}

export const DEFAULT_SITES: Record<string, SiteConfig> = {
  bharatsafar: {
    slug: 'bharatsafar',
    name: 'BharatSafar',
    tagline: 'Explore Incredible India — Travel Guides, Trails & Hidden Gems',
    accentColor: '#0f766e',
    footerText: '© 2026 BharatSafar. All rights reserved.',
    sections: [
      {
        id: 'sec-destinations',
        name: 'Destinations',
        icon: '🧭',
        subsections: [
          { id: 'sub-rajasthan', name: 'Rajasthan' },
          { id: 'sub-uttarakhand', name: 'Uttarakhand' },
        ],
      },
      {
        id: 'sec-itineraries',
        name: 'Multi-Day Itineraries',
        icon: '🗺️',
        subsections: [
          { id: 'sub-weekend', name: 'Weekend Trips' },
          { id: 'sub-heritage', name: 'Heritage Circuits' },
        ],
      },
    ],
    articles: [
      {
        id: 'udaipur-kumbhalgarh-5-day',
        title: 'Complete 5-Day Udaipur & Kumbhalgarh Heritage Travel Guide',
        excerpt:
          'A day-by-day itinerary covering City Palace, Lake Pichola, Sajjangarh, and the Great Wall of India at Kumbhalgarh.',
        sectionId: 'sec-destinations',
        subsectionId: 'sub-rajasthan',
        category: 'Destinations • Rajasthan',
        publishedAt: '2026-11-20',
        likes: 24,
        blocks: [
          {
            id: 'b1',
            type: 'paragraph',
            text: 'Start your journey in Udaipur with an early morning walk along Gangaur Ghat before the crowds arrive, followed by a boat ride across Lake Pichola.',
          },
          {
            id: 'b2',
            type: 'list',
            text: 'Essential Highlights',
            items: [
              'Day 1–2: City Palace, Jagdish Temple, Bagore Ki Haveli',
              'Day 3: Monsoon Palace (Sajjangarh) sunset viewpoint',
              'Day 4–5: Kumbhalgarh Fort & Ranakpur Jain Temple',
            ],
          },
        ],
      },
    ],
  },
  bharatexplorer: {
    slug: 'bharatexplorer',
    name: 'BharatExplorer',
    tagline: 'Uncovering Indian Cities, History, Culture & Untold Facts',
    accentColor: '#1d4ed8',
    footerText: '© 2026 BharatExplorer. All rights reserved.',
    sections: [
      {
        id: 'sec-cities',
        name: 'Indian Cities',
        icon: '🏛️',
        subsections: [
          { id: 'sub-jaipur', name: 'Jaipur' },
          { id: 'sub-varanasi', name: 'Varanasi' },
        ],
      },
      {
        id: 'sec-history',
        name: 'History & Governance',
        icon: '📜',
        subsections: [
          { id: 'sub-rulers', name: 'Historical Rulers' },
          { id: 'sub-leaders', name: 'Chief Ministers & Leaders' },
        ],
      },
    ],
    articles: [
      {
        id: 'jaipur-pink-city-facts',
        title: 'Why Jaipur Was Painted Terracotta Pink in 1876: Historical Facts',
        excerpt:
          'Discover the architectural planning of Vidyadhar Bhattacharya and the royal welcome that gave Jaipur its timeless identity.',
        sectionId: 'sec-cities',
        subsectionId: 'sub-jaipur',
        category: 'Indian Cities • Jaipur',
        publishedAt: '2026-11-21',
        likes: 31,
        blocks: [
          {
            id: 'be1',
            type: 'paragraph',
            text: 'Founded in 1727 by Maharaja Sawai Jai Singh II, Jaipur was India’s first planned grid-based city designed according to Vastu Shastra principles.',
          },
        ],
      },
    ],
  },
};
