import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  let siteSlug = url.searchParams.get('site') || '';

  if (!siteSlug) {
    if (hostname.includes('bharatexplorer')) {
      siteSlug = 'bharatexplorer';
    } else if (hostname.includes('bharatsafar')) {
      siteSlug = 'bharatsafar';
    } else {
      siteSlug = process.env.DEFAULT_SITE_SLUG || 'bharatsafar';
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-tenant-site', siteSlug);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
