// app/layout.tsx - Fixed with proper domain detection
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { fetchPublicSettings, fetchPublicSiteSnapshot } from '@/lib/publicSiteApi';
import { getTenantRequestContext, sanitizeTenantSlug } from '@/lib/tenant';

const inter = Inter({ subsets: ['latin'] });
export const dynamic = 'force-dynamic';

async function getInstitutionData() {
  const snapshot = await fetchPublicSiteSnapshot(3600);
  if (snapshot?.settings) {
    return { snapshot, settings: snapshot.settings, tenantMissing: false };
  }

  const settings = await fetchPublicSettings(3600);
  if (settings) {
    return { snapshot: null, settings, tenantMissing: false };
  }

  return {
    snapshot: null,
    tenantMissing: true,
    settings: {
      siteName: 'School',
      logoUrl: null,
      publicAddress: null,
      brandings: [],
      navigation: [],
    },
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getInstitutionData();
  const branding = settings?.brandings?.[0] || settings;
  
  return {
    title: {
      default: settings.siteName || settings.name,
      template: `%s | ${settings.siteName || settings.name}`
    },
    description: branding?.defaultMetaDescription || 'School website',
    keywords: branding?.defaultMetaKeywords?.split(',') || [],
    openGraph: {
      title: settings.siteName || settings.name,
      description: branding?.defaultMetaDescription || 'School website',
      images: branding?.ogImage ? [branding.ogImage] : [],
      type: 'website',
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    icons: {
      icon: branding?.faviconUrl || '/favicon.ico',
    }
  };
}

export default async function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const tenantContext = getTenantRequestContext();
  const { snapshot, settings, tenantMissing } = await getInstitutionData();
  const portalBaseUrl =
    process.env.NEXT_PUBLIC_PORTAL_BASE_URL ||
    process.env.NEXT_PUBLIC_PORTAL_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : '');
  const portalTenantSlug = sanitizeTenantSlug(
    settings?.shortCode ||
      settings?.tenantSlug ||
      settings?.slug ||
      tenantContext.tenantSlug ||
      ''
  );
  const derivedPortalUrl =
    portalBaseUrl && portalTenantSlug
      ? `${portalBaseUrl}?tenantSlug=${encodeURIComponent(portalTenantSlug)}`
      : portalBaseUrl || '/portal';
  const institutionWithPortal = {
    ...settings,
    name: settings.siteName || settings.name || 'School',
    portalUrl:
      settings.portalUrl ||
      settings.portalLink ||
      derivedPortalUrl,
  };
  const homePage = snapshot?.pages?.find((page: any) => page.slug === 'home');
  const footerSections = homePage?.sections || {};

  return (
    // Suppress dev-only hydration warnings from browser extensions (e.g., Grammarly).
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Navigation
          institution={institutionWithPortal}
          menuItems={settings?.navigation || []}
          academics={snapshot?.academics || null}
        />
        {tenantMissing ? (
          <div className="bg-neutral/60 text-center text-sm text-textLight py-2">
            Institution not found for this address.
          </div>
        ) : null}
        {children}
        <Footer institution={institutionWithPortal} footerData={{ sections: footerSections }} />
      </body>
    </html>
  );
}
