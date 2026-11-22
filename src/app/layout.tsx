import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BharatSafar & BharatExplorer — Curated Travel & Knowledge Portal',
  description: 'Explore Incredible India: Destinations, Heritage, Cities & Untold Facts.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
